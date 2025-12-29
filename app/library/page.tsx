import { LibraryLayout } from '@/components/library';
import { LibraryHomepageContent } from '@/components/library/LibraryHomepageContent';
import { db, catalogEntries, boards, assetBoards, homepageConfig } from '@/lib/db';
import { eq, desc, count } from 'drizzle-orm';

// Force dynamic rendering to avoid database calls at build time
export const dynamic = 'force-dynamic';

// Fetch recent published assets
async function getRecentAssets(limit: number = 20) {
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
    .orderBy(desc(catalogEntries.createdAt))
    .limit(limit);

  return assets;
}

// Fetch all boards with asset counts
async function getBoards() {
  const allBoards = await db
    .select()
    .from(boards)
    .orderBy(boards.sortOrder);

  // Get asset counts for each board
  const boardsWithCounts = await Promise.all(
    allBoards.map(async (board) => {
      const [result] = await db
        .select({ count: count() })
        .from(assetBoards)
        .where(eq(assetBoards.boardId, board.id));

      return {
        id: board.id,
        slug: board.slug,
        name: board.name,
        icon: board.icon || '📁',
        color: board.color,
        lightColor: board.lightColor || '#F3F4F6',
        accentColor: board.accentColor || '#4B5563',
        count: result?.count || 0,
      };
    })
  );

  return boardsWithCounts;
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

  // For now, filter in memory since we need to check createdAt
  const recentAssets = await db
    .select({ createdAt: catalogEntries.createdAt })
    .from(catalogEntries)
    .where(eq(catalogEntries.status, 'published'));

  const newCount = recentAssets.filter(a =>
    a.createdAt && new Date(a.createdAt) >= sevenDaysAgo
  ).length;

  return newCount;
}

// Get homepage configuration
async function getHomepageConfig() {
  let [config] = await db.select().from(homepageConfig).limit(1);

  // If no config exists, create default
  if (!config) {
    [config] = await db
      .insert(homepageConfig)
      .values({})
      .returning();
  }

  return config;
}

// Get featured board data if configured
async function getFeaturedBoard(config: Awaited<ReturnType<typeof getHomepageConfig>>) {
  if (!config.featuredBoardEnabled || !config.featuredBoardId) {
    return null;
  }

  const [board] = await db
    .select()
    .from(boards)
    .where(eq(boards.id, config.featuredBoardId))
    .limit(1);

  if (!board) return null;

  // Get asset count for this board
  const [countResult] = await db
    .select({ count: count() })
    .from(assetBoards)
    .where(eq(assetBoards.boardId, board.id));

  // Get board's assets
  const boardAssets = await db
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
      createdAt: catalogEntries.createdAt,
      updatedAt: catalogEntries.updatedAt,
      primaryLink: catalogEntries.primaryLink,
    })
    .from(catalogEntries)
    .innerJoin(assetBoards, eq(catalogEntries.id, assetBoards.assetId))
    .where(eq(assetBoards.boardId, board.id))
    .orderBy(desc(catalogEntries.updatedAt))
    .limit(config.featuredBoardMaxItems ?? 3);

  return {
    id: board.id,
    slug: board.slug,
    title: config.featuredBoardTitleOverride || board.name,
    description: config.featuredBoardDescriptionOverride || '',
    icon: config.featuredBoardIcon || '🎯',
    color: board.color,
    resourceCount: countResult?.count || 0,
    lastUpdated: boardAssets[0]?.updatedAt?.toISOString() || null,
    items: boardAssets.map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.description || undefined,
      shortDescription: a.shortDescription || undefined,
      hub: a.hub,
      format: a.format,
      type: a.types?.[0] || undefined,
      tags: a.tags || [],
      publishDate: a.createdAt?.toISOString() || undefined,
      primaryLink: a.primaryLink || undefined,
    })),
  };
}

export default async function LibraryPage() {
  // Fetch homepage config first
  const config = await getHomepageConfig();

  // Fetch data in parallel
  const [recentAssets, boardsData, totalCount, newThisWeek, featuredBoard] = await Promise.all([
    getRecentAssets(config.recentlyAddedMaxItems ?? 6),
    getBoards(),
    getTotalCount(),
    getNewThisWeek(),
    getFeaturedBoard(config),
  ]);

  return (
    <LibraryLayout
      showSidebar={true}
      showFilters={false}
      breadcrumbs={[{ label: 'Home' }]}
    >
      <LibraryHomepageContent
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
        boards={boardsData}
        totalItems={totalCount}
        newThisWeek={newThisWeek}
        featuredBoard={featuredBoard}
        heroTitle={config.heroTitle}
        heroSubtitle={config.heroSubtitle}
        showHubCards={config.showHubCards ?? true}
        newThresholdDays={config.recentlyAddedNewThresholdDays ?? 7}
      />
    </LibraryLayout>
  );
}
