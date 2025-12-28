'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Asset {
  id: string;
  slug: string;
  title: string;
  description?: string;
  hub: string;
  format: string;
  status: string;
  views?: number;
  updatedAt: string;
  boards: string[];
  tags: string[];
}

interface Board {
  id: string;
  slug: string;
  name: string;
  color: string;
}

interface Tag {
  id: string;
  slug: string;
  name: string;
}

// Hub styles
const HUB_STYLES: Record<string, { primary: string; light: string; accent: string }> = {
  coe: { primary: '#F59E0B', light: '#FEF3C7', accent: '#B45309' },
  content: { primary: '#8C69F0', light: '#EDE9FE', accent: '#6D28D9' },
  enablement: { primary: '#10B981', light: '#D1FAE5', accent: '#047857' },
};

export default function ManageAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [hubFilter, setHubFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Modal states
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedBoardIds, setSelectedBoardIds] = useState<Set<string>>(new Set());
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [newTagName, setNewTagName] = useState('');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchAssets();
    fetchBoards();
    fetchTags();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets?all=true');
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoards = async () => {
    try {
      const res = await fetch('/api/boards');
      if (res.ok) {
        const data = await res.json();
        setBoards(data.boards || []);
      }
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags');
      if (res.ok) {
        const data = await res.json();
        setAllTags(data.tags || []);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const handleAddToBoards = async () => {
    if (selectedBoardIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const res = await fetch('/api/assets/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addToBoards',
          assetIds: Array.from(selectedIds),
          boardIds: Array.from(selectedBoardIds),
        }),
      });
      if (res.ok) {
        setShowBoardModal(false);
        setSelectedBoardIds(new Set());
        fetchAssets();
      }
    } catch (error) {
      console.error('Failed to add to boards:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleAddTags = async () => {
    if (selectedTagIds.size === 0 && !newTagName.trim()) return;
    setBulkActionLoading(true);
    try {
      const res = await fetch('/api/assets/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addTags',
          assetIds: Array.from(selectedIds),
          tagIds: Array.from(selectedTagIds),
          tagNames: newTagName.trim() ? [newTagName.trim()] : [],
        }),
      });
      if (res.ok) {
        setShowTagModal(false);
        setSelectedTagIds(new Set());
        setNewTagName('');
        fetchAssets();
        fetchTags();
      }
    } catch (error) {
      console.error('Failed to add tags:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setBulkActionLoading(true);
    try {
      const res = await fetch('/api/assets/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          assetIds: Array.from(selectedIds),
        }),
      });
      if (res.ok) {
        setShowDeleteModal(false);
        setSelectedIds(new Set());
        fetchAssets();
      }
    } catch (error) {
      console.error('Failed to delete assets:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const openBoardModal = () => {
    setSelectedBoardIds(new Set());
    setShowBoardModal(true);
  };

  const openTagModal = () => {
    setSelectedTagIds(new Set());
    setNewTagName('');
    setShowTagModal(true);
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAssets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAssets.map((a) => a.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      !searchQuery ||
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHub = !hubFilter || asset.hub.toLowerCase() === hubFilter.toLowerCase();
    const matchesStatus = !statusFilter || asset.status === statusFilter;
    return matchesSearch && matchesHub && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '6px',
          }}
        >
          Manage Assets
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          View and manage all content across your library.
        </p>
      </div>

      {/* Filter Bar */}
      <div
        className="flex items-center flex-wrap"
        style={{ gap: '12px', marginBottom: '20px' }}
      >
        {/* Search */}
        <div
          className="flex items-center"
          style={{
            gap: '10px',
            padding: '10px 14px',
            background: 'white',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            flex: 1,
            minWidth: '240px',
            maxWidth: '320px',
          }}
        >
          <svg
            style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Hub Filter */}
        <select
          value={hubFilter}
          onChange={(e) => setHubFilter(e.target.value)}
          style={{
            padding: '10px 36px 10px 14px',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'inherit',
            background:
              "white url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\") no-repeat right 12px center",
            cursor: 'pointer',
            appearance: 'none',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">All Hubs</option>
          <option value="coe">CoE</option>
          <option value="content">Content</option>
          <option value="enablement">Enablement</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 36px 10px 14px',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'inherit',
            background:
              "white url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\") no-repeat right 12px center",
            cursor: 'pointer',
            appearance: 'none',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <div style={{ flex: 1 }} />

        {/* Add Asset Button */}
        <Link
          href="/admin/manage/new"
          className="flex items-center no-underline"
          style={{
            gap: '8px',
            padding: '10px 18px',
            background: 'var(--content-primary)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Asset
        </Link>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div
          className="flex items-center"
          style={{
            gap: '16px',
            padding: '14px 20px',
            background: 'var(--content-primary)',
            color: 'white',
            borderRadius: '10px',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: 500,
              paddingRight: '16px',
              borderRight: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            {selectedIds.size} selected
          </span>

          <button
            onClick={openBoardModal}
            className="flex items-center"
            style={{
              gap: '6px',
              padding: '8px 14px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add to Board
          </button>

          <button
            onClick={openTagModal}
            className="flex items-center"
            style={{
              gap: '6px',
              padding: '8px 14px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            Add Tags
          </button>

          <div style={{ flex: 1 }} />

          <button
            onClick={openDeleteModal}
            className="flex items-center"
            style={{
              gap: '6px',
              padding: '8px 14px',
              background: 'rgba(239, 68, 68, 0.9)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>

          <button
            onClick={clearSelection}
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Table */}
      <div
        style={{
          background: 'white',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {/* Table Header */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: '48px 1fr 100px 140px 80px 100px 80px 56px',
            padding: '14px 20px',
            background: '#F9FAFB',
            borderBottom: '1px solid var(--card-border)',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#6B7280',
          }}
        >
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedIds.size === filteredAssets.length && filteredAssets.length > 0}
              onChange={toggleSelectAll}
              style={{
                width: '18px',
                height: '18px',
                accentColor: 'var(--content-primary)',
                cursor: 'pointer',
              }}
            />
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer">
            Title
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ opacity: 0.5 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <div>Hub</div>
          <div>Boards</div>
          <div>Tags</div>
          <div className="flex items-center gap-1.5 cursor-pointer">
            Updated
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ opacity: 0.5 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer">
            Views
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ opacity: 0.5 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <div></div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading assets...
          </div>
        ) : filteredAssets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No assets found
          </div>
        ) : (
          filteredAssets.map((asset) => {
            const isSelected = selectedIds.has(asset.id);
            const hubStyle = HUB_STYLES[asset.hub.toLowerCase()] || HUB_STYLES.content;
            return (
              <div
                key={asset.id}
                className="grid items-center"
                style={{
                  gridTemplateColumns: '48px 1fr 100px 140px 80px 100px 80px 56px',
                  padding: '16px 20px',
                  borderBottom: '1px solid #F3F4F6',
                  background: isSelected ? 'var(--content-light)' : 'transparent',
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Checkbox */}
                <div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(asset.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--content-primary)',
                      cursor: 'pointer',
                    }}
                  />
                </div>

                {/* Title */}
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: hubStyle.primary,
                      flexShrink: 0,
                    }}
                  />
                  <Link
                    href={`/admin/manage/asset/${asset.slug}`}
                    className="no-underline"
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {asset.title}
                  </Link>
                </div>

                {/* Hub Badge */}
                <div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: hubStyle.light,
                      color: hubStyle.accent,
                    }}
                  >
                    {asset.hub}
                  </span>
                </div>

                {/* Boards */}
                <div className="flex flex-wrap" style={{ gap: '4px' }}>
                  {(asset.boards || []).slice(0, 2).map((board, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '10px',
                        padding: '3px 8px',
                        background: '#F3F4F6',
                        borderRadius: '4px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {board}
                    </span>
                  ))}
                  {(asset.boards || []).length > 2 && (
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '3px 8px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      +{(asset.boards || []).length - 2}
                    </span>
                  )}
                </div>

                {/* Tags Count */}
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {(asset.tags || []).length} tags
                </div>

                {/* Updated Date */}
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {formatDate(asset.updatedAt)}
                </div>

                {/* Views */}
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {asset.views || 0}
                </div>

                {/* Actions */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === asset.id ? null : asset.id)}
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>

                  {openDropdown === asset.id && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        background: 'white',
                        border: '1px solid var(--card-border)',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        minWidth: '160px',
                        zIndex: 100,
                      }}
                    >
                      <button
                        className="flex items-center w-full"
                        style={{
                          gap: '10px',
                          padding: '10px 14px',
                          fontSize: '13px',
                          color: 'var(--text-primary)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        className="flex items-center w-full"
                        style={{
                          gap: '10px',
                          padding: '10px 14px',
                          fontSize: '13px',
                          color: 'var(--text-primary)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Duplicate
                      </button>
                      <div style={{ height: '1px', background: '#F3F4F6', margin: '4px 0' }} />
                      <button
                        className="flex items-center w-full"
                        style={{
                          gap: '10px',
                          padding: '10px 14px',
                          fontSize: '13px',
                          color: '#EF4444',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {filteredAssets.length > 0 && (
          <div
            className="flex items-center justify-between"
            style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--card-border)',
              background: '#FAFAFA',
            }}
          >
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing 1-{filteredAssets.length} of {filteredAssets.length} assets
            </div>
            <div className="flex items-center" style={{ gap: '8px' }}>
              <button
                disabled
                style={{
                  padding: '8px 14px',
                  border: '1px solid var(--card-border)',
                  borderRadius: '6px',
                  background: 'white',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  cursor: 'not-allowed',
                  opacity: 0.5,
                }}
              >
                ← Previous
              </button>
              <button
                style={{
                  padding: '8px 14px',
                  border: '1px solid var(--content-primary)',
                  borderRadius: '6px',
                  background: 'var(--content-primary)',
                  fontSize: '13px',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                1
              </button>
              <button
                style={{
                  padding: '8px 14px',
                  border: '1px solid var(--card-border)',
                  borderRadius: '6px',
                  background: 'white',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add to Board Modal */}
      {showBoardModal && (
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
          onClick={() => setShowBoardModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                Add to Board
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                Select boards for {selectedIds.size} asset{selectedIds.size > 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ padding: '16px 24px', maxHeight: '300px', overflowY: 'auto' }}>
              {boards.length === 0 ? (
                <p style={{ color: '#6B7280', fontSize: '14px' }}>No boards available</p>
              ) : (
                boards.map((board) => (
                  <label
                    key={board.id}
                    className="flex items-center"
                    style={{
                      gap: '12px',
                      padding: '10px 0',
                      cursor: 'pointer',
                      borderBottom: '1px solid #F3F4F6',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBoardIds.has(board.id)}
                      onChange={() => {
                        setSelectedBoardIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(board.id)) {
                            next.delete(board.id);
                          } else {
                            next.add(board.id);
                          }
                          return next;
                        });
                      }}
                      style={{ width: '18px', height: '18px', accentColor: '#8C69F0' }}
                    />
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '3px',
                        background: board.color,
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#111827' }}>{board.name}</span>
                  </label>
                ))
              )}
            </div>
            <div
              className="flex justify-end"
              style={{ gap: '12px', padding: '16px 24px', borderTop: '1px solid #E5E7EB' }}
            >
              <button
                onClick={() => setShowBoardModal(false)}
                style={{
                  padding: '10px 18px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  background: 'white',
                  fontSize: '14px',
                  color: '#4B5563',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddToBoards}
                disabled={selectedBoardIds.size === 0 || bulkActionLoading}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  borderRadius: '8px',
                  background: selectedBoardIds.size > 0 ? '#8C69F0' : '#E5E7EB',
                  fontSize: '14px',
                  color: selectedBoardIds.size > 0 ? 'white' : '#9CA3AF',
                  cursor: selectedBoardIds.size > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                {bulkActionLoading ? 'Adding...' : 'Add to Boards'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tags Modal */}
      {showTagModal && (
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
          onClick={() => setShowTagModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                Add Tags
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                Select tags for {selectedIds.size} asset{selectedIds.size > 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ padding: '16px 24px' }}>
              {/* New tag input */}
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Create new tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
              {/* Existing tags */}
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {allTags.length === 0 ? (
                  <p style={{ color: '#6B7280', fontSize: '14px' }}>No tags available</p>
                ) : (
                  allTags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center"
                      style={{
                        gap: '12px',
                        padding: '8px 0',
                        cursor: 'pointer',
                        borderBottom: '1px solid #F3F4F6',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTagIds.has(tag.id)}
                        onChange={() => {
                          setSelectedTagIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(tag.id)) {
                              next.delete(tag.id);
                            } else {
                              next.add(tag.id);
                            }
                            return next;
                          });
                        }}
                        style={{ width: '18px', height: '18px', accentColor: '#8C69F0' }}
                      />
                      <span style={{ fontSize: '14px', color: '#111827' }}>{tag.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div
              className="flex justify-end"
              style={{ gap: '12px', padding: '16px 24px', borderTop: '1px solid #E5E7EB' }}
            >
              <button
                onClick={() => setShowTagModal(false)}
                style={{
                  padding: '10px 18px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  background: 'white',
                  fontSize: '14px',
                  color: '#4B5563',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddTags}
                disabled={(selectedTagIds.size === 0 && !newTagName.trim()) || bulkActionLoading}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  borderRadius: '8px',
                  background: (selectedTagIds.size > 0 || newTagName.trim()) ? '#8C69F0' : '#E5E7EB',
                  fontSize: '14px',
                  color: (selectedTagIds.size > 0 || newTagName.trim()) ? 'white' : '#9CA3AF',
                  cursor: (selectedTagIds.size > 0 || newTagName.trim()) ? 'pointer' : 'not-allowed',
                }}
              >
                {bulkActionLoading ? 'Adding...' : 'Add Tags'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '24px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: '#FEE2E2',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                Delete {selectedIds.size} asset{selectedIds.size > 1 ? 's' : ''}?
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5 }}>
                This action cannot be undone. The selected assets will be permanently removed from the library.
              </p>
            </div>
            <div
              className="flex justify-end"
              style={{ gap: '12px', padding: '16px 24px', borderTop: '1px solid #E5E7EB' }}
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '10px 18px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  background: 'white',
                  fontSize: '14px',
                  color: '#4B5563',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#EF4444',
                  fontSize: '14px',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                {bulkActionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
