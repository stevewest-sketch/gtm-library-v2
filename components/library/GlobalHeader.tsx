'use client';

import Link from 'next/link';

interface GlobalHeaderProps {
  // breadcrumbs removed - using centered search design from mock
}

export function GlobalHeader({}: GlobalHeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center"
      style={{
        background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
        height: 'var(--header-height)',
        padding: '0 24px',
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

      {/* Centered Search Container - matches mock exactly */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 40px',
        }}
      >
        <button
          className="flex items-center cursor-pointer transition-colors"
          style={{
            width: '100%',
            maxWidth: '640px',
            gap: '12px',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '10px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
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
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', flex: 1, textAlign: 'left' }}>
            Search boards, tags, content...
          </span>
          <kbd
            style={{
              fontSize: '12px',
              padding: '4px 8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'inherit',
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  );
}
