// GTM Library Type Configuration
// Unified type system for all hubs

export interface TypeConfig {
  icon: string;
  color: string;
  bg: string;
  label: string;
}

// ============================================
// CONTENT HUB TYPES (10)
// ============================================
export const CONTENT_TYPES: Record<string, TypeConfig> = {
  'deck':        { icon: '📊', color: '#8C69F0', bg: '#EDE9FE', label: 'Deck' },
  'battlecard':  { icon: '⚔️', color: '#EF4444', bg: '#FEE2E2', label: 'Battlecard' },
  'one-pager':   { icon: '📄', color: '#F59E0B', bg: '#FEF3C7', label: 'One-Pager' },
  'template':    { icon: '📋', color: '#8B5CF6', bg: '#EDE9FE', label: 'Template' },
  'messaging':   { icon: '💬', color: '#EC4899', bg: '#FCE7F3', label: 'Messaging' },
  'calculator':  { icon: '🧮', color: '#06B6D4', bg: '#CFFAFE', label: 'Calculator' },
  'competitive': { icon: '📊', color: '#EF4444', bg: '#FEE2E2', label: 'Competitive' },
  'guide':       { icon: '📘', color: '#3B82F6', bg: '#DBEAFE', label: 'Guide' },
  'press':       { icon: '📰', color: '#64748B', bg: '#F1F5F9', label: 'Press' },
  'case-study':  { icon: '📈', color: '#059669', bg: '#D1FAE5', label: 'Case Study' },
};

// ============================================
// ENABLEMENT HUB TYPES (9)
// ============================================
export const ENABLEMENT_TYPES: Record<string, TypeConfig> = {
  'product-training':     { icon: '🎓', color: '#10B981', bg: '#D1FAE5', label: 'Product Training' },
  'technical-training':   { icon: '🔧', color: '#6366F1', bg: '#E0E7FF', label: 'Technical Training' },
  'gtm-training':         { icon: '🚀', color: '#8B5CF6', bg: '#EDE9FE', label: 'GTM Training' },
  'gtm-tool':             { icon: '🛠️', color: '#06B6D4', bg: '#CFFAFE', label: 'GTM Tool' },
  'competitive-training': { icon: '⚔️', color: '#EF4444', bg: '#FEE2E2', label: 'Competitive Training' },
  'certification':        { icon: '🏆', color: '#F59E0B', bg: '#FEF3C7', label: 'Certification' },
  'partner-training':     { icon: '🤝', color: '#3B82F6', bg: '#DBEAFE', label: 'Partner Training' },
  'value-realization':    { icon: '💰', color: '#059669', bg: '#D1FAE5', label: 'Value Realization' },
  'playbook':             { icon: '📕', color: '#EC4899', bg: '#FCE7F3', label: 'Playbook' },
};

// ============================================
// COE HUB TYPES (12)
// ============================================
export const COE_TYPES: Record<string, TypeConfig> = {
  'customer-meeting-asset':  { icon: '🤝', color: '#F59E0B', bg: '#FEF3C7', label: 'Customer Meeting' },
  'prospect-meeting-asset':  { icon: '🎯', color: '#F97316', bg: '#FFEDD5', label: 'Prospect Meeting' },
  'customer-best-practice':  { icon: '⭐', color: '#10B981', bg: '#D1FAE5', label: 'Customer BP' },
  'best-practice':           { icon: '✅', color: '#3B82F6', bg: '#DBEAFE', label: 'Best Practice' },
  'internal-best-practice':  { icon: '🏢', color: '#8B5CF6', bg: '#EDE9FE', label: 'Internal BP' },
  'process-innovation':      { icon: '💡', color: '#EC4899', bg: '#FCE7F3', label: 'Process Innovation' },
  'dashboard':               { icon: '📊', color: '#06B6D4', bg: '#CFFAFE', label: 'Dashboard' },
  'customer-success-metric': { icon: '📈', color: '#059669', bg: '#D1FAE5', label: 'Success Metric' },
  'industry-stat':           { icon: '🏭', color: '#6366F1', bg: '#E0E7FF', label: 'Industry Stat' },
  'benchmark':               { icon: '📏', color: '#0EA5E9', bg: '#E0F2FE', label: 'Benchmark' },
  'competitor-stat':         { icon: '📉', color: '#EF4444', bg: '#FEE2E2', label: 'Competitor Stat' },
  'customer-quote':          { icon: '💬', color: '#F59E0B', bg: '#FEF3C7', label: 'Customer Quote' },
};

// Combined lookup for all types
export const TYPE_CONFIG: Record<string, TypeConfig> = {
  ...CONTENT_TYPES,
  ...ENABLEMENT_TYPES,
  ...COE_TYPES,
};

// Hub colors for top border and action link
export const HUB_COLORS: Record<string, string> = {
  content:    '#8C69F0',
  enablement: '#10B981',
  coe:        '#F59E0B',
};

// Format display labels (no icons - just text)
export const FORMAT_LABELS: Record<string, string> = {
  'slides':       'Slides',
  'document':     'Doc',
  'spreadsheet':  'Spreadsheet',
  'pdf':          'PDF',
  'video':        'Video',
  'article':      'Article',
  'tool':         'Tool',
  'guide':        'Guide',
  'sequence':     'Sequence',
  'live-replay':  'Live Replay',
  'on-demand':    'On Demand',
  'course':       'Course',
  'web-link':     'Web Link',
  'proof-point':  'Proof Point',
};

// Get type options for a specific hub (for admin dropdowns)
export function getTypeOptionsForHub(hub: string): { value: string; label: string; icon: string }[] {
  const hubLower = hub.toLowerCase();

  let typeMap: Record<string, TypeConfig>;
  switch (hubLower) {
    case 'content':
      typeMap = CONTENT_TYPES;
      break;
    case 'enablement':
      typeMap = ENABLEMENT_TYPES;
      break;
    case 'coe':
      typeMap = COE_TYPES;
      break;
    default:
      typeMap = TYPE_CONFIG;
  }

  return Object.entries(typeMap).map(([value, config]) => ({
    value,
    label: config.label,
    icon: config.icon,
  }));
}

// Get type config with fallback
export function getTypeConfig(type: string | null | undefined): TypeConfig {
  if (!type) {
    return { icon: '📄', color: '#6B7280', bg: '#F3F4F6', label: 'General' };
  }
  return TYPE_CONFIG[type] || { icon: '📄', color: '#6B7280', bg: '#F3F4F6', label: type };
}

// Get hub color
export function getHubColor(hub: string | null | undefined): string {
  if (!hub) return HUB_COLORS.content;
  return HUB_COLORS[hub.toLowerCase()] || HUB_COLORS.content;
}

// Get format label
export function getFormatLabel(format: string | null | undefined): string {
  if (!format) return '';
  return FORMAT_LABELS[format] || format.charAt(0).toUpperCase() + format.slice(1).replace(/-/g, ' ');
}
