import { NextResponse } from 'next/server';
import { db, contentTypes, formats } from '@/lib/db';
import { ALL_TYPES, FORMATS } from '@/lib/taxonomy';

// Format colors from card-config (FORMAT_ICONS uses these)
const FORMAT_COLORS: Record<string, string> = {
  slides: '#FBBC04',
  document: '#4285F4',
  spreadsheet: '#34A853',
  pdf: '#EA4335',
  video: '#EA4335',
  article: '#64748B',
  tool: '#06B6D4',
  guide: '#3B82F6',
  sequence: '#8B5CF6',
  'live-replay': '#DC2626',
  'on-demand': '#2563EB',
  course: '#7C3AED',
  'web-link': '#6B7280',
};

export async function POST() {
  try {
    let typesCreated = 0;
    let formatsCreated = 0;

    // Seed content types from taxonomy (no hub - all types are universal)
    for (const [slug, config] of Object.entries(ALL_TYPES)) {
      try {
        await db.insert(contentTypes).values({
          slug,
          name: config.label,
          hub: null, // All types are now universal, no hub restriction
          bgColor: config.bg,
          textColor: config.color,
          sortOrder: typesCreated,
        }).onConflictDoNothing();
        typesCreated++;
      } catch (e) {
        // Ignore duplicates
      }
    }

    // Seed formats from taxonomy
    for (const [slug, config] of Object.entries(FORMATS)) {
      try {
        await db.insert(formats).values({
          slug,
          name: config.label,
          color: FORMAT_COLORS[slug] || '#6B7280',
          iconType: slug, // iconType matches the slug
          sortOrder: formatsCreated,
        }).onConflictDoNothing();
        formatsCreated++;
      } catch (e) {
        // Ignore duplicates
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${typesCreated} types and ${formatsCreated} formats from taxonomy`,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
