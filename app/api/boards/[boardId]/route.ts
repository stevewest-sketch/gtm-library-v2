import { NextResponse } from 'next/server';
import { db, boards, boardTags, tags, assetBoards } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';

// GET: Single board with its tags
export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;

    // Get board by slug or id
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
      })
      .from(boardTags)
      .innerJoin(tags, eq(boardTags.tagId, tags.id))
      .where(eq(boardTags.boardId, board.id))
      .orderBy(boardTags.sortOrder);

    // Get asset count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(assetBoards)
      .where(eq(assetBoards.boardId, board.id));

    return NextResponse.json({
      ...board,
      tags: boardTagsData,
      assetCount: countResult?.count || 0,
    });
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    );
  }
}

// PUT: Update a board
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;
    const body = await request.json();

    const [updatedBoard] = await db
      .update(boards)
      .set({
        name: body.name,
        icon: body.icon,
        color: body.color,
        lightColor: body.lightColor,
        accentColor: body.accentColor,
        sortOrder: body.sortOrder,
      })
      .where(eq(boards.slug, boardId))
      .returning();

    if (!updatedBoard) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBoard);
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json(
      { error: 'Failed to update board' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a board
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;

    const [deletedBoard] = await db
      .delete(boards)
      .where(eq(boards.slug, boardId))
      .returning();

    if (!deletedBoard) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    );
  }
}
