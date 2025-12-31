'use client';

import Link from 'next/link';
import { getFormatConfig, getTypeBadge, getHubColors } from '@/lib/card-config';
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
  featured?: boolean;
  isNew?: boolean; // Computed based on publishDate < 7 days
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

// Hub accent colors for hover states (matches CSS variables)
const HUB_ACCENT_COLORS: Record<string, string> = {
  content: '#8C69F0',
  enablement: '#00B800',
  coe: '#F59E0B',
  proof: '#3B82F6',
  competitive: '#EF4444',
  product: '#3B82F6',
  sales: '#0EA5E9',
  csm: '#8B5CF6',
  sc: '#EC4899',
  demo: '#06B6D4',
};

export function AssetCard({
  slug,
  title,
  shortDescription,
  hub,
  format,
  type,
  publishDate,
  href,
  featured,
  isNew,
}: AssetCardProps) {
  const formatConfig = useFormatConfigWithDb(format);
  const typeBadge = useTypeBadgeWithDb(type);

  const assetUrl = href || `/asset/${slug}`;
  const isVideo = format.toLowerCase() === 'video' || format.toLowerCase() === 'live-replay' || format.toLowerCase() === 'on-demand';
  const formattedDate = formatDate(publishDate);

  // Hub class for CSS-based hover styling
  const hubClass = `${hub.toLowerCase()}-hub`;

  return (
    <Link
      href={assetUrl}
      className={`asset-card block no-underline ${hubClass}`}
      data-hub={hub.toLowerCase()}
      style={{
        height: '220px',
        minHeight: '220px',
        maxHeight: '220px',
      }}
    >
      {/* Card Header - Badges Row */}
      <div className="card-header" style={{ flexShrink: 0 }}>
        <div className="card-badges">
          {/* Type Badge */}
          <span
            className="card-badge type"
            style={{ color: typeBadge?.color || undefined }}
          >
            {typeBadge?.label || 'Resource'}
          </span>

          {/* Format Badge */}
          <span className="card-badge format">
            {formatConfig.label}
          </span>

          {/* Status Badges inline */}
          {isNew && <span className="card-badge new">New</span>}
          {featured && <span className="card-badge featured">Featured</span>}
        </div>
      </div>

      {/* Card Body - Title + Description */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <h4 className="card-title" style={{ margin: 0 }}>{title}</h4>
        {shortDescription && (
          <p className="card-description" style={{ margin: 0 }}>{shortDescription}</p>
        )}
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        <span className="card-meta">{formattedDate}</span>
        <span className="card-action">
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
  const formatConfig = useFormatConfigWithDb(format);
  const typeBadge = useTypeBadgeWithDb(type);

  const assetUrl = href || `/asset/${slug}`;
  const isVideo = format.toLowerCase() === 'video' || format.toLowerCase() === 'live-replay' || format.toLowerCase() === 'on-demand';
  const formattedDate = formatDate(publishDate);

  // Hub class for CSS-based hover styling
  const hubClass = `${hub.toLowerCase()}-hub`;

  return (
    <Link
      href={assetUrl}
      className={`compact-card block no-underline ${hubClass}`}
      data-hub={hub.toLowerCase()}
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Left: Badges */}
      <div className="card-badges" style={{ flexShrink: 0, marginRight: '16px' }}>
        <span className="card-badge type" style={{ color: typeBadge?.color || undefined }}>
          {typeBadge?.label || 'Resource'}
        </span>
        <span className="card-badge format">{formatConfig.label}</span>
      </div>

      {/* Center: Title + Description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
          }}
        >
          {title}
        </span>
        {shortDescription && (
          <span
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
              marginTop: '2px',
            }}
          >
            {shortDescription}
          </span>
        )}
      </div>

      {/* Right: Date + Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexShrink: 0,
          marginLeft: '16px',
        }}
      >
        {/* Date */}
        {formattedDate && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '80px' }}>
            {formattedDate}
          </span>
        )}

        {/* Action */}
        <span className="card-action" style={{ minWidth: '60px' }}>
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
  const formatConfig = useFormatConfigWithDb(format);
  const typeBadge = useTypeBadgeWithDb(type);

  const assetUrl = href || `/asset/${slug}`;
  const isVideo = format.toLowerCase() === 'video' || format.toLowerCase() === 'live-replay' || format.toLowerCase() === 'on-demand';
  const formattedDate = formatDate(publishDate);

  // Hub class for CSS-based hover styling
  const hubClass = `${hub.toLowerCase()}-hub`;

  return (
    <Link
      href={assetUrl}
      className={`asset-card block no-underline ${hubClass}`}
      data-hub={hub.toLowerCase()}
      style={{ padding: '24px' }}
    >
      {/* Header: Badges Row */}
      <div className="card-header" style={{ marginBottom: '16px' }}>
        <div className="card-badges" style={{ flex: 1 }}>
          {/* Type Badge - Slightly larger for hero */}
          <span
            className="card-badge type"
            style={{ fontSize: '11px', padding: '4px 10px', color: typeBadge?.color || undefined }}
          >
            {typeBadge?.label || 'Resource'}
          </span>
          <span className="card-badge format" style={{ fontSize: '11px', padding: '4px 10px' }}>
            {formatConfig.label}
          </span>
        </div>
        <span className="card-badge featured" style={{ flexShrink: 0 }}>Featured</span>
      </div>

      {/* Card Body */}
      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            margin: 0,
            marginBottom: shortDescription ? '8px' : 0,
          }}
        >
          {title}
        </h3>
        {shortDescription && (
          <p className="card-description" style={{ margin: 0, fontSize: '14px' }}>
            {shortDescription}
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="card-footer" style={{ paddingTop: '16px', marginTop: '16px' }}>
        <span className="card-meta">{formattedDate}</span>
        <span className="card-action" style={{ fontSize: '14px', gap: '6px' }}>
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
        background: 'var(--card-bg)',
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
        item.style.background = 'var(--hover-bg)';
        item.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        const item = e.currentTarget;
        item.style.borderColor = 'var(--card-border)';
        item.style.borderLeftColor = hubColors.primary;
        item.style.background = 'var(--card-bg)';
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
          color: 'var(--text-primary)',
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
            background: 'var(--hover-bg)',
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
              color: 'var(--text-muted)',
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

// ============================================
// TRAINING CARD COMPONENT (Enablement Hub)
// Based on dark mode design system
// ============================================

interface TrainingCardProps {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  type?: string;
  eventDate?: string;
  durationMinutes?: number;
  presenters?: string[];
  href?: string;
}

export function TrainingCard({
  slug,
  title,
  shortDescription,
  type,
  eventDate,
  durationMinutes,
  presenters,
  href,
}: TrainingCardProps) {
  const assetUrl = href || `/asset/${slug}`;
  const formattedDate = formatDate(eventDate);
  const duration = durationMinutes ? `${durationMinutes} min` : null;
  const typeLabel = type?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Training';

  return (
    <Link href={assetUrl} className="training-card block no-underline" data-hub="enablement">
      {/* Card Header - Date + Type Badge */}
      <div className="training-card-header">
        <span className="training-date">{formattedDate}</span>
        <span className="training-type">{typeLabel}</span>
      </div>

      {/* Card Body */}
      <div className="training-card-body">
        <h4>{title}</h4>
        {shortDescription && <p>{shortDescription}</p>}

        {/* Presenter */}
        {presenters && presenters.length > 0 && (
          <div className="training-presenter">Presenter: {presenters.join(', ')}</div>
        )}

        {/* Action Footer */}
        <div className="training-footer">
          <span className="training-action">
            Watch
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
          {duration && <span className="training-duration">{duration}</span>}
        </div>
      </div>
    </Link>
  );
}

// ============================================
// PROOF CARD COMPONENT (CoE Hub - Statistics/Metrics)
// Based on dark mode design system mockup
// ============================================

interface ProofCardProps {
  id: string;
  slug: string;
  title: string;
  metric?: string;  // e.g., "87% AI Resolution Rate", "41% ↓ Chat AHT"
  metricLabel?: string;  // e.g., "Cost Reduction", "Revenue Impact"
  source?: string;
  href?: string;
}

export function ProofCard({
  slug,
  title,
  metric,
  metricLabel,
  source,
  href,
}: ProofCardProps) {
  const assetUrl = href || `/asset/${slug}`;

  return (
    <Link
      href={assetUrl}
      className="proof-card block no-underline"
      data-hub="coe"
    >
      {/* Metric Display - Large, bold, blue */}
      <div className="proof-metric">{metric || title}</div>

      {/* Description - Secondary color */}
      <div className="proof-description">
        {metricLabel || (metric ? title : '')}
      </div>

      {/* Source - Muted */}
      {source && (
        <div className="proof-source">Source: {source}</div>
      )}
    </Link>
  );
}
