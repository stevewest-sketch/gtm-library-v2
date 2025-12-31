'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Helper to get embed URL for various document/content types
function getPreviewEmbedUrl(url: string): { embedUrl: string; type: 'gslides' | 'gdocs' | 'gsheets' | 'gdrive' | 'figma' | 'canva' | 'miro' | 'pdf' | null; label: string } {
  if (!url) return { embedUrl: '', type: null, label: '' };

  // Google Slides
  const gslidesMatch = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (gslidesMatch) {
    return {
      embedUrl: `https://docs.google.com/presentation/d/${gslidesMatch[1]}/embed?start=false&loop=false&delayms=3000`,
      type: 'gslides',
      label: 'Google Slides'
    };
  }

  // Google Docs
  const gdocsMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (gdocsMatch) {
    return {
      embedUrl: `https://docs.google.com/document/d/${gdocsMatch[1]}/preview`,
      type: 'gdocs',
      label: 'Google Docs'
    };
  }

  // Google Sheets
  const gsheetsMatch = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (gsheetsMatch) {
    return {
      embedUrl: `https://docs.google.com/spreadsheets/d/${gsheetsMatch[1]}/preview`,
      type: 'gsheets',
      label: 'Google Sheets'
    };
  }

  // Google Drive file (PDFs, images, etc.)
  const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdriveMatch) {
    return {
      embedUrl: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`,
      type: 'gdrive',
      label: 'Google Drive'
    };
  }

  // Figma
  const figmaMatch = url.match(/figma\.com\/(file|proto|design)\/([a-zA-Z0-9]+)/);
  if (figmaMatch) {
    return {
      embedUrl: `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`,
      type: 'figma',
      label: 'Figma'
    };
  }

  // Canva
  const canvaMatch = url.match(/canva\.com\/design\/([a-zA-Z0-9_-]+)/);
  if (canvaMatch) {
    // Canva embed format: add /view at end if not present
    const embedUrl = url.includes('/view') ? url : `${url}/view?embed`;
    return {
      embedUrl,
      type: 'canva',
      label: 'Canva'
    };
  }

  // Miro
  const miroMatch = url.match(/miro\.com\/app\/board\/([a-zA-Z0-9_=-]+)/);
  if (miroMatch) {
    return {
      embedUrl: `https://miro.com/app/live-embed/${miroMatch[1]}/`,
      type: 'miro',
      label: 'Miro'
    };
  }

  // Direct PDF
  if (url.match(/\.pdf(\?|$)/i)) {
    return { embedUrl: url, type: 'pdf', label: 'PDF Document' };
  }

  return { embedUrl: '', type: null, label: '' };
}

// Document formats that should NOT be treated as video even on Google Drive
const DOCUMENT_FORMATS = ['pdf', 'document', 'slides', 'spreadsheet', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];

// Helper to convert video URLs to embeddable format
// Pass assetFormat to prevent document files from being treated as videos
function getEmbedUrl(url: string, assetFormat?: string | null): { embedUrl: string; type: 'loom' | 'youtube' | 'vimeo' | 'gdrive' | 'wistia' | 'direct' | null } {
  if (!url) return { embedUrl: '', type: null };

  // Wistia
  const wistiaMatch = url.match(/wistia\.com\/medias\/([a-zA-Z0-9]+)/);
  if (wistiaMatch) {
    return { embedUrl: `https://fast.wistia.net/embed/iframe/${wistiaMatch[1]}`, type: 'wistia' };
  }

  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomMatch) {
    return { embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`, type: 'loom' };
  }

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) {
    return { embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`, type: 'youtube' };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return { embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`, type: 'vimeo' };
  }

  // Google Drive - only treat as video if asset format is NOT a document type
  // This allows PDFs and other documents to use the document preview instead
  const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdriveMatch) {
    const isDocumentFormat = assetFormat && DOCUMENT_FORMATS.includes(assetFormat.toLowerCase());
    if (!isDocumentFormat) {
      return { embedUrl: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`, type: 'gdrive' };
    }
    // If it's a document format, return null type so it falls through to document preview
    return { embedUrl: '', type: null };
  }

  // Direct video files (.mp4, .webm, etc.)
  if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) {
    return { embedUrl: url, type: 'direct' };
  }

  // Unknown format - return original
  return { embedUrl: url, type: null };
}

