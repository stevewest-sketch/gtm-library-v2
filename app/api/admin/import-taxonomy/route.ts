import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tags, boards, boardTags } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Product tags from taxonomy
const PRODUCT_TAGS = [
  { name: 'Gladly', slug: 'gladly', category: 'product' },
  { name: 'Gladly Team', slug: 'gladly-team', category: 'product' },
  { name: 'Voice', slug: 'voice', category: 'product' },
  { name: 'Guides', slug: 'guides', category: 'product' },
  { name: 'Journeys', slug: 'journeys', category: 'product' },
  { name: 'App Platform', slug: 'app-platform', category: 'product' },
  { name: 'Copilot', slug: 'copilot', category: 'product' },
  { name: 'Insights', slug: 'insights', category: 'product' },
];

// Team tags from taxonomy
const TEAM_TAGS = [
  { name: 'Sales', slug: 'sales', category: 'team' },
  { name: 'AE', slug: 'ae', category: 'team' },
  { name: 'CSM', slug: 'csm', category: 'team' },
  { name: 'SC', slug: 'sc', category: 'team' },
  { name: 'PS', slug: 'ps', category: 'team' },
  { name: 'Implementation', slug: 'impl', category: 'team' },
  { name: 'Marketing', slug: 'mktg', category: 'team' },
  { name: 'Partners', slug: 'partner', category: 'team' },
];

// Competitor tags
const COMPETITOR_TAGS = [
  { name: 'Zendesk', slug: 'zendesk', category: 'competitor' },
  { name: 'Intercom', slug: 'intercom', category: 'competitor' },
  { name: 'Salesforce', slug: 'salesforce', category: 'competitor' },
  { name: 'Gorgias', slug: 'gorgias', category: 'competitor' },
  { name: 'Kustomer', slug: 'kustomer', category: 'competitor' },
  { name: 'Ada', slug: 'ada', category: 'competitor' },
  { name: 'Sierra', slug: 'sierra', category: 'competitor' },
  { name: 'Genesys', slug: 'genesys', category: 'competitor' },
];

// Vertical tags
const VERTICAL_TAGS = [
  { name: 'Retail', slug: 'retail', category: 'vertical' },
  { name: 'Travel', slug: 'travel', category: 'vertical' },
  { name: 'Hospitality', slug: 'hospitality', category: 'vertical' },
  { name: 'Marketplace', slug: 'marketplace', category: 'vertical' },
  { name: 'E-commerce', slug: 'ecommerce', category: 'vertical' },
  { name: 'Airline', slug: 'airline', category: 'vertical' },
  { name: 'DTC', slug: 'dtc', category: 'vertical' },
  { name: 'Financial Services', slug: 'financial-services', category: 'vertical' },
];

// Topic tags
const TOPIC_TAGS = [
  { name: 'Discovery', slug: 'discovery', category: 'topic' },
  { name: 'Pricing', slug: 'pricing', category: 'topic' },
  { name: 'Objection Handling', slug: 'objection-handling', category: 'topic' },
  { name: 'ROI', slug: 'roi', category: 'topic' },
  { name: 'BVA', slug: 'bva', category: 'topic' },
  { name: 'Implementation', slug: 'implementation', category: 'topic' },
  { name: 'Security', slug: 'security', category: 'topic' },
  { name: 'Integration', slug: 'integration', category: 'topic' },
];

const ALL_TAGS = [
  ...PRODUCT_TAGS,
  ...TEAM_TAGS,
  ...COMPETITOR_TAGS,
  ...VERTICAL_TAGS,
  ...TOPIC_TAGS,
];

export async function POST() {
  try {
    const results: string[] = [];

    // Get existing tags
    const existingTags = await db.select().from(tags);
    const existingBySlug = new Map(existingTags.map(t => [t.slug, t]));

    let created = 0;
    let skipped = 0;

    // Import tags
    for (const tag of ALL_TAGS) {
      if (existingBySlug.has(tag.slug)) {
        skipped++;
        continue;
      }

      try {
        await db.insert(tags).values({
          name: tag.name,
          slug: tag.slug,
          category: tag.category,
        });
        results.push(`Created tag: ${tag.name} (${tag.category})`);
        created++;
      } catch {
        results.push(`Error creating tag: ${tag.name}`);
      }
    }

    results.push(`Tags: ${created} created, ${skipped} skipped`);

    // Create Product board if it doesn't exist
    const [existingProductBoard] = await db
      .select()
      .from(boards)
      .where(eq(boards.slug, 'product'))
      .limit(1);

    let productBoard = existingProductBoard;

    if (!productBoard) {
      const [newBoard] = await db
        .insert(boards)
        .values({
          name: 'Product',
          slug: 'product',
          icon: '📦',
          color: '#3B82F6',
          lightColor: '#DBEAFE',
          accentColor: '#1D4ED8',
          sortOrder: 4,
        })
        .returning();
      productBoard = newBoard;
      results.push('Created Product board');
    } else {
      results.push('Product board already exists');
    }

    // Associate product tags with the Product board
    const allDbTags = await db.select().from(tags);
    const tagBySlug = new Map(allDbTags.map(t => [t.slug, t]));

    let associated = 0;
    for (const productTag of PRODUCT_TAGS) {
      const tag = tagBySlug.get(productTag.slug);
      if (!tag) continue;

      // Check if association exists
      const existing = await db
        .select()
        .from(boardTags)
        .where(and(
          eq(boardTags.boardId, productBoard.id),
          eq(boardTags.tagId, tag.id)
        ))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(boardTags).values({
          boardId: productBoard.id,
          tagId: tag.id,
        });
        associated++;
      }
    }

    if (associated > 0) {
      results.push(`Associated ${associated} product tags with Product board`);
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Import taxonomy failed:', error);
    return NextResponse.json(
      { error: 'Import failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
