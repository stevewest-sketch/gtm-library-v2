'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface HubFromAPI {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  color: string;
  lightColor: string | null;
  accentColor: string | null;
  sortOrder: number | null;
  tags: { id: string; name: string; slug: string }[];
  assetCount: number;
}

interface HubSidebarProps {
  activeHub?: string;
}

export function HubSidebar({ activeHub }: HubSidebarProps) {
  const pathname = usePathname();
  const [hubs, setHubs] = useState<HubFromAPI[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch hubs from API
  useEffect(() => {
    async function fetchHubs() {
      try {
        const res = await fetch('/api/boards');
        if (res.ok) {
          const data = await res.json();
          setHubs(data);
        }
      } catch (error) {
        console.error('Failed to fetch hubs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHubs();
  }, []);

  // Check if we're on the home page
  const isHomeActive = pathname === '/';

  // Determine active hub from props or pathname
  const currentHub = activeHub || pathname.match(/\/hub\/([^/]+)/)?.[1];

  // Map API hubs to display format
  const displayHubs = hubs.map(h => ({
    id: h.slug,
    name: h.name,
    icon: h.icon || '📁',
    color: h.color,
    lightColor: h.lightColor || '#F3F4F6',
    accentColor: h.accentColor || '#4B5563',
    count: h.assetCount,
  }));

  return (
    <aside
      className="border-r fixed left-0 bottom-0 overflow-y-auto custom-scrollbar"
      style={{
        width: 'var(--sidebar-width)',
        borderColor: 'var(--card-border)',
        background: 'var(--card-bg)',
        display: 'flex',
        flexDirection: 'column',
        top: '64px', // Below the header
      }}
    >
      {/* Navigation Area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 12px' }}>
      {/* Main Navigation */}
      <div style={{ marginBottom: '20px' }}>
        {/* Home Link */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md text-[13px] no-underline transition-all"
          style={{
            padding: '9px 10px',
            margin: '2px 0',
            color: isHomeActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            backgroundColor: isHomeActive ? 'var(--bg-page)' : 'transparent',
            fontWeight: isHomeActive ? 500 : 400,
            borderRadius: '6px',
          }}
          onMouseEnter={(e) => {
            if (!isHomeActive) e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
          }}
          onMouseLeave={(e) => {
            if (!isHomeActive) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span className="w-5 text-center text-sm">🏠</span>
          <span>Home</span>
        </Link>
      </div>

      {/* Hubs Section */}
      <div>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-muted)',
            padding: '8px 10px 6px',
          }}
        >
          Hubs
        </div>

        <nav className="flex flex-col">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5"
                style={{ padding: '9px 10px', margin: '2px 0' }}
              >
                <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-6 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            ))
          ) : (
            displayHubs.map((hub) => {
              const isActive = currentHub === hub.id;
              return (
                <Link
                  key={hub.id}
                  href={`/hub/${hub.id}`}
                  className="flex items-center gap-2.5 text-[13px] no-underline transition-all"
                  style={{
                    padding: '9px 10px',
                    margin: '2px 0',
                    borderRadius: '6px',
                    color: isActive ? hub.accentColor : 'var(--text-secondary)',
                    backgroundColor: isActive ? hub.lightColor : 'transparent',
                    fontWeight: isActive ? 500 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {/* Colored Dot */}
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: hub.color }}
                  />
                  {/* Label */}
                  <span className="flex-1">{hub.name}</span>
                  {/* Count */}
                  <span
                    className="text-[11px] rounded-full"
                    style={{
                      padding: isActive ? '3px 10px' : '2px 8px',
                      color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                      backgroundColor: isActive ? '#1A1A1A' : 'var(--bg-page)',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: isActive ? '12px' : '11px',
                    }}
                  >
                    {hub.count}
                  </span>
                </Link>
              );
            })
          )}
        </nav>
      </div>
      </div>
    </aside>
  );
}

// Legacy alias
export const LibrarySidebar = HubSidebar;
