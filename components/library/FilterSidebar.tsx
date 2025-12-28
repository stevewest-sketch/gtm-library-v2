'use client';

import { useState, useEffect, useMemo } from 'react';
import { BOARDS, type BoardId } from '@/lib/constants/hubs';

// Tag type for dynamic tags from API
interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

// Board with tags for cross-filtering
interface BoardWithTags {
  id: string;
  slug: string;
  name: string;
  icon?: string | null;
  color: string;
  tags: Tag[];
}

interface FilterSidebarProps {
  activeBoard?: BoardId;
  // Dynamic tags for the active board (from API)
  boardTags?: Tag[];
  // Other boards with their tags for cross-filtering (from API)
  otherBoardsWithTags?: BoardWithTags[];
  // Selected tags for the active board
  selectedTags?: string[];
  // Selected cross-filter tags by board slug
  selectedCrossFilters?: Record<string, string[]>;
  onTagChange?: (tags: string[]) => void;
  onCrossFilterChange?: (boardSlug: string, tags: string[]) => void;
}

export function FilterSidebar({
  activeBoard,
  boardTags,
  otherBoardsWithTags,
  selectedTags,
  selectedCrossFilters = {},
  onTagChange,
  onCrossFilterChange,
}: FilterSidebarProps) {
  // Get the board's tags for default selection
  const board = activeBoard ? BOARDS[activeBoard] : null;
  const staticBoardTags = board?.tags || [];

  // Get all board tags for default checked state
  const allBoardTags = useMemo(() => {
    if (boardTags) {
      return boardTags.map(t => t.name);
    }
    return [...staticBoardTags]; // Create mutable copy
  }, [boardTags, staticBoardTags]);

  // Use API data if available, otherwise use static data
  const displayTags: { name: string; slug?: string }[] = boardTags
    ? boardTags.map(t => ({ name: t.name, slug: t.slug }))
    : staticBoardTags.map(t => ({ name: t }));

  // Fetch other boards from API for cross-filtering
  const [fetchedBoards, setFetchedBoards] = useState<BoardWithTags[]>([]);

  useEffect(() => {
    async function fetchBoards() {
      try {
        const res = await fetch('/api/boards');
        if (res.ok) {
          const data = await res.json();
          setFetchedBoards(data.filter((b: BoardWithTags) => b.slug !== activeBoard));
        }
      } catch (error) {
        console.error('Failed to fetch boards for cross-filtering:', error);
      }
    }
    fetchBoards();
  }, [activeBoard]);

  // Get other boards for cross-filtering - prefer API data, fallback to static
  const otherBoards: BoardWithTags[] = useMemo(() => {
    if (otherBoardsWithTags) return otherBoardsWithTags;
    if (fetchedBoards.length > 0) return fetchedBoards;
    // Fallback to static data
    return Object.entries(BOARDS)
      .filter(([id]) => id !== activeBoard)
      .map(([id, b]) => ({
        id,
        slug: id,
        name: b.name,
        color: b.color,
        tags: b.tags.map((t, i) => ({ id: String(i), name: t, slug: t.toLowerCase().replace(/\s+/g, '-') })),
      }));
  }, [activeBoard, otherBoardsWithTags, fetchedBoards]);

  // Initialize collapsed state - all collapsed except first
  const [collapsedBoards, setCollapsedBoards] = useState<Set<string>>(new Set());

  // Update collapsed state when otherBoards changes (e.g., after API fetch)
  useEffect(() => {
    if (otherBoards.length > 0) {
      setCollapsedBoards(new Set(otherBoards.slice(1).map(b => b.slug)));
    }
  }, [otherBoards.length]);

  // Use effective selected tags (default to all if not provided)
  const effectiveSelectedTags = selectedTags ?? allBoardTags;

  // Initialize selectedTags with ALL board tags on first render
  useEffect(() => {
    if (selectedTags === undefined && onTagChange && allBoardTags.length > 0) {
      onTagChange([...allBoardTags]);
    }
  }, [activeBoard]); // Only run when activeBoard changes

  const toggleTag = (tagName: string) => {
    if (!onTagChange) return;
    const currentTags = effectiveSelectedTags;
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];
    onTagChange(newTags);
  };

  const toggleCrossFilter = (boardSlug: string, tagName: string) => {
    if (!onCrossFilterChange) return;
    const currentFilters = selectedCrossFilters[boardSlug] || [];
    const newFilters = currentFilters.includes(tagName)
      ? currentFilters.filter(f => f !== tagName)
      : [...currentFilters, tagName];
    onCrossFilterChange(boardSlug, newFilters);
  };

  const toggleBoardCollapse = (boardSlug: string) => {
    const newCollapsed = new Set(collapsedBoards);
    if (newCollapsed.has(boardSlug)) {
      newCollapsed.delete(boardSlug);
    } else {
      newCollapsed.add(boardSlug);
    }
    setCollapsedBoards(newCollapsed);
  };

  const hasActiveFilters = effectiveSelectedTags.length < allBoardTags.length ||
    Object.values(selectedCrossFilters).some(f => f.length > 0);

  const clearAllFilters = () => {
    // Reset to all tags selected
    onTagChange?.([...allBoardTags]);
    otherBoards.forEach((b) => {
      onCrossFilterChange?.(b.slug, []);
    });
  };

  return (
    <aside
      className="bg-white border-r fixed bottom-0 overflow-y-auto custom-scrollbar"
      style={{
        width: 'var(--filter-width)',
        left: 'var(--sidebar-width)',
        top: 'var(--header-height)',
        borderColor: 'var(--card-border)',
        padding: '20px 16px',
      }}
    >
      {/* Board's Tags - v7 exact: filter-section margin-bottom: 28px, filter-section-title margin-bottom: 14px */}
      {displayTags.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-muted)',
              marginBottom: '14px',
            }}
          >
            Board&apos;s Tags
          </div>
          <div className="flex flex-col">
            {displayTags.map((tag) => {
              const isSelected = effectiveSelectedTags.includes(tag.name);
              return (
                <label
                  key={tag.slug || tag.name}
                  className="flex items-center cursor-pointer transition-all hover:text-purple-600"
                  style={{
                    gap: '12px',
                    padding: '8px 0',
                    fontSize: '14px',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-primary)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleTag(tag.name)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--content-primary)',
                      cursor: 'pointer',
                      borderRadius: '4px',
                    }}
                  />
                  <span>{tag.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      {displayTags.length > 0 && otherBoards.length > 0 && (
        <div
          className="my-4"
          style={{ borderTop: '1px solid var(--card-border)' }}
        />
      )}

      {/* And filter by... (Other Boards) - v7 exact */}
      {otherBoards.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-muted)',
              marginBottom: '14px',
            }}
          >
            And filter by
          </div>

          {/* Other Boards as Collapsible Groups */}
          {otherBoards.slice(0, 6).map((otherBoard) => {
            const isCollapsed = collapsedBoards.has(otherBoard.slug);
            const boardCrossFilters = selectedCrossFilters[otherBoard.slug] || [];
            const hasSelectedFilters = boardCrossFilters.length > 0;

            return (
              <div key={otherBoard.slug} style={{ marginBottom: '4px' }}>
                {/* Board Header - v7 exact: filter-group-header padding 10px 0 */}
                <button
                  onClick={() => toggleBoardCollapse(otherBoard.slug)}
                  className="w-full flex items-center justify-between transition-all hover:text-purple-600"
                  style={{
                    padding: '10px 0',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span className="flex items-center" style={{ gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>
                      {otherBoard.icon || BOARDS[otherBoard.slug as BoardId]?.icon || '📁'}
                    </span>
                    <span>{otherBoard.name}</span>
                    {hasSelectedFilters && (
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          backgroundColor: otherBoard.color + '20',
                          color: otherBoard.color,
                        }}
                      >
                        {boardCrossFilters.length}
                      </span>
                    )}
                  </span>
                  <svg
                    style={{
                      width: '18px',
                      height: '18px',
                      color: 'var(--text-muted)',
                      transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Board's Tags - v7 exact: padding-left 28px, padding-bottom 8px */}
                {!isCollapsed && otherBoard.tags.length > 0 && (
                  <div className="flex flex-col" style={{ paddingLeft: '28px', paddingBottom: '8px' }}>
                    {otherBoard.tags.slice(0, 5).map((tag) => {
                      const isSelected = boardCrossFilters.includes(tag.name);
                      return (
                        <label
                          key={tag.slug}
                          className="flex items-center cursor-pointer transition-all hover:text-purple-600"
                          style={{
                            gap: '12px',
                            padding: '8px 0',
                            fontSize: '14px',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCrossFilter(otherBoard.slug, tag.name)}
                            style={{
                              width: '18px',
                              height: '18px',
                              accentColor: 'var(--content-primary)',
                              cursor: 'pointer',
                              borderRadius: '4px',
                            }}
                          />
                          <span>{tag.name}</span>
                        </label>
                      );
                    })}
                    {otherBoard.tags.length > 5 && (
                      <span style={{ fontSize: '11px', padding: '8px 0', color: 'var(--text-muted)' }}>
                        +{otherBoard.tags.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {otherBoards.length > 6 && (
            <div
              className="text-[11px] py-2"
              style={{ color: 'var(--text-muted)' }}
            >
              +{otherBoards.length - 6} more boards
            </div>
          )}
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
          <button
            onClick={clearAllFilters}
            className="w-full py-2 text-[12px] font-medium rounded-md transition-all hover:bg-gray-100 flex items-center justify-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all filters
          </button>
        </div>
      )}
    </aside>
  );
}
