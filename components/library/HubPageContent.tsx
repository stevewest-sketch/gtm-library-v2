'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { AssetCard, CompactCard, HeroCard } from './AssetCard';

// Number of cards to show before "Show more" (2 rows of 4)
const INITIAL_GRID_COUNT = 8;
const INITIAL_LIST_COUNT = 6;

// Workflow step order for numbered indicators
const WORKFLOW_STEP_ORDER = ['discovery', 'demo', 'proposal', 'onboarding', 'qbr', 'expansion', 'renewal'];

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
  category?: string | null;
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

  // Category map: slug -> category
  const hubTagCategoryMap = useMemo(() => {
    const map: Record<string, string | null> = {};
    hubTagsFromAPI?.forEach(t => {
      map[t.slug] = t.category || null;
    });
    return map;
  }, [hubTagsFromAPI]);

  // Get workflow step number for a tag (1-based, or null if not a workflow tag)
  const getWorkflowStepNumber = (slug: string): number | null => {
    if (hubTagCategoryMap[slug] !== 'workflow') return null;
    const index = WORKFLOW_STEP_ORDER.indexOf(slug);
    // If found in order, use that; otherwise assign based on position in visible tags
    if (index !== -1) return index + 1;
    // Fallback: count workflow tags in order of appearance
    const workflowTags = hubTagSlugs.filter(s => hubTagCategoryMap[s] === 'workflow');
    const workflowIndex = workflowTags.indexOf(slug);
    return workflowIndex !== -1 ? workflowIndex + 1 : null;
  };

  // Check if any tags are workflow category
  const hasWorkflowTags = useMemo(() => {
    return hubTagsFromAPI?.some(t => t.category === 'workflow') || false;
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
  const [searchQuery, setSearchQuery] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);
  const tagPillsRef = useRef<HTMLDivElement>(null);
  const tagPillsContainerRef = useRef<HTMLDivElement>(null);
  const heroHeaderRef = useRef<HTMLDivElement>(null);
  const [tagPillsAtEnd, setTagPillsAtEnd] = useState(false);
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);

  // Track scroll to make header fixed when scrolled past its original position
  useEffect(() => {
    const handleScroll = () => {
      // Header should become fixed when scrolled past 64px (global header height)
      const shouldBeFixed = window.scrollY > 20;
      setIsHeaderFixed(shouldBeFixed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if tag pills are scrolled to end (hide scroll hint)
  const checkTagPillsScroll = useCallback(() => {
    const el = tagPillsRef.current;
    if (!el) return;
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
    setTagPillsAtEnd(isAtEnd);
  }, []);

  // Set up scroll listener for tag pills
  useEffect(() => {
    const el = tagPillsRef.current;
    if (!el) return;

    // Initial check
    checkTagPillsScroll();

    el.addEventListener('scroll', checkTagPillsScroll, { passive: true });
    window.addEventListener('resize', checkTagPillsScroll);

    return () => {
      el.removeEventListener('scroll', checkTagPillsScroll);
      window.removeEventListener('resize', checkTagPillsScroll);
    };
  }, [checkTagPillsScroll]);

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

  // Filter assets by search query
  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return assets;
    const query = searchQuery.toLowerCase();
    return assets.filter(asset =>
      asset.title.toLowerCase().includes(query) ||
      asset.shortDescription?.toLowerCase().includes(query) ||
      asset.type?.toLowerCase().includes(query) ||
      asset.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [assets, searchQuery]);

  // Group assets by their tags that match board tags (matching by both slug and name)
  // Uses filteredAssets when search is active
  const assetsByTag = useMemo(() => {
    const grouped: Record<string, Asset[]> = {};
    const assetsToGroup = searchQuery.trim() ? filteredAssets : assets;
    hubTagsFromAPI?.forEach(hubTag => {
      grouped[hubTag.slug] = [];
    });
    assetsToGroup.forEach(asset => {
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
  }, [assets, filteredAssets, searchQuery, hubTagsFromAPI]);

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

  // Get recently added assets (last 14 days), max 8
  const recentlyAddedAssets = useMemo(() => {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    return assets
      .filter(asset => {
        if (!asset.publishDate) return false;
        const publishDate = new Date(asset.publishDate);
        return publishDate >= fourteenDaysAgo;
      })
      .sort((a, b) => {
        const dateA = new Date(a.publishDate || 0);
        const dateB = new Date(b.publishDate || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 8);
  }, [assets]);

  // Carousel scroll handlers
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 296; // Card width (280) + gap (16)
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Get visible sections based on selected tags (using slugs)
  const visibleSlugs = hubTagSlugs.filter(slug => effectiveSelectedTags.includes(slug));
  const hasAnyAssets = filteredAssets.length > 0;

  // Calculate header height for placeholder (approximate)
  const headerHeight = 160; // Approximate height of the hub hero header

  return (
    <>
      {/* Placeholder div to prevent content jump when header becomes fixed */}
      {isHeaderFixed && (
        <div style={{ height: `${headerHeight}px` }} />
      )}

      {/* Hub Hero Header - NEON v4 Cohesive Design */}
      <div
        ref={heroHeaderRef}
        className="hub-hero-header"
        style={{
          position: isHeaderFixed ? 'fixed' : 'relative',
          top: isHeaderFixed ? '64px' : 'auto', // Stick below the fixed page header (64px height)
          left: isHeaderFixed ? 'var(--sidebar-width, 280px)' : 'auto',
          right: isHeaderFixed ? 0 : 'auto',
          zIndex: 40,
          marginLeft: isHeaderFixed ? 0 : '-28px',
          marginRight: isHeaderFixed ? 0 : '-28px',
          marginTop: isHeaderFixed ? 0 : '-20px',
          background: 'var(--bg-page, #0D0D12)',
        }}
      >
        {/* Gradient accent bar */}
        <div
          style={{
            height: '3px',
            background: `linear-gradient(90deg, ${hub.color}, ${hub.color}88, transparent)`,
          }}
        />

        {/* Main header content */}
        <div
          style={{
            padding: '20px 28px 16px',
            background: 'var(--bg-surface, #14141A)',
            borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
          }}
        >
          {/* Top row: Hub title + Search + Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '16px',
            }}
          >
            {/* Hub Icon + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `${hub.color}20`,
                  border: `1px solid ${hub.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                {hub.icon}
              </div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                  {hub.name}
                </h1>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {assets.length} resources
                </span>
              </div>
            </div>

            {/* Search Bar - Flex grow */}
            <div
              style={{
                flex: 1,
                maxWidth: '480px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: 'var(--bg-elevated, #1A1A22)',
                border: '1px solid var(--border-default, rgba(255, 255, 255, 0.08))',
                borderRadius: '10px',
                transition: 'border-color 0.15s ease',
              }}
            >
              <svg
                style={{ width: '18px', height: '18px', color: 'var(--text-muted)', flexShrink: 0 }}
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
                placeholder={`Search ${hub.name.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    padding: '4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Sort + View Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                style={{
                  padding: '9px 12px',
                  paddingRight: '32px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default, rgba(255, 255, 255, 0.08))',
                  background: 'var(--bg-elevated, #1A1A22)',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                }}
              >
                <option value="newest">Newest</option>
                <option value="name">Name</option>
              </select>

              {/* View toggle - pill style */}
              <div
                style={{
                  display: 'flex',
                  padding: '4px',
                  background: 'var(--bg-elevated, #1A1A22)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default, rgba(255, 255, 255, 0.08))',
                }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    background: viewMode === 'grid' ? hub.color : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={viewMode === 'grid' ? 'white' : 'var(--text-muted)'} strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('stack')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    background: viewMode === 'stack' ? hub.color : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={viewMode === 'stack' ? 'white' : 'var(--text-muted)'} strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Tag Pills Navigation - Horizontal scroll with fade indicators */}
          {hubTagSlugs.length > 0 && (
            <div
              ref={tagPillsContainerRef}
              className={`tag-pills-scroll-container${tagPillsAtEnd ? ' scrolled-end' : ''}`}
              style={{
                position: 'relative',
              }}
            >
              {/* Fade indicator - right (shows when scrollable and not at end) */}
              <div
                className="scroll-fade-right"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '50px',
                  background: 'linear-gradient(-90deg, var(--bg-page, #0D0D12) 20%, transparent)',
                  pointerEvents: 'none',
                  zIndex: 2,
                  opacity: tagPillsAtEnd ? 0 : 1,
                  transition: 'opacity 0.2s ease',
                }}
              />
              <div
                ref={tagPillsRef}
                className="tag-pills-scroll"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  marginBottom: '-4px',
                  paddingRight: '40px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
              {/* All pill */}
              <button
                onClick={() => setInternalSelectedTags([])}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: internalSelectedTags.length === 0 ? hub.color : 'var(--bg-elevated, #1A1A22)',
                  color: internalSelectedTags.length === 0 ? 'white' : 'var(--text-secondary)',
                  boxShadow: internalSelectedTags.length === 0 ? `0 2px 8px ${hub.color}40` : 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                All
              </button>

              {/* Tag pills */}
              {hubTagsFromAPI?.map(tag => {
                const isActive = isTagActive(tag.slug) && internalSelectedTags.length > 0;
                const count = assetCountByTag[tag.slug] || 0;
                return (
                  <button
                    key={tag.slug}
                    onClick={() => toggleTag(tag.slug)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: isActive ? hub.color : 'var(--bg-elevated, #1A1A22)',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      boxShadow: isActive ? `0 2px 8px ${hub.color}40` : 'none',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {hubTagDisplayMap[tag.slug]}
                    {count > 0 && (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                          color: isActive ? 'white' : 'var(--text-muted)',
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content padding after header */}
      <div style={{ paddingTop: isHeaderFixed ? '20px' : '20px' }}></div>

      {/* Recently Added Carousel - Horizontal scrolling section */}
      {showRecentlyAdded && recentlyAddedAssets.length > 0 && internalSelectedTags.length === 0 && (
        <section
          className="recently-added-section"
          style={{
            marginBottom: '32px',
            background: 'var(--bg-surface, #14141A)',
            borderRadius: '16px',
            border: `1px solid ${hub.color}25`,
            overflow: 'hidden',
          }}
        >
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: `1px solid ${hub.color}15`,
              background: `linear-gradient(90deg, ${hub.color}10, transparent)`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: `${hub.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={hub.color} strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Recently Added
                </h2>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Last 14 days
                </span>
              </div>
            </div>

            {/* Carousel Navigation */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => scrollCarousel('left')}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default, rgba(255, 255, 255, 0.08))',
                  background: 'var(--bg-elevated, #1A1A22)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  color: 'var(--text-muted)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = hub.color;
                  e.currentTarget.style.borderColor = hub.color;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-elevated, #1A1A22)';
                  e.currentTarget.style.borderColor = 'var(--border-default, rgba(255, 255, 255, 0.08))';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default, rgba(255, 255, 255, 0.08))',
                  background: 'var(--bg-elevated, #1A1A22)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  color: 'var(--text-muted)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = hub.color;
                  e.currentTarget.style.borderColor = hub.color;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-elevated, #1A1A22)';
                  e.currentTarget.style.borderColor = 'var(--border-default, rgba(255, 255, 255, 0.08))';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Carousel Track - Properly contained */}
          <div
            ref={carouselRef}
            className="recently-added-carousel"
            style={{
              display: 'flex',
              gap: '16px',
              padding: '20px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {recentlyAddedAssets.map(asset => (
              <div
                key={asset.id}
                style={{
                  flex: '0 0 280px',
                  width: '280px',
                  scrollSnapAlign: 'start',
                }}
              >
                <AssetCard
                  {...asset}
                />
              </div>
            ))}
          </div>
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
            const stepNumber = getWorkflowStepNumber(slug);

            return (
              <section key={slug} style={{ marginBottom: '48px' }}>
                {/* Section Separator */}
                {hasPreviousSections && (
                  <div
                    style={{
                      height: '1px',
                      background: 'linear-gradient(90deg, var(--border-default, rgba(255, 255, 255, 0.08)), transparent 80%)',
                      marginBottom: '32px',
                    }}
                  />
                )}

                {/* Enhanced Section Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '20px',
                    padding: '12px 16px',
                    background: 'var(--bg-surface, #14141A)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.04))',
                  }}
                >
                  {/* Workflow step indicator or colored bar */}
                  {stepNumber !== null ? (
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: `${hub.color}20`,
                        border: `1px solid ${hub.color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: hub.color,
                        flexShrink: 0,
                      }}
                    >
                      {stepNumber}
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '4px',
                        height: '32px',
                        borderRadius: '2px',
                        background: hub.color,
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                      {hubTagDisplayMap[slug]}
                    </h3>
                  </div>

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: 'var(--bg-elevated, rgba(255, 255, 255, 0.04))',
                      color: 'var(--text-muted)',
                      flexShrink: 0,
                    }}
                  >
                    {tagAssets.length} items
                  </span>
                </div>
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
                              background: 'var(--card-bg)',
                              border: '1px solid var(--card-border)',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--hover-bg)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--card-bg)';
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
                              background: 'var(--card-bg)',
                              border: '1px solid var(--card-border)',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--hover-bg)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--card-bg)';
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
              <section style={{ marginBottom: '48px' }}>
                {/* Section Separator */}
                {hasPreviousSections && (
                  <div
                    style={{
                      height: '1px',
                      background: 'linear-gradient(90deg, var(--border-default, rgba(255, 255, 255, 0.08)), transparent 80%)',
                      marginBottom: '32px',
                    }}
                  />
                )}

                {/* Enhanced Section Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '20px',
                    padding: '12px 16px',
                    background: 'var(--bg-surface, #14141A)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.04))',
                  }}
                >
                  <div
                    style={{
                      width: '4px',
                      height: '32px',
                      borderRadius: '2px',
                      background: 'var(--text-muted)',
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                      Other
                    </h3>
                  </div>

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: 'var(--bg-elevated, rgba(255, 255, 255, 0.04))',
                      color: 'var(--text-muted)',
                      flexShrink: 0,
                    }}
                  >
                    {untaggedAssets.length} items
                  </span>
                </div>
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
                              background: 'var(--card-bg)',
                              border: '1px solid var(--card-border)',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--hover-bg)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--card-bg)';
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
                              background: 'var(--card-bg)',
                              border: '1px solid var(--card-border)',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--hover-bg)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--card-bg)';
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
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <svg
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: 'var(--text-muted)' }}
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
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            No {hub.name.toLowerCase()} resources yet
          </h3>
          <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
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
