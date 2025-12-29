'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface SearchResult {
  type: 'board' | 'tag' | 'asset';
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  icon?: string;
  color?: string;
}

interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
}

export function PageHeader({ breadcrumbs }: PageHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [results, setResults] = useState<{
    boards: SearchResult[];
    tags: SearchResult[];
    assets: SearchResult[];
  }>({ boards: [], tags: [], assets: [] });
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close search on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut ⌘K to focus search
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search
  const searchContent = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults({ boards: [], tags: [], assets: [] });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchContent(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, searchContent]);

  const hasResults = results.boards.length > 0 || results.tags.length > 0 || results.assets.length > 0;

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 28px',
        background: 'white',
        borderBottom: '1px solid var(--card-border)',
        gap: '24px',
      }}
    >
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center" style={{ gap: '10px', minWidth: '150px' }}>
        {breadcrumbs?.map((item, index) => (
          <span key={index} className="flex items-center" style={{ gap: '10px' }}>
            {index > 0 && <span style={{ color: '#D1D5DB', fontSize: '14px' }}>/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="no-underline hover:text-gray-900 transition-colors"
                style={{ color: '#6B7280', fontSize: '14px' }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                style={{
                  color: '#111827',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* Centered Search Bar */}
      <div
        ref={searchRef}
        style={{
          flex: 1,
          maxWidth: '560px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            background: '#F9FAFB',
            border: isSearchOpen ? '1px solid #10B981' : '1px solid #E5E7EB',
            borderRadius: '10px',
            transition: 'all 0.15s ease',
            boxShadow: isSearchOpen ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
          }}
        >
          <svg
            style={{ width: '18px', height: '18px', color: '#9CA3AF', flexShrink: 0 }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search boards, tags, content..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '14px',
              color: '#111827',
            }}
          />
          {isLoading ? (
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid #E5E7EB',
                borderTopColor: '#10B981',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }}
            />
          ) : (
            <kbd
              style={{
                fontSize: '11px',
                padding: '3px 6px',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '4px',
                color: '#9CA3AF',
                fontFamily: 'inherit',
              }}
            >
              ⌘K
            </kbd>
          )}
        </div>

        {/* Search Dropdown */}
        {isSearchOpen && (searchQuery.trim() || hasResults) && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
              maxHeight: '400px',
              overflow: 'auto',
              zIndex: 100,
            }}
          >
            {!hasResults && searchQuery.trim() && !isLoading && (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF' }}>
                No results found for "{searchQuery}"
              </div>
            )}

            {/* Boards Section */}
            {results.boards.length > 0 && (
              <div>
                <div
                  style={{
                    padding: '12px 16px 8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#9CA3AF',
                    borderBottom: '1px solid #F3F4F6',
                  }}
                >
                  Boards
                </div>
                {results.boards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/library/board/${board.slug}`}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 no-underline transition-colors"
                    style={{
                      padding: '10px 16px',
                      color: '#111827',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: board.color || '#6B7280',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{board.title}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Tags Section */}
            {results.tags.length > 0 && (
              <div>
                <div
                  style={{
                    padding: '12px 16px 8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#9CA3AF',
                    borderBottom: '1px solid #F3F4F6',
                    borderTop: results.boards.length > 0 ? '1px solid #F3F4F6' : 'none',
                  }}
                >
                  Tags
                </div>
                {results.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/library?tag=${tag.slug}`}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 no-underline transition-colors"
                    style={{
                      padding: '10px 16px',
                      color: '#111827',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>#</span>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{tag.title}</span>
                    {tag.subtitle && (
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{tag.subtitle}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* Assets Section */}
            {results.assets.length > 0 && (
              <div>
                <div
                  style={{
                    padding: '12px 16px 8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#9CA3AF',
                    borderBottom: '1px solid #F3F4F6',
                    borderTop: results.boards.length > 0 || results.tags.length > 0 ? '1px solid #F3F4F6' : 'none',
                  }}
                >
                  Assets
                </div>
                {results.assets.map((asset) => (
                  <Link
                    key={asset.id}
                    href={`/library/asset/${asset.slug}`}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 no-underline transition-colors"
                    style={{
                      padding: '10px 16px',
                      color: '#111827',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: '13px' }}>{asset.icon || '📄'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {asset.title}
                      </div>
                      {asset.subtitle && (
                        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{asset.subtitle}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right spacer for balance */}
      <div style={{ minWidth: '150px' }} />
    </header>
  );
}
