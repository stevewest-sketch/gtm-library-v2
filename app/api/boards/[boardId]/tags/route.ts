import { NextResponse } from 'next/server';
import { db, boards, boardTags, tags } from '@/lib/db';
import { eq, and, sql } from 'drizzle-orm';

// GET: Get tags for a specific board
export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;

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

    // Get tags for this board
    const boardTagsData = await db
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

    return NextResponse.json(boardTagsData);
  } catch (error) {
    console.error('Error fetching board tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board tags' },
      { status: 500 }
    );
  }
}

// POST: Add a tag to a board (existing or new)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;
    const body = await request.json();
    const { tagId, tagName, tagSlug, sortOrder } = body;

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

    let targetTagId = tagId;

    // If no tagId provided, create a new tag
    if (!tagId && tagName) {
      const slug = tagSlug || tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Check if tag already exists
      const [existingTag] = await db
        .select()
        .from(tags)
        .where(eq(tags.slug, slug))
        .limit(1);

      if (existingTag) {
        targetTagId = existingTag.id;
      } else {
        // Create new tag
        const [newTag] = await db
          .insert(tags)
          .values({
            name: tagName,
            slug,
          })
          .returning();
        targetTagId = newTag.id;
      }
    }

    if (!targetTagId) {
      return NextResponse.json(
        { error: 'Tag ID or name required' },
        { status: 400 }
      );
    }

    // Get max sort order for this board
    const [maxSort] = await db
      .select({ maxOrder: sql<number>`COALESCE(MAX(sort_order), 0)::int` })
      .from(boardTags)
      .where(eq(boardTags.boardId, board.id));

    // Add tag to board
    const [newBoardTag] = await db
      .insert(boardTags)
      .values({
        boardId: board.id,
        tagId: targetTagId,
        sortOrder: sortOrder ?? (maxSort?.maxOrder || 0) + 1,
      })
      .onConflictDoNothing()
      .returning();

    if (!newBoardTag) {
      return NextResponse.json(
        { error: 'Tag already assigned to this board' },
        { status: 409 }
      );
    }

    // Get the full tag info
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, targetTagId))
      .limit(1);

    return NextResponse.json({
      ...tag,
      sortOrder: newBoardTag.sortOrder,
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding tag to board:', error);
    return NextResponse.json(
      { error: 'Failed to add tag to board' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a tag from a board
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;
    const { searchParams } = new URL(request.url);
    const tagSlug = searchParams.get('tagSlug');

    if (!tagSlug) {
      return NextResponse.json(
        { error: 'Tag slug required' },
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

    // Get tag by slug
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, tagSlug))
      .limit(1);

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Remove tag from board
    await db
      .delete(boardTags)
      .where(
        and(
          eq(boardTags.boardId, board.id),
          eq(boardTags.tagId, tag.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing tag from board:', error);
    return NextResponse.json(
      { error: 'Failed to remove tag from board' },
      { status: 500 }
    );
  }
}
