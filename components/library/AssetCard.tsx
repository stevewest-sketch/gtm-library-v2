'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getFormatConfig, getTypeBadge, getHubColors, getTypeHeaderColors } from '@/lib/card-config';
import { ALL_TYPES } from '@/lib/taxonomy';

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

// Get type icon from taxonomy
function getTypeIcon(type: string | undefined): string {
  if (!type) return '📄';
  const normalizedType = type.toLowerCase().replace(/\s+/g, '-');
  const typeConfig = ALL_TYPES[normalizedType as keyof typeof ALL_TYPES];
  return typeConfig?.icon || '📄';
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
  const formatConfig = getFormatConfig(format);
  const typeBadge = type ? getTypeBadge(type) : null;
  const headerColors = getTypeHeaderColors(typeBadge);
  const typeIcon = getTypeIcon(type);

  const assetUrl = href || `/asset/${slug}`;
  const isVideo = format.toLowerCase() === 'video' || format.toLowerCase() === 'live-replay' || format.toLowerCase() === 'on-demand';
  const formattedDate = formatDate(publishDate);

  return (
    <Link
      href={assetUrl}
      className="block no-underline"
      style={{
        height: '200px',
        minHeight: '200px',
        maxHeight: '200px',
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
      {/* Tinted Header with Icon Box */}
      <div
        style={{
          padding: '14px 18px',
          background: headerColors.headerBg,
          borderBottom: `1px solid ${headerColors.headerBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        {/* Icon Box + Type Label */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 600,
            color: headerColors.badgeText,
          }}
        >
          {/* White Icon Box */}
          <span
            style={{
              width: '24px',
              height: '24px',
              background: 'white',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            {typeIcon}
          </span>
          {typeBadge?.label || 'Resource'}
        </span>

        {/* Format Label in white pill */}
        <span
          style={{
            fontSize: '11px',
            color: '#64748B',
            background: 'white',
            padding: '4px 10px',
            borderRadius: '12px',
          }}
        >
          {formatConfig.label}
        </span>
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
        {/* Title - 15px, 2 lines max */}
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
  const formatConfig = getFormatConfig(format);
  const typeBadge = type ? getTypeBadge(type) : null;
  const headerColors = getTypeHeaderColors(typeBadge);
  const typeIcon = getTypeIcon(type);

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
      {/* Left: Tinted type indicator strip */}
      <div
        style={{
          width: '130px',
          flexShrink: 0,
          padding: '12px 14px',
          background: isHovered ? headerColors.headerBg : `linear-gradient(135deg, ${typeBadge?.bg || '#F1F5F9'}40 0%, ${typeBadge?.bg || '#F8FAFC'}20 100%)`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderRight: '1px solid #E2E8F0',
          transition: 'background 0.15s ease',
        }}
      >
        <span
          style={{
            width: '28px',
            height: '28px',
            background: 'white',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            flexShrink: 0,
          }}
        >
          {typeIcon}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: headerColors.badgeText,
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            lineHeight: 1.2,
          }}
        >
          {typeBadge?.label || 'Resource'}
        </span>
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

      {/* Right: Format + Date + Action */}
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
        {/* Format */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#475569',
          }}
        >
          {formatConfig.icon(18)}
          <span style={{ fontSize: '12px', fontWeight: 500 }}>
            {formatConfig.label}
          </span>
        </div>

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
  const formatConfig = getFormatConfig(format);
  const typeBadge = type ? getTypeBadge(type) : null;
  const headerColors = getTypeHeaderColors(typeBadge);
  const typeIcon = getTypeIcon(type);

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
      {/* Large Tinted Header */}
      <div
        style={{
          padding: '24px',
          background: headerColors.headerBg,
          borderBottom: `1px solid ${headerColors.headerBorder}`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Icon Box + Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              width: '40px',
              height: '40px',
              background: 'white',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            {typeIcon}
          </span>
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: headerColors.badgeText,
              }}
            >
              {typeBadge?.label || 'Resource'}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: headerColors.badgeText,
                opacity: 0.7,
                marginTop: '2px',
              }}
            >
              {formatConfig.label}
            </div>
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
  const formatConfig = getFormatConfig(format);
  const typeBadge = type ? getTypeBadge(type) : null;

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
