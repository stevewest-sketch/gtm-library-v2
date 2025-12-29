'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchResult {
  type: 'board' | 'tag' | 'asset';
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  icon?: string;
  color?: string;
}

export function PageHeader() {
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
        padding: '0 24px',
        background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
        height: '64px',
        gap: '16px',
      }}
    >
      {/* Brand - Logo + Text */}
      <Link
        href="/library"
        className="flex items-center no-underline"
        style={{ gap: '12px' }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            background: '#10B981',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          G+
        </div>
        <span style={{ color: 'white', fontSize: '16px', fontWeight: 600 }}>
          GTM Library
        </span>
      </Link>

      {/* Centered Search Container */}
      <div
        ref={searchRef}
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 40px',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '640px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: isSearchOpen ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)',
            border: isSearchOpen ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.15)',
            borderRadius: '10px',
            transition: 'all 0.15s ease',
          }}
        >
          <svg
            style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}
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
            className="header-search-input"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '14px',
              color: 'white',
            }}
          />
          {isLoading ? (
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.2)',
                borderTopColor: '#10B981',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }}
            />
          ) : (
            <kbd
              style={{
                fontSize: '12px',
                padding: '4px 8px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'inherit',
                border: 'none',
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
    </header>
  );
}
