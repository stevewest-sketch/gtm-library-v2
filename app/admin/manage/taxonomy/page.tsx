'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ContentType {
  id: string;
  slug: string;
  name: string;
  bgColor: string;
  textColor: string;
  sortOrder: number;
}

interface Format {
  id: string;
  slug: string;
  name: string;
  color: string;
  iconType: string;
  sortOrder: number;
}

type TabType = 'types' | 'formats';

// Available icon types for formats
const ICON_TYPES = [
  'slides', 'document', 'spreadsheet', 'pdf', 'video', 'article',
  'tool', 'guide', 'sequence', 'live-replay', 'on-demand', 'course', 'web-link'
];

export default function TaxonomyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('types');
  const [types, setTypes] = useState<ContentType[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentType | Format | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    bgColor: '#EDE9FE',
    textColor: '#8C69F0',
    color: '#4285F4',
    iconType: 'document',
  });

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [typesRes, formatsRes] = await Promise.all([
        fetch('/api/admin/content-types'),
        fetch('/api/admin/formats'),
      ]);

      if (typesRes.ok) setTypes(await typesRes.json());
      if (formatsRes.ok) setFormats(await formatsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm('This will seed all types and formats from the default configuration. Continue?')) return;

    setSeeding(true);
    try {
      const res = await fetch('/api/admin/seed-taxonomy', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchData();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      slug: '',
      bgColor: '#EDE9FE',
      textColor: '#8C69F0',
      color: '#4285F4',
      iconType: 'document',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: ContentType | Format) => {
    setEditingItem(item);
    if (activeTab === 'types') {
      const t = item as ContentType;
      setFormData({
        name: t.name,
        slug: t.slug,
        bgColor: t.bgColor,
        textColor: t.textColor,
        color: '#4285F4',
        iconType: 'document',
      });
    } else {
      const f = item as Format;
      setFormData({
        name: f.name,
        slug: f.slug,
        bgColor: '#EDE9FE',
        textColor: '#8C69F0',
        color: f.color,
        iconType: f.iconType,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const endpoint = activeTab === 'types' ? '/api/admin/content-types' : '/api/admin/formats';
    const method = editingItem ? 'PUT' : 'POST';

    const body = activeTab === 'types'
      ? {
          id: editingItem?.id,
          name: formData.name,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
          bgColor: formData.bgColor,
          textColor: formData.textColor,
        }
      : {
          id: editingItem?.id,
          name: formData.name,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
          color: formData.color,
          iconType: formData.iconType,
        };

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
        // Invalidate taxonomy cache so cards show updated data immediately
        await fetch('/api/taxonomy/display', { method: 'POST' });
      } else {
        const data = await res.json();
        alert('Error: ' + (data.error || 'Failed to save'));
      }
    } catch (error) {
      alert('Failed to save: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const endpoint = activeTab === 'types'
      ? `/api/admin/content-types?id=${id}`
      : `/api/admin/formats?id=${id}`;

    try {
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        // Invalidate taxonomy cache
        await fetch('/api/taxonomy/display', { method: 'POST' });
      } else {
        const data = await res.json();
        alert('Failed to delete: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to delete: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px' }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
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
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
              Taxonomy Manager
            </h1>
            <p style={{ fontSize: '14px', color: '#4B5563' }}>
              Manage content types and formats. Changes here immediately appear in all asset dropdowns.
            </p>
          </div>
        </div>
        <div className="flex" style={{ gap: '12px' }}>
          <button
            onClick={handleSeedData}
            disabled={seeding}
            style={{
              padding: '10px 18px',
              background: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#4B5563',
              cursor: seeding ? 'not-allowed' : 'pointer',
            }}
          >
            {seeding ? 'Seeding...' : 'Seed Defaults'}
          </button>
          <button
            onClick={openCreateModal}
            style={{
              padding: '10px 18px',
              background: '#8C69F0',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              cursor: 'pointer',
            }}
          >
            + Add {activeTab === 'types' ? 'Type' : 'Format'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('types')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            background: activeTab === 'types' ? '#8C69F0' : '#F3F4F6',
            color: activeTab === 'types' ? 'white' : '#4B5563',
          }}
        >
          Content Types ({types.length})
        </button>
        <button
          onClick={() => setActiveTab('formats')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            background: activeTab === 'formats' ? '#8C69F0' : '#F3F4F6',
            color: activeTab === 'formats' ? 'white' : '#4B5563',
          }}
        >
          Formats ({formats.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>Loading...</div>
      ) : activeTab === 'types' ? (
        <div
          style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Preview</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Slug</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map((type) => (
                <tr key={type.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        backgroundColor: type.bgColor,
                        color: type.textColor,
                      }}
                    >
                      {type.name}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{type.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280', fontFamily: 'monospace' }}>{type.slug}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => openEditModal(type)}
                      style={{ padding: '6px 12px', background: '#F3F4F6', border: 'none', borderRadius: '6px', fontSize: '12px', color: '#4B5563', cursor: 'pointer', marginRight: '8px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(type.id)}
                      style={{ padding: '6px 12px', background: '#FEE2E2', border: 'none', borderRadius: '6px', fontSize: '12px', color: '#DC2626', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {types.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                    No types yet. Click "Seed Defaults" to add standard types or "Add Type" to create custom ones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Color</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Slug</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Icon Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {formats.map((format) => (
                <tr key={format.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        backgroundColor: format.color,
                      }}
                    />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{format.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280', fontFamily: 'monospace' }}>{format.slug}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280' }}>{format.iconType}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => openEditModal(format)}
                      style={{ padding: '6px 12px', background: '#F3F4F6', border: 'none', borderRadius: '6px', fontSize: '12px', color: '#4B5563', cursor: 'pointer', marginRight: '8px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(format.id)}
                      style={{ padding: '6px 12px', background: '#FEE2E2', border: 'none', borderRadius: '6px', fontSize: '12px', color: '#DC2626', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {formats.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                    No formats yet. Click "Seed Defaults" to add standard formats or "Add Format" to create custom ones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              width: '480px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
              {editingItem ? 'Edit' : 'Add'} {activeTab === 'types' ? 'Content Type' : 'Format'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: formData.slug || generateSlug(e.target.value),
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                  placeholder="e.g., Product Overview"
                />
              </div>

              {/* Slug */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                  }}
                  placeholder="e.g., product-overview"
                />
              </div>

              {activeTab === 'types' ? (
                <>
                  {/* Colors */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Background Color
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="color"
                          value={formData.bgColor}
                          onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                          style={{ width: '44px', height: '38px', padding: 0, border: '1px solid #E5E7EB', borderRadius: '6px' }}
                        />
                        <input
                          type="text"
                          value={formData.bgColor}
                          onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                          style={{ flex: 1, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace' }}
                        />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Text Color
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="color"
                          value={formData.textColor}
                          onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                          style={{ width: '44px', height: '38px', padding: 0, border: '1px solid #E5E7EB', borderRadius: '6px' }}
                        />
                        <input
                          type="text"
                          value={formData.textColor}
                          onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                          style={{ flex: 1, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Preview
                    </label>
                    <div style={{ padding: '16px', background: '#F9FAFB', borderRadius: '8px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          backgroundColor: formData.bgColor,
                          color: formData.textColor,
                        }}
                      >
                        {formData.name || 'Type Name'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Format Color */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Color
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        style={{ width: '44px', height: '38px', padding: 0, border: '1px solid #E5E7EB', borderRadius: '6px' }}
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        style={{ flex: 1, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  {/* Icon Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Icon Type
                    </label>
                    <select
                      value={formData.iconType}
                      onChange={(e) => setFormData({ ...formData, iconType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: 'white',
                      }}
                    >
                      {ICON_TYPES.map((icon) => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '10px 18px',
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#4B5563',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '10px 18px',
                  background: '#8C69F0',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                {editingItem ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
