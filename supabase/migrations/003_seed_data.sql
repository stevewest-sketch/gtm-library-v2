-- GTM Library v2 - Seed Data
-- Run this in the Supabase SQL Editor after 002_boards_tags_schema.sql

-- Insert the 10 boards from lib/constants/hubs.ts
INSERT INTO boards (slug, name, icon, color, light_color, accent_color, sort_order) VALUES
('coe', 'CoE', '🎯', '#F59E0B', '#FEF3C7', '#B45309', 1),
('content', 'Content Types', '📝', '#8C69F0', '#EDE9FE', '#6D28D9', 2),
('enablement', 'Enablement', '🎓', '#10B981', '#D1FAE5', '#047857', 3),
('product', 'Product', '📦', '#3B82F6', '#DBEAFE', '#1D4ED8', 4),
('competitive', 'Competitive', '⚔️', '#EF4444', '#FEE2E2', '#B91C1C', 5),
('sales', 'Sales', '💰', '#0EA5E9', '#E0F2FE', '#0369A1', 6),
('csm', 'CSM', '🤝', '#8B5CF6', '#EDE9FE', '#6D28D9', 7),
('sc', 'SC', '🔧', '#EC4899', '#FCE7F3', '#BE185D', 8),
('demo', 'Demo', '🎬', '#06B6D4', '#CFFAFE', '#0E7490', 9),
('proof', 'Proof Points', '📊', '#84CC16', '#ECFCCB', '#4D7C0F', 10)
ON CONFLICT (slug) DO NOTHING;

-- Insert tags from board definitions (all tags are equal, no hierarchy)
-- CoE tags
INSERT INTO tags (slug, name, sort_order) VALUES
('bva', 'BVA', 1),
('ebr', 'EBR', 2),
('qbr', 'QBR', 3),
('meeting-examples', 'Meeting Examples', 4),
('best-practices', 'Best Practices', 5),
('templates', 'Templates', 6),
('process', 'Process', 7)
ON CONFLICT (slug) DO NOTHING;

-- Content tags
INSERT INTO tags (slug, name, sort_order) VALUES
('decks', 'Decks', 10),
('one-pagers', 'One-pagers', 11),
('case-studies', 'Case Studies', 12),
('videos', 'Videos', 13),
('battlecards', 'Battlecards', 14)
ON CONFLICT (slug) DO NOTHING;

-- Enablement tags
INSERT INTO tags (slug, name, sort_order) VALUES
('training', 'Training', 20),
('certifications', 'Certifications', 21),
('onboarding', 'Onboarding', 22),
('learning-paths', 'Learning Paths', 23),
('workshops', 'Workshops', 24)
ON CONFLICT (slug) DO NOTHING;

-- Product tags
INSERT INTO tags (slug, name, sort_order) VALUES
('release-notes', 'Release Notes', 30),
('roadmap', 'Roadmap', 31),
('feature-briefs', 'Feature Briefs', 32),
('technical-docs', 'Technical Docs', 33),
('api', 'API', 34)
ON CONFLICT (slug) DO NOTHING;

-- Competitive tags
INSERT INTO tags (slug, name, sort_order) VALUES
('win-loss', 'Win/Loss', 40),
('competitor-analysis', 'Competitor Analysis', 41),
('pricing', 'Pricing', 42)
ON CONFLICT (slug) DO NOTHING;

-- Sales tags
INSERT INTO tags (slug, name, sort_order) VALUES
('proposals', 'Proposals', 50),
('discovery', 'Discovery', 51),
('objection-handling', 'Objection Handling', 52),
('negotiation', 'Negotiation', 53)
ON CONFLICT (slug) DO NOTHING;

-- CSM tags
INSERT INTO tags (slug, name, sort_order) VALUES
('qbrs', 'QBRs', 60),
('renewals', 'Renewals', 61),
('expansion', 'Expansion', 62),
('health-scores', 'Health Scores', 63)
ON CONFLICT (slug) DO NOTHING;

-- SC tags
INSERT INTO tags (slug, name, sort_order) VALUES
('poc', 'POC', 70),
('technical-demo', 'Technical Demo', 71),
('integration', 'Integration', 72),
('security', 'Security', 73),
('architecture', 'Architecture', 74)
ON CONFLICT (slug) DO NOTHING;

