'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

// Hub options
const HUB_OPTIONS = [
  { id: 'coe', name: 'CoE', color: '#F59E0B', light: '#FEF3C7', accent: '#B45309' },
  { id: 'content', name: 'Content', color: '#8C69F0', light: '#EDE9FE', accent: '#6D28D9' },
  { id: 'enablement', name: 'Enablement', color: '#10B981', light: '#D1FAE5', accent: '#047857' },
];

// Format options
const FORMAT_OPTIONS = [
  'slides', 'video', 'document', 'pdf', 'sheet', 'tool', 'link',
  'training', 'battlecard', 'template', 'guide', 'report', 'one pager',
];

// Status options
const STATUS_OPTIONS = ['published', 'draft', 'archived'];

// Board options
const BOARD_OPTIONS = [
  { id: 'coe', name: 'CoE' },
  { id: 'content', name: 'Content Types' },
  { id: 'enablement', name: 'Enablement' },
  { id: 'product', name: 'Product' },
  { id: 'competitive', name: 'Competitive' },
  { id: 'sales', name: 'Sales' },
];

// Link type options
const LINK_TYPE_OPTIONS = [
  { value: 'primary', label: 'Primary Link' },
  { value: 'slides', label: 'Slides' },
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Document' },
  { value: 'transcript', label: 'Transcript' },
  { value: 'other', label: 'Other' },
];

interface ResourceLink {
  id: string;
  type: string;
  label: string;
  url: string;
  copyable: boolean;
}

interface AssetData {
  id: string;
  slug: string;
  title: string;
  description: string;
  hub: string;
  format: string;
  status: string;
  boards: string[];
  tags: string[];
  primaryLink: string;
  resourceLinks: ResourceLink[];
  trainingContent?: {
    videoUrl?: string;
    takeaways?: string[];
    tips?: string[];
  };
}