interface AssetDetailClientProps {
  asset: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    hub: string | null;
    format: string | null;
    types: string[] | null;
    primaryLink: string | null;
    videoUrl: string | null;
    slidesUrl: string | null;
    keyAssetUrl: string | null;
    transcriptUrl: string | null;
    presenters: string[] | null;
    durationMinutes: number | null;
    eventDate: string | null;
    takeaways: string[] | null;
    howtos: { title: string; content: string }[] | null;
    tips: string[] | null;
    views: number | null;
    shares: number | null;
    tags: string[] | null;
    createdAt: string | null;
    updatedAt: string | null;
  };
  hubStyle: { primary: string; light: string; accent: string; hover: string };
  hubLabel: string;
  hubName: string;
  formattedDate: string | null;
  formattedDuration: string | null;
  presentersString: string | null;
  isTrainingAsset: boolean;
  shareableLink: string;
  assetBoardsData: { id: string; slug: string; name: string; color: string | null }[];
  assetTagsData: { id: string; slug: string; name: string }[];
}

export function AssetDetailClient({
  asset,
  hubStyle,
  hubLabel,
  hubName,
  formattedDate,
  formattedDuration,
  presentersString,
  isTrainingAsset,
  shareableLink,
  assetBoardsData,
  assetTagsData,
}: AssetDetailClientProps) {
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [takeawaysExpanded, setTakeawaysExpanded] = useState(true);
  const [howToExpanded, setHowToExpanded] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const hasTrackedView = useRef(false);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);

  // Track view on page load (once per session)
  useEffect(() => {
    if (hasTrackedView.current) return;
    hasTrackedView.current = true;

    const trackView = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetId: asset.id,
            action: 'view',
            source: 'direct',
          }),
        });
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    };

    trackView();
  }, [asset.id]);

  // Track share action
  const trackShare = useCallback(async () => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: asset.id,
          action: 'share',
        }),
      });
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  }, [asset.id]);

  // Get embeddable video URL - check videoUrl first, then primaryLink for video content
  // Pass asset.format to prevent document types (PDFs, etc.) from being treated as videos
  const videoEmbedFromVideoUrl = asset.videoUrl ? getEmbedUrl(asset.videoUrl, asset.format) : { embedUrl: '', type: null };
  const videoEmbedFromPrimaryLink = asset.primaryLink ? getEmbedUrl(asset.primaryLink, asset.format) : { embedUrl: '', type: null };
  const videoEmbed = videoEmbedFromVideoUrl.type ? videoEmbedFromVideoUrl : videoEmbedFromPrimaryLink;
  const canEmbedVideo = videoEmbed.type !== null;
  const hasVideo = asset.videoUrl || (videoEmbedFromPrimaryLink.type !== null);
  // The actual video URL to use (from videoUrl field or from primaryLink if it's a video)
  const actualVideoUrl = asset.videoUrl || (videoEmbedFromPrimaryLink.type ? asset.primaryLink : null);

  // Get preview embed URL for documents/slides (only if primaryLink is not a video)
  const previewEmbed = (asset.primaryLink && !videoEmbedFromPrimaryLink.type) ? getPreviewEmbedUrl(asset.primaryLink) : { embedUrl: '', type: null, label: '' };
  const canPreview = previewEmbed.type !== null;

  // The copyable link should be the actual asset URL (primaryLink), not the internal website URL
  const copyableAssetLink = asset.primaryLink || shareableLink;

  const copyToClipboard = async (text: string, isShareAction = true) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
      // Track share when copying link
      if (isShareAction) {
        trackShare();
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const hasMaterials = asset.videoUrl || asset.slidesUrl || asset.keyAssetUrl || asset.transcriptUrl || asset.primaryLink;

  // Build sections list for "On This Page" navigation
  const sections: Array<{ id: string; label: string; icon: string }> = [];
  if (hasVideo || isTrainingAsset) {
    sections.push({ id: 'video-section', label: 'Recording', icon: '🎬' });
  }
  if (canPreview && !hasVideo) {
    sections.push({ id: 'preview-section', label: 'Preview', icon: '📄' });
  }
  if (asset.takeaways && asset.takeaways.length > 0) {
    sections.push({ id: 'takeaways-section', label: 'Key Takeaways', icon: '✅' });
  }
  if (asset.howtos && asset.howtos.length > 0) {
    sections.push({ id: 'howto-section', label: 'How To', icon: '📋' });
  }
  if (asset.tips && asset.tips.length > 0) {
    sections.push({ id: 'tips-section', label: 'Tips & Practices', icon: '💡' });
  }
  if (hasMaterials) {
    sections.push({ id: 'materials-section', label: 'Links', icon: '🔗' });
  }

  const hasContentSections = sections.length > 2; // Show nav if more than just video + materials

  // Calculate sticky header height (64px page header + sticky hero height)
  const getStickyOffset = () => {
    const pageHeaderHeight = 64;
    const stickyHeroHeight = stickyHeaderRef.current?.offsetHeight || 150;
    return pageHeaderHeight + stickyHeroHeight + 20; // 20px extra padding
  };

  // Scroll to section smoothly - position section right below sticky header
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = getStickyOffset();
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // Track which section is currently in view
  useEffect(() => {
    if (sections.length === 0) return;

    const handleScroll = () => {
      const offset = getStickyOffset();
      let currentSection: string | null = null;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Section is considered active if its top is at or above the offset point
          if (rect.top <= offset + 50) {
            currentSection = section.id;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return (
    <>
      {/* Sticky Header Container */}
      <div
        ref={stickyHeaderRef}
        style={{
          position: 'sticky',
          top: '64px', // Below the fixed page header
          zIndex: 40,
          background: 'var(--bg-page, #F9FAFB)',
          marginLeft: '-28px',
          marginRight: '-28px',
          paddingLeft: '28px',
          paddingRight: '28px',
          paddingTop: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        {/* Header Row with Type Badge and Share Button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Type Badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: hubStyle.light,
                color: hubStyle.accent,
                marginBottom: '8px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
              {hubName}
            </span>
            {/* Title */}
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>
              {asset.title}
            </h1>
            {/* Description - truncated */}
            {asset.description && (
              <p style={{
                fontSize: '13px',
                color: '#6B7280',
                lineHeight: 1.5,
                margin: '6px 0 0 0',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {asset.description}
              </p>
            )}
          </div>
          <button
            onClick={() => copyToClipboard(copyableAssetLink)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: hubStyle.primary,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </button>
        </div>

        {/* Pill-style Navigation - similar to board page nav */}
        {hasContentSections && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              marginTop: '12px',
            }}
          >
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  style={{
                    padding: '6px 14px',
                    background: isActive ? hubStyle.primary : 'white',
                    border: `1px solid ${isActive ? hubStyle.primary : '#E5E7EB'}`,
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: isActive ? 'white' : '#4B5563',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = hubStyle.light;
                      e.currentTarget.style.borderColor = hubStyle.accent;
                      e.currentTarget.style.color = hubStyle.accent;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#4B5563';
                    }
                  }}
                >
                  {section.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {/* End Sticky Header Container */}

      {/* Two Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: hasMaterials ? '1fr 300px' : '1fr',
          paddingTop: '24px',
          gap: '28px',
          maxWidth: '1200px',
        }}
      >
        {/* Main Content Column */}
        <div style={{ minWidth: 0 }}>
          {/* Document/Slides Preview (for non-video assets) */}
          {canPreview && !hasVideo && (
            <div
              id="preview-section"
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '16/10',
                  background: '#F9FAFB',
                }}
              >
                <iframe
                  src={previewEmbed.embedUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  allowFullScreen
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderTop: '1px solid #E5E7EB',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4B5563' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  {previewEmbed.label || 'Document'}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={asset.primaryLink!}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: hubStyle.primary,
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: 'white',
                      cursor: 'pointer',
                      textDecoration: 'none',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Open Asset
                  </a>
                  <button
                    onClick={() => copyToClipboard(copyableAssetLink)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#F3F4F6',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#4B5563',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Video Container */}
          {(hasVideo || isTrainingAsset) && (
            <div
              id="video-section"
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '16/9',
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                }}
              >
                {/* Show embedded video player when playing */}
                {isVideoPlaying && canEmbedVideo ? (
                  videoEmbed.type === 'direct' ? (
                    <video
                      src={videoEmbed.embedUrl}
                      controls
                      autoPlay
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <iframe
                      src={
                        videoEmbed.embedUrl +
                        (videoEmbed.type === 'youtube' ? '?autoplay=1' : '') +
                        (videoEmbed.type === 'wistia' ? '?autoPlay=true' : '')
                      }
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                ) : (
                  /* Show thumbnail/play button when not playing */
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: actualVideoUrl ? 'pointer' : 'default',
                    }}
                    onClick={() => {
                      if (canEmbedVideo) {
                        setIsVideoPlaying(true);
                      } else if (actualVideoUrl) {
                        window.open(actualVideoUrl, '_blank');
                      }
                    }}
                  >
                    <div style={{ textAlign: 'center', color: 'white' }}>
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          background: hubStyle.primary,
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '20px',
                          margin: '0 auto 20px',
                        }}
                      >
                        G+
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
                        {asset.title}
                      </div>
                      <div style={{ fontSize: '14px', opacity: 0.7 }}>
                        {asset.description?.substring(0, 50)}...
                      </div>
                    </div>
                    {actualVideoUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canEmbedVideo) {
                            setIsVideoPlaying(true);
                          } else {
                            window.open(actualVideoUrl, '_blank');
                          }
                        }}
                        style={{
                          position: 'absolute',
                          width: '80px',
                          height: '80px',
                          background: hubStyle.primary,
                          border: 'none',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: `0 8px 30px ${hubStyle.primary}66`,
                        }}
                      >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderTop: '1px solid #E5E7EB',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4B5563' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {formattedDuration || 'Duration N/A'}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {actualVideoUrl && (
                    <a
                      href={actualVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: '#F3F4F6',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#4B5563',
                        cursor: 'pointer',
                        textDecoration: 'none',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      Open in New Tab
                    </a>
                  )}
                  <button
                    onClick={() => copyToClipboard(shareableLink)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#F3F4F6',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#4B5563',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Key Takeaways */}
          {asset.takeaways && asset.takeaways.length > 0 && (
            <div
              id="takeaways-section"
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                marginBottom: '20px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 22px',
                  borderBottom: takeawaysExpanded ? '1px solid #F3F4F6' : 'none',
                }}
              >
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Key Takeaways</h2>
                <button
                  onClick={() => setTakeawaysExpanded(!takeawaysExpanded)}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#F3F4F6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#4B5563',
                    transform: takeawaysExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
              {takeawaysExpanded && (
                <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {asset.takeaways.map((takeaway, index) => (
                    <div key={index} style={{ display: 'flex', gap: '14px' }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          background: hubStyle.light,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hubStyle.accent} strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.6 }}>{takeaway}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* How To */}
          {asset.howtos && asset.howtos.length > 0 && (
            <div
              id="howto-section"
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                marginBottom: '20px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 22px',
                  borderBottom: howToExpanded ? '1px solid #F3F4F6' : 'none',
                }}
              >
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>How To</h2>
                <button
                  onClick={() => setHowToExpanded(!howToExpanded)}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#F3F4F6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#4B5563',
                    transform: howToExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
              {howToExpanded && (
                <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {asset.howtos.map((step, index) => (
                    <div key={index} style={{ display: 'flex', gap: '16px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          background: '#EDE9FE',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#6D28D9',
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                          {step.title}
                        </h4>
                        <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.6 }}>{step.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tips Section */}
          {asset.tips && asset.tips.length > 0 && (
            <div
              id="tips-section"
              style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                borderRadius: '12px',
                padding: '22px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#047857',
                  marginBottom: '18px',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Tips & Best Practices
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {asset.tips.map((tip, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      style={{ flexShrink: 0, marginTop: '2px' }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span style={{ fontSize: '14px', color: '#065F46', lineHeight: 1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Column */}
        {hasMaterials && (
          <div style={{ position: 'sticky', top: '84px', alignSelf: 'start' }}>
            {/* Links */}
            <div
              id="materials-section"
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '20px',
              }}
            >
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #E5E7EB', background: '#FAFAFA' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Links</h3>
              </div>
              <div style={{ padding: '12px' }}>
                {actualVideoUrl && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px',
                      borderRadius: '8px',
                      background: '#FAFAFA',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#FEE2E2',
                        color: '#B91C1C',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '2px' }}>Recording</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{formattedDuration || 'Video'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => copyToClipboard(actualVideoUrl, false)}
                        title="Copy link"
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                      <a
                        href={actualVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in new tab"
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          textDecoration: 'none',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
                {asset.slidesUrl && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px',
                      borderRadius: '8px',
                      background: '#FAFAFA',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#FEF3C7',
                        color: '#B45309',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8" />
                        <path d="M12 17v4" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '2px' }}>Presentation</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Slides</div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => copyToClipboard(asset.slidesUrl!, false)}
                        title="Copy link"
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                      <a
                        href={asset.slidesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in new tab"
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          textDecoration: 'none',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
                {asset.keyAssetUrl && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px',
                      borderRadius: '8px',
                      background: '#FAFAFA',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#DBEAFE',
                        color: '#1D4ED8',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '2px' }}>Key Document</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Document</div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => copyToClipboard(asset.keyAssetUrl!, false)}
                        title="Copy link"
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                      <a
                        href={asset.keyAssetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in new tab"
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          textDecoration: 'none',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
                {asset.transcriptUrl && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px',
                      borderRadius: '8px',
                      background: '#FAFAFA',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: hubStyle.light,
                        color: hubStyle.accent,
                        flexShrink: 0,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <line x1="10" y1="9" x2="8" y2="9" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '2px' }}>Transcript</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>AI-generated</div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => copyToClipboard(asset.transcriptUrl!, false)}
                        title="Copy link"
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                      <a
                        href={asset.transcriptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in new tab"
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          textDecoration: 'none',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
                {asset.primaryLink && !hasVideo && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px',
                      borderRadius: '8px',
                      background: '#FAFAFA',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: hubStyle.light,
                        color: hubStyle.accent,
                        flexShrink: 0,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827', marginBottom: '2px' }}>
                        {previewEmbed.label || 'Primary Asset'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Document</div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => copyToClipboard(asset.primaryLink!, false)}
                        title="Copy link"
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                      <a
                        href={asset.primaryLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in new tab"
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          textDecoration: 'none',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#9CA3AF',
                  marginBottom: '16px',
                }}
              >
                Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Hub</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      background: hubStyle.light,
                      color: hubStyle.accent,
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                    {hubName}
                  </span>
                </div>
                {asset.types && asset.types.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Type</span>
                    <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500, textTransform: 'capitalize' }}>
                      {asset.types[0]}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Format</span>
                  <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500, textTransform: 'capitalize' }}>
                    {asset.format || 'Document'}
                  </span>
                </div>
                {formattedDuration && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Duration</span>
                    <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{formattedDuration}</span>
                  </div>
                )}
                {asset.views !== null && asset.views !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Views</span>
                    <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{asset.views}</span>
                  </div>
                )}
                {assetBoardsData.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Boards</span>
                    <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>
                      {assetBoardsData.map((b) => b.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {((asset.tags && asset.tags.length > 0) || assetTagsData.length > 0) && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '8px', width: '100%' }}>Tags</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(assetTagsData.length > 0 ? assetTagsData.map((t) => t.name) : asset.tags || []).map((tag, index) => (
                      <span
                        key={`${tag}-${index}`}
                        style={{
                          fontSize: '11px',
                          padding: '4px 10px',
                          background: '#F3F4F6',
                          borderRadius: '4px',
                          color: '#4B5563',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Copy Toast */}
      <div
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: `translateX(-50%) translateY(${showCopyToast ? '0' : '100px'})`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 20px',
          background: '#111827',
          color: 'white',
          borderRadius: '10px',
          fontSize: '14px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          opacity: showCopyToast ? 1 : 0,
          transition: 'all 0.3s ease',
          zIndex: 2000,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Link copied to clipboard
      </div>
    </>
  );
}
