'use client';

import { BoardPageContent } from './BoardPageContent';
import { useFilterContext } from './LibraryLayout';

interface Asset {
  id: string;
  slug: string;
  title: string;
  description?: string;
  shortDescription?: string;
  hub: string;
  format: string;
  type?: string;
  tags: string[];
  views?: number;
  shares?: number;
  durationMinutes?: number;
  publishDate?: string;
  primaryLink?: string;
}

interface TagData {
  id: string;
  name: string;
  slug: string;
  displayName?: string | null;
}

interface BoardConfig {
  name: string;
  icon: string;
  color: string;
}

interface BoardPageWrapperProps {
  boardId: string;
  board: BoardConfig;
  assets: Asset[];
  boardTags?: TagData[];
}

export function BoardPageWrapper({ boardId, board, assets, boardTags }: BoardPageWrapperProps) {
  const { selectedTags } = useFilterContext();

  return (
    <BoardPageContent
      boardId={boardId}
      board={board}
      assets={assets}
      selectedTags={selectedTags}
      boardTags={boardTags}
    />
  );
}
