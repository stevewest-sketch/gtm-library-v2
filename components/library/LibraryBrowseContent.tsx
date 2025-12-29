'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BoardButton } from './BoardButton';
import { AssetCard } from './AssetCard';
import { getTypeConfig, getHubColor, getFormatLabel } from '@/lib/type-config';

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

  // Stack view row component - v3 design with TYPE badge
  const StackRow = ({ asset }: { asset: Asset }) => {
    const hubColor = getHubColor(asset.hub);
    const typeConfig = getTypeConfig(asset.type);
    const formatLabel = getFormatLabel(asset.format);

    return (
      <Link
        href={`/library/asset/${asset.slug}`}
        className="flex items-center bg-white border rounded-lg transition-all hover:shadow-md group"
        style={{
          borderColor: 'var(--card-border)',
          padding: '18px 24px',
          borderLeft: `4px solid ${hubColor}`,
          gap: '16px',
        }}
      >
        {/* Type Badge with Icon */}
        <span
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wide"
          style={{
            padding: '5px 10px',
            backgroundColor: typeConfig.bg,
            color: typeConfig.color,
            whiteSpace: 'nowrap',
          }}
        >
          <span className="text-xs">{typeConfig.icon}</span>
          {typeConfig.label}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            className="font-semibold line-clamp-1"
            style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}
          >
            {asset.title}
          </h4>
          {asset.description && (
            <p
              className="line-clamp-1"
              style={{ fontSize: '13px', color: 'var(--text-secondary)' }}
            >
              {asset.description}
            </p>
          )}
        </div>

        {/* Format Label - Plain gray text, NO icon */}
        <span
          className="flex-shrink-0"
          style={{ fontSize: '13px', fontWeight: 500, color: '#9CA3AF' }}
        >
          {formatLabel}
        </span>

        {/* View Action - appears on hover */}
        <span
          className="flex-shrink-0 text-[13px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: hubColor }}
        >
          View →
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
