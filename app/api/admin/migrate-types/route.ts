import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function POST() {
  try {
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

    return NextResponse.json({ success: true, message: 'Tables created successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
