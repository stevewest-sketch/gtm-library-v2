# GTM Library Card Redesign - Claude Code Implementation Guide v3

## Summary of Design

| Element | Position | Style |
|---------|----------|-------|
| **Type Badge** | Top Left | Colored background + emoji icon + label |
| **Format Label** | Top Right | Dark gray text only (no icon) |
| **Top Border** | Full width | 4px hub color accent |
| **Footer Left** | Date | 📅 icon + date |
| **Footer Right** | Action | "View →" in hub color |

**Key Change:** ALL cards (Content, Enablement, CoE) now display TYPE badge, not format. Format is shown as plain text.

---

## Type Configuration

```typescript
// lib/type-config.ts

export interface TypeConfig {
  icon: string;
  color: string;
  bg: string;
  label: string;
}

// ============================================
// CONTENT HUB TYPES (10)
// ============================================
export const CONTENT_TYPES: Record<string, TypeConfig> = {
  'deck':        { icon: '📊', color: '#8C69F0', bg: '#EDE9FE', label: 'Deck' },
  'battlecard':  { icon: '⚔️', color: '#EF4444', bg: '#FEE2E2', label: 'Battlecard' },
  'one-pager':   { icon: '📄', color: '#F59E0B', bg: '#FEF3C7', label: 'One-Pager' },
  'template':    { icon: '📋', color: '#8B5CF6', bg: '#EDE9FE', label: 'Template' },
  'messaging':   { icon: '💬', color: '#EC4899', bg: '#FCE7F3', label: 'Messaging' },
  'calculator':  { icon: '🧮', color: '#06B6D4', bg: '#CFFAFE', label: 'Calculator' },
  'competitive': { icon: '📊', color: '#EF4444', bg: '#FEE2E2', label: 'Competitive' },
  'guide':       { icon: '📘', color: '#3B82F6', bg: '#DBEAFE', label: 'Guide' },
  'press':       { icon: '📰', color: '#64748B', bg: '#F1F5F9', label: 'Press' },
  'case-study':  { icon: '📈', color: '#059669', bg: '#D1FAE5', label: 'Case Study' },
};

// ============================================
// ENABLEMENT HUB TYPES (9)
// ============================================
export const ENABLEMENT_TYPES: Record<string, TypeConfig> = {
  'product-training':     { icon: '🎓', color: '#10B981', bg: '#D1FAE5', label: 'Product Training' },
  'technical-training':   { icon: '🔧', color: '#6366F1', bg: '#E0E7FF', label: 'Technical Training' },
  'gtm-training':         { icon: '🚀', color: '#8B5CF6', bg: '#EDE9FE', label: 'GTM Training' },
  'gtm-tool':             { icon: '🛠️', color: '#06B6D4', bg: '#CFFAFE', label: 'GTM Tool' },
  'competitive-training': { icon: '⚔️', color: '#EF4444', bg: '#FEE2E2', label: 'Competitive Training' },
  'certification':        { icon: '🏆', color: '#F59E0B', bg: '#FEF3C7', label: 'Certification' },
  'partner-training':     { icon: '🤝', color: '#3B82F6', bg: '#DBEAFE', label: 'Partner Training' },
  'value-realization':    { icon: '💰', color: '#059669', bg: '#D1FAE5', label: 'Value Realization' },
  'playbook':             { icon: '📕', color: '#EC4899', bg: '#FCE7F3', label: 'Playbook' },
};

// ============================================
// COE HUB TYPES (12)
// ============================================
export const COE_TYPES: Record<string, TypeConfig> = {
  'customer-meeting-asset':  { icon: '🤝', color: '#F59E0B', bg: '#FEF3C7', label: 'Customer Meeting' },
  'prospect-meeting-asset':  { icon: '🎯', color: '#F97316', bg: '#FFEDD5', label: 'Prospect Meeting' },
  'customer-best-practice':  { icon: '⭐', color: '#10B981', bg: '#D1FAE5', label: 'Customer BP' },
  'best-practice':           { icon: '✅', color: '#3B82F6', bg: '#DBEAFE', label: 'Best Practice' },
  'internal-best-practice':  { icon: '🏢', color: '#8B5CF6', bg: '#EDE9FE', label: 'Internal BP' },
  'process-innovation':      { icon: '💡', color: '#EC4899', bg: '#FCE7F3', label: 'Process Innovation' },
  'dashboard':               { icon: '📊', color: '#06B6D4', bg: '#CFFAFE', label: 'Dashboard' },
  'customer-success-metric': { icon: '📈', color: '#059669', bg: '#D1FAE5', label: 'Success Metric' },
  'industry-stat':           { icon: '🏭', color: '#6366F1', bg: '#E0E7FF', label: 'Industry Stat' },
  'benchmark':               { icon: '📏', color: '#0EA5E9', bg: '#E0F2FE', label: 'Benchmark' },
  'competitor-stat':         { icon: '📉', color: '#EF4444', bg: '#FEE2E2', label: 'Competitor Stat' },
  'customer-quote':          { icon: '💬', color: '#F59E0B', bg: '#FEF3C7', label: 'Customer Quote' },
};

// Combined lookup
export const TYPE_CONFIG: Record<string, TypeConfig> = {
  ...CONTENT_TYPES,
  ...ENABLEMENT_TYPES,
  ...COE_TYPES,
};

// Hub colors for top border and action link
export const HUB_COLORS: Record<string, string> = {
  content:    '#8C69F0',
  enablement: '#10B981',
  coe:        '#F59E0B',
};

// Format display names (no icons - just text)
export const FORMAT_LABELS: Record<string, string> = {
  'slides':       'Slides',
  'document':     'Document',
  'spreadsheet':  'Spreadsheet',
  'pdf':          'PDF',
  'video':        'Video',
  'article':      'Article',
  'tool':         'Tool',
  'guide':        'Guide',
  'sequence':     'Sequence',
  'live-replay':  'Live Replay',
  'on-demand':    'On Demand',
  'course':       'Course',
  'web-link':     'Web Link',
  'proof-point':  'Proof Point',
};
```

