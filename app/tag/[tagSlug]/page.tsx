import { notFound } from "next/navigation";
import { HubLayout } from "@/components/library";
import { TagResultsContent } from "@/components/library/TagResultsContent";
import { db, catalogEntries, tags, boards, assetBoards } from "@/lib/db";
import { eq, and, arrayContains, sql } from "drizzle-orm";

// Force dynamic rendering to avoid database calls at build time
export const dynamic = 'force-dynamic';

interface TagPageProps {
  params: Promise<{ tagSlug: string }>;
}

async function getTagWithAssets(tagSlug: string) {
  // Get the tag from the database
  const [tagRecord] = await db
    .select()
    .from(tags)
    .where(eq(tags.slug, tagSlug))
    .limit(1);

  if (!tagRecord) {
    return null;
  }

  // Get all published assets that have this tag
  const assets = await db
    .select({
      id: catalogEntries.id,
      slug: catalogEntries.slug,
      title: catalogEntries.title,
      shortDescription: catalogEntries.shortDescription,
      hub: catalogEntries.hub,
      format: catalogEntries.format,
      types: catalogEntries.types,
      tags: catalogEntries.tags,
      createdAt: catalogEntries.createdAt,
    })
    .from(catalogEntries)
    .where(
      and(
        eq(catalogEntries.status, 'published'),
        arrayContains(catalogEntries.tags, [tagRecord.name])
      )
    );

  // Count unique boards these assets belong to
  const assetIds = assets.map(a => a.id);
  let boardCount = 0;

  if (assetIds.length > 0) {
    const boardsResult = await db
      .selectDistinct({ boardId: assetBoards.boardId })
      .from(assetBoards)
      .where(sql`${assetBoards.assetId} = ANY(${assetIds})`);
    boardCount = boardsResult.length;
  }

  // Get related tags (other tags that appear on the same assets)
  const relatedTagNames = new Set<string>();
  assets.forEach(asset => {
    (asset.tags || []).forEach(t => {
      if (t !== tagRecord.name) {
        relatedTagNames.add(t);
      }
    });
  });

  // Get tag records for related tags (limit to 8)
  const relatedTags = relatedTagNames.size > 0
    ? await db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(tags)
        .where(sql`${tags.name} = ANY(${Array.from(relatedTagNames)})`)
        .limit(8)
    : [];

  return {
    tag: {
      id: tagRecord.id,
      name: tagRecord.name,
      slug: tagRecord.slug,
    },
    assets: assets.map(asset => ({
      id: asset.id,
      slug: asset.slug,
      title: asset.title,
      shortDescription: asset.shortDescription || undefined,
      hub: asset.hub,
      format: asset.format,
      type: asset.types?.[0] || undefined,
      tags: asset.tags || [],
      publishDate: asset.createdAt?.toISOString() || undefined,
    })),
    relatedTags,
    boardCount,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tagSlug } = await params;

  // Fetch tag and assets from database
  const data = await getTagWithAssets(tagSlug);

  // Tag must exist in database
  if (!data) {
    notFound();
  }

  const { tag, assets, relatedTags, boardCount } = data;

  return (
    <HubLayout
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: `#${tag.name}` },
      ]}
      showFilters={false}
    >
      <TagResultsContent
        tag={tag}
        assets={assets}
        relatedTags={relatedTags}
        boardCount={boardCount}
      />
    </HubLayout>
  );
}