export default function AssetEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const isNew = slug === 'new';

  const [activeSection, setActiveSection] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState<AssetData>({
    id: '',
    slug: '',
    title: '',
    description: '',
    hub: 'content',
    format: 'slides',
    status: 'draft',
    boards: [],
    tags: [],
    primaryLink: '',
    resourceLinks: [],
    trainingContent: {
      videoUrl: '',
      takeaways: [],
      tips: [],
    },
  });

  const [newTag, setNewTag] = useState('');

  const [loading, setLoading] = useState(!isNew);

  // Load asset data if editing existing
  useEffect(() => {
    if (!isNew) {
      fetchAsset();
    }
  }, [slug, isNew]);

  const fetchAsset = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/assets/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          id: data.id,
          slug: data.slug,
          title: data.title || '',
          description: data.description || '',
          hub: data.hub || 'content',
          format: data.format || 'slides',
          status: data.status || 'draft',
          boards: data.boards?.map((b: { slug: string }) => b.slug) || [],
          tags: data.tags || [],
          primaryLink: data.primaryLink || '',
          resourceLinks: [
            ...(data.videoUrl ? [{ id: 'video', type: 'video', label: 'Video', url: data.videoUrl, copyable: true }] : []),
            ...(data.slidesUrl ? [{ id: 'slides', type: 'slides', label: 'Slides', url: data.slidesUrl, copyable: true }] : []),
            ...(data.transcriptUrl ? [{ id: 'transcript', type: 'transcript', label: 'Transcript', url: data.transcriptUrl, copyable: true }] : []),
            ...(data.keyAssetUrl ? [{ id: 'key', type: 'document', label: 'Key Asset', url: data.keyAssetUrl, copyable: true }] : []),
          ],
          trainingContent: {
            videoUrl: data.videoUrl || '',
            takeaways: data.takeaways || [],
            tips: data.tips || [],
          },
        });
      } else {
        console.error('Failed to fetch asset');
      }
    } catch (error) {
      console.error('Error fetching asset:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AssetData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleToggleBoard = (boardId: string) => {
    setFormData((prev) => ({
      ...prev,
      boards: prev.boards.includes(boardId)
        ? prev.boards.filter((b) => b !== boardId)
        : [...prev.boards, boardId],
    }));
  };

  const handleAddLink = () => {
    const newLink: ResourceLink = {
      id: Date.now().toString(),
      type: 'other',
      label: '',
      url: '',
      copyable: true,
    };
    setFormData((prev) => ({
      ...prev,
      resourceLinks: [...prev.resourceLinks, newLink],
    }));
  };

  const handleUpdateLink = (id: string, field: keyof ResourceLink, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      resourceLinks: prev.resourceLinks.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      ),
    }));
  };

  const handleRemoveLink = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      resourceLinks: prev.resourceLinks.filter((link) => link.id !== id),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Build the update payload
      const payload = {
        title: formData.title,
        description: formData.description,
        hub: formData.hub,
        format: formData.format,
        status: formData.status,
        primaryLink: formData.primaryLink,
        tags: formData.tags,
        boardSlugs: formData.boards,
        tagNames: formData.tags,
        // Extract URLs from resource links
        videoUrl: formData.resourceLinks.find(l => l.type === 'video')?.url || formData.trainingContent?.videoUrl || null,
        slidesUrl: formData.resourceLinks.find(l => l.type === 'slides')?.url || null,
        transcriptUrl: formData.resourceLinks.find(l => l.type === 'transcript')?.url || null,
        keyAssetUrl: formData.resourceLinks.find(l => l.type === 'document')?.url || null,
        takeaways: formData.trainingContent?.takeaways || [],
        tips: formData.trainingContent?.tips || [],
      };

      const res = await fetch(`/api/assets/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Success - could show toast or redirect
        console.log('Asset saved successfully');
      } else {
        console.error('Failed to save asset');
      }
    } catch (error) {
      console.error('Error saving asset:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const sidebarSections = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'organization', label: 'Organization', icon: '📁' },
    { id: 'links', label: 'Resource Links', icon: '🔗' },
    { id: 'training', label: 'Training Content', icon: '🎓' },
    { id: 'seo', label: 'SEO & Metadata', icon: '🔍' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ marginTop: '-56px', paddingTop: '56px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>Loading asset...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ marginTop: '-56px', paddingTop: '56px' }}>
      {/* Editor Sidebar */}
      <aside
        style={{
          width: '220px',
          background: 'white',
          borderRight: '1px solid #E5E7EB',
          position: 'fixed',
          top: '56px',
          left: '220px',
          bottom: 0,
          padding: '20px 12px',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#9CA3AF',
            padding: '8px 12px',
            marginBottom: '4px',
          }}
        >
          Sections
        </div>
        <nav className="flex flex-col">
          {sidebarSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="flex items-center text-left"
              style={{
                gap: '10px',
                padding: '10px 12px',
                margin: '2px 0',
                borderRadius: '6px',
                cursor: 'pointer',
                border: 'none',
                background: activeSection === section.id ? '#D1FAE5' : 'transparent',
                color: activeSection === section.id ? '#047857' : '#4B5563',
                fontWeight: activeSection === section.id ? 500 : 400,
                fontSize: '13px',
              }}
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ height: '1px', background: '#E5E7EB', margin: '16px 12px' }} />

        {/* Section Configuration */}
        <div
          style={{
            padding: '16px',
            background: '#F9FAFB',
            borderRadius: '8px',
            margin: '12px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#4B5563',
              marginBottom: '12px',
            }}
          >
            Page Sections
          </div>
          <div className="flex flex-col" style={{ gap: '6px' }}>
            {['Video', 'Takeaways', 'How-Tos', 'Materials'].map((item) => (
              <div
                key={item}
                className="flex items-center"
                style={{
                  gap: '8px',
                  padding: '8px 10px',
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              >
                <span style={{ color: '#9CA3AF', cursor: 'grab' }}>⋮⋮</span>
                <span style={{ flex: 1, color: '#111827' }}>{item}</span>
                <label style={{ position: 'relative', width: '32px', height: '18px' }}>
                  <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: '#10B981',
                      borderRadius: '9px',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '',
                        height: '14px',
                        width: '14px',
                        left: '16px',
                        bottom: '2px',
                        background: 'white',
                        borderRadius: '50%',
                      }}
                    />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          marginLeft: '220px',
          padding: '28px 40px',
          maxWidth: '960px',
        }}
      >
        {/* Page Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '28px' }}>
          <div className="flex items-center" style={{ gap: '16px' }}>
            <Link
              href="/admin/manage"
              className="flex items-center"
              style={{
                gap: '8px',
                padding: '8px 14px',
                color: '#4B5563',
                textDecoration: 'none',
                fontSize: '13px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </Link>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>
              {isNew ? 'New Asset' : 'Edit Asset'}
            </h1>
          </div>
          <div className="flex" style={{ gap: '12px' }}>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center"
              style={{
                gap: '8px',
                padding: '10px 16px',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#4B5563',
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: '10px 18px',
                background: '#10B981',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* AI Banner */}
        <div
          className="flex items-center"
          style={{
            gap: '16px',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
            border: '1px solid #C7D2FE',
            borderRadius: '10px',
            marginBottom: '24px',
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              borderRadius: '10px',
              fontSize: '22px',
              flexShrink: 0,
            }}
          >
            ✨
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#4338CA', marginBottom: '4px' }}>
              AI Auto-Fill Available
            </div>
            <div style={{ fontSize: '13px', color: '#4B5563' }}>
              Generate descriptions, tags, and training content automatically from your uploaded files.
            </div>
          </div>
          <button
            style={{
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Generate with AI
          </button>
        </div>

        {/* Basic Info Section */}
        {activeSection === 'basic' && (
          <div
            style={{
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              marginBottom: '24px',
              overflow: 'hidden',
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                padding: '16px 24px',
                background: '#FAFAFA',
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              <div className="flex items-center" style={{ gap: '8px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Basic Information
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              {/* Title */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  className="flex items-center justify-between"
                  style={{ fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter asset title"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  className="flex items-center justify-between"
                  style={{ fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}
                >
                  Description
                  <button
                    style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      background: '#EEF2FF',
                      border: '1px solid #C7D2FE',
                      borderRadius: '4px',
                      color: '#4338CA',
                      cursor: 'pointer',
                    }}
                  >
                    ✨ AI Suggest
                  </button>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe this asset..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Hub, Format, Status */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '16px',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                    Hub
                  </label>
                  <select
                    value={formData.hub}
                    onChange={(e) => handleInputChange('hub', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      appearance: 'none',
                      background: `white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 14px center`,
                      cursor: 'pointer',
                    }}
                  >
                    {HUB_OPTIONS.map((hub) => (
                      <option key={hub.id} value={hub.id}>
                        {hub.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                    Format
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => handleInputChange('format', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      appearance: 'none',
                      background: `white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 14px center`,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {FORMAT_OPTIONS.map((format) => (
                      <option key={format} value={format} style={{ textTransform: 'capitalize' }}>
                        {format}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      appearance: 'none',
                      background: `white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 14px center`,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status} style={{ textTransform: 'capitalize' }}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Primary Link */}
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                  Primary Link
                </label>
                <input
                  type="url"
                  value={formData.primaryLink}
                  onChange={(e) => handleInputChange('primaryLink', e.target.value)}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                />
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>
                  The main link for this asset (Google Drive, Slides, etc.)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Organization Section */}
        {activeSection === 'organization' && (
          <div
            style={{
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              marginBottom: '24px',
              overflow: 'hidden',
            }}
          >
            <div
              className="flex items-center"
              style={{
                padding: '16px 24px',
                background: '#FAFAFA',
                borderBottom: '1px solid #E5E7EB',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              Organization
            </div>
            <div style={{ padding: '24px' }}>
              {/* Boards */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '12px' }}>
                  Boards
                </label>
                <div className="flex flex-wrap" style={{ gap: '8px' }}>
                  {BOARD_OPTIONS.map((board) => (
                    <button
                      key={board.id}
                      onClick={() => handleToggleBoard(board.id)}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid',
                        borderColor: formData.boards.includes(board.id) ? '#8C69F0' : '#E5E7EB',
                        background: formData.boards.includes(board.id) ? '#EDE9FE' : 'white',
                        color: formData.boards.includes(board.id) ? '#6D28D9' : '#4B5563',
                        borderRadius: '8px',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      {board.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '12px' }}>
                  Tags
                </label>
                <div className="flex flex-wrap" style={{ gap: '8px', marginBottom: '12px' }}>
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center"
                      style={{
                        gap: '6px',
                        padding: '6px 12px',
                        background: '#F3F4F6',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#4B5563',
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#9CA3AF',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '14px',
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex" style={{ gap: '8px' }}>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add a tag..."
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  />
                  <button
                    onClick={handleAddTag}
                    style={{
                      padding: '10px 16px',
                      background: '#8C69F0',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Add Tag
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resource Links Section */}
        {activeSection === 'links' && (
          <div
            style={{
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              marginBottom: '24px',
              overflow: 'hidden',
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                padding: '16px 24px',
                background: '#FAFAFA',
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              <div className="flex items-center" style={{ gap: '8px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Resource Links
              </div>
              <button
                onClick={handleAddLink}
                className="flex items-center"
                style={{
                  gap: '6px',
                  padding: '8px 14px',
                  background: '#8C69F0',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Link
              </button>
            </div>
            <div style={{ padding: '16px 24px' }}>
              {formData.resourceLinks.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                  No resource links added yet. Click "Add Link" to get started.
                </div>
              ) : (
                <div className="flex flex-col" style={{ gap: '12px' }}>
                  {formData.resourceLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center"
                      style={{
                        gap: '12px',
                        padding: '14px 16px',
                        background: '#FAFAFA',
                        border: '1px solid #F3F4F6',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ color: '#9CA3AF', cursor: 'grab' }}>⋮⋮</span>
                      <select
                        value={link.type}
                        onChange={(e) => handleUpdateLink(link.id, 'type', e.target.value)}
                        style={{
                          width: '140px',
                          padding: '8px 10px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          fontSize: '12px',
                          background: 'white',
                        }}
                      >
                        {LINK_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => handleUpdateLink(link.id, 'label', e.target.value)}
                        placeholder="Label"
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                        placeholder="URL"
                        style={{
                          flex: 2,
                          padding: '8px 10px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      />
                      <label className="flex items-center" style={{ gap: '4px', fontSize: '11px', color: '#4B5563' }}>
                        <input
                          type="checkbox"
                          checked={link.copyable}
                          onChange={(e) => handleUpdateLink(link.id, 'copyable', e.target.checked)}
                          style={{ width: '14px', height: '14px', accentColor: '#8C69F0' }}
                        />
                        Copyable
                      </label>
                      <button
                        onClick={() => handleRemoveLink(link.id)}
                        className="flex items-center justify-center"
                        style={{
                          width: '28px',
                          height: '28px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#9CA3AF',
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Training Content Section */}
        {activeSection === 'training' && (
          <div
            style={{
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              marginBottom: '24px',
              overflow: 'hidden',
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                padding: '16px 24px',
                background: '#FAFAFA',
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              <div className="flex items-center" style={{ gap: '8px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                Training Content
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: '#D1FAE5',
                  color: '#047857',
                }}
              >
                ENABLEMENT
              </span>
            </div>
            <div style={{ padding: '24px' }}>
              {/* Video URL */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                  Video URL
                </label>
                <input
                  type="url"
                  value={formData.trainingContent?.videoUrl || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      trainingContent: { ...prev.trainingContent, videoUrl: e.target.value },
                    }))
                  }
                  placeholder="https://loom.com/share/... or YouTube, Vimeo, etc."
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                />
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>
                  Supports Loom, YouTube, Vimeo, Zoom recordings, and Google Drive
                </div>
              </div>

              {/* Key Takeaways */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  className="flex items-center justify-between"
                  style={{ fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}
                >
                  Key Takeaways
                  <button
                    style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      background: '#EEF2FF',
                      border: '1px solid #C7D2FE',
                      borderRadius: '4px',
                      color: '#4338CA',
                      cursor: 'pointer',
                    }}
                  >
                    ✨ AI Generate
                  </button>
                </label>
                <textarea
                  placeholder="Enter key takeaways, one per line..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Tips */}
              <div>
                <label
                  className="flex items-center justify-between"
                  style={{ fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}
                >
                  Tips & Best Practices
                  <button
                    style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      background: '#EEF2FF',
                      border: '1px solid #C7D2FE',
                      borderRadius: '4px',
                      color: '#4338CA',
                      cursor: 'pointer',
                    }}
                  >
                    ✨ AI Generate
                  </button>
                </label>
                <textarea
                  placeholder="Enter tips and best practices, one per line..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* SEO Section */}
        {activeSection === 'seo' && (
          <div
            style={{
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              marginBottom: '24px',
              overflow: 'hidden',
            }}
          >
            <div
              className="flex items-center"
              style={{
                padding: '16px 24px',
                background: '#FAFAFA',
                borderBottom: '1px solid #E5E7EB',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              SEO & Metadata
            </div>
            <div style={{ padding: '24px' }}>
              {/* Slug */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                  URL Slug
                </label>
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#9CA3AF' }}>/library/asset/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="asset-slug"
                    style={{
                      flex: 1,
                      padding: '11px 14px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              {/* Meta Description */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                  Meta Description
                </label>
                <textarea
                  placeholder="SEO meta description..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>
                  Recommended: 150-160 characters for optimal SEO
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
