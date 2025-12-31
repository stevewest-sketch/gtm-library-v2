'use client';

import { useEffect, useMemo } from 'react';

// Tag type for dynamic tags from API
interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  displayName?: string | null; // Board-specific display name override
}

interface FilterSidebarProps {
  activeHub?: string;
  // Dynamic tags for the active hub (from API)
  hubTags?: Tag[];
  // Selected tags for the active hub
  selectedTags?: string[];
  onTagChange?: (tags: string[]) => void;
}

export function FilterSidebar({
  activeHub,
  hubTags,
  selectedTags,
  onTagChange,
}: FilterSidebarProps) {
  // Get all hub tags for default checked state (from API)
  const allHubTags = useMemo(() => {
    if (hubTags) {
      return hubTags.map(t => t.name);
    }
    return [];
  }, [hubTags]);

  // Use API data for display tags (with displayName for UI display, name for matching)
  const displayTags: { name: string; slug?: string; displayName?: string | null }[] = hubTags
    ? hubTags.map(t => ({ name: t.name, slug: t.slug, displayName: t.displayName }))
    : [];

  // Use effective selected tags (default to all if not provided)
  const effectiveSelectedTags = selectedTags ?? allHubTags;

  // Initialize selectedTags with ALL hub tags on first render
  useEffect(() => {
    if (selectedTags === undefined && onTagChange && allHubTags.length > 0) {
      onTagChange([...allHubTags]);
    }
  }, [activeHub]); // Only run when activeHub changes

  const toggleTag = (tagName: string) => {
    if (!onTagChange) return;
    const currentTags = effectiveSelectedTags;
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];
    onTagChange(newTags);
  };

  const hasActiveFilters = effectiveSelectedTags.length < allHubTags.length;

  const clearAllFilters = () => {
    // Reset to all tags selected
    onTagChange?.([...allHubTags]);
  };

  return (
    <aside
      className="border-r overflow-y-auto custom-scrollbar flex-shrink-0"
      style={{
        width: 'var(--filter-width)',
        borderColor: 'var(--card-border)',
        background: 'var(--card-bg)',
        padding: '20px 16px',
        position: 'sticky',
        top: 0,
        height: 'calc(100vh - 65px)',
      }}
    >
      {/* Hub's Tags - v7 exact: filter-section margin-bottom: 28px, filter-section-title margin-bottom: 14px */}
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
            Hub&apos;s Tags
          </div>
          <div className="flex flex-col">
            {displayTags.map((tag) => {
              const isSelected = effectiveSelectedTags.includes(tag.name);
              return (
                <label
                  key={tag.slug || tag.name}
                  className="flex items-start cursor-pointer transition-all hover:text-purple-600"
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
                      minWidth: '18px',
                      minHeight: '18px',
                      flexShrink: 0,
                      accentColor: 'var(--content-primary)',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      marginTop: '2px',
                    }}
                  />
                  <span style={{ lineHeight: '1.4' }}>{tag.displayName || tag.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}


      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
          <button
            onClick={clearAllFilters}
            className="w-full py-2 text-[12px] font-medium rounded-md transition-all flex items-center justify-center gap-1.5"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--hover-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
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
