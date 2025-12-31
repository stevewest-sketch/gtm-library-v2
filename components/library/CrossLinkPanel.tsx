'use client';

import Link from 'next/link';
import { useState } from 'react';

interface CrossLinkAsset {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  format: string;
  type: string | null;
  hub: string;
}

interface CrossLinkPanelProps {
  title: string;
  icon: string;
  assets: CrossLinkAsset[];
  accentColor?: string;
  emptyMessage?: string;
  maxVisible?: number;
}

// Format icon mapping (simplified)
const FORMAT_ICONS: Record<string, string> = {
  slides: '📊',
  video: '🎬',
  document: '📄',
  link: '🔗',
  template: '📋',
  tool: '🛠️',
  default: '📁',
};

export function CrossLinkPanel({
  title,
  icon,
  assets,
  accentColor = 'var(--text-primary)',
  maxVisible = 4,
}: CrossLinkPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render if no assets (per user preference: hide empty panels)
  if (assets.length === 0) {
    return null;
  }

  const visibleAssets = isExpanded ? assets : assets.slice(0, maxVisible);
  const hasMore = assets.length > maxVisible;

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '16px',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--card-border)',
          background: 'var(--hover-bg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>{icon}</span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '10px',
              background: accentColor,
              color: 'white',
            }}
          >
            {assets.length}
          </span>
        </div>
      </div>

      {/* Asset List */}
      <div style={{ padding: '8px 0' }}>
        {visibleAssets.map((asset) => (
          <Link
            key={asset.id}
            href={`/asset/${asset.slug}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 18px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {/* Format Icon */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--hover-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0,
              }}
            >
              {FORMAT_ICONS[asset.format?.toLowerCase()] || FORMAT_ICONS.default}
            </div>

            {/* Asset Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {asset.title}
              </div>
              {asset.shortDescription && (
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginTop: '2px',
                  }}
                >
                  {asset.shortDescription}
                </div>
              )}
            </div>

            {/* Type Badge */}
            {asset.type && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'var(--hover-bg)',
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                {asset.type}
              </span>
            )}

            {/* Arrow */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <div style={{ borderTop: '1px solid var(--card-border)' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {isExpanded ? (
              <>
                Show less
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </>
            ) : (
              <>
                Show {assets.length - maxVisible} more
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
