import { NextResponse } from 'next/server';
import { db, boards, boardTags, tags } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

// POST: Reorder tags within a board and optionally update display names
export async function POST(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;
    const body = await request.json();
    const { tagOrder } = body; // Array of { tagId or tagSlug, sortOrder, displayName? }

    if (!tagOrder || !Array.isArray(tagOrder)) {
      return NextResponse.json(
        { error: 'tagOrder array required' },
        { status: 400 }
      );
    }

    // Get board by slug
    const [board] = await db
      .select()
      .from(boards)
      .where(eq(boards.slug, boardId))
      .limit(1);

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // Update each tag's sort order and display name
    for (const item of tagOrder) {
      const { tagSlug, tagId, sortOrder, displayName } = item;

      let targetTagId = tagId;

      // If tagSlug provided, get the tag ID
      if (!targetTagId && tagSlug) {
        const [tag] = await db
          .select()
          .from(tags)
          .where(eq(tags.slug, tagSlug))
          .limit(1);

        if (tag) {
          targetTagId = tag.id;
        }
      }

      if (targetTagId) {
        await db
          .update(boardTags)
          .set({
            sortOrder,
            displayName: displayName !== undefined ? displayName || null : undefined,
          })
          .where(
            and(
              eq(boardTags.boardId, board.id),
              eq(boardTags.tagId, targetTagId)
            )
          );
      }
    }

    // Return updated tags
    const updatedTags = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        color: tags.color,
        sortOrder: boardTags.sortOrder,
        displayName: boardTags.displayName,
      })
      .from(boardTags)
      .innerJoin(tags, eq(boardTags.tagId, tags.id))
      .where(eq(boardTags.boardId, board.id))
      .orderBy(boardTags.sortOrder);

    return NextResponse.json(updatedTags);
  } catch (error) {
    console.error('Error reordering board tags:', error);
    return NextResponse.json(
      { error: 'Failed to reorder tags' },
      { status: 500 }
    );
  }
}
