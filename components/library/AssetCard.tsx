'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getFormatConfig, getTypeBadge, getHubColors, getTypeHeaderColors } from '@/lib/card-config';
import { ALL_TYPES } from '@/lib/taxonomy';
import { useTaxonomy } from '@/lib/taxonomy-context';

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

// Hook to get type badge with database fallback
function useTypeBadgeWithDb(type: string | undefined) {
  const { types } = useTaxonomy();

  if (!type) return null;

  const normalizedType = type.toLowerCase().replace(/\s+/g, '-');

  // Check database types first
  if (types[normalizedType]) {
    return types[normalizedType];
  }

  // Fall back to static config
  return getTypeBadge(type);
}

// Hook to get type icon - checks database first, then static config
function useTypeIcon(type: string | undefined): string {
  const { types } = useTaxonomy();

  if (!type) return '📄';

  const normalizedType = type.toLowerCase().replace(/\s+/g, '-');

  // Check database types first for icon
  if (types[normalizedType]?.icon) {
    return types[normalizedType].icon;
  }

  // Fall back to static taxonomy config
  const typeConfig = ALL_TYPES[normalizedType as keyof typeof ALL_TYPES];
  return typeConfig?.icon || '📄';
}

// Hook to get format config with database fallback
function useFormatConfigWithDb(format: string) {
  const { formats } = useTaxonomy();

  const normalizedFormat = format.toLowerCase().replace(/\s+/g, '-');

  // Check database formats first
  if (formats[normalizedFormat]) {
    const dbFormat = formats[normalizedFormat];
    // Return in the same format as getFormatConfig
    const staticConfig = getFormatConfig(dbFormat.iconType || format);
    return {
      ...staticConfig,
      label: dbFormat.label,
      color: dbFormat.color,
    };
  }

  // Fall back to static config
  return getFormatConfig(format);
}

