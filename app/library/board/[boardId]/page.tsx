import { notFound } from "next/navigation";
import { LibraryLayout, BoardPageWrapper } from "@/components/library";
import { BOARDS, type BoardId } from "@/lib/constants/hubs";
import { db, catalogEntries, assetBoards, boards, boardTags, tags } from "@/lib/db";
import { eq, and } from "drizzle-orm";

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

  // Get tags for this board
  const boardTagsData = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
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

  // If board doesn't exist in database, check static config as fallback
  if (!data) {
    if (!BOARDS[boardId as BoardId]) {
      notFound();
    }
    // Fall back to static board with no assets
    const staticBoard = BOARDS[boardId as BoardId];
    const staticTags = staticBoard.tags.map((t, i) => ({ id: String(i), name: t, slug: t.toLowerCase().replace(/\s+/g, '-') }));
    return (
      <LibraryLayout
        activeBoard={boardId as BoardId}
        breadcrumbs={[
          { label: 'Library', href: '/library' },
          { label: `${staticBoard.icon} ${staticBoard.name}` },
        ]}
        boardTags={staticTags}
      >
        <BoardPageWrapper
          boardId={boardId as BoardId}
          assets={[]}
          boardTags={staticTags}
        />
      </LibraryLayout>
    );
  }

  const { board, tags: boardTagsData, assets: dbAssets } = data;

  // Use static config for icon/colors if not in database, fallback to database values
  const staticBoard = BOARDS[boardId as BoardId];
  const boardIcon = board.icon || staticBoard?.icon || '📁';
  const boardName = board.name || staticBoard?.name || boardId;

  // Transform database assets to match BoardPageWrapper interface
  const assets = dbAssets.map(asset => ({
    id: asset.id,
    slug: asset.slug,
    title: asset.title,
    description: asset.description || undefined,
    hub: asset.hub,
    format: asset.format,
    tags: asset.tags || [],
    views: asset.views || undefined,
    shares: asset.shares || undefined,
    durationMinutes: asset.durationMinutes || undefined,
  }));

  return (
    <LibraryLayout
      activeBoard={boardId as BoardId}
      breadcrumbs={[
        { label: 'Library', href: '/library' },
        { label: `${boardIcon} ${boardName}` },
      ]}
      boardTags={boardTagsData}
    >
      <BoardPageWrapper
        boardId={boardId as BoardId}
        assets={assets}
        boardTags={boardTagsData}
      />
    </LibraryLayout>
  );
}

// Generate static params for all boards
export function generateStaticParams() {
  return Object.keys(BOARDS).map((boardId) => ({
    boardId,
  }));
}
