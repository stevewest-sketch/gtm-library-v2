import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// POST - Create homepage_config table if it doesn't exist
export async function POST() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS homepage_config (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        hero_title text DEFAULT 'GTM Hub' NOT NULL,
        hero_subtitle text DEFAULT 'Your central hub for selling, supporting, and growing with Gladly.' NOT NULL,
        show_hero boolean DEFAULT true,
        show_hub_cards boolean DEFAULT true,
        hub_cards_order jsonb DEFAULT '["coe","content","enablement"]'::jsonb,
        featured_board_id uuid,
        featured_board_enabled boolean DEFAULT true,
        featured_board_max_items integer DEFAULT 3,
        featured_board_title_override text,
        featured_board_description_override text,
        featured_board_icon text DEFAULT '🎯',
        recently_added_enabled boolean DEFAULT true,
        recently_added_max_items integer DEFAULT 6,
        recently_added_new_threshold_days integer DEFAULT 7,
        updated_at timestamp DEFAULT now()
      );
    `);

    // Insert default row if table is empty
    await db.execute(sql`
      INSERT INTO homepage_config (id)
      SELECT gen_random_uuid()
      WHERE NOT EXISTS (SELECT 1 FROM homepage_config LIMIT 1);
    `);

    return NextResponse.json({ success: true, message: 'Homepage config table created/verified' });
  } catch (error) {
    console.error('Error creating homepage_config table:', error);
    return NextResponse.json(
      { error: 'Failed to create table', details: String(error) },
      { status: 500 }
    );
  }
}
