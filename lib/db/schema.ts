import { pgTable, text, uuid, timestamp, integer, jsonb, boolean } from 'drizzle-orm/pg-core';

// Related asset type for flexible URL storage
export interface RelatedAsset {
  url: string;
  displayName: string;
  type?: string; // Optional type hint: 'document', 'video', 'slides', 'template', 'tool', 'link', etc.
}

// Main catalog entries table
export const catalogEntries = pgTable('catalog_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  shortDescription: text('short_description'), // 6 words max, shown on card view

  // Classification
  hub: text('hub').notNull(), // 'coe' | 'content' | 'enablement'
  format: text('format').notNull(), // 'slides' | 'video' | 'document' | etc.
  types: text('types').array(), // ['product', 'competitive', ...]
  tags: text('tags').array(), // ['sidekick', 'zendesk', 'sales', ...]

  // Links
  primaryLink: text('primary_link').notNull(),
  shareLink: text('share_link'),
  videoUrl: text('video_url'),
  slidesUrl: text('slides_url'),
  transcriptUrl: text('transcript_url'),
  keyAssetUrl: text('key_asset_url'), // Deprecated - use relatedAssets instead

  // Flexible related assets (replaces keyAssetUrl)
  relatedAssets: jsonb('related_assets').$type<RelatedAsset[]>(),

  // Enablement-specific fields
  presenters: text('presenters').array(),
  durationMinutes: integer('duration_minutes'),
  eventDate: timestamp('event_date'), // Date of training/session (for Enablement)
  takeaways: text('takeaways').array(),
  howtos: jsonb('howtos').$type<{ title: string; content: string }[]>(),
  tips: text('tips').array(),

  // Content sections (for rich detail pages)
  pageSections: jsonb('page_sections').$type<PageSection[]>(),

  // Metadata
  owner: text('owner'),
  views: integer('views').default(0),
  shares: integer('shares').default(0),
  status: text('status').default('draft'), // 'draft' | 'published' | 'archived'
  featured: boolean('featured').default(false),
  priority: integer('priority').default(0),

  // AI inference confidence scores
  aiConfidence: jsonb('ai_confidence').$type<{
    hub?: number;
    format?: number;
    types?: number;
    tags?: number;
  }>(),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  publishedAt: timestamp('published_at'),
});

// Page section types for rich content
export type PageSection =
  | { type: 'overview'; cards: { label: string; content: string }[] }
  | { type: 'video'; videoUrl?: string; wistiaId?: string; sessionMaterials?: { videoUrl?: string; slidesUrl?: string; transcriptUrl?: string } }
  | { type: 'takeaways'; items: string[] }
  | { type: 'process'; layout?: 'steps' | 'numbered'; steps: { heading: string; content: string }[] }
  | { type: 'tips'; items: string[] }
  | { type: 'faq'; items: { question: string; answer: string }[] }
  | { type: 'assets'; items: { icon?: string; title: string; description?: string; url: string }[] }
  | { type: 'text'; content: string }
  | { type: 'checklist'; columns: { title: string; items: string[] }[] };

// Type inference from schema
export type CatalogEntry = typeof catalogEntries.$inferSelect;
export type NewCatalogEntry = typeof catalogEntries.$inferInsert;

