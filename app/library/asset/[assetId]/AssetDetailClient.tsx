'use client';

import { useState } from 'react';

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

// Helper to convert video URLs to embeddable format
function getEmbedUrl(url: string): { embedUrl: string; type: 'loom' | 'youtube' | 'vimeo' | 'gdrive' | 'direct' | null } {
  if (!url) return { embedUrl: '', type: null };

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

  // Google Drive - convert to preview/embed URL
  const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdriveMatch) {
    return { embedUrl: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`, type: 'gdrive' };
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

  // Get embeddable video URL
  const videoEmbed = asset.videoUrl ? getEmbedUrl(asset.videoUrl) : { embedUrl: '', type: null };
  const canEmbedVideo = videoEmbed.type !== null;

  // Get preview embed URL for documents/slides
  const previewEmbed = asset.primaryLink ? getPreviewEmbedUrl(asset.primaryLink) : { embedUrl: '', type: null, label: '' };
  const canPreview = previewEmbed.type !== null;

  // The copyable link should be the actual asset URL (primaryLink), not the internal website URL
  const copyableAssetLink = asset.primaryLink || shareableLink;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const hasMaterials = asset.videoUrl || asset.slidesUrl || asset.keyAssetUrl || asset.transcriptUrl;

  return (
    <>
      {/* Asset Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: hubStyle.light,
              color: hubStyle.accent,
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }} />
            {hubName}
          </span>
          <button
            onClick={() => copyToClipboard(copyableAssetLink)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: hubStyle.primary,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </button>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '10px', lineHeight: 1.3 }}>
          {asset.title}
        </h1>

        {(presentersString || formattedDate || formattedDuration) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4B5563', marginBottom: '12px' }}>
            {presentersString && <span>Presented by {presentersString}</span>}
            {presentersString && formattedDate && <span style={{ color: '#D1D5DB' }}>•</span>}
            {formattedDate && <span>{formattedDate}</span>}
            {(presentersString || formattedDate) && formattedDuration && <span style={{ color: '#D1D5DB' }}>•</span>}
            {formattedDuration && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {formattedDuration}
              </span>
            )}
          </div>
        )}

        {asset.description && (
          <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: 1.6 }}>
            {asset.description}
          </p>
        )}
      </div>

      {/* Shareable Link - shows the actual asset URL (Google Slides, Drive, etc.) */}
      {asset.primaryLink && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '10px',
            marginBottom: '24px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <a
            href={copyableAssetLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              fontSize: '13px',
              color: hubStyle.primary,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {copyableAssetLink}
          </a>
          <button
            onClick={() => copyToClipboard(copyableAssetLink)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#4B5563',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
          </button>
        </div>
      )}

      {/* Document/Slides Preview */}
      {canPreview && !asset.videoUrl && (
        <div
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

      {/* Open Asset Button (when no preview available and not a video/training asset) */}
      {!canPreview && !asset.videoUrl && asset.primaryLink && (
        <a
          href={asset.primaryLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 24px',
            background: hubStyle.primary,
            borderRadius: '10px',
            color: 'white',
            fontSize: '15px',
            fontWeight: 500,
            textDecoration: 'none',
            marginBottom: '24px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Open Asset
        </a>
      )}

      {/* Two Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: hasMaterials ? '1fr 300px' : '1fr',
          gap: '28px',
          maxWidth: '1200px',
        }}
      >
        {/* Main Content Column */}
        <div style={{ minWidth: 0 }}>
          {/* Video Container */}
          {(asset.videoUrl || isTrainingAsset) && (
            <div
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
                      src={videoEmbed.embedUrl + (videoEmbed.type === 'youtube' ? '?autoplay=1' : '')}
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
                      cursor: asset.videoUrl ? 'pointer' : 'default',
                    }}
                    onClick={() => {
                      if (canEmbedVideo) {
                        setIsVideoPlaying(true);
                      } else if (asset.videoUrl) {
                        window.open(asset.videoUrl, '_blank');
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
                    {asset.videoUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canEmbedVideo) {
                            setIsVideoPlaying(true);
                          } else {
                            window.open(asset.videoUrl!, '_blank');
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
                  {asset.videoUrl && (
                    <a
                      href={asset.videoUrl}
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
            {/* Session Materials */}
            <div
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '20px',
              }}
            >
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #E5E7EB', background: '#FAFAFA' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Session Materials</h3>
              </div>
              <div style={{ padding: '12px' }}>
                {asset.videoUrl && (
                  <a
                    href={asset.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#111827',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = hubStyle.hover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
                {asset.slidesUrl && (
                  <a
                    href={asset.slidesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#111827',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = hubStyle.hover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
                {asset.keyAssetUrl && (
                  <a
                    href={asset.keyAssetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#111827',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = hubStyle.hover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
                {asset.transcriptUrl && (
                  <a
                    href={asset.transcriptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#111827',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = hubStyle.hover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
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
