import { LibraryLayout } from '@/components/library';
import { LibraryBrowseContent } from '@/components/library/LibraryBrowseContent';
import { db, catalogEntries, boards, assetBoards } from '@/lib/db';
import { eq, desc, sql, count } from 'drizzle-orm';

// Force dynamic rendering to avoid database calls at build time
export const dynamic = 'force-dynamic';

// Fetch all published assets
async function getAssets() {
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
    .limit(50);

  return assets;
}

// Fetch all boards with asset counts
async function getBoards() {
  // Get all boards
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

export default async function LibraryPage() {
  const [assets, boardsData] = await Promise.all([getAssets(), getBoards()]);
  const totalItems = assets.length;

  return (
    <LibraryLayout
      showSidebar={true}
      showFilters={false}
      breadcrumbs={[{ label: 'Library' }]}
    >
      <LibraryBrowseContent
        assets={assets.map(a => ({
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
        totalItems={totalItems}
      />
    </LibraryLayout>
  );
}
