import { db, catalogEntries, tags } from '@/lib/db';
import { eq, sql, desc, inArray } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { LibraryLayout } from '@/components/library';
import { TagResultsContent } from '@/components/library/TagResultsContent';

export const dynamic = 'force-dynamic';

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;

  // Get tag info
  const tagResult = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      category: tags.category,
    })
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1);

  const tag = tagResult[0];

  if (!tag) {
    notFound();
  }

  // Get assets with this tag
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
      publishedAt: catalogEntries.publishedAt,
      createdAt: catalogEntries.createdAt,
    })
    .from(catalogEntries)
    .where(sql`${slug} = ANY(${catalogEntries.tags})`)
    .orderBy(desc(catalogEntries.createdAt))
    .limit(50);

  // Get related tags (tags that appear on the same assets)
  const relatedTagSlugs = new Set<string>();
  assets.forEach(asset => {
    asset.tags?.forEach(t => {
      if (t !== slug) {
        relatedTagSlugs.add(t);
      }
    });
  });

  // Fetch related tag details
  const relatedTagSlugsArray = Array.from(relatedTagSlugs);
  const relatedTags = relatedTagSlugsArray.length > 0
    ? await db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(tags)
        .where(inArray(tags.slug, relatedTagSlugsArray))
        .limit(6)
    : [];

  // Count boards this tag appears in
  const boardCount = new Set(assets.flatMap(a => a.hub)).size;

  // Format assets for the component
  const formattedAssets = assets.map(a => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    shortDescription: a.shortDescription || undefined,
    hub: a.hub,
    format: a.format,
    type: a.types?.[0] || undefined,
    tags: a.tags || [],
    publishDate: a.publishedAt?.toISOString() || a.createdAt?.toISOString(),
  }));

  return (
    <LibraryLayout showFilters={false}>
      <TagResultsContent
        tag={{
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
        }}
        assets={formattedAssets}
        relatedTags={relatedTags}
        boardCount={boardCount}
      />
    </LibraryLayout>
  );
}
