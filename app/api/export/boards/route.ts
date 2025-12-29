import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { boards, boardTags, tags, assetBoards } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get all boards
    const allBoards = await db
      .select({
        id: boards.id,
        name: boards.name,
        slug: boards.slug,
        icon: boards.icon,
        color: boards.color,
        lightColor: boards.lightColor,
        accentColor: boards.accentColor,
        sortOrder: boards.sortOrder,
        createdAt: boards.createdAt,
      })
      .from(boards)
      .orderBy(boards.sortOrder, boards.name);

    // Get all board-tag associations in one query
    const allBoardTags = await db
      .select({
        boardId: boardTags.boardId,
        tagSlug: tags.slug,
      })
      .from(boardTags)
      .innerJoin(tags, eq(boardTags.tagId, tags.id));

    // Get asset counts per board in one query
    const assetCounts = await db
      .select({
        boardId: assetBoards.boardId,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(assetBoards)
      .groupBy(assetBoards.boardId);

    // Build lookup maps
    const tagsByBoardId = new Map<string, string[]>();
    for (const bt of allBoardTags) {
      if (!bt.boardId) continue;
      if (!tagsByBoardId.has(bt.boardId)) {
        tagsByBoardId.set(bt.boardId, []);
      }
      tagsByBoardId.get(bt.boardId)!.push(bt.tagSlug);
    }

    const countByBoardId = new Map<string, number>();
    for (const ac of assetCounts) {
      if (!ac.boardId) continue;
      countByBoardId.set(ac.boardId, Number(ac.count));
    }

    // CSV headers
    const headers = [
      'name',
      'slug',
      'icon',
      'color',
      'lightColor',
      'accentColor',
      'sortOrder',
      'tags',
      'assetCount',
      'createdAt',
    ];

    // Helper to escape CSV values
    const escapeCSV = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    // Build CSV rows
    const rows = allBoards.map(board => [
      escapeCSV(board.name),
      escapeCSV(board.slug),
      escapeCSV(board.icon),
      escapeCSV(board.color),
      escapeCSV(board.lightColor),
      escapeCSV(board.accentColor),
      escapeCSV(board.sortOrder),
      escapeCSV((tagsByBoardId.get(board.id) || []).join('|')),
      escapeCSV(countByBoardId.get(board.id) || 0),
      escapeCSV(board.createdAt?.toISOString()),
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="boards-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export boards failed:', error);
    return NextResponse.json(
      { error: 'Failed to export boards' },
      { status: 500 }
    );
  }
}
