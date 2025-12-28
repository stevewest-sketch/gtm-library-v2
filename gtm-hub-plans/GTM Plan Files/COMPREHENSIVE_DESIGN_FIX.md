# GTM Library v2 - COMPREHENSIVE Design Fix Prompt

## CRITICAL: Read This First

This prompt addresses ALL design discrepancies between the current implementation and the v7 HTML mock. Execute this as a single comprehensive update.

---

## Issue Summary

| Issue | Current | v7 Target |
|-------|---------|-----------|
| **Card body padding** | 16px | **20px** |
| **Card header margin** | 10px | **12px** |
| **Hub label** | "CONTENT TYPES" | **"CONTENT"** (hub name, not board name) |
| **Header logo** | Missing subtitle | Logo + "GTM Library" + "Revenue Enablement" |
| **Header search** | Different styling | 280px min-width, ⌘K kbd element |
| **Content area padding** | Wrong | **20px 28px** |
| **Tag background** | Various | **#F3F4F6** |
| **Footer border** | #E5E7EB | **#F3F4F6** |
| **Card hover** | Basic | translateY(-4px) + hub-colored border + **background tint** |
| **Sidebar width** | Varies | **240px** |
| **Filter width** | Varies | **220px** |

---

## CRITICAL DISTINCTION: Hubs vs Boards

### 3 HUBS (appear on card badges)
| Hub | Badge Text | Color | Light BG | Accent |
|-----|------------|-------|----------|--------|
| coe | **COE** | #F59E0B | #FEF3C7 | #B45309 |
| content | **CONTENT** | #8C69F0 | #EDE9FE | #6D28D9 |
| enablement | **ENABLEMENT** | #10B981 | #D1FAE5 | #047857 |

### 10 BOARDS (appear in sidebar navigation)
| Board ID | Display Name | Icon | Color |
|----------|--------------|------|-------|
| coe | CoE | 🏆 | #F59E0B |
| content | **Content Types** | 📚 | #8C69F0 |
| enablement | Enablement | 🎓 | #10B981 |
| product | Product | 📦 | #3B82F6 |
| competitive | Competitive | ⚔️ | #EF4444 |
| sales | Sales | 💼 | #0EA5E9 |
| csm | CSM | 🎯 | #8B5CF6 |
| sc | SC | 🔧 | #EC4899 |
| demo | Demo | 🎬 | #06B6D4 |
| proof | Proof Points | 📈 | #84CC16 |

**IMPORTANT:** When a card is in the "Content Types" board, the hub badge should say **"CONTENT"** not "CONTENT TYPES". The board name and hub name are different!

---

## Complete CSS Variables (v7 Exact)

```css
:root {
    /* Hub Colors */
    --coe-primary: #F59E0B;
    --coe-light: #FEF3C7;
    --coe-hover: #FFFBEB;
    --coe-accent: #B45309;
    
    --content-primary: #8C69F0;
    --content-light: #EDE9FE;
    --content-hover: #F5F3FF;
    --content-accent: #6D28D9;
    
    --enablement-primary: #10B981;
    --enablement-light: #D1FAE5;
    --enablement-hover: #ECFDF5;
    --enablement-accent: #047857;
    
    /* Board Colors (for non-hub boards) */
    --product-primary: #3B82F6;
    --competitive-primary: #EF4444;
    --sales-primary: #0EA5E9;
    --csm-primary: #8B5CF6;
    --sc-primary: #EC4899;
    --demo-primary: #06B6D4;
    --proof-primary: #84CC16;
    
    /* Neutral */
    --card-bg: #FFFFFF;
    --card-border: #E5E7EB;
    --text-primary: #111827;
    --text-secondary: #4B5563;
    --text-muted: #9CA3AF;
    --bg-page: #F9FAFB;
    --bg-dark: #111827;
    
    /* Card */
    --card-radius: 12px;
    --card-shadow-hover: 0 10px 25px rgba(0,0,0,0.1);
    
    /* Layout - THESE ARE CRITICAL */
    --sidebar-width: 240px;
    --filter-width: 220px;
    --header-height: 56px;
    
    --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

---

## 1. Global Header (v7 Exact)

```css
.global-header {
    background: linear-gradient(135deg, #111827 0%, #1F2937 100%);
    height: 56px;  /* var(--header-height) */
    display: flex;
    align-items: center;
    padding: 0 24px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
}

.header-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-right: 24px;
    border-right: 1px solid rgba(255,255,255,0.1);
    margin-right: 24px;
}

.header-logo {
    width: 32px;
    height: 32px;
    background: #10B981;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 12px;
}

