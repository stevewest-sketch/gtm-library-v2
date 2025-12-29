import { NextResponse } from 'next/server';
import { db, boards } from '@/lib/db';
import { eq } from 'drizzle-orm';

// POST: Reorder boards
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { boardOrder } = body;

    if (!Array.isArray(boardOrder)) {
      return NextResponse.json(
        { error: 'boardOrder must be an array of board slugs' },
        { status: 400 }
      );
    }

    // Update sort order for each board
    await Promise.all(
      boardOrder.map(async (slug: string, index: number) => {
        await db
          .update(boards)
          .set({ sortOrder: index, updatedAt: new Date() })
          .where(eq(boards.slug, slug));
      })
    );

    return NextResponse.json({ success: true, message: 'Boards reordered successfully' });
  } catch (error) {
    console.error('Error reordering boards:', error);
    return NextResponse.json(
      { error: 'Failed to reorder boards' },
      { status: 500 }
    );
  }
}
