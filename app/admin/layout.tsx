'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/manage', label: 'Assets', icon: '📋', count: null },
    { href: '/admin/manage/import', label: 'Import', icon: '📥', count: null },
    { href: '/admin/manage/tags', label: 'Tags', icon: '🏷️', count: null },
    { href: '/admin/manage/boards', label: 'Hubs', icon: '📊', count: null },
    { href: '/admin/manage/taxonomy', label: 'Taxonomy', icon: '🎨', count: null },
    { href: '/admin/manage/analytics', label: 'Analytics', icon: '📈', count: null },
  ];

  const helpItems = [
    { href: '/admin/user-manual', label: 'User Manual', icon: '📖' },
  ];

  const libraryNavItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/library', label: 'Browse', icon: '📚' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Global Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center"
        style={{
          background: 'var(--bg-surface, #0D0D12)',
          borderBottom: '1px solid var(--card-border, rgba(255,255,255,0.08))',
          height: 'var(--header-height)',
          padding: '0 24px',
        }}
      >
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center no-underline"
          style={{
            gap: '12px',
            paddingRight: '20px',
            marginRight: '20px',
            borderRight: '1px solid var(--card-border, rgba(255,255,255,0.08))',
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
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary, #FFFFFF)' }}>GTM Library</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, rgba(255,255,255,0.5))' }}>Revenue Enablement</div>
          </div>
        </Link>

        {/* Centered Search Bar */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <button
            className="flex items-center cursor-pointer transition-colors"
            style={{
              gap: '10px',
              padding: '10px 16px',
              background: 'var(--bg-elevated, rgba(255,255,255,0.04))',
              border: '1px solid var(--card-border, rgba(255,255,255,0.08))',
              borderRadius: '10px',
              width: '100%',
              maxWidth: '480px',
            }}
          >
            <svg
              style={{ width: '16px', height: '16px', color: 'var(--text-muted, rgba(255,255,255,0.5))' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span style={{ fontSize: '13px', color: 'var(--text-muted, rgba(255,255,255,0.5))', flex: 1, textAlign: 'left' }}>
              Search content...
            </span>
            <kbd
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                background: 'var(--bg-hover, rgba(255,255,255,0.06))',
                borderRadius: '6px',
                color: 'var(--text-muted, rgba(255,255,255,0.5))',
                fontFamily: 'inherit',
              }}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            href="/admin/manage?action=create"
            className="no-underline flex items-center"
            style={{
              gap: '6px',
              padding: '8px 14px',
              fontSize: '13px',
              color: 'white',
              background: '#10B981',
              borderRadius: '8px',
              fontWeight: 500,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Asset
          </Link>
          <Link
            href="/"
            className="no-underline flex items-center"
            style={{
              gap: '6px',
              padding: '8px 14px',
              fontSize: '13px',
              color: 'var(--text-secondary, rgba(255,255,255,0.7))',
              background: 'var(--bg-elevated, rgba(255,255,255,0.04))',
              border: '1px solid var(--card-border, rgba(255,255,255,0.08))',
              borderRadius: '8px',
              fontWeight: 500,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            View Library
          </Link>
        </div>
      </header>

      {/* Sidebar - NEON v4 Dark Mode */}
      <aside
        className="sidebar border-r fixed bottom-0 overflow-y-auto custom-scrollbar"
        style={{
          width: '220px',
          top: 'var(--header-height)',
          left: 0,
          background: 'var(--bg-surface, white)',
          borderColor: 'var(--border-subtle, var(--card-border))',
          padding: '16px 12px',
        }}
      >
        {/* Admin Section */}
        <div style={{ marginBottom: '24px' }}>
          <div
            className="nav-section-title"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-muted)',
              padding: '8px 10px 6px',
            }}
          >
            Admin
          </div>
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href === '/admin/manage' && pathname === '/admin/manage');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-item flex items-center text-[13px] no-underline transition-all"
                  style={{
                    gap: '10px',
                    padding: '10px 12px',
                    margin: '2px 0',
                    borderRadius: '8px',
                    color: isActive ? 'var(--accent-content-light, #B794FF)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(140, 105, 240, 0.15)' : 'transparent',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  <span className="w-5 text-center text-sm">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.count && (
                    <span
                      className="nav-item-count text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-hover)',
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Help Section */}
        <div style={{ marginBottom: '24px' }}>
          <div
            className="nav-section-title"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-muted)',
              padding: '8px 10px 6px',
            }}
          >
            Help
          </div>
          <nav className="flex flex-col">
            {helpItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-item flex items-center text-[13px] no-underline transition-all"
                  style={{
                    gap: '10px',
                    padding: '10px 12px',
                    margin: '2px 0',
                    borderRadius: '8px',
                    color: isActive ? 'var(--accent-content-light, #B794FF)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(140, 105, 240, 0.15)' : 'transparent',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  <span className="w-5 text-center text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Library Section */}
        <div>
          <div
            className="nav-section-title"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-muted)',
              padding: '8px 10px 6px',
            }}
          >
            Library
          </div>
          <nav className="flex flex-col">
            {libraryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-item flex items-center text-[13px] no-underline transition-all"
                style={{
                  gap: '10px',
                  padding: '10px 12px',
                  margin: '2px 0',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent',
                }}
              >
                <span className="w-5 text-center text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          marginLeft: '220px',
          paddingTop: 'var(--header-height)',
          minHeight: '100vh',
        }}
      >
        {children}
      </main>
    </div>
  );
}
