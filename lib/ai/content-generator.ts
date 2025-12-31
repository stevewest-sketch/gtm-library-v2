// AI Content Generator using Claude API

import Anthropic from '@anthropic-ai/sdk';
import { buildGenerationPrompt, SYSTEM_PROMPT, GenerationConfig } from './prompts';
import { crawlUrl, CrawlResult, combineContent } from './url-crawler';
import { fetchTranscript, TranscriptResult } from './transcript-fetcher';

// Types for content generation
export interface GenerateContentRequest {
  // Input sources (at least one required)
  url?: string;
  text?: string;
  existingAsset?: Partial<AssetData>;

  // Generation config
  hub: 'enablement' | 'content' | 'coe';
  format?: string;
  generateFields: Array<
    | 'description'
    | 'shortDescription'
    | 'takeaways'
    | 'howtos'
    | 'tips'
    | 'tags'
    | 'suggestedType'
  >;

  // Optional guidance
  prompt?: string;
  tone?: 'professional' | 'casual' | 'technical';
}

export interface AssetData {
  title?: string;
  description?: string;
  shortDescription?: string;
  hub?: string;
  format?: string;
  types?: string[];
  primaryLink?: string;
  videoUrl?: string;
  slidesUrl?: string;
  transcriptUrl?: string;
  takeaways?: string[];
  howtos?: { title: string; content: string }[];
  tips?: string[];
}

export interface GenerateContentResponse {
  success: boolean;
  content?: GeneratedContent;
  crawledData?: {
    title?: string;
    sourceType?: string;
    hasTranscript?: boolean;
  };
  error?: string;
}

export interface GeneratedContent {
  description?: string;
  shortDescription?: string;
  takeaways?: string[];
  howtos?: { title: string; content: string }[];
  tips?: string[];
  suggestedTags?: string[];
  suggestedType?: string;
  extractedLinks?: {
    primaryLink?: string;
    videoUrl?: string;
    slidesUrl?: string;
    transcriptUrl?: string;
  };
}

// Initialize Anthropic client
function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  return new Anthropic({ apiKey });
}

// Gather content from all provided sources
async function gatherContent(request: GenerateContentRequest): Promise<{
  content: string;
  crawlResults: CrawlResult[];
  transcriptResult?: TranscriptResult;
}> {
  const crawlResults: CrawlResult[] = [];
  let transcriptResult: TranscriptResult | undefined;

  // Crawl URL if provided
  if (request.url) {
    const result = await crawlUrl(request.url);
    if (result.success) {
      crawlResults.push(result);
    }

    // If it's a video URL, also try to get transcript
    if (result.sourceType === 'youtube' || result.sourceType === 'loom') {
      transcriptResult = await fetchTranscript(request.url);
    }
  }

  // Combine all content sources
  const contentParts: string[] = [];

  // Add crawled content
  if (crawlResults.length > 0) {
    contentParts.push(combineContent(crawlResults));
  }

  // Add transcript if available
  if (transcriptResult?.success && transcriptResult.transcript) {
    contentParts.push(`## Transcript\n${transcriptResult.transcript}`);
  }

  // Add pasted text
  if (request.text) {
    contentParts.push(`## Provided Content\n${request.text}`);
  }

  // Add existing asset data for context
  if (request.existingAsset) {
    const assetContext = Object.entries(request.existingAsset)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join('\n');

    if (assetContext) {
      contentParts.push(`## Existing Asset Data\n${assetContext}`);
    }
  }

  return {
    content: contentParts.join('\n\n---\n\n'),
    crawlResults,
    transcriptResult,
  };
}