---

## React Component

```tsx
// components/LibraryCard.tsx

import Link from 'next/link';
import { TYPE_CONFIG, HUB_COLORS, FORMAT_LABELS } from '@/lib/type-config';

interface LibraryCardProps {
  title: string;
  description: string;
  slug: string;
  hub: 'content' | 'enablement' | 'coe';
  format: string;
  type: string;
  publishDate?: string;
  externalUrl?: string;
}

export function LibraryCard({
  title,
  description,
  slug,
  hub,
  format,
  type,
  publishDate,
  externalUrl,
}: LibraryCardProps) {
  const typeConfig = TYPE_CONFIG[type] || { icon: '📄', color: '#6B7280', bg: '#F3F4F6', label: type };
  const formatLabel = FORMAT_LABELS[format] || format;
  const hubColor = HUB_COLORS[hub] || HUB_COLORS.content;

  const formattedDate = publishDate
    ? new Date(publishDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const href = externalUrl || `/asset/${slug}`;
  const isExternal = !!externalUrl;

  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="group block bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{ 
        borderTopWidth: '4px', 
        borderTopColor: hubColor,
      }}
    >
      {/* Header: Type Badge + Format Label */}
      <div className="flex items-center justify-between px-5 pt-4">
        {/* Type Badge with Icon */}
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: typeConfig.bg, color: typeConfig.color }}
        >
          <span className="text-sm">{typeConfig.icon}</span>
          {typeConfig.label}
        </span>

        {/* Format Label - Plain lighter gray text, NO icon */}
        <span className="text-xs font-medium text-gray-400">
          {formatLabel}
        </span>
      </div>

      {/* Body: Title + Description */}
      <div className="px-5 py-3.5">
        <h4 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 transition-colors">
          {title}
        </h4>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Footer: Date + Action */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
        {formattedDate ? (
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <span>📅</span>
            {formattedDate}
          </span>
        ) : (
          <span />
        )}
        <span
          className="text-sm font-semibold transition-colors"
          style={{ color: hubColor }}
        >
          View →
        </span>
      </div>
    </Link>
  );
}
```

---

## CSS Variables

