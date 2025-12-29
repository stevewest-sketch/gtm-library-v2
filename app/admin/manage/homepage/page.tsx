'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Board {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  color: string;
}

interface HomepageConfig {
  id: string;
  hero: {
    title: string;
    subtitle: string;
    show: boolean;
    showHubCards: boolean;
    hubCardsOrder: string[];
  };
  featuredBoard: {
    enabled: boolean;
    boardId: string | null;
    maxItems: number;
    titleOverride: string | null;
    descriptionOverride: string | null;
    icon: string;
  };
  recentlyAdded: {
    enabled: boolean;
    maxItems: number;
    newThresholdDays: number;
  };
  updatedAt: string;
}

export default function HomepageSettingsPage() {
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Fetch config and boards on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/homepage');
        if (res.ok) {
          const data = await res.json();
          setConfig(data.config);
          setBoards(data.boards);
        }
      } catch (error) {
        console.error('Failed to fetch homepage config:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero: {
            title: config.hero.title,
            subtitle: config.hero.subtitle,
            show: config.hero.show,
            showHubCards: config.hero.showHubCards,
          },
          featuredBoard: {
            enabled: config.featuredBoard.enabled,
            boardId: config.featuredBoard.boardId,
            maxItems: config.featuredBoard.maxItems,
            titleOverride: config.featuredBoard.titleOverride,
            descriptionOverride: config.featuredBoard.descriptionOverride,
            icon: config.featuredBoard.icon,
          },
          recentlyAdded: {
            enabled: config.recentlyAdded.enabled,
            maxItems: config.recentlyAdded.maxItems,
            newThresholdDays: config.recentlyAdded.newThresholdDays,
          },
        }),
      });

      if (res.ok) {
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      setSaveMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #E5E7EB',
            borderTopColor: '#8C69F0',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }}
        />
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!config) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
        Failed to load homepage configuration
      </div>
    );
  }

  const selectedBoard = boards.find((b) => b.id === config.featuredBoard.boardId);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <Link
              href="/admin/manage"
              style={{
                color: '#6B7280',
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              Admin
            </Link>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <span style={{ fontSize: '14px', color: '#111827' }}>Homepage Settings</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
            Homepage Settings
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saving ? '#D1D5DB' : '#8C69F0',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            background: saveMessage.includes('success') ? '#DCFCE7' : '#FEE2E2',
            color: saveMessage.includes('success') ? '#166534' : '#991B1B',
            fontSize: '14px',
          }}
        >
          {saveMessage}
        </div>
      )}

      {/* Hero Section */}
      <section
        style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '20px' }}>
          Hero Section
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              Title
            </label>
            <input
              type="text"
              value={config.hero.title}
              onChange={(e) =>
                setConfig({
                  ...config,
                  hero: { ...config.hero, title: e.target.value },
                })
              }
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              Subtitle
            </label>
            <input
              type="text"
              value={config.hero.subtitle}
              onChange={(e) =>
                setConfig({
                  ...config,
                  hero: { ...config.hero, subtitle: e.target.value },
                })
              }
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={config.hero.showHubCards}
              onChange={(e) =>
                setConfig({
                  ...config,
                  hero: { ...config.hero, showHubCards: e.target.checked },
                })
              }
              style={{ width: '18px', height: '18px', accentColor: '#8C69F0' }}
            />
            Show Hub Cards (CoE, Content, Enablement)
          </label>
        </div>
      </section>

      {/* Featured Board Section */}
      <section
        style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '20px' }}>
          Featured Board Spotlight
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={config.featuredBoard.enabled}
              onChange={(e) =>
                setConfig({
                  ...config,
                  featuredBoard: { ...config.featuredBoard, enabled: e.target.checked },
                })
              }
              style={{ width: '18px', height: '18px', accentColor: '#8C69F0' }}
            />
            Enable Featured Board Section
          </label>

          {config.featuredBoard.enabled && (
            <>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  Select Board
                </label>
                <select
                  value={config.featuredBoard.boardId || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      featuredBoard: {
                        ...config.featuredBoard,
                        boardId: e.target.value || null,
                      },
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white',
                  }}
                >
                  <option value="">Select a board...</option>
                  {boards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.icon || '📁'} {board.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '16px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '6px',
                    }}
                  >
                    Icon
                  </label>
                  <input
                    type="text"
                    value={config.featuredBoard.icon}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        featuredBoard: { ...config.featuredBoard, icon: e.target.value },
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '20px',
                      textAlign: 'center',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '6px',
                    }}
                  >
                    Title Override (optional)
                  </label>
                  <input
                    type="text"
                    value={config.featuredBoard.titleOverride || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        featuredBoard: {
                          ...config.featuredBoard,
                          titleOverride: e.target.value || null,
                        },
                      })
                    }
                    placeholder={selectedBoard?.name || 'Board name'}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  Description Override (optional)
                </label>
                <input
                  type="text"
                  value={config.featuredBoard.descriptionOverride || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      featuredBoard: {
                        ...config.featuredBoard,
                        descriptionOverride: e.target.value || null,
                      },
                    })
                  }
                  placeholder="Short description for the spotlight section"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  Max Items to Display
                </label>
                <select
                  value={config.featuredBoard.maxItems}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      featuredBoard: {
                        ...config.featuredBoard,
                        maxItems: parseInt(e.target.value),
                      },
                    })
                  }
                  style={{
                    padding: '10px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white',
                  }}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Recently Added Section */}
      <section
        style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '20px' }}>
          Recently Added
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={config.recentlyAdded.enabled}
              onChange={(e) =>
                setConfig({
                  ...config,
                  recentlyAdded: { ...config.recentlyAdded, enabled: e.target.checked },
                })
              }
              style={{ width: '18px', height: '18px', accentColor: '#8C69F0' }}
            />
            Enable Recently Added Section
          </label>

          {config.recentlyAdded.enabled && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  Max Items
                </label>
                <select
                  value={config.recentlyAdded.maxItems}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      recentlyAdded: {
                        ...config.recentlyAdded,
                        maxItems: parseInt(e.target.value),
                      },
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white',
                  }}
                >
                  {[3, 4, 5, 6, 8, 10, 12].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  &quot;New&quot; Badge Threshold
                </label>
                <select
                  value={config.recentlyAdded.newThresholdDays}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      recentlyAdded: {
                        ...config.recentlyAdded,
                        newThresholdDays: parseInt(e.target.value),
                      },
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white',
                  }}
                >
                  {[1, 3, 5, 7, 14, 30].map((n) => (
                    <option key={n} value={n}>
                      {n} days
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
            Items newer than the threshold will show a green indicator dot.
          </p>
        </div>
      </section>

      {/* Preview Link */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Link
          href="/library"
          target="_blank"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#8C69F0',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Preview Homepage
        </Link>
      </div>
    </div>
  );
}
