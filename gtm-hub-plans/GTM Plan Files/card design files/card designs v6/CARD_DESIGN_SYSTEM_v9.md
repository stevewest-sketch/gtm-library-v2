# GTM Library Card Design System v9

## Overview

This document defines the card design specifications for the GTM Library, including typography, spacing, colors, and format icon mappings.

---

## Card Specifications

### Dimensions

| Property | Value |
|----------|-------|
| Card Height | `220px` (fixed) |
| Card Min Width | `320px` |
| Border Radius | `14px` |
| Hub Border (top) | `5px` |
| Card Gap | `24px` |

### Consistent Height Rules

To ensure all cards are always the same height regardless of title length:

```css
/* Card - Fixed height enforced */
.library-card {
  height: 220px;
  min-height: 220px;
  max-height: 220px;
  display: flex;
  flex-direction: column;
}

/* Title - Always reserves space for 2 lines */
.card-title {
  font-size: 18px;
  line-height: 1.35;
  min-height: calc(18px * 1.35 * 2); /* ~49px */
  max-height: calc(18px * 1.35 * 2);
  -webkit-line-clamp: 2;
}

/* Footer - Always at bottom */
.card-footer {
  margin-top: auto;
  flex-shrink: 0;
}
```

**Key principles:**
- Card height is fixed at 220px (min/max enforced)
- Title area always reserves 49px (2 lines × 18px × 1.35 line-height)
- Footer uses `margin-top: auto` to push to bottom
- All elements use `flex-shrink: 0` to prevent compression

### Typography

| Element | Size | Weight | Color | Notes |
|---------|------|--------|-------|-------|
| Title | `18px` | 600 | `#111827` | Max 2 lines, fixed height |
| Short Description | `15px` | 400 | `#6B7280` | Max 1 line, ellipsis |
| Type Badge | `12px` | 600, uppercase | Type-specific | `white-space: nowrap` |
| Format Text | `14px` | 600 | `#6B7280` | `white-space: nowrap` |
| Footer Date | `14px` | 400 | `#9CA3AF` | |
| Footer Action | `15px` | 600 | Hub color | |

### Padding

| Area | Value |
|------|-------|
| Card Header | `16px 20px 0` |
| Card Body | `16px 20px` |
| Card Footer | `14px 20px` |

---

## Hub Colors

| Hub | Primary Color | Hex | Usage |
|-----|---------------|-----|-------|
| Content | Purple | `#8C69F0` | Top border, action link |
| Enablement | Green | `#10B981` | Top border, action link |
| CoE | Orange | `#F59E0B` | Top border, action link |

---

## Format Icons - Complete Reference

All 13 formats from the Content Taxonomy Framework with their icon specifications.

### Google Workspace Suite

| Format | Slug | Icon Color | Hex | Description |
|--------|------|------------|-----|-------------|
| **Slides** | `slides` | Google Slides Yellow | `#FBBC04` | Rectangle with slide thumbnails |
| **Document** | `document` | Google Docs Blue | `#4285F4` | Rectangle with text lines |
| **Spreadsheet** | `spreadsheet` | Google Sheets Green | `#34A853` | Rectangle with grid lines |

### Media Formats

| Format | Slug | Icon Color | Hex | Description |
|--------|------|------------|-----|-------------|
| **Video** | `video` | YouTube Red | `#EA4335` | Rectangle with centered play triangle |
| **Live Replay** | `live-replay` | Recording Red | `#DC2626` | Rectangle with record dot, pulsing indicator |
| **On Demand** | `on-demand` | Blue | `#2563EB` | Rectangle with play button + progress bar |

### Document Formats

| Format | Slug | Icon Color | Hex | Description |
|--------|------|------------|-----|-------------|
| **PDF** | `pdf` | Adobe Red | `#EA4335` | Folded corner document with "PDF" text |
| **Guide** | `guide` | Book Blue | `#3B82F6` | Book spine with text lines |
| **Article** | `article` | Slate Gray | `#64748B` | Newspaper layout with image placeholder |

