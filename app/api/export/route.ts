import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { catalogEntries, assetBoards, boards, assetTags, tags } from '@/lib/db/schema';
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

    // CSV headers matching import format + extra useful fields
    const headers = [
      'title',
      'slug',
      'description',
      'shortDescription',
      'externalUrl',
      'videoUrl',
      'slidesUrl',
      'keyAssetUrl',
      'transcriptUrl',
      'hub',
      'format',
      'type',
      'tags',
      'boards',
      'status',
      'durationMinutes',
      'views',
      'shares',
      'createdAt',
    ];

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

      return [
        escapeCSV(asset.title),
        escapeCSV(asset.slug),
        escapeCSV(asset.description),
        escapeCSV(asset.shortDescription),
        escapeCSV(asset.primaryLink),
        escapeCSV(asset.videoUrl),
        escapeCSV(asset.slidesUrl),
        escapeCSV(asset.keyAssetUrl),
        escapeCSV(asset.transcriptUrl),
        escapeCSV(asset.hub),
        escapeCSV(asset.format),
        escapeCSV(asset.types?.join('|')),
        escapeCSV(allTags.join('|')),
        escapeCSV(asset.boardSlugs.join('|')),
        escapeCSV(asset.status),
        escapeCSV(asset.durationMinutes),
        escapeCSV(asset.views),
        escapeCSV(asset.shares),
        escapeCSV(asset.createdAt?.toISOString()),
      ].join(',');
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