.header-title {
    font-weight: 700;
    font-size: 14px;
    color: white;
}

.header-subtitle {
    font-size: 11px;
    color: rgba(255,255,255,0.5);
}

.header-breadcrumb {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
}

.breadcrumb-link {
    color: rgba(255,255,255,0.6);
    text-decoration: none;
    font-size: 14px;
}

.breadcrumb-link:hover { color: white; }

.breadcrumb-sep {
    color: rgba(255,255,255,0.3);
    font-size: 14px;
}

.breadcrumb-current {
    display: flex;
    align-items: center;
    gap: 8px;
    color: white;
    font-weight: 500;
    font-size: 14px;
}

.breadcrumb-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    /* Background color set dynamically based on current board */
}

.header-search {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    cursor: pointer;
    min-width: 280px;
}

.header-search:hover {
    background: rgba(255,255,255,0.12);
    border-color: rgba(255,255,255,0.2);
}

.header-search svg {
    width: 16px;
    height: 16px;
    color: rgba(255,255,255,0.5);
}

.header-search span {
    font-size: 13px;
    color: rgba(255,255,255,0.5);
    flex: 1;
}

.header-search kbd {
    font-size: 11px;
    padding: 3px 6px;
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
    color: rgba(255,255,255,0.5);
    font-family: inherit;
}
```

**Header HTML Structure:**
```html
<header class="global-header">
    <div class="header-brand">
        <div class="header-logo">G+</div>
        <div>
            <div class="header-title">GTM Library</div>
            <div class="header-subtitle">Revenue Enablement</div>
        </div>
    </div>
    
    <nav class="header-breadcrumb">
        <a href="/library" class="breadcrumb-link">Library</a>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">
            <span class="breadcrumb-icon" style="background: #F59E0B;">🏆</span>
            <span>CoE</span>
        </span>
    </nav>
    
    <div class="header-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>Search content...</span>
        <kbd>⌘K</kbd>
    </div>
</header>
```

---

## 2. Left Sidebar (v7 Exact - 240px)

```css
.sidebar {
    width: 240px;  /* CRITICAL: Must be exactly 240px */
    background: #FFFFFF;
    border-right: 1px solid #E5E7EB;
    position: fixed;
    top: 56px;  /* header height */
    left: 0;
    bottom: 0;
    overflow-y: auto;
    padding: 16px 12px;
}

.nav-section {
    margin-bottom: 20px;
}

.nav-section-title {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #9CA3AF;
    padding: 8px 10px 6px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    margin: 2px 0;
    border-radius: 6px;
    cursor: pointer;
    text-decoration: none;
    color: #111827;
    font-size: 13px;
    transition: all 0.15s ease;
}

