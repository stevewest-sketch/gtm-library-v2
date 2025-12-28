import postgres from 'postgres';
import { config } from 'dotenv';

// Load .env.local
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = postgres(connectionString, {
  ssl: 'require',
});

async function verifyDb() {
  console.log('Checking database state...\n');

  // Check boards
  const boards = await sql`SELECT id, slug, name FROM boards ORDER BY sort_order`;
  console.log(`Boards (${boards.length}):`);
  boards.forEach(b => console.log(`  - ${b.slug}: ${b.name} (${b.id})`));
  console.log();

  // Check catalog_entries
  const entries = await sql`SELECT id, slug, title, hub, status FROM catalog_entries WHERE status = 'published'`;
  console.log(`Published Assets (${entries.length}):`);
  entries.forEach(e => console.log(`  - ${e.slug}: ${e.title} (hub: ${e.hub})`));
  console.log();

  // Check asset_boards
  const assetBoards = await sql`
    SELECT
      ce.slug as asset_slug,
      b.slug as board_slug
    FROM asset_boards ab
    JOIN catalog_entries ce ON ce.id = ab.asset_id
    JOIN boards b ON b.id = ab.board_id
  `;
  console.log(`Asset-Board associations (${assetBoards.length}):`);
  assetBoards.forEach(ab => console.log(`  - ${ab.asset_slug} -> ${ab.board_slug}`));
  console.log();

  // Check tags count
  const tags = await sql`SELECT COUNT(*) as count FROM tags`;
  console.log(`Tags: ${tags[0].count}`);

  await sql.end();
  console.log('\nDone!');
}

verifyDb().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
