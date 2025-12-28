'use client';

import { useState } from 'react';

// Mock analytics data
const STATS = [
  { label: 'Total Assets', value: '367', change: '+12', trend: 'up' },
  { label: 'Total Views', value: '12,847', change: '+8.2%', trend: 'up' },
  { label: 'Active Users', value: '234', change: '+5', trend: 'up' },
  { label: 'Avg. Engagement', value: '4.2m', change: '-0.3m', trend: 'down' },
];

const TOP_ASSETS = [
  { id: '1', title: 'Q4 Product Launch Deck', views: 1247, hub: 'Content', trend: 'up' },
  { id: '2', title: 'Customer Success Playbook', views: 982, hub: 'Enablement', trend: 'up' },
  { id: '3', title: 'Competitive Battlecard - Competitor A', views: 876, hub: 'CoE', trend: 'down' },
  { id: '4', title: 'Sales Discovery Framework', views: 743, hub: 'Enablement', trend: 'up' },
  { id: '5', title: 'ROI Calculator Template', views: 654, hub: 'Content', trend: 'up' },
];

const BOARD_USAGE = [
  { name: 'Enablement', views: 4523, assets: 143, color: '#10B981' },
  { name: 'Content Types', views: 3847, assets: 127, color: '#8C69F0' },
  { name: 'CoE', views: 2156, assets: 89, color: '#F59E0B' },
  { name: 'Sales', views: 1423, assets: 78, color: '#0EA5E9' },
  { name: 'Product', views: 897, assets: 56, color: '#3B82F6' },
];

const HUB_COLORS: Record<string, { bg: string; text: string }> = {
  'Content': { bg: '#EDE9FE', text: '#6D28D9' },
  'Enablement': { bg: '#D1FAE5', text: '#047857' },
  'CoE': { bg: '#FEF3C7', text: '#B45309' },
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

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
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {STATS.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
              {stat.label}
            </div>
            <div className="flex items-end justify-between">
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
                {stat.value}
              </span>
              <span
                className="flex items-center"
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: stat.trend === 'up' ? '#10B981' : '#EF4444',
                  gap: '4px',
                }}
              >
                {stat.trend === 'up' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
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
            <a href="/admin/manage" style={{ fontSize: '13px', color: '#8C69F0', textDecoration: 'none' }}>
              View All →
            </a>
          </div>
          <div>
            {TOP_ASSETS.map((asset, index) => (
              <div
                key={asset.id}
                className="flex items-center"
                style={{
                  padding: '14px 20px',
                  borderBottom: index < TOP_ASSETS.length - 1 ? '1px solid #F3F4F6' : 'none',
                  gap: '16px',
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
                <div className="flex-1">
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '2px' }}>
                    {asset.title}
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: HUB_COLORS[asset.hub]?.bg || '#F3F4F6',
                      color: HUB_COLORS[asset.hub]?.text || '#6B7280',
                    }}
                  >
                    {asset.hub}
                  </span>
                </div>
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    {asset.views.toLocaleString()}
                  </span>
                  <span
                    style={{
                      color: asset.trend === 'up' ? '#10B981' : '#EF4444',
                    }}
                  >
                    {asset.trend === 'up' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Board Usage */}
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
              Board Usage
            </h2>
            <a href="/admin/manage/boards" style={{ fontSize: '13px', color: '#8C69F0', textDecoration: 'none' }}>
              Manage →
            </a>
          </div>
          <div style={{ padding: '20px' }}>
            {BOARD_USAGE.map((board, index) => {
              const maxViews = Math.max(...BOARD_USAGE.map((b) => b.views));
              const percentage = (board.views / maxViews) * 100;
              return (
                <div
                  key={board.name}
                  style={{
                    marginBottom: index < BOARD_USAGE.length - 1 ? '20px' : 0,
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                    <div className="flex items-center" style={{ gap: '10px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: board.color,
                        }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                        {board.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '13px', color: '#6B7280' }}>
                      {board.views.toLocaleString()} views
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
                        background: board.color,
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                    {board.assets} assets
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div
        style={{
          marginTop: '24px',
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
          Recent Activity
        </h2>
        <div style={{ color: '#6B7280', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>
          Activity tracking coming soon...
        </div>
      </div>
    </div>
  );
}
