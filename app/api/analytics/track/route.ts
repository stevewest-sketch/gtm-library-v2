import { NextRequest, NextResponse } from 'next/server';
import { db, catalogEntries, viewEvents } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';

// POST - Track a view or share
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, action, source, sessionId } = body;

    if (!assetId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: assetId and action' },
        { status: 400 }
      );
    }

    if (action === 'view') {
      // Increment view count on asset
      await db
        .update(catalogEntries)
        .set({
          views: sql`COALESCE(${catalogEntries.views}, 0) + 1`,
        })
        .where(eq(catalogEntries.id, assetId));

      // Record view event for detailed analytics
      await db.insert(viewEvents).values({
        entryId: assetId,
        source: source || 'direct',
        sessionId: sessionId || null,
        viewedAt: new Date(),
      });

      return NextResponse.json({ success: true, action: 'view' });
    }

    if (action === 'share') {
      // Increment share count on asset
      await db
        .update(catalogEntries)
        .set({
          shares: sql`COALESCE(${catalogEntries.shares}, 0) + 1`,
        })
        .where(eq(catalogEntries.id, assetId));

      return NextResponse.json({ success: true, action: 'share' });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "view" or "share"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}
