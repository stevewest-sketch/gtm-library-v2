'use client';

import { useState, useEffect, use, useMemo } from 'react';
import Link from 'next/link';

// Hub options
const HUB_OPTIONS = [
  { id: 'coe', name: 'CoE', color: '#F59E0B', light: '#FEF3C7', accent: '#B45309' },
  { id: 'content', name: 'Content', color: '#8C69F0', light: '#EDE9FE', accent: '#6D28D9' },
  { id: 'enablement', name: 'Enablement', color: '#10B981', light: '#D1FAE5', accent: '#047857' },
];

// Status options
const STATUS_OPTIONS = ['published', 'draft', 'archived'];

// Database types for taxonomy - single source of truth
interface ContentTypeDB {
  id: string;
  slug: string;
  name: string;
  hub: string | null;
  bgColor: string;
  textColor: string;
  sortOrder: number;
}

interface FormatDB {
  id: string;
  slug: string;
  name: string;
  color: string;
  iconType: string;
  sortOrder: number;
}

interface BoardDB {
  id: string;
  slug: string;
  name: string;
  color: string;
}

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

interface HowToItem {
  id: string;
  title: string;
  content: string;
}

interface AssetData {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string; // 6 words max, shown on card
  hub: string;
  format: string;
  type: string;
  status: string;
  boards: string[];
  tags: string[];
  primaryLink: string;
  publishedAt: string; // Date picker for ordering assets
  resourceLinks: ResourceLink[];
  trainingContent: {
    videoUrl: string;
    presenters: string;
    durationMinutes: number | null;
    eventDate: string;
    takeaways: string[];
    howtos: HowToItem[];
    tips: string[];
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
    shortDescription: '',
    hub: 'content',
    format: 'slides',
    type: '',
    status: 'draft',
    boards: [],
    tags: [],
    primaryLink: '',
    publishedAt: new Date().toISOString().split('T')[0], // Default to today
    resourceLinks: [],
    trainingContent: {
      videoUrl: '',
      presenters: '',
      durationMinutes: null,
      eventDate: '',
      takeaways: [],
      howtos: [],
      tips: [],
    },
  });

  const [newTag, setNewTag] = useState('');

  const [loading, setLoading] = useState(!isNew);

  // Taxonomy data from database
  const [contentTypes, setContentTypes] = useState<ContentTypeDB[]>([]);
  const [formats, setFormats] = useState<FormatDB[]>([]);
  const [boards, setBoards] = useState<BoardDB[]>([]);

  // Fetch taxonomy data on mount
  useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        const [typesRes, formatsRes, boardsRes] = await Promise.all([
          fetch('/api/admin/content-types'),
          fetch('/api/admin/formats'),
          fetch('/api/boards'),
        ]);
        if (typesRes.ok) setContentTypes(await typesRes.json());
        if (formatsRes.ok) setFormats(await formatsRes.json());
        if (boardsRes.ok) setBoards(await boardsRes.json());
      } catch (error) {
        console.error('Error fetching taxonomy:', error);
      }
    };
    fetchTaxonomy();
  }, []);

  // Build dropdown options from database - single source of truth
  const TYPE_OPTIONS = useMemo(() =>
    contentTypes
      .map(t => ({ slug: t.slug, name: t.name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [contentTypes]
  );

  const FORMAT_OPTIONS = useMemo(() =>
    formats
      .map(f => ({ slug: f.slug, name: f.name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [formats]
  );


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
          shortDescription: data.shortDescription || '',
          hub: data.hub || 'content',
          format: data.format || 'slides',
          type: data.types?.[0] || '',
          status: data.status || 'draft',
          boards: data.boards?.map((b: string | { slug: string }) => typeof b === 'string' ? b : b.slug) || [],
          tags: data.tags || [],
          primaryLink: data.primaryLink || '',
          publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          resourceLinks: [
            ...(data.videoUrl ? [{ id: 'video', type: 'video', label: 'Video', url: data.videoUrl, copyable: true }] : []),
            ...(data.slidesUrl ? [{ id: 'slides', type: 'slides', label: 'Slides', url: data.slidesUrl, copyable: true }] : []),
            ...(data.transcriptUrl ? [{ id: 'transcript', type: 'transcript', label: 'Transcript', url: data.transcriptUrl, copyable: true }] : []),
            ...(data.keyAssetUrl ? [{ id: 'key', type: 'document', label: 'Key Asset', url: data.keyAssetUrl, copyable: true }] : []),
          ],
          trainingContent: {
            videoUrl: data.videoUrl || '',
            presenters: Array.isArray(data.presenters) ? data.presenters.join(', ') : (data.presenters || ''),
            durationMinutes: data.durationMinutes || null,
            eventDate: data.eventDate ? new Date(data.eventDate).toISOString().split('T')[0] : '',
            takeaways: data.takeaways || [],
            howtos: (data.howtos || []).map((h: { title: string; content: string }, i: number) => ({
              id: `howto-${i}`,
              title: h.title || '',
              content: h.content || '',
            })),
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

  // Training content handlers
  const handleAddTakeaway = () => {
    setFormData((prev) => ({
      ...prev,
      trainingContent: {
        ...prev.trainingContent,
        takeaways: [...prev.trainingContent.takeaways, ''],
      },
    }));
  };

  const handleUpdateTakeaway = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      trainingContent: {
        ...prev.trainingContent,
        takeaways: prev.trainingContent.takeaways.map((t, i) => (i === index ? value : t)),
      },
    }));
  };

  const handleRemoveTakeaway = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      trainingContent: {
        ...prev.trainingContent,
        takeaways: prev.trainingContent.takeaways.filter((_, i) => i !== index),
      },
    }));
  };

  const handleAddHowTo = () => {
    setFormData((prev) => ({
      ...prev,
      trainingContent: {
        ...prev.trainingContent,
        howtos: [...prev.trainingContent.howtos, { id: Date.now().toString(), title: '', content: '' }],
      },
    }));
  };

  const handleUpdateHowTo = (id: string, field: 'title' | 'content', value: string) => {
    setFormData((prev) => ({
      ...prev,
      trainingContent: {
        ...prev.trainingContent,
        howtos: prev.trainingContent.howtos.map((h) => (h.id === id ? { ...h, [field]: value } : h)),
      },
    }));
  };

  const handleRemoveHowTo = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      trainingContent: {
        ...prev.trainingContent,
        howtos: prev.trainingContent.howtos.filter((h) => h.id !== id),
      },
    }));
  };

  const handleAddTip = () => {
    setFormData((prev) => ({
      ...prev,
      trainingContent: {
        ...prev.trainingContent,
        tips: [...prev.trainingContent.tips, ''],
      },
    }));
  };

  const handleUpdateTip = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      trainingContent: {
        ...prev.trainingContent,
        tips: prev.trainingContent.tips.map((t, i) => (i === index ? value : t)),
      },
    }));
  };

  const handleRemoveTip = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      trainingContent: {
        ...prev.trainingContent,
        tips: prev.trainingContent.tips.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Build the update payload
      const payload = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription || null,
        hub: formData.hub,
        format: formData.format,
        types: formData.type ? [formData.type] : [],
        status: formData.status,
        primaryLink: formData.primaryLink,
        publishedAt: formData.publishedAt ? new Date(formData.publishedAt) : null,
        tags: formData.tags,
        boardSlugs: formData.boards,
        tagNames: formData.tags,
        // Extract URLs from resource links
        videoUrl: formData.resourceLinks.find(l => l.type === 'video')?.url || formData.trainingContent.videoUrl || null,
        slidesUrl: formData.resourceLinks.find(l => l.type === 'slides')?.url || null,
        transcriptUrl: formData.resourceLinks.find(l => l.type === 'transcript')?.url || null,
        keyAssetUrl: formData.resourceLinks.find(l => l.type === 'document')?.url || null,
        // Training content
        presenters: formData.trainingContent.presenters ? formData.trainingContent.presenters.split(',').map(p => p.trim()) : [],
        durationMinutes: formData.trainingContent.durationMinutes,
        eventDate: formData.trainingContent.eventDate ? new Date(formData.trainingContent.eventDate) : null,
        takeaways: formData.trainingContent.takeaways,
        howtos: formData.trainingContent.howtos.map(h => ({ title: h.title, content: h.content })),
        tips: formData.trainingContent.tips,
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

              {/* Short Description */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  className="flex items-center justify-between"
                  style={{ fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}
                >
                  Short Description
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}>
                    {formData.shortDescription.split(/\s+/).filter(Boolean).length}/6 words
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Brief summary for card display (6 words max)"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                />
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>
                  Shown on the card in grid view. Keep it brief.
                </div>
              </div>

              {/* Hub, Format, Type, Status */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
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
                      <option key={format.slug} value={format.slug}>
                        {format.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
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
                    <option value="">Select type...</option>
                    {TYPE_OPTIONS.map((typeOpt) => (
                      <option key={typeOpt.slug} value={typeOpt.slug}>
                        {typeOpt.name}
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

              {/* Primary Link and Published Date Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginTop: '20px' }}>
                <div>
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
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                    Published Date
                  </label>
                  <input
                    type="date"
                    value={formData.publishedAt}
                    onChange={(e) => handleInputChange('publishedAt', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>
                    Used to order assets (newest first)
                  </div>
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
                {/* Currently assigned boards with remove button */}
                {formData.boards.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Assigned to:
                    </div>
                    <div className="flex flex-wrap" style={{ gap: '8px' }}>
                      {formData.boards.map((boardId) => {
                        // boardId could be slug or name, match both
                        const board = boards.find(b => b.slug === boardId || b.name === boardId);
                        const displayName = board?.name || boardId;
                        return (
                          <span
                            key={boardId}
                            className="flex items-center"
                            style={{
                              gap: '8px',
                              padding: '8px 12px',
                              background: '#EDE9FE',
                              border: '1px solid #8C69F0',
                              borderRadius: '8px',
                              fontSize: '13px',
                              color: '#6D28D9',
                            }}
                          >
                            {displayName}
                            <button
                              onClick={() => handleToggleBoard(boardId)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#8C69F0',
                                cursor: 'pointer',
                                padding: 0,
                                fontSize: '16px',
                                lineHeight: 1,
                                fontWeight: 'bold',
                              }}
                              title="Remove from board"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Available boards to add */}
                <div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {formData.boards.length > 0 ? 'Add to more boards:' : 'Add to boards:'}
                  </div>
                  <div className="flex flex-wrap" style={{ gap: '8px' }}>
                    {boards.length === 0 ? (
                      <span style={{ fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic' }}>
                        Loading boards...
                      </span>
                    ) : (
                      <>
                        {boards.filter(b => !formData.boards.includes(b.slug) && !formData.boards.includes(b.name)).map((board) => (
                          <button
                            key={board.id}
                            onClick={() => handleToggleBoard(board.slug)}
                            style={{
                              padding: '8px 16px',
                              border: '1px solid #E5E7EB',
                              background: 'white',
                              color: '#4B5563',
                              borderRadius: '8px',
                              fontSize: '13px',
                              cursor: 'pointer',
                            }}
                          >
                            + {board.name}
                          </button>
                        ))}
                        {boards.filter(b => !formData.boards.includes(b.slug) && !formData.boards.includes(b.name)).length === 0 && (
                          <span style={{ fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic' }}>
                            Added to all boards
                          </span>
                        )}
                      </>
                    )}
                  </div>
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
                  value={formData.trainingContent.videoUrl}
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

              {/* Presenters & Duration Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                    Presenter(s)
                  </label>
                  <input
                    type="text"
                    value={formData.trainingContent.presenters}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        trainingContent: { ...prev.trainingContent, presenters: e.target.value },
                      }))
                    }
                    placeholder="John Smith, Jane Doe"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.trainingContent.durationMinutes || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        trainingContent: { ...prev.trainingContent, durationMinutes: e.target.value ? parseInt(e.target.value) : null },
                      }))
                    }
                    placeholder="45"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={formData.trainingContent.eventDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        trainingContent: { ...prev.trainingContent, eventDate: e.target.value },
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              {/* Key Takeaways - Repeatable List */}
              <div style={{ marginBottom: '24px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}>
                    Key Takeaways
                  </label>
                  <div className="flex items-center" style={{ gap: '8px' }}>
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
                    <button
                      onClick={handleAddTakeaway}
                      style={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        background: '#10B981',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer',
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
                <div className="flex flex-col" style={{ gap: '8px' }}>
                  {formData.trainingContent.takeaways.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px', background: '#FAFAFA', borderRadius: '8px' }}>
                      No takeaways yet. Click "+ Add" to add one.
                    </div>
                  ) : (
                    formData.trainingContent.takeaways.map((takeaway, index) => (
                      <div key={index} className="flex items-center" style={{ gap: '8px' }}>
                        <span style={{ color: '#9CA3AF', fontSize: '12px', width: '20px' }}>{index + 1}.</span>
                        <input
                          type="text"
                          value={takeaway}
                          onChange={(e) => handleUpdateTakeaway(index, e.target.value)}
                          placeholder="Enter a key takeaway..."
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '13px',
                          }}
                        />
                        <button
                          onClick={() => handleRemoveTakeaway(index)}
                          style={{
                            padding: '8px',
                            background: 'transparent',
                            border: 'none',
                            color: '#9CA3AF',
                            cursor: 'pointer',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* How-Tos - Repeatable Cards with Title + Content */}
              <div style={{ marginBottom: '24px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}>
                    How-To Steps
                  </label>
                  <div className="flex items-center" style={{ gap: '8px' }}>
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
                    <button
                      onClick={handleAddHowTo}
                      style={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        background: '#10B981',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer',
                      }}
                    >
                      + Add Step
                    </button>
                  </div>
                </div>
                <div className="flex flex-col" style={{ gap: '12px' }}>
                  {formData.trainingContent.howtos.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px', background: '#FAFAFA', borderRadius: '8px' }}>
                      No how-to steps yet. Click "+ Add Step" to add one.
                    </div>
                  ) : (
                    formData.trainingContent.howtos.map((howto, index) => (
                      <div
                        key={howto.id}
                        style={{
                          padding: '16px',
                          background: '#FAFAFA',
                          border: '1px solid #E5E7EB',
                          borderRadius: '10px',
                        }}
                      >
                        <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Step {index + 1}</span>
                          <button
                            onClick={() => handleRemoveHowTo(howto.id)}
                            style={{
                              padding: '4px',
                              background: 'transparent',
                              border: 'none',
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
                        <input
                          type="text"
                          value={howto.title}
                          onChange={(e) => handleUpdateHowTo(howto.id, 'title', e.target.value)}
                          placeholder="Step title (e.g., 'Open the Dashboard')"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 500,
                            marginBottom: '8px',
                            background: 'white',
                          }}
                        />
                        <textarea
                          value={howto.content}
                          onChange={(e) => handleUpdateHowTo(howto.id, 'content', e.target.value)}
                          placeholder="Describe this step in detail..."
                          rows={2}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '13px',
                            resize: 'vertical',
                            background: 'white',
                          }}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tips - Repeatable List */}
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}>
                    Tips & Best Practices
                  </label>
                  <div className="flex items-center" style={{ gap: '8px' }}>
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
                    <button
                      onClick={handleAddTip}
                      style={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        background: '#10B981',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer',
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
                <div className="flex flex-col" style={{ gap: '8px' }}>
                  {formData.trainingContent.tips.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px', background: '#FAFAFA', borderRadius: '8px' }}>
                      No tips yet. Click "+ Add" to add one.
                    </div>
                  ) : (
                    formData.trainingContent.tips.map((tip, index) => (
                      <div key={index} className="flex items-center" style={{ gap: '8px' }}>
                        <span style={{ color: '#F59E0B', fontSize: '14px' }}>💡</span>
                        <input
                          type="text"
                          value={tip}
                          onChange={(e) => handleUpdateTip(index, e.target.value)}
                          placeholder="Enter a tip or best practice..."
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '13px',
                          }}
                        />
                        <button
                          onClick={() => handleRemoveTip(index)}
                          style={{
                            padding: '8px',
                            background: 'transparent',
                            border: 'none',
                            color: '#9CA3AF',
                            cursor: 'pointer',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
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
