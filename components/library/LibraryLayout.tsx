'use client';

import { useState, Suspense, createContext, useContext } from 'react';
import { PageHeader } from './PageHeader';
import { LibrarySidebar } from './LibrarySidebar';
import { FilterSidebar } from './FilterSidebar';

// Context to share filter state with children
interface FilterContextType {
  selectedTags: string[];
}

const FilterContext = createContext<FilterContextType>({
  selectedTags: [],
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
  activeBoard?: string;
  breadcrumbs?: BreadcrumbItem[];
  showSidebar?: boolean;
  showFilters?: boolean;
  boardTags?: TagData[];
}

function SidebarFallback() {
  return (
    <aside
      className="bg-white border-r border-gray-200 fixed top-0 bottom-0 left-0 overflow-y-auto"
      style={{ width: 'var(--sidebar-width)' }}
    >
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded mb-4" />
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
      className="bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0"
      style={{
        width: 'var(--filter-width)',
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

  // Determine main content class based on what's shown
  const getMainClass = () => {
    if (!showSidebar) return 'main-full';
    if (!showFilters) return 'main-with-sidebar';
    return 'main-with-sidebars';
  };

  return (
    <FilterContext.Provider value={{ selectedTags }}>
      <div className="min-h-screen" style={{ background: 'var(--bg-page)', display: 'flex' }}>
        {/* Static Left Sidebar */}
        {showSidebar && (
          <Suspense fallback={<SidebarFallback />}>
            <LibrarySidebar activeBoard={activeBoard} />
          </Suspense>
        )}

        {/* Main Content Area (everything to the right of sidebar) */}
        <div
          style={{
            flex: 1,
            marginLeft: showSidebar ? 'var(--sidebar-width)' : 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
          }}
        >
          {/* Page Header with Breadcrumbs and Search */}
          <PageHeader breadcrumbs={breadcrumbs} />

          {/* Content Area */}
          <div style={{ display: 'flex', flex: 1 }}>
            {/* Filter Sidebar (if shown) */}
            {showSidebar && showFilters && (
              <Suspense fallback={<FilterFallback />}>
                <FilterSidebar
                  activeBoard={activeBoard}
                  boardTags={boardTags}
                  selectedTags={selectedTags}
                  onTagChange={setSelectedTags}
                />
              </Suspense>
            )}

            {/* Main Content */}
            <main
              style={{
                flex: 1,
                padding: '20px 28px',
                minHeight: 'calc(100vh - 65px)',
              }}
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    </FilterContext.Provider>
  );
}
