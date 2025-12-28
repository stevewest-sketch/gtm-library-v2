'use client';

import { BoardPageContent } from './BoardPageContent';
import { useFilterContext } from './LibraryLayout';
import type { BoardId } from '@/lib/constants/hubs';

interface Asset {
  id: string;
  slug: string;
  title: string;
  description?: string;
  hub: string;
  format: string;
  tags: string[];
  views?: number;
  shares?: number;
  durationMinutes?: number;
}

interface TagData {
  id: string;
  name: string;
  slug: string;
}

interface BoardPageWrapperProps {
  boardId: BoardId;
  assets: Asset[];
  boardTags?: TagData[];
}

export function BoardPageWrapper({ boardId, assets, boardTags }: BoardPageWrapperProps) {
  const { selectedTags } = useFilterContext();

  return (
    <BoardPageContent
      boardId={boardId}
      assets={assets}
      selectedTags={selectedTags}
      boardTags={boardTags}
    />
  );
}
