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

// Quick Access cards data
const QUICK_ACCESS = [
  {
    id: 'enablement',
    title: 'Enablement Hub',
    description: 'Training sessions, certifications, and learning paths',
    icon: '🎓',
    iconBg: '#D1FAE5',
    href: '/hub/enablement',
  },
  {
    id: 'competitive',
    title: 'Battlecards',
    description: 'Competitive intelligence and positioning',
    icon: '⚔️',
    iconBg: '#FEE2E2',
    href: '/hub/competitive',
  },
  {
    id: 'sales',
    title: 'Sales Resources',
    description: 'Decks, templates, and discovery guides',
    icon: '📈',
    iconBg: '#E0F2FE',
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
        {/* Hero Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
            borderRadius: '16px',
            padding: '40px',
            marginBottom: '32px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background glow effect */}
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              Welcome to GTM Hub
            </h1>
            <p
              style={{
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '24px',
                maxWidth: '500px',
              }}
            >
              Your central hub for sales enablement, content resources, and best practices.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>
                  {hubs.length}
                </span>
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Hubs
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>
                  {totalItems}
                </span>
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Resources
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>
                  {newThisWeek}
                </span>
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Added This Week
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Section */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Quick Access
            </h3>
          </div>
          <div
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
                onMouseEnter={() => setQuickHover(item.id)}
                onMouseLeave={() => setQuickHover(null)}
                style={{
                  background: 'white',
                  border: `1px solid ${quickHover === item.id ? '#8C69F0' : 'var(--card-border)'}`,
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  transform: quickHover === item.id ? 'translateY(-2px)' : 'none',
                  boxShadow: quickHover === item.id ? '0 4px 16px rgba(0, 0, 0, 0.08)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    background: item.iconBg,
                  }}
                >
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by Hub Section */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Browse by Hub
            </h3>
          </div>
          <div
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
                onMouseEnter={() => setHubHover(hub.id)}
                onMouseLeave={() => setHubHover(null)}
                style={{
                  background: 'white',
                  border: `1px solid ${hubHover === hub.id ? '#8C69F0' : 'var(--card-border)'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: hubHover === hub.id ? '0 4px 12px rgba(0, 0, 0, 0.06)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    background: hub.lightColor,
                    flexShrink: 0,
                  }}
                >
                  {hub.icon}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {hub.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {hub.count} items
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recently Added Section */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Recently Added
            </h3>
          </div>

          {/* Asset Card Grid */}
          {displayedRecent.length > 0 ? (
            <div
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
                background: 'white',
                border: '1px solid var(--card-border)',
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
