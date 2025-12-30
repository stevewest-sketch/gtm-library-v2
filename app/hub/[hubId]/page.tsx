import { notFound } from "next/navigation";
import { HubLayout, HubPageWrapper } from "@/components/library";
import { db, catalogEntries, assetBoards, boards, boardTags, tags } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";

// Force dynamic rendering to avoid database calls at build time
export const dynamic = 'force-dynamic';

interface HubPageProps {
  params: Promise<{ hubId: string }>;
}

interface HubData {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  color: string;
  lightColor: string | null;
  accentColor: string | null;
}

interface TagData {
  id: string;
  name: string;
  slug: string;
  displayName?: string | null;
}

async function getHubWithTagsAndAssets(hubSlug: string) {
  // Get the hub from the database
  const [hubRecord] = await db
    .select()
    .from(boards)
    .where(eq(boards.slug, hubSlug))
    .limit(1);

  if (!hubRecord) {
    return null;
  }

  // Get tags for this hub (including displayName override from boardTags)
  const hubTagsData = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      displayName: boardTags.displayName,
    })
    .from(boardTags)
    .innerJoin(tags, eq(boardTags.tagId, tags.id))
    .where(eq(boardTags.boardId, hubRecord.id))
    .orderBy(boardTags.sortOrder);

  // Get assets associated with this hub, ordered by publishedAt (newest first)
  const assets = await db
    .selectDistinct({
      id: catalogEntries.id,
      slug: catalogEntries.slug,
      title: catalogEntries.title,
      description: catalogEntries.description,
      shortDescription: catalogEntries.shortDescription,
      hub: catalogEntries.hub,
      format: catalogEntries.format,
      types: catalogEntries.types,
      tags: catalogEntries.tags,
      primaryLink: catalogEntries.primaryLink,
      videoUrl: catalogEntries.videoUrl,
      durationMinutes: catalogEntries.durationMinutes,
      views: catalogEntries.views,
      shares: catalogEntries.shares,
      status: catalogEntries.status,
      createdAt: catalogEntries.createdAt,
      publishedAt: catalogEntries.publishedAt,
    })
    .from(catalogEntries)
    .innerJoin(assetBoards, eq(catalogEntries.id, assetBoards.assetId))
    .where(
      and(
        eq(catalogEntries.status, 'published'),
        eq(assetBoards.boardId, hubRecord.id)
      )
    )
    .orderBy(desc(catalogEntries.publishedAt), desc(catalogEntries.createdAt));

  return {
    hub: hubRecord as HubData,
    tags: hubTagsData as TagData[],
    assets,
  };
}

export default async function HubPage({ params }: HubPageProps) {
  const { hubId } = await params;

  // Fetch hub, tags, and assets from database
  const data = await getHubWithTagsAndAssets(hubId);

  // Hub must exist in database (no static fallback)
  if (!data) {
    notFound();
  }

  const { hub, tags: hubTagsData, assets: dbAssets } = data;

  // Use database values for hub config
  const hubIcon = hub.icon || '📁';
  const hubName = hub.name;
  const hubColor = hub.color;

  // Hub config to pass to content component
  const hubConfig = {
    name: hubName,
    icon: hubIcon,
    color: hubColor,
  };

  // Transform database assets to match HubPageWrapper interface
  const assets = dbAssets.map(asset => ({
    id: asset.id,
    slug: asset.slug,
    title: asset.title,
    description: asset.description || undefined,
    shortDescription: asset.shortDescription || undefined,
    hub: asset.hub,
    format: asset.format,
    type: asset.types?.[0] || undefined,
    tags: asset.tags || [],
    views: asset.views || undefined,
    shares: asset.shares || undefined,
    durationMinutes: asset.durationMinutes || undefined,
    publishDate: asset.publishedAt?.toISOString() || asset.createdAt?.toISOString() || undefined,
    primaryLink: asset.primaryLink || undefined,
  }));

  return (
    <HubLayout
      activeHub={hubId}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: `${hubIcon} ${hubName}` },
      ]}
      showFilters={false}
    >
      <HubPageWrapper
        hubId={hubId}
        hub={hubConfig}
        assets={assets}
        hubTags={hubTagsData}
      />
    </HubLayout>
  );
}
