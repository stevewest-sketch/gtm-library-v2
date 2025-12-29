import { notFound } from "next/navigation";
import { HubLayout } from "@/components/library";
import { db } from "@/lib/db";
import { catalogEntries, assetBoards, boards, assetTags, tags } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AssetDetailClient } from "./AssetDetailClient";

// Force dynamic rendering to avoid database calls at build time
export const dynamic = 'force-dynamic';

interface AssetPageProps {
  params: Promise<{ assetId: string }>;
}

// Hub color configurations
const HUB_STYLES: Record<string, { primary: string; light: string; accent: string; hover: string }> = {
  coe: { primary: '#F59E0B', light: '#FEF3C7', accent: '#B45309', hover: '#FFFBEB' },
  content: { primary: '#8C69F0', light: '#EDE9FE', accent: '#6D28D9', hover: '#F5F3FF' },
  enablement: { primary: '#10B981', light: '#D1FAE5', accent: '#047857', hover: '#ECFDF5' },
  product: { primary: '#3B82F6', light: '#DBEAFE', accent: '#1D4ED8', hover: '#EFF6FF' },
  competitive: { primary: '#EF4444', light: '#FEE2E2', accent: '#B91C1C', hover: '#FEF2F2' },
  sales: { primary: '#0EA5E9', light: '#E0F2FE', accent: '#0369A1', hover: '#F0F9FF' },
  csm: { primary: '#06B6D4', light: '#CFFAFE', accent: '#0E7490', hover: '#ECFEFF' },
  sc: { primary: '#8B5CF6', light: '#EDE9FE', accent: '#7C3AED', hover: '#F5F3FF' },
  demo: { primary: '#F97316', light: '#FFEDD5', accent: '#C2410C', hover: '#FFF7ED' },
  proof: { primary: '#84CC16', light: '#ECFCCB', accent: '#4D7C0F', hover: '#F7FEE7' },
};

export default async function AssetPage({ params }: AssetPageProps) {
  const { assetId } = await params;

  // Fetch asset from database
  const [asset] = await db
    .select()
    .from(catalogEntries)
    .where(eq(catalogEntries.slug, assetId))
    .limit(1);

  if (!asset) {
    notFound();
  }

  // Get associated boards (now called hubs in UI)
  const assetBoardsData = await db
    .select({
      id: boards.id,
      slug: boards.slug,
      name: boards.name,
      color: boards.color,
    })
    .from(assetBoards)
    .innerJoin(boards, eq(assetBoards.boardId, boards.id))
    .where(eq(assetBoards.assetId, asset.id));

  // Get associated tags
  const assetTagsData = await db
    .select({
      id: tags.id,
      slug: tags.slug,
      name: tags.name,
    })
    .from(assetTags)
    .innerJoin(tags, eq(assetTags.tagId, tags.id))
    .where(eq(assetTags.assetId, asset.id));

  const hubStyle = HUB_STYLES[asset.hub?.toLowerCase()] || HUB_STYLES.content;
  const hubLabel = asset.hub?.toUpperCase() || 'CONTENT';
  const hubName = asset.hub?.charAt(0).toUpperCase() + asset.hub?.slice(1) || 'Content';

  // Format date
  const formattedDate = asset.eventDate
    ? new Date(asset.eventDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  // Format duration
  const formattedDuration = asset.durationMinutes
    ? `${asset.durationMinutes} min`
    : null;

  // Get presenters string
  const presentersString = asset.presenters && asset.presenters.length > 0
    ? asset.presenters.join(', ')
    : null;

  // Check if this is an enablement/training asset
  const isTrainingAsset = asset.hub === 'enablement' || asset.format === 'training' || asset.format === 'video';

  // Shareable link
  const shareableLink = `https://gtm.gladly.com/asset/${asset.slug}`;

  return (
    <HubLayout
      showSidebar={true}
      showFilters={false}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: hubName, href: `/hub/${asset.hub}` },
        { label: asset.title },
      ]}
    >
      <AssetDetailClient
        asset={{
          ...asset,
          eventDate: asset.eventDate?.toISOString() || null,
          createdAt: asset.createdAt?.toISOString() || null,
          updatedAt: asset.updatedAt?.toISOString() || null,
        }}
        hubStyle={hubStyle}
        hubLabel={hubLabel}
        hubName={hubName}
        formattedDate={formattedDate}
        formattedDuration={formattedDuration}
        presentersString={presentersString}
        isTrainingAsset={isTrainingAsset}
        shareableLink={shareableLink}
        assetBoardsData={assetBoardsData}
        assetTagsData={assetTagsData}
      />
    </HubLayout>
  );
}
