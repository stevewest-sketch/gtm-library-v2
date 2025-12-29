'use client';

import { useState, useMemo } from 'react';
import { AssetCard, CompactCard, HeroCard } from './AssetCard';

// Number of cards to show before "Show more" (2 rows of 4)
const INITIAL_GRID_COUNT = 8;
const INITIAL_LIST_COUNT = 6;

interface Asset {
  id: string;
  slug: string;
  title: string;
  description?: string;
  shortDescription?: string;
  hub: string;
  format: string;
  type?: string;
  tags: string[];
  views?: number;
  shares?: number;
  durationMinutes?: number;
  publishDate?: string;
  primaryLink?: string;
}

type SortOption = 'newest' | 'name';

interface TagData {
  id: string;
  name: string;
  slug: string;
  displayName?: string | null;
}

interface BoardConfig {
  name: string;
  icon: string;
  color: string;
}

interface BoardPageContentProps {
  boardId: string;
  board: BoardConfig;
  assets: Asset[];
  selectedTags: string[];
  boardTags?: TagData[];
  defaultView?: 'grid' | 'stack';
}

export function BoardPageContent({
  board,
  assets,
  boardTags: boardTagsFromAPI,
  defaultView = 'grid',
}: BoardPageContentProps) {
  // Internal tag selection state (horizontal pills manage their own state)
  // Uses slugs for internal state to match asset.tags
  const [internalSelectedTags, setInternalSelectedTags] = useState<string[]>([]);

  // Board tag data - use slugs for matching, names/displayNames for display
  const boardTagSlugs = boardTagsFromAPI?.map(t => t.slug) || [];

  // Map slug -> display name for showing in UI
  const boardTagDisplayMap = useMemo(() => {
    const map: Record<string, string> = {};
    boardTagsFromAPI?.forEach(t => {
      map[t.slug] = t.displayName || t.name;
    });
    return map;
  }, [boardTagsFromAPI]);

  // Count assets per tag (using slugs for comparison)
  const assetCountByTag = useMemo(() => {
    const counts: Record<string, number> = {};
    boardTagSlugs.forEach(slug => {
      counts[slug] = assets.filter(asset =>
        asset.tags.some(t => t.toLowerCase() === slug.toLowerCase())
      ).length;
    });
    return counts;
  }, [assets, boardTagSlugs]);

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'stack'>(defaultView);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Toggle section expansion
  const toggleSection = (tag: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  // Use internal selected tags, default to all if empty
  const effectiveSelectedTags = internalSelectedTags.length > 0 ? internalSelectedTags : [...boardTagSlugs];

  // Toggle a tag in the pills
  const toggleTag = (tagName: string) => {
    if (internalSelectedTags.length === 0) {
      // Currently showing all - switch to just this one
      setInternalSelectedTags([tagName]);
    } else if (internalSelectedTags.includes(tagName)) {
      // Remove this tag
      const newTags = internalSelectedTags.filter(t => t !== tagName);
      setInternalSelectedTags(newTags); // If empty, will show all
    } else {
      // Add this tag
      setInternalSelectedTags([...internalSelectedTags, tagName]);
    }
  };

  // Check if a tag is active
  const isTagActive = (tagName: string) => {
    if (internalSelectedTags.length === 0) return true; // All selected
    return internalSelectedTags.includes(tagName);
  };

  // Group assets by their tags that match board tags (using slugs)
  const assetsByTag = useMemo(() => {
    const grouped: Record<string, Asset[]> = {};
    boardTagSlugs.forEach(slug => {
      grouped[slug] = [];
    });
    assets.forEach(asset => {
      asset.tags.forEach(assetTag => {
        const matchingBoardSlug = boardTagSlugs.find(
          slug => slug.toLowerCase() === assetTag.toLowerCase()
        );
        if (matchingBoardSlug && grouped[matchingBoardSlug]) {
          if (!grouped[matchingBoardSlug].some(a => a.id === asset.id)) {
            grouped[matchingBoardSlug].push(asset);
          }
        }
      });
    });
    return grouped;
  }, [assets, boardTagSlugs]);

  // Sort assets
  const sortAssets = (assetsToSort: Asset[]): Asset[] => {
    return [...assetsToSort].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  };

  // Get visible sections based on selected tags (using slugs)
  const visibleSlugs = boardTagSlugs.filter(slug => effectiveSelectedTags.includes(slug));
  const hasAnyAssets = assets.length > 0;

  return (
    <>
      {/* Sticky Header Container */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: '#F8FAFC',
          marginLeft: '-24px',
          marginRight: '-24px',
          paddingLeft: '24px',
          paddingRight: '24px',
          marginTop: '-24px',
          paddingTop: '24px',
        }}
      >
        {/* Horizontal Pills Navigation - Option A from design system */}
        {boardTagSlugs.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 0 20px',
              borderBottom: '1px solid #E2E8F0',
              flexWrap: 'wrap',
            }}
          >
          {/* All pill */}
          <button
            onClick={() => setInternalSelectedTags([])}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: internalSelectedTags.length === 0 ? board.color : '#F1F5F9',
              color: internalSelectedTags.length === 0 ? 'white' : '#64748B',
            }}
          >
            All
            <span
              style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '10px',
                background: internalSelectedTags.length === 0 ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                color: internalSelectedTags.length === 0 ? 'white' : '#64748B',
              }}
            >
              {assets.length}
            </span>
          </button>

          {/* Tag pills */}
          {boardTagSlugs.map(slug => {
            const isActive = isTagActive(slug) && internalSelectedTags.length > 0;
            const count = assetCountByTag[slug] || 0;

            return (
              <button
                key={slug}
                onClick={() => toggleTag(slug)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: isActive ? board.color : '#F1F5F9',
                  color: isActive ? 'white' : '#64748B',
                }}
              >
                {boardTagDisplayMap[slug] || slug}
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                    color: isActive ? 'white' : '#64748B',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
          </div>
        )}

        {/* Board Header with Controls */}
        <div
          className="flex items-center justify-between"
          style={{ padding: '16px 0 20px' }}
        >
        {/* Left: Board Title */}
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: board.color }}
          />
          <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>
            {board.name}
          </h1>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}
          >
            {assets.length} items
          </span>
        </div>

        {/* Right: Sort Dropdown and View Toggle */}
        <div className="flex items-center" style={{ gap: '12px' }}>
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            style={{
              padding: '8px 32px 8px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: 'inherit',
              background: "white url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\") no-repeat right 10px center",
              cursor: 'pointer',
              appearance: 'none',
              color: '#0F172A',
            }}
          >
            <option value="newest">Newest</option>
            <option value="name">A-Z</option>
          </select>

          {/* View Toggle Buttons */}
          <div
            className="flex"
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {/* Grid View Button */}
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px 12px',
                background: viewMode === 'grid' ? '#F1F5F9' : 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Card view"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={viewMode === 'grid' ? '#0F172A' : '#94A3B8'}
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>

            {/* Stack/List View Button */}
            <button
              onClick={() => setViewMode('stack')}
              style={{
                padding: '8px 12px',
                background: viewMode === 'stack' ? '#F1F5F9' : 'white',
                border: 'none',
                borderLeft: '1px solid #E2E8F0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="List view"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={viewMode === 'stack' ? '#0F172A' : '#94A3B8'}
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Tag-based Sections */}
      {hasAnyAssets ? (
        <>
          {visibleSlugs.map((slug, index) => {
            const tagAssets = sortAssets(assetsByTag[slug] || []);
            if (tagAssets.length === 0) return null;

            const isFirstSection = index === 0 || visibleSlugs.slice(0, index).every(s => (assetsByTag[s] || []).length === 0);

            // For first section in grid view, show hero cards for first 2 items
            const heroAssets = isFirstSection && viewMode === 'grid' ? tagAssets.slice(0, 2) : [];
            const regularAssets = isFirstSection && viewMode === 'grid' ? tagAssets.slice(2) : tagAssets;

            return (
              <section key={slug} style={{ marginBottom: '32px' }}>
                {!isFirstSection && (
                  <div
                    style={{
                      borderTop: '1px solid #E2E8F0',
                      marginBottom: '24px',
                    }}
                  />
                )}
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: '16px',
                  }}
                >
                  {boardTagDisplayMap[slug] || slug}
                </h3>

                {/* Hero Cards for first section */}
                {heroAssets.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '20px',
                      marginBottom: regularAssets.length > 0 ? '20px' : 0,
                    }}
                  >
                    {heroAssets.map(asset => (
                      <HeroCard
                        key={asset.id}
                        {...asset}
                      />
                    ))}
                  </div>
                )}

                {/* Regular Cards */}
                {viewMode === 'grid' ? (
                  regularAssets.length > 0 && (() => {
                    const isExpanded = expandedSections.has(slug);
                    const visibleAssets = isExpanded ? regularAssets : regularAssets.slice(0, INITIAL_GRID_COUNT);
                    const hiddenCount = regularAssets.length - INITIAL_GRID_COUNT;
                    const showExpandButton = hiddenCount > 0;

                    return (
                      <>
                        <div className="card-grid">
                          {visibleAssets.map(asset => (
                            <AssetCard
                              key={asset.id}
                              {...asset}
                            />
                          ))}
                        </div>
                        {showExpandButton && (
                          <button
                            onClick={() => toggleSection(slug)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              width: '100%',
                              padding: '12px 20px',
                              marginTop: '16px',
                              background: 'white',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#64748B',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#F8FAFC';
                              e.currentTarget.style.borderColor = '#CBD5E1';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.borderColor = '#E2E8F0';
                            }}
                          >
                            {isExpanded ? (
                              <>
                                Show less
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="18 15 12 9 6 15" />
                                </svg>
                              </>
                            ) : (
                              <>
                                Show {hiddenCount} more
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </>
                            )}
                          </button>
                        )}
                      </>
                    );
                  })()
                ) : (
                  (() => {
                    const isExpanded = expandedSections.has(slug);
                    const visibleAssets = isExpanded ? tagAssets : tagAssets.slice(0, INITIAL_LIST_COUNT);
                    const hiddenCount = tagAssets.length - INITIAL_LIST_COUNT;
                    const showExpandButton = hiddenCount > 0;

                    return (
                      <>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            maxWidth: '900px',
                          }}
                        >
                          {visibleAssets.map(asset => (
                            <CompactCard
                              key={asset.id}
                              id={asset.id}
                              slug={asset.slug}
                              title={asset.title}
                              shortDescription={asset.shortDescription}
                              hub={asset.hub}
                              format={asset.format}
                              type={asset.type}
                              publishDate={asset.publishDate}
                            />
                          ))}
                        </div>
                        {showExpandButton && (
                          <button
                            onClick={() => toggleSection(slug)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              width: '100%',
                              maxWidth: '900px',
                              padding: '12px 20px',
                              marginTop: '12px',
                              background: 'white',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#64748B',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#F8FAFC';
                              e.currentTarget.style.borderColor = '#CBD5E1';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.borderColor = '#E2E8F0';
                            }}
                          >
                            {isExpanded ? (
                              <>
                                Show less
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="18 15 12 9 6 15" />
                                </svg>
                              </>
                            ) : (
                              <>
                                Show {hiddenCount} more
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </>
                            )}
                          </button>
                        )}
                      </>
                    );
                  })()
                )}
              </section>
            );
          })}

          {/* Assets without matching tags - show in "Other" section */}
          {(() => {
            const untaggedAssets = assets.filter(asset => {
              const hasMatchingTag = asset.tags.some(assetTag =>
                boardTagSlugs.some(slug => slug.toLowerCase() === assetTag.toLowerCase())
              );
              return !hasMatchingTag;
            });

            if (untaggedAssets.length === 0) return null;

            const hasPreviousSections = visibleSlugs.some(s => (assetsByTag[s] || []).length > 0);

            return (
              <section style={{ marginBottom: '32px' }}>
                {hasPreviousSections && (
                  <div
                    style={{
                      borderTop: '1px solid #E2E8F0',
                      marginBottom: '24px',
                    }}
                  />
                )}
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: '16px',
                  }}
                >
                  Other
                </h3>
                {viewMode === 'grid' ? (
                  (() => {
                    const sortedAssets = sortAssets(untaggedAssets);
                    const isExpanded = expandedSections.has('__other__');
                    const visibleAssets = isExpanded ? sortedAssets : sortedAssets.slice(0, INITIAL_GRID_COUNT);
                    const hiddenCount = sortedAssets.length - INITIAL_GRID_COUNT;
                    const showExpandButton = hiddenCount > 0;

                    return (
                      <>
                        <div className="card-grid">
                          {visibleAssets.map(asset => (
                            <AssetCard
                              key={asset.id}
                              {...asset}
                            />
                          ))}
                        </div>
                        {showExpandButton && (
                          <button
                            onClick={() => toggleSection('__other__')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              width: '100%',
                              padding: '12px 20px',
                              marginTop: '16px',
                              background: 'white',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#64748B',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#F8FAFC';
                              e.currentTarget.style.borderColor = '#CBD5E1';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.borderColor = '#E2E8F0';
                            }}
                          >
                            {isExpanded ? (
                              <>
                                Show less
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="18 15 12 9 6 15" />
                                </svg>
                              </>
                            ) : (
                              <>
                                Show {hiddenCount} more
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </>
                            )}
                          </button>
                        )}
                      </>
                    );
                  })()
                ) : (
                  (() => {
                    const sortedAssets = sortAssets(untaggedAssets);
                    const isExpanded = expandedSections.has('__other__');
                    const visibleAssets = isExpanded ? sortedAssets : sortedAssets.slice(0, INITIAL_LIST_COUNT);
                    const hiddenCount = sortedAssets.length - INITIAL_LIST_COUNT;
                    const showExpandButton = hiddenCount > 0;

                    return (
                      <>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            maxWidth: '900px',
                          }}
                        >
                          {visibleAssets.map(asset => (
                            <CompactCard
                              key={asset.id}
                              id={asset.id}
                              slug={asset.slug}
                              title={asset.title}
                              shortDescription={asset.shortDescription}
                              hub={asset.hub}
                              format={asset.format}
                              type={asset.type}
                              publishDate={asset.publishDate}
                            />
                          ))}
                        </div>
                        {showExpandButton && (
                          <button
                            onClick={() => toggleSection('__other__')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              width: '100%',
                              maxWidth: '900px',
                              padding: '12px 20px',
                              marginTop: '12px',
                              background: 'white',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#64748B',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#F8FAFC';
                              e.currentTarget.style.borderColor = '#CBD5E1';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.borderColor = '#E2E8F0';
                            }}
                          >
                            {isExpanded ? (
                              <>
                                Show less
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="18 15 12 9 6 15" />
                                </svg>
                              </>
                            ) : (
                              <>
                                Show {hiddenCount} more
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </>
                            )}
                          </button>
                        )}
                      </>
                    );
                  })()
                )}
              </section>
            );
          })()}
        </>
      ) : (
        <div
          className="rounded-xl p-12 text-center"
          style={{ backgroundColor: 'white', border: '1px solid #E2E8F0' }}
        >
          <svg
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: '#94A3B8' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="text-lg font-medium mb-2" style={{ color: '#0F172A' }}>
            No {board.name.toLowerCase()} resources yet
          </h3>
          <p className="mb-6 max-w-md mx-auto" style={{ color: '#64748B' }}>
            Resources tagged with {board.name} will appear here.
          </p>
          <a
            href="/admin/upload"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: board.color }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Resource
          </a>
        </div>
      )}
    </>
  );
}
