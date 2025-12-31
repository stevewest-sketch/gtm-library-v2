// URL content extraction utilities

import * as cheerio from 'cheerio';

export interface CrawlResult {
  success: boolean;
  title?: string;
  content?: string;
  links?: ExtractedLinks;
  error?: string;
  sourceType?: 'webpage' | 'google-doc' | 'google-slides' | 'loom' | 'youtube' | 'notion';
}

export interface ExtractedLinks {
  videoUrl?: string;
  slidesUrl?: string;
  transcriptUrl?: string;
  primaryLink?: string;
}

// Detect the type of URL
export function detectUrlType(url: string): CrawlResult['sourceType'] {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('docs.google.com/document')) return 'google-doc';
  if (urlLower.includes('docs.google.com/presentation')) return 'google-slides';
  if (urlLower.includes('loom.com')) return 'loom';
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
  if (urlLower.includes('notion.so') || urlLower.includes('notion.site')) return 'notion';

  return 'webpage';
}

// Extract Google Doc ID from URL
function extractGoogleDocId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Extract Loom video ID
function extractLoomId(url: string): string | null {
  const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

// Crawl a standard webpage
async function crawlWebpage(url: string): Promise<CrawlResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GTMHubBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script, style, nav, footer elements
    $('script, style, nav, footer, header, aside, .nav, .footer, .header, .sidebar').remove();

    // Extract title
    const title = $('title').text().trim() ||
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      '';

    // Extract main content
    let content = '';

    // Try common content selectors
    const contentSelectors = [
      'article',
      'main',
      '.content',
      '.post-content',
      '.article-content',
      '.entry-content',
      '#content',
      '.prose',
    ];

    for (const selector of contentSelectors) {
      const el = $(selector);
      if (el.length && el.text().trim().length > 200) {
        content = el.text().trim();
        break;
      }
    }

    // Fallback to body text
    if (!content) {
      content = $('body').text().trim();
    }

    // Clean up whitespace
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Limit content length (Claude has context limits)
    if (content.length > 50000) {
      content = content.substring(0, 50000) + '... [truncated]';
    }

    // Extract any embedded links
    const links: ExtractedLinks = {};

    // Look for video embeds
    $('iframe').each((_, el) => {
      const src = $(el).attr('src') || '';
      if (src.includes('youtube') || src.includes('vimeo') || src.includes('loom')) {
        links.videoUrl = src;
      }
    });

    // Look for linked resources
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().toLowerCase();

      if (href.includes('docs.google.com/presentation') || text.includes('slides')) {
        links.slidesUrl = href;
      }
      if (text.includes('transcript')) {
        links.transcriptUrl = href;
      }
    });

    return {
      success: true,
      title,
      content,
      links,
      sourceType: 'webpage',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Crawl Google Doc (published/shared)
async function crawlGoogleDoc(url: string): Promise<CrawlResult> {
  const docId = extractGoogleDocId(url);
  if (!docId) {
    return { success: false, error: 'Could not extract Google Doc ID' };
  }

  try {
    // Try to fetch the published HTML version
    const publishedUrl = `https://docs.google.com/document/d/${docId}/pub`;
    const response = await fetch(publishedUrl);

    if (!response.ok) {
      // Try export as text
      const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
      const textResponse = await fetch(exportUrl);

      if (!textResponse.ok) {
        return { success: false, error: 'Could not access Google Doc. Make sure it is publicly shared.' };
      }

      const text = await textResponse.text();
      return {
        success: true,
        content: text,
        sourceType: 'google-doc',
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('title').text().replace(' - Google Docs', '').trim();
    const content = $('#contents').text().trim() || $('body').text().trim();

    return {
      success: true,
      title,
      content,
      sourceType: 'google-doc',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Google Doc',
    };
  }
}

// Crawl Google Slides (extract speaker notes if available)
async function crawlGoogleSlides(url: string): Promise<CrawlResult> {
  const docId = extractGoogleDocId(url);
  if (!docId) {
    return { success: false, error: 'Could not extract Google Slides ID' };
  }

  try {
    // Try to fetch as text (includes speaker notes)
    const exportUrl = `https://docs.google.com/presentation/d/${docId}/export?format=txt`;
    const response = await fetch(exportUrl);

    if (!response.ok) {
      return { success: false, error: 'Could not access Google Slides. Make sure it is publicly shared.' };
    }

    const text = await response.text();

    return {
      success: true,
      content: text,
      sourceType: 'google-slides',
      links: {
        slidesUrl: url,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Google Slides',
    };
  }
}

// Get Loom video metadata
async function crawlLoom(url: string): Promise<CrawlResult> {
  const loomId = extractLoomId(url);
  if (!loomId) {
    return { success: false, error: 'Could not extract Loom video ID' };
  }

  try {
    // Fetch the Loom page to extract metadata
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GTMHubBot/1.0)',
      },
    });

    if (!response.ok) {
      return { success: false, error: 'Could not access Loom video' };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') ||
      $('title').text().replace(' | Loom', '').trim();

    const description = $('meta[property="og:description"]').attr('content') || '';

    // Look for transcript in page (Loom sometimes includes it)
    let transcript = '';
    $('[data-testid="transcript"]').each((_, el) => {
      transcript += $(el).text() + '\n';
    });

    // Also check for JSON-LD data
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || '{}');
        if (data.transcript) {
          transcript = data.transcript;
        }
      } catch {
        // Ignore JSON parse errors
      }
    });

    return {
      success: true,
      title,
      content: transcript || description || `Loom video: ${title}`,
      sourceType: 'loom',
      links: {
        videoUrl: url,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Loom video',
    };
  }
}

// Get YouTube video metadata
async function crawlYouTube(url: string): Promise<CrawlResult> {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    return { success: false, error: 'Could not extract YouTube video ID' };
  }

  try {
    // Fetch the YouTube page for metadata
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GTMHubBot/1.0)',
      },
    });

    if (!response.ok) {
      return { success: false, error: 'Could not access YouTube video' };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') ||
      $('title').text().replace(' - YouTube', '').trim();

    const description = $('meta[property="og:description"]').attr('content') || '';

    return {
      success: true,
      title,
      content: description || `YouTube video: ${title}`,
      sourceType: 'youtube',
      links: {
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch YouTube video',
    };
  }
}

// Main crawler function - routes to appropriate handler
export async function crawlUrl(url: string): Promise<CrawlResult> {
  if (!url || typeof url !== 'string') {
    return { success: false, error: 'Invalid URL provided' };
  }

  // Ensure URL has protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const sourceType = detectUrlType(url);

  switch (sourceType) {
    case 'google-doc':
      return crawlGoogleDoc(url);
    case 'google-slides':
      return crawlGoogleSlides(url);
    case 'loom':
      return crawlLoom(url);
    case 'youtube':
      return crawlYouTube(url);
    default:
      return crawlWebpage(url);
  }
}

// Utility to combine multiple content sources
export function combineContent(sources: CrawlResult[]): string {
  return sources
    .filter(s => s.success && s.content)
    .map(s => {
      const header = s.title ? `## ${s.title}\n` : '';
      const sourceLabel = s.sourceType ? `[Source: ${s.sourceType}]\n` : '';
      return `${header}${sourceLabel}${s.content}`;
    })
    .join('\n\n---\n\n');
}
