# GTM Library Design System v4 - NEON Edition
## Complete Implementation Plan

---

## 📋 Executive Summary

This document outlines the complete design system update for GTM Library, transforming the interface to a **NEON color palette** with **no gray type badges**. The update includes Homepage, Admin pages, and the complete badge/card system.

### Key Changes
- All type badge colors updated to **neon-bright** values
- **No gray types** — every type has a vibrant color
- **Purple typography brighter** (#B464FF instead of #A78BFA)
- **Playbook** moved to GREEN (training category)
- **Article** moved to PINK (messaging category)
- **Internal** moved to VIOLET (new color category)
- Admin pages renamed: "Boards" → "Hubs"

---

## 🎨 Color System

### NEON Type Badge Colors

| Color | Hex | Background | Border | CSS Variable |
|-------|-----|------------|--------|--------------|
| 🔴 Red | `#FF5555` | `rgba(255, 80, 80, 0.18)` | `rgba(255, 80, 80, 0.30)` | `--badge-red-text` |
| 🟠 Orange | `#FFA500` | `rgba(255, 160, 0, 0.18)` | `rgba(255, 160, 0, 0.30)` | `--badge-orange-text` |
| 🟡 Yellow | `#FFE600` | `rgba(255, 230, 0, 0.18)` | `rgba(255, 230, 0, 0.30)` | `--badge-yellow-text` |
| 🟢 Green | `#00FF87` | `rgba(0, 255, 135, 0.18)` | `rgba(0, 255, 135, 0.30)` | `--badge-green-text` |
| 🔵 Blue | `#00AAFF` | `rgba(0, 170, 255, 0.18)` | `rgba(0, 170, 255, 0.30)` | `--badge-blue-text` |
| 🟣 Purple | `#B464FF` | `rgba(180, 100, 255, 0.18)` | `rgba(180, 100, 255, 0.30)` | `--badge-purple-text` |
| 🩷 Pink | `#FF50B4` | `rgba(255, 80, 180, 0.18)` | `rgba(255, 80, 180, 0.30)` | `--badge-pink-text` |
| 🩵 Teal | `#00FFDC` | `rgba(0, 255, 220, 0.18)` | `rgba(0, 255, 220, 0.30)` | `--badge-teal-text` |
| 💜 Violet | `#A050FF` | `rgba(160, 80, 255, 0.18)` | `rgba(160, 80, 255, 0.30)` | `--badge-violet-text` |

### Hub Colors

| Hub | Primary | Bright | Background |
|-----|---------|--------|------------|
| Content | `#8C69F0` | `#B794FF` | `rgba(140, 105, 240, 0.15)` |
| Enablement | `#22C55E` | `#4ADE80` | `rgba(34, 197, 94, 0.15)` |
| CoE | `#F59E0B` | `#FBBF24` | `rgba(245, 158, 11, 0.15)` |

### Status Badge Colors

| Status | Hex | Background | Trigger |
|--------|-----|------------|---------|
| NEW | `#00FF87` | `rgba(0, 255, 135, 0.20)` | Auto: `createdAt` within 14 days |
| FEATURED | `#FFA500` | `rgba(255, 160, 0, 0.20)` | Manual: `isFeatured: true` |

---

## 📝 Complete Type → Color Mapping

### 🔴 RED — Competitive & High-Stakes
```
battlecard, competitive, certification, partner-training, value-realization
zendesk, intercom, salesforce, gorgias, kustomer, ada, sierra, genesys
sprinklr, netomi, linc, decagon, partner
```

### 🟠 ORANGE — Calculators & One-Pagers
```
calculator, one-pager, impl, implementation
```

### 🟡 YELLOW — Templates & Proof
```
template, case-study, meeting-asset, proof-point, customer-quote
benchmark, industry-stat, competitor-stat
```

### 🟢 GREEN — Training & Learning (NOW INCLUDES PLAYBOOK)
```
gtm-training, product-training, technical-training, competitive-training
revops-training, customer-example, customer-success-metric, course
playbook, live-replay, on-demand, csm, customer-success
```

### 🔵 BLUE — Demo, Reports & Guides
```
demo, demo-video, demo-asset, report, product-overview, dashboard
usage-metrics, guide, best-practice, internal-best-practice
customer-best-practice, voice, sidekick-voice, copilot, insights
```

### 🟣 PURPLE — Decks & Presentations
```
deck, keynote, slides, gladly, gladly-team, gladly-sidekick
gladly-hero, sales, ae
```

### 🩷 PINK — Messaging & Communications (NOW INCLUDES ARTICLE)
```
messaging, sequence, article, press, promo, process-innovation
mktg, marketing
```

### 🩵 TEAL — Tools & Technical
```
gtm-tool, tool, document, prospect-example, prototype
guides, journeys, app-platform, answer-threads, sc, ps
```

### 💜 VIOLET — Internal & Special (NEW - REPLACES GRAY)
```
internal, web-link
(Also used as fallback for unknown types)
```

---

## 🏠 Homepage Updates

### Changes Required

1. **Hero Section**
   - Keep gradient top bar: `linear-gradient(90deg, #8C69F0, #22C55E, #F59E0B)`
   - Stats display: Hubs, Resources, Added This Week

2. **Quick Access Cards**
   - 3 cards with hub-colored icon backgrounds
   - Enablement (green), Competitive (red), Content (purple)

3. **Browse by Hub Grid**
   - 11 hub cards with colored icon backgrounds
   - Each color matches the hub/category

4. **Recently Added Section**
   - Asset cards with NEON type badges
   - Format badges colored by hub
   - CTA colored by hub

### Card Layout
```
┌─────────────────────────────────────────┐
│ [TYPE] [FORMAT]            [NEW/FEATURED]│
│  ↑        ↑                      ↑       │
│ NEON    HUB color         status badges │
│ color                        (right)     │
├─────────────────────────────────────────┤
│ Title (15px, 600 weight)                │
│ Description (13px, secondary)           │
├─────────────────────────────────────────┤
│ Date                        View →      │
│ (muted)                 (HUB color)     │
└─────────────────────────────────────────┘
```

---

## ⚙️ Admin Updates

### Navigation Changes
- Rename "Boards" → **"Hubs"**
- Nav items: Assets, Import, Tags, Hubs, Taxonomy, Analytics

### Stats Cards
- Total Assets, Active Hubs, Tags, Views This Week
- Dark surface background with subtle borders

### Table Styling
- Dark header: `#1A1A24`
- Row hover: `#1E1E28`
- Alternating rows: `rgba(255, 255, 255, 0.02)`
- Badges in Type, Format, Hub, Status columns

### Form Styling
- Dark inputs: `#1A1A24` background
- Focus state: Purple border + glow
- Select dropdowns styled to match

### Action Buttons
- Edit: Blue neon (`#00AAFF`)
- Delete: Red neon (`#FF5555`)
- Primary: Purple (`#8C69F0`)
- Secondary: Dark elevated

---

## 🔧 Implementation Steps

### Step 1: Update CSS Variables
Add to `globals.css`:

```css
:root {
  /* NEON Type Badge Colors */
  --badge-red-bg: rgba(255, 80, 80, 0.18);
  --badge-red-text: #FF5555;
  --badge-red-border: rgba(255, 80, 80, 0.30);
  
  --badge-orange-bg: rgba(255, 160, 0, 0.18);
  --badge-orange-text: #FFA500;
  --badge-orange-border: rgba(255, 160, 0, 0.30);
  
  --badge-yellow-bg: rgba(255, 230, 0, 0.18);
  --badge-yellow-text: #FFE600;
  --badge-yellow-border: rgba(255, 230, 0, 0.30);
  
  --badge-green-bg: rgba(0, 255, 135, 0.18);
  --badge-green-text: #00FF87;
  --badge-green-border: rgba(0, 255, 135, 0.30);
  
  --badge-blue-bg: rgba(0, 170, 255, 0.18);
  --badge-blue-text: #00AAFF;
  --badge-blue-border: rgba(0, 170, 255, 0.30);
  
  --badge-purple-bg: rgba(180, 100, 255, 0.18);
  --badge-purple-text: #B464FF;
  --badge-purple-border: rgba(180, 100, 255, 0.30);
  
  --badge-pink-bg: rgba(255, 80, 180, 0.18);
  --badge-pink-text: #FF50B4;
  --badge-pink-border: rgba(255, 80, 180, 0.30);
  
  --badge-teal-bg: rgba(0, 255, 220, 0.18);
  --badge-teal-text: #00FFDC;
  --badge-teal-border: rgba(0, 255, 220, 0.30);
  
  --badge-violet-bg: rgba(160, 80, 255, 0.18);
  --badge-violet-text: #A050FF;
  --badge-violet-border: rgba(160, 80, 255, 0.30);
  
  /* Brighter Hub Content */
  --hub-content-bright: #B794FF;
}
```

### Step 2: Update badge-config.ts
Replace with `badge-config-v4.ts`:
- Add `violet` color option
- Update TYPE_COLOR_MAP with new assignments
- Change fallback from 'gray' to 'violet'

Key changes:
```typescript
// Add violet color
violet: {
  bg: 'rgba(160, 80, 255, 0.18)',
  text: '#A050FF',
  border: 'rgba(160, 80, 255, 0.30)',
},

// Update mappings
'playbook': 'green',    // Was gray
'article': 'pink',      // Was gray
'press': 'pink',        // Was gray
'internal': 'violet',   // Was gray
'web-link': 'violet',   // Was gray
'guide': 'blue',        // Was gray
'document': 'teal',     // Was gray

// Change fallback
export function getTypeBadgeColor(typeSlug: string) {
  const colorKey = TYPE_COLOR_MAP[typeSlug?.toLowerCase()] || 'violet'; // Not 'gray'
  return BADGE_COLORS[colorKey];
}
```

### Step 3: Update Badge Component
Add violet variant support:

```tsx
// In Badge.tsx or wherever badges are rendered
case 'violet':
  return {
    bg: 'rgba(160, 80, 255, 0.18)',
    text: '#A050FF',
    border: 'rgba(160, 80, 255, 0.30)'
  };
```

### Step 4: Update Admin Navigation
In admin layout:
```tsx
// Change from "Boards" to "Hubs"
<NavItem href="/admin/manage/hubs">Hubs</NavItem>
```

### Step 5: Apply Dark Mode Styles
Ensure all admin pages use:
- Background: `#0D0D12` (base), `#16161D` (surface)
- Tables with dark headers and hover states
- Forms with dark inputs and purple focus

---

## 📁 Deliverables

### Files Provided
1. **gtm-design-system-v4-neon.html** — Complete visual reference
2. **badge-config-v4.ts** — TypeScript configuration
3. **gtm-design-system-v4.css** — Complete CSS
4. **mock-homepage-v4.html** — Homepage mockup
5. **mock-admin-v4.html** — Admin pages mockup
6. **IMPLEMENTATION-PLAN-v4-FULL.md** — This document

### File Locations for Claude Code
```
/lib/badge-config.ts       ← Replace with badge-config-v4.ts
/app/globals.css           ← Add CSS variables
/components/Badge.tsx      ← Add violet variant
/app/admin/layout.tsx      ← Update nav
/app/page.tsx              ← Homepage updates
/app/admin/manage/page.tsx ← Admin updates
```

---

## ✅ Verification Checklist

After implementation, verify:

### Homepage
- [ ] Hero gradient bar displays correctly
- [ ] Quick Access cards have colored icons
- [ ] Browse by Hub grid shows all 11 hubs
- [ ] Recently Added cards display NEON badges
- [ ] No gray badges appear anywhere
- [ ] CTA colors match hub colors
- [ ] Hover states work (border color change)

### Admin Pages
- [ ] Navigation shows "Hubs" (not "Boards")
- [ ] Stats cards display correctly
- [ ] Table has dark styling
- [ ] Type badges are NEON colors
- [ ] Playbook shows as GREEN
- [ ] Article shows as PINK
- [ ] Internal shows as VIOLET
- [ ] Edit button is BLUE
- [ ] Delete button is RED
- [ ] Forms have dark inputs
- [ ] Focus states show purple glow

### Badges
- [ ] All types have bright colors (no gray)
- [ ] Purple text is brighter (#B464FF)
- [ ] NEW badge is bright green (#00FF87)
- [ ] FEATURED badge is bright orange (#FFA500)
- [ ] Format badges match hub colors
- [ ] Unknown types fall back to violet

---

## 🚀 Deployment Notes

1. Deploy CSS changes first
2. Update badge-config.ts
3. Update Badge component
4. Update admin navigation
5. Test all pages
6. Verify no gray badges remain
7. Check mobile responsiveness

---

## 📞 Support

For questions about this design system:
- Reference the HTML mockups for visual guidance
- Use the TypeScript config for exact color values
- Check CSS file for complete class definitions
