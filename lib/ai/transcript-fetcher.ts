// Transcript fetching utilities for video platforms

import * as cheerio from 'cheerio';

export interface TranscriptResult {
  success: boolean;
  transcript?: string;
  title?: string;
  duration?: number; // in minutes
  error?: string;
}

// Fetch YouTube transcript using available methods
export async function fetchYouTubeTranscript(videoUrl: string): Promise<TranscriptResult> {
  // Extract video ID
  const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (!videoIdMatch) {
    return { success: false, error: 'Could not extract YouTube video ID' };
  }

  const videoId = videoIdMatch[1];

  try {
    // First, try to get video info from the page
    const pageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!pageResponse.ok) {
      return { success: false, error: 'Could not access YouTube video' };
    }

    const html = await pageResponse.text();
    const $ = cheerio.load(html);

    // Get title
    const title = $('meta[property="og:title"]').attr('content') ||
      $('title').text().replace(' - YouTube', '').trim();

    // Try to extract duration from meta
    let duration: number | undefined;
    const durationMeta = $('meta[itemprop="duration"]').attr('content');
    if (durationMeta) {
      // Parse ISO 8601 duration (PT1H30M45S)
      const match = durationMeta.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (match) {
        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = parseInt(match[3] || '0');
        duration = Math.round(hours * 60 + minutes + seconds / 60);
      }
    }

    // Try to find transcript in page data
    let transcript = '';

    // Look for captions in the initial data
    const scriptTags = $('script').toArray();
    for (const script of scriptTags) {
      const content = $(script).html() || '';

      // Look for ytInitialPlayerResponse which contains caption info
      if (content.includes('ytInitialPlayerResponse')) {
        try {
          const match = content.match(/ytInitialPlayerResponse\s*=\s*(\{[\s\S]+?\});/);
          if (match) {
            const data = JSON.parse(match[1]);
            const captions = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

            if (captions && captions.length > 0) {
              // Find English captions or first available
              const englishCaptions = captions.find((c: { languageCode: string }) => c.languageCode === 'en') || captions[0];

              if (englishCaptions?.baseUrl) {
                // Fetch the transcript
                const transcriptResponse = await fetch(englishCaptions.baseUrl);
                if (transcriptResponse.ok) {
                  const transcriptXml = await transcriptResponse.text();
                  const $transcript = cheerio.load(transcriptXml, { xmlMode: true });

                  // Extract text from transcript XML
                  const lines: string[] = [];
                  $transcript('text').each((_, el) => {
                    const text = $transcript(el).text().trim();
                    if (text) {
                      // Clean up HTML entities and normalize
                      const cleaned = text
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'")
                        .replace(/\n/g, ' ');
                      lines.push(cleaned);
                    }
                  });

                  transcript = lines.join(' ');
                }
              }
            }
          }
        } catch {
          // Continue trying other methods
        }
      }
    }

    if (transcript) {
      return {
        success: true,
        transcript,
        title,
        duration,
      };
    }

    // If no transcript found, return video info without transcript
    return {
      success: true,
      transcript: `Video title: ${title}. Duration: ${duration || 'unknown'} minutes. No transcript available - captions may be disabled for this video.`,
      title,
      duration,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch YouTube transcript',
    };
  }
}

// Fetch Loom transcript
export async function fetchLoomTranscript(videoUrl: string): Promise<TranscriptResult> {
  // Extract Loom video ID
  const loomIdMatch = videoUrl.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (!loomIdMatch) {
    return { success: false, error: 'Could not extract Loom video ID' };
  }

  const loomId = loomIdMatch[1];

  try {
    // Fetch Loom page
    const response = await fetch(`https://www.loom.com/share/${loomId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return { success: false, error: 'Could not access Loom video' };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Get video metadata
    const title = $('meta[property="og:title"]').attr('content') ||
      $('title').text().replace(' | Loom', '').trim();

    // Look for transcript data in the page
    let transcript = '';
    let duration: number | undefined;

    // Loom embeds data in script tags
    $('script').each((_, el) => {
      const content = $(el).html() || '';

      // Look for __NEXT_DATA__ or similar data structures
      if (content.includes('"transcript"') || content.includes('transcription')) {
        try {
          // Try to find JSON with transcript
          const jsonMatches = content.match(/\{[^{}]*"transcript"[^{}]*\}/g);
          if (jsonMatches) {
            for (const match of jsonMatches) {
              try {
                const data = JSON.parse(match);
                if (data.transcript) {
                  transcript = data.transcript;
                  break;
                }
              } catch {
                // Continue
              }
            }
          }

          // Also look for duration
          const durationMatch = content.match(/"duration":\s*(\d+)/);
          if (durationMatch) {
            duration = Math.round(parseInt(durationMatch[1]) / 60);
          }
        } catch {
          // Continue
        }
      }

      // Look for Apollo/GraphQL state
      if (content.includes('__APOLLO_STATE__')) {
        try {
          const match = content.match(/__APOLLO_STATE__\s*=\s*(\{[\s\S]+?\});/);
          if (match) {
            const state = JSON.parse(match[1]);
            // Search through the Apollo state for transcript
            for (const key in state) {
              const item = state[key];
              if (item && typeof item === 'object') {
                if (item.transcription || item.transcript) {
                  transcript = item.transcription || item.transcript;
                }
                if (item.duration && typeof item.duration === 'number') {
                  duration = Math.round(item.duration / 60);
                }
              }
            }
          }
        } catch {
          // Continue
        }
      }
    });

    // Check for transcript element on page
    if (!transcript) {
      const transcriptEl = $('[data-testid="transcript"], .transcript, [class*="transcript"]');
      if (transcriptEl.length) {
        transcript = transcriptEl.text().trim();
      }
    }

    if (transcript) {
      return {
        success: true,
        transcript,
        title,
        duration,
      };
    }

    // Return info without transcript if not found
    const description = $('meta[property="og:description"]').attr('content') || '';

    return {
      success: true,
      transcript: `Loom video: ${title}. ${description}. No transcript available - transcript may need to be generated in Loom.`,
      title,
      duration,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Loom transcript',
    };
  }
}

// Fetch Vimeo transcript/captions
export async function fetchVimeoTranscript(videoUrl: string): Promise<TranscriptResult> {
  // Extract Vimeo video ID
  const vimeoIdMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
  if (!vimeoIdMatch) {
    return { success: false, error: 'Could not extract Vimeo video ID' };
  }

  const vimeoId = vimeoIdMatch[1];

  try {
    // Fetch video page
    const response = await fetch(`https://vimeo.com/${vimeoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return { success: false, error: 'Could not access Vimeo video' };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') ||
      $('title').text().replace(' on Vimeo', '').trim();

    const description = $('meta[property="og:description"]').attr('content') || '';

    // Vimeo transcripts are typically not publicly accessible without API
    return {
      success: true,
      transcript: `Vimeo video: ${title}. ${description}`,
      title,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Vimeo info',
    };
  }
}

// Main function to fetch transcript from any supported platform
export async function fetchTranscript(videoUrl: string): Promise<TranscriptResult> {
  const urlLower = videoUrl.toLowerCase();

  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return fetchYouTubeTranscript(videoUrl);
  }

  if (urlLower.includes('loom.com')) {
    return fetchLoomTranscript(videoUrl);
  }

  if (urlLower.includes('vimeo.com')) {
    return fetchVimeoTranscript(videoUrl);
  }

  return {
    success: false,
    error: 'Unsupported video platform. Supported: YouTube, Loom, Vimeo',
  };
}
