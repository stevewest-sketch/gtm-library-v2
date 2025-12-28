import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { boards, tags, boardTags } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Board definitions from constants
const BOARDS_DATA = [
  {
    slug: 'coe',
    name: 'CoE',
    icon: '🏆',
    color: '#F59E0B',
    lightColor: '#FEF3C7',
    accentColor: '#B45309',
    sortOrder: 1,
    tags: ['BVA', 'EBR', 'QBR', 'Meeting Examples', 'Best Practices', 'Templates', 'Process'],
  },
  {
    slug: 'content',
    name: 'Content',
    icon: '📚',
    color: '#8C69F0',
    lightColor: '#EDE9FE',
    accentColor: '#6D28D9',
    sortOrder: 2,
    tags: ['Decks', 'One-pagers', 'Case Studies', 'Videos', 'Battlecards'],
  },
  {
    slug: 'enablement',
    name: 'Enablement',
    icon: '🎓',
    color: '#10B981',
    lightColor: '#D1FAE5',
    accentColor: '#047857',
    sortOrder: 3,
    tags: ['Training', 'Certifications', 'Onboarding', 'Learning Paths', 'Workshops'],
  },
  {
    slug: 'product',
    name: 'Product',
    icon: '📦',
    color: '#3B82F6',
    lightColor: '#DBEAFE',
    accentColor: '#1D4ED8',
    sortOrder: 4,
    tags: ['Release Notes', 'Roadmap', 'Feature Briefs', 'Technical Docs', 'API'],
  },
  {
    slug: 'competitive',
    name: 'Competitive',
    icon: '⚔️',
    color: '#EF4444',
    lightColor: '#FEE2E2',
    accentColor: '#B91C1C',
    sortOrder: 5,
    tags: ['Battlecards', 'Win/Loss', 'Competitor Analysis', 'Pricing'],
  },
  {
    slug: 'sales',
    name: 'Sales',
    icon: '💼',
    color: '#0EA5E9',
    lightColor: '#E0F2FE',
    accentColor: '#0369A1',
    sortOrder: 6,
    tags: ['Proposals', 'Discovery', 'Objection Handling', 'Pricing', 'Negotiation'],
  },
  {
    slug: 'csm',
    name: 'CSM',
    icon: '🎯',
    color: '#8B5CF6',
    lightColor: '#EDE9FE',
    accentColor: '#6D28D9',
    sortOrder: 7,
    tags: ['Onboarding', 'QBRs', 'Renewals', 'Expansion', 'Health Scores'],
  },
  {
    slug: 'sc',
    name: 'SC',
    icon: '🔧',
    color: '#EC4899',
    lightColor: '#FCE7F3',
    accentColor: '#BE185D',
    sortOrder: 8,
    tags: ['POC', 'Technical Demo', 'Integration', 'Security', 'Architecture'],
  },
  {
    slug: 'demo',
    name: 'Demo',
    icon: '🎬',
    color: '#06B6D4',
    lightColor: '#CFFAFE',
    accentColor: '#0E7490',
    sortOrder: 9,
    tags: ['Demo Scripts', 'Environments', 'Use Cases', 'Industry Demos'],
  },
  {
    slug: 'proof',
    name: 'Proof Points',
    icon: '📈',
    color: '#84CC16',
    lightColor: '#ECFCCB',
    accentColor: '#4D7C0F',
    sortOrder: 10,
    tags: ['Case Studies', 'ROI', 'Testimonials', 'References', 'Stats'],
  },
];

export async function POST() {
  try {
    const results = {
      boardsCreated: 0,
      boardsSkipped: 0,
      tagsCreated: 0,
      tagsSkipped: 0,
      boardTagsCreated: 0,
    };

    // Create all unique tags first
    const allTagNames = [...new Set(BOARDS_DATA.flatMap(b => b.tags))];

    for (const tagName of allTagNames) {
      const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      // Check if tag exists
      const [existingTag] = await db
        .select()
        .from(tags)
        .where(eq(tags.slug, tagSlug))
        .limit(1);

      if (!existingTag) {
        await db.insert(tags).values({
          name: tagName,
          slug: tagSlug,
        });
        results.tagsCreated++;
      } else {
        results.tagsSkipped++;
      }
    }

    // Create boards and board-tag associations
    for (const boardData of BOARDS_DATA) {
      // Check if board exists
      const [existingBoard] = await db
        .select()
        .from(boards)
        .where(eq(boards.slug, boardData.slug))
        .limit(1);

      let boardId: string;

      if (!existingBoard) {
        const [newBoard] = await db.insert(boards).values({
          slug: boardData.slug,
          name: boardData.name,
          icon: boardData.icon,
          color: boardData.color,
          lightColor: boardData.lightColor,
          accentColor: boardData.accentColor,
          sortOrder: boardData.sortOrder,
        }).returning();
        boardId = newBoard.id;
        results.boardsCreated++;
      } else {
        boardId = existingBoard.id;
        results.boardsSkipped++;
      }

      // Create board-tag associations
      for (let i = 0; i < boardData.tags.length; i++) {
        const tagName = boardData.tags[i];
        const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        // Get tag ID
        const [tag] = await db
          .select()
          .from(tags)
          .where(eq(tags.slug, tagSlug))
          .limit(1);

        if (tag) {
          // Check if association exists
          const existingAssoc = await db
            .select()
            .from(boardTags)
            .where(eq(boardTags.boardId, boardId))
            .limit(100);

          const hasAssoc = existingAssoc.some(a => a.tagId === tag.id);

          if (!hasAssoc) {
            await db.insert(boardTags).values({
              boardId,
              tagId: tag.id,
              sortOrder: i,
            });
            results.boardTagsCreated++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      results,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET to check current state
export async function GET() {
  try {
    const allBoards = await db.select().from(boards);
    const allTags = await db.select().from(tags);
    const allBoardTags = await db.select().from(boardTags);

    return NextResponse.json({
      boards: allBoards.length,
      tags: allTags.length,
      boardTags: allBoardTags.length,
      boardsList: allBoards,
      tagsList: allTags,
    });
  } catch (error) {
    console.error('Error fetching seed state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch state' },
      { status: 500 }
    );
  }
}
