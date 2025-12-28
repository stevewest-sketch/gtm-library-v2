'use client';

import { useState, Suspense, createContext, useContext } from 'react';
import { GlobalHeader } from './GlobalHeader';
import { LibrarySidebar } from './LibrarySidebar';
import { FilterSidebar } from './FilterSidebar';
import type { BoardId } from '@/lib/constants/hubs';

// Context to share filter state with children
interface FilterContextType {
  selectedTags: string[];
  selectedCrossFilters: Record<string, string[]>;
}

const FilterContext = createContext<FilterContextType>({
  selectedTags: [],
  selectedCrossFilters: {},
});

export function useFilterContext() {
  return useContext(FilterContext);
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TagData {
  id: string;
  name: string;
  slug: string;
}

interface LibraryLayoutProps {
  children: React.ReactNode;
  activeBoard?: BoardId;
  breadcrumbs?: BreadcrumbItem[];
  showSidebar?: boolean;
  showFilters?: boolean;
  boardTags?: TagData[];
}

function SidebarFallback() {
  return (
    <aside
      className="bg-white border-r border-gray-200 fixed bottom-0 left-0 overflow-y-auto"
      style={{ width: 'var(--sidebar-width)', top: 'var(--header-height)' }}
    >
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="space-y-2">
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="h-10 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function FilterFallback() {
  return (
    <aside
      className="bg-white border-r border-gray-200 fixed bottom-0 overflow-y-auto"
      style={{
        width: 'var(--filter-width)',
        left: 'var(--sidebar-width)',
        top: 'var(--header-height)',
      }}
    >
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="space-y-2">
            <div className="h-6 bg-gray-100 rounded" />
            <div className="h-6 bg-gray-100 rounded" />
            <div className="h-6 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </aside>
  );
}

export function LibraryLayout({
  children,
  activeBoard,
  breadcrumbs,
  showSidebar = true,
  showFilters = true,
  boardTags,
}: LibraryLayoutProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCrossFilters, setSelectedCrossFilters] = useState<Record<string, string[]>>({});

  const handleCrossFilterChange = (boardSlug: string, tags: string[]) => {
    setSelectedCrossFilters(prev => ({
      ...prev,
      [boardSlug]: tags,
    }));
  };

  // Determine main content class based on what's shown
  const getMainClass = () => {
    if (!showSidebar) return 'main-full';
    if (!showFilters) return 'main-with-sidebar';
    return 'main-with-sidebars';
  };

  return (
    <FilterContext.Provider value={{ selectedTags, selectedCrossFilters }}>
      <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
        <GlobalHeader breadcrumbs={breadcrumbs} />

        {showSidebar && (
          <Suspense fallback={<SidebarFallback />}>
            <LibrarySidebar activeBoard={activeBoard} />
          </Suspense>
        )}

        {showSidebar && showFilters && (
          <Suspense fallback={<FilterFallback />}>
            <FilterSidebar
              activeBoard={activeBoard}
              boardTags={boardTags}
              selectedTags={selectedTags}
              selectedCrossFilters={selectedCrossFilters}
              onTagChange={setSelectedTags}
              onCrossFilterChange={handleCrossFilterChange}
            />
          </Suspense>
        )}

        <div className="app-layout">
          <main className={getMainClass()}>
            {children}
          </main>
        </div>
      </div>
    </FilterContext.Provider>
  );
}
