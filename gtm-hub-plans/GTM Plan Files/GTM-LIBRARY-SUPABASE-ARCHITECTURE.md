# GTM Library v2 - Architecture with Supabase

## Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CONTENT SOURCES                          │
│  Google Slides │ Google Docs │ Loom │ Zoom │ YouTube │ PDFs    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLAUDE CODE                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Direct Supabase operations via:                         │   │
│  │  - SQL queries (supabase db)                             │   │
│  │  - TypeScript SDK                                        │   │
│  │  - Generated types from schema                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │          │
│  │  - catalog   │  │  - Google    │  │  - Previews  │          │
│  │  - boards    │  │    OAuth     │  │  - PDFs      │          │
│  │  - tags      │  │  - RLS       │  │  - Assets    │          │
│  │  - analytics │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  Realtime    │  │    Edge      │                             │
│  │  - Live      │  │  Functions   │                             │
│  │    updates   │  │  - Webhooks  │                             │
│  └──────────────┘  └──────────────┘                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS + VERCEL                              │
│  - Server Components fetch from Supabase                        │
│  - Client Components for interactive features                   │
│  - API routes for mutations                                     │
│  - ISR for caching                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Why Supabase Works Well

| Feature | Benefit for GTM Library |
|---------|------------------------|
| **PostgreSQL** | Real queries, joins, full-text search built-in |
| **Auth** | Google OAuth for Gladly employees - done |
| **Row Level Security** | Control who can edit vs view |
| **Realtime** | Live content updates across users |
| **Storage** | Host preview images, PDFs |
| **Edge Functions** | Webhooks for analytics, Slack notifications |
| **TypeScript SDK** | Type-safe queries Claude Code can write |
| **SQL Access** | Claude Code can run raw SQL when needed |

## Database Schema

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy search

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE hub_type AS ENUM ('coe', 'content', 'enablement');
CREATE TYPE format_type AS ENUM (
  'slides', 'pdf', 'document', 'video', 'article', 
  'tool', 'guide', 'sequence', 'sheet', 'training', 'playbook'
);
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE link_type AS ENUM ('video', 'slides', 'document', 'transcript', 'link', 'pdf');

-- ============================================
-- TABLES
-- ============================================

-- Main catalog table
CREATE TABLE catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  hub hub_type NOT NULL,
  format format_type NOT NULL,
  types TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  primary_link TEXT NOT NULL,
  share_link TEXT,
  owner TEXT,
  status content_status DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  
  -- Full-text search vector
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'C')
  ) STORED
);

-- Index for full-text search
CREATE INDEX catalog_search_idx ON catalog USING GIN (search_vector);

-- Index for common queries
CREATE INDEX catalog_hub_idx ON catalog (hub);
CREATE INDEX catalog_status_idx ON catalog (status);
CREATE INDEX catalog_tags_idx ON catalog USING GIN (tags);

-- Resource links (quick links for each catalog entry)
CREATE TABLE resource_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  catalog_id UUID REFERENCES catalog(id) ON DELETE CASCADE,
  type link_type NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX resource_links_catalog_idx ON resource_links (catalog_id);

-- Training extended content
CREATE TABLE training_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  catalog_id UUID UNIQUE REFERENCES catalog(id) ON DELETE CASCADE,
  presenters TEXT[] DEFAULT '{}',
  duration TEXT,
  session_date DATE,
  video_url TEXT,
  thumbnail_url TEXT,
  takeaways TEXT[] DEFAULT '{}',
  tips TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training how-to steps
