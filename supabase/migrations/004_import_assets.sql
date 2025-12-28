-- GTM Library v2 - Import 10 Real Assets from CSV
-- Run this in the Supabase SQL Editor after 003_seed_data.sql

-- Import 10 diverse assets from the catalog
INSERT INTO catalog_entries (
  slug, title, description, hub, format, types, tags, primary_link, status, views, shares
) VALUES
-- 1. CoE Tool
(
  'new-pre-sales-bva',
  '*New* Pre-Sales BVA',
  'Choose your own adventure (BVA)! Take customer inputs and Gladly benchmarks to project what a potential 3-year impact could look like for a prospect who is considering Hero and/or Sidekick.',
  'coe',
  'tool',
  ARRAY['meeting-asset'],
  ARRAY['sales', 'gladly', 'Meeting Examples'],
  'https://docs.google.com/spreadsheets/d/1BX9m4ogrOi6sA3qQtwjSm6WpGqKpT30CxJZh1nWzsvA/edit?gid=1938166837#gid=1938166837',
  'published',
  234, 45
),
-- 2. Content Battlecard
(
  'battlecard-salesforce',
  'Battlecard: Salesforce',
  'Competitive battlecard for Salesforce Service Cloud, highlighting key differentiators and win themes.',
  'content',
  'document',
  ARRAY['battlecard'],
  ARRAY['sales', 'salesforce', 'gladly', 'Competitive Intel'],
  'https://docs.google.com/presentation/d/1pQrStUvWxYzAbCdEfGhIjKlMnOpQrSt/edit?usp=sharing',
  'published',
  189, 32
),
-- 3. Content Case Study
(
  'case-study-warby-parker',
  'Case Study: Warby Parker',
  'How Warby Parker increased agent efficiency by 20% using Gladly.',
  'content',
  'link',
  ARRAY['case-study'],
  ARRAY['sales', 'marketing', 'gladly', 'Case Studies'],
  'https://gladly.com/customers/warby-parker/',
  'published',
  567, 89
),
-- 4. Enablement Demo Script
(
  'demo-script-hero-feature',
  'Demo Script: Hero Feature',
  'Script for demonstrating the new Hero feature to prospects.',
  'enablement',
  'document',
  ARRAY['script'],
  ARRAY['sales', 'sc', 'gladly', 'Demo Assets'],
  'https://docs.google.com/document/d/1OpQrStUvWxYzAbCdEfGhIjKlMn/edit?usp=sharing',
  'published',
  312, 56
),
-- 5. Content Video
(
  'feature-spotlight-sidekick',
  'Feature Spotlight: Sidekick',
  'Deep dive into the Sidekick feature capabilities and use cases.',
  'content',
  'video',
  ARRAY['product-training'],
  ARRAY['product', 'sales', 'gladly', 'Product Deep Dives'],
  'https://drive.google.com/file/d/1StUvWxYzAbCdEfGhIjKlMnOpQr/view?usp=sharing',
  'published',
  423, 67
),
-- 6. Content Battlecard (Zendesk)
(
  'gladly-vs-zendesk-battlecard',
  'Gladly vs. Zendesk Battlecard',
  'Detailed comparison of Gladly vs. Zendesk, focusing on "People vs. Tickets".',
  'content',
  'document',
  ARRAY['battlecard'],
  ARRAY['sales', 'zendesk', 'gladly', 'Competitive Intel'],
  'https://docs.google.com/presentation/d/1WxYzAbCdEfGhIjKlMnOpQrStUv/edit?usp=sharing',
  'published',
  678, 123
),
-- 7. CoE Integration Guide
(
  'integration-guide-shopify',
  'Integration Guide: Shopify',
  'Technical guide for integrating Gladly with Shopify stores.',
  'coe',
  'link',
  ARRAY['guide'],
  ARRAY['impl', 'tech-partners', 'gladly', 'Integrations'],
  'https://help.gladly.com/docs/shopify-integration',
  'published',
  156, 28
),
-- 8. CoE Tool (Pricing)
(
  'pricing-calculator-2024',
  'Pricing Calculator 2024',
  'Spreadsheet for calculating customer pricing quotes based on 2024 pricing model.',
  'coe',
  'tool',
  ARRAY['calculator'],
  ARRAY['sales', 'finance', 'gladly', 'Sales Tools'],
  'https://docs.google.com/spreadsheets/d/1KlMnOpQrStUvWxYzAbCdEfGhIj/edit?usp=sharing',
  'published',
  445, 78
),
-- 9. Enablement Playbook
(
  'sales-playbook-enterprise',
  'Sales Playbook: Enterprise',
  'Playbook for selling to Enterprise segment customers.',
  'enablement',
  'document',
  ARRAY['playbook'],
  ARRAY['sales', 'gladly', 'Sales Playbooks'],
  'https://docs.google.com/document/d/1EfGhIjKlMnOpQrStUvWxYzAbCd/edit?usp=sharing',
  'published',
  289, 51
),
-- 10. Content Video (Voice Demo)
(
  'voice-feature-demo',
  'Voice Feature Demo',
  'Video demonstration of Gladly''s Voice features.',
  'content',
  'video',
  ARRAY['product-training'],
  ARRAY['sales', 'product', 'gladly', 'Product Demos'],
  'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view?usp=sharing',
  'published',
  356, 62
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  hub = EXCLUDED.hub,
  format = EXCLUDED.format,
  types = EXCLUDED.types,
  tags = EXCLUDED.tags,
  primary_link = EXCLUDED.primary_link,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Associate assets with their primary boards based on hub
-- CoE assets go to 'coe' board
INSERT INTO asset_boards (asset_id, board_id)
SELECT ce.id, b.id
FROM catalog_entries ce, boards b
WHERE ce.hub = 'coe' AND b.slug = 'coe'
AND ce.slug IN ('new-pre-sales-bva', 'integration-guide-shopify', 'pricing-calculator-2024')
ON CONFLICT DO NOTHING;

-- Content assets go to 'content' board
INSERT INTO asset_boards (asset_id, board_id)
SELECT ce.id, b.id
FROM catalog_entries ce, boards b
WHERE ce.hub = 'content' AND b.slug = 'content'
AND ce.slug IN ('battlecard-salesforce', 'case-study-warby-parker', 'feature-spotlight-sidekick', 'gladly-vs-zendesk-battlecard', 'voice-feature-demo')
ON CONFLICT DO NOTHING;

-- Enablement assets go to 'enablement' board
INSERT INTO asset_boards (asset_id, board_id)
SELECT ce.id, b.id
FROM catalog_entries ce, boards b
WHERE ce.hub = 'enablement' AND b.slug = 'enablement'
AND ce.slug IN ('demo-script-hero-feature', 'sales-playbook-enterprise')
ON CONFLICT DO NOTHING;

-- Also assign to secondary boards based on content type
-- Competitive assets to 'competitive' board
INSERT INTO asset_boards (asset_id, board_id)
SELECT ce.id, b.id
FROM catalog_entries ce, boards b
WHERE b.slug = 'competitive'
AND ce.slug IN ('battlecard-salesforce', 'gladly-vs-zendesk-battlecard')
ON CONFLICT DO NOTHING;

-- Demo assets to 'demo' board
INSERT INTO asset_boards (asset_id, board_id)
SELECT ce.id, b.id
FROM catalog_entries ce, boards b
WHERE b.slug = 'demo'
AND ce.slug IN ('demo-script-hero-feature', 'voice-feature-demo')
ON CONFLICT DO NOTHING;

-- Sales-related to 'sales' board
INSERT INTO asset_boards (asset_id, board_id)
SELECT ce.id, b.id
FROM catalog_entries ce, boards b
WHERE b.slug = 'sales'
AND ce.slug IN ('new-pre-sales-bva', 'pricing-calculator-2024', 'sales-playbook-enterprise')
ON CONFLICT DO NOTHING;

-- Product-related to 'product' board
INSERT INTO asset_boards (asset_id, board_id)
SELECT ce.id, b.id
FROM catalog_entries ce, boards b
WHERE b.slug = 'product'
AND ce.slug IN ('feature-spotlight-sidekick', 'voice-feature-demo')
ON CONFLICT DO NOTHING;

-- Proof points / case studies to 'proof' board
INSERT INTO asset_boards (asset_id, board_id)
SELECT ce.id, b.id
FROM catalog_entries ce, boards b
WHERE b.slug = 'proof'
AND ce.slug IN ('case-study-warby-parker')
ON CONFLICT DO NOTHING;

-- Create asset_tags associations
-- First, ensure tags exist for all asset tags
INSERT INTO tags (slug, name, sort_order) VALUES
('competitive-intel', 'Competitive Intel', 200),
('demo-assets', 'Demo Assets', 201),
('product-deep-dives', 'Product Deep Dives', 202),
('sales-tools', 'Sales Tools', 203),
('sales-playbooks', 'Sales Playbooks', 204),
('product-demos', 'Product Demos', 205)
ON CONFLICT (slug) DO NOTHING;

-- Associate tags with assets
INSERT INTO asset_tags (asset_id, tag_id)
SELECT ce.id, t.id
FROM catalog_entries ce
CROSS JOIN tags t
WHERE ce.status = 'published'
  AND t.slug = ANY(
    ARRAY(SELECT LOWER(REPLACE(unnest(ce.tags), ' ', '-')))
  )
ON CONFLICT DO NOTHING;
