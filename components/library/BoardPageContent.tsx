'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AssetCard } from './AssetCard';
import type { BoardId } from '@/lib/constants/hubs';
import { BOARDS, HUBS, type HubId } from '@/lib/constants/hubs';

interface Asset {
  id: string;
  slug: string;
  title: string;
  description?: string;
  hub: string;
  format: string;
  tags: string[];
  views?: number;
  shares?: number;
  durationMinutes?: number;
}

type SortOption = 'newest' | 'name';

// Hub color configurations for stack view
const HUB_STYLES: Record<string, { primary: string; light: string; accent: string }> = {
  coe: { primary: '#F59E0B', light: '#FEF3C7', accent: '#B45309' },
  content: { primary: '#8C69F0', light: '#EDE9FE', accent: '#6D28D9' },
  enablement: { primary: '#10B981', light: '#D1FAE5', accent: '#047857' },
};

// Format icons for stack view
const FORMAT_LABELS: Record<string, string> = {
  slides: 'Slides',
  video: 'Video',
  document: 'Document',
  pdf: 'PDF',
  sheet: 'Sheet',
  tool: 'Tool',
  link: 'Link',
  training: 'Training',
  battlecard: 'Battlecard',
  template: 'Template',
  guide: 'Guide',
  report: 'Report',
  'figma prototype': 'Figma Prototype',
  'one pager': 'One Pager',
};

interface TagData {
  id: string;
  name: string;
  slug: string;
}

interface BoardPageContentProps {
  boardId: BoardId;
  assets: Asset[];
  selectedTags: string[];
  boardTags?: TagData[];
}

