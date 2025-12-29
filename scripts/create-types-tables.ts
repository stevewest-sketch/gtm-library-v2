import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function createTables() {
  console.log('Creating content_types table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS content_types (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      slug text NOT NULL UNIQUE,
      name text NOT NULL,
      hub text,
      bg_color text NOT NULL,
      text_color text NOT NULL,
      sort_order integer DEFAULT 0,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    );
  `);

  console.log('Creating formats table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS formats (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      slug text NOT NULL UNIQUE,
      name text NOT NULL,
      color text NOT NULL,
      icon_type text DEFAULT 'document' NOT NULL,
      sort_order integer DEFAULT 0,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    );
  `);

  console.log('Tables created successfully!');
  process.exit(0);
}

createTables().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
