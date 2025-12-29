import { notFound } from "next/navigation";
import { LibraryLayout, BoardPageWrapper } from "@/components/library";
import { db, catalogEntries, assetBoards, boards, boardTags, tags } from "@/lib/db";
import { eq, and } from "drizzle-orm";

// Force dynamic rendering to avoid database calls at build time
export const dynamic = 'force-dynamic';

interface BoardPageProps {
  params: Promise<{ boardId: string }>;
}

interface BoardData {
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
  displayName?: string | null; // Board-specific display name override
}

async function getBoardWithTagsAndAssets(boardSlug: string) {
  // Get the board from the database
  const [boardRecord] = await db
    .select()
    .from(boards)
    .where(eq(boards.slug, boardSlug))
    .limit(1);

  if (!boardRecord) {
    return null;
  }

  // Get tags for this board (including displayName override from boardTags)
  const boardTagsData = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      displayName: boardTags.displayName,
    })
    .from(boardTags)
    .innerJoin(tags, eq(boardTags.tagId, tags.id))
    .where(eq(boardTags.boardId, boardRecord.id))
    .orderBy(boardTags.sortOrder);

  // Get assets associated with this board
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
    })
    .from(catalogEntries)
    .innerJoin(assetBoards, eq(catalogEntries.id, assetBoards.assetId))
    .where(
      and(
        eq(catalogEntries.status, 'published'),
        eq(assetBoards.boardId, boardRecord.id)
      )
    );

  return {
    board: boardRecord as BoardData,
    tags: boardTagsData as TagData[],
    assets,
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;

  // Fetch board, tags, and assets from database
  const data = await getBoardWithTagsAndAssets(boardId);

  // Board must exist in database (no static fallback)
  if (!data) {
    notFound();
  }

  const { board, tags: boardTagsData, assets: dbAssets } = data;

  // Use database values for board config
  const boardIcon = board.icon || '📁';
  const boardName = board.name;
  const boardColor = board.color;

  // Board config to pass to content component
  const boardConfig = {
    name: boardName,
    icon: boardIcon,
    color: boardColor,
  };

  // Transform database assets to match BoardPageWrapper interface
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
    publishDate: asset.createdAt?.toISOString() || undefined,
    primaryLink: asset.primaryLink || undefined,
  }));

  return (
    <LibraryLayout
      activeBoard={boardId}
      breadcrumbs={[
        { label: 'Library', href: '/library' },
        { label: `${boardIcon} ${boardName}` },
      ]}
      showFilters={false}
    >
      <BoardPageWrapper
        boardId={boardId}
        board={boardConfig}
        assets={assets}
        boardTags={boardTagsData}
      />
    </LibraryLayout>
  );
}

