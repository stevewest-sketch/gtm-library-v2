'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BOARDS, type BoardId } from '@/lib/constants/hubs';

interface BoardFromAPI {
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

interface LibrarySidebarProps {
  activeBoard?: BoardId;
}

export function LibrarySidebar({ activeBoard }: LibrarySidebarProps) {
  const pathname = usePathname();
  const [boards, setBoards] = useState<BoardFromAPI[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch boards from API
  useEffect(() => {
    async function fetchBoards() {
      try {
        const res = await fetch('/api/boards');
        if (res.ok) {
          const data = await res.json();
          setBoards(data);
        }
      } catch (error) {
        console.error('Failed to fetch boards:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBoards();
  }, []);

  // Check if we're in the library section
  const isLibraryActive = pathname.startsWith('/library');
  const isHomeActive = pathname === '/';

  // Determine active board from props or pathname
  const currentBoard = activeBoard || (pathname.match(/\/board\/([^/]+)/)?.[1] as BoardId | undefined);

  // Use API boards if loaded, otherwise fall back to static BOARDS
  const displayBoards = boards.length > 0
    ? boards.map(b => ({
        id: b.slug,
        name: b.name,
        icon: b.icon || BOARDS[b.slug as BoardId]?.icon || '📁',
        color: b.color,
        lightColor: b.lightColor || BOARDS[b.slug as BoardId]?.lightColor || '#F3F4F6',
        accentColor: b.accentColor || BOARDS[b.slug as BoardId]?.accentColor || '#4B5563',
        count: b.assetCount,
      }))
    : Object.entries(BOARDS).map(([id, board]) => ({
        id,
        name: board.name,
        icon: board.icon,
        color: board.color,
        lightColor: board.lightColor,
        accentColor: board.accentColor,
        count: board.count,
      }));

  return (
    <aside
      className="bg-white border-r fixed top-[var(--header-height)] left-0 bottom-0 overflow-y-auto custom-scrollbar"
      style={{
        width: 'var(--sidebar-width)',
        borderColor: 'var(--card-border)',
        padding: '16px 12px',
      }}
    >
      {/* Main Navigation - v7 exact: nav-section margin-bottom: 20px */}
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
            if (!isHomeActive) e.currentTarget.style.backgroundColor = '#F3F4F6';
          }}
          onMouseLeave={(e) => {
            if (!isHomeActive) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span className="w-5 text-center text-sm">🏠</span>
          <span>Home</span>
        </Link>

        {/* Library Link */}
        <Link
          href="/library"
          className="flex items-center gap-2.5 rounded-md text-[13px] no-underline transition-all"
          style={{
            padding: '9px 10px',
            margin: '2px 0',
            color: isLibraryActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            backgroundColor: isLibraryActive ? 'var(--bg-page)' : 'transparent',
            fontWeight: isLibraryActive ? 500 : 400,
            borderRadius: '6px',
          }}
          onMouseEnter={(e) => {
            if (!isLibraryActive) e.currentTarget.style.backgroundColor = '#F3F4F6';
          }}
          onMouseLeave={(e) => {
            if (!isLibraryActive) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span className="w-5 text-center text-sm">📚</span>
          <span>Library</span>
        </Link>
      </div>

      {/* Boards Section */}
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
          Boards
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
            displayBoards.map((board) => {
              const isActive = currentBoard === board.id;
              return (
                <Link
                  key={board.id}
                  href={`/library/board/${board.id}`}
                  className="flex items-center gap-2.5 text-[13px] no-underline transition-all"
                  style={{
                    padding: '9px 10px',
                    margin: '2px 0',
                    borderRadius: '6px',
                    color: isActive ? board.accentColor : 'var(--text-secondary)',
                    backgroundColor: isActive ? board.lightColor : 'transparent',
                    fontWeight: isActive ? 500 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#F3F4F6';
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
                    style={{ backgroundColor: board.color }}
                  />
                  {/* Label */}
                  <span className="flex-1">{board.name}</span>
                  {/* Count */}
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--bg-page)',
                    }}
                  >
                    {board.count}
                  </span>
                </Link>
              );
            })
          )}
        </nav>
      </div>
    </aside>
  );
}
