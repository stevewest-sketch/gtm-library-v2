import { NextResponse } from "next/server";
import { db, catalogEntries, assetBoards, boards, boardTags, tags } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get the content board
    const [boardRecord] = await db
      .select()
      .from(boards)
      .where(eq(boards.slug, 'content'))
      .limit(1);

    if (!boardRecord) {
      return NextResponse.json({ error: 'Board not found' });
    }

    // Get board tags
    const boardTagsData = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        displayName: boardTags.displayName,
      })
      .from(boardTags)
      .innerJoin(tags, eq(boardTags.tagId, tags.id))
      .where(eq(boardTags.boardId, boardRecord.id))
      .orderBy(boardTags.sortOrder);

    // Get sample assets
    const assets = await db
      .selectDistinct({
        id: catalogEntries.id,
        title: catalogEntries.title,
        tags: catalogEntries.tags,
      })
      .from(catalogEntries)
      .innerJoin(assetBoards, eq(catalogEntries.id, assetBoards.assetId))
      .where(
        and(
          eq(catalogEntries.status, 'published'),
          eq(assetBoards.boardId, boardRecord.id)
        )
      )
      .limit(10);

    // Test matching logic
    const assetTagMatchesBoardTag = (assetTag: string, boardTag: { slug: string; name: string }): boolean => {
      const assetTagLower = assetTag.toLowerCase();
      return (
        assetTagLower === boardTag.slug.toLowerCase() ||
        assetTagLower === boardTag.name.toLowerCase()
      );
    };

    // Count matches per board tag
    const counts: Record<string, number> = {};
    const allAssets = await db
      .selectDistinct({
        id: catalogEntries.id,
        tags: catalogEntries.tags,
      })
      .from(catalogEntries)
      .innerJoin(assetBoards, eq(catalogEntries.id, assetBoards.assetId))
      .where(
        and(
          eq(catalogEntries.status, 'published'),
          eq(assetBoards.boardId, boardRecord.id)
        )
      );

    boardTagsData.forEach(boardTag => {
      counts[boardTag.slug] = allAssets.filter(asset =>
        (asset.tags || []).some(assetTag => assetTagMatchesBoardTag(assetTag, boardTag))
      ).length;
    });

    return NextResponse.json({
      boardId: boardRecord.id,
      boardName: boardRecord.name,
      boardTags: boardTagsData,
      sampleAssets: assets.map(a => ({
        id: a.id,
        title: a.title,
        tags: a.tags,
        tagsType: typeof a.tags,
        tagsIsArray: Array.isArray(a.tags),
      })),
      tagCounts: counts,
      totalAssets: allAssets.length,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
