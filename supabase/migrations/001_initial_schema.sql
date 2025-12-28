-- GTM Library v2 Initial Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main catalog entries table
CREATE TABLE IF NOT EXISTS catalog_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Classification
  hub TEXT NOT NULL CHECK (hub IN ('coe', 'content', 'enablement')),
  format TEXT NOT NULL,
  types TEXT[],
  tags TEXT[],

  -- Links
  primary_link TEXT NOT NULL,
  share_link TEXT,
  video_url TEXT,
  slides_url TEXT,
  transcript_url TEXT,
  key_asset_url TEXT,

  -- Enablement-specific fields
  presenters TEXT[],
  duration_minutes INTEGER,
  takeaways TEXT[],
  howtos JSONB, -- [{ title, content }, ...]
  tips TEXT[],

  -- Content sections (for rich detail pages)
  page_sections JSONB, -- Array of section objects

  -- Metadata
  owner TEXT,
  views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,

  -- AI inference confidence scores
  ai_confidence JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Tags table for managing reusable tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT, -- 'product' | 'team' | 'competitor' | 'topic'
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- View tracking for analytics
CREATE TABLE IF NOT EXISTS view_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES catalog_entries(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT, -- 'direct' | 'search' | 'related'
  session_id TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_catalog_entries_hub ON catalog_entries(hub);
CREATE INDEX IF NOT EXISTS idx_catalog_entries_status ON catalog_entries(status);
CREATE INDEX IF NOT EXISTS idx_catalog_entries_slug ON catalog_entries(slug);
CREATE INDEX IF NOT EXISTS idx_catalog_entries_featured ON catalog_entries(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_catalog_entries_tags ON catalog_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_catalog_entries_types ON catalog_entries USING GIN(types);
CREATE INDEX IF NOT EXISTS idx_view_events_entry_id ON view_events(entry_id);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_catalog_entries_search ON catalog_entries
  USING GIN(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_catalog_entries_updated_at
    BEFORE UPDATE ON catalog_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE catalog_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_events ENABLE ROW LEVEL SECURITY;

-- Public read access for published entries
CREATE POLICY "Public can view published entries" ON catalog_entries
  FOR SELECT USING (status = 'published');

-- Authenticated users can view all entries
CREATE POLICY "Authenticated can view all entries" ON catalog_entries
  FOR SELECT TO authenticated USING (TRUE);

-- Service role can do everything
CREATE POLICY "Service role full access on entries" ON catalog_entries
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Public read access for tags
CREATE POLICY "Public can view tags" ON tags
  FOR SELECT USING (TRUE);

-- Service role can manage tags
CREATE POLICY "Service role full access on tags" ON tags
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Anyone can insert view events (for tracking)
CREATE POLICY "Anyone can track views" ON view_events
  FOR INSERT WITH CHECK (TRUE);

-- Service role can read view events
CREATE POLICY "Service role can read view events" ON view_events
  FOR SELECT TO service_role USING (TRUE);