### Interactive & Links

| Format | Slug | Icon Color | Hex | Description |
|--------|------|------------|-----|-------------|
| **Tool** | `tool` | Dashboard Cyan | `#06B6D4` | Dashboard grid layout |
| **Sequence** | `sequence` | Purple | `#8B5CF6` | Envelope with email chevron |
| **Course** | `course` | Graduation Purple | `#7C3AED` | Graduation cap with tassel |
| **Web Link** | `web-link` | Gray | `#6B7280` | Chain link icon |

---

## Format Icon SVG Code

### 1. Slides (Google Slides Yellow)
```svg
<svg viewBox="0 0 24 24" fill="none">
  <rect x="2" y="4" width="20" height="16" rx="2" fill="#FBBC04"/>
  <rect x="5" y="7" width="6" height="5" rx="1" fill="white"/>
  <rect x="13" y="7" width="6" height="5" rx="1" fill="white" opacity="0.6"/>
  <rect x="5" y="14" width="14" height="2" rx="1" fill="white" opacity="0.4"/>
</svg>
```

### 2. Document (Google Docs Blue)
```svg
<svg viewBox="0 0 24 24" fill="none">
  <rect x="3" y="2" width="18" height="20" rx="2" fill="#4285F4"/>
  <path d="M7 7h10M7 11h10M7 15h7" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

### 3. Spreadsheet (Google Sheets Green)
```svg
<svg viewBox="0 0 24 24" fill="none">
  <rect x="3" y="2" width="18" height="20" rx="2" fill="#34A853"/>
  <path d="M7 6h10M7 10h10M7 14h10M7 18h10" stroke="white" stroke-width="1.2"/>
  <path d="M12 6v12" stroke="white" stroke-width="1.2"/>
</svg>
```

### 4. PDF (Adobe Red)
```svg
<svg viewBox="0 0 24 24" fill="none">
  <path d="M4 4a2 2 0 012-2h8l6 6v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" fill="#EA4335"/>
  <path d="M14 2v6h6" fill="#B31412"/>
  <text x="5" y="17" fill="white" font-size="7" font-weight="bold">PDF</text>
</svg>
```

### 5. Video (Red with Play)
```svg
<svg viewBox="0 0 24 24" fill="none">
  <rect x="2" y="4" width="20" height="16" rx="2" fill="#EA4335"/>
  <path d="M10 8.5v7l6-3.5-6-3.5z" fill="white"/>
</svg>
```

### 6. Article (Newspaper Gray)
```svg
<svg viewBox="0 0 24 24" fill="none">
  <rect x="3" y="3" width="18" height="18" rx="2" fill="#64748B"/>
  <rect x="6" y="6" width="5" height="5" fill="white"/>
  <path d="M13 7h5M13 10h5M6 14h12M6 17h9" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
</svg>
```

### 7. Tool (Dashboard Cyan)
```svg
<svg viewBox="0 0 24 24" fill="none">
  <rect x="3" y="3" width="18" height="18" rx="2" fill="#06B6D4"/>
  <rect x="6" y="6" width="5" height="5" rx="1" fill="white"/>
  <rect x="13" y="6" width="5" height="3" rx="1" fill="white" opacity="0.7"/>
  <rect x="13" y="11" width="5" height="5" rx="1" fill="white" opacity="0.5"/>
  <rect x="6" y="13" width="5" height="3" rx="1" fill="white" opacity="0.7"/>
</svg>
```

### 8. Guide (Book Blue)
```svg
<svg viewBox="0 0 24 24" fill="none">
  <path d="M4 4a2 2 0 012-2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" fill="#3B82F6"/>
  <path d="M8 2v20" stroke="#1D4ED8" stroke-width="2"/>
  <path d="M11 7h6M11 11h6M11 15h4" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
