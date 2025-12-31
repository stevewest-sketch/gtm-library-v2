import { db, catalogEntries, tags, assetTags, assetBoards, boards } from '@/lib/db';
import { eq, and, ne, inArray } from 'drizzle-orm';

export interface CrossLinkAsset {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  format: string;
  type: string | null;  // First type from types array
  hub: string;
}

export interface CrossLinkResult {
  relatedAssets: CrossLinkAsset[];     // Same competitor/product tag, different type
  proofPoints: CrossLinkAsset[];        // CoE hub + proof type + matching tags
  training: CrossLinkAsset[];           // Enablement hub + matching topic tags
  customerExamples: CrossLinkAsset[];   // CoE hub + customer-example type
}

interface GetCrossLinksParams {
  assetId: string;
  tags: string[];  // Tag slugs for the current asset
  currentHub: string;
  currentTypes: string[] | null;
  manualRelatedAssets?: { url: string; displayName: string }[] | null;
}

const LIMIT_PER_CATEGORY = 4;

// Type slugs that represent "proof points"
const PROOF_TYPES = ['case-study', 'customer-story', 'success-story', 'testimonial', 'proof'];

// Type slugs that represent customer examples
const CUSTOMER_EXAMPLE_TYPES = ['customer-example', 'use-case', 'implementation'];

/**
 * Get contextual cross-links for an asset
 */
export async function getCrossLinks(params: GetCrossLinksParams): Promise<CrossLinkResult> {
  const { assetId, tags: assetTagSlugs, currentHub, currentTypes } = params;

  const result: CrossLinkResult = {
    relatedAssets: [],
    proofPoints: [],
    training: [],
    customerExamples: [],
  };

  try {
    // Get tag IDs for the current asset's tags
    const assetTagRecords = assetTagSlugs.length > 0
      ? await db
          .select({ id: tags.id, slug: tags.slug })
          .from(tags)
          .where(inArray(tags.slug, assetTagSlugs))
      : [];

    const tagIds = assetTagRecords.map(t => t.id);

    if (tagIds.length === 0) {
      // No tags to match against
      return result;
    }

    // Find assets that share at least one tag with current asset
    // This is the base for all cross-link queries
    const sharedTagAssetIds = tagIds.length > 0
      ? await db
          .selectDistinct({ assetId: assetTags.assetId })
          .from(assetTags)
          .where(and(
            inArray(assetTags.tagId, tagIds),
            ne(assetTags.assetId, assetId)
          ))
      : [];

    const candidateAssetIds = sharedTagAssetIds.map(r => r.assetId).filter((id): id is string => id !== null);

    if (candidateAssetIds.length === 0) {
      return result;
    }

    // Fetch all candidate assets in one query
    const candidateAssets = await db
      .select({
        id: catalogEntries.id,
        slug: catalogEntries.slug,
        title: catalogEntries.title,
        shortDescription: catalogEntries.shortDescription,
        format: catalogEntries.format,
        types: catalogEntries.types,
        hub: catalogEntries.hub,
      })
      .from(catalogEntries)
      .where(and(
        inArray(catalogEntries.id, candidateAssetIds),
        eq(catalogEntries.status, 'published'),
        ne(catalogEntries.id, assetId)
      ));

    // Get board memberships for candidates (to know which hubs they're in)
    const boardMemberships = await db
      .select({
        assetId: assetBoards.assetId,
        boardSlug: boards.slug,
      })
      .from(assetBoards)
      .innerJoin(boards, eq(assetBoards.boardId, boards.id))
      .where(inArray(assetBoards.assetId, candidateAssetIds));

    const assetBoardMap: Record<string, string[]> = {};
    boardMemberships.forEach(({ assetId, boardSlug }) => {
      if (assetId) {
        if (!assetBoardMap[assetId]) assetBoardMap[assetId] = [];
        assetBoardMap[assetId].push(boardSlug);
      }
    });

    // Categorize candidates
    for (const asset of candidateAssets) {
      const assetTypes = asset.types || [];
      const firstType = assetTypes[0] || null;
      const typeLower = firstType?.toLowerCase() || '';
      const assetHubs = assetBoardMap[asset.id] || [];
      const isInCoE = asset.hub === 'coe' || assetHubs.includes('coe');
      const isInEnablement = asset.hub === 'enablement' || assetHubs.includes('enablement');

      const crossLinkAsset: CrossLinkAsset = {
        id: asset.id,
        slug: asset.slug,
        title: asset.title,
        shortDescription: asset.shortDescription,
        format: asset.format,
        type: firstType,
        hub: asset.hub,
      };

      // 1. Related Assets: Same tags, different type (prioritize different hub too)
      const isDifferentType = !currentTypes?.includes(firstType || '') && firstType !== (currentTypes?.[0] || null);
      const isDifferentHub = asset.hub !== currentHub;
      if ((isDifferentType || isDifferentHub) && result.relatedAssets.length < LIMIT_PER_CATEGORY) {
        result.relatedAssets.push(crossLinkAsset);
      }

      // 2. Proof Points: CoE hub + proof type
      const isProofType = PROOF_TYPES.some(pt =>
        typeLower.includes(pt) || assetTypes.some(t => t.toLowerCase().includes(pt))
      );
      if (isInCoE && isProofType && result.proofPoints.length < LIMIT_PER_CATEGORY) {
        result.proofPoints.push(crossLinkAsset);
      }

      // 3. Training: Enablement hub assets
      if (isInEnablement && result.training.length < LIMIT_PER_CATEGORY) {
        result.training.push(crossLinkAsset);
      }

      // 4. Customer Examples: CoE hub + customer example type
      const isCustomerExample = CUSTOMER_EXAMPLE_TYPES.some(ct =>
        typeLower.includes(ct) || assetTypes.some(t => t.toLowerCase().includes(ct))
      );
      if (isInCoE && isCustomerExample && result.customerExamples.length < LIMIT_PER_CATEGORY) {
        result.customerExamples.push(crossLinkAsset);
      }
    }

    return result;
  } catch (error) {
    console.error('Error fetching cross-links:', error);
    return result;
  }
}

