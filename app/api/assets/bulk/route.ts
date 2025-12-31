import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { catalogEntries, assetBoards, assetTags, boards, tags } from '@/lib/db/schema';
import { inArray, eq, and } from 'drizzle-orm';

// POST: Bulk operations on assets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, assetIds, boardIds, tagIds, tagNames } = body;

    if (!action || !assetIds || assetIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing action or assetIds' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'addToBoards': {
        if (!boardIds || boardIds.length === 0) {
          return NextResponse.json(
            { error: 'No boards specified' },
            { status: 400 }
          );
        }

        // Build assignments
        const assignments: { assetId: string; boardId: string }[] = [];
        for (const assetId of assetIds) {
          for (const boardId of boardIds) {
            assignments.push({ assetId, boardId });
          }
        }

        // Bulk insert with conflict ignore
        if (assignments.length > 0) {
          await db.insert(assetBoards).values(assignments).onConflictDoNothing();
        }

        return NextResponse.json({
          success: true,
          message: `Added ${assetIds.length} assets to ${boardIds.length} board(s)`,
        });
      }

      case 'addTags': {
        // Can accept tagIds or tagNames
        let resolvedTagIds: string[] = tagIds || [];

        // If tagNames provided, find or create tags
        if (tagNames && tagNames.length > 0) {
          for (const tagName of tagNames) {
            const slug = tagName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '');

            // Find existing tag by slug OR by name
            let [existingTag] = await db
              .select()
              .from(tags)
              .where(eq(tags.slug, slug))
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
                  .values({ name: tagName, slug })
                  .returning();
              } catch (insertError) {
                // If insert fails, try to fetch again
                console.error('Tag insert failed, trying to fetch:', insertError);
                [existingTag] = await db
                  .select()
                  .from(tags)
                  .where(eq(tags.slug, slug))
                  .limit(1);
              }
            }

            if (existingTag && !resolvedTagIds.includes(existingTag.id)) {
              resolvedTagIds.push(existingTag.id);
            }
          }
        }

        if (resolvedTagIds.length === 0) {
          return NextResponse.json(
            { error: 'No tags specified' },
            { status: 400 }
          );
        }

        // Build assignments
        const assignments: { assetId: string; tagId: string }[] = [];
        for (const assetId of assetIds) {
          for (const tagId of resolvedTagIds) {
            assignments.push({ assetId, tagId });
          }
        }

        // Bulk insert with conflict ignore
        if (assignments.length > 0) {
          await db.insert(assetTags).values(assignments).onConflictDoNothing();
        }

        return NextResponse.json({
          success: true,
          message: `Added ${resolvedTagIds.length} tag(s) to ${assetIds.length} assets`,
        });
      }

      case 'removeFromBoards': {
        if (!boardIds || boardIds.length === 0) {
          return NextResponse.json(
            { error: 'No boards specified' },
            { status: 400 }
          );
        }

        // Delete board assignments
        for (const assetId of assetIds) {
          await db
            .delete(assetBoards)
            .where(
              and(
                eq(assetBoards.assetId, assetId),
                inArray(assetBoards.boardId, boardIds)
              )
            );
        }

        return NextResponse.json({
          success: true,
          message: `Removed ${assetIds.length} assets from ${boardIds.length} board(s)`,
        });
      }

      case 'removeTags': {
        if (!tagIds || tagIds.length === 0) {
          return NextResponse.json(
            { error: 'No tags specified' },
            { status: 400 }
          );
        }

        // Delete tag assignments
        for (const assetId of assetIds) {
          await db
            .delete(assetTags)
            .where(
              and(
                eq(assetTags.assetId, assetId),
                inArray(assetTags.tagId, tagIds)
              )
            );
        }

        return NextResponse.json({
          success: true,
          message: `Removed ${tagIds.length} tag(s) from ${assetIds.length} assets`,
        });
      }

      case 'delete': {
        // Delete assets (cascade will handle assetBoards and assetTags)
        await db
          .delete(catalogEntries)
          .where(inArray(catalogEntries.id, assetIds));

        return NextResponse.json({
          success: true,
          message: `Deleted ${assetIds.length} asset(s)`,
        });
      }

      case 'updateStatus': {
        const { status } = body;
        if (!status) {
          return NextResponse.json(
            { error: 'No status specified' },
            { status: 400 }
          );
        }

        await db
          .update(catalogEntries)
          .set({ status, updatedAt: new Date() })
          .where(inArray(catalogEntries.id, assetIds));

        return NextResponse.json({
          success: true,
          message: `Updated status of ${assetIds.length} asset(s) to ${status}`,
        });
      }

      case 'updateType': {
        const { type } = body;
        if (!type) {
          return NextResponse.json(
            { error: 'No type specified' },
            { status: 400 }
          );
        }

        await db
          .update(catalogEntries)
          .set({ types: [type], updatedAt: new Date() })
          .where(inArray(catalogEntries.id, assetIds));

        return NextResponse.json({
          success: true,
          message: `Updated type of ${assetIds.length} asset(s) to ${type}`,
        });
      }

      case 'updateFormat': {
        const { format } = body;
        if (!format) {
          return NextResponse.json(
            { error: 'No format specified' },
            { status: 400 }
          );
        }

        await db
          .update(catalogEntries)
          .set({ format, updatedAt: new Date() })
          .where(inArray(catalogEntries.id, assetIds));

        return NextResponse.json({
          success: true,
          message: `Updated format of ${assetIds.length} asset(s) to ${format}`,
        });
      }

      case 'updateHub': {
        const { hub } = body;
        if (!hub) {
          return NextResponse.json(
            { error: 'No hub specified' },
            { status: 400 }
          );
        }

        await db
          .update(catalogEntries)
          .set({ hub, updatedAt: new Date() })
          .where(inArray(catalogEntries.id, assetIds));

        return NextResponse.json({
          success: true,
          message: `Updated hub of ${assetIds.length} asset(s) to ${hub}`,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json(
      { error: 'Bulk action failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
