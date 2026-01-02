'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AssetCard } from './AssetCard';

interface Asset {
  id: string;
  slug: string;
  title: string;
  description?: string;
  shortDescription?: string;
  hub: string;
  format: string;
  type?: string;
  tags: string[];
  views?: number;
  shares?: number;
  durationMinutes?: number;
  publishDate?: string;
  primaryLink?: string;
}

interface Hub {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  lightColor: string;
  accentColor: string;
  count: number;
  description?: string;
}

interface HubHomepageContentProps {
  recentAssets: Asset[];
  hubs: Hub[];
  totalItems: number;
  newThisWeek: number;
}

// Quick Access cards data - NEON v4 with dark mode colors
const QUICK_ACCESS = [
  {
    id: 'enablement',
    title: 'Enablement Hub',
    description: 'Training sessions, certifications, and learning paths',
    icon: '🎓',
    iconBg: 'var(--accent-enablement-bg, rgba(34, 197, 94, 0.15))',
    href: '/hub/enablement',
  },
  {
    id: 'competitive',
    title: 'Battlecards',
    description: 'Competitive intelligence and positioning',
    icon: '⚔️',
    iconBg: 'var(--badge-red-bg, rgba(255, 80, 80, 0.18))',
    href: '/hub/competitive',
  },
  {
    id: 'sales',
    title: 'Sales Resources',
    description: 'Decks, templates, and discovery guides',
    icon: '📈',
    iconBg: 'var(--accent-content-bg, rgba(140, 105, 240, 0.15))',
    href: '/hub/sales',
  },
];

export function HubHomepageContent({
  recentAssets,
  hubs,
  totalItems,
  newThisWeek,
}: HubHomepageContentProps) {
  const [quickHover, setQuickHover] = useState<string | null>(null);
  const [hubHover, setHubHover] = useState<string | null>(null);

  // Show first 6 recent assets
  const displayedRecent = recentAssets.slice(0, 6);

  return (
    <div style={{ marginLeft: '-28px', marginRight: '-28px', marginTop: '-20px' }}>
      {/* Main Content Area */}
      <div style={{ padding: '24px 28px' }}>
        {/* Hero Section - NEON v4 Design */}
        <div
          className="hero"
          style={{
            background: 'var(--bg-surface)',
            borderRadius: '16px',
            padding: '40px',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* NEON gradient top border */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, var(--accent-content, #8C69F0), var(--accent-enablement, #22C55E), var(--accent-coe, #F59E0B))',
            }}
          />

          {/* Background glow effect */}
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(140, 105, 240, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                marginBottom: '8px',
                color: 'var(--text-primary)',
              }}
            >
              Welcome to GTM Hub
            </h1>
            <p
              style={{
                fontSize: '15px',
                color: 'var(--text-secondary)',
                marginBottom: '24px',
                maxWidth: '500px',
              }}
            >
              Your central hub for sales enablement, content resources, and best practices.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {hubs.length}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Hubs
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {totalItems}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Resources
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {newThisWeek}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Added This Week
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Section - NEON v4 */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 className="section-title" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Quick Access
            </h3>
          </div>
          <div
            className="quick-access-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            {QUICK_ACCESS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="quick-access-card"
                onMouseEnter={() => setQuickHover(item.id)}
                onMouseLeave={() => setQuickHover(null)}
                style={{
                  background: 'var(--bg-surface, var(--card-bg))',
                  border: `1px solid ${quickHover === item.id ? 'var(--border-hover, rgba(255, 255, 255, 0.15))' : 'var(--border-default, var(--card-border))'}`,
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  transform: quickHover === item.id ? 'translateY(-2px)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <div
                  className="quick-access-icon"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    background: item.iconBg,
                  }}
                >
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by Hub Section - NEON v4 */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 className="section-title" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Browse by Hub
            </h3>
          </div>
          <div
            className="browse-hub-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
            }}
          >
            {hubs.map((hub) => (
              <Link
                key={hub.id}
                href={`/hub/${hub.slug}`}
                className="browse-hub-card"
                onMouseEnter={() => setHubHover(hub.id)}
                onMouseLeave={() => setHubHover(null)}
                style={{
                  background: 'var(--bg-surface, var(--card-bg))',
                  border: `1px solid ${hubHover === hub.id ? 'var(--border-hover, rgba(255, 255, 255, 0.15))' : 'var(--border-default, var(--card-border))'}`,
                  borderRadius: '8px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                <div
                  className="browse-hub-icon"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    background: hub.lightColor || 'var(--bg-elevated)',
                    flexShrink: 0,
                  }}
                >
                  {hub.icon}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {hub.name}
                  </div>
                  <div className="browse-hub-count" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {hub.count} items
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recently Added Section - NEON v4 */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 className="section-title" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Recently Added
            </h3>
          </div>

          {/* Asset Card Grid */}
          {displayedRecent.length > 0 ? (
            <div
              className="recently-added-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
              }}
            >
              {displayedRecent.map((asset) => (
                <AssetCard
                  key={asset.id}
                  id={asset.id}
                  slug={asset.slug}
                  title={asset.title}
                  shortDescription={asset.shortDescription}
                  hub={asset.hub}
                  format={asset.format}
                  type={asset.type}
                  publishDate={asset.publishDate}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                background: 'var(--bg-surface, var(--card-bg))',
                border: '1px solid var(--border-default, var(--card-border))',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
              }}
            >
              <p style={{ color: 'var(--text-muted)' }}>
                No recent assets. Content will appear here once resources are added.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Legacy alias
export const LibraryHomepageContent = HubHomepageContent;
