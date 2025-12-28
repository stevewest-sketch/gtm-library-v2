import { db, catalogEntries, assetBoards, boards } from '../lib/db';
import { eq, and, desc } from 'drizzle-orm';
import { config } from 'dotenv';

// Load .env.local
config({ path: '.env.local' });

async function testQuery() {
  console.log('Testing getAssetsForBoard query...\n');

  const boardSlug = 'coe';

  // First get the board from the database
  console.log(`Looking up board: ${boardSlug}`);
  const [boardRecord] = await db
    .select()
    .from(boards)
    .where(eq(boards.slug, boardSlug))
    .limit(1);

  if (!boardRecord) {
    console.log('Board not found!');
    process.exit(1);
  }

  console.log(`Found board: ${boardRecord.name} (${boardRecord.id})\n`);

  // Get assets associated with this board
  console.log('Querying assets...');
  try {
    const assets = await db
      .selectDistinct({
        id: catalogEntries.id,
        slug: catalogEntries.slug,
        title: catalogEntries.title,
        description: catalogEntries.description,
        hub: catalogEntries.hub,
        format: catalogEntries.format,
        types: catalogEntries.types,
        tags: catalogEntries.tags,
        primaryLink: catalogEntries.primaryLink,
        videoUrl: catalogEntries.videoUrl,
        durationMinutes: catalogEntries.durationMinutes,
        views: catalogEntries.views,
        shares: catalogEntries.shares,
        status: catalogEntries.status,
      })
      .from(catalogEntries)
      .innerJoin(assetBoards, eq(catalogEntries.id, assetBoards.assetId))
      .where(
        and(
          eq(catalogEntries.status, 'published'),
          eq(assetBoards.boardId, boardRecord.id)
        )
      )
      .orderBy(desc(catalogEntries.updatedAt));

    console.log(`Found ${assets.length} assets:\n`);
    assets.forEach(a => {
      console.log(`  - ${a.slug}: ${a.title}`);
    });
  } catch (error) {
    console.error('Query failed:', error);
  }

  process.exit(0);
}

testQuery();
