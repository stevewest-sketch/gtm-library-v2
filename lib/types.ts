import type { HubId, FormatId, ContentTypeId } from './constants/hubs';
import type { CatalogEntry, PageSection } from './db/schema';

// Re-export database types
export type { CatalogEntry, PageSection };

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Search types
export interface SearchQuery {
  q?: string;
  hub?: HubId;
  format?: FormatId;
  types?: ContentTypeId[];
  tags?: string[];
  page?: number;
  pageSize?: number;
  sort?: 'recent' | 'views' | 'shares' | 'title';
}

export interface SearchResult {
  entries: CatalogEntry[];
  total: number;
  facets: {
    hubs: { id: HubId; count: number }[];
    formats: { id: FormatId; count: number }[];
    types: { id: ContentTypeId; count: number }[];
    tags: { name: string; count: number }[];
  };
}

// Content ingestion types
export interface IngestRequest {
  url: string;
  title?: string;
  description?: string;
  hub?: HubId;
}

export interface IngestResult {
  success: boolean;
  entry?: Partial<CatalogEntry>;
  inferred: {
    hub: HubId;
    format: FormatId;
    types: ContentTypeId[];
    tags: string[];
    confidence: {
      hub: number;
      format: number;
      types: number;
      tags: number;
    };
  };
  source: {
    type: 'google-slides' | 'google-docs' | 'google-sheets' | 'loom' | 'youtube' | 'pdf' | 'generic';
    title?: string;
    description?: string;
    thumbnailUrl?: string;
  };
}

// Filter state for UI
export interface FilterState {
  hub: HubId | null;
  formats: FormatId[];
  types: ContentTypeId[];
  tags: string[];
  search: string;
}

// Card display props
export interface LibraryCardProps {
  entry: CatalogEntry;
  variant?: 'default' | 'compact' | 'featured';
  showHub?: boolean;
}

// Detail page props
export interface DetailPageProps {
  entry: CatalogEntry;
}