CREATE TABLE training_howtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_id UUID REFERENCES training_content(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX training_howtos_training_idx ON training_howtos (training_id);

-- Training materials (separate from resource_links for training-specific materials)
CREATE TABLE training_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_id UUID REFERENCES training_content(id) ON DELETE CASCADE,
  type link_type NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX training_materials_training_idx ON training_materials (training_id);

-- Boards configuration
CREATE TABLE boards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT NOT NULL,
  hub hub_type,
  filter_tags TEXT[] DEFAULT '{}',
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags taxonomy
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,  -- products, competitors, roles, verticals, topics
  display_name TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  catalog_id UUID REFERENCES catalog(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,  -- 'view', 'share', 'copy_link'
  user_id UUID,
  user_email TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX analytics_events_catalog_idx ON analytics_events (catalog_id);
CREATE INDEX analytics_events_type_idx ON analytics_events (event_type);
CREATE INDEX analytics_events_created_idx ON analytics_events (created_at);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER catalog_updated_at
  BEFORE UPDATE ON catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER training_content_updated_at
  BEFORE UPDATE ON training_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Increment view count
CREATE OR REPLACE FUNCTION increment_views(entry_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE catalog SET views = views + 1 WHERE id = entry_id;
END;
$$ LANGUAGE plpgsql;

-- Increment share count
CREATE OR REPLACE FUNCTION increment_shares(entry_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE catalog SET shares = shares + 1 WHERE id = entry_id;
END;
$$ LANGUAGE plpgsql;

-- Full-text search function
CREATE OR REPLACE FUNCTION search_catalog(search_query TEXT)
RETURNS SETOF catalog AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM catalog
  WHERE search_vector @@ plainto_tsquery('english', search_query)
    AND status = 'published'
  ORDER BY ts_rank(search_vector, plainto_tsquery('english', search_query)) DESC;
END;
$$ LANGUAGE plpgsql;

-- Get catalog with training data
CREATE OR REPLACE FUNCTION get_entry_with_training(entry_slug TEXT)
RETURNS TABLE (
  catalog_data JSON,
  training_data JSON,
  howtos JSON,
  materials JSON,
  links JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    row_to_json(c.*) as catalog_data,
    row_to_json(t.*) as training_data,
    COALESCE(
      (SELECT json_agg(h.* ORDER BY h.sort_order) 
       FROM training_howtos h 
       WHERE h.training_id = t.id),
      '[]'::json
    ) as howtos,
    COALESCE(
      (SELECT json_agg(m.* ORDER BY m.sort_order) 
       FROM training_materials m 
       WHERE m.training_id = t.id),
      '[]'::json
    ) as materials,
    COALESCE(
      (SELECT json_agg(l.* ORDER BY l.sort_order) 
       FROM resource_links l 
       WHERE l.catalog_id = c.id),
      '[]'::json
    ) as links
  FROM catalog c
  LEFT JOIN training_content t ON t.catalog_id = c.id
  WHERE c.slug = entry_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_howtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can view published content"
  ON catalog FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can view resource links"
  ON resource_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM catalog c 
      WHERE c.id = catalog_id AND c.status = 'published'
    )
  );

CREATE POLICY "Public can view training content"
  ON training_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM catalog c 
      WHERE c.id = catalog_id AND c.status = 'published'
    )
  );

-- Authenticated users can do everything
CREATE POLICY "Authenticated users full access to catalog"
  ON catalog FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to resource_links"
  ON resource_links FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to training_content"
  ON training_content FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Anyone can log analytics
CREATE POLICY "Anyone can insert analytics"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- Only authenticated can read analytics
CREATE POLICY "Authenticated can view analytics"
  ON analytics_events FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- SEED DATA: BOARDS
-- ============================================

INSERT INTO boards (id, name, icon, color, hub, filter_tags, description, sort_order) VALUES
  ('coe', 'CoE', '🏆', '#F59E0B', 'coe', '{}', 'Center of Excellence - Best practices and templates', 1),
  ('content', 'Content Types', '📄', '#8C69F0', 'content', '{}', 'External-facing content and materials', 2),
  ('enablement', 'Enablement', '🎓', '#10B981', 'enablement', '{}', 'Training sessions and certifications', 3),
  ('product', 'Product', '📦', '#3B82F6', NULL, '{sidekick,hero,voice,email}', 'Product-specific materials', 4),
  ('competitive', 'Competitive', '⚔️', '#EF4444', NULL, '{competitive}', 'Battle cards and competitive intel', 5),
  ('sales', 'Sales', '💼', '#0EA5E9', NULL, '{sales}', 'Sales resources and tools', 6),
  ('csm', 'CSM', '🤝', '#8B5CF6', NULL, '{csm}', 'Customer success materials', 7),
  ('sc', 'SC', '🔧', '#EC4899', NULL, '{sc}', 'Solutions consultant resources', 8),
  ('demo', 'Demo', '🎬', '#06B6D4', NULL, '{demo}', 'Demo assets and environments', 9),
  ('proof', 'Proof Points', '📊', '#84CC16', NULL, '{proof-point,case-study}', 'Case studies and metrics', 10);

-- ============================================
-- SEED DATA: TAGS TAXONOMY
-- ============================================

INSERT INTO tags (name, category, display_name) VALUES
  -- Products
  ('sidekick', 'products', 'Sidekick'),
  ('hero', 'products', 'Hero'),
  ('voice', 'products', 'Voice'),
  ('email', 'products', 'Email'),
  ('app-platform', 'products', 'App Platform'),
  ('guides', 'products', 'Guides & Journeys'),
  
  -- Competitors
  ('zendesk', 'competitors', 'Zendesk'),
  ('intercom', 'competitors', 'Intercom'),
  ('ada', 'competitors', 'Ada'),
  ('sierra', 'competitors', 'Sierra'),
  ('kustomer', 'competitors', 'Kustomer'),
  ('freshdesk', 'competitors', 'Freshdesk'),
  
  -- Roles
  ('sales', 'roles', 'Sales'),
  ('csm', 'roles', 'CSM'),
  ('sc', 'roles', 'SC'),
  ('ps', 'roles', 'PS'),
  ('marketing', 'roles', 'Marketing'),
  
  -- Verticals
  ('retail', 'verticals', 'Retail'),
  ('travel', 'verticals', 'Travel'),
  ('hospitality', 'verticals', 'Hospitality'),
  ('finance', 'verticals', 'Finance'),
  ('healthcare', 'verticals', 'Healthcare'),
  
  -- Topics
  ('discovery', 'topics', 'Discovery'),
  ('demo', 'topics', 'Demo'),
  ('bva', 'topics', 'BVA'),
  ('ebr', 'topics', 'EBR'),
  ('qbr', 'topics', 'QBR'),
  ('onboarding', 'topics', 'Onboarding'),
  ('competitive', 'topics', 'Competitive'),
  ('enterprise', 'topics', 'Enterprise'),
  ('mid-market', 'topics', 'Mid-Market');
```

## TypeScript Types (Generated)

```typescript
// lib/database.types.ts
// Generate with: npx supabase gen types typescript --project-id YOUR_PROJECT > lib/database.types.ts

export type Hub = 'coe' | 'content' | 'enablement';
export type Format = 'slides' | 'pdf' | 'document' | 'video' | 'article' | 'tool' | 'guide' | 'sequence' | 'sheet' | 'training' | 'playbook';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type LinkType = 'video' | 'slides' | 'document' | 'transcript' | 'link' | 'pdf';

export interface CatalogEntry {
  id: string;
  slug: string;
  title: string;
  hub: Hub;
  format: Format;
  types: string[];
  tags: string[];
  description: string | null;
  primary_link: string;
  share_link: string | null;
  owner: string | null;
  status: ContentStatus;
  views: number;
  shares: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  archived_at: string | null;
}

export interface ResourceLink {
  id: string;
  catalog_id: string;
  type: LinkType;
  title: string;
  subtitle: string | null;
  url: string;
  sort_order: number;
}

export interface TrainingContent {
  id: string;
  catalog_id: string;
  presenters: string[];
  duration: string | null;
  session_date: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  takeaways: string[];
  tips: string[];
}

export interface TrainingHowto {
  id: string;
  training_id: string;
  title: string;
  content: string;
  sort_order: number;
}

export interface Board {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  hub: Hub | null;
  filter_tags: string[];
  description: string | null;
  sort_order: number;
}

// Composite types for queries
export interface CatalogEntryWithLinks extends CatalogEntry {
  resource_links: ResourceLink[];
}

export interface TrainingEntryFull extends CatalogEntry {
  training_content: TrainingContent | null;
  training_howtos: TrainingHowto[];
  training_materials: ResourceLink[];
  resource_links: ResourceLink[];
}
```

## Supabase Client Setup

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component
          }
        },
      },
    }
  );
}

// lib/supabase/admin.ts (for Claude Code operations)
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Service role for admin operations
);
```

## Query Examples

### Get All Published Entries

```typescript
// lib/catalog.ts
import { createClient } from '@/lib/supabase/server';

export async function getCatalog() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('catalog')
    .select('*')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });
    
  if (error) throw error;
  return data;
}
```

### Get Entry with All Related Data

```typescript
export async function getEntry(slug: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('catalog')
    .select(`
      *,
      resource_links (*),
      training_content (
        *,
        training_howtos (*),
        training_materials (*)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
    
  if (error) throw error;
  return data;
}
```

### Get Entries by Board

```typescript
export async function getEntriesByBoard(boardId: string) {
  const supabase = await createClient();
  
  // First get board config
  const { data: board } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .single();
    
  if (!board) return [];
  
  let query = supabase
    .from('catalog')
    .select('*')
    .eq('status', 'published');
  
  // Filter by hub or tags
  if (board.hub) {
    query = query.eq('hub', board.hub);
  } else if (board.filter_tags?.length) {
    query = query.overlaps('tags', board.filter_tags);
  }
  
  const { data, error } = await query.order('views', { ascending: false });
  
  if (error) throw error;
  return data;
}
```

### Full-Text Search

```typescript
export async function searchCatalog(query: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .rpc('search_catalog', { search_query: query });
    
  if (error) throw error;
  return data;
}
```

### Track Analytics

```typescript
export async function trackView(catalogId: string, userEmail?: string) {
  const supabase = await createClient();
  
  // Increment counter
  await supabase.rpc('increment_views', { entry_id: catalogId });
  
  // Log event
  await supabase.from('analytics_events').insert({
    catalog_id: catalogId,
    event_type: 'view',
    user_email: userEmail,
  });
}

export async function trackShare(catalogId: string, userEmail?: string) {
  const supabase = await createClient();
  
  await supabase.rpc('increment_shares', { entry_id: catalogId });
  
  await supabase.from('analytics_events').insert({
    catalog_id: catalogId,
    event_type: 'share',
    user_email: userEmail,
  });
}
```

## Claude Code Operations

### Add New Content

```typescript
// scripts/add-content.ts
import { supabaseAdmin } from '@/lib/supabase/admin';

interface NewContent {
  title: string;
  hub: Hub;
  format: Format;
  types?: string[];
  tags?: string[];
  description?: string;
  primaryLink: string;
  links?: { type: LinkType; title: string; subtitle?: string; url: string }[];
}

export async function addContent(content: NewContent) {
  const slug = content.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  // Insert catalog entry
  const { data: entry, error: entryError } = await supabaseAdmin
    .from('catalog')
    .insert({
      slug,
      title: content.title,
      hub: content.hub,
      format: content.format,
      types: content.types || [],
      tags: content.tags || [],
      description: content.description,
      primary_link: content.primaryLink,
      status: 'published',
    })
    .select()
    .single();
    
  if (entryError) throw entryError;
  
  // Insert resource links if provided
  if (content.links?.length) {
    await supabaseAdmin.from('resource_links').insert(
      content.links.map((link, i) => ({
        catalog_id: entry.id,
        type: link.type,
        title: link.title,
        subtitle: link.subtitle,
        url: link.url,
        sort_order: i,
      }))
    );
  }
  
  return entry;
}
```

### Add Training Content

```typescript
export async function addTrainingContent(
  catalogId: string,
  training: {
    presenters?: string[];
    duration?: string;
    sessionDate?: string;
    videoUrl?: string;
    takeaways?: string[];
    tips?: string[];
    howtos?: { title: string; content: string }[];
    materials?: { type: LinkType; title: string; subtitle?: string; url: string }[];
  }
) {
  // Insert training content
  const { data: trainingEntry, error: trainingError } = await supabaseAdmin
    .from('training_content')
    .insert({
      catalog_id: catalogId,
      presenters: training.presenters || [],
      duration: training.duration,
      session_date: training.sessionDate,
      video_url: training.videoUrl,
      takeaways: training.takeaways || [],
      tips: training.tips || [],
    })
    .select()
    .single();
    
  if (trainingError) throw trainingError;
  
  // Insert howtos
  if (training.howtos?.length) {
    await supabaseAdmin.from('training_howtos').insert(
      training.howtos.map((h, i) => ({
        training_id: trainingEntry.id,
        title: h.title,
        content: h.content,
        sort_order: i,
      }))
    );
  }
  
  // Insert materials
  if (training.materials?.length) {
    await supabaseAdmin.from('training_materials').insert(
      training.materials.map((m, i) => ({
        training_id: trainingEntry.id,
        type: m.type,
        title: m.title,
        subtitle: m.subtitle,
        url: m.url,
        sort_order: i,
      }))
    );
  }
  
  return trainingEntry;
}
```

### Update Content

```typescript
export async function updateContent(
  slug: string,
  updates: Partial<CatalogEntry>
) {
  const { data, error } = await supabaseAdmin
    .from('catalog')
    .update(updates)
    .eq('slug', slug)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}
```

### Bulk Import

```typescript
export async function bulkImport(entries: NewContent[]) {
  const results = [];
  
  for (const entry of entries) {
    try {
      const result = await addContent(entry);
      results.push({ success: true, entry: result });
    } catch (error) {
      results.push({ success: false, entry, error });
    }
  }
  
  return results;
}
```

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # For admin operations

# Optional
NEXT_PUBLIC_SITE_URL=https://gtm-library.vercel.app
```

## Project Structure

```
gtm-library-v2/
├── app/
│   ├── (library)/
│   │   ├── page.tsx                 # Home
│   │   ├── [board]/page.tsx         # Board view
│   │   └── asset/[slug]/page.tsx    # Resource detail
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── callback/route.ts        # OAuth callback
│   ├── admin/
│   │   ├── page.tsx                 # Dashboard
│   │   └── add/page.tsx             # Add content
│   └── api/
│       ├── track/route.ts           # Analytics
│       └── analyze/route.ts         # URL analysis
├── components/
│   └── library/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── admin.ts
│   │   └── database.types.ts
│   ├── catalog.ts                   # Query functions
│   └── analytics.ts                 # Tracking functions
├── .claude/
│   └── skills/
│       ├── content-ingest/SKILL.md
│       └── catalog-manager/SKILL.md
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql
    └── seed.sql
```

## Migration Path

1. **Set up Supabase project**
2. **Run schema migration**
3. **Import existing catalog data**
4. **Update Next.js to use Supabase queries**
5. **Set up auth (Google OAuth)**
6. **Deploy to Vercel**

## Cost

| Tier | Price | Includes |
|------|-------|----------|
| Free | $0 | 500MB DB, 1GB storage, 50k monthly users |
| Pro | $25/mo | 8GB DB, 100GB storage, unlimited users |

For ~40 DAU internal tool, **Free tier is plenty**.