// Parse Claude's response to extract JSON
function parseGeneratedContent(responseText: string): GeneratedContent {
  // Try to extract JSON from the response
  // Claude might wrap it in markdown code blocks
  let jsonStr = responseText;

  // Remove markdown code blocks if present
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  // Try to find JSON object in the response
  const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    jsonStr = objectMatch[0];
  }

  try {
    const parsed = JSON.parse(jsonStr);

    // Validate and normalize the response
    const result: GeneratedContent = {};

    if (typeof parsed.description === 'string') {
      result.description = parsed.description;
    }

    if (typeof parsed.shortDescription === 'string') {
      // Ensure it's 6 words or less
      const words = parsed.shortDescription.split(/\s+/);
      result.shortDescription = words.slice(0, 6).join(' ');
    }

    if (Array.isArray(parsed.takeaways)) {
      result.takeaways = parsed.takeaways.filter((t: unknown) => typeof t === 'string');
    }

    if (Array.isArray(parsed.howtos)) {
      result.howtos = parsed.howtos
        .filter((h: unknown) => h && typeof h === 'object' && 'title' in h && 'content' in h)
        .map((h: { title: string; content: string }) => ({
          title: String(h.title),
          content: String(h.content),
        }));
    }

    if (Array.isArray(parsed.tips)) {
      result.tips = parsed.tips.filter((t: unknown) => typeof t === 'string');
    }

    if (Array.isArray(parsed.suggestedTags)) {
      result.suggestedTags = parsed.suggestedTags
        .filter((t: unknown) => typeof t === 'string')
        .map((t: string) => t.toLowerCase().replace(/\s+/g, '-'));
    }

    if (typeof parsed.suggestedType === 'string') {
      result.suggestedType = parsed.suggestedType.toLowerCase().replace(/\s+/g, '-');
    }

    if (parsed.extractedLinks && typeof parsed.extractedLinks === 'object') {
      result.extractedLinks = {};
      if (parsed.extractedLinks.primaryLink) {
        result.extractedLinks.primaryLink = String(parsed.extractedLinks.primaryLink);
      }
      if (parsed.extractedLinks.videoUrl) {
        result.extractedLinks.videoUrl = String(parsed.extractedLinks.videoUrl);
      }
      if (parsed.extractedLinks.slidesUrl) {
        result.extractedLinks.slidesUrl = String(parsed.extractedLinks.slidesUrl);
      }
      if (parsed.extractedLinks.transcriptUrl) {
        result.extractedLinks.transcriptUrl = String(parsed.extractedLinks.transcriptUrl);
      }
    }

    return result;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('Response text:', responseText);
    throw new Error('Failed to parse AI-generated content. The response was not valid JSON.');
  }
}

// Main content generation function
export async function generateContent(
  request: GenerateContentRequest
): Promise<GenerateContentResponse> {
  // Validate request
  if (!request.url && !request.text && !request.existingAsset) {
    return {
      success: false,
      error: 'At least one input source (url, text, or existingAsset) is required',
    };
  }

  if (!request.generateFields || request.generateFields.length === 0) {
    return {
      success: false,
      error: 'At least one field to generate is required',
    };
  }

  try {
    // Gather content from all sources
    const { content, crawlResults, transcriptResult } = await gatherContent(request);

    if (!content || content.trim().length < 50) {
      return {
        success: false,
        error: 'Not enough content to generate from. Please provide more text or a valid URL.',
      };
    }

    // Build the generation config
    const config: GenerationConfig = {
      hub: request.hub,
      format: request.format,
      generateFields: request.generateFields,
      prompt: request.prompt,
    };

    // Build the prompt
    const userPrompt = buildGenerationPrompt(content, config);

    // Call Claude API
    const client = getAnthropicClient();

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    // Extract text from response
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    // Parse the generated content
    const generatedContent = parseGeneratedContent(responseText);

    // Add extracted links from crawl results
    if (crawlResults.length > 0) {
      const links = crawlResults[0].links;
      if (links) {
        generatedContent.extractedLinks = {
          ...generatedContent.extractedLinks,
          ...links,
        };
      }
    }

    return {
      success: true,
      content: generatedContent,
      crawledData: {
        title: crawlResults[0]?.title,
        sourceType: crawlResults[0]?.sourceType,
        hasTranscript: transcriptResult?.success && !!transcriptResult.transcript,
      },
    };
  } catch (error) {
    console.error('Content generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during content generation',
    };
  }
}

// Convenience function for generating just a description
export async function generateDescription(
  content: string,
  hub: 'enablement' | 'content' | 'coe'
): Promise<string | null> {
  const result = await generateContent({
    text: content,
    hub,
    generateFields: ['description'],
  });

  return result.success ? result.content?.description || null : null;
}

// Convenience function for generating training content
export async function generateTrainingContent(
  content: string,
  fields: Array<'takeaways' | 'howtos' | 'tips'> = ['takeaways', 'howtos', 'tips']
): Promise<GeneratedContent | null> {
  const result = await generateContent({
    text: content,
    hub: 'enablement',
    generateFields: fields,
  });

  return result.success ? result.content || null : null;
}

// Export types
export type { GenerationConfig } from './prompts';
export type { CrawlResult } from './url-crawler';
export type { TranscriptResult } from './transcript-fetcher';
