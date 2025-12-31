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

interface HubConfig {
  name: string;
  icon: string;
  color: string;
}

interface HubPageContentProps {
  hubId: string;
  hub: HubConfig;
  assets: Asset[];
  selectedTags: string[];
  hubTags?: TagData[];
  defaultView?: 'grid' | 'stack';
  showRecentlyAdded?: boolean; // Show "Recently Added" hero section at top
}

export function HubPageContent({
  hub,
  assets,
  hubTags: hubTagsFromAPI,
  defaultView = 'grid',
  showRecentlyAdded = false,
}: HubPageContentProps) {
  // Internal tag selection state - uses slugs as keys for consistency
  const [internalSelectedTags, setInternalSelectedTags] = useState<string[]>([]);

  // Get all board tag slugs for internal tracking
  const hubTagSlugs = hubTagsFromAPI?.map(t => t.slug) || [];
  
  // Display map: slug -> displayName (or name as fallback)
  const hubTagDisplayMap = useMemo(() => {
    const map: Record<string, string> = {};
    hubTagsFromAPI?.forEach(t => {
      map[t.slug] = t.displayName || t.name;
    });
    return map;
  }, [hubTagsFromAPI]);

  // Helper: Check if an asset tag matches a board tag (by slug OR name)
  const assetTagMatchesBoardTag = (assetTag: string, hubTag: TagData): boolean => {
    const assetTagLower = assetTag.toLowerCase();
    return (
      assetTagLower === hubTag.slug.toLowerCase() ||
      assetTagLower === hubTag.name.toLowerCase()
    );
  };

  // Count assets per tag (matching by both slug and name)
  const assetCountByTag = useMemo(() => {
    const counts: Record<string, number> = {};
    hubTagsFromAPI?.forEach(hubTag => {
      counts[hubTag.slug] = assets.filter(asset =>
        asset.tags.some(assetTag => assetTagMatchesBoardTag(assetTag, hubTag))
      ).length;
    });
    return counts;
  }, [assets, hubTagsFromAPI]);

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'stack'>(defaultView);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Toggle section expansion
  const toggleSection = (slug: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  // Use internal selected tags, default to all if empty
  const effectiveSelectedTags = internalSelectedTags.length > 0 ? internalSelectedTags : [...hubTagSlugs];

  // Toggle a tag in the pills (uses slug)
  const toggleTag = (tagSlug: string) => {
    if (internalSelectedTags.length === 0) {
      // Currently showing all - switch to just this one
      setInternalSelectedTags([tagSlug]);
    } else if (internalSelectedTags.includes(tagSlug)) {
      // Remove this tag
      const newTags = internalSelectedTags.filter(t => t !== tagSlug);
      setInternalSelectedTags(newTags); // If empty, will show all
    } else {
      // Add this tag
      setInternalSelectedTags([...internalSelectedTags, tagSlug]);
    }
  };

  // Check if a tag is active (by slug)
  const isTagActive = (tagSlug: string) => {
    if (internalSelectedTags.length === 0) return true; // All selected
    return internalSelectedTags.includes(tagSlug);
  };

  // Group assets by their tags that match board tags (matching by both slug and name)
  const assetsByTag = useMemo(() => {
    const grouped: Record<string, Asset[]> = {};
    hubTagsFromAPI?.forEach(hubTag => {
      grouped[hubTag.slug] = [];
    });
    assets.forEach(asset => {
      asset.tags.forEach(assetTag => {
        const matchingBoardTag = hubTagsFromAPI?.find(bt => 
          assetTagMatchesBoardTag(assetTag, bt)
        );
        if (matchingBoardTag && grouped[matchingBoardTag.slug]) {
          if (!grouped[matchingBoardTag.slug].some(a => a.id === asset.id)) {
            grouped[matchingBoardTag.slug].push(asset);
          }
        }
      });
    });
    return grouped;
  }, [assets, hubTagsFromAPI]);

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
  const visibleSlugs = hubTagSlugs.filter(slug => effectiveSelectedTags.includes(slug));
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
        {/* Enhanced Filter Navigation - More Prominent */}
        {hubTagSlugs.length > 0 && (
          <div
            style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            {/* Filter Label */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={hub.color} strokeWidth="2.5">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#64748B',
                }}
              >
                Filter by Topic
              </span>
            </div>

            {/* Pills Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              {/* All pill */}
              <button
                onClick={() => setInternalSelectedTags([])}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: internalSelectedTags.length === 0 ? `2px solid ${hub.color}` : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: internalSelectedTags.length === 0 ? hub.color : '#F1F5F9',
                  color: internalSelectedTags.length === 0 ? 'white' : '#475569',
                  boxShadow: internalSelectedTags.length === 0 ? `0 2px 8px ${hub.color}40` : 'none',
                }}
              >
                All
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: internalSelectedTags.length === 0 ? 'rgba(255,255,255,0.3)' : '#E2E8F0',
                    color: internalSelectedTags.length === 0 ? 'white' : '#64748B',
                  }}
                >
                  {assets.length}
                </span>
              </button>

              {/* Tag pills - display name but track by slug */}
              {hubTagsFromAPI?.map(tag => {
                const isActive = isTagActive(tag.slug) && internalSelectedTags.length > 0;
                return (
                  <button
                    key={tag.slug}
                    onClick={() => toggleTag(tag.slug)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '24px',
                      fontSize: '14px',
                      fontWeight: 600,
                      border: isActive ? `2px solid ${hub.color}` : '2px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: isActive ? hub.color : 'white',
                      color: isActive ? 'white' : '#475569',
                      boxShadow: isActive ? `0 2px 8px ${hub.color}40` : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = hub.color;
                        e.currentTarget.style.background = `${hub.color}10`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                  >
                    {hubTagDisplayMap[tag.slug]}
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: isActive ? 'rgba(255,255,255,0.3)' : '#F1F5F9',
                        color: isActive ? 'white' : '#64748B',
                      }}
                    >
                      {assetCountByTag[tag.slug] || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sort and View Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>{hub.icon}</span>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              {hub.name}
            </h2>
            <span style={{ fontSize: '14px', color: '#64748B' }}>
              {assets.length} items
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: 'white',
                fontSize: '13px',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              <option value="newest">Newest</option>
              <option value="name">Name</option>
            </select>

            {/* View toggle */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'grid' ? '#E2E8F0' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('stack')}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'stack' ? '#E2E8F0' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Added Section - Hero layout for newest content */}
      {showRecentlyAdded && hasAnyAssets && internalSelectedTags.length === 0 && (
        <section style={{ marginBottom: '40px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={hub.color} strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Recently Added
            </h2>
          </div>

          {/* Top 2 hero cards - 50/50 split */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            {assets.slice(0, 2).map(asset => (
              <HeroCard
                key={asset.id}
                id={asset.id}
                slug={asset.slug}
                title={asset.title}
                description={asset.description}
                shortDescription={asset.shortDescription}
                hub={asset.hub}
                format={asset.format}
                type={asset.type}
                publishDate={asset.publishDate}
              />
            ))}
          </div>

          {/* Next 4 cards in standard grid */}
          {assets.length > 2 && (
            <div className="card-grid">
              {assets.slice(2, 6).map(asset => (
                <AssetCard
                  key={asset.id}
                  {...asset}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Content */}
      {hasAnyAssets ? (
        <>
          {/* Render sections for each visible tag */}
          {visibleSlugs.map((slug, index) => {
            const tagAssets = assetsByTag[slug] || [];
            if (tagAssets.length === 0) return null;

            const hasPreviousSections = visibleSlugs.slice(0, index).some(s => (assetsByTag[s] || []).length > 0);

            return (
              <section key={slug} style={{ marginBottom: '32px' }}>
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
                  {hubTagDisplayMap[slug]}
                </h3>
                {viewMode === 'grid' ? (
                  (() => {
                    const sortedAssets = sortAssets(tagAssets);
                    const isExpanded = expandedSections.has(slug);
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
                    const sortedAssets = sortAssets(tagAssets);
                    const isExpanded = expandedSections.has(slug);
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

          {/* "Other" section for untagged assets */}
          {(() => {
            const taggedAssetIds = new Set(
              Object.values(assetsByTag).flat().map(a => a.id)
            );
            const untaggedAssets = assets.filter(a => !taggedAssetIds.has(a.id));

            if (untaggedAssets.length === 0) return null;

            const hasPreviousSections = visibleSlugs.some(slug => (assetsByTag[slug] || []).length > 0);

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
            No {hub.name.toLowerCase()} resources yet
          </h3>
          <p className="mb-6 max-w-md mx-auto" style={{ color: '#64748B' }}>
            Resources tagged with {hub.name} will appear here.
          </p>
          <a
            href="/admin/upload"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: hub.color }}
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

// Legacy alias
export const BoardPageContent = HubPageContent;
