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

interface Board {
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

interface FeaturedBoardData {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  resourceCount: number;
  lastUpdated: string | null;
  items: Asset[];
}

interface LibraryHomepageContentProps {
  recentAssets: Asset[];
  boards: Board[];
  totalItems: number;
  newThisWeek: number;
  featuredBoard?: FeaturedBoardData | null;
  heroTitle?: string;
  heroSubtitle?: string;
  showHubCards?: boolean;
  newThresholdDays?: number;
}

// Hub configuration
const HUB_CONFIG = {
  coe: {
    name: 'CoE Hub',
    icon: '🎯',
    description: 'Centers of Excellence resources and best practices.',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  },
  content: {
    name: 'Content Hub',
    icon: '📦',
    description: 'Sales content, decks, and customer-facing resources.',
    gradient: 'linear-gradient(135deg, #8C69F0 0%, #7C3AED 100%)',
  },
  enablement: {
    name: 'Enablement Hub',
    icon: '🚀',
    description: 'Training sessions and skill-building resources.',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  },
};

// Format date for display
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

// Check if item is "new" based on threshold
function isNew(createdAt: string | undefined, thresholdDays: number): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - thresholdDays);
  return created > threshold;
}

export function LibraryHomepageContent({
  recentAssets,
  boards,
  totalItems,
  newThisWeek,
  featuredBoard,
  heroTitle = 'GTM Hub',
  heroSubtitle = 'Your central hub for selling, supporting, and growing with Gladly.',
  showHubCards = true,
  newThresholdDays = 7,
}: LibraryHomepageContentProps) {
  const [hubHover, setHubHover] = useState<string | null>(null);

  // Show first 6 recent assets
  const displayedRecent = recentAssets.slice(0, 6);
  const hubCardsOrder = ['coe', 'content', 'enablement'];

  return (
    <div style={{ marginLeft: '-28px', marginRight: '-28px', marginTop: '-20px' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          padding: '48px 40px 64px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '40px',
            fontWeight: 700,
            color: 'white',
            marginBottom: '10px',
            letterSpacing: '-0.5px',
          }}
        >
          {heroTitle}
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#94A3B8',
            marginBottom: '40px',
          }}
        >
          {heroSubtitle}
        </p>

        {/* Hub Cards */}
        {showHubCards && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              maxWidth: '900px',
              margin: '0 auto',
            }}
          >
            {hubCardsOrder.map((hubId) => {
              const config = HUB_CONFIG[hubId as keyof typeof HUB_CONFIG];
              if (!config) return null;
              const board = boards.find(b => b.slug === hubId);
              return (
                <Link
                  key={hubId}
                  href={board ? `/library/board/${board.slug}` : `/library?hub=${hubId}`}
                  onMouseEnter={() => setHubHover(hubId)}
                  onMouseLeave={() => setHubHover(null)}
                  style={{
                    background: hubHover === hubId ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                    border: hubHover === hubId ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    padding: '24px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    transform: hubHover === hubId ? 'translateY(-3px)' : 'translateY(0)',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      fontSize: '22px',
                      background: config.gradient,
                    }}
                  >
                    {config.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'white',
                      marginBottom: '6px',
                    }}
                  >
                    {config.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#94A3B8',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {config.description}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Content Area */}
      <div style={{ padding: '32px 40px' }}>
        {/* Featured Board Section */}
        {featuredBoard && featuredBoard.items.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            {/* Section Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 10px',
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#92400E',
                  }}
                >
                  <span>⭐</span> Featured
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Spotlight
                </h2>
              </div>
              <Link
                href={`/library/board/${featuredBoard.slug}`}
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#8C69F0',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                View Board →
              </Link>
            </div>

            {/* Featured Board Card */}
            <div
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '14px',
                overflow: 'hidden',
              }}
            >
              {/* Board Header */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #8C69F0 0%, #7C3AED 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}
                >
                  {featuredBoard.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'white',
                      marginBottom: '3px',
                    }}
                  >
                    {featuredBoard.title}
                  </h3>
                  {featuredBoard.description && (
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                      {featuredBoard.description}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>
                      {featuredBoard.resourceCount}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#94A3B8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Resources
                    </div>
                  </div>
                  {featuredBoard.lastUpdated && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>
                        {formatDate(featuredBoard.lastUpdated)}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#94A3B8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Updated
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Board Content */}
              <div style={{ padding: '20px 24px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {featuredBoard.items.map((item) => (
                    <AssetCard
                      key={item.id}
                      id={item.id}
                      slug={item.slug}
                      title={item.title}
                      shortDescription={item.shortDescription}
                      hub={item.hub}
                      format={item.format}
                      type={item.type}
                      publishDate={item.publishDate}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Recently Added Section */}
        <section style={{ marginBottom: '40px' }}>
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Recently Added
              </h2>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  background: '#DCFCE7',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#166534',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    background: '#22C55E',
                    borderRadius: '50%',
                  }}
                />
                Live Feed
              </span>
            </div>
            <Link
              href="/library/browse"
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#8C69F0',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              View All →
            </Link>
          </div>

          {/* Recently Added Grid */}
          {displayedRecent.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              {displayedRecent.map((item) => (
                <div key={item.id} style={{ position: 'relative' }}>
                  {/* New indicator */}
                  {isNew(item.publishDate, newThresholdDays) && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '8px',
                        height: '8px',
                        background: '#22C55E',
                        borderRadius: '50%',
                        boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.2)',
                        zIndex: 10,
                      }}
                    />
                  )}
                  <AssetCard
                    id={item.id}
                    slug={item.slug}
                    title={item.title}
                    shortDescription={item.shortDescription}
                    hub={item.hub}
                    format={item.format}
                    type={item.type}
                    publishDate={item.publishDate}
                  />
                </div>
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