-- Demo tags
INSERT INTO tags (slug, name, sort_order) VALUES
('demo-scripts', 'Demo Scripts', 80),
('environments', 'Environments', 81),
('use-cases', 'Use Cases', 82),
('industry-demos', 'Industry Demos', 83)
ON CONFLICT (slug) DO NOTHING;

-- Proof Points tags
INSERT INTO tags (slug, name, sort_order) VALUES
('roi', 'ROI', 90),
('testimonials', 'Testimonials', 91),
('references', 'References', 92),
('stats', 'Stats', 93)
ON CONFLICT (slug) DO NOTHING;

-- Additional tags from FILTER_GROUPS (cross-filter options)
-- Sales segments
INSERT INTO tags (slug, name, sort_order) VALUES
('enterprise', 'Enterprise', 100),
('mid-market', 'Mid-Market', 101),
('smb', 'SMB', 102),
('new-business', 'New Business', 103)
ON CONFLICT (slug) DO NOTHING;

-- Industry/verticals
INSERT INTO tags (slug, name, sort_order) VALUES
('retail', 'Retail', 110),
('dtc', 'DTC', 111),
('travel', 'Travel', 112),
('financial-services', 'Financial Services', 113),
('tech', 'Tech', 114)
ON CONFLICT (slug) DO NOTHING;

-- Competitors
INSERT INTO tags (slug, name, sort_order) VALUES
('zendesk', 'Zendesk', 120),
('freshdesk', 'Freshdesk', 121),
('intercom', 'Intercom', 122),
('salesforce', 'Salesforce', 123),
('kustomer', 'Kustomer', 124)
ON CONFLICT (slug) DO NOTHING;

-- Products
INSERT INTO tags (slug, name, sort_order) VALUES
('hero', 'Hero', 130),
('sidekick', 'Sidekick', 131),
('people-match', 'People Match', 132),
('channels', 'Channels', 133),
('analytics', 'Analytics', 134)
ON CONFLICT (slug) DO NOTHING;

-- Post-Sales
INSERT INTO tags (slug, name, sort_order) VALUES
('implementation', 'Implementation', 140),
('adoption', 'Adoption', 141),
('renewal', 'Renewal', 142),
('churn-prevention', 'Churn Prevention', 143)
ON CONFLICT (slug) DO NOTHING;

-- Common tags (likely from CSV)
INSERT INTO tags (slug, name, sort_order) VALUES
('sales', 'sales', 150),
('gladly', 'gladly', 151),
('marketing', 'marketing', 152),
('product', 'product', 153),
('sc', 'sc', 154),
('impl', 'impl', 155),
('tech-partners', 'tech-partners', 156),
('finance', 'finance', 157)
ON CONFLICT (slug) DO NOTHING;

-- Associate tags with boards (designate as subgroups)
-- CoE board tags
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 1 FROM boards b, tags t WHERE b.slug = 'coe' AND t.slug = 'bva'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 2 FROM boards b, tags t WHERE b.slug = 'coe' AND t.slug = 'ebr'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 3 FROM boards b, tags t WHERE b.slug = 'coe' AND t.slug = 'qbr'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 4 FROM boards b, tags t WHERE b.slug = 'coe' AND t.slug = 'meeting-examples'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 5 FROM boards b, tags t WHERE b.slug = 'coe' AND t.slug = 'best-practices'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 6 FROM boards b, tags t WHERE b.slug = 'coe' AND t.slug = 'templates'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 7 FROM boards b, tags t WHERE b.slug = 'coe' AND t.slug = 'process'
ON CONFLICT DO NOTHING;

-- Content board tags
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 1 FROM boards b, tags t WHERE b.slug = 'content' AND t.slug = 'decks'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 2 FROM boards b, tags t WHERE b.slug = 'content' AND t.slug = 'one-pagers'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 3 FROM boards b, tags t WHERE b.slug = 'content' AND t.slug = 'case-studies'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 4 FROM boards b, tags t WHERE b.slug = 'content' AND t.slug = 'videos'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 5 FROM boards b, tags t WHERE b.slug = 'content' AND t.slug = 'battlecards'
ON CONFLICT DO NOTHING;

-- Enablement board tags
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 1 FROM boards b, tags t WHERE b.slug = 'enablement' AND t.slug = 'training'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 2 FROM boards b, tags t WHERE b.slug = 'enablement' AND t.slug = 'certifications'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 3 FROM boards b, tags t WHERE b.slug = 'enablement' AND t.slug = 'onboarding'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 4 FROM boards b, tags t WHERE b.slug = 'enablement' AND t.slug = 'learning-paths'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 5 FROM boards b, tags t WHERE b.slug = 'enablement' AND t.slug = 'workshops'
ON CONFLICT DO NOTHING;

