'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  stats: {
    totalAssets: number;
    totalViews: number;
    totalShares: number;
    recentViews: number;
  };
  topAssets: {
    id: string;
    slug: string;
    title: string;
    hub: string;
    views: number;
    shares: number;
  }[];
  viewsByHub: {
    hub: string;
    views: number;
    assets: number;
  }[];
}

const HUB_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  content: { bg: '#EDE9FE', text: '#6D28D9', bar: '#8C69F0' },
  enablement: { bg: '#D1FAE5', text: '#047857', bar: '#10B981' },
  coe: { bg: '#FEF3C7', text: '#B45309', bar: '#F59E0B' },
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/analytics?days=${timeRange}`);
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [timeRange]);

  const stats = analytics?.stats || { totalAssets: 0, totalViews: 0, totalShares: 0, recentViews: 0 };
  const topAssets = analytics?.topAssets || [];
  const viewsByHub = analytics?.viewsByHub || [];
  const maxHubViews = Math.max(...viewsByHub.map((h) => h.views), 1);

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Page Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
            Analytics
          </h1>
          <p style={{ fontSize: '14px', color: '#4B5563' }}>
            Track content performance and user engagement across your library.
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{
            padding: '10px 36px 10px 14px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'white',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {error && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            color: '#B91C1C',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <StatCard
          label="Total Assets"
          value={stats.totalAssets.toLocaleString()}
          loading={loading}
        />
        <StatCard
          label="Total Views"
          value={stats.totalViews.toLocaleString()}
          loading={loading}
        />
        <StatCard
          label="Total Shares"
          value={stats.totalShares.toLocaleString()}
          loading={loading}
        />
        <StatCard
          label={`Views (${timeRange}d)`}
          value={stats.recentViews.toLocaleString()}
          loading={loading}
        />
      </div>

      {/* Two Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '24px',
        }}
      >
        {/* Top Assets */}
        <div
          style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
              Top Performing Assets
            </h2>
            <Link href="/admin/manage" style={{ fontSize: '13px', color: '#8C69F0', textDecoration: 'none' }}>
              View All →
            </Link>
          </div>
          <div>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                Loading...
              </div>
            ) : topAssets.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                No data available yet
              </div>
            ) : (
              topAssets.map((asset, index) => {
                const hubColors = HUB_COLORS[asset.hub?.toLowerCase()] || { bg: '#F3F4F6', text: '#6B7280' };
                return (
                  <Link
                    key={asset.id}
                    href={`/library/asset/${asset.slug}`}
                    className="flex items-center"
                    style={{
                      padding: '14px 20px',
                      borderBottom: index < topAssets.length - 1 ? '1px solid #F3F4F6' : 'none',
                      gap: '16px',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        background: '#F3F4F6',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#6B7280',
                      }}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#111827',
                          marginBottom: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {asset.title}
                      </div>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: hubColors.bg,
                          color: hubColors.text,
                          textTransform: 'capitalize',
                        }}
                      >
                        {asset.hub}
                      </span>
                    </div>
                    <div className="flex items-center" style={{ gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                          {asset.views.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>views</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                          {asset.shares.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>shares</div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Hub Usage */}
        <div
          style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
              Views by Hub
            </h2>
            <Link href="/admin/manage/boards" style={{ fontSize: '13px', color: '#8C69F0', textDecoration: 'none' }}>
              Manage →
            </Link>
          </div>
          <div style={{ padding: '20px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                Loading...
              </div>
            ) : viewsByHub.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                No data available yet
              </div>
            ) : (
              viewsByHub.map((hub, index) => {
                const hubColors = HUB_COLORS[hub.hub?.toLowerCase()] || { bar: '#6B7280' };
                const percentage = (hub.views / maxHubViews) * 100;
                return (
                  <div
                    key={hub.hub}
                    style={{
                      marginBottom: index < viewsByHub.length - 1 ? '20px' : 0,
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                      <div className="flex items-center" style={{ gap: '10px' }}>
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: hubColors.bar,
                          }}
                        />
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#111827',
                            textTransform: 'capitalize',
                          }}
                        >
                          {hub.hub}
                        </span>
                      </div>
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>
                        {hub.views.toLocaleString()} views
                      </span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        background: '#F3F4F6',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: hubColors.bar,
                          borderRadius: '4px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                      {hub.assets} assets
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
        {label}
      </div>
      {loading ? (
        <div
          style={{
            height: '36px',
            background: '#F3F4F6',
            borderRadius: '6px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      ) : (
        <span style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
          {value}
        </span>
      )}
    </div>
  );
}