// Boards table (manually managed)
export const boards = pgTable('boards', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(),
  name: text('name').notNull(),
  icon: text('icon'), // emoji
  color: text('color').notNull(),
  lightColor: text('light_color').notNull(),
  accentColor: text('accent_color').notNull(),
  defaultView: text('default_view').default('grid'), // 'grid' | 'stack'
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;

// Tags table for managing reusable tags
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
  category: text('category'), // 'product' | 'team' | 'competitor' | 'topic'
  color: text('color'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

// Board-Tag junction (which tags are subgroups of which boards)
export const boardTags = pgTable('board_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').references(() => boards.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').default(0),
  displayName: text('display_name'), // Optional override for tag name on this board (e.g., "tool" → "Tools")
  createdAt: timestamp('created_at').defaultNow(),
});

export type BoardTag = typeof boardTags.$inferSelect;
export type NewBoardTag = typeof boardTags.$inferInsert;

// Asset-Tag junction (which tags are on which assets)
export const assetTags = pgTable('asset_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  assetId: uuid('asset_id').references(() => catalogEntries.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

export type AssetTag = typeof assetTags.$inferSelect;
export type NewAssetTag = typeof assetTags.$inferInsert;

// Asset-Board junction (which boards an asset appears in)
export const assetBoards = pgTable('asset_boards', {
  id: uuid('id').primaryKey().defaultRandom(),
  assetId: uuid('asset_id').references(() => catalogEntries.id, { onDelete: 'cascade' }),
  boardId: uuid('board_id').references(() => boards.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

export type AssetBoard = typeof assetBoards.$inferSelect;
export type NewAssetBoard = typeof assetBoards.$inferInsert;

// View tracking for analytics
export const viewEvents = pgTable('view_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id').references(() => catalogEntries.id),
  viewedAt: timestamp('viewed_at').defaultNow(),
  source: text('source'), // 'direct' | 'search' | 'related'
  sessionId: text('session_id'),
});

export type ViewEvent = typeof viewEvents.$inferSelect;

// Content Types table (e.g., Deck, Battlecard, Product Overview, etc.)
export const contentTypes = pgTable('content_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(),
  name: text('name').notNull(),
  hub: text('hub'), // Which hub this type belongs to: 'content' | 'enablement' | 'coe' | null (all)
  icon: text('icon'), // Optional emoji icon for this type (e.g., '📊', '⚔️')
  bgColor: text('bg_color').notNull(), // Background color for badge (e.g., '#EDE9FE')
  textColor: text('text_color').notNull(), // Text color for badge (e.g., '#8C69F0')
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type ContentType = typeof contentTypes.$inferSelect;
export type NewContentType = typeof contentTypes.$inferInsert;

// Formats table (e.g., Slides, Video, Document, etc.)
export const formats = pgTable('formats', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(),
  name: text('name').notNull(),
  color: text('color').notNull(), // Icon/brand color (e.g., '#FBBC04' for Google Slides)
  iconType: text('icon_type').notNull().default('document'), // Which icon to use (maps to FORMAT_ICONS keys)
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Format = typeof formats.$inferSelect;
export type NewFormat = typeof formats.$inferInsert;

// Homepage configuration (singleton table)
export const homepageConfig = pgTable('homepage_config', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Hero Section
  heroTitle: text('hero_title').notNull().default('GTM Hub'),
  heroSubtitle: text('hero_subtitle').notNull().default('Your central hub for selling, supporting, and growing with Gladly.'),
  showHero: boolean('show_hero').default(true),

  // Hub Cards
  showHubCards: boolean('show_hub_cards').default(true),
  hubCardsOrder: jsonb('hub_cards_order').$type<string[]>().default(['coe', 'content', 'enablement']),

  // Featured Board
  featuredBoardId: uuid('featured_board_id').references(() => boards.id, { onDelete: 'set null' }),
  featuredBoardEnabled: boolean('featured_board_enabled').default(true),
  featuredBoardMaxItems: integer('featured_board_max_items').default(3),
  featuredBoardTitleOverride: text('featured_board_title_override'),
  featuredBoardDescriptionOverride: text('featured_board_description_override'),
  featuredBoardIcon: text('featured_board_icon').default('🎯'),

  // Recently Added
  recentlyAddedEnabled: boolean('recently_added_enabled').default(true),
  recentlyAddedMaxItems: integer('recently_added_max_items').default(6),
  recentlyAddedNewThresholdDays: integer('recently_added_new_threshold_days').default(7),

  // Metadata
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type HomepageConfig = typeof homepageConfig.$inferSelect;
export type NewHomepageConfig = typeof homepageConfig.$inferInsert;