</svg>
```

### 9. Sequence (Email Purple)
```svg
<svg viewBox="0 0 24 24" fill="none">
  <rect x="2" y="4" width="20" height="16" rx="2" fill="#8B5CF6"/>
  <path d="M2 6l10 7 10-7" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6 18l4-4M18 18l-4-4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

### 10. Live Replay (Recording Red)
```svg
<svg viewBox="0 0 24 24" fill="none">
  <rect x="2" y="4" width="20" height="16" rx="2" fill="#DC2626"/>
  <circle cx="12" cy="12" r="4" fill="white"/>
  <circle cx="12" cy="12" r="2" fill="#DC2626"/>
  <circle cx="18" cy="7" r="2" fill="#FCA5A5"/>
</svg>
```

### 11. On Demand (Blue with Progress)
```svg
<svg viewBox="0 0 24 24" fill="none">
  <rect x="2" y="4" width="20" height="16" rx="2" fill="#2563EB"/>
  <path d="M10 8.5v7l6-3.5-6-3.5z" fill="white"/>
  <rect x="5" y="17" width="14" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
</svg>
```

### 12. Course (Graduation Purple)
```svg
<svg viewBox="0 0 24 24" fill="none">
  <path d="M12 3L2 8l10 5 10-5-10-5z" fill="#7C3AED"/>
  <path d="M6 10.5v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" stroke="#7C3AED" stroke-width="2" fill="#A78BFA"/>
  <path d="M20 8v7" stroke="#7C3AED" stroke-width="2" stroke-linecap="round"/>
  <circle cx="20" cy="16" r="1.5" fill="#7C3AED"/>
</svg>
```

### 13. Web Link (Chain Link Gray)
```svg
<svg viewBox="0 0 24 24" fill="none">
  <rect x="1" y="1" width="22" height="22" rx="4" fill="#6B7280"/>
  <path d="M10 14a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5l-1 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M14 10a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

---

## Format Label Component (Option B: Inline Pill)

The format label uses an inline pill layout with icon + text.

### CSS
```css
.format-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px 8px 10px;
  background: #F8FAFC;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

.format-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.format-text {
  font-size: 14px;
  font-weight: 600;
  color: #6B7280;
  white-space: nowrap;
}

/* Type badge also needs nowrap */
.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
```

### HTML Structure
```html
<span class="format-label">
  <svg class="format-icon" viewBox="0 0 24 24">
    <!-- Icon SVG content -->
  </svg>
  <span class="format-text">Slides</span>
</span>
```

---

## Type Badge Colors

### Content Hub Types

| Type | Slug | Background | Text Color |
|------|------|------------|------------|
| Deck | `deck` | `#EDE9FE` | `#8C69F0` |
| Battlecard | `battlecard` | `#FEE2E2` | `#EF4444` |
| One-Pager | `one-pager` | `#FEF3C7` | `#F59E0B` |
| Template | `template` | `#EDE9FE` | `#8B5CF6` |
| Messaging | `messaging` | `#FCE7F3` | `#EC4899` |
| Calculator | `calculator` | `#CFFAFE` | `#06B6D4` |
| Competitive | `competitive` | `#FEE2E2` | `#EF4444` |
| Guide | `guide` | `#DBEAFE` | `#3B82F6` |
| Press | `press` | `#F3F4F6` | `#6B7280` |
| Case Study | `case-study` | `#D1FAE5` | `#059669` |

### Enablement Hub Types

| Type | Slug | Background | Text Color |
|------|------|------------|------------|
| Product Training | `product-training` | `#D1FAE5` | `#10B981` |
| Technical Training | `technical-training` | `#DBEAFE` | `#2563EB` |
| GTM Training | `gtm-training` | `#EDE9FE` | `#8B5CF6` |
| GTM Tool | `gtm-tool` | `#CFFAFE` | `#06B6D4` |
| Competitive Training | `competitive-training` | `#FEE2E2` | `#EF4444` |
| Certification | `certification` | `#FEF3C7` | `#F59E0B` |
| Partner Training | `partner-training` | `#FEF3C7` | `#D97706` |
| Value Realization | `value-realization` | `#CFFAFE` | `#0891B2` |
| Playbook | `playbook` | `#EDE9FE` | `#8B5CF6` |

