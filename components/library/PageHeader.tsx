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
        href="/"
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
          GTM Hub
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

        {/* Search Dropdown - matches comprehensive-gtm-design-system.html */}
        {isSearchOpen && (searchQuery.trim() || hasResults) && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '640px',
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              maxHeight: '400px',
              overflowY: 'auto',
              overflowX: 'hidden',
              zIndex: 100,
            }}
            onWheel={(e) => e.stopPropagation()}
          >
            {!hasResults && searchQuery.trim() && !isLoading && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No results found for "{searchQuery}"
              </div>
            )}

            {/* Tags Section */}
            {results.tags.length > 0 && (
              <div style={{ borderBottom: results.assets.length > 0 ? '1px solid var(--card-border)' : 'none' }}>
                <div
                  style={{
                    padding: '12px 20px 8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Tags
                </div>
                {results.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.slug}`}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center no-underline transition-colors"
                    style={{
                      padding: '12px 20px',
                      gap: '14px',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Tag Icon Box */}
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'var(--hover-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '18px',
                        fontWeight: 500,
                        flexShrink: 0,
                      }}
                    >
                      #
                    </div>
                    {/* Tag Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        {tag.title}
                        {tag.subtitle && (
                          <span
                            style={{
                              padding: '3px 8px',
                              background: 'var(--hover-bg)',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 500,
                              color: 'var(--text-muted)',
                            }}
                          >
                            {tag.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Assets Section */}
            {results.assets.length > 0 && (
              <div>
                <div
                  style={{
                    padding: '12px 20px 8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Assets
                </div>
                {results.assets.map((asset) => (
                  <Link
                    key={asset.id}
                    href={`/asset/${asset.slug}`}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center no-underline transition-colors"
                    style={{
                      padding: '12px 20px',
                      gap: '14px',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Asset Icon Box */}
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: asset.color || '#FEF3C7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        flexShrink: 0,
                      }}
                    >
                      {asset.icon || '📄'}
                    </div>
                    {/* Asset Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {asset.title}
                      </div>
                      {asset.subtitle && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{asset.subtitle}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Hubs Section - show at bottom if present */}
            {results.boards.length > 0 && (
              <div style={{ borderTop: results.tags.length > 0 || results.assets.length > 0 ? '1px solid var(--card-border)' : 'none' }}>
                <div
                  style={{
                    padding: '12px 20px 8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Hubs
                </div>
                {results.boards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/hub/${board.slug}`}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center no-underline transition-colors"
                    style={{
                      padding: '12px 20px',
                      gap: '14px',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Board Color Dot */}
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'var(--hover-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: board.color || '#6B7280',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{board.title}</span>
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