-- Product board tags
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 1 FROM boards b, tags t WHERE b.slug = 'product' AND t.slug = 'release-notes'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 2 FROM boards b, tags t WHERE b.slug = 'product' AND t.slug = 'roadmap'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 3 FROM boards b, tags t WHERE b.slug = 'product' AND t.slug = 'feature-briefs'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 4 FROM boards b, tags t WHERE b.slug = 'product' AND t.slug = 'technical-docs'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 5 FROM boards b, tags t WHERE b.slug = 'product' AND t.slug = 'api'
ON CONFLICT DO NOTHING;

-- Competitive board tags
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 1 FROM boards b, tags t WHERE b.slug = 'competitive' AND t.slug = 'battlecards'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 2 FROM boards b, tags t WHERE b.slug = 'competitive' AND t.slug = 'win-loss'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 3 FROM boards b, tags t WHERE b.slug = 'competitive' AND t.slug = 'competitor-analysis'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 4 FROM boards b, tags t WHERE b.slug = 'competitive' AND t.slug = 'pricing'
ON CONFLICT DO NOTHING;

-- Sales board tags
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 1 FROM boards b, tags t WHERE b.slug = 'sales' AND t.slug = 'proposals'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 2 FROM boards b, tags t WHERE b.slug = 'sales' AND t.slug = 'discovery'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 3 FROM boards b, tags t WHERE b.slug = 'sales' AND t.slug = 'objection-handling'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 4 FROM boards b, tags t WHERE b.slug = 'sales' AND t.slug = 'pricing'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 5 FROM boards b, tags t WHERE b.slug = 'sales' AND t.slug = 'negotiation'
ON CONFLICT DO NOTHING;

-- CSM board tags
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 1 FROM boards b, tags t WHERE b.slug = 'csm' AND t.slug = 'onboarding'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 2 FROM boards b, tags t WHERE b.slug = 'csm' AND t.slug = 'qbrs'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 3 FROM boards b, tags t WHERE b.slug = 'csm' AND t.slug = 'renewals'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 4 FROM boards b, tags t WHERE b.slug = 'csm' AND t.slug = 'expansion'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 5 FROM boards b, tags t WHERE b.slug = 'csm' AND t.slug = 'health-scores'
ON CONFLICT DO NOTHING;

-- SC board tags
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 1 FROM boards b, tags t WHERE b.slug = 'sc' AND t.slug = 'poc'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 2 FROM boards b, tags t WHERE b.slug = 'sc' AND t.slug = 'technical-demo'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 3 FROM boards b, tags t WHERE b.slug = 'sc' AND t.slug = 'integration'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 4 FROM boards b, tags t WHERE b.slug = 'sc' AND t.slug = 'security'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 5 FROM boards b, tags t WHERE b.slug = 'sc' AND t.slug = 'architecture'
ON CONFLICT DO NOTHING;

-- Demo board tags
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 1 FROM boards b, tags t WHERE b.slug = 'demo' AND t.slug = 'demo-scripts'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 2 FROM boards b, tags t WHERE b.slug = 'demo' AND t.slug = 'environments'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 3 FROM boards b, tags t WHERE b.slug = 'demo' AND t.slug = 'use-cases'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 4 FROM boards b, tags t WHERE b.slug = 'demo' AND t.slug = 'industry-demos'
ON CONFLICT DO NOTHING;

-- Proof Points board tags
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 1 FROM boards b, tags t WHERE b.slug = 'proof' AND t.slug = 'case-studies'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 2 FROM boards b, tags t WHERE b.slug = 'proof' AND t.slug = 'roi'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 3 FROM boards b, tags t WHERE b.slug = 'proof' AND t.slug = 'testimonials'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 4 FROM boards b, tags t WHERE b.slug = 'proof' AND t.slug = 'references'
ON CONFLICT DO NOTHING;
INSERT INTO board_tags (board_id, tag_id, sort_order)
SELECT b.id, t.id, 5 FROM boards b, tags t WHERE b.slug = 'proof' AND t.slug = 'stats'
ON CONFLICT DO NOTHING;