### CoE Hub Types

| Type | Slug | Background | Text Color |
|------|------|------------|------------|
| Customer Meeting Asset | `customer-meeting-asset` | `#D1FAE5` | `#059669` |
| Prospect Meeting Asset | `prospect-meeting-asset` | `#EDE9FE` | `#8B5CF6` |
| Customer Best Practice | `customer-best-practice` | `#FEF3C7` | `#F59E0B` |
| Best Practice | `best-practice` | `#FEF3C7` | `#F59E0B` |
| Internal Best Practice | `internal-best-practice` | `#DBEAFE` | `#3B82F6` |
| Process Innovation | `process-innovation` | `#CFFAFE` | `#06B6D4` |
| Proof Point | `proof-point` | `#D1FAE5` | `#10B981` |
| Dashboard | `dashboard` | `#DBEAFE` | `#3B82F6` |

---

## Card Structure

```
┌─────────────────────────────────────────────┐
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │  ← 5px hub color
│                                             │
│  BATTLECARD              [icon] PDF         │  ← Type badge + Format pill
│                                             │
│  Ada Battlecard                             │  ← Title (18px, 2 lines max)
│  Competitive positioning vs Ada             │  ← Description (15px, 1 line)
│                                             │
├─────────────────────────────────────────────┤
│  Dec 10, 2024                     View →    │  ← Footer
└─────────────────────────────────────────────┘
```

---

## List View (Stack View)

For boards that default to Stack view (e.g., Proof Points).

### Dimensions

| Property | Value |
|----------|-------|
| Row Height | `auto` (min ~56px) |
| Row Padding | `16px 20px` |
| Row Gap | `12px` |
| Border Radius | `12px` |
| Hub Border (left) | `5px` |

### Format in List View

| Property | Value |
|----------|-------|
| Icon Size | `24px` |
| Pill Padding | `6px 12px 6px 8px` |
| Text Size | `13px` |

---

## Implementation Notes

### React Component Props

```typescript
interface FormatIconProps {
  format: 
    | 'slides' 
    | 'document' 
    | 'spreadsheet' 
    | 'pdf' 
    | 'video' 
    | 'article' 
    | 'tool' 
    | 'guide' 
    | 'sequence' 
    | 'live-replay' 
    | 'on-demand' 
    | 'course' 
    | 'web-link';
  size?: 'sm' | 'md' | 'lg'; // 20px, 28px, 32px
  className?: string;
}

interface LibraryCardProps {
  title: string;
  shortDescription: string;
  hub: 'content' | 'enablement' | 'coe';
  type: string;
  format: string;
  date: string;
  url: string;
}
```

### Format Display Name Mapping

```typescript
const FORMAT_DISPLAY_NAMES: Record<string, string> = {
  'slides': 'Slides',
  'document': 'Document',
  'spreadsheet': 'Spreadsheet',
  'pdf': 'PDF',
  'video': 'Video',
  'article': 'Article',
  'tool': 'Tool',
  'guide': 'Guide',
  'sequence': 'Sequence',
  'live-replay': 'Live Replay',
  'on-demand': 'On Demand',
  'course': 'Course',
  'web-link': 'Web Link',
};
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v9 | Dec 28, 2024 | Option B inline pill, all 13 format icons |
| v8 | Dec 28, 2024 | Larger text, format alignment options |
| v7 | Dec 28, 2024 | Stacked format layout |
| v6 | Dec 28, 2024 | Initial format icons, text-only type badges |
| v5 | Dec 28, 2024 | Short description field, fixed height |
