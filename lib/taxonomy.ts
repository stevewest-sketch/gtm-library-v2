/**
 * GTM Library Content Taxonomy Framework
 *
 * NOTE: This file provides DEFAULT badge colors for card display only.
 * The DATABASE (managed via /admin/manage/taxonomy) is the single source of truth
 * for all dropdown options in asset management.
 *
 * - Dropdowns: Populated from database (content_types & formats tables)
 * - Card badges: Use colors from this file, with fallback for unknown types
 *
 * To add a new type or format:
 * 1. Add it via the Taxonomy Manager (/admin/manage/taxonomy)
 * 2. Optionally add badge colors here for custom styling
 *
 * All assets are classified by:
 * - HUB: Organizational home (Content, Enablement, CoE)
 * - FORMAT: Physical file/delivery type
 * - TYPE: Semantic category (purpose)
 * - TAGS: Freeform tags for filtering
 */

// =============================================================================
// FORMATS - Physical file/delivery type (13 standard values)
// =============================================================================

export const FORMATS = {
  slides: {
    icon: '📊',
    label: 'Slides',
    description: 'Presentation decks',
    fileTypes: ['Google Slides', 'PowerPoint'],
  },
  document: {
    icon: '📄',
    label: 'Document',
    description: 'Text documents',
    fileTypes: ['Google Docs', 'Word'],
  },
  spreadsheet: {
    icon: '📈',
    label: 'Spreadsheet',
    description: 'Tabular data',
    fileTypes: ['Google Sheets', 'Excel'],
  },
  pdf: {
    icon: '📕',
    label: 'PDF',
    description: 'PDF documents',
    fileTypes: ['.pdf files'],
  },
  video: {
    icon: '🎬',
    label: 'Video',
    description: 'Video recordings',
    fileTypes: ['Wistia', 'Loom', 'YouTube'],
  },
  article: {
    icon: '📰',
    label: 'Article',
    description: 'External articles',
    fileTypes: ['Web articles', 'PR'],
  },
  tool: {
    icon: '🛠️',
    label: 'Tool',
    description: 'Interactive tools',
    fileTypes: ['Calculator', 'dashboard', 'Figma'],
  },
  guide: {
    icon: '📖',
    label: 'Guide',
    description: 'How-to guides',
    fileTypes: ['Step-by-step docs'],
  },
  sequence: {
    icon: '📧',
    label: 'Sequence',
    description: 'Email sequences',
    fileTypes: ['Outreach.io'],
  },
  'live-replay': {
    icon: '🔴',
    label: 'Live Replay',
    description: 'Live session recordings',
    fileTypes: ['Gong', 'Zoom recordings'],
  },
  'on-demand': {
    icon: '▶️',
    label: 'On Demand',
    description: 'Pre-recorded content',
    fileTypes: ['Training videos'],
  },
  course: {
    icon: '🎓',
    label: 'Course',
    description: 'Multi-module learning',
    fileTypes: ['Google Classroom', 'LMS'],
  },
  'web-link': {
    icon: '🔗',
    label: 'Web Link',
    description: 'External web pages',
    fileTypes: ['External URLs', 'web apps'],
  },
} as const;

export type FormatId = keyof typeof FORMATS;

// =============================================================================
// TYPES - Semantic category by hub
// =============================================================================

// =============================================================================
// ALL TYPES - Universal types available across all hubs
// Organized alphabetically for easy reference
// =============================================================================

