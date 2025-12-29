# GTM Library - Card Design v5 Implementation Plan

## Summary of Changes

### 1. New `shortDescription` Field
- **Purpose:** 6-word max summary shown on card view
- **Full description:** Shown when asset is clicked (detail view)
- **Location:** After `description` field in schema

### 2. Cleaned Proof Point Titles
Removed type prefixes from titles for cleaner display:

| Before | After |
|--------|-------|
| `Benchmark: Industry average: 70% Median: 75%` | `Industry FCR Benchmark - Voice` |
| `Competitor Stat: Ada - 291% ROI` | `Ada - 291% ROI` |
| `Customer Quote - Customer Quote` | `Breeze Airways - Reduced agent attrition` |

### 3. Board Default Views
- **All standard boards:** Default to **Card** view (grid)
- **Proof Point board:** Default to **Stack** view (list) - configurable in board editor

---

## Schema Changes

### Add `shortDescription` field to `catalog` table:

```sql
ALTER TABLE catalog 
ADD COLUMN short_description TEXT;

COMMENT ON COLUMN catalog.short_description IS 
'6-word max summary for card display. Full description shown on detail view.';
```

### Board Settings for Default View:

```sql
ALTER TABLE boards 
ADD COLUMN default_view TEXT DEFAULT 'grid' CHECK (default_view IN ('grid', 'stack'));

-- Set Proof Points board to default to stack view
UPDATE boards SET default_view = 'stack' WHERE slug = 'proof-points';
```

---

## Card Design Specifications

### Card View (156px fixed height)
```
┌─────────────────────────────────────────┐
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │  ← 4px hub color bar
│                                         │
│  ⚔️ BATTLECARD                    PDF   │  ← Type badge + Format
│                                         │
│  Ada Battlecard                         │  ← Title (1-2 lines max)
│  Competitive positioning vs Ada         │  ← Short Description (single line)
│                                         │
├─────────────────────────────────────────┤
│  Dec 10, 2024                  View →   │  ← Footer
└─────────────────────────────────────────┘

Height: 156px (fixed)
```

### Stack/List View (Proof Points default)
```
┌──────────────────────────────────────────────────────────────────────┐
│ ▌ 📈 SUCCESS METRIC │ Breeze Airways - 61% resolution rate │ View → │
└──────────────────────────────────────────────────────────────────────┘

No description - title only
Left border: 3px hub color
```

---

## React Component Updates

### LibraryCard.tsx
```tsx
interface LibraryCardProps {
  title: string;
  shortDescription: string;  // NEW FIELD
  description: string;       // For detail view
  slug: string;
  hub: 'content' | 'enablement' | 'coe';
  format: string;
  type: string;
  publishDate?: string;
  externalUrl?: string;
}

export function LibraryCard({
  title,
  shortDescription,  // NEW
  slug,
  hub,
  format,
  type,
  publishDate,
  externalUrl,
}: LibraryCardProps) {
  return (
    <Link href={...} className="... h-[156px] ...">
      {/* Header */}
      <div className="...">
        <TypeBadge type={type} />
        <span className="text-gray-400">{format}</span>
      </div>
      
      {/* Body */}
      <div className="flex-1 flex flex-col justify-center px-4 py-2">
        <h4 className="text-sm font-semibold line-clamp-2">{title}</h4>
        <p className="text-xs text-gray-500 truncate">{shortDescription}</p>  {/* NEW */}
      </div>
      
      {/* Footer */}
      <div className="...">
        <span>{publishDate}</span>
        <span>View →</span>
      </div>
    </Link>
  );
}
```

### Board Component - Default View Logic
```tsx
interface Board {
  id: string;
  name: string;
  slug: string;
  defaultView: 'grid' | 'stack';  // NEW FIELD
}

function BoardPage({ board, assets }: { board: Board; assets: Asset[] }) {
  const [view, setView] = useState(board.defaultView);  // Use board's default
  
  return (
    <div>
      <ViewToggle value={view} onChange={setView} />
      
      {view === 'grid' ? (
        <CardGrid assets={assets} />
      ) : (
        <StackList assets={assets} />
      )}
    </div>
  );
}
```

---

## CSS Updates

```css
/* Card with short description */
.library-card {
  height: 156px;  /* Increased from 140px */
}

.card-short-desc {
  font-size: 12px;
  color: #6B7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

---

## Data Processing

### Short Description Generation Rules

| Content Type | Short Description Pattern |
|--------------|--------------------------|
| **Battlecard** | "Competitive positioning vs {competitor}" |
| **Template** | "Ready-to-use {purpose} template" |
| **Training** | "{Product} product training session" |
| **Dashboard** | "Analytics dashboard for {topic}" |
| **Benchmark** | "Industry {KPI} benchmark for {channel}" |
| **Customer Success Metric** | "{Brand} achieved {%} improvement" |
| **Competitor Stat** | "{Competitor} claims {metric}" |
| **Customer Quote** | "{Brand} on {theme}" |

### Title Cleaning Rules (Proof Points)

1. **Remove type prefixes:** "Benchmark:", "Competitor Stat:", etc.
2. **Benchmark format:** `Industry {KPI} Benchmark - {Channel}`
3. **Customer quote format:** `{Brand} - {Key theme from quote}`
4. **Keep metrics intact:** "Breeze Airways - 61% resolution rate"

---

## CSV Import Instructions

### New Field in CSV
The updated CSV includes `shortDescription` field after `description`:

```csv
title,slug,description,shortDescription,externalUrl,...
Ada Battlecard,ada-battlecard,Competitive battle card...,Competitive positioning vs Ada,https://...
```

### Import Steps
1. Update Supabase schema with `short_description` column
2. Use bulk import to load `assets-library-with-short-desc.csv`
3. Map `shortDescription` to `short_description` column

---

## Files Delivered

| File | Description |
|------|-------------|
| `assets-library-with-short-desc.csv` | 413 assets with cleaned titles + shortDescription field |
| `card-design-v5.html` | Visual design reference with card + stack views |

---

## Board Editor Settings

Add to board editor UI:
```
Default View: [Grid ▼] / [Stack]
  - Grid: Cards in responsive grid (default for most boards)
  - Stack: List view with minimal info (default for Proof Points)
```

This setting should be persisted in the `boards` table and used when rendering the board page.
