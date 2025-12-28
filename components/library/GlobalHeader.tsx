'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface GlobalHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
}

export function GlobalHeader({ breadcrumbs }: GlobalHeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center"
      style={{
        background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
        height: 'var(--header-height)',
        padding: '0 24px',
      }}
    >
      {/* Brand - v7 exact: gap 12px, padding-right 24px, margin-right 24px */}
      <Link
        href="/"
        className="flex items-center no-underline"
        style={{
          gap: '12px',
          paddingRight: '24px',
          marginRight: '24px',
          borderRight: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            background: '#10B981',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '12px',
          }}
        >
          G+
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>GTM Library</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Revenue Enablement</div>
        </div>
      </Link>

      {/* Breadcrumb Navigation - v7 exact: gap 10px */}
      <nav className="flex items-center flex-1" style={{ gap: '10px' }}>
        {breadcrumbs?.map((item, index) => (
          <span key={index} className="flex items-center" style={{ gap: '10px' }}>
            {index > 0 && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="no-underline hover:text-white transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="flex items-center"
                style={{
                  gap: '8px',
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '14px',
                }}
              >
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* Search Bar - v7 exact: gap 10px, padding 8px 16px, min-width 280px */}
      <button
        className="flex items-center cursor-pointer transition-colors"
        style={{
          gap: '10px',
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          minWidth: '280px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        }}
      >
        <svg
          style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.5)' }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', flex: 1, textAlign: 'left' }}>
          Search content...
        </span>
        <kbd
          style={{
            fontSize: '11px',
            padding: '3px 6px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'inherit',
          }}
        >
          ⌘K
        </kbd>
      </button>
    </header>
  );
}
