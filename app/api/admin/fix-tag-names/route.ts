import { NextResponse } from 'next/server';
import { db, tags } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Helper to convert slug to title case
function slugToTitleCase(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Check if a name looks like a slug (lowercase with hyphens, no spaces)
function looksLikeSlug(name: string): boolean {
  // If it has hyphens and no spaces, and is all lowercase, it's probably a slug
  return name.includes('-') && !name.includes(' ') && name === name.toLowerCase();
}

// GET - Preview what would be fixed
export async function GET() {
  try {
    const allTags = await db.select().from(tags);

    const tagsToFix = allTags.filter(tag => looksLikeSlug(tag.name));
    const preview = tagsToFix.map(tag => ({
      id: tag.id,
      currentName: tag.name,
      newName: slugToTitleCase(tag.name),
      slug: tag.slug,
    }));

    return NextResponse.json({
      total: allTags.length,
      toFix: tagsToFix.length,
      alreadyCorrect: allTags.length - tagsToFix.length,
      preview,
    });
  } catch (error) {
    console.error('Error previewing tag fixes:', error);
    return NextResponse.json({ error: 'Failed to preview tag fixes' }, { status: 500 });
  }
}

// POST - Apply the fixes
export async function POST() {
  try {
    const allTags = await db.select().from(tags);

    const tagsToFix = allTags.filter(tag => looksLikeSlug(tag.name));

    const results = [];

    for (const tag of tagsToFix) {
      const newName = slugToTitleCase(tag.name);

      await db
        .update(tags)
        .set({ name: newName })
        .where(eq(tags.id, tag.id));

      results.push({
        id: tag.id,
        oldName: tag.name,
        newName,
      });
    }

    return NextResponse.json({
      success: true,
      fixed: results.length,
      results,
    });
  } catch (error) {
    console.error('Error fixing tag names:', error);
    return NextResponse.json({ error: 'Failed to fix tag names' }, { status: 500 });
  }
}
