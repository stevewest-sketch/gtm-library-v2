import { NextResponse } from 'next/server';
import { db, catalogEntries, tags, assetTags } from '@/lib/db';
import { eq, and, inArray } from 'drizzle-orm';

// Alias for cleaner code
const assets = catalogEntries;

// Workflow tag inference rules
const WORKFLOW_RULES: Record<string, {
  keywords: string[];
  types?: string[];
  formats?: string[];
}> = {
  discovery: {
    keywords: ['first-meeting', 'discovery', 'qualification', 's0', 's1', 'initial', 'intro', 'introduction'],
    types: ['messaging'],
  },
  demo: {
    keywords: ['demo', 'demonstration', 'mockup', 'showcase', 'walkthrough'],
    types: ['demo', 'prototype'],
    formats: ['live-replay'],
  },
  proposal: {
    keywords: ['proposal', 'pricing', 'quote', 'template', 'sow', 'rfp', 'rfq', 'contract'],
    types: ['template'],
  },
  onboarding: {
    keywords: ['onboarding', 'implementation', 'kickoff', 'handoff', 'welcome', 'getting-started', 'setup'],
  },
  qbr: {
    keywords: ['qbr', 'ebr', 'business-review', 'quarterly', 'executive-review'],
  },
  expansion: {
    keywords: ['expansion', 'upsell', 'cross-sell', 'growth', 'upgrade', 'add-on'],
  },
  renewal: {
    keywords: ['renewal', 'retention', 'churn', 're-sign', 'contract-extension'],
  },
};

interface AssetWithTags {
  id: string;
  title: string;
  slug: string;
  type: string | null;  // First type from types array
  format: string | null;
  currentTags: string[];
}

interface TaggingSuggestion {
  asset: AssetWithTags;
  suggestedWorkflowTag: string;
  reason: string;
}

// Check if an asset matches a workflow rule
function matchesWorkflowRule(
  asset: AssetWithTags,
  workflowSlug: string,
  rule: typeof WORKFLOW_RULES[string]
): { matches: boolean; reason: string } {
  const titleLower = asset.title.toLowerCase();
  const slugLower = asset.slug.toLowerCase();

  // Check keywords in title or slug
  for (const keyword of rule.keywords) {
    if (titleLower.includes(keyword) || slugLower.includes(keyword)) {
      return { matches: true, reason: `Title/slug contains "${keyword}"` };
    }
  }

  // Check type match
  if (rule.types && asset.type) {
    const typeLower = asset.type.toLowerCase();
    for (const ruleType of rule.types) {
      if (typeLower === ruleType || typeLower.includes(ruleType)) {
        return { matches: true, reason: `Type is "${asset.type}"` };
      }
    }
  }

  // Check format match
  if (rule.formats && asset.format) {
    const formatLower = asset.format.toLowerCase();
    for (const ruleFormat of rule.formats) {
      if (formatLower === ruleFormat || formatLower.includes(ruleFormat)) {
        return { matches: true, reason: `Format is "${asset.format}"` };
      }
    }
  }

  return { matches: false, reason: '' };
}

// GET: Preview auto-tagging suggestions
export async function GET() {
  try {
    // Get all workflow tags
    const workflowTags = await db
      .select({ id: tags.id, slug: tags.slug, name: tags.name })
      .from(tags)
      .where(eq(tags.category, 'workflow'));

    if (workflowTags.length === 0) {
      return NextResponse.json({
        message: 'No workflow tags found. Create tags with category "workflow" first.',
        suggestions: [],
      });
    }

    const workflowTagSlugs = new Set(workflowTags.map(t => t.slug));

    // Get all published assets with their current tags
    const assetsWithTagsRaw = await db
      .select({
        id: assets.id,
        title: assets.title,
        slug: assets.slug,
        types: assets.types,
        format: assets.format,
      })
      .from(assets)
      .where(eq(assets.status, 'published'));

    // Map to use first type
    const assetsWithTags = assetsWithTagsRaw.map(a => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      type: a.types?.[0] || null,
      format: a.format,
    }));

    // Get current tags for each asset
    const assetIds = assetsWithTags.map(a => a.id);
    const currentTagsData = assetIds.length > 0
      ? await db
          .select({
            assetId: assetTags.assetId,
            tagSlug: tags.slug,
          })
          .from(assetTags)
          .innerJoin(tags, eq(assetTags.tagId, tags.id))
          .where(inArray(assetTags.assetId, assetIds))
      : [];

    // Group tags by asset
    const tagsByAsset: Record<string, string[]> = {};
    currentTagsData.forEach(({ assetId, tagSlug }) => {
      if (assetId && tagSlug) {
        if (!tagsByAsset[assetId]) tagsByAsset[assetId] = [];
        tagsByAsset[assetId].push(tagSlug);
      }
    });

    // Build full asset objects
    const fullAssets: AssetWithTags[] = assetsWithTags.map(a => ({
      ...a,
      currentTags: tagsByAsset[a.id] || [],
    }));

    // Generate suggestions
    const suggestions: TaggingSuggestion[] = [];

    for (const asset of fullAssets) {
      // Skip if already has a workflow tag
      const hasWorkflowTag = asset.currentTags.some(t => workflowTagSlugs.has(t));
      if (hasWorkflowTag) continue;

      // Try to match against each workflow rule
      for (const [workflowSlug, rule] of Object.entries(WORKFLOW_RULES)) {
        // Skip if this workflow tag doesn't exist
        if (!workflowTagSlugs.has(workflowSlug)) continue;

        const { matches, reason } = matchesWorkflowRule(asset, workflowSlug, rule);
        if (matches) {
          suggestions.push({
            asset: {
              id: asset.id,
              title: asset.title,
              slug: asset.slug,
              type: asset.type,
              format: asset.format,
              currentTags: asset.currentTags,
            },
            suggestedWorkflowTag: workflowSlug,
            reason,
          });
          break; // Only suggest one workflow tag per asset
        }
      }
    }

    return NextResponse.json({
      totalAssets: fullAssets.length,
      alreadyTagged: fullAssets.filter(a => a.currentTags.some(t => workflowTagSlugs.has(t))).length,
      suggestions,
      availableWorkflowTags: workflowTags,
    });
  } catch (error) {
    console.error('Error previewing auto-tagging:', error);
    return NextResponse.json(
      { error: 'Failed to preview auto-tagging' },
      { status: 500 }
    );
  }
}

