import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';
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

const migrations = [
  '001_initial_schema.sql',
  '002_boards_tags_schema.sql',
  '003_seed_data.sql',
  '004_import_assets.sql',
];

async function runMigrations() {
  console.log('Starting migrations...\n');

  for (const migration of migrations) {
    const filePath = join(process.cwd(), 'supabase', 'migrations', migration);
    console.log(`Running: ${migration}`);

    try {
      const sqlContent = readFileSync(filePath, 'utf-8');
      await sql.unsafe(sqlContent);
      console.log(`  ✓ ${migration} completed\n`);
    } catch (error: unknown) {
      const err = error as Error;
      // Check for "already exists" errors and continue
      if (err.message.includes('already exists') ||
          err.message.includes('duplicate key') ||
          err.message.includes('relation') && err.message.includes('already exists')) {
        console.log(`  ⚠ ${migration} - some objects already exist, continuing...\n`);
      } else {
        console.error(`  ✗ ${migration} failed:`, err.message);
        // Continue with other migrations
      }
    }
  }

  console.log('Migrations complete!');
  await sql.end();
}

runMigrations().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
