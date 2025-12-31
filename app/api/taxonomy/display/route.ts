import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contentTypes, formats } from '@/lib/db/schema';

// Cache the taxonomy display data
let cachedData: {
  types: Record<string, { label: string; color: string; bg: string; icon?: string }>;
  formats: Record<string, { label: string; color: string; iconType: string }>;
} | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache

// Export function to invalidate cache (called from admin APIs)
export function invalidateTaxonomyCache() {
  cachedData = null;
  cacheTime = 0;
}

export async function GET(request: NextRequest) {
  try {
    // Check for cache bypass parameter (used after admin updates)
    const { searchParams } = new URL(request.url);
    const bypassCache = searchParams.get('refresh') === 'true';

    // Return cached data if fresh and not bypassing
    if (!bypassCache && cachedData && Date.now() - cacheTime < CACHE_TTL) {
      return NextResponse.json(cachedData);
    }

    // Fetch all content types from database
    const dbTypes = await db.select().from(contentTypes);

    // Fetch all formats from database
    const dbFormats = await db.select().from(formats);

    // Transform to lookup objects
    const types: Record<string, { label: string; color: string; bg: string; icon?: string }> = {};
    for (const t of dbTypes) {
      types[t.slug] = {
        label: t.name,
        color: t.textColor,
        bg: t.bgColor,
        icon: t.icon || undefined,
      };
    }

    const formatsMap: Record<string, { label: string; color: string; iconType: string }> = {};
    for (const f of dbFormats) {
      formatsMap[f.slug] = {
        label: f.name,
        color: f.color,
        iconType: f.iconType,
      };
    }

    // Update cache
    cachedData = { types, formats: formatsMap };
    cacheTime = Date.now();

    return NextResponse.json(cachedData);
  } catch (error) {
    console.error('Failed to fetch taxonomy display data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch taxonomy display data' },
      { status: 500 }
    );
  }
}

// POST to invalidate cache (called after admin creates/updates/deletes)
export async function POST() {
  invalidateTaxonomyCache();
  return NextResponse.json({ success: true, message: 'Cache invalidated' });
}