```css
:root {
  /* Hub Colors (for top border + action link) */
  --hub-content: #8C69F0;
  --hub-enablement: #10B981;
  --hub-coe: #F59E0B;

  /* Content Type Colors */
  --type-deck: #8C69F0;
  --type-deck-bg: #EDE9FE;
  --type-battlecard: #EF4444;
  --type-battlecard-bg: #FEE2E2;
  --type-one-pager: #F59E0B;
  --type-one-pager-bg: #FEF3C7;
  --type-template: #8B5CF6;
  --type-template-bg: #EDE9FE;
  --type-messaging: #EC4899;
  --type-messaging-bg: #FCE7F3;
  --type-calculator: #06B6D4;
  --type-calculator-bg: #CFFAFE;
  --type-competitive: #EF4444;
  --type-competitive-bg: #FEE2E2;
  --type-guide: #3B82F6;
  --type-guide-bg: #DBEAFE;
  --type-press: #64748B;
  --type-press-bg: #F1F5F9;
  --type-case-study: #059669;
  --type-case-study-bg: #D1FAE5;

  /* Enablement Type Colors */
  --type-product-training: #10B981;
  --type-product-training-bg: #D1FAE5;
  --type-technical-training: #6366F1;
  --type-technical-training-bg: #E0E7FF;
  --type-gtm-training: #8B5CF6;
  --type-gtm-training-bg: #EDE9FE;
  --type-gtm-tool: #06B6D4;
  --type-gtm-tool-bg: #CFFAFE;
  --type-competitive-training: #EF4444;
  --type-competitive-training-bg: #FEE2E2;
  --type-certification: #F59E0B;
  --type-certification-bg: #FEF3C7;
  --type-partner-training: #3B82F6;
  --type-partner-training-bg: #DBEAFE;
  --type-value-realization: #059669;
  --type-value-realization-bg: #D1FAE5;
  --type-playbook: #EC4899;
  --type-playbook-bg: #FCE7F3;

  /* CoE Type Colors */
  --type-customer-meeting-asset: #F59E0B;
  --type-customer-meeting-asset-bg: #FEF3C7;
  --type-prospect-meeting-asset: #F97316;
  --type-prospect-meeting-asset-bg: #FFEDD5;
  --type-customer-best-practice: #10B981;
  --type-customer-best-practice-bg: #D1FAE5;
  --type-best-practice: #3B82F6;
  --type-best-practice-bg: #DBEAFE;
  --type-internal-best-practice: #8B5CF6;
  --type-internal-best-practice-bg: #EDE9FE;
  --type-process-innovation: #EC4899;
  --type-process-innovation-bg: #FCE7F3;
  --type-dashboard: #06B6D4;
  --type-dashboard-bg: #CFFAFE;
  --type-customer-success-metric: #059669;
  --type-customer-success-metric-bg: #D1FAE5;
  --type-industry-stat: #6366F1;
  --type-industry-stat-bg: #E0E7FF;
  --type-benchmark: #0EA5E9;
  --type-benchmark-bg: #E0F2FE;
  --type-competitor-stat: #EF4444;
  --type-competitor-stat-bg: #FEE2E2;
  --type-customer-quote: #F59E0B;
  --type-customer-quote-bg: #FEF3C7;

  /* Neutrals */
  --card-bg: #FFFFFF;
  --card-border: #E5E7EB;
  --text-primary: #111827;
  --text-secondary: #4B5563;
  --text-muted: #9CA3AF;
  --format-text: #9CA3AF;  /* Lightened 25% */
  --footer-bg: #FAFAFA;
}
```

---

## Tailwind CSS Classes

```css
/* Card Container */
.library-card {
  @apply block bg-white border border-gray-200 rounded-xl overflow-hidden;
  @apply transition-all duration-200;
  @apply hover:shadow-lg hover:-translate-y-0.5;
  border-top-width: 4px;
}

/* Type Badge */
.type-badge {
  @apply inline-flex items-center gap-1.5 px-3 py-1 rounded-md;
  @apply text-xs font-semibold uppercase tracking-wide;
}

/* Format Label - Plain lighter text only */
.format-label {
  @apply text-xs font-medium text-gray-400;
}

/* Card Title */
.card-title {
  @apply text-base font-semibold text-gray-900 mb-2 line-clamp-2;
}

/* Card Description */
.card-description {
  @apply text-sm text-gray-500 line-clamp-2 leading-relaxed;
}

/* Card Footer */
.card-footer {
  @apply flex items-center justify-between px-5 py-3;
  @apply border-t border-gray-100 bg-gray-50;
}

/* Date */
.card-date {
  @apply flex items-center gap-1.5 text-xs text-gray-400;
}

/* Action Link */
.card-action {
  @apply text-sm font-semibold;
}
```

