import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { catalogEntries, assetBoards, assetTags, boards, tags } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

// GET: Fetch a single asset by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get the asset
    const [asset] = await db
      .select()
      .from(catalogEntries)
      .where(eq(catalogEntries.slug, slug))
      .limit(1);

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Get associated boards
    const assetBoardsData = await db
      .select({
        id: boards.id,
        slug: boards.slug,
        name: boards.name,
        color: boards.color,
      })
      .from(assetBoards)
      .innerJoin(boards, eq(assetBoards.boardId, boards.id))
      .where(eq(assetBoards.assetId, asset.id));

    // Get associated tags (from the join table, not the array field)
    const assetTagsData = await db
      .select({
        id: tags.id,
        slug: tags.slug,
        name: tags.name,
      })
      .from(assetTags)
      .innerJoin(tags, eq(assetTags.tagId, tags.id))
      .where(eq(assetTags.assetId, asset.id));

    return NextResponse.json({
      ...asset,
      boards: assetBoardsData,
      tagRecords: assetTagsData, // Full tag objects from join table
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

// PUT: Update an asset by slug
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // Get existing asset
    const [existingAsset] = await db
      .select()
      .from(catalogEntries)
      .where(eq(catalogEntries.slug, slug))
      .limit(1);

    if (!existingAsset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Extract board and tag updates
    const { boardSlugs, tagNames, ...assetData } = body;

    // Update the asset
    const [updatedAsset] = await db
      .update(catalogEntries)
      .set({
        ...assetData,
        updatedAt: new Date(),
      })
      .where(eq(catalogEntries.id, existingAsset.id))
      .returning();

    // Update board associations if provided
    if (boardSlugs !== undefined) {
      // Remove all existing board associations
      await db
        .delete(assetBoards)
        .where(eq(assetBoards.assetId, existingAsset.id));

      // Add new board associations
      if (boardSlugs.length > 0) {
        const boardRecords = await db
          .select()
          .from(boards)
          .where(inArray(boards.slug, boardSlugs));

        if (boardRecords.length > 0) {
          await db.insert(assetBoards).values(
            boardRecords.map((board) => ({
              assetId: existingAsset.id,
              boardId: board.id,
            }))
          );
        }
      }
    }

    // Update tag associations if provided
    if (tagNames !== undefined) {
      // Remove all existing tag associations
      await db
        .delete(assetTags)
        .where(eq(assetTags.assetId, existingAsset.id));

      // Add new tag associations
      if (tagNames.length > 0) {
        for (const tagName of tagNames) {
          const tagSlug = tagName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/^-+|-+$/g, ''); // Also trim leading/trailing dashes

          // Find existing tag by slug OR by name (case-insensitive)
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
              // If insert fails (e.g., race condition), try to fetch again
              console.error('Tag insert failed, trying to fetch:', insertError);
              [existingTag] = await db
                .select()
                .from(tags)
                .where(eq(tags.slug, tagSlug))
                .limit(1);
            }
          }

          // Create association if we have a valid tag
          if (existingTag) {
            await db
              .insert(assetTags)
              .values({
                assetId: existingAsset.id,
                tagId: existingTag.id,
              })
              .onConflictDoNothing();
          }
        }
      }
    }

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    );
  }
}

// PATCH: Partial update an asset by slug or id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // Find asset by slug or id
    let [existingAsset] = await db
      .select()
      .from(catalogEntries)
      .where(eq(catalogEntries.slug, slug))
      .limit(1);

    // If not found by slug, try by id
    if (!existingAsset) {
      [existingAsset] = await db
        .select()
        .from(catalogEntries)
        .where(eq(catalogEntries.id, slug))
        .limit(1);
    }

    if (!existingAsset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Update only the provided fields
    const [updatedAsset] = await db
      .update(catalogEntries)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(catalogEntries.id, existingAsset.id))
      .returning();

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error('Error patching asset:', error);
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an asset by slug
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [deletedAsset] = await db
      .delete(catalogEntries)
      .where(eq(catalogEntries.slug, slug))
      .returning();

    if (!deletedAsset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deleted: deletedAsset });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
