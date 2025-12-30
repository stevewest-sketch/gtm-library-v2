'use client';

import { HubPageContent } from './HubPageContent';
import { useFilterContext } from './HubLayout';

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

interface HubConfig {
  name: string;
  icon: string;
  color: string;
}

interface HubPageWrapperProps {
  hubId: string;
  hub: HubConfig;
  assets: Asset[];
  hubTags?: TagData[];
  showRecentlyAdded?: boolean;
}

export function HubPageWrapper({ hubId, hub, assets, hubTags, showRecentlyAdded }: HubPageWrapperProps) {
  const { selectedTags } = useFilterContext();

  return (
    <HubPageContent
      hubId={hubId}
      hub={hub}
      assets={assets}
      selectedTags={selectedTags}
      hubTags={hubTags}
      showRecentlyAdded={showRecentlyAdded}
    />
  );
}

// Legacy alias
export const BoardPageWrapper = HubPageWrapper;
