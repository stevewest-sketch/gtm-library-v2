import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { boards, tags, boardTags } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface ImportResult {
  success: boolean;
  row: number;
  slug: string;
  name: string;
  error?: string;
  created?: boolean;
  updated?: boolean;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const skipDuplicates = formData.get('skipDuplicates') === 'true';
    const updateDuplicates = formData.get('updateDuplicates') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const cleanText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleanText.split('\n')
      .map(line => line.replace(/\\+$/, '').trim())
      .filter(line => line.length > 0);

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have header and at least one data row' }, { status: 400 });
    }

    // Parse header
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const colMap: Record<string, number> = {};
    const expectedCols = ['name', 'slug', 'icon', 'color', 'lightcolor', 'accentcolor', 'sortorder', 'tags'];

    headers.forEach((h, i) => {
      if (expectedCols.includes(h)) {
        colMap[h] = i;
      }
    });

    if (colMap['name'] === undefined) {
      return NextResponse.json({
        error: 'CSV must have a name column',
        foundHeaders: headers
      }, { status: 400 });
    }

    // Get existing boards and tags
    const existingBoards = await db.select().from(boards);
    const existingBoardsBySlug = new Map(existingBoards.map(b => [b.slug, b]));

    const existingTags = await db.select().from(tags);
    const tagsBySlug = new Map(existingTags.map(t => [t.slug, t]));
    const tagsByName = new Map(existingTags.map(t => [t.name.toLowerCase(), t]));

    const results: ImportResult[] = [];

    // Process rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = parseCSVLine(line);
      const getValue = (col: string): string => {
        const idx = colMap[col];
        return idx !== undefined ? (values[idx] || '').trim() : '';
      };

      const name = getValue('name');
      if (!name) continue;

      let slug = getValue('slug');
      if (!slug) {
        slug = generateSlug(name);
      }

      const icon = getValue('icon') || '📋';
      const color = getValue('color') || '#8C69F0';
      const lightColor = getValue('lightcolor') || '#EDE9FE';
      const accentColor = getValue('accentcolor') || '#6D28D9';
      const sortOrder = parseInt(getValue('sortorder')) || 0;
      const tagSlugs = getValue('tags')?.split('|').map(t => t.trim()).filter(t => t) || [];

      // Check if board exists
      const existing = existingBoardsBySlug.get(slug);

      try {
        if (existing) {
          if (updateDuplicates) {
            // Update existing board
            await db.update(boards)
              .set({
                name,
                icon,
                color,
                lightColor,
                accentColor,
                sortOrder,
                updatedAt: new Date(),
              })
              .where(eq(boards.id, existing.id));

            // Update tag associations
            // First delete existing
            await db.delete(boardTags).where(eq(boardTags.boardId, existing.id));

            // Then add new ones
            for (const tagSlug of tagSlugs) {
              // Look up tag by slug or name
              let tag = tagsBySlug.get(tagSlug);
              if (!tag) {
                tag = tagsByName.get(tagSlug.toLowerCase());
              }
              if (tag) {
                await db.insert(boardTags)
                  .values({ boardId: existing.id, tagId: tag.id })
                  .onConflictDoNothing();
              }
            }

            results.push({
              success: true,
              row: i,
              slug,
              name,
              updated: true,
            });
          } else if (skipDuplicates) {
            results.push({
              success: true,
              row: i,
              slug,
              name,
              error: 'Skipped - already exists',
            });
          } else {
            // Create with modified slug
            let uniqueSlug = slug;
            let counter = 1;
            while (existingBoardsBySlug.has(uniqueSlug)) {
              uniqueSlug = `${slug}-${counter}`;
              counter++;
            }

            const [newBoard] = await db.insert(boards)
              .values({
                name: `${name} (${counter})`,
                slug: uniqueSlug,
                icon,
                color,
                lightColor,
                accentColor,
                sortOrder,
              })
              .returning();

            // Add tag associations
            for (const tagSlug of tagSlugs) {
              let tag = tagsBySlug.get(tagSlug);
              if (!tag) {
                tag = tagsByName.get(tagSlug.toLowerCase());
              }
              if (tag) {
                await db.insert(boardTags)
                  .values({ boardId: newBoard.id, tagId: tag.id })
                  .onConflictDoNothing();
              }
            }

            existingBoardsBySlug.set(uniqueSlug, newBoard);

            results.push({
              success: true,
              row: i,
              slug: uniqueSlug,
              name: `${name} (${counter})`,
              created: true,
            });
          }
        } else {
          // Create new board
          const [newBoard] = await db.insert(boards)
            .values({
              name,
              slug,
              icon,
              color,
              lightColor,
              accentColor,
              sortOrder,
            })
            .returning();

          // Add tag associations
          for (const tagSlug of tagSlugs) {
            let tag = tagsBySlug.get(tagSlug);
            if (!tag) {
              tag = tagsByName.get(tagSlug.toLowerCase());
            }
            if (tag) {
              await db.insert(boardTags)
                .values({ boardId: newBoard.id, tagId: tag.id })
                .onConflictDoNothing();
            }
          }

          existingBoardsBySlug.set(slug, newBoard);

          results.push({
            success: true,
            row: i,
            slug,
            name,
            created: true,
          });
        }
      } catch (e) {
        console.error('Error processing board:', name, e);
        results.push({
          success: false,
          row: i,
          slug,
          name,
          error: e instanceof Error ? e.message : 'Unknown error',
        });
      }
    }

    const created = results.filter(r => r.created).length;
    const updated = results.filter(r => r.updated).length;
    const skipped = results.filter(r => r.error?.includes('Skipped')).length;
    const errors = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        created,
        updated,
        skipped,
        errors,
      },
      results,
    });

  } catch (error) {
    console.error('Import boards error:', error);
    return NextResponse.json({
      error: 'Import failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
