import { NextRequest, NextResponse } from 'next/server';
import { db, catalogEntries, boards, tags } from '@/lib/db';
import { eq, ilike, or, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query.trim()) {
    return NextResponse.json({ boards: [], tags: [], assets: [] });
  }

  const searchPattern = `%${query}%`;

  try {
    // Search boards
    const boardResults = await db
      .select({
        id: boards.id,
        slug: boards.slug,
        name: boards.name,
        color: boards.color,
        icon: boards.icon,
      })
      .from(boards)
      .where(ilike(boards.name, searchPattern))
      .limit(5);

    // Search tags
    const tagResults = await db
      .select({
        id: tags.id,
        slug: tags.slug,
        name: tags.name,
      })
      .from(tags)
      .where(ilike(tags.name, searchPattern))
      .limit(8);

    // Search assets - search in title, description, and tags
    const assetResults = await db
      .select({
        id: catalogEntries.id,
        slug: catalogEntries.slug,
        title: catalogEntries.title,
        format: catalogEntries.format,
        hub: catalogEntries.hub,
        types: catalogEntries.types,
      })
      .from(catalogEntries)
      .where(
        or(
          ilike(catalogEntries.title, searchPattern),
          ilike(catalogEntries.description, searchPattern),
          ilike(catalogEntries.shortDescription, searchPattern),
          sql`EXISTS (SELECT 1 FROM unnest(${catalogEntries.tags}) AS t WHERE t ILIKE ${searchPattern})`
        )
      )
      .limit(10);

    // Format results
    const formattedBoards = boardResults.map((b) => ({
      type: 'board' as const,
      id: b.id,
      slug: b.slug,
      title: b.name,
      color: b.color,
      icon: b.icon,
    }));

    const formattedTags = tagResults.map((t) => ({
      type: 'tag' as const,
      id: t.id,
      slug: t.slug,
      title: t.name,
    }));

    const formatIcons: Record<string, string> = {
      slides: '📊',
      document: '📄',
      spreadsheet: '📋',
      pdf: '📕',
      video: '🎬',
      article: '📰',
      tool: '🛠️',
      guide: '📘',
      sequence: '📧',
      'live-replay': '🔴',
      'on-demand': '▶️',
      course: '🎓',
      'web-link': '🔗',
    };

    const formattedAssets = assetResults.map((a) => ({
      type: 'asset' as const,
      id: a.id,
      slug: a.slug,
      title: a.title,
      subtitle: a.types?.[0] || a.format,
      icon: formatIcons[a.format] || '📄',
    }));

    return NextResponse.json({
      boards: formattedBoards,
      tags: formattedTags,
      assets: formattedAssets,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', boards: [], tags: [], assets: [] },
      { status: 500 }
    );
  }
}
