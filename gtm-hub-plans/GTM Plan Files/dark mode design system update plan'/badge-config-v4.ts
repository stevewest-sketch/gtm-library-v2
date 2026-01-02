// badge-config.ts
// GTM Library Design System v4 - NEON EDITION
// ALL types have bright colors - NO GRAY TYPES

// ============================================
// THE 3 HUBS
// ============================================

export const HUB_COLORS = {
  content: {
    primary: '#8C69F0',
    bright: '#B794FF',    // BRIGHTER purple
    bg: 'rgba(140, 105, 240, 0.15)',
    border: 'rgba(140, 105, 240, 0.25)',
  },
  enablement: {
    primary: '#22C55E',
    bright: '#4ADE80',
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.25)',
  },
  coe: {
    primary: '#F59E0B',
    bright: '#FBBF24',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.25)',
  },
} as const;

export type HubKey = keyof typeof HUB_COLORS;

// ============================================
// NEON TYPE BADGE COLORS
// Maximum brightness - nearly full saturation
// NO GRAY - all types have vibrant colors
// ============================================

export const BADGE_COLORS = {
  // 🔴 NEON RED - Competitive
  red: {
    bg: 'rgba(255, 80, 80, 0.18)',
    text: '#FF5555',
    border: 'rgba(255, 80, 80, 0.30)',
  },
  // 🟠 NEON ORANGE - Calculators
  orange: {
    bg: 'rgba(255, 160, 0, 0.18)',
    text: '#FFA500',
    border: 'rgba(255, 160, 0, 0.30)',
  },
  // 🟡 NEON YELLOW - Templates/Proof
  yellow: {
    bg: 'rgba(255, 230, 0, 0.18)',
    text: '#FFE600',
    border: 'rgba(255, 230, 0, 0.30)',
  },
  // 🟢 NEON GREEN - Training (now includes Playbook)
  green: {
    bg: 'rgba(0, 255, 135, 0.18)',
    text: '#00FF87',
    border: 'rgba(0, 255, 135, 0.30)',
  },
  // 🔵 NEON BLUE - Demo/Reports/Guides
  blue: {
    bg: 'rgba(0, 170, 255, 0.18)',
    text: '#00AAFF',
    border: 'rgba(0, 170, 255, 0.30)',
  },
  // 🟣 NEON PURPLE - Decks/Presentations
  purple: {
    bg: 'rgba(180, 100, 255, 0.18)',
    text: '#B464FF',
    border: 'rgba(180, 100, 255, 0.30)',
  },
  // 🩷 NEON PINK - Messaging (now includes Article)
  pink: {
    bg: 'rgba(255, 80, 180, 0.18)',
    text: '#FF50B4',
    border: 'rgba(255, 80, 180, 0.30)',
  },
  // 🩵 NEON TEAL/CYAN - Tools/Technical
  teal: {
    bg: 'rgba(0, 255, 220, 0.18)',
    text: '#00FFDC',
    border: 'rgba(0, 255, 220, 0.30)',
  },
  // 💜 NEON VIOLET - Internal/Special
  violet: {
    bg: 'rgba(160, 80, 255, 0.18)',
    text: '#A050FF',
    border: 'rgba(160, 80, 255, 0.30)',
  },
} as const;

export type BadgeColorKey = keyof typeof BADGE_COLORS;

// ============================================
// TYPE → COLOR MAPPING
// NO GRAY TYPES - all have vibrant colors
// ============================================