/**
 * Get simple related assets (for use in existing related assets section)
 */
export async function getRelatedAssets(
  assetId: string,
  tagSlugs: string[],
  limit: number = 4
): Promise<CrossLinkAsset[]> {
  if (tagSlugs.length === 0) return [];

  try {
    // Get tag IDs
    const tagRecords = await db
      .select({ id: tags.id })
      .from(tags)
      .where(inArray(tags.slug, tagSlugs));

    const tagIds = tagRecords.map(t => t.id);
    if (tagIds.length === 0) return [];

    // Find assets with shared tags
    const sharedTagAssets = await db
      .selectDistinct({ assetId: assetTags.assetId })
      .from(assetTags)
      .where(and(
        inArray(assetTags.tagId, tagIds),
        ne(assetTags.assetId, assetId)
      ))
      .limit(limit * 2);  // Get extras for filtering

    const assetIds = sharedTagAssets.map(r => r.assetId).filter((id): id is string => id !== null);
    if (assetIds.length === 0) return [];

    // Fetch asset details
    const relatedAssetsRaw = await db
      .select({
        id: catalogEntries.id,
        slug: catalogEntries.slug,
        title: catalogEntries.title,
        shortDescription: catalogEntries.shortDescription,
        format: catalogEntries.format,
        types: catalogEntries.types,
        hub: catalogEntries.hub,
      })
      .from(catalogEntries)
      .where(and(
        inArray(catalogEntries.id, assetIds),
        eq(catalogEntries.status, 'published')
      ))
      .limit(limit);

    // Map to CrossLinkAsset format
    return relatedAssetsRaw.map(asset => ({
      id: asset.id,
      slug: asset.slug,
      title: asset.title,
      shortDescription: asset.shortDescription,
      format: asset.format,
      type: asset.types?.[0] || null,
      hub: asset.hub,
    }));
  } catch (error) {
    console.error('Error fetching related assets:', error);
    return [];
  }
}
