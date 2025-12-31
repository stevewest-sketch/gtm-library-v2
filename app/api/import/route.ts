import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { catalogEntries, tags, assetTags, boards, assetBoards } from '@/lib/db/schema';
import { inArray, eq } from 'drizzle-orm';
import { generateContent } from '@/lib/ai/content-generator';

// Configure for longer timeout on Vercel (5 minutes for AI processing)
export const maxDuration = 300; // 300 seconds for AI imports

// CSV structure from updated audit:
// title,slug,description,shortDescription,externalUrl,videoUrl,slidesUrl,keyAssetUrl,transcriptUrl,hub,format,type,tags,date,presenters,duration

interface ParsedRow {
  rowNum: number;
  title: string;
  slug: string;
  description: string;
  shortDescription: string; // 6 words max, shown on card
  externalUrl: string;
  videoUrl: string;
  slidesUrl: string;
  keyAssetUrl: string;
  transcriptUrl: string;
  aiContentUrl: string; // URL only for AI content generation - not saved to asset
  hub: string;
  format: string;
  type: string;
  tags: string;
  date: string; // For Enablement - session/event date
  presenters: string; // Pipe-separated list of presenters
  duration: string; // Duration in minutes
  publishedAt: string; // Published date for ordering assets
  // AI-generated fields
  aiDescription?: string;
  aiShortDescription?: string;
  aiTakeaways?: string[];
  aiHowtos?: { title: string; content: string }[];
  aiTips?: string[];
  aiTags?: string[];
}

interface ImportResult {
  success: boolean;
  row: number;
  slug: string;
  title: string;
  hub?: string;
  error?: string;
  created?: boolean;
  updated?: boolean;
}

function parseCSVLine(line: string, delimiter: string = ','): string[] {
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
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

// Detect whether the file uses tabs or commas as delimiter
function detectDelimiter(headerLine: string): string {
  const tabCount = (headerLine.match(/\t/g) || []).length;
  const commaCount = (headerLine.match(/,/g) || []).length;
  // If there are more tabs than commas, it's likely TSV
  return tabCount > commaCount ? '\t' : ',';
}

function normalizeHub(hub: string): string {
  const h = hub.toLowerCase().trim();
  // Match exact hub slugs that correspond to boards
  if (h === 'coe' || h === 'center of excellence') return 'coe';
  if (h === 'content' || h === 'content types') return 'content';
  if (h === 'enablement' || h === 'sales enablement' || h === 'training') return 'enablement';
  if (h === 'product') return 'product';
  if (h === 'competitive') return 'competitive';
  if (h === 'sales') return 'sales';
  if (h === 'csm') return 'csm';
  if (h === 'sc') return 'sc';
  if (h === 'demo') return 'demo';
  if (h === 'proof' || h === 'proof points') return 'proof';
  // Return as-is if it might be a valid board slug
  if (h) return h;
  // Default to content if empty
  return 'content';
}

function normalizeFormat(format: string): string {
  const f = format.toLowerCase().trim();
  const formatMap: Record<string, string> = {
    'tool': 'tool',
    'document': 'document',
    'doc': 'document',
    'video': 'video',
    'slides': 'slides',
    'slide': 'slides',
    'pdf': 'pdf',
    'sheet': 'sheet',
    'spreadsheet': 'spreadsheet',
    'on-demand': 'on-demand',
    'on demand': 'on-demand',
    'live-replay': 'live-replay',
    'live replay': 'live-replay',
    'training': 'training',
    'one pager': 'one-pager',
    'one-pager': 'one-pager',
    'battlecard': 'battlecard',
    'template': 'template',
    'guide': 'guide',
    'link': 'link',
    'web-link': 'web-link',
    'web link': 'web-link',
    'article': 'article',
    'sequence': 'sequence',
    'course': 'course',
    'meeting-asset': 'meeting-asset',
    'meeting asset': 'meeting-asset',
    'playbook': 'playbook',
    'proof-point': 'proof-point',
    'proof point': 'proof-point',
    'report': 'report',
  };
  // If not in map, convert spaces to dashes (e.g., "Meeting Asset" -> "meeting-asset")
  return formatMap[f] || f.replace(/\s+/g, '-');
}

// Normalize type values (convert display names to slugs)
function normalizeType(type: string): string {
  if (!type) return '';
  const t = type.toLowerCase().trim();
  // If already a slug (contains dashes), return as-is
  if (t.includes('-')) return t;
  // Convert display name to slug (e.g., "Customer Example" -> "customer-example")
  return t.replace(/\s+/g, '-');
}

function parseTagsString(tagsStr: string | undefined): string[] {
  if (!tagsStr) return [];
  return tagsStr
    .split('|')
    .map(t => t.trim())
    .filter(t => t.length > 0);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length
}

function parsePresenters(presentersStr: string | undefined): string[] {
  if (!presentersStr) return [];
  return presentersStr
    .split('|')
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr || !dateStr.trim()) return null;

  // Try various date formats
  const trimmed = dateStr.trim();

  // ISO format: 2024-01-15
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) return date;
  }

  // US format: 01/15/2024 or 1/15/2024
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(trimmed)) {
    const [month, day, year] = trimmed.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }

  // Month name format: Jan 15, 2024 or January 15, 2024
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) return date;

  return null;
}

