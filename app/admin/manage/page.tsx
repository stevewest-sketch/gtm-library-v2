'use client';

import { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

// Database types for taxonomy
interface ContentTypeDB {
  id: string;
  slug: string;
  name: string;
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

interface Asset {
  id: string;
  slug: string;
  title: string;
  description?: string;
  hub: string;
  format: string;
  types?: string[];
  status: string;
  views?: number;
  updatedAt: string;
  boards: string[];
  tags: string[];
}

// Pagination constants
const PAGE_SIZE_OPTIONS = [20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

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

function ManageAssetsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [hubFilter, setHubFilter] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Modal states
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [showRemoveBoardModal, setShowRemoveBoardModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedBoardIds, setSelectedBoardIds] = useState<Set<string>>(new Set());
  const [selectedTagNames, setSelectedTagNames] = useState<Set<string>>(new Set());
  const [newTagName, setNewTagName] = useState('');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [tagModalMode, setTagModalMode] = useState<'add' | 'remove'>('add');
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [boardModalMode, setBoardModalMode] = useState<'add' | 'remove'>('add');

  // Sorting state
  type SortField = 'title' | 'hub' | 'type' | 'format' | 'boards' | 'tags' | 'updatedAt' | 'views';
  type SortDirection = 'asc' | 'desc';
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Edit mode state - batch editing
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, { hub?: string; type?: string; format?: string }>>({});
  const [savingChanges, setSavingChanges] = useState(false);

  // Database-driven taxonomy options
  const [contentTypes, setContentTypes] = useState<ContentTypeDB[]>([]);
  const [formats, setFormats] = useState<FormatDB[]>([]);

  // Get the display value for a field (pending change or original)
  const getDisplayValue = useCallback((asset: Asset, field: 'hub' | 'type' | 'format') => {
    const pending = pendingChanges[asset.id];
    if (pending && pending[field] !== undefined) {
      return pending[field];
    }
    if (field === 'type') {
      return (asset.types || [])[0] || '';
    }
    return asset[field] || '';
  }, [pendingChanges]);

  // Track a pending change (doesn't save to server)
  const handlePendingChange = useCallback((assetId: string, field: 'hub' | 'type' | 'format', value: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [assetId]: {
        ...prev[assetId],
        [field]: value,
      },
    }));
  }, []);

  // Save all pending changes
  const handleSaveAllChanges = useCallback(async () => {
    const changeEntries = Object.entries(pendingChanges);
    if (changeEntries.length === 0) return;

    setSavingChanges(true);
    try {
      const results = await Promise.all(
        changeEntries.map(async ([assetId, changes]) => {
          const updateData: Record<string, unknown> = {};
          if (changes.hub !== undefined) updateData.hub = changes.hub;
          if (changes.type !== undefined) updateData.types = [changes.type];
          if (changes.format !== undefined) updateData.format = changes.format;

          const res = await fetch(`/api/assets/${assetId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
          });
          return { assetId, success: res.ok, changes };
        })
      );

      // Update local state for successful changes
      const successfulChanges = results.filter(r => r.success);
      if (successfulChanges.length > 0) {
        setAssets(prev => prev.map(asset => {
          const result = successfulChanges.find(r => r.assetId === asset.id);
          if (result) {
            return {
              ...asset,
              hub: result.changes.hub ?? asset.hub,
              types: result.changes.type ? [result.changes.type] : asset.types,
              format: result.changes.format ?? asset.format,
              updatedAt: new Date().toISOString(),
            };
          }
          return asset;
        }));
      }

      // Clear pending changes and exit edit mode
      setPendingChanges({});
      setIsEditMode(false);

      const failedCount = results.filter(r => !r.success).length;
      if (failedCount > 0) {
        alert(`${successfulChanges.length} changes saved. ${failedCount} failed.`);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('An error occurred while saving changes.');
    } finally {
      setSavingChanges(false);
    }
  }, [pendingChanges]);

  // Cancel all pending changes
  const handleCancelChanges = useCallback(() => {
    setPendingChanges({});
    setIsEditMode(false);
  }, []);

  // Count of pending changes
  const pendingChangeCount = Object.keys(pendingChanges).length;

  // Initialize tag filter from URL params
  useEffect(() => {
    const tag = searchParams.get('tag');
    if (tag) {
      setTagFilter(tag);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAssets();
    fetchBoards();
    fetchTags();
    fetchTaxonomy();
  }, []);

  // Fetch taxonomy (types and formats) from database
  const fetchTaxonomy = async () => {
    try {
      const [typesRes, formatsRes] = await Promise.all([
        fetch('/api/admin/content-types'),
        fetch('/api/admin/formats'),
      ]);
      if (typesRes.ok) {
        const types = await typesRes.json();
        setContentTypes(types);
      }
      if (formatsRes.ok) {
        const fmts = await formatsRes.json();
        setFormats(fmts);
      }
    } catch (error) {
      console.error('Failed to fetch taxonomy:', error);
    }
  };

  // Build dropdown options from database data - sorted alphabetically
  const TYPE_OPTIONS = useMemo(() =>
    contentTypes
      .map(t => ({ value: t.slug, label: t.name }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [contentTypes]
  );

  const FORMAT_OPTIONS = useMemo(() =>
    formats
      .map(f => ({ value: f.slug, label: f.name }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [formats]
  );

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
        // API returns array directly, not { boards: [...] }
        setBoards(Array.isArray(data) ? data : data.boards || []);
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
        // API returns array directly, not { tags: [...] }
        setAllTags(Array.isArray(data) ? data : data.tags || []);
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

  const handleRemoveFromBoards = async () => {
    if (selectedBoardIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const res = await fetch('/api/assets/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'removeFromBoards',
          assetIds: Array.from(selectedIds),
          boardIds: Array.from(selectedBoardIds),
        }),
      });
      if (res.ok) {
        setShowRemoveBoardModal(false);
        setSelectedBoardIds(new Set());
        fetchAssets();
      }
    } catch (error) {
      console.error('Failed to remove from boards:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkTagAction = async () => {
    const tagNames = Array.from(selectedTagNames);
    if (newTagName.trim() && tagModalMode === 'add') {
      tagNames.push(newTagName.trim());
    }
    if (tagNames.length === 0) return;

    setBulkActionLoading(true);
    try {
      const res = await fetch('/api/assets/bulk-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetIds: Array.from(selectedIds),
          tags: tagNames,
          action: tagModalMode,
        }),
      });
      if (res.ok) {
        setShowTagModal(false);
        setSelectedTagNames(new Set());
        setNewTagName('');
        setTagSearchQuery('');
        fetchAssets();
        fetchTags();
      }
    } catch (error) {
      console.error('Failed to update tags:', error);
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

  const openTagModal = (mode: 'add' | 'remove' = 'add') => {
    setSelectedTagNames(new Set());
    setNewTagName('');
    setTagSearchQuery('');
    setTagModalMode(mode);
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

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        !searchQuery ||
        asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesHub = !hubFilter || asset.hub.toLowerCase() === hubFilter.toLowerCase();
      const matchesBoard = !boardFilter || (asset.boards || []).some(b =>
        b.toLowerCase() === boardFilter.toLowerCase()
      );
      const matchesType = !typeFilter || (asset.types || []).some(t =>
        t.toLowerCase() === typeFilter.toLowerCase()
      );
      const matchesFormat = !formatFilter || asset.format?.toLowerCase() === formatFilter.toLowerCase();
      const matchesStatus = !statusFilter || asset.status === statusFilter;
      const matchesTag = !tagFilter || (asset.tags || []).some(t =>
        t.toLowerCase() === tagFilter.toLowerCase()
      );
      return matchesSearch && matchesHub && matchesBoard && matchesType && matchesFormat && matchesStatus && matchesTag;
    });
  }, [assets, searchQuery, hubFilter, boardFilter, typeFilter, formatFilter, statusFilter, tagFilter]);

  // Sort filtered assets
  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'hub':
          comparison = a.hub.localeCompare(b.hub);
          break;
        case 'type':
          comparison = ((a.types || [])[0] || '').localeCompare((b.types || [])[0] || '');
          break;
        case 'format':
          comparison = (a.format || '').localeCompare(b.format || '');
          break;
        case 'boards':
          comparison = (a.boards?.length || 0) - (b.boards?.length || 0);
          break;
        case 'tags':
          comparison = (a.tags?.length || 0) - (b.tags?.length || 0);
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'views':
          comparison = (a.views || 0) - (b.views || 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredAssets, sortField, sortDirection]);

  // Paginated assets
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedAssets.slice(startIndex, startIndex + pageSize);
  }, [sortedAssets, currentPage, pageSize]);

  // Total pages
  const totalPages = Math.ceil(filteredAssets.length / pageSize);

  // Check if all items on current page are selected
  const allCurrentPageSelected = paginatedAssets.length > 0 && paginatedAssets.every(a => selectedIds.has(a.id));

  const toggleSelectAll = () => {
    if (allCurrentPageSelected) {
      // Deselect all on current page
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedAssets.forEach(a => next.delete(a.id));
        return next;
      });
    } else {
      // Select all on current page
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedAssets.forEach(a => next.add(a.id));
        return next;
      });
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, hubFilter, boardFilter, typeFilter, formatFilter, statusFilter, tagFilter]);

  // Get unique types from assets for the filter dropdown
  const uniqueTypes = useMemo(() => {
    const typesSet = new Set<string>();
    assets.forEach(a => {
      (a.types || []).forEach(t => typesSet.add(t));
    });
    return Array.from(typesSet).sort();
  }, [assets]);

  // Get unique formats from assets for the filter dropdown
  const uniqueFormats = useMemo(() => {
    const formats = new Set<string>();
    assets.forEach(a => {
      if (a.format) formats.add(a.format);
    });
    return Array.from(formats).sort();
  }, [assets]);

  // Get unique tags from selected assets for remove mode
  const selectedAssetsTags = useMemo(() => {
    const tagSet = new Set<string>();
    filteredAssets
      .filter(a => selectedIds.has(a.id))
      .forEach(a => (a.tags || []).forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [filteredAssets, selectedIds]);

  // Get unique boards from selected assets for remove mode
  const selectedAssetsBoards = useMemo(() => {
    const boardSet = new Set<string>();
    filteredAssets
      .filter(a => selectedIds.has(a.id))
      .forEach(a => (a.boards || []).forEach(b => boardSet.add(b)));
    return Array.from(boardSet).sort();
  }, [filteredAssets, selectedIds]);

  // Filter tags for modal based on search and mode
  const filteredModalTags = useMemo(() => {
    let tagList = tagModalMode === 'remove' ? selectedAssetsTags : allTags.map(t => t.name);
    if (tagSearchQuery) {
      tagList = tagList.filter(t => t.toLowerCase().includes(tagSearchQuery.toLowerCase()));
    }
    return tagList;
  }, [tagModalMode, selectedAssetsTags, allTags, tagSearchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Sortable header component
  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <div
      onClick={() => handleSort(field)}
      className="flex items-center gap-1.5"
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      {children}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{
          opacity: sortField === field ? 1 : 0.4,
          transform: sortField === field && sortDirection === 'asc' ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.15s ease, opacity 0.15s ease',
        }}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );

  // Row action handlers
  const handleDuplicateAsset = async (asset: Asset) => {
    try {
      const res = await fetch('/api/assets/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: asset.id }),
      });
      if (res.ok) {
        fetchAssets();
        setOpenDropdown(null);
      }
    } catch (error) {
      console.error('Failed to duplicate asset:', error);
    }
  };

  const handleArchiveAsset = async (asset: Asset) => {
    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      if (res.ok) {
        fetchAssets();
        setOpenDropdown(null);
      }
    } catch (error) {
      console.error('Failed to archive asset:', error);
    }
  };

  const handleDeleteSingleAsset = async (asset: Asset) => {
    if (!confirm(`Are you sure you want to delete "${asset.title}"?`)) return;
    try {
      const res = await fetch('/api/assets/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          assetIds: [asset.id],
        }),
      });
      if (res.ok) {
        fetchAssets();
        setOpenDropdown(null);
      }
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
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

        {/* Board Filter */}
        <select
          value={boardFilter}
          onChange={(e) => setBoardFilter(e.target.value)}
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
          <option value="">All Boards</option>
          {boards.map((board) => (
            <option key={board.id} value={board.name}>
              {board.name}
            </option>
          ))}
        </select>

        {/* Type Filter - Uses database-driven options */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
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
          <option value="">All Types</option>
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Format Filter - Uses database-driven options */}
        <select
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value)}
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
          <option value="">All Formats</option>
          {FORMAT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
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

        {/* Tag Filter Indicator */}
        {tagFilter && (
          <div
            className="flex items-center"
            style={{
              gap: '8px',
              padding: '8px 12px',
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#B45309',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span style={{ fontWeight: 500 }}>Tag: {tagFilter}</span>
            <button
              onClick={() => setTagFilter('')}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                color: '#B45309',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg
                width="14"
                height="14"
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

        <div style={{ flex: 1 }} />

        {/* Edit Mode Toggle & Save/Cancel */}
        {isEditMode ? (
          <div className="flex items-center" style={{ gap: '10px' }}>
            {pendingChangeCount > 0 && (
              <span style={{ fontSize: '13px', color: '#F59E0B', fontWeight: 500 }}>
                {pendingChangeCount} unsaved change{pendingChangeCount !== 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={handleCancelChanges}
              style={{
                padding: '10px 18px',
                background: 'white',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAllChanges}
              disabled={pendingChangeCount === 0 || savingChanges}
              style={{
                padding: '10px 18px',
                background: pendingChangeCount > 0 ? '#10B981' : '#9CA3AF',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                cursor: pendingChangeCount > 0 ? 'pointer' : 'not-allowed',
                opacity: savingChanges ? 0.7 : 1,
              }}
            >
              {savingChanges ? 'Saving...' : `Save Changes${pendingChangeCount > 0 ? ` (${pendingChangeCount})` : ''}`}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditMode(true)}
            className="flex items-center"
            style={{
              gap: '8px',
              padding: '10px 18px',
              background: 'white',
              border: '1px solid var(--card-border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 500,
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
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Mode
          </button>
        )}

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
            onClick={() => {
              setSelectedBoardIds(new Set());
              setShowRemoveBoardModal(true);
            }}
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
              <path d="M5 12h14" />
            </svg>
            Remove from Board
          </button>

          <button
            onClick={() => openTagModal('add')}
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

          <button
            onClick={() => openTagModal('remove')}
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
              <line x1="4" y1="4" x2="10" y2="10" />
            </svg>
            Remove Tags
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
            gridTemplateColumns: '44px 1fr 80px 100px 80px 120px 70px 80px 60px 48px',
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
              checked={allCurrentPageSelected}
              onChange={toggleSelectAll}
              style={{
                width: '18px',
                height: '18px',
                accentColor: 'var(--content-primary)',
                cursor: 'pointer',
              }}
            />
          </div>
          <SortableHeader field="title">Title</SortableHeader>
          <SortableHeader field="hub">Hub</SortableHeader>
          <SortableHeader field="type">Type</SortableHeader>
          <SortableHeader field="format">Format</SortableHeader>
          <SortableHeader field="boards">Boards</SortableHeader>
          <SortableHeader field="tags">Tags</SortableHeader>
          <SortableHeader field="updatedAt">Updated</SortableHeader>
          <SortableHeader field="views">Views</SortableHeader>
          <div></div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading assets...
          </div>
        ) : paginatedAssets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No assets found
          </div>
        ) : (
          paginatedAssets.map((asset) => {
            const isSelected = selectedIds.has(asset.id);
            const hubStyle = HUB_STYLES[asset.hub.toLowerCase()] || HUB_STYLES.content;
            return (
              <div
                key={asset.id}
                className="grid items-center"
                style={{
                  gridTemplateColumns: '44px 1fr 80px 100px 80px 120px 70px 80px 60px 48px',
                  padding: '14px 20px',
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
                <div className="flex items-center" style={{ gap: '10px', minWidth: 0 }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: hubStyle.primary,
                      flexShrink: 0,
                    }}
                  />
                  <Link
                    href={`/admin/manage/asset/${asset.slug}`}
                    className="no-underline"
                    style={{
                      fontSize: '13px',
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

                {/* Hub Badge - Editable in Edit Mode */}
                <div style={{ position: 'relative' }}>
                  {isEditMode ? (
                    <select
                      value={getDisplayValue(asset, 'hub')}
                      onChange={(e) => handlePendingChange(asset.id, 'hub', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        fontSize: '11px',
                        border: pendingChanges[asset.id]?.hub ? '2px solid #F59E0B' : '1px solid var(--card-border)',
                        borderRadius: '4px',
                        background: pendingChanges[asset.id]?.hub ? '#FFFBEB' : 'white',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="content">Content</option>
                      <option value="enablement">Enablement</option>
                      <option value="coe">CoE</option>
                    </select>
                  ) : (
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        backgroundColor: hubStyle.light,
                        color: hubStyle.accent,
                      }}
                    >
                      {asset.hub}
                    </span>
                  )}
                </div>

                {/* Type - Editable in Edit Mode */}
                <div style={{ position: 'relative' }}>
                  {isEditMode ? (
                    <select
                      value={getDisplayValue(asset, 'type')}
                      onChange={(e) => handlePendingChange(asset.id, 'type', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        fontSize: '11px',
                        border: pendingChanges[asset.id]?.type ? '2px solid #F59E0B' : '1px solid var(--card-border)',
                        borderRadius: '4px',
                        background: pendingChanges[asset.id]?.type ? '#FFFBEB' : 'white',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Select type...</option>
                      {TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        padding: '2px 4px',
                      }}
                    >
                      {(asset.types || [])[0] ? (
                        (asset.types || [])[0].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Format - Editable in Edit Mode */}
                <div style={{ position: 'relative' }}>
                  {isEditMode ? (
                    <select
                      value={getDisplayValue(asset, 'format')}
                      onChange={(e) => handlePendingChange(asset.id, 'format', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        fontSize: '11px',
                        border: pendingChanges[asset.id]?.format ? '2px solid #F59E0B' : '1px solid var(--card-border)',
                        borderRadius: '4px',
                        background: pendingChanges[asset.id]?.format ? '#FFFBEB' : 'white',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Select format...</option>
                      {FORMAT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        padding: '2px 4px',
                      }}
                    >
                      {asset.format ? (
                        asset.format.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Boards - Editable in Edit Mode */}
                <div style={{ position: 'relative' }}>
                  {isEditMode ? (
                    <button
                      onClick={() => {
                        setSelectedIds(new Set([asset.id]));
                        setSelectedBoardIds(new Set());
                        setShowBoardModal(true);
                      }}
                      className="flex items-center"
                      style={{
                        gap: '4px',
                        padding: '4px 8px',
                        background: 'white',
                        border: '1px solid var(--card-border)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {(asset.boards || []).length > 0 ? (
                        <>
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '1px 4px',
                              background: '#F3F4F6',
                              borderRadius: '3px',
                              maxWidth: '60px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {(asset.boards || [])[0]}
                          </span>
                          {(asset.boards || []).length > 1 && (
                            <span style={{ color: 'var(--text-muted)' }}>+{(asset.boards || []).length - 1}</span>
                          )}
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>None</span>
                      )}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  ) : (
                    <div className="flex flex-wrap" style={{ gap: '3px' }}>
                      {(asset.boards || []).slice(0, 1).map((board, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            background: '#F3F4F6',
                            borderRadius: '3px',
                            color: 'var(--text-secondary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '90px',
                          }}
                        >
                          {board}
                        </span>
                      ))}
                      {(asset.boards || []).length > 1 && (
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '2px 4px',
                            color: 'var(--text-muted)',
                          }}
                        >
                          +{(asset.boards || []).length - 1}
                        </span>
                      )}
                      {(asset.boards || []).length === 0 && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>-</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags - Editable in Edit Mode */}
                <div style={{ position: 'relative' }}>
                  {isEditMode ? (
                    <button
                      onClick={() => {
                        setSelectedIds(new Set([asset.id]));
                        setSelectedTagNames(new Set());
                        setTagSearchQuery('');
                        setNewTagName('');
                        setTagModalMode('add');
                        setShowTagModal(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        background: 'white',
                        border: '1px solid var(--card-border)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      <span>{(asset.tags || []).length}</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {(asset.tags || []).length > 0 ? `${(asset.tags || []).length}` : '-'}
                    </div>
                  )}
                </div>

                {/* Updated Date */}
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {formatDate(asset.updatedAt)}
                </div>

                {/* Views */}
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
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
                        onClick={() => {
                          setOpenDropdown(null);
                          router.push(`/admin/manage/asset/${asset.slug}`);
                        }}
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
                        onClick={() => handleDuplicateAsset(asset)}
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
                      <button
                        onClick={() => handleArchiveAsset(asset)}
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
                          <path d="M21 8v13H3V8" />
                          <path d="M1 3h22v5H1z" />
                          <path d="M10 12h4" />
                        </svg>
                        Archive
                      </button>
                      <div style={{ height: '1px', background: '#F3F4F6', margin: '4px 0' }} />
                      <button
                        onClick={() => handleDeleteSingleAsset(asset)}
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
            <div className="flex items-center" style={{ gap: '16px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredAssets.length)} of {filteredAssets.length} assets
              </div>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '6px 28px 6px 10px',
                  border: '1px solid var(--card-border)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  background:
                    "white url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\") no-repeat right 8px center",
                  cursor: 'pointer',
                  appearance: 'none',
                  color: 'var(--text-secondary)',
                }}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center" style={{ gap: '8px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                style={{
                  padding: '8px 14px',
                  border: '1px solid var(--card-border)',
                  borderRadius: '6px',
                  background: 'white',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  color: 'var(--text-secondary)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                ← Previous
              </button>
              {/* Page numbers */}
              {(() => {
                const pages: (number | string)[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  if (currentPage <= 4) {
                    pages.push(1, 2, 3, 4, 5, '...', totalPages);
                  } else if (currentPage >= totalPages - 3) {
                    pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                  }
                }
                return pages.map((page, idx) =>
                  page === '...' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      style={{
                        padding: '8px 4px',
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      style={{
                        padding: '8px 14px',
                        border: `1px solid ${currentPage === page ? 'var(--content-primary)' : 'var(--card-border)'}`,
                        borderRadius: '6px',
                        background: currentPage === page ? 'var(--content-primary)' : 'white',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        color: currentPage === page ? 'white' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {page}
                    </button>
                  )
                );
              })()}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                style={{
                  padding: '8px 14px',
                  border: '1px solid var(--card-border)',
                  borderRadius: '6px',
                  background: 'white',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  color: 'var(--text-secondary)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
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

      {/* Remove from Board Modal */}
      {showRemoveBoardModal && (
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
          onClick={() => setShowRemoveBoardModal(false)}
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
                Remove from Board
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                Select boards to remove {selectedIds.size} asset{selectedIds.size > 1 ? 's' : ''} from
              </p>
            </div>
            <div style={{ padding: '16px 24px', maxHeight: '300px', overflowY: 'auto' }}>
              {selectedAssetsBoards.length === 0 ? (
                <p style={{ color: '#6B7280', fontSize: '14px' }}>Selected assets are not in any boards</p>
              ) : (
                boards
                  .filter(board => selectedAssetsBoards.includes(board.name))
                  .map((board) => (
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
                        style={{ width: '18px', height: '18px', accentColor: '#EF4444' }}
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
                onClick={() => setShowRemoveBoardModal(false)}
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
                onClick={handleRemoveFromBoards}
                disabled={selectedBoardIds.size === 0 || bulkActionLoading}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  borderRadius: '8px',
                  background: selectedBoardIds.size > 0 ? '#EF4444' : '#E5E7EB',
                  fontSize: '14px',
                  color: selectedBoardIds.size > 0 ? 'white' : '#9CA3AF',
                  cursor: selectedBoardIds.size > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                {bulkActionLoading ? 'Removing...' : 'Remove from Boards'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Tag Modal */}
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
              maxWidth: '480px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                Bulk {tagModalMode === 'add' ? 'Add' : 'Remove'} Tags
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                {tagModalMode === 'add' ? 'Add tags to' : 'Remove tags from'} {selectedIds.size} asset{selectedIds.size > 1 ? 's' : ''}
              </p>
            </div>

            {/* Mode Toggle */}
            <div style={{ padding: '16px 24px 0' }}>
              <div
                className="flex"
                style={{
                  background: '#F3F4F6',
                  borderRadius: '8px',
                  padding: '4px',
                  gap: '4px',
                }}
              >
                <button
                  onClick={() => {
                    setTagModalMode('add');
                    setSelectedTagNames(new Set());
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: tagModalMode === 'add' ? 'white' : 'transparent',
                    color: tagModalMode === 'add' ? '#10B981' : '#6B7280',
                    boxShadow: tagModalMode === 'add' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Tags
                </button>
                <button
                  onClick={() => {
                    setTagModalMode('remove');
                    setSelectedTagNames(new Set());
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: tagModalMode === 'remove' ? 'white' : 'transparent',
                    color: tagModalMode === 'remove' ? '#EF4444' : '#6B7280',
                    boxShadow: tagModalMode === 'remove' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Remove Tags
                </button>
              </div>
            </div>

            <div style={{ padding: '16px 24px' }}>
              {/* Search / Create input */}
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder={tagModalMode === 'add' ? 'Search or create new tag...' : 'Search tags...'}
                  value={tagModalMode === 'add' ? newTagName || tagSearchQuery : tagSearchQuery}
                  onChange={(e) => {
                    if (tagModalMode === 'add') {
                      setNewTagName(e.target.value);
                      setTagSearchQuery(e.target.value);
                    } else {
                      setTagSearchQuery(e.target.value);
                    }
                  }}
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

              {/* Tag selection grid */}
              <div
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                {filteredModalTags.length === 0 ? (
                  <p style={{ color: '#6B7280', fontSize: '14px', padding: '8px 0' }}>
                    {tagModalMode === 'remove' ? 'No tags found on selected assets' : 'No tags available'}
                  </p>
                ) : (
                  filteredModalTags.map((tagName) => (
                    <button
                      key={tagName}
                      onClick={() => {
                        setSelectedTagNames((prev) => {
                          const next = new Set(prev);
                          if (next.has(tagName)) {
                            next.delete(tagName);
                          } else {
                            next.add(tagName);
                          }
                          return next;
                        });
                      }}
                      style={{
                        padding: '8px 14px',
                        border: selectedTagNames.has(tagName)
                          ? `2px solid ${tagModalMode === 'add' ? '#10B981' : '#EF4444'}`
                          : '1px solid #E5E7EB',
                        borderRadius: '6px',
                        background: selectedTagNames.has(tagName)
                          ? tagModalMode === 'add' ? '#D1FAE5' : '#FEE2E2'
                          : 'white',
                        fontSize: '13px',
                        color: selectedTagNames.has(tagName)
                          ? tagModalMode === 'add' ? '#047857' : '#DC2626'
                          : '#374151',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {selectedTagNames.has(tagName) && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {tagName}
                    </button>
                  ))
                )}
              </div>

              {/* Preview of changes */}
              {(selectedTagNames.size > 0 || (tagModalMode === 'add' && newTagName.trim() && !allTags.some(t => t.name.toLowerCase() === newTagName.trim().toLowerCase()))) && (
                <div
                  style={{
                    padding: '12px 14px',
                    background: tagModalMode === 'add' ? '#F0FDF4' : '#FEF2F2',
                    borderRadius: '8px',
                    border: `1px solid ${tagModalMode === 'add' ? '#BBF7D0' : '#FECACA'}`,
                  }}
                >
                  <p style={{ fontSize: '13px', color: tagModalMode === 'add' ? '#166534' : '#991B1B', marginBottom: '8px' }}>
                    Will {tagModalMode} {selectedTagNames.size + (tagModalMode === 'add' && newTagName.trim() && !allTags.some(t => t.name.toLowerCase() === newTagName.trim().toLowerCase()) ? 1 : 0)} tag{selectedTagNames.size !== 1 ? 's' : ''} {tagModalMode === 'add' ? 'to' : 'from'} {selectedIds.size} asset{selectedIds.size !== 1 ? 's' : ''}:
                  </p>
                  <div className="flex flex-wrap" style={{ gap: '6px' }}>
                    {Array.from(selectedTagNames).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: '4px 10px',
                          background: tagModalMode === 'add' ? '#DCFCE7' : '#FEE2E2',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: tagModalMode === 'add' ? '#166534' : '#991B1B',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {tagModalMode === 'add' && newTagName.trim() && !allTags.some(t => t.name.toLowerCase() === newTagName.trim().toLowerCase()) && (
                      <span
                        style={{
                          padding: '4px 10px',
                          background: '#DCFCE7',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#166534',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        {newTagName.trim()} (new)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
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
                onClick={handleBulkTagAction}
                disabled={(selectedTagNames.size === 0 && !(tagModalMode === 'add' && newTagName.trim())) || bulkActionLoading}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  borderRadius: '8px',
                  background: (selectedTagNames.size > 0 || (tagModalMode === 'add' && newTagName.trim()))
                    ? tagModalMode === 'add' ? '#10B981' : '#EF4444'
                    : '#E5E7EB',
                  fontSize: '14px',
                  color: (selectedTagNames.size > 0 || (tagModalMode === 'add' && newTagName.trim())) ? 'white' : '#9CA3AF',
                  cursor: (selectedTagNames.size > 0 || (tagModalMode === 'add' && newTagName.trim())) ? 'pointer' : 'not-allowed',
                }}
              >
                {bulkActionLoading
                  ? (tagModalMode === 'add' ? 'Adding...' : 'Removing...')
                  : `${tagModalMode === 'add' ? 'Add' : 'Remove'} Tags`}
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

export default function ManageAssetsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>}>
      <ManageAssetsContent />
    </Suspense>
  );
}
