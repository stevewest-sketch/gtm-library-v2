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
          background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
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

        {/* Admin Nav */}
        <nav className="flex items-center flex-1" style={{ gap: '8px' }}>
          <Link
            href="/admin/manage"
            className="no-underline"
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              color: 'white',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '6px',
              fontWeight: 500,
            }}
          >
            Manage Library
          </Link>
        </nav>

        {/* Search Bar */}
        <button
          className="flex items-center cursor-pointer transition-colors"
          style={{
            gap: '10px',
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            minWidth: '240px',
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
