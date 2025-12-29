import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { homepageConfig, boards } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET: Fetch full homepage config for admin editing
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

    // Get all boards for the dropdown
    const allBoards = await db
      .select({
        id: boards.id,
        slug: boards.slug,
        name: boards.name,
        icon: boards.icon,
        color: boards.color,
      })
      .from(boards)
      .orderBy(boards.sortOrder);

    return NextResponse.json({
      config: {
        id: config.id,
        hero: {
          title: config.heroTitle,
          subtitle: config.heroSubtitle,
          show: config.showHero,
          showHubCards: config.showHubCards,
          hubCardsOrder: config.hubCardsOrder,
        },
        featuredBoard: {
          enabled: config.featuredBoardEnabled,
          boardId: config.featuredBoardId,
          maxItems: config.featuredBoardMaxItems,
          titleOverride: config.featuredBoardTitleOverride,
          descriptionOverride: config.featuredBoardDescriptionOverride,
          icon: config.featuredBoardIcon,
        },
        recentlyAdded: {
          enabled: config.recentlyAddedEnabled,
          maxItems: config.recentlyAddedMaxItems,
          newThresholdDays: config.recentlyAddedNewThresholdDays,
        },
        updatedAt: config.updatedAt,
      },
      boards: allBoards,
    });
  } catch (error) {
    console.error('Error fetching homepage config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homepage config' },
      { status: 500 }
    );
  }
}

// PUT: Update homepage configuration
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Get existing config
    let [existingConfig] = await db.select().from(homepageConfig).limit(1);

    // If no config exists, create one first
    if (!existingConfig) {
      [existingConfig] = await db
        .insert(homepageConfig)
        .values({})
        .returning();
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Hero settings
    if (body.hero) {
      if (body.hero.title !== undefined) updateData.heroTitle = body.hero.title;
      if (body.hero.subtitle !== undefined) updateData.heroSubtitle = body.hero.subtitle;
      if (body.hero.show !== undefined) updateData.showHero = body.hero.show;
      if (body.hero.showHubCards !== undefined) updateData.showHubCards = body.hero.showHubCards;
      if (body.hero.hubCardsOrder !== undefined) updateData.hubCardsOrder = body.hero.hubCardsOrder;
    }

    // Featured board settings
    if (body.featuredBoard) {
      if (body.featuredBoard.enabled !== undefined) updateData.featuredBoardEnabled = body.featuredBoard.enabled;
      if (body.featuredBoard.boardId !== undefined) updateData.featuredBoardId = body.featuredBoard.boardId || null;
      if (body.featuredBoard.maxItems !== undefined) updateData.featuredBoardMaxItems = body.featuredBoard.maxItems;
      if (body.featuredBoard.titleOverride !== undefined) updateData.featuredBoardTitleOverride = body.featuredBoard.titleOverride || null;
      if (body.featuredBoard.descriptionOverride !== undefined) updateData.featuredBoardDescriptionOverride = body.featuredBoard.descriptionOverride || null;
      if (body.featuredBoard.icon !== undefined) updateData.featuredBoardIcon = body.featuredBoard.icon;
    }

    // Recently added settings
    if (body.recentlyAdded) {
      if (body.recentlyAdded.enabled !== undefined) updateData.recentlyAddedEnabled = body.recentlyAdded.enabled;
      if (body.recentlyAdded.maxItems !== undefined) updateData.recentlyAddedMaxItems = body.recentlyAdded.maxItems;
      if (body.recentlyAdded.newThresholdDays !== undefined) updateData.recentlyAddedNewThresholdDays = body.recentlyAdded.newThresholdDays;
    }

    // Update config
    const [updatedConfig] = await db
      .update(homepageConfig)
      .set(updateData)
      .where(eq(homepageConfig.id, existingConfig.id))
      .returning();

    return NextResponse.json({
      success: true,
      config: updatedConfig,
    });
  } catch (error) {
    console.error('Error updating homepage config:', error);
    return NextResponse.json(
      { error: 'Failed to update homepage config' },
      { status: 500 }
    );
  }
}
