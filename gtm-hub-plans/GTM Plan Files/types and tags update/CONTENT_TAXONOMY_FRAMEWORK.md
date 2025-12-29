# GTM Library Content Taxonomy Framework

## Overview

This document defines the standardized taxonomy for organizing content in the GTM Library. All assets are classified by **Hub**, **Format**, and **Type**, with additional **Tags** for filtering.

---

## Layer 1: HUB

The organizational home for the asset. Determines card styling and navigation.

| Hub | Color | Card Style | Description |
|-----|-------|------------|-------------|
| **Content** | Purple `#8C69F0` | Purple hover, FORMAT badge | External-facing materials for prospects/customers |
| **Enablement** | Green `#009B00` | Dark header, TYPE badge | Training & learning for internal teams |
| **CoE** | Orange `#F59E0B` | Orange accent bar, TYPE badge | Center of Excellence - processes, tools, methodologies |

---

## Layer 2: FORMAT

Physical file/delivery type. Displayed as badge on Content cards.

| Value | Display Name | Icon | Description | File Types |
|-------|--------------|------|-------------|------------|
| `slides` | Slides | 📊 | Presentation decks | Google Slides, PowerPoint |
| `document` | Document | 📄 | Text documents | Google Docs, Word |
| `spreadsheet` | Spreadsheet | 📈 | Tabular data | Google Sheets, Excel |
| `pdf` | PDF | 📕 | PDF documents | .pdf files |
| `video` | Video | 🎬 | Video recordings | Wistia, Loom, YouTube |
| `article` | Article | 📰 | External articles | Web articles, PR |
| `tool` | Tool | 🛠️ | Interactive tools | Calculator, dashboard, Figma |
| `guide` | Guide | 📖 | How-to guides | Step-by-step docs |
| `sequence` | Sequence | 📧 | Email sequences | Outreach.io |
| `live-replay` | Live Replay | 🔴 | Live session recordings | Gong, Zoom recordings |
| `on-demand` | On Demand | ▶️ | Pre-recorded content | Training videos |
| `course` | Course | 🎓 | Multi-module learning | Google Classroom, LMS |
| `web-link` | Web Link | 🔗 | External web pages | External URLs, web apps |

---

## Layer 3: TYPE

Semantic category - what purpose does the content serve? Displayed as badge on Enablement and CoE cards.

### Content Hub Types

| Value | Display Name | Description |
|-------|--------------|-------------|
| `deck` | Deck | Meeting presentation decks |
| `battlecard` | Battlecard | Competitive battle cards |
| `one-pager` | One-Pager | Single-page overviews |
| `template` | Template | Reusable templates |
| `messaging` | Messaging | Positioning/messaging docs |
| `calculator` | Calculator | ROI/pricing calculators |
| `competitive` | Competitive | Competitive analysis |
| `guide` | Guide | Process/how-to guide |
| `press` | Press | PR/media coverage |
| `case-study` | Case Study | Customer case studies |

### Enablement Hub Types

| Value | Display Name | Description |
|-------|--------------|-------------|
| `product-training` | Product Training | Product-focused training |
| `technical-training` | Technical Training | Technical deep dives |
| `gtm-training` | GTM Training | GTM and sales strategy training |
| `gtm-tool` | GTM Tool | GTM tools and resources |
| `competitive-training` | Competitive Training | Competitive training |
| `certification` | Certification | Certification programs |
| `partner-training` | Partner Training | Partner training |
| `value-realization` | Value Realization | BVA/value training |
| `playbook` | Playbook | Playbook walkthroughs |

### CoE Hub Types

| Value | Display Name | Description |
|-------|--------------|-------------|
| `customer-meeting-asset` | Customer Meeting Asset | Real customer meeting examples |
| `prospect-meeting-asset` | Prospect Meeting Asset | Real prospect meeting examples |
| `customer-best-practice` | Customer Best Practice | Customer best practices |
| `best-practice` | Best Practice | Documented best practices |
| `internal-best-practice` | Internal Best Practice | Internal process examples |
| `process-innovation` | Process Innovation | New process innovations |
| `proof-point` | Proof Point | Customer proof points/metrics |
| `dashboard` | Dashboard | Performance dashboards |

