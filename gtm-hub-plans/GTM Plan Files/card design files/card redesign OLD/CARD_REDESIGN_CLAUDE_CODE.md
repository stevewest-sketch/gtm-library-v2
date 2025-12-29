# GTM Library Card Redesign - Claude Code Implementation Guide

## Summary of Changes

| Element | Before | After |
|---------|--------|-------|
| **Left Badge** | Hub name (CONTENT) | Type with icon (⚔️ BATTLECARD) |
| **Right Label** | Format with icon | Format in plain dark text |
| **Tags** | Gray tag pills | ❌ Removed |
| **Footer Left** | Empty | Published date with 📅 icon |
| **Footer Right** | View → | View → (unchanged) |

---

## Type Configuration

```typescript
// lib/card-config.ts

export const TYPE_CONFIG: Record<string, {
  icon: string;
  color: string;
  bg: string;
  label: string;
}> = {
  battlecard:    { icon: '⚔️', color: '#EF4444', bg: '#FEE2E2', label: 'Battlecard' },
  guide:         { icon: '📘', color: '#3B82F6', bg: '#DBEAFE', label: 'Guide' },
  template:      { icon: '📋', color: '#8B5CF6', bg: '#EDE9FE', label: 'Template' },
  messaging:     { icon: '💬', color: '#EC4899', bg: '#FCE7F3', label: 'Messaging' },
  'one-pager':   { icon: '📄', color: '#F59E0B', bg: '#FEF3C7', label: 'One-Pager' },
  tool:          { icon: '🛠️', color: '#06B6D4', bg: '#CFFAFE', label: 'Tool' },
  competitive:   { icon: '📊', color: '#EF4444', bg: '#FEE2E2', label: 'Competitive' },
  training:      { icon: '🎓', color: '#10B981', bg: '#D1FAE5', label: 'Training' },
  demo:          { icon: '🎬', color: '#6366F1', bg: '#E0E7FF', label: 'Demo' },
  product:       { icon: '📦', color: '#8C69F0', bg: '#EDE9FE', label: 'Product' },
  press:         { icon: '📰', color: '#64748B', bg: '#F1F5F9', label: 'Press' },
  prototype:     { icon: '🎨', color: '#0EA5E9', bg: '#E0F2FE', label: 'Prototype' },
};

export const FORMAT_ICONS: Record<string, string> = {
  document:  '📄',
  slides:    '📊',
  pdf:       '📕',
  video:     '🎬',
  sheet:     '📗',
  prototype: '🎨',
  article:   '📰',
};

export const HUB_COLORS: Record<string, string> = {
  content:    '#8C69F0',
  enablement: '#10B981',
  coe:        '#F59E0B',
};

export const HUB_ACTION_COLORS: Record<string, string> = {
  content:    '#8C69F0',
  enablement: '#10B981',
  coe:        '#F59E0B',
};
```

---

## React Component

```tsx
// components/LibraryCard.tsx

import Link from 'next/link';
import { TYPE_CONFIG, FORMAT_ICONS, HUB_COLORS, HUB_ACTION_COLORS } from '@/lib/card-config';

interface LibraryCardProps {
  title: string;
  description: string;
  slug: string;
  hub: 'content' | 'enablement' | 'coe';
  format: string;
  type: string;
  publishDate?: string;
}

export function LibraryCard({
  title,
  description,
  slug,
  hub,
  format,
  type,
  publishDate,
}: LibraryCardProps) {
  const typeConfig = TYPE_CONFIG[type] || TYPE_CONFIG['guide'];
  const formatIcon = FORMAT_ICONS[format] || '📄';
  const formatLabel = format.charAt(0).toUpperCase() + format.slice(1);
  const hubColor = HUB_COLORS[hub] || HUB_COLORS.content;
  const actionColor = HUB_ACTION_COLORS[hub] || HUB_ACTION_COLORS.content;

  // Format the publish date
  const formattedDate = publishDate
    ? new Date(publishDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Link
      href={`/asset/${slug}`}
      className="group block bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-100 hover:-translate-y-0.5"
      style={{ borderTopWidth: '4px', borderTopColor: hubColor }}
    >
      {/* Header: Type Badge + Format */}
      <div className="flex items-center justify-between px-5 pt-4">
        {/* Type Badge */}
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: typeConfig.bg, color: typeConfig.color }}
        >
          <span className="text-sm">{typeConfig.icon}</span>
          {typeConfig.label}
        </span>

        {/* Format Label */}
        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <span className="text-sm opacity-70">{formatIcon}</span>
          {formatLabel}
        </span>
      </div>

      {/* Body: Title + Description */}
      <div className="px-5 py-3.5">
        <h4 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
          {title}
        </h4>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Footer: Date + Action */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
        {formattedDate && (
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="text-xs">📅</span>
            {formattedDate}
          </span>
        )}
        {!formattedDate && <span />}
        <span
          className="text-sm font-medium transition-colors"
          style={{ color: actionColor }}
        >
          View →
        </span>
      </div>
    </Link>
  );
}
```