export const ALL_TYPES = {
  // A
  battlecard: {
    label: 'Battlecard',
    description: 'Competitive battle cards',
    icon: '⚔️',
    color: '#EF4444',
    bg: '#FEE2E2',
  },
  benchmark: {
    label: 'Benchmark',
    description: 'Performance benchmarks and comparisons',
    icon: '📏',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  'best-practice': {
    label: 'Best Practice',
    description: 'Documented best practices',
    icon: '✨',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  // C
  calculator: {
    label: 'Calculator',
    description: 'ROI/pricing calculators',
    icon: '🧮',
    color: '#06B6D4',
    bg: '#CFFAFE',
  },
  'case-study': {
    label: 'Case Study',
    description: 'Customer case studies',
    icon: '📈',
    color: '#10B981',
    bg: '#D1FAE5',
  },
  certification: {
    label: 'Certification',
    description: 'Certification programs',
    icon: '🏅',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  competitive: {
    label: 'Competitive',
    description: 'Competitive analysis',
    icon: '📊',
    color: '#EF4444',
    bg: '#FEE2E2',
  },
  'competitive-training': {
    label: 'Competitive Training',
    description: 'Competitive training',
    icon: '⚔️',
    color: '#EF4444',
    bg: '#FEE2E2',
  },
  'competitor-stat': {
    label: 'Competitor Stat',
    description: 'Competitive statistics and data',
    icon: '⚔️',
    color: '#EF4444',
    bg: '#FEE2E2',
  },
  'customer-best-practice': {
    label: 'Customer Best Practice',
    description: 'Customer best practices',
    icon: '⭐',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  'customer-meeting-asset': {
    label: 'Customer Meeting Asset',
    description: 'Real customer meeting examples',
    icon: '🎯',
    color: '#10B981',
    bg: '#D1FAE5',
  },
  'customer-quote': {
    label: 'Customer Quote',
    description: 'Customer testimonials and quotes',
    icon: '💬',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  'customer-success-metric': {
    label: 'Customer Success Metric',
    description: 'Customer success metrics and KPIs',
    icon: '📊',
    color: '#10B981',
    bg: '#D1FAE5',
  },
  // D
  dashboard: {
    label: 'Dashboard',
    description: 'Performance dashboards',
    icon: '📊',
    color: '#3B82F6',
    bg: '#DBEAFE',
  },
  deck: {
    label: 'Deck',
    description: 'Meeting presentation decks',
    icon: '📊',
    color: '#8C69F0',
    bg: '#EDE9FE',
  },
  demo: {
    label: 'Demo',
    description: 'Product demonstrations',
    icon: '🎬',
    color: '#3B82F6',
    bg: '#DBEAFE',
  },
  // G
  guide: {
    label: 'Guide',
    description: 'Process/how-to guide',
    icon: '📘',
    color: '#3B82F6',
    bg: '#DBEAFE',
  },
  'gtm-tool': {
    label: 'GTM Tool',
    description: 'GTM tools and resources',
    icon: '🛠️',
    color: '#06B6D4',
    bg: '#CFFAFE',
  },
  'gtm-training': {
    label: 'GTM Training',
    description: 'GTM and sales strategy training',
    icon: '🚀',
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
  // I
  'industry-stat': {
    label: 'Industry Stat',
    description: 'Industry statistics and research',
    icon: '📈',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  internal: {
    label: 'Internal',
    description: 'Internal resources and documentation',
    icon: '🏢',
    color: '#6366F1',
    bg: '#E0E7FF',
  },
  'internal-best-practice': {
    label: 'Internal Best Practice',
    description: 'Internal process examples',
    icon: '🏢',
    color: '#3B82F6',
    bg: '#DBEAFE',
  },
  // K
  keynote: {
    label: 'Keynote',
    description: 'Keynote presentations',
    icon: '🎤',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  // M
  'meeting-asset': {
    label: 'Meeting Asset',
    description: 'Meeting examples and resources',
    icon: '🎯',
    color: '#14B8A6',
    bg: '#CCFBF1',
  },
  messaging: {
    label: 'Messaging',
    description: 'Positioning/messaging docs',
    icon: '💬',
    color: '#EC4899',
    bg: '#FCE7F3',
  },
  // O
  'one-pager': {
    label: 'One-Pager',
    description: 'Single-page overviews',
    icon: '📄',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  // P
  'partner-training': {
    label: 'Partner Training',
    description: 'Partner training',
    icon: '🤝',
    color: '#D97706',
    bg: '#FEF3C7',
  },
  playbook: {
    label: 'Playbook',
    description: 'Playbook walkthroughs',
    icon: '📚',
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
  press: {
    label: 'Press',
    description: 'PR/media coverage',
    icon: '📰',
    color: '#64748B',
    bg: '#F1F5F9',
  },
  'process-innovation': {
    label: 'Process Innovation',
    description: 'New process innovations',
    icon: '💡',
    color: '#06B6D4',
    bg: '#CFFAFE',
  },
  'product-overview': {
    label: 'Product Overview',
    description: 'Product overview materials',
    icon: '📦',
    color: '#2563EB',
    bg: '#DBEAFE',
  },
  'product-training': {
    label: 'Product Training',
    description: 'Product-focused training',
    icon: '📦',
    color: '#10B981',
    bg: '#D1FAE5',
  },
  promo: {
    label: 'Promo',
    description: 'Promotional materials',
    icon: '📣',
    color: '#DB2777',
    bg: '#FCE7F3',
  },
  // R
  report: {
    label: 'Report',
    description: 'Reports and analysis documents',
    icon: '📊',
    color: '#3B82F6',
    bg: '#DBEAFE',
  },
  'proof-point': {
    label: 'Proof Point',
    description: 'Customer proof points/metrics',
    icon: '📈',
    color: '#10B981',
    bg: '#D1FAE5',
  },
  'prospect-meeting-asset': {
    label: 'Prospect Meeting Asset',
    description: 'Real prospect meeting examples',
    icon: '🎯',
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
  // T
  'technical-training': {
    label: 'Technical Training',
    description: 'Technical deep dives',
    icon: '🔧',
    color: '#2563EB',
    bg: '#DBEAFE',
  },
  template: {
    label: 'Template',
    description: 'Reusable templates',
    icon: '📋',
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
  tool: {
    label: 'Tool',
    description: 'Interactive tools and utilities',
    icon: '🛠️',
    color: '#06B6D4',
    bg: '#CFFAFE',
  },
  // V
  'value-realization': {
    label: 'Value Realization',
    description: 'BVA/value training',
    icon: '💎',
    color: '#0891B2',
    bg: '#CFFAFE',
  },
} as const;

export type TypeId = keyof typeof ALL_TYPES;

// Legacy exports for backwards compatibility (all point to ALL_TYPES now)
export const CONTENT_TYPES = ALL_TYPES;
export const ENABLEMENT_TYPES = ALL_TYPES;
export const COE_TYPES = ALL_TYPES;
export type ContentTypeId = TypeId;
export type EnablementTypeId = TypeId;
export type CoeTypeId = TypeId;

// =============================================================================
// PRODUCT TAGS - For the Product board
// =============================================================================

export const PRODUCT_TAGS = {
  gladly: { label: 'Gladly', description: 'Core Gladly platform' },
  'gladly-team': { label: 'Gladly Team', description: 'Team collaboration features' },
  voice: { label: 'Voice', description: 'Voice/phone channel' },
  guides: { label: 'Guides', description: 'Guided experiences' },
  journeys: { label: 'Journeys', description: 'Customer journeys' },
  'app-platform': { label: 'App Platform', description: 'App marketplace & integrations' },
  copilot: { label: 'Copilot', description: 'AI Copilot assistant' },
  insights: { label: 'Insights', description: 'Analytics & insights' },
} as const;

export type ProductTagId = keyof typeof PRODUCT_TAGS;

// =============================================================================
// TEAM TAGS
// =============================================================================

export const TEAM_TAGS = {
  sales: { label: 'Sales', description: 'Sales team' },
  ae: { label: 'AE', description: 'Account Executive' },
  csm: { label: 'CSM', description: 'Customer Success' },
  sc: { label: 'SC', description: 'Solutions Consultant' },
  ps: { label: 'PS', description: 'Professional Services' },
  impl: { label: 'Implementation', description: 'Implementation team' },
  mktg: { label: 'Marketing', description: 'Marketing team' },
  partner: { label: 'Partners', description: 'Partner team' },
} as const;

export type TeamTagId = keyof typeof TEAM_TAGS;

// =============================================================================
// DISPLAY NAME FORMATTING
// =============================================================================

// Special case mappings for display names
const SPECIAL_DISPLAY_NAMES: Record<string, string> = {
  'gtm-training': 'GTM Training',
  'gtm-tool': 'GTM Tool',
  'gtm-strategy': 'GTM Strategy',
  'one-pager': 'One-Pager',
  'bva': 'BVA',
  'roi': 'ROI',
  'csm': 'CSM',
  'ae': 'AE',
  'sc': 'SC',
  'ps': 'PS',
  'coe': 'CoE',
  'api': 'API',
  'poc': 'POC',
  'qbr': 'QBR',
  'ebr': 'EBR',
  'act': 'ACT',
  'dtc': 'DTC',
  'ai': 'AI',
};

/**
 * Convert a slug value to a proper display name
 * Handles special cases like GTM, BVA, CSM, etc.
 */
export function formatDisplayName(value: string | null | undefined): string {
  if (!value) return '';

  const lower = value.toLowerCase();

  // Check special cases first
  if (SPECIAL_DISPLAY_NAMES[lower]) {
    return SPECIAL_DISPLAY_NAMES[lower];
  }

  // Standard conversion: 'product-training' → 'Product Training'
  return value
    .split('-')
    .map(word => {
      // Check if whole word is a special case
      if (SPECIAL_DISPLAY_NAMES[word.toLowerCase()]) {
        return SPECIAL_DISPLAY_NAMES[word.toLowerCase()];
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

// =============================================================================
// TYPE/FORMAT GETTERS
// =============================================================================

/**
 * Get format configuration by format ID
 */
export function getFormat(formatId: string | null | undefined) {
  if (!formatId) return null;
  const lower = formatId.toLowerCase();
  return FORMATS[lower as FormatId] || null;
}

/**
 * Get type configuration by type ID
 */
export function getType(typeId: string | null | undefined) {
  if (!typeId) return null;
  const lower = typeId.toLowerCase();
  return ALL_TYPES[lower as TypeId] || null;
}

/**
 * Get the appropriate badge config for a card based on hub
 * Content shows FORMAT badge, Enablement/CoE show TYPE badge
 */
export function getCardBadge(hub: string, format: string | null, type: string | null) {
  const hubLower = hub?.toLowerCase() || '';

  if (hubLower === 'content') {
    // Content hub shows FORMAT badge
    const formatConfig = getFormat(format);
    if (formatConfig) {
      return {
        icon: formatConfig.icon,
        label: formatConfig.label,
        color: '#8C69F0', // Content purple
        bg: '#EDE9FE',
      };
    }
  } else {
    // Enablement and CoE show TYPE badge
    const typeConfig = getType(type);
    if (typeConfig) {
      return {
        icon: typeConfig.icon,
        label: typeConfig.label,
        color: typeConfig.color,
        bg: typeConfig.bg,
      };
    }
  }

  // Default fallback
  return {
    icon: '📄',
    label: formatDisplayName(format || type || 'Resource'),
    color: '#6B7280',
    bg: '#F3F4F6',
  };
}

// =============================================================================
// HUB CONFIGURATIONS
// =============================================================================

export const HUB_CONFIG = {
  content: {
    id: 'content',
    name: 'Content Library',
    shortName: 'Content',
    description: 'External-facing materials for prospects/customers',
    badgeType: 'format' as const, // Shows FORMAT badge
    colors: {
      primary: '#8C69F0',
      light: '#EDE9FE',
      hover: '#F5F3FF',
      accent: '#6D28D9',
    },
  },
  enablement: {
    id: 'enablement',
    name: 'Enablement Hub',
    shortName: 'Enablement',
    description: 'Training & learning for internal teams',
    badgeType: 'type' as const, // Shows TYPE badge
    colors: {
      primary: '#10B981',
      light: '#D1FAE5',
      hover: '#ECFDF5',
      accent: '#047857',
    },
  },
  coe: {
    id: 'coe',
    name: 'Center of Excellence',
    shortName: 'CoE',
    description: 'Best practices, processes, tools, methodologies',
    badgeType: 'type' as const, // Shows TYPE badge
    colors: {
      primary: '#F59E0B',
      light: '#FEF3C7',
      hover: '#FFFBEB',
      accent: '#B45309',
    },
  },
} as const;

export type HubId = keyof typeof HUB_CONFIG;

/**
 * Get hub configuration by hub ID
 */
export function getHub(hubId: string | null | undefined) {
  if (!hubId) return null;
  const lower = hubId.toLowerCase();
  return HUB_CONFIG[lower as HubId] || null;
}