---

## Layer 4: TAGS

Freeform tags for search and filtering. Products and Teams are now tags, not separate fields.

### Product Tags

| Tag | Display Name |
|-----|--------------|
| `gladly` | Gladly |
| `gladly-team` | Gladly Team |
| `voice` | Voice |
| `guides` | Guides |
| `journeys` | Journeys |
| `app-platform` | App Platform |
| `copilot` | Copilot |
| `insights` | Insights |

### Team Tags

| Tag | Display Name |
|-----|--------------|
| `sales` | Sales |
| `ae` | Account Executive |
| `csm` | Customer Success |
| `sc` | Solutions Consultant |
| `ps` | Professional Services |
| `impl` | Implementation |
| `mktg` | Marketing |
| `partner` | Partners |

### Other Tags

- Competitors: `zendesk`, `intercom`, `salesforce`, `gorgias`, `kustomer`, `ada`, `sierra`, etc.
- Verticals: `retail`, `travel`, `hospitality`, `marketplace`, `ecommerce`, `airline`
- Topics: `discovery`, `pricing`, `objection-handling`, `roi`, `bva`, `implementation`, `security`

---

## Board Architecture

### Current Boards

| Board | Description |
|-------|-------------|
| Content | All Content Hub assets |
| Enablement | All Enablement Hub assets |
| CoE | All CoE Hub assets |
| Competitive | Battlecards and competitive analysis |

### Planned: Product Board

A new **Product** board with sections for each product tag:

```
Product Board
├── Gladly (filter: tag=gladly)
├── Gladly Team (filter: tag=gladly-team)
├── Voice (filter: tag=voice)
├── Guides (filter: tag=guides)
├── Journeys (filter: tag=journeys)
├── App Platform (filter: tag=app-platform)
├── Copilot (filter: tag=copilot)
└── Insights (filter: tag=insights)
```

This allows users to browse all content related to a specific product regardless of hub.

---

## Display Name Formatting

When displaying values in the UI, convert slug format to title case:

```javascript
function formatDisplayName(value) {
  return value
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Examples:
// 'product-training' → 'Product Training'
// 'gtm-strategy' → 'Gtm Strategy' → manually map to 'GTM Strategy'
// 'one-pager' → 'One Pager' → manually map to 'One-Pager'
```

### Special Display Name Mappings

| Value | Display Name |
|-------|--------------|
| `gtm-training` | GTM Training |
| `gtm-tool` | GTM Tool |
| `bva` | BVA |
| `roi` | ROI |
| `one-pager` | One-Pager |
| `csm` | CSM |
| `ae` | AE |
| `sc` | SC |
| `ps` | PS |

---

## CSV Schema

```csv
title,slug,description,externalUrl,videoUrl,slidesUrl,keyAssetUrl,transcriptUrl,hub,format,type,tags,boards,status,durationMinutes,views,shares,createdAt
```

### Example Rows

```csv
# Content Hub - Battlecard
Zendesk Battlecard,zendesk-battlecard,Competitive battle card for Zendesk,https://...,,,,,content,pdf,battlecard,zendesk|competitive|gladly|sales,content|competitive,published,,0,0,2025-01-01

# Enablement Hub - Product Training
Sidekick Voice Deep Dive,sidekick-voice-deep-dive,Complete overview of Voice AI,https://...,https://...,,,enablement,live-replay,product-training,voice|sales|sc,enablement,published,45,0,0,2025-01-01

# CoE Hub - Dashboard
Agent Communication Time Metric,act-metric,ACT savings metric guide,https://...,,,,,coe,document,dashboard,insights|csm|metrics,coe,published,,0,0,2025-01-01
```

---

## Implementation Checklist

- [ ] Update CSV with new format values (add `live-replay`, `on-demand`, `course`)
- [ ] Update CSV with new Enablement type values
- [ ] Merge product and teams fields into tags
- [ ] Create Product board with product tag sections
- [ ] Implement display name formatting in UI
- [ ] Update filter dropdowns with new values