function parseDuration(durationStr: string | undefined): number | null {
  if (!durationStr || !durationStr.trim()) return null;
  const parsed = parseInt(durationStr.trim());
  return isNaN(parsed) ? null : parsed;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const skipDuplicates = formData.get('skipDuplicates') === 'true';
    const updateDuplicates = formData.get('updateDuplicates') === 'true';
    const enableAI = formData.get('enableAI') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const cleanText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // Remove trailing backslashes from each line (common export artifact)
    const lines = cleanText.split('\n')
      .map(line => line.replace(/\\+$/, '').trim())
      .filter(line => line.length > 0);

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have header and at least one data row' }, { status: 400 });
    }

    // Detect delimiter from header line (tab vs comma)
    const delimiter = detectDelimiter(lines[0]);
    console.log('Detected delimiter:', delimiter === '\t' ? 'TAB' : 'COMMA');

    // Parse header
    const headers = parseCSVLine(lines[0], delimiter).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    console.log('Parsed headers:', headers);
    const colMap: Record<string, number> = {};
    const expectedCols = ['title', 'slug', 'description', 'shortdescription', 'externalurl', 'videourl', 'slidesurl', 'keyasseturl', 'transcripturl', 'aicontenturl', 'hub', 'format', 'type', 'tags', 'date', 'eventdate', 'presenters', 'duration', 'publishedat', 'publisheddate'];

    headers.forEach((h, i) => {
      if (expectedCols.includes(h)) {
        colMap[h] = i;
      }
    });

    if (colMap['title'] === undefined || colMap['slug'] === undefined || colMap['hub'] === undefined) {
      return NextResponse.json({
        error: 'CSV must have title, slug, and hub columns',
        foundHeaders: headers
      }, { status: 400 });
    }

    // STEP 1: Parse ALL rows first (no DB calls)
    const parsedRows: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = parseCSVLine(line, delimiter);
      const getValue = (col: string): string => {
        const idx = colMap[col];
        return idx !== undefined ? (values[idx] || '').trim() : '';
      };

      const title = getValue('title');
      if (!title) continue; // Title is required

      // Auto-generate slug from title if not provided
      let slug = getValue('slug');
      if (!slug) {
        slug = generateSlug(title);
      }

      parsedRows.push({
        rowNum: i,
        title,
        slug,
        description: getValue('description'),
        shortDescription: getValue('shortdescription'),
        externalUrl: getValue('externalurl'),
        videoUrl: getValue('videourl'),
        slidesUrl: getValue('slidesurl'),
        keyAssetUrl: getValue('keyasseturl'),
        transcriptUrl: getValue('transcripturl'),
        aiContentUrl: getValue('aicontenturl'), // URL only for AI - not saved to asset
        hub: normalizeHub(getValue('hub')),
        format: normalizeFormat(getValue('format') || 'document'),
        type: normalizeType(getValue('type')),
        tags: getValue('tags'),
        date: getValue('date') || getValue('eventdate'), // Support both column names
        presenters: getValue('presenters'),
        duration: getValue('duration'),
        publishedAt: getValue('publishedat') || getValue('publisheddate'), // Support both column names
      });
    }

    // STEP 1.5: AI Content Generation (if enabled)
    if (enableAI) {
      console.log(`AI content generation enabled for ${parsedRows.length} rows`);

      // Process rows in small batches to avoid overwhelming the API
      const AI_BATCH_SIZE = 3; // Process 3 rows concurrently

      for (let i = 0; i < parsedRows.length; i += AI_BATCH_SIZE) {
        const batch = parsedRows.slice(i, i + AI_BATCH_SIZE);

        await Promise.all(batch.map(async (row) => {
          // Priority: aiContentUrl (dedicated AI-only URL) > externalUrl > videoUrl
          // aiContentUrl is NOT saved to the asset - only used for content generation
          const urlToCrawl = row.aiContentUrl || row.externalUrl || row.videoUrl;

          if (!urlToCrawl) {
            console.log(`Row ${row.rowNum}: No URL to crawl, skipping AI`);
            return;
          }

          try {
            console.log(`Row ${row.rowNum}: Generating AI content from ${urlToCrawl}`);

            // Determine which fields to generate based on what's missing
            const generateFields: string[] = [];
            if (!row.description) generateFields.push('description');
            if (!row.shortDescription) generateFields.push('shortDescription');

            // For enablement hub, generate training content
            if (row.hub === 'enablement') {
              generateFields.push('takeaways', 'howtos', 'tips');
            } else {
              // For other hubs, generate general content
              generateFields.push('takeaways', 'tips');
            }

            // Always suggest tags
            generateFields.push('tags');

            if (generateFields.length === 0) {
              console.log(`Row ${row.rowNum}: All fields already provided, skipping AI`);
              return;
            }

            const aiResponse = await generateContent({
              url: urlToCrawl,
              hub: row.hub as 'enablement' | 'content' | 'coe',
              format: row.format,
              generateFields: generateFields as ('description' | 'shortDescription' | 'takeaways' | 'howtos' | 'tips' | 'tags')[],
              existingAsset: {
                title: row.title,
              },
            });

            // Apply AI-generated content to the row
            if (aiResponse.success && aiResponse.content) {
              const { content } = aiResponse;
              if (content.description && !row.description) {
                row.aiDescription = content.description;
              }
              if (content.shortDescription && !row.shortDescription) {
                row.aiShortDescription = content.shortDescription;
              }
              if (content.takeaways && content.takeaways.length > 0) {
                row.aiTakeaways = content.takeaways;
              }
              if (content.howtos && content.howtos.length > 0) {
                row.aiHowtos = content.howtos;
              }
              if (content.tips && content.tips.length > 0) {
                row.aiTips = content.tips;
              }
              if (content.suggestedTags && content.suggestedTags.length > 0) {
                row.aiTags = content.suggestedTags;
              }
            }

            console.log(`Row ${row.rowNum}: AI generated content successfully`);
          } catch (error) {
            console.error(`Row ${row.rowNum}: AI generation failed:`, error);
            // Continue without AI content - don't fail the import
          }
        }));
      }
    }

    // STEP 2: Get ALL existing slugs in ONE query
    const existingEntries = await db.select({ id: catalogEntries.id, slug: catalogEntries.slug }).from(catalogEntries);
    const existingSlugs = new Set(existingEntries.map(e => e.slug));
    const existingIdBySlug = new Map(existingEntries.map(e => [e.slug, e.id]));

    // Also track slugs we're adding in this import to avoid duplicates within the batch
    const slugsInBatch = new Set<string>();

    // Track which rows have existing slugs (before we modify them)
    const rowsWithExistingSlugs = new Set<number>();
    const rowsToUpdate = new Set<number>();

    // STEP 3: Make slugs unique and separate new vs existing vs update
    for (const row of parsedRows) {
      const originalSlug = row.slug;

      // Check if original slug exists in DB
      if (existingSlugs.has(originalSlug)) {
        if (updateDuplicates) {
          // Mark for updating
          rowsToUpdate.add(row.rowNum);
          slugsInBatch.add(row.slug);
          continue;
        } else if (skipDuplicates) {
          // Mark for skipping
          rowsWithExistingSlugs.add(row.rowNum);
          continue;
        } else {
          // Generate unique slug by appending number
          let uniqueSlug = originalSlug;
          let counter = 1;
          while (existingSlugs.has(uniqueSlug) || slugsInBatch.has(uniqueSlug)) {
            uniqueSlug = `${originalSlug}-${counter}`;
            counter++;
          }
          row.slug = uniqueSlug;
        }
      }

      // Also check for duplicates within this batch
      if (slugsInBatch.has(row.slug)) {
        let uniqueSlug = row.slug;
        let counter = 1;
        while (slugsInBatch.has(uniqueSlug) || existingSlugs.has(uniqueSlug)) {
          uniqueSlug = `${row.slug}-${counter}`;
          counter++;
        }
        row.slug = uniqueSlug;
      }

      slugsInBatch.add(row.slug);
    }

    const toInsert = parsedRows.filter(r => !rowsWithExistingSlugs.has(r.rowNum) && !rowsToUpdate.has(r.rowNum));
    const toUpdate = parsedRows.filter(r => rowsToUpdate.has(r.rowNum));
    const toSkip = parsedRows.filter(r => rowsWithExistingSlugs.has(r.rowNum));

    const results: ImportResult[] = [];

    // Mark skipped rows
    if (skipDuplicates) {
      toSkip.forEach(row => {
        results.push({
          success: true,
          row: row.rowNum,
          slug: row.slug,
          title: row.title,
          error: 'Skipped - already exists',
        });
      });
    }

    // STEP 4: Get existing boards and tags
    const existingBoards = await db.select().from(boards);
    const boardsBySlug = new Map(existingBoards.map(b => [b.slug, b]));

    const existingTags = await db.select().from(tags);
    const tagsByName = new Map(existingTags.map(t => [t.name.toLowerCase(), t]));

    // STEP 5: Collect ALL unique tags from rows to insert
    const allTagNames = [...new Set(toInsert.flatMap(r => parseTagsString(r.tags)))];
    const newTagNames = allTagNames.filter(name => !tagsByName.has(name.toLowerCase()));

    // Bulk insert new tags (if any)
    if (newTagNames.length > 0) {
      const tagValues = newTagNames.map(name => ({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      }));

      try {
        await db.insert(tags).values(tagValues).onConflictDoNothing();
      } catch (e) {
        console.log('Tag insert error (ignored):', e);
      }

      // Refresh tags map
      const refreshedTags = await db.select().from(tags);
      refreshedTags.forEach(t => tagsByName.set(t.name.toLowerCase(), t));
    }

    // STEP 6: Bulk INSERT all new entries in chunks
    const CHUNK_SIZE = 50;
    const insertedSlugs: string[] = [];

    for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
      const chunk = toInsert.slice(i, i + CHUNK_SIZE);

      const entryValues = chunk.map(row => {
        // Combine CSV tags with AI-suggested tags
        const csvTags = parseTagsString(row.tags);
        const aiTags = row.aiTags || [];
        const combinedTags = [...new Set([...csvTags, ...aiTags])];

        return {
          slug: row.slug,
          title: row.title,
          // Use AI description if CSV description is empty
          description: row.description || row.aiDescription || null,
          shortDescription: row.shortDescription || row.aiShortDescription || null,
          hub: row.hub,
          format: row.format,
          types: row.type ? [row.type] : [],
          tags: combinedTags,
          primaryLink: row.externalUrl || '',
          videoUrl: row.videoUrl || null,
          slidesUrl: row.slidesUrl || null,
          keyAssetUrl: row.keyAssetUrl || null,
          transcriptUrl: row.transcriptUrl || null,
          eventDate: parseDate(row.date),
          presenters: parsePresenters(row.presenters),
          durationMinutes: parseDuration(row.duration),
          publishedAt: parseDate(row.publishedAt),
          status: 'published',
          // AI-generated training content
          takeaways: row.aiTakeaways || [],
          howtos: row.aiHowtos || [],
          tips: row.aiTips || [],
        };
      });

      try {
        await db.insert(catalogEntries).values(entryValues).onConflictDoNothing();
        insertedSlugs.push(...chunk.map(r => r.slug));

        chunk.forEach(row => {
          results.push({
            success: true,
            row: row.rowNum,
            slug: row.slug,
            title: row.title,
            hub: row.hub,
            created: true,
          });
        });
      } catch (e) {
        console.error('Chunk insert error:', e);
        chunk.forEach(row => {
          results.push({
            success: false,
            row: row.rowNum,
            slug: row.slug,
            title: row.title,
            error: e instanceof Error ? e.message : 'Insert failed',
          });
        });
      }
    }

    // STEP 6b: Update existing entries in parallel batches
    const updatedSlugs: string[] = [];
    const UPDATE_BATCH_SIZE = 10; // Process 10 updates concurrently

    for (let i = 0; i < toUpdate.length; i += UPDATE_BATCH_SIZE) {
      const batch = toUpdate.slice(i, i + UPDATE_BATCH_SIZE);

      await Promise.all(batch.map(async (row) => {
        const existingId = existingIdBySlug.get(row.slug);
        if (!existingId) return;

        try {
          // Build update object - only include fields that have values
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const updateData: Record<string, any> = {
            updatedAt: new Date(),
          };

          // Only update fields that have non-empty values in CSV or AI
          if (row.title) updateData.title = row.title;
          if (row.description || row.aiDescription) {
            updateData.description = row.description || row.aiDescription;
          }
          if (row.shortDescription || row.aiShortDescription) {
            updateData.shortDescription = row.shortDescription || row.aiShortDescription;
          }
          if (row.hub) updateData.hub = row.hub;
          if (row.format) updateData.format = row.format;
          if (row.type) updateData.types = [row.type];
          if (row.tags || row.aiTags) {
            const csvTags = parseTagsString(row.tags);
            const aiTags = row.aiTags || [];
            updateData.tags = [...new Set([...csvTags, ...aiTags])];
          }
          if (row.externalUrl) updateData.primaryLink = row.externalUrl;
          if (row.videoUrl) updateData.videoUrl = row.videoUrl;
          if (row.slidesUrl) updateData.slidesUrl = row.slidesUrl;
          if (row.keyAssetUrl) updateData.keyAssetUrl = row.keyAssetUrl;
          if (row.transcriptUrl) updateData.transcriptUrl = row.transcriptUrl;
          if (row.date) {
            const parsedDate = parseDate(row.date);
            if (parsedDate) updateData.eventDate = parsedDate;
          }
          if (row.presenters) updateData.presenters = parsePresenters(row.presenters);
          if (row.duration) {
            const parsedDuration = parseDuration(row.duration);
            if (parsedDuration !== null) updateData.durationMinutes = parsedDuration;
          }
          if (row.publishedAt) {
            const parsedPublishedAt = parseDate(row.publishedAt);
            if (parsedPublishedAt) updateData.publishedAt = parsedPublishedAt;
          }
          // Apply AI-generated training content
          if (row.aiTakeaways && row.aiTakeaways.length > 0) {
            updateData.takeaways = row.aiTakeaways;
          }
          if (row.aiHowtos && row.aiHowtos.length > 0) {
            updateData.howtos = row.aiHowtos;
          }
          if (row.aiTips && row.aiTips.length > 0) {
            updateData.tips = row.aiTips;
          }

          await db.update(catalogEntries)
            .set(updateData)
            .where(eq(catalogEntries.id, existingId));

          updatedSlugs.push(row.slug);
          results.push({
            success: true,
            row: row.rowNum,
            slug: row.slug,
            title: row.title,
            hub: row.hub,
            updated: true,
          });
        } catch (e) {
          console.error('Update error for slug:', row.slug, e);
          results.push({
            success: false,
            row: row.rowNum,
            slug: row.slug,
            title: row.title,
            error: e instanceof Error ? e.message : 'Update failed',
          });
        }
      }));
    }

    // STEP 7: Get all inserted asset IDs
    let insertedAssets: { id: string; slug: string }[] = [];
    if (insertedSlugs.length > 0) {
      // Query in chunks to avoid too-long IN clause
      for (let i = 0; i < insertedSlugs.length; i += 100) {
        const slugChunk = insertedSlugs.slice(i, i + 100);
        const assets = await db.select({ id: catalogEntries.id, slug: catalogEntries.slug })
          .from(catalogEntries)
          .where(inArray(catalogEntries.slug, slugChunk));
        insertedAssets.push(...assets);
      }
    }

    // Also get updated asset IDs for board/tag reassignment
    let updatedAssets: { id: string; slug: string }[] = [];
    if (updatedSlugs.length > 0) {
      for (let i = 0; i < updatedSlugs.length; i += 100) {
        const slugChunk = updatedSlugs.slice(i, i + 100);
        const assets = await db.select({ id: catalogEntries.id, slug: catalogEntries.slug })
          .from(catalogEntries)
          .where(inArray(catalogEntries.slug, slugChunk));
        updatedAssets.push(...assets);
      }
    }

    const assetIdBySlug = new Map([...insertedAssets, ...updatedAssets].map(a => [a.slug, a.id]));

    // Build lookup from slug to parsed row for hub info (include both inserted and updated)
    const rowBySlug = new Map([...toInsert, ...toUpdate].map(r => [r.slug, r]));

    // Combine inserted and updated assets for assignments
    const allProcessedAssets = [...insertedAssets, ...updatedAssets];

    // STEP 8: Handle asset-board assignments
    // For updated assets, only update board assignments if hub was specified in CSV
    // Batch delete board assignments for updated assets
    const assetIdsForBoardDelete = updatedAssets
      .filter(asset => {
        const row = rowBySlug.get(asset.slug);
        return row && row.hub;
      })
      .map(asset => asset.id);

    if (assetIdsForBoardDelete.length > 0) {
      try {
        await db.delete(assetBoards).where(inArray(assetBoards.assetId, assetIdsForBoardDelete));
      } catch (e) {
        console.log('Delete board assignment error (ignored):', e);
      }
    }

    // Bulk insert asset-board assignments for all processed assets
    const boardAssignments: { assetId: string; boardId: string }[] = [];
    for (const asset of allProcessedAssets) {
      const row = rowBySlug.get(asset.slug);
      if (!row || !row.hub) continue; // Skip if no hub in CSV

      const board = boardsBySlug.get(row.hub);
      if (board) {
        boardAssignments.push({ assetId: asset.id, boardId: board.id });
      }
    }

    if (boardAssignments.length > 0) {
      for (let i = 0; i < boardAssignments.length; i += CHUNK_SIZE) {
        const chunk = boardAssignments.slice(i, i + CHUNK_SIZE);
        try {
          await db.insert(assetBoards).values(chunk).onConflictDoNothing();
        } catch (e) {
          console.log('Board assignment error (ignored):', e);
        }
      }
    }

    // STEP 9: Handle asset-tag assignments
    // For updated assets, only update tag assignments if tags were specified in CSV
    // Batch delete tag assignments for updated assets
    const assetIdsForTagDelete = updatedAssets
      .filter(asset => {
        const row = rowBySlug.get(asset.slug);
        return row && row.tags;
      })
      .map(asset => asset.id);

    if (assetIdsForTagDelete.length > 0) {
      try {
        await db.delete(assetTags).where(inArray(assetTags.assetId, assetIdsForTagDelete));
      } catch (e) {
        console.log('Delete tag assignment error (ignored):', e);
      }
    }

    // Bulk insert asset-tag assignments for all processed assets
    const tagAssignments: { assetId: string; tagId: string }[] = [];
    for (const asset of allProcessedAssets) {
      const row = rowBySlug.get(asset.slug);
      if (!row || !row.tags) continue; // Skip if no tags in CSV

      for (const tagName of parseTagsString(row.tags)) {
        const tag = tagsByName.get(tagName.toLowerCase());
        if (tag) {
          tagAssignments.push({ assetId: asset.id, tagId: tag.id });
        }
      }
    }

    if (tagAssignments.length > 0) {
      for (let i = 0; i < tagAssignments.length; i += CHUNK_SIZE) {
        const chunk = tagAssignments.slice(i, i + CHUNK_SIZE);
        try {
          await db.insert(assetTags).values(chunk).onConflictDoNothing();
        } catch (e) {
          console.log('Tag assignment error (ignored):', e);
        }
      }
    }

    // Sort results by row number
    results.sort((a, b) => a.row - b.row);

    const created = results.filter(r => r.created).length;
    const updated = results.filter(r => r.updated).length;
    const skipped = results.filter(r => r.error?.includes('Skipped')).length;
    const errors = results.filter(r => !r.success).length;

    // Limit results to prevent large JSON responses that freeze browsers
    // Include all errors first, then fill up to 100 items with successes
    const errorResults = results.filter(r => !r.success || r.error);
    const successResults = results.filter(r => r.success && !r.error);
    const limitedResults = [
      ...errorResults.slice(0, 50),
      ...successResults.slice(0, Math.max(0, 100 - errorResults.length)),
    ].sort((a, b) => a.row - b.row);

    return NextResponse.json({
      success: true,
      summary: {
        total: parsedRows.length,
        created,
        updated,
        skipped,
        errors,
      },
      results: limitedResults,
      totalResults: results.length,
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({
      error: 'Import failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