// POST: Apply auto-tagging suggestions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { assetIds, workflowTagSlug } = body;

    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json(
        { error: 'Asset IDs required' },
        { status: 400 }
      );
    }

    if (!workflowTagSlug) {
      return NextResponse.json(
        { error: 'Workflow tag slug required' },
        { status: 400 }
      );
    }

    // Get the workflow tag
    const [workflowTag] = await db
      .select()
      .from(tags)
      .where(and(eq(tags.slug, workflowTagSlug), eq(tags.category, 'workflow')))
      .limit(1);

    if (!workflowTag) {
      return NextResponse.json(
        { error: 'Workflow tag not found' },
        { status: 404 }
      );
    }

    // Add the tag to each asset (skip if already exists)
    let addedCount = 0;
    for (const assetId of assetIds) {
      try {
        await db
          .insert(assetTags)
          .values({
            assetId,
            tagId: workflowTag.id,
          })
          .onConflictDoNothing();
        addedCount++;
      } catch {
        // Skip if conflict or error
      }
    }

    return NextResponse.json({
      success: true,
      addedCount,
      tagApplied: workflowTagSlug,
    });
  } catch (error) {
    console.error('Error applying auto-tagging:', error);
    return NextResponse.json(
      { error: 'Failed to apply auto-tagging' },
      { status: 500 }
    );
  }
}

// PUT: Apply all suggestions at once
export async function PUT() {
  try {
    // Get all workflow tags
    const workflowTags = await db
      .select({ id: tags.id, slug: tags.slug })
      .from(tags)
      .where(eq(tags.category, 'workflow'));

    if (workflowTags.length === 0) {
      return NextResponse.json({
        error: 'No workflow tags found',
      }, { status: 400 });
    }

    const workflowTagMap = new Map(workflowTags.map(t => [t.slug, t.id]));
    const workflowTagSlugs = new Set(workflowTags.map(t => t.slug));

    // Get all published assets
    const allAssetsRaw = await db
      .select({
        id: assets.id,
        title: assets.title,
        slug: assets.slug,
        types: assets.types,
        format: assets.format,
      })
      .from(assets)
      .where(eq(assets.status, 'published'));

    // Map to use first type
    const allAssets = allAssetsRaw.map(a => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      type: a.types?.[0] || null,
      format: a.format,
    }));

    // Get current tags
    const assetIds = allAssets.map(a => a.id);
    const currentTagsData = assetIds.length > 0
      ? await db
          .select({
            assetId: assetTags.assetId,
            tagSlug: tags.slug,
          })
          .from(assetTags)
          .innerJoin(tags, eq(assetTags.tagId, tags.id))
          .where(inArray(assetTags.assetId, assetIds))
      : [];

    const tagsByAsset: Record<string, string[]> = {};
    currentTagsData.forEach(({ assetId, tagSlug }) => {
      if (assetId && tagSlug) {
        if (!tagsByAsset[assetId]) tagsByAsset[assetId] = [];
        tagsByAsset[assetId].push(tagSlug);
      }
    });

    // Apply tags
    let appliedCount = 0;
    const applied: { assetId: string; tagSlug: string }[] = [];

    for (const asset of allAssets) {
      const currentTags = tagsByAsset[asset.id] || [];

      // Skip if already has workflow tag
      if (currentTags.some(t => workflowTagSlugs.has(t))) continue;

      const fullAsset: AssetWithTags = { ...asset, currentTags };

      // Try each workflow rule
      for (const [workflowSlug, rule] of Object.entries(WORKFLOW_RULES)) {
        const tagId = workflowTagMap.get(workflowSlug);
        if (!tagId) continue;

        const { matches } = matchesWorkflowRule(fullAsset, workflowSlug, rule);
        if (matches) {
          try {
            await db
              .insert(assetTags)
              .values({
                assetId: asset.id,
                tagId,
              })
              .onConflictDoNothing();
            appliedCount++;
            applied.push({ assetId: asset.id, tagSlug: workflowSlug });
          } catch {
            // Skip on error
          }
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      appliedCount,
      applied,
    });
  } catch (error) {
    console.error('Error applying all auto-tags:', error);
    return NextResponse.json(
      { error: 'Failed to apply auto-tags' },
      { status: 500 }
    );
  }
}
