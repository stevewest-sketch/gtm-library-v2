import { pgTable, text, uuid, timestamp, integer, jsonb, boolean } from 'drizzle-orm/pg-core';

// Main catalog entries table
export const catalogEntries = pgTable('catalog_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  description: text('description'),

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
  keyAssetUrl: text('key_asset_url'),

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
