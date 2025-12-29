import { NextResponse } from 'next/server';
import { db, catalogEntries, assetBoards, assetTags, boards, tags } from '@/lib/db';
import { eq, and, inArray, sql, desc } from 'drizzle-orm';

// GET: List assets with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const boardSlug = searchParams.get('board');
    const tagSlugs = searchParams.getAll('tag');
    const hub = searchParams.get('hub');
    const limit = parseInt(searchParams.get('limit') || '500');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeAll = searchParams.get('all') === 'true'; // For admin - include all statuses

    // Build query
    let query = db
      .select({
        id: catalogEntries.id,
        slug: catalogEntries.slug,
        title: catalogEntries.title,
        description: catalogEntries.description,
        hub: catalogEntries.hub,
        format: catalogEntries.format,
        types: catalogEntries.types,
        tags: catalogEntries.tags,
        primaryLink: catalogEntries.primaryLink,
        videoUrl: catalogEntries.videoUrl,
        durationMinutes: catalogEntries.durationMinutes,
        views: catalogEntries.views,
        shares: catalogEntries.shares,
        status: catalogEntries.status,
        featured: catalogEntries.featured,
        createdAt: catalogEntries.createdAt,
        updatedAt: catalogEntries.updatedAt,
      })
      .from(catalogEntries)
      .where(includeAll ? undefined : eq(catalogEntries.status, 'published'))
      .orderBy(desc(catalogEntries.updatedAt))
      .limit(limit)
      .offset(offset);

    // Apply filters
    const conditions: ReturnType<typeof eq>[] = includeAll ? [] : [eq(catalogEntries.status, 'published')];

    if (hub) {
      conditions.push(eq(catalogEntries.hub, hub));
    }

    // Define the shape of asset data we're selecting
    type AssetData = {
      id: string;
      slug: string;
      title: string;
      description: string | null;
      hub: string;
      format: string;
      types: string[] | null;
      tags: string[] | null;
      primaryLink: string;
      videoUrl: string | null;
      durationMinutes: number | null;
      views: number | null;
      shares: number | null;
      status: string | null;
      featured: boolean | null;
      createdAt: Date | null;
      updatedAt: Date | null;
    };

    // If board filter is specified, join with asset_boards
    let assetsData: AssetData[] = [];
    if (boardSlug) {
      // Get board ID
      const [board] = await db
        .select()
        .from(boards)
        .where(eq(boards.slug, boardSlug))
        .limit(1);

      if (board) {
        assetsData = await db
          .selectDistinct({
            id: catalogEntries.id,
            slug: catalogEntries.slug,
            title: catalogEntries.title,
            description: catalogEntries.description,
            hub: catalogEntries.hub,
            format: catalogEntries.format,
            types: catalogEntries.types,
            tags: catalogEntries.tags,
            primaryLink: catalogEntries.primaryLink,
            videoUrl: catalogEntries.videoUrl,
            durationMinutes: catalogEntries.durationMinutes,
            views: catalogEntries.views,
            shares: catalogEntries.shares,
            status: catalogEntries.status,
            featured: catalogEntries.featured,
            createdAt: catalogEntries.createdAt,
            updatedAt: catalogEntries.updatedAt,
          })
          .from(catalogEntries)
          .innerJoin(assetBoards, eq(catalogEntries.id, assetBoards.assetId))
          .where(
            and(
              ...(includeAll ? [] : [eq(catalogEntries.status, 'published')]),
              eq(assetBoards.boardId, board.id),
              ...(hub ? [eq(catalogEntries.hub, hub)] : [])
            )
          )
          .orderBy(desc(catalogEntries.updatedAt))
          .limit(limit)
          .offset(offset);
      } else {
        assetsData = [];
      }
    } else if (tagSlugs.length > 0) {
      // Filter by tags
      const tagRecords = await db
        .select()
        .from(tags)
        .where(inArray(tags.slug, tagSlugs));

      if (tagRecords.length > 0) {
        const tagIds = tagRecords.map(t => t.id);
        assetsData = await db
          .selectDistinct({
            id: catalogEntries.id,
            slug: catalogEntries.slug,
            title: catalogEntries.title,
            description: catalogEntries.description,
            hub: catalogEntries.hub,
            format: catalogEntries.format,
            types: catalogEntries.types,
            tags: catalogEntries.tags,
            primaryLink: catalogEntries.primaryLink,
            videoUrl: catalogEntries.videoUrl,
            durationMinutes: catalogEntries.durationMinutes,
            views: catalogEntries.views,
            shares: catalogEntries.shares,
            status: catalogEntries.status,
            featured: catalogEntries.featured,
            createdAt: catalogEntries.createdAt,
            updatedAt: catalogEntries.updatedAt,
          })
          .from(catalogEntries)
          .innerJoin(assetTags, eq(catalogEntries.id, assetTags.assetId))
          .where(
            and(
              ...(includeAll ? [] : [eq(catalogEntries.status, 'published')]),
              inArray(assetTags.tagId, tagIds),
              ...(hub ? [eq(catalogEntries.hub, hub)] : [])
            )
          )
          .orderBy(desc(catalogEntries.updatedAt))
          .limit(limit)
          .offset(offset);
      } else {
        assetsData = [];
      }
    } else {
      // No filter, get all assets (or just published if not admin)
      assetsData = await db
        .select({
          id: catalogEntries.id,
          slug: catalogEntries.slug,
          title: catalogEntries.title,
          description: catalogEntries.description,
          hub: catalogEntries.hub,
          format: catalogEntries.format,
          types: catalogEntries.types,
          tags: catalogEntries.tags,
          primaryLink: catalogEntries.primaryLink,
          videoUrl: catalogEntries.videoUrl,
          durationMinutes: catalogEntries.durationMinutes,
          views: catalogEntries.views,
          shares: catalogEntries.shares,
          status: catalogEntries.status,
          featured: catalogEntries.featured,
          createdAt: catalogEntries.createdAt,
          updatedAt: catalogEntries.updatedAt,
        })
        .from(catalogEntries)
        .where(
          includeAll
            ? (hub ? eq(catalogEntries.hub, hub) : undefined)
            : and(
                eq(catalogEntries.status, 'published'),
                ...(hub ? [eq(catalogEntries.hub, hub)] : [])
              )
        )
        .orderBy(desc(catalogEntries.updatedAt))
        .limit(limit)
        .offset(offset);
    }

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(catalogEntries)
      .where(includeAll ? undefined : eq(catalogEntries.status, 'published'));

    // Fetch board names for each asset
    const assetsWithBoards = await Promise.all(
      assetsData.map(async (asset) => {
        const assetBoardsData = await db
          .select({ name: boards.name })
          .from(assetBoards)
          .innerJoin(boards, eq(assetBoards.boardId, boards.id))
          .where(eq(assetBoards.assetId, asset.id));

        return {
          ...asset,
          boards: assetBoardsData.map(b => b.name),
        };
      })
    );

    return NextResponse.json({
      assets: assetsWithBoards,
      total: countResult?.count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

// POST: Create a new asset
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      slug,
      title,
      description,
      hub,
      format,
      types,
      tags: assetTagsList,
      primaryLink,
      shareLink,
      videoUrl,
      slidesUrl,
      transcriptUrl,
      keyAssetUrl,
      presenters,
      durationMinutes,
      takeaways,
      howtos,
      tips,
      owner,
      status,
      featured,
      boardSlugs,
    } = body;

    if (!slug || !title || !hub || !format || !primaryLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the catalog entry
    const [newAsset] = await db
      .insert(catalogEntries)
      .values({
        slug,
        title,
        description,
        hub,
        format,
        types,
        tags: assetTagsList,
        primaryLink,
        shareLink,
        videoUrl,
        slidesUrl,
        transcriptUrl,
        keyAssetUrl,
        presenters,
        durationMinutes,
        takeaways,
        howtos,
        tips,
        owner,
        status: status || 'draft',
        featured: featured || false,
      })
      .returning();

    // Associate with boards if provided
    if (boardSlugs && boardSlugs.length > 0) {
      const boardRecords = await db
        .select()
        .from(boards)
        .where(inArray(boards.slug, boardSlugs));

      if (boardRecords.length > 0) {
        await db.insert(assetBoards).values(
          boardRecords.map((board) => ({
            assetId: newAsset.id,
            boardId: board.id,
          }))
        );
      }
    }

    // Associate with tags if provided
    if (assetTagsList && assetTagsList.length > 0) {
      // Get or create tags
      for (const tagName of assetTagsList) {
        const tagSlug = tagName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/^-+|-+$/g, ''); // Trim leading/trailing dashes

        // Find existing tag by slug OR by name
        let [existingTag] = await db
          .select()
          .from(tags)
          .where(eq(tags.slug, tagSlug))
          .limit(1);

        // If not found by slug, try by exact name
        if (!existingTag) {
          [existingTag] = await db
            .select()
            .from(tags)
            .where(eq(tags.name, tagName))
            .limit(1);
        }

        // If still not found, create new tag
        if (!existingTag) {
          try {
            [existingTag] = await db
              .insert(tags)
              .values({ name: tagName, slug: tagSlug })
              .returning();
          } catch (insertError) {
            // If insert fails (e.g., race condition or unique constraint), try to fetch again
            console.error('Tag insert failed, trying to fetch:', insertError);
            [existingTag] = await db
              .select()
              .from(tags)
              .where(eq(tags.slug, tagSlug))
              .limit(1);
          }
        }

        // Associate tag with asset if we have a valid tag
        if (existingTag) {
          await db
            .insert(assetTags)
            .values({
              assetId: newAsset.id,
              tagId: existingTag.id,
            })
            .onConflictDoNothing();
        }
      }
    }

    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}
