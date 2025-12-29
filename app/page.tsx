import { HubLayout } from '@/components/library';
import { HubHomepageContent } from '@/components/library/HubHomepageContent';
import { db, catalogEntries, boards, assetBoards } from '@/lib/db';
import { eq, desc, count } from 'drizzle-orm';

// Force dynamic rendering to avoid database calls at build time
export const dynamic = 'force-dynamic';

// Fetch recent published assets
async function getRecentAssets() {
  const assets = await db
    .select({
      id: catalogEntries.id,
      slug: catalogEntries.slug,
      title: catalogEntries.title,
      description: catalogEntries.description,
      shortDescription: catalogEntries.shortDescription,
      hub: catalogEntries.hub,
      format: catalogEntries.format,
      types: catalogEntries.types,
      tags: catalogEntries.tags,
      views: catalogEntries.views,
      shares: catalogEntries.shares,
      durationMinutes: catalogEntries.durationMinutes,
      createdAt: catalogEntries.createdAt,
      primaryLink: catalogEntries.primaryLink,
    })
    .from(catalogEntries)
    .where(eq(catalogEntries.status, 'published'))
    .orderBy(desc(catalogEntries.updatedAt))
    .limit(20);

  return assets;
}

// Fetch all boards (now called hubs) with asset counts
async function getHubs() {
  const allHubs = await db
    .select()
    .from(boards)
    .orderBy(boards.sortOrder);

  // Get asset counts for each hub
  const hubsWithCounts = await Promise.all(
    allHubs.map(async (hub) => {
      const [result] = await db
        .select({ count: count() })
        .from(assetBoards)
        .where(eq(assetBoards.boardId, hub.id));

      return {
        id: hub.id,
        slug: hub.slug,
        name: hub.name,
        icon: hub.icon || '📁',
        color: hub.color,
        lightColor: hub.lightColor || '#F3F4F6',
        accentColor: hub.accentColor || '#4B5563',
        count: result?.count || 0,
      };
    })
  );

  return hubsWithCounts;
}

// Get total published items count
async function getTotalCount() {
  const [result] = await db
    .select({ count: count() })
    .from(catalogEntries)
    .where(eq(catalogEntries.status, 'published'));

  return result?.count || 0;
}

// Get count of items added in the last 7 days
async function getNewThisWeek() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Filter in memory since we need to check createdAt
  const recentAssets = await db
    .select({ createdAt: catalogEntries.createdAt })
    .from(catalogEntries)
    .where(eq(catalogEntries.status, 'published'));

  const newCount = recentAssets.filter(a =>
    a.createdAt && new Date(a.createdAt) >= sevenDaysAgo
  ).length;

  return newCount;
}

export default async function HomePage() {
  const [recentAssets, hubsData, totalCount, newThisWeek] = await Promise.all([
    getRecentAssets(),
    getHubs(),
    getTotalCount(),
    getNewThisWeek(),
  ]);

  return (
    <HubLayout
      showSidebar={true}
      showFilters={false}
      breadcrumbs={[{ label: 'Home' }]}
    >
      <HubHomepageContent
        recentAssets={recentAssets.map(a => ({
          id: a.id,
          slug: a.slug,
          title: a.title,
          description: a.description || undefined,
          shortDescription: a.shortDescription || undefined,
          hub: a.hub,
          format: a.format,
          type: a.types?.[0] || undefined,
          tags: a.tags || [],
          views: a.views || undefined,
          shares: a.shares || undefined,
          durationMinutes: a.durationMinutes || undefined,
          publishDate: a.createdAt?.toISOString() || undefined,
          primaryLink: a.primaryLink || undefined,
        }))}
        hubs={hubsData}
        totalItems={totalCount}
        newThisWeek={newThisWeek}
      />
    </HubLayout>
  );
}
