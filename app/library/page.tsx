import { LibraryLayout } from '@/components/library';
import { LibraryBrowseContent } from '@/components/library/LibraryBrowseContent';
import { BOARDS } from '@/lib/constants/hubs';
import { db, catalogEntries } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

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
      hub: catalogEntries.hub,
      format: catalogEntries.format,
      types: catalogEntries.types,
      tags: catalogEntries.tags,
      views: catalogEntries.views,
      shares: catalogEntries.shares,
      durationMinutes: catalogEntries.durationMinutes,
    })
    .from(catalogEntries)
    .where(eq(catalogEntries.status, 'published'))
    .orderBy(desc(catalogEntries.updatedAt))
    .limit(50);

  return assets;
}

export default async function LibraryPage() {
  const assets = await getAssets();
  const boardEntries = Object.entries(BOARDS);
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
          hub: a.hub,
          format: a.format,
          tags: a.tags || [],
          views: a.views || undefined,
          shares: a.shares || undefined,
          durationMinutes: a.durationMinutes || undefined,
        }))}
        boards={boardEntries.map(([id, board]) => ({
          id,
          slug: id,
          name: board.name,
          icon: board.icon,
          color: board.color,
          lightColor: board.lightColor,
          accentColor: board.accentColor,
          count: board.count,
        }))}
        totalItems={totalItems}
      />
    </LibraryLayout>
  );
}
