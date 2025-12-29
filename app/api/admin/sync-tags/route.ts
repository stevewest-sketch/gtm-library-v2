import { NextResponse } from 'next/server';
import { db, catalogEntries, tags, assetTags } from '@/lib/db';
import { eq } from 'drizzle-orm';

// POST: Sync tags from catalogEntries.tags array to tags table + assetTags junction
// This migrates legacy tags that were only stored in the array field
export async function POST() {
  try {
    // Get all assets with their tags array
    const assets = await db
      .select({
        id: catalogEntries.id,
        tags: catalogEntries.tags,
      })
      .from(catalogEntries);

    let tagsCreated = 0;
    let associationsCreated = 0;
    const uniqueTagNames = new Set<string>();

    // Collect all unique tag names
    for (const asset of assets) {
      if (asset.tags && asset.tags.length > 0) {
        for (const tagName of asset.tags) {
          uniqueTagNames.add(tagName);
        }
      }
    }

    // Create or find tags in the tags table
    const tagMap = new Map<string, string>(); // name -> id

    for (const tagName of uniqueTagNames) {
      const tagSlug = tagName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/^-+|-+$/g, '');

      // Try to find existing tag by slug
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
            .values({
              name: tagName,
              slug: tagSlug,
            })
            .returning();
          tagsCreated++;
        } catch (insertError) {
          // If insert fails (unique constraint), try to fetch again
          console.error('Tag insert failed, trying to fetch:', tagName, insertError);
          [existingTag] = await db
            .select()
            .from(tags)
            .where(eq(tags.slug, tagSlug))
            .limit(1);
        }
      }

      if (existingTag) {
        tagMap.set(tagName, existingTag.id);
      }
    }

    // Create asset-tag associations
    for (const asset of assets) {
      if (asset.tags && asset.tags.length > 0) {
        for (const tagName of asset.tags) {
          const tagId = tagMap.get(tagName);
          if (tagId) {
            // Check if association already exists
            const [existing] = await db
              .select()
              .from(assetTags)
              .where(eq(assetTags.assetId, asset.id))
              .limit(1);

            // Insert with conflict handling
            try {
              await db
                .insert(assetTags)
                .values({
                  assetId: asset.id,
                  tagId: tagId,
                })
                .onConflictDoNothing();
              associationsCreated++;
            } catch (e) {
              // Ignore duplicate key errors
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced tags from catalog entries`,
      stats: {
        uniqueTagsFound: uniqueTagNames.size,
        tagsCreated,
        associationsCreated,
        assetsProcessed: assets.length,
      },
    });
  } catch (error) {
    console.error('Error syncing tags:', error);
    return NextResponse.json(
      { error: 'Failed to sync tags', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET: Check sync status - show how many tags are only in array vs also in table
export async function GET() {
  try {
    // Get all unique tags from catalogEntries.tags array
    const assets = await db
      .select({
        tags: catalogEntries.tags,
      })
      .from(catalogEntries);

    const arrayTags = new Set<string>();
    for (const asset of assets) {
      if (asset.tags) {
        for (const tag of asset.tags) {
          arrayTags.add(tag);
        }
      }
    }

    // Get all tags from tags table
    const tableTags = await db.select().from(tags);
    const tableTagNames = new Set(tableTags.map(t => t.name));
    const tableTagSlugs = new Set(tableTags.map(t => t.slug));

    // Find tags that exist in array but not in table
    const missingTags: string[] = [];
    for (const tagName of arrayTags) {
      const slug = tagName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/^-+|-+$/g, '');

      if (!tableTagNames.has(tagName) && !tableTagSlugs.has(slug)) {
        missingTags.push(tagName);
      }
    }

    return NextResponse.json({
      arrayTagCount: arrayTags.size,
      tableTagCount: tableTags.length,
      missingTagCount: missingTags.length,
      missingTags: missingTags.slice(0, 50), // Show first 50
    });
  } catch (error) {
    console.error('Error checking tag sync status:', error);
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    );
  }
}
