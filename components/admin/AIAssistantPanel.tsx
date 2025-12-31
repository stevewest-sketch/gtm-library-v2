'use client';

import { useState, useCallback } from 'react';

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

interface AIAssistantPanelProps {
  hub: 'enablement' | 'content' | 'coe';
  format?: string;
  existingAsset?: Record<string, unknown>;
  onApply: (content: Partial<GeneratedContent>) => void;
  onClose: () => void;
}

type GeneratableField = 'description' | 'shortDescription' | 'takeaways' | 'howtos' | 'tips' | 'tags' | 'suggestedType';

const FIELD_OPTIONS: { key: GeneratableField; label: string; enablementOnly?: boolean; contentOnly?: boolean }[] = [
  { key: 'description', label: 'Description' },
  { key: 'shortDescription', label: 'Short Description (6 words)' },
  { key: 'takeaways', label: 'Key Takeaways', enablementOnly: true },
  { key: 'howtos', label: 'How-To Steps', enablementOnly: true },
  { key: 'tips', label: 'Tips & Best Practices' },
  { key: 'tags', label: 'Suggested Tags' },
  { key: 'suggestedType', label: 'Suggested Content Type' },
];

// Helper to get display-friendly existing asset info
function getExistingFieldsSummary(asset?: Record<string, unknown>): { label: string; value: string }[] {
  if (!asset) return [];
  const fields: { label: string; value: string }[] = [];

  if (asset.title && typeof asset.title === 'string') {
    fields.push({ label: 'Title', value: asset.title });
  }
  if (asset.hub && typeof asset.hub === 'string') {
    fields.push({ label: 'Hub', value: asset.hub });
  }
  if (asset.format && typeof asset.format === 'string') {
    fields.push({ label: 'Format', value: asset.format });
  }
  if (asset.types && Array.isArray(asset.types) && asset.types.length > 0) {
    fields.push({ label: 'Type', value: asset.types.join(', ') });
  }
  if (asset.primaryLink && typeof asset.primaryLink === 'string') {
    fields.push({ label: 'Primary Link', value: asset.primaryLink.substring(0, 50) + (asset.primaryLink.length > 50 ? '...' : '') });
  }
  if (asset.videoUrl && typeof asset.videoUrl === 'string') {
    fields.push({ label: 'Video URL', value: asset.videoUrl.substring(0, 50) + (asset.videoUrl.length > 50 ? '...' : '') });
  }

  return fields;
}