---

## Visual Reference

```
┌─────────────────────────────────────────────────────┐
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │  ← 4px hub color bar
│                                                     │
│  ⚔️ BATTLECARD                              PDF     │  ← Type badge (left) + Format text (right)
│                                                     │
│  Zendesk Sidekick Battle Card                       │  ← Title (15px, semibold)
│  Competitor battlecard comparing Zendesk AI vs...   │  ← Description (13px, gray)
│                                                     │
├─────────────────────────────────────────────────────┤
│  📅 Dec 10, 2024                         View →     │  ← Footer (gray bg)
└─────────────────────────────────────────────────────┘
```

---

## Type Badge Quick Reference

### Content Hub (10 types)
| Type | Icon | Color | Label |
|------|------|-------|-------|
| `deck` | 📊 | #8C69F0 | Deck |
| `battlecard` | ⚔️ | #EF4444 | Battlecard |
| `one-pager` | 📄 | #F59E0B | One-Pager |
| `template` | 📋 | #8B5CF6 | Template |
| `messaging` | 💬 | #EC4899 | Messaging |
| `calculator` | 🧮 | #06B6D4 | Calculator |
| `competitive` | 📊 | #EF4444 | Competitive |
| `guide` | 📘 | #3B82F6 | Guide |
| `press` | 📰 | #64748B | Press |
| `case-study` | 📈 | #059669 | Case Study |

### Enablement Hub (9 types)
| Type | Icon | Color | Label |
|------|------|-------|-------|
| `product-training` | 🎓 | #10B981 | Product Training |
| `technical-training` | 🔧 | #6366F1 | Technical Training |
| `gtm-training` | 🚀 | #8B5CF6 | GTM Training |
| `gtm-tool` | 🛠️ | #06B6D4 | GTM Tool |
| `competitive-training` | ⚔️ | #EF4444 | Competitive Training |
| `certification` | 🏆 | #F59E0B | Certification |
| `partner-training` | 🤝 | #3B82F6 | Partner Training |
| `value-realization` | 💰 | #059669 | Value Realization |
| `playbook` | 📕 | #EC4899 | Playbook |

### CoE Hub (12 types)
| Type | Icon | Color | Label |
|------|------|-------|-------|
| `customer-meeting-asset` | 🤝 | #F59E0B | Customer Meeting |
| `prospect-meeting-asset` | 🎯 | #F97316 | Prospect Meeting |
| `customer-best-practice` | ⭐ | #10B981 | Customer BP |
| `best-practice` | ✅ | #3B82F6 | Best Practice |
| `internal-best-practice` | 🏢 | #8B5CF6 | Internal BP |
| `process-innovation` | 💡 | #EC4899 | Process Innovation |
| `dashboard` | 📊 | #06B6D4 | Dashboard |
| `customer-success-metric` | 📈 | #059669 | Success Metric |
| `industry-stat` | 🏭 | #6366F1 | Industry Stat |
| `benchmark` | 📏 | #0EA5E9 | Benchmark |
| `competitor-stat` | 📉 | #EF4444 | Competitor Stat |
| `customer-quote` | 💬 | #F59E0B | Customer Quote |

---

## Usage Example

```tsx
import { LibraryCard } from '@/components/LibraryCard';

export default function LibraryPage({ items }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((item) => (
        <LibraryCard
          key={item.slug}
          title={item.title}
          description={item.description}
          slug={item.slug}
          hub={item.hub}
          format={item.format}
          type={item.type}
          publishDate={item.published_at}
          externalUrl={item.external_url}
        />
      ))}
    </div>
  );
}
```
