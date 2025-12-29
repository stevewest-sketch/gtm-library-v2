import { NextResponse } from 'next/server';
import { db, catalogEntries } from '@/lib/db';
import { tags, assetTags } from '@/lib/db/schema';
import { inArray, sql, eq } from 'drizzle-orm';

// POST: Add or remove tags from multiple assets
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { assetIds, tags: tagNames, action } = body;

    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json(
        { error: 'assetIds array required' },
        { status: 400 }
      );
    }

    if (!tagNames || !Array.isArray(tagNames) || tagNames.length === 0) {
      return NextResponse.json(
        { error: 'tags array required' },
        { status: 400 }
      );
    }

    if (!action || !['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "add" or "remove"' },
        { status: 400 }
      );
    }

    // Get all assets
    const assets = await db
      .select({
        id: catalogEntries.id,
        tags: catalogEntries.tags,
      })
      .from(catalogEntries)
      .where(inArray(catalogEntries.id, assetIds));

    if (assets.length === 0) {
      return NextResponse.json(
        { error: 'No assets found' },
        { status: 404 }
      );
    }

    // First, ensure all tags exist in the tags table (for 'add' action)
    // This creates tags in the taxonomy immediately
    const tagRecordMap = new Map<string, { id: string; name: string; slug: string }>();

    if (action === 'add') {
      for (const tagName of tagNames) {
        const tagSlug = tagName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/^-+|-+$/g, '');

        // Find existing tag by slug OR by name
        let [existingTag] = await db
          .select()
          .from(tags)
          .where(eq(tags.slug, tagSlug))
          .limit(1);

        if (!existingTag) {
          [existingTag] = await db
            .select()
            .from(tags)
            .where(eq(tags.name, tagName))
            .limit(1);
        }

        // Create tag if it doesn't exist
        if (!existingTag) {
          try {
            [existingTag] = await db
              .insert(tags)
              .values({ name: tagName, slug: tagSlug })
              .returning();
          } catch (insertError) {
            // Race condition - try to fetch again
            console.error('Tag insert failed, trying to fetch:', insertError);
            [existingTag] = await db
              .select()
              .from(tags)
              .where(eq(tags.slug, tagSlug))
              .limit(1);
          }
        }

        if (existingTag) {
          tagRecordMap.set(tagName.toLowerCase(), existingTag);
        }
      }
    }

    // Update each asset's tags
    let updatedCount = 0;
    for (const asset of assets) {
      const currentTags = asset.tags || [];
      let newTags: string[];

      if (action === 'add') {
        // Add tags that don't already exist (case-insensitive comparison)
        const currentTagsLower = currentTags.map(t => t.toLowerCase());
        const tagsToAdd = tagNames.filter(t => !currentTagsLower.includes(t.toLowerCase()));
        newTags = [...currentTags, ...tagsToAdd];

        // Also create entries in assetTags junction table
        for (const tagName of tagsToAdd) {
          const tagRecord = tagRecordMap.get(tagName.toLowerCase());
          if (tagRecord) {
            await db
              .insert(assetTags)
              .values({
                assetId: asset.id,
                tagId: tagRecord.id,
              })
              .onConflictDoNothing();
          }
        }
      } else {
        // Remove tags (case-insensitive comparison)
        const tagsToRemoveLower = tagNames.map(t => t.toLowerCase());
        newTags = currentTags.filter(t => !tagsToRemoveLower.includes(t.toLowerCase()));

        // Also remove from assetTags junction table
        for (const tagName of tagNames) {
          const tagSlug = tagName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/^-+|-+$/g, '');

          // Find the tag
          const [tagRecord] = await db
            .select()
            .from(tags)
            .where(eq(tags.slug, tagSlug))
            .limit(1);

          if (tagRecord) {
            await db
              .delete(assetTags)
              .where(
                sql`${assetTags.assetId} = ${asset.id} AND ${assetTags.tagId} = ${tagRecord.id}`
              );
          }
        }
      }

      // Only update if tags changed
      if (newTags.length !== currentTags.length || !newTags.every((t, i) => currentTags[i] === t)) {
        await db
          .update(catalogEntries)
          .set({
            tags: newTags,
            updatedAt: new Date(),
          })
          .where(sql`${catalogEntries.id} = ${asset.id}`);
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      totalAssets: assets.length,
      action,
      tags: tagNames,
    });
  } catch (error) {
    console.error('Error bulk updating tags:', error);
    return NextResponse.json(
      { error: 'Failed to bulk update tags' },
      { status: 500 }
    );
  }
}
