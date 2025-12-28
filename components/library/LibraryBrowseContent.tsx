'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BoardButton } from './BoardButton';
import { AssetCard } from './AssetCard';
import { HUBS, type HubId } from '@/lib/constants/hubs';

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

interface Board {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  lightColor: string;
  accentColor: string;
  count: number;
}

interface LibraryBrowseContentProps {
  assets: Asset[];
  boards: Board[];
  totalItems: number;
}

type SortOption = 'newest' | 'name';

// Hub color configurations for stack view
const HUB_STYLES: Record<string, { primary: string; light: string; accent: string }> = {
  coe: { primary: '#F59E0B', light: '#FEF3C7', accent: '#B45309' },
  content: { primary: '#8C69F0', light: '#EDE9FE', accent: '#6D28D9' },
  enablement: { primary: '#10B981', light: '#D1FAE5', accent: '#047857' },
};

// Format labels for stack view
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

export function LibraryBrowseContent({
  assets,
  boards,
  totalItems,
}: LibraryBrowseContentProps) {
  const [showAllBoards, setShowAllBoards] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'stack'>('grid');

  const visibleBoards = showAllBoards ? boards : boards.slice(0, 10);

  // Sort assets based on selected option
  const sortedAssets = [...assets].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return 0; // Keep original order for 'newest'
    }
  });

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

  return (
    <>
      {/* Browse Header - 28px margin per v7 */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Browse Library
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Explore all resources across {boards.length} boards with {totalItems} total items.
        </p>
      </div>

      {/* Boards Section - Dock-style Grid - 28px margin per v7 */}
      <div style={{ marginBottom: '28px' }}>
        <h2
          className="uppercase tracking-wider"
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            color: '#9CA3AF',
            marginBottom: '14px',
          }}
        >
          Boards
        </h2>
        {/* 5-column grid with responsive breakpoints: 5 -> 4 -> 3 -> 2 columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {visibleBoards.map((board) => (
            <BoardButton
              key={board.id}
              id={board.id}
              slug={board.slug}
              name={board.name}
              icon={board.icon}
              color={board.color}
              lightColor={board.lightColor}
              count={board.count}
            />
          ))}
        </div>
        {boards.length > 10 && (
          <button
            onClick={() => setShowAllBoards(!showAllBoards)}
            className="mt-4 mx-auto flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 hover:bg-gray-50"
            style={{
              backgroundColor: 'white',
              borderColor: 'var(--card-border)',
              color: 'var(--text-secondary)',
            }}
          >
            {showAllBoards ? 'Show less' : `+${boards.length - 10} more`}
            <svg
              className={`w-4 h-4 transition-transform ${showAllBoards ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Files Section */}
      <div>
        {/* Files Header with Sort and View Toggle - matching board page style */}
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <h2
            className="uppercase tracking-wider"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              color: '#9CA3AF',
            }}
          >
            Files
          </h2>
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

        {/* Asset Grid or Stack */}
        {sortedAssets.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="card-grid">
              {sortedAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  {...asset}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: '8px' }}>
              {sortedAssets.map((asset) => (
                <StackRow key={asset.id} asset={asset} />
              ))}
            </div>
          )
        ) : (
          <div
            className="rounded-xl p-10 text-center"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
            <svg
              className="w-12 h-12 mx-auto mb-3"
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
            <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
              Resources will appear here once content is added to the library.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
