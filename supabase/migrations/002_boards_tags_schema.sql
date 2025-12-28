-- GTM Library v2 - Boards and Tags Schema
-- Run this in the Supabase SQL Editor after 001_initial_schema.sql

-- Boards table (manually managed, migrated from lib/constants/hubs.ts)
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT, -- emoji
  color TEXT NOT NULL,
  light_color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update existing tags table to add sort_order if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tags' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE tags ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- Board-Tag junction (which tags are subgroups of which boards)
CREATE TABLE IF NOT EXISTS board_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(board_id, tag_id)
);

-- Asset-Tag junction (which tags are on which assets)
CREATE TABLE IF NOT EXISTS asset_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES catalog_entries(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id, tag_id)
);

-- Asset-Board junction (which boards an asset appears in)
CREATE TABLE IF NOT EXISTS asset_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES catalog_entries(id) ON DELETE CASCADE,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id, board_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_boards_slug ON boards(slug);
CREATE INDEX IF NOT EXISTS idx_boards_sort_order ON boards(sort_order);
CREATE INDEX IF NOT EXISTS idx_board_tags_board_id ON board_tags(board_id);
CREATE INDEX IF NOT EXISTS idx_board_tags_tag_id ON board_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_asset_tags_asset_id ON asset_tags(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_tags_tag_id ON asset_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_asset_boards_asset_id ON asset_boards(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_boards_board_id ON asset_boards(board_id);

-- Trigger for boards updated_at
CREATE TRIGGER update_boards_updated_at
    BEFORE UPDATE ON boards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security for new tables
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_boards ENABLE ROW LEVEL SECURITY;

-- Public read access for boards
CREATE POLICY "Public can view boards" ON boards
  FOR SELECT USING (TRUE);

-- Service role can manage boards
CREATE POLICY "Service role full access on boards" ON boards
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Public read access for board_tags
CREATE POLICY "Public can view board_tags" ON board_tags
  FOR SELECT USING (TRUE);

-- Service role can manage board_tags
CREATE POLICY "Service role full access on board_tags" ON board_tags
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Public read access for asset_tags
CREATE POLICY "Public can view asset_tags" ON asset_tags
  FOR SELECT USING (TRUE);

-- Service role can manage asset_tags
CREATE POLICY "Service role full access on asset_tags" ON asset_tags
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Public read access for asset_boards
CREATE POLICY "Public can view asset_boards" ON asset_boards
  FOR SELECT USING (TRUE);

-- Service role can manage asset_boards
CREATE POLICY "Service role full access on asset_boards" ON asset_boards
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