export const TYPE_COLOR_MAP: Record<string, BadgeColorKey> = {
  // ─────────────────────────────────────────
  // 🔴 NEON RED — Competitive & High-Stakes
  // ─────────────────────────────────────────
  'battlecard': 'red',
  'competitive': 'red',
  'certification': 'red',
  'partner-training': 'red',
  'value-realization': 'red',
  // Competitor tags
  'zendesk': 'red',
  'intercom': 'red',
  'salesforce': 'red',
  'gorgias': 'red',
  'kustomer': 'red',
  'ada': 'red',
  'sierra': 'red',
  'genesys': 'red',
  'sprinklr': 'red',
  'netomi': 'red',
  'linc': 'red',
  'decagon': 'red',
  // Team tag
  'partner': 'red',

  // ─────────────────────────────────────────
  // 🟠 NEON ORANGE — Calculators & One-Pagers
  // ─────────────────────────────────────────
  'calculator': 'orange',
  'one-pager': 'orange',
  'impl': 'orange',
  'implementation': 'orange',

  // ─────────────────────────────────────────
  // 🟡 NEON YELLOW — Templates & Proof
  // ─────────────────────────────────────────
  'template': 'yellow',
  'case-study': 'yellow',
  'meeting-asset': 'yellow',
  'proof-point': 'yellow',
  'customer-quote': 'yellow',
  'benchmark': 'yellow',
  'industry-stat': 'yellow',
  'competitor-stat': 'yellow',

  // ─────────────────────────────────────────
  // 🟢 NEON GREEN — Training & Learning
  // NOW INCLUDES: playbook, course, customer-example
  // ─────────────────────────────────────────
  'gtm-training': 'green',
  'product-training': 'green',
  'technical-training': 'green',
  'competitive-training': 'green',
  'revops-training': 'green',
  'customer-example': 'green',
  'customer-success-metric': 'green',
  'course': 'green',
  'playbook': 'green',           // MOVED from gray
  'live-replay': 'green',
  'on-demand': 'green',
  // Team tags
  'csm': 'green',
  'customer-success': 'green',

  // ─────────────────────────────────────────
  // 🔵 NEON BLUE — Demo, Reports & Guides
  // NOW INCLUDES: guide, best-practice
  // ─────────────────────────────────────────
  'demo': 'blue',
  'demo-video': 'blue',
  'demo-asset': 'blue',
  'report': 'blue',
  'product-overview': 'blue',
  'dashboard': 'blue',
  'usage-metrics': 'blue',
  'guide': 'blue',               // MOVED from gray
  'best-practice': 'blue',
  'internal-best-practice': 'blue',
  'customer-best-practice': 'blue',
  // Product tags
  'voice': 'blue',
  'sidekick-voice': 'blue',
  'copilot': 'blue',
  'insights': 'blue',

  // ─────────────────────────────────────────
  // 🟣 NEON PURPLE — Decks & Presentations
  // ─────────────────────────────────────────
  'deck': 'purple',
  'keynote': 'purple',
  'slides': 'purple',
  // Product tags
  'gladly': 'purple',
  'gladly-team': 'purple',
  'gladly-sidekick': 'purple',
  'gladly-hero': 'purple',
  // Team tags
  'sales': 'purple',
  'ae': 'purple',

  // ─────────────────────────────────────────
  // 🩷 NEON PINK — Messaging & Communications
  // NOW INCLUDES: article, press
  // ─────────────────────────────────────────
  'messaging': 'pink',
  'sequence': 'pink',
  'article': 'pink',             // MOVED from gray
  'press': 'pink',               // MOVED from gray
  'promo': 'pink',
  'process-innovation': 'pink',
  // Team tags
  'mktg': 'pink',
  'marketing': 'pink',

  // ─────────────────────────────────────────
  // 🩵 NEON TEAL — Tools & Technical
  // NOW INCLUDES: document
  // ─────────────────────────────────────────
  'gtm-tool': 'teal',
  'tool': 'teal',
  'document': 'teal',            // MOVED from gray
  'prospect-example': 'teal',
  'prototype': 'teal',
  // Product tags
  'guides': 'teal',
  'journeys': 'teal',
  'app-platform': 'teal',
  'answer-threads': 'teal',
  // Team tags
  'sc': 'teal',
  'ps': 'teal',

  // ─────────────────────────────────────────
  // 💜 NEON VIOLET — Internal & Special
  // For internal-only content and web links
  // ─────────────────────────────────────────
  'internal': 'violet',          // MOVED from gray
  'web-link': 'violet',          // MOVED from gray
};

// ============================================
// FORMAT SLUGS
// ============================================

export const FORMAT_SLUGS = [
  'article', 'course', 'dashboard', 'demo-asset', 'document',
  'guide', 'live-replay', 'meeting-asset', 'on-demand', 'pdf',
  'playbook', 'proof-point', 'report', 'sequence', 'slides',
  'spreadsheet', 'tool', 'video', 'web-link',
] as const;

export type FormatSlug = typeof FORMAT_SLUGS[number];

// ============================================
// STATUS BADGE COLORS - NEON
// ============================================

export const STATUS_COLORS = {
  new: {
    bg: 'rgba(0, 255, 135, 0.20)',
    text: '#00FF87',
    border: 'rgba(0, 255, 135, 0.40)',
  },
  featured: {
    bg: 'rgba(255, 160, 0, 0.20)',
    text: '#FFA500',
    border: 'rgba(255, 160, 0, 0.40)',
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get type badge colors
 * Falls back to violet (not gray!) for unknown types
 */
export function getTypeBadgeColor(typeSlug: string) {
  const colorKey = TYPE_COLOR_MAP[typeSlug?.toLowerCase()] || 'violet';
  return BADGE_COLORS[colorKey];
}

/**
 * Get format badge colors (hub-colored)
 */
export function getFormatBadgeColor(hub: HubKey) {
  const hubColor = HUB_COLORS[hub] || HUB_COLORS.content;
  return {
    bg: hubColor.bg,
    text: hubColor.bright,
    border: hubColor.border,
  };
}

/**
 * Get hub colors for card styling
 */
export function getHubColors(hub: HubKey) {
  return HUB_COLORS[hub] || HUB_COLORS.content;
}

/**
 * Get status badge colors
 */
export function getStatusBadgeColor(status: 'new' | 'featured') {
  return STATUS_COLORS[status];
}

/**
 * Check if asset is "new" (created within last 14 days)
 */
export function isNew(createdAt: Date | string): boolean {
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const daysDiff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= 14;
}

/**
 * Get color key for a type
 */
export function getBadgeColorKey(typeSlug: string): BadgeColorKey {
  return TYPE_COLOR_MAP[typeSlug?.toLowerCase()] || 'violet';
}

/**
 * Check if a tag is a competitor
 */
export function isCompetitorTag(tag: string): boolean {
  const competitors = [
    'zendesk', 'intercom', 'salesforce', 'gorgias', 'kustomer',
    'ada', 'sierra', 'genesys', 'sprinklr', 'netomi', 'linc', 'decagon'
  ];
  return competitors.includes(tag.toLowerCase());
}

// ============================================
// NEON COLOR VALUES (for reference)
// ============================================

export const NEON_COLORS = {
  red: '#FF5555',
  orange: '#FFA500',
  yellow: '#FFE600',
  green: '#00FF87',
  blue: '#00AAFF',
  purple: '#B464FF',
  pink: '#FF50B4',
  teal: '#00FFDC',
  violet: '#A050FF',
} as const;
