# GTM Library Homepage Management Plan

## Overview

This document outlines the backend architecture and admin interface for managing the GTM Library homepage content, including featured boards, hero section, and recently added feed.

---

## Database Schema

### New Table: `homepage_config`

Single-row configuration table for homepage settings.

```sql
CREATE TABLE homepage_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Hero Section
  hero_title TEXT NOT NULL DEFAULT 'GTM Hub',
  hero_subtitle TEXT NOT NULL DEFAULT 'Your central hub for selling, supporting, and growing with Gladly.',
  show_hero BOOLEAN DEFAULT true,
  
  -- Hub Cards
  show_hub_cards BOOLEAN DEFAULT true,
  hub_cards_order JSONB DEFAULT '["coe", "content", "enablement"]',
  
  -- Featured Board
  featured_board_id UUID REFERENCES boards(id),
  featured_board_enabled BOOLEAN DEFAULT true,
  featured_board_max_items INTEGER DEFAULT 3,
  featured_board_title_override TEXT, -- Optional override for display
  featured_board_description_override TEXT,
  featured_board_icon TEXT DEFAULT '🎯',
  
  -- Recently Added
  recently_added_enabled BOOLEAN DEFAULT true,
  recently_added_max_items INTEGER DEFAULT 6,
  recently_added_new_threshold_days INTEGER DEFAULT 7, -- Days to show green dot
  
  -- Metadata
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Ensure only one config row
CREATE UNIQUE INDEX homepage_config_singleton ON homepage_config ((true));
```

### New Table: `homepage_featured_boards`

For multiple featured boards (rotation or manual selection).

```sql
CREATE TABLE homepage_featured_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  
  -- Display settings
  title_override TEXT,
  description_override TEXT,
  icon TEXT DEFAULT '📌',
  
  -- Scheduling
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  
  -- Ordering
  sort_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_featured_boards_active ON homepage_featured_boards(is_active, sort_order);
```

---

## API Endpoints

### GET `/api/homepage`

Returns all homepage data in a single call.

```typescript
interface HomepageResponse {
  hero: {
    title: string;
    subtitle: string;
    showHubCards: boolean;
    hubCardsOrder: string[];
  };
  featuredBoard: {
    id: string;
    title: string;
    description: string;
    icon: string;
    resourceCount: number;
    lastUpdated: string;
    items: CatalogItem[];
  } | null;
  recentlyAdded: {
    items: CatalogItem[];
    newThresholdDays: number;
  };
}
```

### GET `/api/admin/homepage`

Returns full config for admin editing.

### PUT `/api/admin/homepage`

Updates homepage configuration.

```typescript
interface UpdateHomepageRequest {
  hero?: {
    title?: string;
    subtitle?: string;
    showHubCards?: boolean;
  };
  featuredBoard?: {
    boardId?: string;
    enabled?: boolean;
    maxItems?: number;
    titleOverride?: string;
    descriptionOverride?: string;
    icon?: string;
  };
  recentlyAdded?: {
    enabled?: boolean;
    maxItems?: number;
    newThresholdDays?: number;
  };
}
```

### POST `/api/admin/homepage/featured-boards`

Add a board to featured rotation.

### DELETE `/api/admin/homepage/featured-boards/:id`

Remove a board from featured rotation.

---

## Admin Interface

### Homepage Settings Page

Located at `/admin/homepage`

```
┌─────────────────────────────────────────────────────────────────────┐
│  Homepage Settings                                    [Save Changes] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  HERO SECTION                                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Title                                                          │ │
│  │  [GTM Hub                                               ]       │ │
│  │                                                                  │ │
│  │  Subtitle                                                        │ │
│  │  [Your central hub for selling, supporting, and growing...]     │ │
│  │                                                                  │ │
│  │  [✓] Show Hub Cards (CoE, Content, Enablement)                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  FEATURED BOARD SPOTLIGHT                                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  [✓] Enable Featured Board Section                              │ │
│  │                                                                  │ │
│  │  Select Board                                                    │ │
│  │  [▼ Apex 2 Naming and Messaging                            ]    │ │
│  │                                                                  │ │
│  │  Icon    Title Override (optional)                               │ │
│  │  [🎯]   [                                               ]       │ │
│  │                                                                  │ │
│  │  Description Override (optional)                                 │ │
│  │  [                                                       ]       │ │
│  │                                                                  │ │
│  │  Max Items to Display                                            │ │
│  │  [3 ▼]                                                          │ │
│  │                                                                  │ │
│  │  ── Preview ──────────────────────────────────────────────────  │ │
│  │  │ 🎯 Apex 2 Naming and Messaging                     12 items │ │
│  │  │ Updated positioning, naming conventions...                   │ │
│  │  └────────────────────────────────────────────────────────────  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  RECENTLY ADDED                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  [✓] Enable Recently Added Section                              │ │
│  │                                                                  │ │
│  │  Max Items         "New" Badge Threshold                         │ │
│  │  [6 ▼]            [7 ▼] days                                    │ │
│  │                                                                  │ │
│  │  Items newer than 7 days will show green indicator dot          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Featured Board Selection Modal

```
┌─────────────────────────────────────────────────────────────────────┐
│  Select Featured Board                                          [×] │
├─────────────────────────────────────────────────────────────────────┤
│  [🔍 Search boards...                                          ]    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ● Apex 2 Naming and Messaging              12 items   Dec 28   │ │
│  │   Updated positioning and messaging for Apex 2 launch          │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │ ○ Q1 2025 Sales Kickoff                    8 items    Dec 20   │ │
│  │   Kickoff materials and resources                              │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │ ○ Sidekick Voice Launch                    15 items   Dec 15   │ │
│  │   Voice AI product launch resources                            │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │ ○ Competitive Intel - Q4                   22 items   Dec 10   │ │
│  │   Latest competitive analysis                                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│                                              [Cancel]  [Select]      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Phase 1: Database & API

