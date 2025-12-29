import { NextResponse } from 'next/server';
import { db, tags, boardTags, boards } from '@/lib/db';
import { eq } from 'drizzle-orm';

// GET: Get all boards that have this tag
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get tag by slug
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Get boards that have this tag
    const boardsWithTag = await db
      .select({
        id: boards.id,
        slug: boards.slug,
        name: boards.name,
        icon: boards.icon,
        color: boards.color,
        lightColor: boards.lightColor,
        accentColor: boards.accentColor,
      })
      .from(boardTags)
      .innerJoin(boards, eq(boardTags.boardId, boards.id))
      .where(eq(boardTags.tagId, tag.id))
      .orderBy(boards.sortOrder);

    return NextResponse.json(boardsWithTag);
  } catch (error) {
    console.error('Error fetching boards for tag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boards for tag' },
      { status: 500 }
    );
  }
}