// Format date for display
function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
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
  const [isHovered, setIsHovered] = useState(false);
  const hubColors = getHubColors(hub);
  const formatConfig = useFormatConfigWithDb(format);
  const typeBadge = useTypeBadgeWithDb(type);
  const headerColors = getTypeHeaderColors(typeBadge);
  const typeIcon = useTypeIcon(type);

  const assetUrl = href || `/asset/${slug}`;
  const isVideo = format.toLowerCase() === 'video' || format.toLowerCase() === 'live-replay' || format.toLowerCase() === 'on-demand';
  const formattedDate = formatDate(publishDate);

  return (
    <Link
      href={assetUrl}
      className="block no-underline"
      style={{
        height: '220px',
        minHeight: '220px',
        maxHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        textDecoration: 'none',
        color: 'inherit',
        boxShadow: isHovered ? '0 8px 24px rgba(0, 0, 0, 0.1)' : 'none',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Version D Header: Emoji + Stacked Type/Format */}
      <div
        style={{
          padding: '14px 18px',
          background: headerColors.headerBg,
          borderBottom: `1px solid ${headerColors.headerBorder}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        {/* Emoji - Slightly Smaller */}
        <span
          style={{
            fontSize: '20px',
            lineHeight: 1,
          }}
        >
          {typeIcon}
        </span>
        {/* Stacked Type + Format - Slightly Larger */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: headerColors.badgeText,
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
            }}
          >
            {typeBadge?.label || 'Resource'}
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: headerColors.badgeText,
              opacity: 0.7,
            }}
          >
            {formatConfig.label}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: '14px 18px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Title container - fixed height, flex to align title to bottom */}
        <div
          style={{
            minHeight: '42px', // 15px * 1.4 line-height * 2 lines = 42px
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <h4
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#0F172A',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              margin: 0,
            }}
          >
            {title}
          </h4>
        </div>

        {/* Short Description - 13px, 1 line */}
        {shortDescription && (
          <p
            style={{
              fontSize: '13px',
              color: '#64748B',
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

      {/* Card Footer - Date left, CTA right, always visible */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          flexShrink: 0,
          marginTop: 'auto',
          borderTop: '1px solid #E2E8F0',
        }}
      >
        {/* Date */}
        <span
          style={{
            fontSize: '13px',
            color: '#64748B',
          }}
        >
          {formattedDate}
        </span>

        {/* Action Button - Always visible */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            fontWeight: 600,
            color: typeBadge?.color || hubColors.primary,
          }}
        >
          {isVideo ? 'Watch' : 'View'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

// ============================================
// COMPACT CARD COMPONENT (Dense List View)
// ============================================

interface CompactCardProps {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  hub: string;
  format: string;
  type?: string;
  publishDate?: string;
  href?: string;
}

export function CompactCard({
  slug,
  title,
  shortDescription,
  hub,
  format,
  type,
  publishDate,
  href,
}: CompactCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hubColors = getHubColors(hub);
  const formatConfig = useFormatConfigWithDb(format);
  const typeBadge = useTypeBadgeWithDb(type);
  const headerColors = getTypeHeaderColors(typeBadge);
  const typeIcon = useTypeIcon(type);

  const assetUrl = href || `/asset/${slug}`;
  const isVideo = format.toLowerCase() === 'video' || format.toLowerCase() === 'live-replay' || format.toLowerCase() === 'on-demand';
  const formattedDate = formatDate(publishDate);

  return (
    <Link
      href={assetUrl}
      className="block no-underline"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        textDecoration: 'none',
        color: 'inherit',
        boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left: Version D type indicator panel - Emoji + Stacked Type/Format */}
      <div
        style={{
          width: '140px',
          flexShrink: 0,
          padding: '14px 16px',
          background: headerColors.headerBg,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderRight: `1px solid ${headerColors.headerBorder}`,
          transition: 'all 0.15s ease',
        }}
      >
        {/* Emoji - Slightly Smaller */}
        <span
          style={{
            fontSize: '18px',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {typeIcon}
        </span>
        {/* Stacked Type + Format - Slightly Larger */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: headerColors.badgeText,
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
              lineHeight: 1.3,
            }}
          >
            {typeBadge?.label || 'Resource'}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: headerColors.badgeText,
              opacity: 0.7,
            }}
          >
            {formatConfig.label}
          </span>
        </div>
      </div>

      {/* Center: Title + Description */}
      <div
        style={{
          flex: 1,
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minWidth: 0,
          background: isHovered ? '#FAFBFC' : 'transparent',
          transition: 'background 0.15s ease',
        }}
      >
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#0F172A',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </span>
        {shortDescription && (
          <span
            style={{
              fontSize: '12px',
              color: '#64748B',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginTop: '2px',
            }}
          >
            {shortDescription}
          </span>
        )}
      </div>

      {/* Right: Date + Action (format moved to left panel) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 16px',
          flexShrink: 0,
          borderLeft: '1px solid #F1F5F9',
        }}
      >
        {/* Date */}
        {formattedDate && (
          <span style={{ fontSize: '12px', color: '#64748B', minWidth: '90px' }}>
            {formattedDate}
          </span>
        )}

        {/* Action */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            fontWeight: 600,
            color: typeBadge?.color || hubColors.primary,
            opacity: isHovered ? 1 : 0.4,
            transition: 'opacity 0.15s ease',
            minWidth: '60px',
          }}
        >
          {isVideo ? 'Watch' : 'View'}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

// ============================================
// HERO CARD COMPONENT (Featured/Highlighted)
// ============================================

interface HeroCardProps {
  id: string;
  slug: string;
  title: string;
  description?: string;
  shortDescription?: string;
  hub: string;
  format: string;
  type?: string;
  publishDate?: string;
  href?: string;
}

export function HeroCard({
  slug,
  title,
  shortDescription,
  hub,
  format,
  type,
  publishDate,
  href,
}: HeroCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hubColors = getHubColors(hub);
  const formatConfig = useFormatConfigWithDb(format);
  const typeBadge = useTypeBadgeWithDb(type);
  const headerColors = getTypeHeaderColors(typeBadge);
  const typeIcon = useTypeIcon(type);

  const assetUrl = href || `/asset/${slug}`;
  const isVideo = format.toLowerCase() === 'video' || format.toLowerCase() === 'live-replay' || format.toLowerCase() === 'on-demand';
  const formattedDate = formatDate(publishDate);

  return (
    <Link
      href={assetUrl}
      className="block no-underline"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        textDecoration: 'none',
        color: 'inherit',
        boxShadow: isHovered ? '0 12px 32px rgba(0, 0, 0, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Version D Header: Emoji + Stacked Type/Format */}
      <div
        style={{
          padding: '20px 24px',
          background: headerColors.headerBg,
          borderBottom: `1px solid ${headerColors.headerBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Emoji + Stacked Type/Format */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Emoji - Slightly Smaller */}
          <span
            style={{
              fontSize: '28px',
              lineHeight: 1,
            }}
          >
            {typeIcon}
          </span>
          {/* Stacked Type + Format - Slightly Larger */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: headerColors.badgeText,
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
              }}
            >
              {typeBadge?.label || 'Resource'}
            </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: headerColors.badgeText,
                opacity: 0.7,
              }}
            >
              {formatConfig.label}
            </span>
          </div>
        </div>

        {/* Featured Badge */}
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: headerColors.badgeText,
            background: 'rgba(255,255,255,0.6)',
            padding: '4px 10px',
            borderRadius: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Featured
        </span>
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: '20px 24px',
          flex: 1,
        }}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#0F172A',
            lineHeight: 1.4,
            margin: 0,
            marginBottom: shortDescription ? '8px' : 0,
          }}
        >
          {title}
        </h3>
        {shortDescription && (
          <p
            style={{
              fontSize: '14px',
              color: '#64748B',
              lineHeight: 1.5,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {shortDescription}
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderTop: '1px solid #E2E8F0',
        }}
      >
        <span style={{ fontSize: '13px', color: '#64748B' }}>
          {formattedDate}
        </span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: 600,
            color: typeBadge?.color || hubColors.primary,
          }}
        >
          {isVideo ? 'Watch' : 'View'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

// ============================================
// LIST ITEM COMPONENT (Legacy Stack View)
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
  const formatConfig = useFormatConfigWithDb(format);
  const typeBadge = useTypeBadgeWithDb(type);

  const assetUrl = href || `/asset/${slug}`;

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
      {/* Type Badge */}
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

      {/* Title */}
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
        {/* Format Pill */}
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

        {/* Action */}
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