.nav-item:hover { background: #F3F4F6; }

.nav-item.active { font-weight: 500; }

/* Board-specific active states */
.nav-item.active[data-board="coe"] { background: #FEF3C7; color: #B45309; }
.nav-item.active[data-board="content"] { background: #EDE9FE; color: #6D28D9; }
.nav-item.active[data-board="enablement"] { background: #D1FAE5; color: #047857; }
.nav-item.active[data-board="product"] { background: #DBEAFE; color: #1D4ED8; }
.nav-item.active[data-board="competitive"] { background: #FEE2E2; color: #B91C1C; }
.nav-item.active[data-board="sales"] { background: #E0F2FE; color: #0369A1; }
.nav-item.active[data-board="csm"] { background: #EDE9FE; color: #6D28D9; }
.nav-item.active[data-board="sc"] { background: #FCE7F3; color: #BE185D; }
.nav-item.active[data-board="demo"] { background: #CFFAFE; color: #0E7490; }
.nav-item.active[data-board="proof"] { background: #ECFCCB; color: #4D7C0F; }

.nav-item-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

/* Board dot colors */
.nav-item[data-board="coe"] .nav-item-dot { background: #F59E0B; }
.nav-item[data-board="content"] .nav-item-dot { background: #8C69F0; }
.nav-item[data-board="enablement"] .nav-item-dot { background: #10B981; }
.nav-item[data-board="product"] .nav-item-dot { background: #3B82F6; }
.nav-item[data-board="competitive"] .nav-item-dot { background: #EF4444; }
.nav-item[data-board="sales"] .nav-item-dot { background: #0EA5E9; }
.nav-item[data-board="csm"] .nav-item-dot { background: #8B5CF6; }
.nav-item[data-board="sc"] .nav-item-dot { background: #EC4899; }
.nav-item[data-board="demo"] .nav-item-dot { background: #06B6D4; }
.nav-item[data-board="proof"] .nav-item-dot { background: #84CC16; }

.nav-item-label { flex: 1; }

.nav-item-count {
    font-size: 11px;
    color: #9CA3AF;
    background: #F9FAFB;
    padding: 2px 8px;
    border-radius: 10px;
}

.nav-item-icon {
    width: 20px;
    text-align: center;
    font-size: 14px;
}
```

---

## 3. Filter Sidebar (v7 Exact - 220px)

```css
.filter-sidebar {
    width: 220px;  /* CRITICAL: Must be exactly 220px */
    background: #FFFFFF;
    border-right: 1px solid #E5E7EB;
    padding: 20px 16px;
    overflow-y: auto;
}

.filter-section {
    margin-bottom: 28px;
}

.filter-section-title {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #9CA3AF;
    margin-bottom: 14px;
}

.filter-checkbox {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    cursor: pointer;
    font-size: 14px;
    color: #111827;
}

.filter-checkbox input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #8C69F0;
    cursor: pointer;
    border-radius: 4px;
}

.filter-checkbox:hover { color: #8C69F0; }

.filter-group { margin-bottom: 4px; }

.filter-group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #111827;
}

.filter-group-header:hover { color: #8C69F0; }

.filter-group-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.filter-group-icon { font-size: 16px; }

.filter-group-chevron {
    width: 18px;
    height: 18px;
    color: #9CA3AF;
    transition: transform 0.2s ease;
}

.filter-group.expanded .filter-group-chevron {
    transform: rotate(180deg);
}

.filter-group-items {
    display: none;
    padding-left: 28px;
    padding-bottom: 8px;
}

.filter-group.expanded .filter-group-items {
    display: block;
}
```

---

## 4. Content Area (v7 Exact)

```css
.content-area {
    flex: 1;
    padding: 20px 28px;  /* CRITICAL: 20px top/bottom, 28px left/right */
    overflow-y: auto;
}

/* Tabs */
.view-tabs {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.tabs {
    display: flex;
    gap: 4px;
    background: #F9FAFB;
    padding: 4px;
    border-radius: 8px;
}

.tab {
    padding: 7px 14px;
    font-size: 13px;
    font-weight: 500;
    color: #4B5563;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.tab:hover { color: #111827; }

.tab.active {
    background: #FFFFFF;
    color: #8C69F0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.view-options {
    display: flex;
    align-items: center;
    gap: 10px;
}

.sort-select {
    padding: 7px 32px 7px 12px;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    background: #FFFFFF url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 10px center;
    cursor: pointer;
    appearance: none;
}

.view-btn {
    padding: 7px 14px;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    font-size: 13px;
    background: #FFFFFF;
    cursor: pointer;
    color: #4B5563;
}

.view-btn:hover { background: #F3F4F6; }

/* Content Section */
.content-section {
    margin-bottom: 28px;
}

.section-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 14px;
}
```

---

## 5. Card Grid (v7 Exact)

```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

@media (max-width: 1400px) { 
    .card-grid { grid-template-columns: repeat(3, 1fr); } 
}

@media (max-width: 1100px) { 
    .card-grid { grid-template-columns: repeat(2, 1fr); } 
    .filter-sidebar { width: 200px; } 
}

@media (max-width: 768px) { 
    .sidebar { display: none; } 
    .main { margin-left: 0; } 
    .filter-sidebar { display: none; } 
    .card-grid { grid-template-columns: 1fr; } 
}
```

---

## 6. Library Card (v7 EXACT - This is Critical)

```css
.library-card {
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: all 0.2s ease;
}

.library-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.library-card__hub-bar {
    height: 4px;
}

.library-card__body {
    padding: 20px;  /* CRITICAL: Must be 20px, not 16px */
    display: flex;
    flex-direction: column;
    flex: 1;
}

.library-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;  /* CRITICAL: Must be 12px, not 10px */
    gap: 10px;
}

.library-card__hub {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 4px 10px;  /* CRITICAL: 4px 10px, not 3px 8px */
    border-radius: 4px;
}

.library-card__format {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 500;
    color: #4B5563;
}

.library-card__format svg {
    width: 16px;
    height: 16px;
}

.library-card__title {
    font-size: 14px;
    font-weight: 700;  /* CRITICAL: 700, not 600 */
    margin-bottom: 6px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.library-card__description {
    font-size: 12px;
    color: #4B5563;
    line-height: 1.5;
    margin-bottom: 12px;
    flex-grow: 1;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.library-card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 12px;
}

.library-card__tag {
    font-size: 10px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 4px;
    background: #F3F4F6;  /* CRITICAL: #F3F4F6, not #F9FAFB */
    color: #4B5563;
}

.library-card__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #F3F4F6;  /* CRITICAL: #F3F4F6, not #E5E7EB */
}

.library-card__meta {
    font-size: 11px;
    color: #9CA3AF;
    display: flex;
    gap: 10px;
}

.library-card__link {
    font-size: 12px;
    font-weight: 600;
}

/* Hub Variants */
.library-card--coe .library-card__hub-bar { background: #F59E0B; }
.library-card--coe .library-card__hub { background: #FEF3C7; color: #B45309; }
.library-card--coe .library-card__link { color: #F59E0B; }
.library-card--coe:hover { border-color: #F59E0B; }
.library-card--coe:hover .library-card__body { background: #FFFBEB; }  /* Hover background tint */

.library-card--content .library-card__hub-bar { background: #8C69F0; }
.library-card--content .library-card__hub { background: #EDE9FE; color: #6D28D9; }
.library-card--content .library-card__link { color: #8C69F0; }
.library-card--content:hover { border-color: #8C69F0; }
.library-card--content:hover .library-card__body { background: #F5F3FF; }

.library-card--enablement .library-card__hub-bar { background: #10B981; }
.library-card--enablement .library-card__hub { background: #D1FAE5; color: #047857; }
.library-card--enablement .library-card__link { color: #10B981; }
.library-card--enablement:hover { border-color: #10B981; }
.library-card--enablement:hover .library-card__body { background: #ECFDF5; }
```

---

## 7. Hub Label Logic (CRITICAL FIX)

The hub badge on cards should show the HUB name, not the BOARD name:

```typescript
// CORRECT hub label mapping
const hubLabels = {
    coe: 'CoE',           // Badge shows "COE"
    content: 'Content',   // Badge shows "CONTENT" (NOT "Content Types")
    enablement: 'Enablement' // Badge shows "ENABLEMENT"
};

// In your card component:
function LibraryCard({ hub, ... }) {
    const hubConfig = {
        coe: { label: 'CoE', ... },
        content: { label: 'Content', ... },  // NOT "Content Types"
        enablement: { label: 'Enablement', ... }
    };
    
    return (
        <span className="library-card__hub">
            {hubConfig[hub].label}  {/* Shows "CONTENT" not "CONTENT TYPES" */}
        </span>
    );
}
```

**Remember:**
- "Content Types" is a BOARD name (in sidebar navigation)
- "Content" is the HUB name (on card badges)
- Items in the "Content Types" board have `hub: 'content'`, so badge shows "CONTENT"

---

## 8. Main Layout Structure (v7 Exact)

```css
.app {
    display: flex;
    min-height: 100vh;
    padding-top: 56px;  /* header height */
}

.main {
    flex: 1;
    margin-left: 240px;  /* sidebar width */
    display: flex;
}
```

```html
<div class="app">
    <aside class="sidebar">...</aside>
    <main class="main">
        <aside class="filter-sidebar">...</aside>
        <div class="content-area">...</div>
    </main>
</div>
```

---

## Checklist for Claude Code

Execute these fixes in order:

1. ☐ Update all CSS variables to match v7 exactly
2. ☐ Fix header: Add subtitle "Revenue Enablement", fix search bar styling with kbd
3. ☐ Fix sidebar width to exactly 240px
4. ☐ Fix filter sidebar width to exactly 220px
5. ☐ Fix content area padding to 20px 28px
6. ☐ Fix card body padding to 20px
7. ☐ Fix card header margin to 12px
8. ☐ Fix hub badge padding to 4px 10px
9. ☐ Fix card title font-weight to 700
10. ☐ Fix tag background to #F3F4F6
11. ☐ Fix footer border to #F3F4F6
12. ☐ Add hover background tint to cards
13. ☐ **Fix hub labels: "Content" not "Content Types"**
14. ☐ Update all planning documents with these specifications

---

## Quick Diff Summary

| Property | Current | v7 Target |
|----------|---------|-----------|
| `--sidebar-width` | ? | `240px` |
| `--filter-width` | ? | `220px` |
| `.content-area padding` | ? | `20px 28px` |
| `.library-card__body padding` | 16px | `20px` |
| `.library-card__header margin-bottom` | 10px | `12px` |
| `.library-card__hub padding` | 3px 8px | `4px 10px` |
| `.library-card__title font-weight` | 600 | `700` |
| `.library-card__tag background` | #F9FAFB | `#F3F4F6` |
| `.library-card__footer border-color` | #E5E7EB | `#F3F4F6` |
| Card hover | border only | border + `background tint` |
| Hub label for content board | "CONTENT TYPES" | `"CONTENT"` |
