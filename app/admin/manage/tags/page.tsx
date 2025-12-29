'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';

interface TagBoard {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
}

interface Tag {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  color: string | null;
  boardCount: number;
  assetCount: number;
  boards: TagBoard[];
}

interface Board {
  id: string;
  slug: string;
  name: string;
  color: string;
  lightColor: string;
  accentColor: string;
  icon: string;
}

// Category options for the dropdown
const CATEGORY_OPTIONS = [
  { value: '', label: 'No Category' },
  { value: 'product', label: 'Product' },
  { value: 'industry', label: 'Industry' },
  { value: 'use-case', label: 'Use Case' },
  { value: 'team', label: 'Team' },
  { value: 'topic', label: 'Topic' },
  { value: 'customer', label: 'Customer' },
];

export default function TagsManagePage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [allBoards, setAllBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, {
    name?: string;
    category?: string | null;
    boardsToAdd?: string[];
    boardsToRemove?: string[];
  }>>({});
  const [savingChanges, setSavingChanges] = useState(false);

  // Board picker state for inline editing
  const [activeBoardPicker, setActiveBoardPicker] = useState<string | null>(null);
  const [boardSearchQuery, setBoardSearchQuery] = useState('');

  // Sorting state
  type SortField = 'name' | 'category' | 'boards' | 'assets';
  type SortDirection = 'asc' | 'desc';
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // New tag creation state
  const [showNewTagRow, setShowNewTagRow] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState('');

  // Fetch tags and boards from database
  useEffect(() => {
    fetchTags();
    fetchBoards();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags');
      if (res.ok) {
        const data = await res.json();
        // For each tag, fetch its boards
        const tagsWithBoards = await Promise.all(
          data.map(async (tag: Tag) => {
            const boardsRes = await fetch(`/api/tags/${tag.slug}/boards`);
            if (boardsRes.ok) {
              const boards = await boardsRes.json();
              return { ...tag, boards };
            }
            return { ...tag, boards: [] };
          })
        );
        setTags(tagsWithBoards);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoards = async () => {
    try {
      const res = await fetch('/api/boards');
      if (res.ok) {
        const data = await res.json();
        setAllBoards(data);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  };

  // Get display value for a field (pending change or original)
  const getDisplayValue = useCallback((tag: Tag, field: 'name' | 'category') => {
    const pending = pendingChanges[tag.id];
    if (pending && pending[field] !== undefined) {
      return pending[field];
    }
    return tag[field] || '';
  }, [pendingChanges]);

  // Get boards for a tag including pending changes
  const getTagBoards = useCallback((tag: Tag): TagBoard[] => {
    const pending = pendingChanges[tag.id];
    if (!pending) return tag.boards;

    let boards = [...tag.boards];

    // Remove boards
    if (pending.boardsToRemove?.length) {
      boards = boards.filter(b => !pending.boardsToRemove!.includes(b.slug));
    }

    // Add boards
    if (pending.boardsToAdd?.length) {
      pending.boardsToAdd.forEach(slug => {
        if (!boards.some(b => b.slug === slug)) {
          const board = allBoards.find(b => b.slug === slug);
          if (board) {
            boards.push({
              id: board.id,
              slug: board.slug,
              name: board.name,
              color: board.color,
              icon: board.icon,
            });
          }
        }
      });
    }

    return boards;
  }, [pendingChanges, allBoards]);

  // Track a pending change
  const handlePendingChange = useCallback((tagId: string, field: string, value: string | null) => {
    setPendingChanges(prev => ({
      ...prev,
      [tagId]: {
        ...prev[tagId],
        [field]: value,
      },
    }));
  }, []);

  // Add board to pending changes
  const handleAddBoard = useCallback((tagId: string, boardSlug: string) => {
    setPendingChanges(prev => {
      const current = prev[tagId] || {};
      const boardsToAdd = current.boardsToAdd || [];
      const boardsToRemove = current.boardsToRemove || [];

      // If it was marked for removal, just remove from that list
      if (boardsToRemove.includes(boardSlug)) {
        return {
          ...prev,
          [tagId]: {
            ...current,
            boardsToRemove: boardsToRemove.filter(s => s !== boardSlug),
          },
        };
      }

      // Otherwise add to add list
      if (!boardsToAdd.includes(boardSlug)) {
        return {
          ...prev,
          [tagId]: {
            ...current,
            boardsToAdd: [...boardsToAdd, boardSlug],
          },
        };
      }
      return prev;
    });
    setActiveBoardPicker(null);
    setBoardSearchQuery('');
  }, []);

  // Remove board from pending changes
  const handleRemoveBoard = useCallback((tagId: string, boardSlug: string, isOriginal: boolean) => {
    setPendingChanges(prev => {
      const current = prev[tagId] || {};
      const boardsToAdd = current.boardsToAdd || [];
      const boardsToRemove = current.boardsToRemove || [];

      if (isOriginal) {
        // Mark original board for removal
        if (!boardsToRemove.includes(boardSlug)) {
          return {
            ...prev,
            [tagId]: {
              ...current,
              boardsToRemove: [...boardsToRemove, boardSlug],
            },
          };
        }
      } else {
        // Remove from add list
        return {
          ...prev,
          [tagId]: {
            ...current,
            boardsToAdd: boardsToAdd.filter(s => s !== boardSlug),
          },
        };
      }
      return prev;
    });
  }, []);

  // Save all pending changes
  const handleSaveAllChanges = useCallback(async () => {
    const changeEntries = Object.entries(pendingChanges);
    if (changeEntries.length === 0) return;

    setSavingChanges(true);
    try {
      for (const [tagId, changes] of changeEntries) {
        const tag = tags.find(t => t.id === tagId);
        if (!tag) continue;

        // Update tag properties if changed
        if (changes.name !== undefined || changes.category !== undefined) {
          await fetch(`/api/tags/${tag.slug}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: changes.name ?? tag.name,
              slug: tag.slug,
              category: changes.category !== undefined ? changes.category : tag.category,
              color: tag.color,
            }),
          });
        }

        // Remove boards
        if (changes.boardsToRemove?.length) {
          for (const boardSlug of changes.boardsToRemove) {
            await fetch(`/api/boards/${boardSlug}/tags?tagSlug=${tag.slug}`, {
              method: 'DELETE',
            });
          }
        }

        // Add boards
        if (changes.boardsToAdd?.length) {
          for (const boardSlug of changes.boardsToAdd) {
            await fetch(`/api/boards/${boardSlug}/tags`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tagName: changes.name ?? tag.name }),
            });
          }
        }
      }

      // Refresh and clear
      await fetchTags();
      setPendingChanges({});
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('An error occurred while saving changes.');
    } finally {
      setSavingChanges(false);
    }
  }, [pendingChanges, tags]);

  // Cancel all pending changes
  const handleCancelChanges = useCallback(() => {
    setPendingChanges({});
    setIsEditMode(false);
    setShowNewTagRow(false);
    setNewTagName('');
    setNewTagCategory('');
  }, []);

  // Create new tag
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const slug = newTagName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName.trim(),
          slug,
          category: newTagCategory || null,
        }),
      });

      if (res.ok) {
        await fetchTags();
        setShowNewTagRow(false);
        setNewTagName('');
        setNewTagCategory('');
      } else {
        const error = await res.json();
        alert(`Failed to create tag: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  // Delete tag
  const handleDeleteTag = async (tag: Tag) => {
    if (!confirm(`Delete "${tag.name}"? This will remove it from all boards and assets.`)) return;

    try {
      const res = await fetch(`/api/tags/${tag.slug}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchTags();
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort tags
  const filteredTags = useMemo(() => {
    return tags.filter(tag => {
      const matchesSearch = !searchQuery ||
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || tag.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [tags, searchQuery, categoryFilter]);

  const sortedTags = useMemo(() => {
    return [...filteredTags].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        case 'boards':
          comparison = a.boards.length - b.boards.length;
          break;
        case 'assets':
          comparison = (a.assetCount || 0) - (b.assetCount || 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredTags, sortField, sortDirection]);

  // Pending change count
  const pendingChangeCount = Object.keys(pendingChanges).length;

  // Check if a tag has pending changes
  const hasChanges = (tagId: string) => {
    const changes = pendingChanges[tagId];
    if (!changes) return false;
    return changes.name !== undefined ||
      changes.category !== undefined ||
      (changes.boardsToAdd?.length || 0) > 0 ||
      (changes.boardsToRemove?.length || 0) > 0;
  };

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    tags.forEach(t => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats).sort();
  }, [tags]);

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

  if (loading) {
    return (
      <div style={{ padding: '28px 32px' }}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
          Loading tags...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Page Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
            Manage Tags
          </h1>
          <p style={{ fontSize: '14px', color: '#4B5563' }}>
            Create and organize tags to categorize content within boards.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="flex items-center flex-wrap"
        style={{
          gap: '12px',
          marginBottom: '20px',
          padding: '16px 20px',
          background: 'white',
          border: '1px solid var(--card-border)',
          borderRadius: '10px',
        }}
      >
        {/* Search */}
        <div
          className="flex items-center"
          style={{
            gap: '10px',
            padding: '10px 14px',
            background: '#F9FAFB',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            minWidth: '240px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              background: 'transparent',
            }}
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
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
          <option value="">All Categories</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ')}
            </option>
          ))}
        </select>

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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Mode
          </button>
        )}

        {/* New Tag Button */}
        <button
          onClick={() => setShowNewTagRow(true)}
          className="flex items-center"
          style={{
            gap: '8px',
            padding: '10px 18px',
            background: '#8C69F0',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Tag
        </button>
      </div>

      {/* Tags Table */}
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
            gridTemplateColumns: '1fr 140px 1fr 80px 60px',
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
          <SortableHeader field="name">Tag Name</SortableHeader>
          <SortableHeader field="category">Category</SortableHeader>
          <SortableHeader field="boards">Boards</SortableHeader>
          <SortableHeader field="assets">Assets</SortableHeader>
          <div></div>
        </div>

        {/* New Tag Row */}
        {showNewTagRow && (
          <div
            className="grid items-center"
            style={{
              gridTemplateColumns: '1fr 140px 1fr 80px 60px',
              padding: '14px 20px',
              borderBottom: '1px solid #F3F4F6',
              background: '#FFFBEB',
            }}
          >
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Enter tag name..."
              autoFocus
              style={{
                padding: '8px 12px',
                border: '2px solid #F59E0B',
                borderRadius: '6px',
                fontSize: '13px',
                marginRight: '12px',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateTag();
                if (e.key === 'Escape') {
                  setShowNewTagRow(false);
                  setNewTagName('');
                  setNewTagCategory('');
                }
              }}
            />
            <select
              value={newTagCategory}
              onChange={(e) => setNewTagCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--card-border)',
                borderRadius: '6px',
                fontSize: '12px',
                background: 'white',
              }}
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div style={{ color: '#9CA3AF', fontSize: '12px', fontStyle: 'italic' }}>
              Add boards after creating
            </div>
            <div>-</div>
            <div className="flex" style={{ gap: '4px' }}>
              <button
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                style={{
                  padding: '6px 10px',
                  background: newTagName.trim() ? '#10B981' : '#9CA3AF',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '12px',
                  cursor: newTagName.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setShowNewTagRow(false);
                  setNewTagName('');
                  setNewTagCategory('');
                }}
                style={{
                  padding: '6px 10px',
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#6B7280',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Table Body */}
        {sortedTags.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No tags found
          </div>
        ) : (
          sortedTags.map((tag) => {
            const tagBoards = getTagBoards(tag);
            const tagHasChanges = hasChanges(tag.id);

            return (
              <div
                key={tag.id}
                className="grid items-center"
                style={{
                  gridTemplateColumns: '1fr 140px 1fr 80px 60px',
                  padding: '14px 20px',
                  borderBottom: '1px solid #F3F4F6',
                  background: tagHasChanges ? '#FFFBEB' : 'transparent',
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Tag Name */}
                <div className="flex items-center" style={{ gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>🏷️</span>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={getDisplayValue(tag, 'name') as string}
                      onChange={(e) => handlePendingChange(tag.id, 'name', e.target.value)}
                      style={{
                        padding: '6px 10px',
                        border: pendingChanges[tag.id]?.name !== undefined ? '2px solid #F59E0B' : '1px solid var(--card-border)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        background: pendingChanges[tag.id]?.name !== undefined ? '#FFFBEB' : 'white',
                        flex: 1,
                        maxWidth: '200px',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                      {tag.name}
                    </span>
                  )}
                </div>

                {/* Category */}
                {isEditMode ? (
                  <select
                    value={getDisplayValue(tag, 'category') as string || ''}
                    onChange={(e) => handlePendingChange(tag.id, 'category', e.target.value || null)}
                    style={{
                      padding: '6px 10px',
                      border: pendingChanges[tag.id]?.category !== undefined ? '2px solid #F59E0B' : '1px solid var(--card-border)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      background: pendingChanges[tag.id]?.category !== undefined ? '#FFFBEB' : 'white',
                    }}
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <div>
                    {tag.category ? (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '4px 10px',
                          background: '#F3F4F6',
                          borderRadius: '4px',
                          color: '#6B7280',
                          textTransform: 'capitalize',
                        }}
                      >
                        {tag.category.replace(/-/g, ' ')}
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>-</span>
                    )}
                  </div>
                )}

                {/* Boards */}
                <div style={{ position: 'relative' }}>
                  <div className="flex flex-wrap items-center" style={{ gap: '6px' }}>
                    {tagBoards.slice(0, 3).map((board) => {
                      const isOriginal = tag.boards.some(b => b.slug === board.slug);
                      const isPendingAdd = pendingChanges[tag.id]?.boardsToAdd?.includes(board.slug);

                      return (
                        <span
                          key={board.slug}
                          className="flex items-center"
                          style={{
                            gap: '4px',
                            fontSize: '11px',
                            padding: '4px 8px',
                            background: isPendingAdd ? '#D1FAE5' : '#F3F4F6',
                            border: isPendingAdd ? '1px solid #10B981' : 'none',
                            borderRadius: '4px',
                            color: '#4B5563',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: board.color,
                            }}
                          />
                          {board.name}
                          {isEditMode && (
                            <button
                              onClick={() => handleRemoveBoard(tag.id, board.slug, isOriginal && !isPendingAdd)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#9CA3AF',
                                cursor: 'pointer',
                                padding: 0,
                                marginLeft: '2px',
                                fontSize: '12px',
                                lineHeight: 1,
                              }}
                            >
                              ×
                            </button>
                          )}
                        </span>
                      );
                    })}
                    {tagBoards.length > 3 && (
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                        +{tagBoards.length - 3}
                      </span>
                    )}
                    {tagBoards.length === 0 && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>-</span>
                    )}

                    {/* Add Board Button (in edit mode) */}
                    {isEditMode && (
                      <button
                        onClick={() => setActiveBoardPicker(activeBoardPicker === tag.id ? null : tag.id)}
                        style={{
                          padding: '4px 8px',
                          background: '#EDE9FE',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#8C69F0',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        + Add
                      </button>
                    )}
                  </div>

                  {/* Board Picker Dropdown */}
                  {isEditMode && activeBoardPicker === tag.id && (
                    <>
                      <div
                        style={{
                          position: 'fixed',
                          inset: 0,
                          zIndex: 5,
                        }}
                        onClick={() => {
                          setActiveBoardPicker(null);
                          setBoardSearchQuery('');
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: '4px',
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          width: '220px',
                          zIndex: 10,
                          overflow: 'hidden',
                        }}
                      >
                        <input
                          type="text"
                          value={boardSearchQuery}
                          onChange={(e) => setBoardSearchQuery(e.target.value)}
                          placeholder="Search boards..."
                          autoFocus
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: 'none',
                            borderBottom: '1px solid #E5E7EB',
                            fontSize: '13px',
                            outline: 'none',
                          }}
                        />
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {allBoards
                            .filter(b =>
                              !tagBoards.some(tb => tb.slug === b.slug) &&
                              (!boardSearchQuery || b.name.toLowerCase().includes(boardSearchQuery.toLowerCase()))
                            )
                            .map((board) => (
                              <button
                                key={board.id}
                                onClick={() => handleAddBoard(tag.id, board.slug)}
                                className="flex items-center"
                                style={{
                                  width: '100%',
                                  gap: '10px',
                                  padding: '10px 12px',
                                  border: 'none',
                                  background: 'transparent',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  color: '#374151',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#F9FAFB';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <span
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: board.color,
                                  }}
                                />
                                {board.name}
                              </button>
                            ))}
                          {allBoards.filter(b =>
                            !tagBoards.some(tb => tb.slug === b.slug) &&
                            (!boardSearchQuery || b.name.toLowerCase().includes(boardSearchQuery.toLowerCase()))
                          ).length === 0 && (
                            <div style={{ padding: '12px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                              No boards available
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Asset Count */}
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {tag.assetCount > 0 ? (
                    <Link
                      href={`/admin/manage?tag=${tag.slug}`}
                      style={{ color: '#8C69F0', textDecoration: 'none' }}
                    >
                      {tag.assetCount}
                    </Link>
                  ) : (
                    <span>0</span>
                  )}
                </div>

                {/* Actions */}
                <div>
                  {!isEditMode && (
                    <button
                      onClick={() => handleDeleteTag(tag)}
                      style={{
                        padding: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        borderRadius: '4px',
                      }}
                      title="Delete tag"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      <div
        className="flex items-center justify-between"
        style={{
          marginTop: '16px',
          padding: '12px 20px',
          background: '#F9FAFB',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#6B7280',
        }}
      >
        <span>
          Showing {sortedTags.length} of {tags.length} tags
        </span>
        {isEditMode && pendingChangeCount > 0 && (
          <span style={{ color: '#F59E0B', fontWeight: 500 }}>
            {pendingChangeCount} tag{pendingChangeCount !== 1 ? 's' : ''} modified
          </span>
        )}
      </div>
    </div>
  );
}