export default function AIAssistantPanel({
  hub,
  format,
  existingAsset,
  onApply,
  onClose,
}: AIAssistantPanelProps) {
  const [aiContentUrl, setAiContentUrl] = useState('');
  const [text, setText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [useExistingFields, setUseExistingFields] = useState(true);
  const [selectedFields, setSelectedFields] = useState<GeneratableField[]>(() => {
    if (hub === 'enablement') {
      return ['description', 'takeaways', 'howtos', 'tips'];
    }
    return ['description', 'shortDescription', 'tips'];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [selectedToApply, setSelectedToApply] = useState<Set<string>>(new Set());

  const existingFieldsSummary = getExistingFieldsSummary(existingAsset);

  const toggleField = (field: GeneratableField) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleGenerate = useCallback(async () => {
    // Need at least one source: URL, text, or existing asset fields
    const hasExistingContext = useExistingFields && existingFieldsSummary.length > 0;
    if (!aiContentUrl && !text && !hasExistingContext) {
      setError('Please provide a URL, paste content, or ensure existing asset fields are available.');
      return;
    }

    if (selectedFields.length === 0) {
      setError('Please select at least one field to generate.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: aiContentUrl || undefined,
          text: text || undefined,
          existingAsset: useExistingFields ? existingAsset : undefined,
          hub,
          format,
          generateFields: selectedFields,
          prompt: prompt || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      if (data.success && data.content) {
        setGeneratedContent(data.content);
        // Auto-select all generated fields for applying
        const generated = Object.keys(data.content).filter(
          k => data.content[k] != null && (Array.isArray(data.content[k]) ? data.content[k].length > 0 : true)
        );
        setSelectedToApply(new Set(generated));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  }, [aiContentUrl, text, prompt, selectedFields, hub, format, existingAsset, useExistingFields, existingFieldsSummary.length]);

  const toggleApplyField = (field: string) => {
    setSelectedToApply(prev => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  };

  const handleApply = () => {
    if (!generatedContent) return;

    const toApply: Partial<GeneratedContent> = {};

    if (selectedToApply.has('description') && generatedContent.description) {
      toApply.description = generatedContent.description;
    }
    if (selectedToApply.has('shortDescription') && generatedContent.shortDescription) {
      toApply.shortDescription = generatedContent.shortDescription;
    }
    if (selectedToApply.has('takeaways') && generatedContent.takeaways) {
      toApply.takeaways = generatedContent.takeaways;
    }
    if (selectedToApply.has('howtos') && generatedContent.howtos) {
      toApply.howtos = generatedContent.howtos;
    }
    if (selectedToApply.has('tips') && generatedContent.tips) {
      toApply.tips = generatedContent.tips;
    }
    if (selectedToApply.has('suggestedTags') && generatedContent.suggestedTags) {
      toApply.suggestedTags = generatedContent.suggestedTags;
    }
    if (selectedToApply.has('suggestedType') && generatedContent.suggestedType) {
      toApply.suggestedType = generatedContent.suggestedType;
    }
    if (selectedToApply.has('extractedLinks') && generatedContent.extractedLinks) {
      toApply.extractedLinks = generatedContent.extractedLinks;
    }

    onApply(toApply);
    onClose();
  };

  const availableFields = FIELD_OPTIONS.filter(f => {
    if (f.enablementOnly && hub !== 'enablement') return false;
    if (f.contentOnly && hub === 'enablement') return false;
    return true;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          width: '640px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4338CA 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
              }}
            >
              ✨
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>
                AI Content Assistant
              </h2>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                Generate content from URLs, transcripts, or text
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Existing Asset Fields Section */}
          {existingFieldsSummary.length > 0 && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 14px',
                background: useExistingFields ? '#F0FDF4' : '#F9FAFB',
                border: useExistingFields ? '1px solid #86EFAC' : '1px solid #E5E7EB',
                borderRadius: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  id="useExistingFields"
                  checked={useExistingFields}
                  onChange={(e) => setUseExistingFields(e.target.checked)}
                  style={{ accentColor: '#10B981', width: '16px', height: '16px' }}
                />
                <label
                  htmlFor="useExistingFields"
                  style={{ fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}
                >
                  Use Existing Asset Fields
                </label>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '26px' }}>
                {existingFieldsSummary.map((field, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '4px 10px',
                      background: useExistingFields ? '#DCFCE7' : '#F3F4F6',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: useExistingFields ? '#166534' : '#6B7280',
                    }}
                  >
                    <strong>{field.label}:</strong> {field.value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Content URL Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
              AI Content URL
              <span style={{ fontWeight: 400, color: '#9CA3AF', marginLeft: '8px' }}>
                (for content generation only - not saved to asset)
              </span>
            </label>
            <input
              type="text"
              value={aiContentUrl}
              onChange={(e) => setAiContentUrl(e.target.value)}
              placeholder="https://docs.google.com/... or https://loom.com/share/..."
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
              Crawls this URL to generate content. Supports: Web pages, Google Docs/Slides, Loom, YouTube
            </p>
          </div>

          {/* Text Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
              Or Paste Content
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste transcript, document text, or any content..."
              rows={5}
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Prompt/Guidance */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
              Additional Guidance (optional)
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Focus on objection handling techniques..."
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Field Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '10px' }}>
              Fields to Generate
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableFields.map((field) => (
                <button
                  key={field.key}
                  onClick={() => toggleField(field.key)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: selectedFields.includes(field.key)
                      ? '2px solid #7C3AED'
                      : '1px solid #E5E7EB',
                    background: selectedFields.includes(field.key) ? '#F5F3FF' : 'white',
                    color: selectedFields.includes(field.key) ? '#5B21B6' : '#4B5563',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {selectedFields.includes(field.key) ? '✓ ' : ''}{field.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                background: '#FEE2E2',
                borderRadius: '8px',
                color: '#DC2626',
                fontSize: '14px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          {/* Generate Button */}
          {!generatedContent && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                width: '100%',
                padding: '14px',
                background: isGenerating
                  ? '#C4B5FD'
                  : 'linear-gradient(135deg, #4338CA 0%, #7C3AED 100%)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isGenerating ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite' }}>⚙️</span>
                  Generating...
                </>
              ) : (
                <>
                  ✨ Generate Content
                </>
              )}
            </button>
          )}

          {/* Generated Content Preview */}
          {generatedContent && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                Generated Content
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {generatedContent.description && (
                  <PreviewItem
                    label="Description"
                    selected={selectedToApply.has('description')}
                    onToggle={() => toggleApplyField('description')}
                  >
                    {generatedContent.description}
                  </PreviewItem>
                )}

                {generatedContent.shortDescription && (
                  <PreviewItem
                    label="Short Description"
                    selected={selectedToApply.has('shortDescription')}
                    onToggle={() => toggleApplyField('shortDescription')}
                  >
                    {generatedContent.shortDescription}
                  </PreviewItem>
                )}

                {generatedContent.takeaways && generatedContent.takeaways.length > 0 && (
                  <PreviewItem
                    label="Key Takeaways"
                    selected={selectedToApply.has('takeaways')}
                    onToggle={() => toggleApplyField('takeaways')}
                  >
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {generatedContent.takeaways.map((t, i) => (
                        <li key={i} style={{ fontSize: '13px', marginBottom: '4px' }}>{t}</li>
                      ))}
                    </ul>
                  </PreviewItem>
                )}

                {generatedContent.howtos && generatedContent.howtos.length > 0 && (
                  <PreviewItem
                    label="How-To Steps"
                    selected={selectedToApply.has('howtos')}
                    onToggle={() => toggleApplyField('howtos')}
                  >
                    {generatedContent.howtos.map((h, i) => (
                      <div key={i} style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '13px' }}>Step {i + 1}: {h.title}</strong>
                        <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>{h.content}</p>
                      </div>
                    ))}
                  </PreviewItem>
                )}

                {generatedContent.tips && generatedContent.tips.length > 0 && (
                  <PreviewItem
                    label="Tips & Best Practices"
                    selected={selectedToApply.has('tips')}
                    onToggle={() => toggleApplyField('tips')}
                  >
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {generatedContent.tips.map((t, i) => (
                        <li key={i} style={{ fontSize: '13px', marginBottom: '4px' }}>{t}</li>
                      ))}
                    </ul>
                  </PreviewItem>
                )}

                {generatedContent.suggestedTags && generatedContent.suggestedTags.length > 0 && (
                  <PreviewItem
                    label="Suggested Tags"
                    selected={selectedToApply.has('suggestedTags')}
                    onToggle={() => toggleApplyField('suggestedTags')}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {generatedContent.suggestedTags.map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '4px 10px',
                            background: '#F3F4F6',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#4B5563',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </PreviewItem>
                )}

                {generatedContent.suggestedType && (
                  <PreviewItem
                    label="Suggested Content Type"
                    selected={selectedToApply.has('suggestedType')}
                    onToggle={() => toggleApplyField('suggestedType')}
                  >
                    <span
                      style={{
                        padding: '4px 10px',
                        background: '#EDE9FE',
                        color: '#5B21B6',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}
                    >
                      {generatedContent.suggestedType}
                    </span>
                  </PreviewItem>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {generatedContent && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => {
                setGeneratedContent(null);
                setSelectedToApply(new Set());
              }}
              style={{
                padding: '10px 18px',
                background: '#F3F4F6',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#4B5563',
                cursor: 'pointer',
              }}
            >
              Regenerate
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 18px',
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#4B5563',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={selectedToApply.size === 0}
                style={{
                  padding: '10px 24px',
                  background: selectedToApply.size === 0 ? '#E5E7EB' : '#10B981',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: selectedToApply.size === 0 ? '#9CA3AF' : 'white',
                  cursor: selectedToApply.size === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Apply Selected ({selectedToApply.size})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Preview Item Component
function PreviewItem({
  label,
  selected,
  onToggle,
  children,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: '10px',
        border: selected ? '2px solid #10B981' : '1px solid #E5E7EB',
        background: selected ? '#ECFDF5' : 'white',
        cursor: 'pointer',
      }}
      onClick={onToggle}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          style={{ accentColor: '#10B981' }}
        />
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
      </div>
      <div style={{ color: '#374151' }}>{children}</div>
    </div>
  );
}