export function BoardPageContent({
  boardId,
  assets,
  selectedTags,
  boardTags: boardTagsFromAPI,
}: BoardPageContentProps) {
  const board = BOARDS[boardId];
  // Use API tags if available, otherwise fall back to static tags
  const boardTags = boardTagsFromAPI?.map(t => t.name) || board.tags;

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'stack'>('grid');

  // Use all board tags if selectedTags is empty (default state)
  const effectiveSelectedTags = selectedTags.length > 0 ? selectedTags : [...boardTags];

  // Group assets by their tags that match board tags
  const assetsByTag = useMemo(() => {
    const grouped: Record<string, Asset[]> = {};

    // Initialize all board tags with empty arrays
    boardTags.forEach(tag => {
      grouped[tag] = [];
    });

    // Group assets by their tags
    assets.forEach(asset => {
      asset.tags.forEach(assetTag => {
        // Check if this asset tag matches any board tag (case-insensitive)
        const matchingBoardTag = boardTags.find(
          bt => bt.toLowerCase() === assetTag.toLowerCase()
        );
        if (matchingBoardTag && grouped[matchingBoardTag]) {
          // Avoid duplicates
          if (!grouped[matchingBoardTag].some(a => a.id === asset.id)) {
            grouped[matchingBoardTag].push(asset);
          }
        }
      });
    });

    return grouped;
  }, [assets, boardTags]);

  // Sort assets based on dropdown selection
  const sortAssets = (assetsToSort: Asset[]): Asset[] => {
    return [...assetsToSort].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0; // Keep original order for 'newest'
      }
    });
  };

  // Stack view row component
  const StackRow = ({ asset }: { asset: Asset }) => {
    const hubStyle = HUB_STYLES[asset.hub.toLowerCase()] || HUB_STYLES.content;
    const hubData = HUBS[asset.hub.toLowerCase() as HubId];
    const hubLabel = hubData?.shortName || asset.hub.toUpperCase();
    const formatLabel = FORMAT_LABELS[asset.format.toLowerCase()] || asset.format.toUpperCase();

    return (
      <Link
        href={`/library/asset/${asset.slug}`}
        className="flex items-center bg-white border rounded-lg transition-all hover:shadow-md group"
        style={{
          borderColor: 'var(--card-border)',
          padding: '16px 20px',
          borderLeft: `4px solid ${hubStyle.primary}`,
        }}
      >
        {/* Icon placeholder */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-4"
          style={{ backgroundColor: '#F9FAFB' }}
        >
          <svg className="w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            className="font-semibold truncate"
            style={{ fontSize: '14px', color: 'var(--text-primary)' }}
          >
            {asset.title}
          </h4>
          {asset.description && (
            <p
              className="truncate mt-0.5"
              style={{ fontSize: '13px', color: 'var(--text-secondary)' }}
            >
              {asset.description}
            </p>
          )}
        </div>

        {/* Hub Badge */}
        <span
          className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider rounded ml-4"
          style={{
            padding: '4px 10px',
            backgroundColor: hubStyle.light,
            color: hubStyle.accent,
          }}
        >
          {hubLabel}
        </span>

        {/* Format */}
        <span
          className="flex-shrink-0 flex items-center gap-1.5 ml-4"
          style={{ fontSize: '12px', color: 'var(--text-muted)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          {formatLabel}
        </span>
      </Link>
    );
  };

  // Get visible sections based on selected tags
  const visibleTags = boardTags.filter(tag => effectiveSelectedTags.includes(tag));

  // Check if any section has assets
  const hasAnyAssets = assets.length > 0;

  return (
    <>
      {/* Board Header with Controls */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: '28px' }}
      >
        {/* Left: Board Title */}
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: board.color }}
          />
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {board.name}
          </h1>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-muted)' }}
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
              padding: '7px 32px 7px 12px',
              border: '1px solid var(--card-border)',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'inherit',
              background: "var(--card-bg) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\") no-repeat right 10px center",
              cursor: 'pointer',
              appearance: 'none',
            }}
          >
            <option value="newest">Newest</option>
            <option value="name">A-Z</option>
          </select>

          {/* View Toggle Buttons */}
          <div
            className="flex"
            style={{
              border: '1px solid var(--card-border)',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            {/* Grid View Button */}
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '7px 10px',
                background: viewMode === 'grid' ? 'var(--bg-page)' : 'var(--card-bg)',
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
                stroke={viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)'}
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>

            {/* Stack View Button */}
            <button
              onClick={() => setViewMode('stack')}
              style={{
                padding: '7px 10px',
                background: viewMode === 'stack' ? 'var(--bg-page)' : 'var(--card-bg)',
                border: 'none',
                borderLeft: '1px solid var(--card-border)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Stack view"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={viewMode === 'stack' ? 'var(--text-primary)' : 'var(--text-muted)'}
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

      {/* Tag-based Sections - Dynamic visibility based on selected filters */}
      {hasAnyAssets ? (
        <>
          {visibleTags.map((tag, index) => {
            const tagAssets = sortAssets(assetsByTag[tag] || []);

            // Only render section if it has assets
            if (tagAssets.length === 0) return null;

            const isFirstSection = index === 0 || visibleTags.slice(0, index).every(t => (assetsByTag[t] || []).length === 0);

            return (
              <section key={tag} style={{ marginBottom: '32px' }}>
                {/* Divider line before section (except first) */}
                {!isFirstSection && (
                  <div
                    style={{
                      borderTop: '1px solid var(--card-border)',
                      marginBottom: '24px',
                    }}
                  />
                )}
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '16px',
                  }}
                >
                  {tag}
                </h3>
                {viewMode === 'grid' ? (
                  <div className="card-grid">
                    {tagAssets.map(asset => (
                      <AssetCard
                        key={asset.id}
                        {...asset}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col" style={{ gap: '8px' }}>
                    {tagAssets.map(asset => (
                      <StackRow key={asset.id} asset={asset} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}

          {/* Assets without matching tags - show in "Other" section */}
          {(() => {
            const untaggedAssets = assets.filter(asset => {
              const hasMatchingTag = asset.tags.some(assetTag =>
                boardTags.some(bt => bt.toLowerCase() === assetTag.toLowerCase())
              );
              return !hasMatchingTag;
            });

            if (untaggedAssets.length === 0) return null;

            // Check if there are any previous sections with content
            const hasPreviousSections = visibleTags.some(t => (assetsByTag[t] || []).length > 0);

            return (
              <section style={{ marginBottom: '32px' }}>
                {/* Divider line before section (if there are previous sections) */}
                {hasPreviousSections && (
                  <div
                    style={{
                      borderTop: '1px solid var(--card-border)',
                      marginBottom: '24px',
                    }}
                  />
                )}
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '16px',
                  }}
                >
                  Other
                </h3>
                {viewMode === 'grid' ? (
                  <div className="card-grid">
                    {sortAssets(untaggedAssets).map(asset => (
                      <AssetCard
                        key={asset.id}
                        {...asset}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col" style={{ gap: '8px' }}>
                    {sortAssets(untaggedAssets).map(asset => (
                      <StackRow key={asset.id} asset={asset} />
                    ))}
                  </div>
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
            No {board.name.toLowerCase()} resources yet
          </h3>
          <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Resources tagged with {board.name} will appear here.
            Use the filters to narrow down your search.
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
