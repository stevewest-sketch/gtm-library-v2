import { NextResponse } from 'next/server';
import { db, boards, boardTags, tags, assetBoards } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';

// GET: List all boards with their tags and asset counts
export async function GET() {
  try {
    // Get all boards with their associated tags
    const boardsData = await db
      .select({
        id: boards.id,
        slug: boards.slug,
        name: boards.name,
        icon: boards.icon,
        color: boards.color,
        lightColor: boards.lightColor,
        accentColor: boards.accentColor,
        sortOrder: boards.sortOrder,
      })
      .from(boards)
      .orderBy(boards.sortOrder);

    // For each board, get its tags and asset count
    const boardsWithDetails = await Promise.all(
      boardsData.map(async (board) => {
        // Get tags for this board (including displayName override from boardTags)
        const boardTagsData = await db
          .select({
            id: tags.id,
            name: tags.name,
            slug: tags.slug,
            color: tags.color,
            displayName: boardTags.displayName,
          })
          .from(boardTags)
          .innerJoin(tags, eq(boardTags.tagId, tags.id))
          .where(eq(boardTags.boardId, board.id))
          .orderBy(boardTags.sortOrder);

        // Get asset count for this board
        const [countResult] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(assetBoards)
          .where(eq(assetBoards.boardId, board.id));

        return {
          ...board,
          tags: boardTagsData,
          assetCount: countResult?.count || 0,
        };
      })
    );

    return NextResponse.json(boardsWithDetails);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    );
  }
}

// POST: Create a new board
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, name, icon, color, lightColor, accentColor, sortOrder } = body;

    if (!slug || !name || !color || !lightColor || !accentColor) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newBoard] = await db
      .insert(boards)
      .values({
        slug,
        name,
        icon,
        color,
        lightColor,
        accentColor,
        sortOrder: sortOrder || 0,
      })
      .returning();

    return NextResponse.json(newBoard, { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    );
  }
}
