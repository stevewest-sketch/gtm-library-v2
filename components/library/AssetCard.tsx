'use client';

import Link from 'next/link';
import { getFormatConfig, getTypeBadge, getHubColors } from '@/lib/card-config';

interface AssetCardProps {
  id: string;
  slug: string;
  title: string;
  description?: string;
  shortDescription?: string;
  hub: string;
  format: string;
  type?: string;
  tags?: string[];
  views?: number;
  shares?: number;
  durationMinutes?: number;
  publishDate?: string;
  href?: string;
}

export function AssetCard({
  slug,
  title,
  shortDescription,
  hub,
  format,
  type,
  publishDate,
  href,
}: AssetCardProps) {
  const hubColors = getHubColors(hub);
  const formatConfig = getFormatConfig(format);
  const typeBadge = type ? getTypeBadge(type) : null;

  const assetUrl = href || `/library/asset/${slug}`;
  const isVideo = format.toLowerCase() === 'video' || format.toLowerCase() === 'live-replay' || format.toLowerCase() === 'on-demand';

  // Format date for display
  const formattedDate = publishDate
    ? new Date(publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <Link
      href={assetUrl}
      className="library-card block no-underline"
      style={{
        height: '220px',
        minHeight: '220px',
        maxHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        border: '1px solid var(--card-border)',
        borderRadius: '14px',
        borderTop: `5px solid ${hubColors.primary}`,
        overflow: 'hidden',
        transition: 'all 0.15s ease',
        cursor: 'pointer',
        textDecoration: 'none',
        color: 'inherit',
      }}
      onMouseEnter={(e) => {
        const card = e.currentTarget;
        card.style.borderColor = hubColors.primary;
        card.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
        card.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        const card = e.currentTarget;
        card.style.borderColor = 'var(--card-border)';
        card.style.borderTopColor = hubColors.primary;
        card.style.boxShadow = 'none';
        card.style.transform = 'translateY(0)';
      }}
    >
      {/* Card Header - Type Badge + Format Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 0',
          flexShrink: 0,
          gap: '12px',
        }}
      >
        {/* Type Badge - 10px (was 12px) */}
        {typeBadge && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
              backgroundColor: typeBadge.bg,
              color: typeBadge.color,
            }}
          >
            {typeBadge.label}
          </span>
        )}

        {/* Format Label - Inline Pill with Icon - 12px (was 14px) */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px 6px 8px',
            background: '#F8FAFC',
            borderRadius: '8px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            marginLeft: typeBadge ? 0 : 'auto',
          }}
        >
          {formatConfig.icon(24)}
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#6B7280',
              whiteSpace: 'nowrap',
            }}
          >
            {formatConfig.label}
          </span>
        </span>
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: '14px 20px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Title - 16px (was 18px), 2 lines max, fixed height */}
        <h4
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#111827',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '6px',
            minHeight: 'calc(16px * 1.35 * 2)',
            maxHeight: 'calc(16px * 1.35 * 2)',
            margin: 0,
          }}
        >
          {title}
        </h4>

        {/* Short Description - 13px (was 15px), 1 line, ellipsis */}
        {shortDescription && (
          <p
            style={{
              fontSize: '13px',
              color: '#6B7280',
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              margin: 0,
              marginTop: '6px',
            }}
          >
            {shortDescription}
          </p>
        )}
      </div>

      {/* Card Footer - Always at bottom */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: '#FAFAFA',
          borderTop: '1px solid var(--card-border)',
          flexShrink: 0,
          marginTop: 'auto',
        }}
      >
        {/* Date - 12px (was 14px) */}
        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
          {formattedDate || 'No date'}
        </span>

        {/* Action Link - 13px (was 15px) */}
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: hubColors.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {isVideo ? 'Watch' : 'View'} →
        </span>
      </div>
    </Link>
  );
}

// ============================================
// LIST ITEM COMPONENT (Stack View)
// ============================================

interface AssetListItemProps {
  id: string;
  slug: string;
  title: string;
  hub: string;
  format: string;
  type?: string;
  href?: string;
}

export function AssetListItem({
  slug,
  title,
  hub,
  format,
  type,
  href,
}: AssetListItemProps) {
  const hubColors = getHubColors(hub);
  const formatConfig = getFormatConfig(format);
  const typeBadge = type ? getTypeBadge(type) : null;

  const assetUrl = href || `/library/asset/${slug}`;

  return (
    <Link
      href={assetUrl}
      className="list-item block no-underline"
      style={{
        background: 'white',
        border: '1px solid var(--card-border)',
        borderLeft: `5px solid ${hubColors.primary}`,
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        textDecoration: 'none',
        color: 'inherit',
      }}
      onMouseEnter={(e) => {
        const item = e.currentTarget;
        item.style.borderColor = hubColors.primary;
        item.style.background = '#FAFBFC';
        item.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        const item = e.currentTarget;
        item.style.borderColor = 'var(--card-border)';
        item.style.borderLeftColor = hubColors.primary;
        item.style.background = 'white';
        item.style.boxShadow = 'none';
      }}
    >
      {/* Type Badge - 9px (was 11px) */}
      {typeBadge && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '9px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            backgroundColor: typeBadge.bg,
            color: typeBadge.color,
          }}
        >
          {typeBadge.label}
        </span>
      )}

      {/* Title - 14px (was 16px) */}
      <span
        style={{
          flex: 1,
          fontSize: '14px',
          fontWeight: 600,
          color: '#111827',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </span>

      {/* Meta Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexShrink: 0,
        }}
      >
        {/* Format Pill - 11px (was 13px) */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px 5px 6px',
            background: '#F8FAFC',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {formatConfig.icon(20)}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#6B7280',
              whiteSpace: 'nowrap',
            }}
          >
            {formatConfig.label}
          </span>
        </span>

        {/* Action - 13px (was 15px) */}
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: hubColors.primary,
          }}
        >
          View →
        </span>
      </div>
    </Link>
  );
}
