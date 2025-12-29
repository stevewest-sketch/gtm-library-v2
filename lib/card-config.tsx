// Card Design System v9 Configuration
// All 13 format icons with brand colors, type badge colors, and hub configurations

import type { ReactElement } from 'react';
import { ALL_TYPES } from './taxonomy';

// ============================================
// FORMAT ICONS - All 13 formats from taxonomy
// ============================================

export const FORMAT_ICONS: Record<string, {
  icon: (size?: number) => ReactElement;
  color: string;
  label: string;
}> = {
  slides: {
    label: 'Slides',
    color: '#FBBC04',
    icon: (size = 28) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="#FBBC04"/>
        <rect x="5" y="7" width="6" height="5" rx="1" fill="white"/>
        <rect x="13" y="7" width="6" height="5" rx="1" fill="white" opacity="0.6"/>
        <rect x="5" y="14" width="14" height="2" rx="1" fill="white" opacity="0.4"/>
      </svg>
    ),
  },
  document: {
    label: 'Doc',
    color: '#4285F4',
    icon: (size = 28) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="2" width="18" height="20" rx="2" fill="#4285F4"/>
        <path d="M7 7h10M7 11h10M7 15h7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  spreadsheet: {
    label: 'Spreadsheet',
    color: '#34A853',
    icon: (size = 28) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="2" width="18" height="20" rx="2" fill="#34A853"/>
        <path d="M7 6h10M7 10h10M7 14h10M7 18h10" stroke="white" strokeWidth="1.2"/>
        <path d="M12 6v12" stroke="white" strokeWidth="1.2"/>
      </svg>
    ),
  },
  pdf: {
    label: 'PDF',
    color: '#EA4335',
    icon: (size = 28) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M4 4a2 2 0 012-2h8l6 6v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" fill="#EA4335"/>
        <path d="M14 2v6h6" fill="#B31412"/>
        <text x="5" y="17" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial">PDF</text>
      </svg>
    ),
  },
  video: {
    label: 'Video',
    color: '#EA4335',
    icon: (size = 28) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="#EA4335"/>
        <path d="M10 8.5v7l6-3.5-6-3.5z" fill="white"/>
      </svg>
    ),
  },
  article: {
    label: 'Article',
    color: '#64748B',
    icon: (size = 28) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#64748B"/>
        <rect x="6" y="6" width="5" height="5" fill="white"/>
        <path d="M13 7h5M13 10h5M6 14h12M6 17h9" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  tool: {
    label: 'Tool',
    color: '#06B6D4',
    icon: (size = 28) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#06B6D4"/>
        <rect x="6" y="6" width="5" height="5" rx="1" fill="white"/>
        <rect x="13" y="6" width="5" height="3" rx="1" fill="white" opacity="0.7"/>
        <rect x="13" y="11" width="5" height="5" rx="1" fill="white" opacity="0.5"/>
        <rect x="6" y="13" width="5" height="3" rx="1" fill="white" opacity="0.7"/>
      </svg>
    ),
  },
  guide: {
    label: 'Guide',
    color: '#3B82F6',
    icon: (size = 28) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M4 4a2 2 0 012-2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" fill="#3B82F6"/>
        <path d="M8 2v20" stroke="#1D4ED8" strokeWidth="2"/>
        <path d="M11 7h6M11 11h6M11 15h4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  sequence: {
    label: 'Sequence',
    color: '#8B5CF6',
    icon: (size = 28) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="#8B5CF6"/>
        <path d="M2 6l10 7 10-7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 18l4-4M18 18l-4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  'live-replay': {
    label: 'Live Replay',
    color: '#DC2626',
    icon: (size = 28) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="#DC2626"/>
        <circle cx="12" cy="12" r="4" fill="white"/>
        <circle cx="12" cy="12" r="2" fill="#DC2626"/>
        <circle cx="18" cy="7" r="2" fill="#FCA5A5"/>
      </svg>
    ),
  },
  'on-demand': {
    label: 'On Demand',
    color: '#2563EB',
    icon: (size = 28) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="#2563EB"/>
        <path d="M10 8.5v7l6-3.5-6-3.5z" fill="white"/>
        <rect x="5" y="17" width="14" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
      </svg>
    ),
  },
  course: {
    label: 'Course',
    color: '#7C3AED',
    icon: (size = 28) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 3L2 8l10 5 10-5-10-5z" fill="#7C3AED"/>
        <path d="M6 10.5v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" stroke="#7C3AED" strokeWidth="2" fill="#A78BFA"/>
        <path d="M20 8v7" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="20" cy="16" r="1.5" fill="#7C3AED"/>
      </svg>
    ),
  },
  'web-link': {
    label: 'Web Link',
    color: '#6B7280',
    icon: (size = 28) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="1" y="1" width="22" height="22" rx="4" fill="#6B7280"/>
        <path d="M10 14a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5l-1 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 10a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
};

// Alias mappings for format variations
export const FORMAT_ALIASES: Record<string, string> = {
  sheet: 'spreadsheet',
  link: 'web-link',
  weblink: 'web-link',
  livereplay: 'live-replay',
  ondemand: 'on-demand',
  training: 'course',
};

// ============================================
// TYPE BADGE COLORS - Dynamically generated from taxonomy
// ============================================

// Generate TYPE_BADGE_COLORS directly from taxonomy
// This ensures new types added to taxonomy.ts automatically get badge colors
export const TYPE_BADGE_COLORS: Record<string, { bg: string; color: string; label: string }> =
  Object.fromEntries(
    Object.entries(ALL_TYPES).map(([key, value]) => [
      key,
      { bg: value.bg, color: value.color, label: value.label }
    ])
  );

// Default type badge for unknown types
export const DEFAULT_TYPE_BADGE = { bg: '#F3F4F6', color: '#6B7280', label: 'Resource' };

// ============================================
// HUB CONFIGURATION
// ============================================

export const HUB_COLORS: Record<string, {
  primary: string;
  light: string;
  accent: string;
}> = {
  content: { primary: '#8C69F0', light: '#EDE9FE', accent: '#6D28D9' },
  enablement: { primary: '#10B981', light: '#D1FAE5', accent: '#047857' },
  coe: { primary: '#F59E0B', light: '#FEF3C7', accent: '#B45309' },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getFormatConfig(format: string) {
  const normalizedFormat = format.toLowerCase().replace(/\s+/g, '-');
  const aliased = FORMAT_ALIASES[normalizedFormat] || normalizedFormat;
  return FORMAT_ICONS[aliased] || FORMAT_ICONS.document;
}

export function getTypeBadge(type: string) {
  const normalizedType = type.toLowerCase().replace(/\s+/g, '-');
  const found = TYPE_BADGE_COLORS[normalizedType];
  if (found) return found;

  // Fallback: generate badge with the type name formatted nicely
  const formattedLabel = type
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return { ...DEFAULT_TYPE_BADGE, label: formattedLabel };
}

export function getHubColors(hub: string) {
  return HUB_COLORS[hub.toLowerCase()] || HUB_COLORS.content;
}
