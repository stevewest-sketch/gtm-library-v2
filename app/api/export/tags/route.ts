import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tags, boardTags, boards, assetTags } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get all tags
    const allTags = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        category: tags.category,
        color: tags.color,
        sortOrder: tags.sortOrder,
        createdAt: tags.createdAt,
      })
      .from(tags)
      .orderBy(tags.name);

    // Get all board-tag associations in one query
    const allBoardTags = await db
      .select({
        tagId: boardTags.tagId,
        boardSlug: boards.slug,
      })
      .from(boardTags)
      .innerJoin(boards, eq(boardTags.boardId, boards.id));

    // Get asset counts per tag in one query
    const assetCounts = await db
      .select({
        tagId: assetTags.tagId,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(assetTags)
      .groupBy(assetTags.tagId);

    // Build lookup maps
    const boardsByTagId = new Map<string, string[]>();
    for (const bt of allBoardTags) {
      if (!bt.tagId) continue;
      if (!boardsByTagId.has(bt.tagId)) {
        boardsByTagId.set(bt.tagId, []);
      }
      boardsByTagId.get(bt.tagId)!.push(bt.boardSlug);
    }

    const countByTagId = new Map<string, number>();
    for (const ac of assetCounts) {
      if (!ac.tagId) continue;
      countByTagId.set(ac.tagId, Number(ac.count));
    }

    // CSV headers
    const headers = [
      'name',
      'slug',
      'category',
      'color',
      'sortOrder',
      'boards',
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
    const rows = allTags.map(tag => [
      escapeCSV(tag.name),
      escapeCSV(tag.slug),
      escapeCSV(tag.category),
      escapeCSV(tag.color),
      escapeCSV(tag.sortOrder),
      escapeCSV((boardsByTagId.get(tag.id) || []).join('|')),
      escapeCSV(countByTagId.get(tag.id) || 0),
      escapeCSV(tag.createdAt?.toISOString()),
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="tags-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export tags failed:', error);
    return NextResponse.json(
      { error: 'Failed to export tags' },
      { status: 500 }
    );
  }
}
