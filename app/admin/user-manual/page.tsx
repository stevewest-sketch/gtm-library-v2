'use client';

import { useState } from 'react';
import Link from 'next/link';

// Table of contents sections
const sections = [
  { id: 'overview', title: 'Overview' },
  { id: 'asset-attributes', title: 'Asset Attributes Reference' },
  { id: 'creating-assets', title: 'Creating Assets' },
  { id: 'editing-assets', title: 'Editing Assets' },
  { id: 'ai-generator', title: 'AI Content Generator' },
  { id: 'boards', title: 'Managing Boards' },
  { id: 'tags', title: 'Managing Tags' },
  { id: 'field-locations', title: 'Field Locations in UI' },
  { id: 'csv-export', title: 'CSV Export & Import' },
  { id: 'bulk-actions', title: 'Bulk Actions' },
];

export default function UserManualPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page, #0D0D12)' }}>
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--card-bg, #1A1A23)',
          borderBottom: '1px solid var(--card-border, #2A2A35)',
          padding: '16px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              href="/admin/manage"
              style={{
                color: 'var(--text-muted, #888)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
              }}
            >
              <span style={{ fontSize: '18px' }}>←</span> Back to Admin
            </Link>
            <div style={{ width: '1px', height: '24px', background: 'var(--card-border, #2A2A35)' }} />
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', margin: 0 }}>
              📖 GTM Library User Manual
            </h1>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted, #888)' }}>
            Last updated: January 2026
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Table of Contents Sidebar */}
        <nav
          style={{
            width: '240px',
            flexShrink: 0,
            position: 'sticky',
            top: '80px',
            height: 'fit-content',
            paddingRight: '24px',
            borderRight: '1px solid var(--card-border, #2A2A35)',
          }}
        >
          <h2 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted, #888)', marginBottom: '16px' }}>
            Table of Contents
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    marginBottom: '4px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeSection === section.id ? 'var(--hover-bg, #252530)' : 'transparent',
                    color: activeSection === section.id ? 'var(--text-primary, #FFFFFF)' : 'var(--text-secondary, #AAA)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: activeSection === section.id ? 500 : 400,
                  }}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, paddingLeft: '48px', maxWidth: '900px' }}>
          {/* Overview Section */}
          <section id="overview" style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Overview
            </h2>
            <p style={{ color: 'var(--text-secondary, #AAA)', lineHeight: 1.7, marginBottom: '16px' }}>
              The GTM Library is a centralized content management system for organizing, discovering, and sharing go-to-market assets across three main hubs:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <HubCard name="Content" color="#8C69F0" description="Marketing materials, decks, competitive intel, messaging" />
              <HubCard name="Enablement" color="#10B981" description="Training videos, courses, how-tos, certifications" />
              <HubCard name="CoE" color="#F59E0B" description="Best practices, proof points, case studies, processes" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px' }}>
              Key Concepts
            </h3>
            <ul style={{ color: 'var(--text-secondary, #AAA)', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Assets</strong> - Individual content items (videos, slides, documents, etc.)</li>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Boards</strong> - Collections/hubs that group related assets (e.g., "Competitive Intel", "Sales Training")</li>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Tags</strong> - Labels that categorize assets and create subsections within boards</li>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Types</strong> - Content type classification (e.g., "Product Demo", "Case Study", "Explainer")</li>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Formats</strong> - Media format (e.g., "Video", "Slides", "Document", "Template")</li>
            </ul>
          </section>

          {/* Asset Attributes Reference */}
          <section id="asset-attributes" style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Asset Attributes Reference
            </h2>
            <p style={{ color: 'var(--text-secondary, #AAA)', lineHeight: 1.7, marginBottom: '24px' }}>
              Every asset has the following fields. Required fields are marked with <span style={{ color: '#EF4444' }}>*</span>
            </p>

            <AttributeTable title="Core Identity" attributes={[
              { name: 'Title', required: true, description: 'The main name of the asset (5-10 words recommended)', example: 'Discovery Best Practices for Enterprise Sales' },
              { name: 'Slug', required: true, description: 'URL-friendly identifier (auto-generated from title)', example: 'discovery-best-practices-enterprise-sales' },
              { name: 'Description', required: false, description: 'Full description shown on detail pages (2-4 sentences)', example: 'Learn the proven discovery techniques used by top performers...' },
              { name: 'Short Description', required: false, description: 'Card preview text - MUST be 6 words or fewer', example: 'Master enterprise discovery call techniques' },
            ]} />

            <AttributeTable title="Classification" attributes={[
              { name: 'Hub', required: true, description: 'Primary category: Content, Enablement, or CoE', example: 'enablement' },
              { name: 'Format', required: true, description: 'Media type: Video, Slides, Document, Template, etc.', example: 'video' },
              { name: 'Type', required: false, description: 'Content category within hub (e.g., "Product Demo", "Best Practices")', example: 'training' },
              { name: 'Tags', required: false, description: 'Labels for categorization and board subsections', example: 'sales, discovery, enterprise' },
              { name: 'Boards', required: false, description: 'Which boards/collections display this asset', example: 'Sales Training, Best Practices' },
            ]} />

            <AttributeTable title="Links & Resources" attributes={[
              { name: 'Primary Link', required: true, description: 'Main URL to access the asset', example: 'https://docs.google.com/presentation/d/...' },
              { name: 'Video URL', required: false, description: 'Direct video link (YouTube, Loom, Vimeo, etc.)', example: 'https://www.loom.com/share/abc123' },
              { name: 'Slides URL', required: false, description: 'Presentation deck URL', example: 'https://docs.google.com/presentation/d/...' },
              { name: 'Transcript URL', required: false, description: 'Text transcript or notes URL', example: 'https://docs.google.com/document/d/...' },
              { name: 'Related Assets', required: false, description: 'Additional resources (URL + display name pairs)', example: '[{url: "...", displayName: "Handout"}]' },
            ]} />

            <AttributeTable title="Enablement-Specific Fields" attributes={[
              { name: 'Presenters', required: false, description: 'Speaker names (comma-separated)', example: 'John Smith, Jane Doe' },
              { name: 'Duration', required: false, description: 'Length in minutes', example: '45' },
              { name: 'Event Date', required: false, description: 'Training session date', example: '2026-01-15' },
              { name: 'Takeaways', required: false, description: 'Key learning points (3-5 items)', example: '["Focus on pain points", "Ask open-ended questions"]' },
              { name: 'How-Tos', required: false, description: 'Step-by-step instructions (title + content pairs)', example: '[{title: "Step 1", content: "..."}]' },
              { name: 'Tips', required: false, description: 'Practical advice (3-5 items)', example: '["Always confirm next steps", "Take notes"]' },
            ]} />

            <AttributeTable title="CoE/Proof Point Fields" attributes={[
              { name: 'Metric', required: false, description: 'Key statistic or result', example: '87% AI Resolution Rate' },
              { name: 'Metric Label', required: false, description: 'What the metric measures', example: 'AI Resolution Rate' },
              { name: 'Metric Source', required: false, description: 'Source of the metric', example: "Rothy's Case Study" },
            ]} />

            <AttributeTable title="Status & Analytics" attributes={[
              { name: 'Status', required: true, description: 'Publication state: draft, published, or archived', example: 'published' },
              { name: 'Featured', required: false, description: 'Highlight on homepage and in boards', example: 'true' },
              { name: 'Views', required: false, description: 'View count (auto-tracked)', example: '1,234' },
              { name: 'Shares', required: false, description: 'Share count (auto-tracked)', example: '56' },
            ]} />
          </section>

          {/* Creating Assets */}
          <section id="creating-assets" style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Creating Assets
            </h2>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
              Method 1: Manual Creation
            </h3>
            <StepList steps={[
              'Navigate to Admin → Manage Assets',
              'Click the "+ New Asset" button in the top right',
              'Fill in required fields: Title, Hub, Format, Primary Link',
              'Add optional fields: Description, Short Description, Type, Tags',
              'Associate with Boards to make the asset appear in specific collections',
              'Set Status to "Published" when ready to make visible',
              'Click "Save Asset" to create',
            ]} />

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
              Method 2: AI-Assisted Creation
            </h3>
            <StepList steps={[
              'Navigate to Admin → Manage Assets → + New Asset',
              'In the AI Assistant panel (right sidebar), enter a URL or paste content',
              'Select which fields to generate (Title, Description, Short Description, Tags, etc.)',
              'Click "Generate" to get AI suggestions',
              'Review the generated content and select fields to apply',
              'Click "Apply Selected" to populate the form',
              'Review and adjust as needed, then save',
            ]} />

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
              Method 3: CSV Import
            </h3>
            <StepList steps={[
              'Navigate to Admin → Import',
              'Download the CSV template or export existing assets as reference',
              'Fill in your asset data following the column format',
              'Upload the CSV file',
              'Review the preview and mapping',
              'Click "Import" to create/update assets',
            ]} />

            <InfoBox type="tip" title="Best Practice">
              Always provide a Short Description (6 words max) - this is what appears on asset cards and is critical for discoverability.
            </InfoBox>
          </section>

          {/* Editing Assets */}
          <section id="editing-assets" style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Editing Assets
            </h2>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px' }}>
              Accessing the Editor
            </h3>
            <StepList steps={[
              'Navigate to Admin → Manage Assets',
              'Find the asset using search or filters',
              'Click the asset row or the "Edit" button',
              'The asset editor page will open with all editable fields',
            ]} />

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
              Editor Sections
            </h3>
            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              <EditorSection
                title="Basic Information"
                fields={['Title', 'Slug', 'Description', 'Short Description', 'Hub', 'Format', 'Status', 'Publish Date']}
              />
              <EditorSection
                title="Classification"
                fields={['Type (dropdown)', 'Boards (multi-select)', 'Tags (autocomplete)']}
              />
              <EditorSection
                title="Links & Resources"
                fields={['Primary Link', 'Video URL', 'Slides URL', 'Transcript URL', 'Related Assets (dynamic list)']}
              />
              <EditorSection
                title="Training Content (Enablement only)"
                fields={['Event Date', 'Duration', 'Presenters', 'Takeaways (list)', 'How-Tos (list)', 'Tips (list)']}
              />
            </div>

            <InfoBox type="warning" title="Important">
              Changing the slug will break existing links to the asset. Only modify slugs when absolutely necessary.
            </InfoBox>
          </section>

          {/* AI Content Generator */}
          <section id="ai-generator" style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              AI Content Generator
            </h2>
            <p style={{ color: 'var(--text-secondary, #AAA)', lineHeight: 1.7, marginBottom: '24px' }}>
              The AI Assistant panel helps you quickly generate asset content from URLs or pasted text. It appears in the right sidebar when editing or creating assets.
            </p>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px' }}>
              Input Sources
            </h3>
            <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
              <FeatureCard
                title="URL Input"
                description="Enter a webpage URL - the AI will crawl and analyze the content. Use the dedicated 'AI Content URL' field for URLs that should only be used for generation (not saved to the asset)."
              />
              <FeatureCard
                title="Text Paste"
                description="Directly paste content (transcript, document text, etc.) for the AI to analyze."
              />
              <FeatureCard
                title="Existing Fields"
                description="Toggle 'Use existing fields' to provide context from the current asset's title, hub, format, and links."
              />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px' }}>
              Generatable Fields
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted, #888)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Field</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted, #888)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Description</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted, #888)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Availability</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary, #FFFFFF)' }}>Title</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>5-10 word descriptive title</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>New assets only</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary, #FFFFFF)' }}>Description</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>2-4 sentence summary</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>All assets</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary, #FFFFFF)' }}>Short Description</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>Exactly 6 words or fewer</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>All assets</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary, #FFFFFF)' }}>Takeaways</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>3-5 key learning points</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>Enablement only</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary, #FFFFFF)' }}>How-Tos</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>3-6 step-by-step instructions</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>Enablement only</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary, #FFFFFF)' }}>Tips</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>3-5 practical tips</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>All assets</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary, #FFFFFF)' }}>Suggested Tags</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>3-7 relevant tag suggestions</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>All assets</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary, #FFFFFF)' }}>Suggested Type</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>Recommended content type</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>All assets</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary, #FFFFFF)' }}>Extract Links</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>Auto-detect video, slides, transcript URLs</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>All assets</td>
                </tr>
              </tbody>
            </table>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px' }}>
              Workflow
            </h3>
            <StepList steps={[
              'Open the asset editor (new or existing)',
              'In the AI Assistant panel, enter a source URL or paste content',
              'Check the boxes for fields you want to generate',
              'Optionally add a custom prompt for specific instructions',
              'Click "Generate" and wait for results',
              'Review each generated field - use checkboxes to select which to apply',
              'Click "Apply Selected" to populate the form',
              'Review, adjust, and save the asset',
            ]} />

            <InfoBox type="tip" title="Pro Tip">
              The AI Content URL field is specifically for providing source material that shouldn&apos;t be saved as the asset&apos;s primary link. Use it for internal docs, draft content, or reference materials.
            </InfoBox>
          </section>

          {/* Managing Boards */}
          <section id="boards" style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Managing Boards
            </h2>
            <p style={{ color: 'var(--text-secondary, #AAA)', lineHeight: 1.7, marginBottom: '24px' }}>
              Boards are the main organizational structure - they group related assets into browsable collections. Each board has its own page at <code style={{ background: 'var(--hover-bg, #252530)', padding: '2px 6px', borderRadius: '4px' }}>/hub/[board-slug]</code>
            </p>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px' }}>
              Board Properties
            </h3>
            <AttributeTable title="" attributes={[
              { name: 'Name', required: true, description: 'Display name in navigation and header', example: 'Competitive Intel' },
              { name: 'Slug', required: true, description: 'URL identifier', example: 'competitive-intel' },
              { name: 'Icon', required: false, description: 'Emoji icon for visual identification', example: '🎯' },
              { name: 'Color', required: true, description: 'Primary theme color (8 presets available)', example: '#8C69F0 (Purple)' },
              { name: 'Description', required: false, description: 'Hero section description', example: 'Battle cards, competitive positioning...' },
              { name: 'Default View', required: false, description: 'Initial display mode: grid or stack', example: 'grid' },
              { name: 'Sort Order', required: false, description: 'Position in navigation sidebar', example: '1' },
              { name: 'Show Recently Added', required: false, description: 'Display carousel of newest assets', example: 'true' },
            ]} />

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
              Creating a Board
            </h3>
            <StepList steps={[
              'Navigate to Admin → Manage Boards',
              'Click "+ New Board"',
              'Enter name and slug (slug auto-generates)',
              'Select a color theme from the 8 presets',
              'Add an emoji icon (optional)',
              'Configure display options (default view, recently added)',
              'Save the board',
            ]} />

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
              Adding Subsections (Tags)
            </h3>
            <p style={{ color: 'var(--text-secondary, #AAA)', lineHeight: 1.7, marginBottom: '16px' }}>
              Boards are organized into subsections using tags. Each tag becomes a collapsible section on the board page.
            </p>
            <StepList steps={[
              'In the board editor, find the "Tags" section',
              'Search for existing tags or create new ones',
              'Add tags to the board - each becomes a subsection',
              'Optionally set a "Display Name" override (e.g., show "Tools" instead of "tool")',
              'Drag to reorder the tags/subsections',
              'Save changes',
            ]} />

            <InfoBox type="info" title="How Assets Appear in Subsections">
              When an asset has a tag that is associated with a board, that asset will appear in that tag&apos;s subsection on the board page. For example: an asset tagged &quot;zendesk&quot; will appear in the &quot;Zendesk&quot; subsection of any board that includes the &quot;zendesk&quot; tag.
            </InfoBox>
          </section>

          {/* Managing Tags */}
          <section id="tags" style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Managing Tags
            </h2>
            <p style={{ color: 'var(--text-secondary, #AAA)', lineHeight: 1.7, marginBottom: '24px' }}>
              Tags serve two purposes: categorizing assets for search/filtering, and creating subsections within boards.
            </p>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px' }}>
              Tag Properties
            </h3>
            <AttributeTable title="" attributes={[
              { name: 'Name', required: true, description: 'Display name', example: 'Zendesk' },
              { name: 'Slug', required: true, description: 'URL-safe identifier', example: 'zendesk' },
              { name: 'Category', required: false, description: 'Grouping: Product, Industry, Use Case, Team, Topic, Customer, Workflow', example: 'competitor' },
              { name: 'Color', required: false, description: 'Badge color (hex)', example: '#3B82F6' },
            ]} />

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
              Creating Tags
            </h3>
            <StepList steps={[
              'Navigate to Admin → Manage Tags',
              'Click "+ New Tag"',
              'Enter the tag name (slug auto-generates)',
              'Select a category (optional but recommended)',
              'Save the tag',
            ]} />

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
              Adding Assets to Tags
            </h3>
            <p style={{ color: 'var(--text-secondary, #AAA)', lineHeight: 1.7, marginBottom: '16px' }}>
              There are three ways to tag assets:
            </p>
            <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
              <FeatureCard
                title="1. In the Asset Editor"
                description="Use the Tags autocomplete field to search and add tags to individual assets."
              />
              <FeatureCard
                title="2. Bulk Actions"
                description="Select multiple assets in the Manage Assets view, then use 'Add Tags' or 'Remove Tags' bulk action."
              />
              <FeatureCard
                title="3. CSV Import"
                description="Include pipe-separated tag names in the 'tags' column (e.g., 'zendesk|sales|enterprise')."
              />
            </div>

            <InfoBox type="tip" title="Tag Strategy">
              Use consistent, lowercase tag names. Good tags are specific but not too narrow - aim for tags that will have 5-50 assets each.
            </InfoBox>
          </section>

          {/* Field Locations in UI */}
          <section id="field-locations" style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Field Locations in UI
            </h2>
            <p style={{ color: 'var(--text-secondary, #AAA)', lineHeight: 1.7, marginBottom: '24px' }}>
              Understanding where each field appears helps you optimize content for each context.
            </p>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Asset Card (Grid View)
            </h3>
            <div
              style={{
                background: 'var(--card-bg, #1A1A23)',
                border: '1px solid var(--card-border, #2A2A35)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ background: '#8C69F0', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Type Badge ←</span>
                    <span style={{ color: '#8C69F0', fontSize: '11px', fontFamily: 'monospace' }}>FORMAT ←</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ background: '#00FF87', color: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>NEW ←</span>
                    <span style={{ background: '#FFD700', color: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>FEATURED ←</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '6px' }}>
                    ← Title (truncated if long)
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary, #AAA)' }}>
                    ← Short Description (6 words max)
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border, #2A2A35)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted, #888)' }}>← Published Date</span>
                  <span style={{ fontSize: '12px', color: '#8C69F0' }}>Watch/View →</span>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Asset Detail Page
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted, #888)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Field</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted, #888)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Location</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Title', 'Main heading at top'],
                  ['Description', 'Below title, full text displayed'],
                  ['Hub', 'Colored badge in header'],
                  ['Type', 'Badge next to hub'],
                  ['Format', 'Icon/label in header'],
                  ['Video URL', 'Embedded video player'],
                  ['Slides URL', 'Embedded document viewer'],
                  ['Presenters', 'Listed below title (Enablement)'],
                  ['Duration', 'Shown as "X min" badge'],
                  ['Event Date', 'Formatted date display'],
                  ['Takeaways', 'Expandable section'],
                  ['How-Tos', 'Numbered steps section'],
                  ['Tips', 'Bulleted list section'],
                  ['Related Assets', 'Resource cards at bottom'],
                  ['Tags', 'Pill badges linking to tag pages'],
                  ['Boards', 'Pill badges linking to boards'],
                ].map(([field, location]) => (
                  <tr key={field} style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary, #FFFFFF)' }}>{field}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>{location}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Admin Table (Manage Assets)
            </h3>
            <p style={{ color: 'var(--text-secondary, #AAA)', lineHeight: 1.7, marginBottom: '16px' }}>
              The admin table displays these columns:
            </p>
            <ul style={{ color: 'var(--text-secondary, #AAA)', lineHeight: 1.8, paddingLeft: '20px', marginBottom: '24px' }}>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Title</strong> - Asset name with edit link</li>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Hub</strong> - Colored badge (Content/Enablement/CoE)</li>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Format</strong> - Media type badge</li>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Type</strong> - Content type badge</li>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Boards</strong> - List of associated boards</li>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Tags</strong> - List of tags</li>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Status</strong> - Draft/Published/Archived</li>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Views</strong> - View count</li>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Updated</strong> - Last modified date</li>
            </ul>
          </section>

          {/* CSV Export & Import */}
          <section id="csv-export" style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              CSV Export &amp; Import
            </h2>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px' }}>
              Exporting Assets
            </h3>
            <StepList steps={[
              'Navigate to Admin → Manage Assets',
              'Apply filters if you want to export a subset',
              'Click "Export CSV" button',
              'The file downloads as gtm-library-export-[date].csv',
            ]} />

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
              CSV Columns
            </h3>
            <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted, #888)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Column</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted, #888)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Format</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted, #888)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['title', 'Text', 'Required'],
                    ['slug', 'Text', 'Auto-generated if blank'],
                    ['description', 'Text', 'Full description'],
                    ['shortDescription', 'Text', '6 words max'],
                    ['externalUrl', 'URL', 'Primary link (required)'],
                    ['videoUrl', 'URL', 'Video content'],
                    ['slidesUrl', 'URL', 'Presentation deck'],
                    ['transcriptUrl', 'URL', 'Transcript'],
                    ['aiContentUrl', 'URL', 'AI-only URL (not saved)'],
                    ['hub', 'coe|content|enablement', 'Required'],
                    ['format', 'Slug', 'e.g., video, slides'],
                    ['type', 'Pipe-separated', 'e.g., product|demo'],
                    ['tags', 'Pipe-separated', 'e.g., sales|enterprise'],
                    ['boards', 'Pipe-separated', 'Board slugs'],
                    ['status', 'draft|published|archived', 'Default: draft'],
                    ['publishedAt', 'ISO Date', 'YYYY-MM-DD'],
                    ['date', 'ISO Date', 'Event date'],
                    ['presenters', 'Pipe-separated', 'Speaker names'],
                    ['durationMinutes', 'Number', 'Training length'],
                    ['relatedAssetUrl1', 'URL', 'First related asset URL'],
                    ['relatedAssetName1', 'Text', 'First related asset label'],
                  ].map(([column, format, notes]) => (
                    <tr key={column} style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-primary, #FFFFFF)', fontFamily: 'monospace', fontSize: '13px' }}>{column}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)', fontSize: '13px' }}>{format}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted, #888)', fontSize: '13px' }}>{notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <InfoBox type="info" title="AI Content URL">
              The <code style={{ background: 'var(--hover-bg, #252530)', padding: '2px 6px', borderRadius: '4px' }}>aiContentUrl</code> column is special - it&apos;s used by the AI generator to crawl content but is never saved to the database. Use it for source URLs that shouldn&apos;t become the asset&apos;s primary link.
            </InfoBox>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
              Importing Assets
            </h3>
            <StepList steps={[
              'Navigate to Admin → Import',
              'Download the template or export existing data as reference',
              'Fill in your CSV following the column format',
              'For arrays (tags, boards), use pipe | as separator',
              'Upload the file',
              'Review the preview - check for errors',
              'Click "Import" to create/update assets',
            ]} />

            <InfoBox type="warning" title="Import Behavior">
              If an asset with the same slug exists, it will be updated. New slugs create new assets. Always backup before large imports.
            </InfoBox>
          </section>

          {/* Bulk Actions */}
          <section id="bulk-actions" style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Bulk Actions
            </h2>
            <p style={{ color: 'var(--text-secondary, #AAA)', lineHeight: 1.7, marginBottom: '24px' }}>
              Select multiple assets in the Manage Assets view to perform bulk operations.
            </p>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px' }}>
              Available Actions
            </h3>
            <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
              <FeatureCard title="Add to Boards" description="Add selected assets to one or more boards" />
              <FeatureCard title="Remove from Boards" description="Remove selected assets from boards" />
              <FeatureCard title="Add Tags" description="Apply tags to all selected assets" />
              <FeatureCard title="Remove Tags" description="Remove specific tags from selected assets" />
              <FeatureCard title="Change Hub" description="Move assets to a different hub" />
              <FeatureCard title="Change Format" description="Update the format of selected assets" />
              <FeatureCard title="Change Type" description="Update the content type" />
              <FeatureCard title="Change Status" description="Set status to draft, published, or archived" />
              <FeatureCard title="Delete" description="Permanently delete selected assets (with confirmation)" />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px' }}>
              How to Use Bulk Actions
            </h3>
            <StepList steps={[
              'Go to Admin → Manage Assets',
              'Use filters to narrow down to relevant assets',
              'Check the boxes next to assets you want to modify',
              'Or use the "Select All" checkbox to select all visible assets',
              'Click the desired action button in the toolbar',
              'Configure the action in the modal (e.g., select boards/tags)',
              'Confirm to apply the change to all selected assets',
            ]} />
          </section>

          {/* Footer */}
          <footer style={{ borderTop: '1px solid var(--card-border, #2A2A35)', paddingTop: '24px', marginTop: '48px' }}>
            <p style={{ color: 'var(--text-muted, #888)', fontSize: '13px', textAlign: 'center' }}>
              GTM Library User Manual • Last updated January 2026 • For questions, contact the GTM team
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// Helper Components
function HubCard({ name, color, description }: { name: string; color: string; description: string }) {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '12px',
        padding: '16px',
        borderTop: `3px solid ${color}`,
      }}
    >
      <h4 style={{ fontSize: '16px', fontWeight: 600, color, marginBottom: '8px' }}>{name}</h4>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary, #AAA)', lineHeight: 1.5, margin: 0 }}>{description}</p>
    </div>
  );
}

function AttributeTable({ title, attributes }: { title: string; attributes: { name: string; required: boolean; description: string; example: string }[] }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      {title && (
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </h4>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
            <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted, #888)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Field</th>
            <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted, #888)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Description</th>
            <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted, #888)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Example</th>
          </tr>
        </thead>
        <tbody>
          {attributes.map((attr) => (
            <tr key={attr.name} style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
              <td style={{ padding: '12px 16px', color: 'var(--text-primary, #FFFFFF)', whiteSpace: 'nowrap' }}>
                {attr.name}
                {attr.required && <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>}
              </td>
              <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)', fontSize: '13px' }}>{attr.description}</td>
              <td style={{ padding: '12px 16px', color: 'var(--text-muted, #888)', fontSize: '12px', fontFamily: 'monospace' }}>{attr.example}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol style={{ color: 'var(--text-secondary, #AAA)', lineHeight: 1.8, paddingLeft: '20px', marginBottom: '24px' }}>
      {steps.map((step, index) => (
        <li key={index} style={{ marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-primary, #FFFFFF)' }}>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function InfoBox({ type, title, children }: { type: 'tip' | 'warning' | 'info'; title: string; children: React.ReactNode }) {
  const colors = {
    tip: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10B981', text: '#10B981' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B', text: '#F59E0B' },
    info: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3B82F6', text: '#3B82F6' },
  };
  const icons = { tip: '💡', warning: '⚠️', info: 'ℹ️' };

  return (
    <div
      style={{
        background: colors[type].bg,
        border: `1px solid ${colors[type].border}30`,
        borderLeft: `3px solid ${colors[type].border}`,
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span>{icons[type]}</span>
        <strong style={{ color: colors[type].text, fontSize: '14px' }}>{title}</strong>
      </div>
      <p style={{ color: 'var(--text-secondary, #AAA)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{children}</p>
    </div>
  );
}

function EditorSection({ title, fields }: { title: string; fields: string[] }) {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '8px' }}>{title}</h4>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary, #AAA)', margin: 0 }}>{fields.join(' • ')}</p>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '6px' }}>{title}</h4>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary, #AAA)', margin: 0, lineHeight: 1.5 }}>{description}</p>
    </div>
  );
}
