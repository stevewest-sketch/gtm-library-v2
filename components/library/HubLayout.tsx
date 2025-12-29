'use client';

import { useState, Suspense, createContext, useContext } from 'react';
import { PageHeader } from './PageHeader';
import { HubSidebar } from './HubSidebar';
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

interface HubLayoutProps {
  children: React.ReactNode;
  activeHub?: string;
  breadcrumbs?: BreadcrumbItem[];
  showSidebar?: boolean;
  showFilters?: boolean;
  hubTags?: TagData[];
}

function SidebarFallback() {
  return (
    <aside
      className="bg-white border-r border-gray-200 fixed left-0 bottom-0 overflow-y-auto"
      style={{ width: 'var(--sidebar-width)', top: '64px' }}
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

export function HubLayout({
  children,
  activeHub,
  breadcrumbs,
  showSidebar = true,
  showFilters = true,
  hubTags,
}: HubLayoutProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <FilterContext.Provider value={{ selectedTags }}>
      <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
        {/* Fixed Header at Top */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
          <PageHeader />
        </div>

        {/* Static Left Sidebar (starts below header) */}
        {showSidebar && (
          <Suspense fallback={<SidebarFallback />}>
            <HubSidebar activeHub={activeHub} />
          </Suspense>
        )}

        {/* Main Content Area (below header, to the right of sidebar) */}
        <div
          style={{
            marginLeft: showSidebar ? 'var(--sidebar-width)' : 0,
            paddingTop: '64px', // Header height
            display: 'flex',
            minHeight: '100vh',
          }}
        >
          {/* Filter Sidebar (if shown) */}
          {showSidebar && showFilters && (
            <Suspense fallback={<FilterFallback />}>
              <FilterSidebar
                activeHub={activeHub}
                hubTags={hubTags}
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
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </FilterContext.Provider>
  );
}

// Legacy alias
export const LibraryLayout = HubLayout;