---

## Tailwind CSS Classes Reference

```css
/* Card Container */
.library-card {
  @apply block bg-white border border-gray-200 rounded-xl overflow-hidden;
  @apply transition-all duration-200;
  @apply hover:border-purple-400 hover:shadow-lg hover:shadow-purple-100 hover:-translate-y-0.5;
  border-top-width: 4px;
}

/* Type Badge */
.type-badge {
  @apply inline-flex items-center gap-1.5 px-3 py-1 rounded-md;
  @apply text-xs font-semibold uppercase tracking-wide;
}

/* Format Label */
.format-label {
  @apply flex items-center gap-1.5 text-xs font-medium text-gray-500;
}

/* Card Title */
.card-title {
  @apply text-base font-semibold text-gray-900 mb-2 line-clamp-2;
  @apply group-hover:text-purple-700 transition-colors;
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
  @apply text-sm font-medium;
}
```

---

## CSS Variables (if not using Tailwind)

```css
:root {
  /* Type Badge Colors */
  --type-battlecard: #EF4444;
  --type-battlecard-bg: #FEE2E2;
  --type-guide: #3B82F6;
  --type-guide-bg: #DBEAFE;
  --type-template: #8B5CF6;
  --type-template-bg: #EDE9FE;
  --type-messaging: #EC4899;
  --type-messaging-bg: #FCE7F3;
  --type-one-pager: #F59E0B;
  --type-one-pager-bg: #FEF3C7;
  --type-tool: #06B6D4;
  --type-tool-bg: #CFFAFE;
  --type-competitive: #EF4444;
  --type-competitive-bg: #FEE2E2;
  --type-training: #10B981;
  --type-training-bg: #D1FAE5;
  --type-demo: #6366F1;
  --type-demo-bg: #E0E7FF;
  --type-product: #8C69F0;
  --type-product-bg: #EDE9FE;
  --type-press: #64748B;
  --type-press-bg: #F1F5F9;
  --type-prototype: #0EA5E9;
  --type-prototype-bg: #E0F2FE;

  /* Hub Accent Colors */
  --hub-content: #8C69F0;
  --hub-enablement: #10B981;
  --hub-coe: #F59E0B;

  /* Neutrals */
  --card-bg: #FFFFFF;
  --card-border: #E5E7EB;
  --text-primary: #111827;
  --text-secondary: #4B5563;
  --text-muted: #9CA3AF;
  --footer-bg: #FAFAFA;
  --footer-border: #F3F4F6;
}
```

---

## Database Schema Update

Make sure `publishDate` is available in your catalog table:

```sql
-- Add publish_date if not exists
ALTER TABLE catalog ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Update existing records to use created_at as fallback
UPDATE catalog SET published_at = created_at WHERE published_at IS NULL;
```

---

## Usage Example

```tsx
// In your page component
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
        />
      ))}
    </div>
  );
}
```

---

## Visual Reference

```
┌─────────────────────────────────────────────────────┐
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │  ← 4px hub color bar
│                                                     │
│  ⚔️ BATTLECARD                      📕 PDF         │  ← Type badge + Format
│                                                     │
│  Zendesk Sidekick Battle Card                      │  ← Title (16px, semibold)
│  Competitor battlecard comparing Zendesk AI vs...   │  ← Description (13px, gray)
│                                                     │
├─────────────────────────────────────────────────────┤
│  📅 Dec 10, 2024                         View →    │  ← Footer (gray bg)
└─────────────────────────────────────────────────────┘
```
