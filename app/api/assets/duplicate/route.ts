import { NextRequest, NextResponse } from 'next/server';
import { db, catalogEntries, assetBoards, assetTags } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId } = body;

    if (!assetId) {
      return NextResponse.json({ error: 'assetId is required' }, { status: 400 });
    }

    // Get the original asset
    const [original] = await db
      .select()
      .from(catalogEntries)
      .where(eq(catalogEntries.id, assetId));

    if (!original) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Generate a unique slug
    const baseSlug = original.slug.replace(/-copy(-\d+)?$/, '');
    let newSlug = `${baseSlug}-copy`;
    let counter = 1;

    // Check if slug exists and increment counter if needed
    while (true) {
      const existing = await db
        .select({ slug: catalogEntries.slug })
        .from(catalogEntries)
        .where(eq(catalogEntries.slug, newSlug))
        .limit(1);

      if (existing.length === 0) break;
      counter++;
      newSlug = `${baseSlug}-copy-${counter}`;
    }

    // Create the duplicate
    const [duplicate] = await db
      .insert(catalogEntries)
      .values({
        slug: newSlug,
        title: `${original.title} (Copy)`,
        description: original.description,
        shortDescription: original.shortDescription,
        hub: original.hub,
        format: original.format,
        types: original.types,
        tags: original.tags,
        primaryLink: original.primaryLink,
        shareLink: original.shareLink,
        videoUrl: original.videoUrl,
        slidesUrl: original.slidesUrl,
        transcriptUrl: original.transcriptUrl,
        keyAssetUrl: original.keyAssetUrl,
        presenters: original.presenters,
        durationMinutes: original.durationMinutes,
        eventDate: original.eventDate,
        takeaways: original.takeaways,
        howtos: original.howtos,
        tips: original.tips,
        pageSections: original.pageSections,
        owner: original.owner,
        status: 'draft', // New copies start as draft
        featured: false,
        priority: original.priority,
        aiConfidence: original.aiConfidence,
      })
      .returning();

    // Copy board associations
    const boardAssocs = await db
      .select()
      .from(assetBoards)
      .where(eq(assetBoards.assetId, assetId));

    if (boardAssocs.length > 0) {
      await db.insert(assetBoards).values(
        boardAssocs.map((ba) => ({
          assetId: duplicate.id,
          boardId: ba.boardId,
        }))
      );
    }

    // Copy tag associations
    const tagAssocs = await db
      .select()
      .from(assetTags)
      .where(eq(assetTags.assetId, assetId));

    if (tagAssocs.length > 0) {
      await db.insert(assetTags).values(
        tagAssocs.map((ta) => ({
          assetId: duplicate.id,
          tagId: ta.tagId,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      asset: duplicate,
    });
  } catch (error) {
    console.error('Error duplicating asset:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to duplicate asset' },
      { status: 500 }
    );
  }
}
