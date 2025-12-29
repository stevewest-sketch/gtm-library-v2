import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { homepageConfig, boards, catalogEntries, assetBoards } from '@/lib/db/schema';
import { eq, desc, count, sql } from 'drizzle-orm';

// GET: Fetch homepage data for public display
export async function GET() {
  try {
    // Get or create config
    let [config] = await db.select().from(homepageConfig).limit(1);

    // If no config exists, create default
    if (!config) {
      [config] = await db
        .insert(homepageConfig)
        .values({})
        .returning();
    }

    // Build response
    const response: {
      hero: {
        title: string;
        subtitle: string;
        show: boolean;
        showHubCards: boolean;
        hubCardsOrder: string[];
      };
      featuredBoard: {
        id: string;
        slug: string;
        title: string;
        description: string;
        icon: string;
        color: string;
        resourceCount: number;
        lastUpdated: string | null;
        items: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          shortDescription: string | null;
          hub: string;
          format: string;
          type: string | null;
          createdAt: string | null;
          primaryLink: string;
        }[];
      } | null;
      recentlyAdded: {
        enabled: boolean;
        newThresholdDays: number;
        items: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          shortDescription: string | null;
          hub: string;
          format: string;
          type: string | null;
          createdAt: string | null;
          primaryLink: string;
        }[];
      };
    } = {
      hero: {
        title: config.heroTitle,
        subtitle: config.heroSubtitle,
        show: config.showHero ?? true,
        showHubCards: config.showHubCards ?? true,
        hubCardsOrder: (config.hubCardsOrder as string[]) || ['coe', 'content', 'enablement'],
      },
      featuredBoard: null,
      recentlyAdded: {
        enabled: config.recentlyAddedEnabled ?? true,
        newThresholdDays: config.recentlyAddedNewThresholdDays ?? 7,
        items: [],
      },
    };

    // Get featured board if enabled
    if (config.featuredBoardEnabled && config.featuredBoardId) {
      const [board] = await db
        .select()
        .from(boards)
        .where(eq(boards.id, config.featuredBoardId))
        .limit(1);

      if (board) {
        // Get asset count for this board
        const [countResult] = await db
          .select({ count: count() })
          .from(assetBoards)
          .where(eq(assetBoards.boardId, board.id));

        // Get board's assets
        const boardAssets = await db
          .select({
            id: catalogEntries.id,
            slug: catalogEntries.slug,
            title: catalogEntries.title,
            description: catalogEntries.description,
            shortDescription: catalogEntries.shortDescription,
            hub: catalogEntries.hub,
            format: catalogEntries.format,
            types: catalogEntries.types,
            createdAt: catalogEntries.createdAt,
            updatedAt: catalogEntries.updatedAt,
            primaryLink: catalogEntries.primaryLink,
          })
          .from(catalogEntries)
          .innerJoin(assetBoards, eq(catalogEntries.id, assetBoards.assetId))
          .where(eq(assetBoards.boardId, board.id))
          .orderBy(desc(catalogEntries.updatedAt))
          .limit(config.featuredBoardMaxItems ?? 3);

        response.featuredBoard = {
          id: board.id,
          slug: board.slug,
          title: config.featuredBoardTitleOverride || board.name,
          description: config.featuredBoardDescriptionOverride || '',
          icon: config.featuredBoardIcon || '🎯',
          color: board.color,
          resourceCount: countResult?.count || 0,
          lastUpdated: boardAssets[0]?.updatedAt?.toISOString() || null,
          items: boardAssets.map((a) => ({
            id: a.id,
            slug: a.slug,
            title: a.title,
            description: a.description,
            shortDescription: a.shortDescription,
            hub: a.hub,
            format: a.format,
            type: a.types?.[0] || null,
            createdAt: a.createdAt?.toISOString() || null,
            primaryLink: a.primaryLink,
          })),
        };
      }
    }

    // Get recently added items
    if (config.recentlyAddedEnabled) {
      const recentItems = await db
        .select({
          id: catalogEntries.id,
          slug: catalogEntries.slug,
          title: catalogEntries.title,
          description: catalogEntries.description,
          shortDescription: catalogEntries.shortDescription,
          hub: catalogEntries.hub,
          format: catalogEntries.format,
          types: catalogEntries.types,
          createdAt: catalogEntries.createdAt,
          primaryLink: catalogEntries.primaryLink,
        })
        .from(catalogEntries)
        .where(eq(catalogEntries.status, 'published'))
        .orderBy(desc(catalogEntries.createdAt))
        .limit(config.recentlyAddedMaxItems ?? 6);

      response.recentlyAdded.items = recentItems.map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        description: a.description,
        shortDescription: a.shortDescription,
        hub: a.hub,
        format: a.format,
        type: a.types?.[0] || null,
        createdAt: a.createdAt?.toISOString() || null,
        primaryLink: a.primaryLink,
      }));
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homepage data' },
      { status: 500 }
    );
  }
}
