// Hub configuration with colors and metadata
export const HUBS = {
  coe: {
    id: 'coe',
    name: 'Center of Excellence',
    shortName: 'CoE',
    description: 'Best practices, templates, and internal resources',
    colors: {
      primary: '#F59E0B',
      light: '#FEF3C7',
      hover: '#FFFBEB',
      accent: '#B45309',
    },
  },
  content: {
    id: 'content',
    name: 'Content Library',
    shortName: 'Content',
    description: 'External-facing materials and customer resources',
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
    description: 'Training, certifications, and learning paths',
    colors: {
      primary: '#10B981',
      light: '#D1FAE5',
      hover: '#ECFDF5',
      accent: '#047857',
    },
  },
} as const;

export type HubId = keyof typeof HUBS;
export type Hub = (typeof HUBS)[HubId];

// Board definitions with colors, icons, and tags
export const BOARDS = {
  coe: {
    name: 'CoE',
    icon: '🏆',
    color: '#F59E0B',
    lightColor: '#FEF3C7',
    accentColor: '#B45309',
    count: 89,
    tags: ['BVA', 'EBR', 'QBR', 'Meeting Examples', 'Best Practices', 'Templates', 'Process'],
  },
  content: {
    name: 'Content',
    icon: '📚',
    color: '#8C69F0',
    lightColor: '#EDE9FE',
    accentColor: '#6D28D9',
    count: 127,
    tags: ['Decks', 'One-pagers', 'Case Studies', 'Videos', 'Battlecards'],
  },
  enablement: {
    name: 'Enablement',
    icon: '🎓',
    color: '#10B981',
    lightColor: '#D1FAE5',
    accentColor: '#047857',
    count: 143,
    tags: ['Training', 'Certifications', 'Onboarding', 'Learning Paths', 'Workshops'],
  },
  product: {
    name: 'Product',
    icon: '📦',
    color: '#3B82F6',
    lightColor: '#DBEAFE',
    accentColor: '#1D4ED8',
    count: 85,
    tags: ['Release Notes', 'Roadmap', 'Feature Briefs', 'Technical Docs', 'API'],
  },
  competitive: {
    name: 'Competitive',
    icon: '⚔️',
    color: '#EF4444',
    lightColor: '#FEE2E2',
    accentColor: '#B91C1C',
    count: 34,
    tags: ['Battlecards', 'Win/Loss', 'Competitor Analysis', 'Pricing'],
  },
  sales: {
    name: 'Sales',
    icon: '💼',
    color: '#0EA5E9',
    lightColor: '#E0F2FE',
    accentColor: '#0369A1',
    count: 156,
    tags: ['Proposals', 'Discovery', 'Objection Handling', 'Pricing', 'Negotiation'],
  },
  csm: {
    name: 'CSM',
    icon: '🎯',
    color: '#8B5CF6',
    lightColor: '#EDE9FE',
    accentColor: '#6D28D9',
    count: 78,
    tags: ['Onboarding', 'QBRs', 'Renewals', 'Expansion', 'Health Scores'],
  },
  sc: {
    name: 'SC',
    icon: '🔧',
    color: '#EC4899',
    lightColor: '#FCE7F3',
    accentColor: '#BE185D',
    count: 52,
    tags: ['POC', 'Technical Demo', 'Integration', 'Security', 'Architecture'],
  },
  demo: {
    name: 'Demo',
    icon: '🎬',
    color: '#06B6D4',
    lightColor: '#CFFAFE',
    accentColor: '#0E7490',
    count: 45,
    tags: ['Demo Scripts', 'Environments', 'Use Cases', 'Industry Demos'],
  },
  proof: {
    name: 'Proof Points',
    icon: '📈',
    color: '#84CC16',
    lightColor: '#ECFCCB',
    accentColor: '#4D7C0F',
    count: 67,
    tags: ['Case Studies', 'ROI', 'Testimonials', 'References', 'Stats'],
  },
} as const;

export type BoardId = keyof typeof BOARDS;
export type Board = (typeof BOARDS)[BoardId];

// Cross-filter categories
export const FILTER_GROUPS = {
  sales: {
    name: 'Sales',
    filters: ['Enterprise', 'Mid-Market', 'SMB', 'New Business', 'Expansion'],
  },
  caseStudies: {
    name: 'Case Studies',
    filters: ['Retail', 'DTC', 'Travel', 'Financial Services', 'Tech'],
  },
  competition: {
    name: 'Competition',
    filters: ['Zendesk', 'Freshdesk', 'Intercom', 'Salesforce', 'Kustomer'],
  },
  product: {
    name: 'Product',
    filters: ['Hero', 'Sidekick', 'People Match', 'Channels', 'Analytics'],
  },
  postSales: {
    name: 'Post-Sales',
    filters: ['Implementation', 'Adoption', 'Renewal', 'Churn Prevention'],
  },
} as const;

export type FilterGroupId = keyof typeof FILTER_GROUPS;

// Format definitions
export const FORMATS = {
  slides: { label: 'Slides', icon: 'presentation-chart-bar' },
  video: { label: 'Video', icon: 'play-circle' },
  document: { label: 'Document', icon: 'document-text' },
  pdf: { label: 'PDF', icon: 'document' },
  sheet: { label: 'Spreadsheet', icon: 'table-cells' },
  guide: { label: 'Guide', icon: 'book-open' },
  template: { label: 'Template', icon: 'document-duplicate' },
  battlecard: { label: 'Battle Card', icon: 'shield-check' },
  training: { label: 'Training', icon: 'academic-cap' },
  tool: { label: 'Tool', icon: 'wrench-screwdriver' },
  link: { label: 'Link', icon: 'link' },
} as const;

export type FormatId = keyof typeof FORMATS;

// Content types for categorization
export const CONTENT_TYPES = {
  'product-training': { label: 'Product Training', hub: 'enablement' },
  'competitive': { label: 'Competitive', hub: 'content' },
  'gtm-strategy': { label: 'GTM Strategy', hub: 'enablement' },
  'technical': { label: 'Technical', hub: 'enablement' },
  'partner': { label: 'Partner', hub: 'enablement' },
  'internal-ops': { label: 'Internal Ops', hub: 'enablement' },
  'meeting-asset': { label: 'Meeting Asset', hub: 'coe' },
  'tool': { label: 'Tool', hub: 'coe' },
  'internal-best-practice': { label: 'Best Practice', hub: 'coe' },
  'process-innovation': { label: 'Process Innovation', hub: 'coe' },
  'customer-facing': { label: 'Customer Facing', hub: 'content' },
  'sales-material': { label: 'Sales Material', hub: 'content' },
} as const;

export type ContentTypeId = keyof typeof CONTENT_TYPES;
