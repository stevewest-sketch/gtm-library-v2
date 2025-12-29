import { NextRequest, NextResponse } from 'next/server';
import { db, catalogEntries, viewEvents } from '@/lib/db';
import { eq, sql, desc, gte, and, count } from 'drizzle-orm';

// GET - Fetch analytics data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30', 10);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  try {
    // Get total assets count
    const [totalAssetsResult] = await db
      .select({ count: count() })
      .from(catalogEntries)
      .where(eq(catalogEntries.status, 'published'));

    // Get total views
    const [totalViewsResult] = await db
      .select({ sum: sql<number>`COALESCE(SUM(${catalogEntries.views}), 0)` })
      .from(catalogEntries)
      .where(eq(catalogEntries.status, 'published'));

    // Get total shares
    const [totalSharesResult] = await db
      .select({ sum: sql<number>`COALESCE(SUM(${catalogEntries.shares}), 0)` })
      .from(catalogEntries)
      .where(eq(catalogEntries.status, 'published'));

    // Get recent views count (within time period)
    const [recentViewsResult] = await db
      .select({ count: count() })
      .from(viewEvents)
      .where(gte(viewEvents.viewedAt, cutoffDate));

    // Get top performing assets
    const topAssets = await db
      .select({
        id: catalogEntries.id,
        slug: catalogEntries.slug,
        title: catalogEntries.title,
        hub: catalogEntries.hub,
        views: catalogEntries.views,
        shares: catalogEntries.shares,
      })
      .from(catalogEntries)
      .where(eq(catalogEntries.status, 'published'))
      .orderBy(desc(catalogEntries.views))
      .limit(10);

    // Get recently viewed assets
    const recentlyViewed = await db
      .select({
        entryId: viewEvents.entryId,
        viewedAt: viewEvents.viewedAt,
        source: viewEvents.source,
      })
      .from(viewEvents)
      .orderBy(desc(viewEvents.viewedAt))
      .limit(20);

    // Get view counts by hub
    const viewsByHub = await db
      .select({
        hub: catalogEntries.hub,
        totalViews: sql<number>`COALESCE(SUM(${catalogEntries.views}), 0)`,
        assetCount: count(),
      })
      .from(catalogEntries)
      .where(eq(catalogEntries.status, 'published'))
      .groupBy(catalogEntries.hub);

    return NextResponse.json({
      stats: {
        totalAssets: totalAssetsResult?.count || 0,
        totalViews: totalViewsResult?.sum || 0,
        totalShares: totalSharesResult?.sum || 0,
        recentViews: recentViewsResult?.count || 0,
      },
      topAssets: topAssets.map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        hub: a.hub,
        views: a.views || 0,
        shares: a.shares || 0,
      })),
      recentActivity: recentlyViewed,
      viewsByHub: viewsByHub.map((h) => ({
        hub: h.hub,
        views: h.totalViews,
        assets: h.assetCount,
      })),
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
