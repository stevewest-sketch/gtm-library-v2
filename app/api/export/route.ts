import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { catalogEntries, assetBoards, boards, assetTags, tags, RelatedAsset } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Get all assets
    const assets = await db
      .select()
      .from(catalogEntries)
      .orderBy(catalogEntries.title);

    // For each asset, get boards and tags
    const assetsWithRelations = await Promise.all(
      assets.map(async (asset) => {
        // Get boards
        const assetBoardsData = await db
          .select({ slug: boards.slug })
          .from(assetBoards)
          .innerJoin(boards, eq(assetBoards.boardId, boards.id))
          .where(eq(assetBoards.assetId, asset.id));

        // Get tags from junction table
        const assetTagsData = await db
          .select({ name: tags.name })
          .from(assetTags)
          .innerJoin(tags, eq(assetTags.tagId, tags.id))
          .where(eq(assetTags.assetId, asset.id));

        return {
          ...asset,
          boardSlugs: assetBoardsData.map(b => b.slug),
          tagNames: assetTagsData.map(t => t.name),
        };
      })
    );

    // Find maximum number of related assets across all assets
    let maxRelatedAssets = 0;
    for (const asset of assetsWithRelations) {
      const relatedAssets = asset.relatedAssets as RelatedAsset[] | null;
      if (relatedAssets && relatedAssets.length > maxRelatedAssets) {
        maxRelatedAssets = relatedAssets.length;
      }
    }

    // Build base headers
    const baseHeaders = [
      'title',
      'slug',
      'description',
      'shortDescription',
      'externalUrl',        // Primary link shown on asset page
      'videoUrl',           // Video URL (Loom/YouTube) shown on asset page
      'slidesUrl',
      'transcriptUrl',
      'aiContentUrl',       // AI-only URL for content generation - NOT saved to asset
      'hub',
      'format',
      'type',
      'tags',
      'boards',
      'status',
      'publishedAt',
      'date',               // Event date for enablement assets
      'presenters',         // Pipe-separated presenter names
      'durationMinutes',
      'views',
      'shares',
      'createdAt',
    ];

    // Add dynamic related asset columns (relatedAssetUrl1, relatedAssetName1, etc.)
    const relatedAssetHeaders: string[] = [];
    for (let i = 1; i <= maxRelatedAssets; i++) {
      relatedAssetHeaders.push(`relatedAssetUrl${i}`);
      relatedAssetHeaders.push(`relatedAssetName${i}`);
    }

    const headers = [...baseHeaders, ...relatedAssetHeaders];

    // Helper to escape CSV values
    const escapeCSV = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Always quote fields that might contain special characters
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    // Build CSV rows
    const rows = assetsWithRelations.map(asset => {
      // Combine tags from both array field and junction table
      const allTags = [...new Set([
        ...(asset.tags || []),
        ...asset.tagNames,
      ])];

      // Build base row values
      const baseValues = [
        escapeCSV(asset.title),
        escapeCSV(asset.slug),
        escapeCSV(asset.description),
        escapeCSV(asset.shortDescription),
        escapeCSV(asset.primaryLink),           // externalUrl
        escapeCSV(asset.videoUrl),
        escapeCSV(asset.slidesUrl),
        escapeCSV(asset.transcriptUrl),
        '',                                      // aiContentUrl - always empty (not stored)
        escapeCSV(asset.hub),
        escapeCSV(asset.format),
        escapeCSV(asset.types?.join('|')),
        escapeCSV(allTags.join('|')),
        escapeCSV(asset.boardSlugs.join('|')),
        escapeCSV(asset.status),
        escapeCSV(asset.publishedAt?.toISOString().split('T')[0]),
        escapeCSV(asset.eventDate?.toISOString().split('T')[0]),  // date
        escapeCSV(asset.presenters?.join('|')),                   // presenters
        escapeCSV(asset.durationMinutes),
        escapeCSV(asset.views),
        escapeCSV(asset.shares),
        escapeCSV(asset.createdAt?.toISOString()),
      ];

      // Add related asset values (url1, name1, url2, name2, ...)
      const relatedAssets = asset.relatedAssets as RelatedAsset[] | null;
      const relatedAssetValues: string[] = [];
      for (let i = 0; i < maxRelatedAssets; i++) {
        const related = relatedAssets?.[i];
        relatedAssetValues.push(escapeCSV(related?.url || ''));
        relatedAssetValues.push(escapeCSV(related?.displayName || ''));
      }

      return [...baseValues, ...relatedAssetValues].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    // Return as downloadable CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="gtm-library-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export failed:', error);
    return NextResponse.json(
      { error: 'Failed to export assets' },
      { status: 500 }
    );
  }
}