- [ ] Create `homepage_config` table
- [ ] Create `homepage_featured_boards` table  
- [ ] Seed default homepage config
- [ ] Create `GET /api/homepage` endpoint
- [ ] Create `GET /api/admin/homepage` endpoint
- [ ] Create `PUT /api/admin/homepage` endpoint
- [ ] Add RLS policies (public read, admin write)

### Phase 2: Frontend - Homepage

- [ ] Create `useHomepage()` hook for data fetching
- [ ] Update HomePage component to use dynamic config
- [ ] Implement FeaturedBoard component
- [ ] Implement RecentlyAdded component with "new" indicators
- [ ] Add loading states and error handling

### Phase 3: Admin Interface

- [ ] Create `/admin/homepage` route
- [ ] Build HomepageSettingsForm component
- [ ] Build FeaturedBoardSelector modal
- [ ] Add live preview functionality
- [ ] Add save/publish workflow

### Phase 4: Advanced Features

- [ ] Featured board scheduling (start/end dates)
- [ ] Multiple featured boards rotation
- [ ] A/B testing different homepage layouts
- [ ] Analytics tracking for homepage engagement

---

## React Components

### `HomePage.tsx`

```typescript
export default function HomePage() {
  const { data, isLoading } = useHomepage();
  
  if (isLoading) return <HomePageSkeleton />;
  
  return (
    <main className="main">
      {/* Hero Section */}
      <HeroSection 
        title={data.hero.title}
        subtitle={data.hero.subtitle}
        showHubCards={data.hero.showHubCards}
      />
      
      <div className="content-area">
        {/* Featured Board */}
        {data.featuredBoard && (
          <FeaturedBoardSection board={data.featuredBoard} />
        )}
        
        {/* Recently Added */}
        <RecentlyAddedSection 
          items={data.recentlyAdded.items}
          newThresholdDays={data.recentlyAdded.newThresholdDays}
        />
      </div>
    </main>
  );
}
```

### `FeaturedBoardSection.tsx`

```typescript
interface FeaturedBoardSectionProps {
  board: {
    id: string;
    title: string;
    description: string;
    icon: string;
    resourceCount: number;
    lastUpdated: string;
    items: CatalogItem[];
  };
}

export function FeaturedBoardSection({ board }: FeaturedBoardSectionProps) {
  return (
    <section className="featured-section">
      <div className="section-header">
        <div className="section-header-left">
          <span className="featured-badge">⭐ Featured</span>
          <h2 className="section-title">Spotlight</h2>
        </div>
        <Link href={`/board/${board.id}`} className="section-link">
          View Board →
        </Link>
      </div>
      
      <div className="featured-board">
        <div className="featured-board-header">
          <div className="featured-board-icon">{board.icon}</div>
          <div className="featured-board-info">
            <h3>{board.title}</h3>
            <p>{board.description}</p>
          </div>
          <div className="featured-board-meta">
            <div className="board-stat">
              <div className="board-stat-value">{board.resourceCount}</div>
              <div className="board-stat-label">Resources</div>
            </div>
            <div className="board-stat">
              <div className="board-stat-value">
                {formatDate(board.lastUpdated)}
              </div>
              <div className="board-stat-label">Updated</div>
            </div>
          </div>
        </div>
        
        <div className="featured-board-content">
          <div className="featured-cards-grid">
            {board.items.map(item => (
              <LibraryCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

### `RecentlyAddedSection.tsx`

```typescript
interface RecentlyAddedSectionProps {
  items: CatalogItem[];
  newThresholdDays: number;
}

export function RecentlyAddedSection({ 
  items, 
  newThresholdDays 
}: RecentlyAddedSectionProps) {
  const isNew = (createdAt: string) => {
    const created = new Date(createdAt);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - newThresholdDays);
    return created > threshold;
  };
  
  return (
    <section className="recent-section">
      <div className="recent-header">
        <div className="recent-title">
          <h2>Recently Added</h2>
          <span className="new-badge">Live Feed</span>
        </div>
        <Link href="/library?sort=newest" className="section-link">
          View All →
        </Link>
      </div>
      
      <div className="recent-cards-grid">
        {items.map(item => (
          <LibraryCard 
            key={item.id} 
            item={item}
            showNewIndicator={isNew(item.createdAt)}
          />
        ))}
      </div>
    </section>
  );
}
```

---

## Supabase Query Examples

### Get Homepage Data

```typescript
async function getHomepageData() {
  // Get config
  const { data: config } = await supabase
    .from('homepage_config')
    .select('*')
    .single();
  
  // Get featured board with items
  let featuredBoard = null;
  if (config.featured_board_enabled && config.featured_board_id) {
    const { data: board } = await supabase
      .from('boards')
      .select(`
        *,
        catalog:board_items(
          catalog(*)
        )
      `)
      .eq('id', config.featured_board_id)
      .single();
    
    featuredBoard = {
      ...board,
      title: config.featured_board_title_override || board.name,
      description: config.featured_board_description_override || board.description,
      icon: config.featured_board_icon,
      items: board.catalog.slice(0, config.featured_board_max_items)
    };
  }
  
  // Get recently added
  const { data: recentItems } = await supabase
    .from('catalog')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(config.recently_added_max_items);
  
  return {
    hero: {
      title: config.hero_title,
      subtitle: config.hero_subtitle,
      showHubCards: config.show_hub_cards
    },
    featuredBoard,
    recentlyAdded: {
      items: recentItems,
      newThresholdDays: config.recently_added_new_threshold_days
    }
  };
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v1 | Dec 28, 2024 | Initial homepage management plan |
