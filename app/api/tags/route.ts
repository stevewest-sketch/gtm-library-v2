import { NextResponse } from 'next/server';
import { db, tags, boardTags, assetTags } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';

// GET: List all tags with optional usage counts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCounts = searchParams.get('counts') === 'true';

    const tagsData = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        category: tags.category,
        color: tags.color,
        sortOrder: tags.sortOrder,
      })
      .from(tags)
      .orderBy(tags.sortOrder);

    // Only calculate counts if explicitly requested (for admin pages)
    if (includeCounts) {
      const tagsWithCounts = await Promise.all(
        tagsData.map(async (tag) => {
          const [boardCount] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(boardTags)
            .where(eq(boardTags.tagId, tag.id));

          const [assetCount] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(assetTags)
            .where(eq(assetTags.tagId, tag.id));

          return {
            ...tag,
            boardCount: boardCount?.count || 0,
            assetCount: assetCount?.count || 0,
          };
        })
      );
      return NextResponse.json(tagsWithCounts);
    }

    // Return just the tags without counts (much faster)
    return NextResponse.json(tagsData);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

// POST: Create a new tag
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, category, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    const tagSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const [newTag] = await db
      .insert(tags)
      .values({
        name,
        slug: tagSlug,
        category,
        color,
      })
      .returning();

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
