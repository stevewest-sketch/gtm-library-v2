'use client';

import { useState } from 'react';
import Link from 'next/link';

// Table of contents sections
const sections = [
  { id: 'overview', title: 'Overview' },
  { id: 'navigation', title: 'Navigation Guide' },
  { id: 'asset-attributes', title: 'Asset Attributes Reference' },
  { id: 'field-locations', title: 'Field Locations in UI' },
  { id: 'creating-assets', title: 'Creating Assets' },
  { id: 'editing-assets', title: 'Editing Assets' },
  { id: 'ai-generator', title: 'AI Content Generator' },
  { id: 'boards', title: 'Managing Boards' },
  { id: 'tags', title: 'Managing Tags' },
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

            {/* System Architecture Visual */}
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              System Architecture
            </h3>
            <SystemArchitectureDiagram />

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '32px' }}>
              Key Concepts
            </h3>
            <ul style={{ color: 'var(--text-secondary, #AAA)', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Assets</strong> - Individual content items (videos, slides, documents, etc.)</li>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Boards</strong> - Collections/hubs that group related assets (e.g., &quot;Competitive Intel&quot;, &quot;Sales Training&quot;)</li>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Tags</strong> - Labels that categorize assets and create subsections within boards</li>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Types</strong> - Content type classification (e.g., &quot;Product Demo&quot;, &quot;Case Study&quot;, &quot;Explainer&quot;)</li>
              <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Formats</strong> - Media format (e.g., &quot;Video&quot;, &quot;Slides&quot;, &quot;Document&quot;, &quot;Template&quot;)</li>
            </ul>
          </section>

          {/* Navigation Guide Section */}
          <section id="navigation" style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Navigation Guide
            </h2>
            <p style={{ color: 'var(--text-secondary, #AAA)', lineHeight: 1.7, marginBottom: '24px' }}>
              The GTM Library has two main interfaces: the public-facing Library for browsing content, and the Admin interface for managing assets.
            </p>

            {/* Admin Sidebar Visual */}
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Admin Sidebar Navigation
            </h3>
            <AdminSidebarVisual />

            {/* Library Sidebar Visual */}
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px', marginTop: '32px' }}>
              Library Sidebar (Public View)
            </h3>
            <LibrarySidebarVisual />

            {/* Quick Access URLs */}
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '32px' }}>
              Quick Access URLs
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              <UrlCard path="/" label="Homepage" description="Featured content and hub overview" />
              <UrlCard path="/hub/[slug]" label="Hub Page" description="Browse assets in a specific hub/board" />
              <UrlCard path="/asset/[slug]" label="Asset Detail" description="View individual asset with all details" />
              <UrlCard path="/admin/manage" label="Asset Manager" description="Create, edit, delete assets" />
              <UrlCard path="/admin/manage/boards" label="Board Manager" description="Create and configure boards/hubs" />
              <UrlCard path="/admin/manage/tags" label="Tag Manager" description="Manage taxonomy and tags" />
              <UrlCard path="/admin/manage/import" label="CSV Import" description="Bulk import assets via CSV" />
            </div>
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

          {/* Field Locations in UI */}
          <section id="field-locations" style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Field Locations in UI
            </h2>
            <p style={{ color: 'var(--text-secondary, #AAA)', lineHeight: 1.7, marginBottom: '24px' }}>
              Understanding where each field appears helps you optimize content for each context. Below are annotated visual guides.
            </p>

            {/* Asset Card Anatomy */}
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Asset Card Anatomy (Grid View)
            </h3>
            <AssetCardAnatomy />

            {/* Compact Card Anatomy */}
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px', marginTop: '32px' }}>
              Compact Card (Stack/List View)
            </h3>
            <CompactCardAnatomy />

            {/* Asset Detail Page Layout */}
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px', marginTop: '32px' }}>
              Asset Detail Page Layout
            </h3>
            <AssetDetailPageLayout />

            {/* Admin Table Fields */}
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px', marginTop: '32px' }}>
              Admin Table (Manage Assets)
            </h3>
            <AdminTableVisual />
          </section>

          {/* Creating Assets */}
          <section id="creating-assets" style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Creating Assets
            </h2>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
              Method 1: Manual Creation
            </h3>

            {/* Visual Workflow */}
            <CreateAssetWorkflow />

            <StepList steps={[
              'Navigate to Admin → Manage Assets (or click "Assets" in sidebar)',
              'Click the "+ New Asset" button in the top right corner',
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
              Asset Editor Interface
            </h3>
            <AssetEditorVisual />

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
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

            {/* AI Panel Visual */}
            <AIAssistantPanelVisual />

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
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
                {[
                  ['Title', '5-10 word descriptive title', 'New assets only'],
                  ['Description', '2-4 sentence summary', 'All assets'],
                  ['Short Description', 'Exactly 6 words or fewer', 'All assets'],
                  ['Takeaways', '3-5 key learning points', 'Enablement only'],
                  ['How-Tos', '3-6 step-by-step instructions', 'Enablement only'],
                  ['Tips', '3-5 practical tips', 'All assets'],
                  ['Suggested Tags', '3-7 relevant tag suggestions', 'All assets'],
                  ['Suggested Type', 'Recommended content type', 'All assets'],
                  ['Extract Links', 'Auto-detect video, slides, transcript URLs', 'All assets'],
                ].map(([field, desc, avail]) => (
                  <tr key={field} style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary, #FFFFFF)' }}>{field}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>{desc}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)' }}>{avail}</td>
                  </tr>
                ))}
              </tbody>
            </table>

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

            {/* Board Page Visual */}
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Board Page Structure
            </h3>
            <BoardPageVisual />

            {/* Board-Tag Relationship */}
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px', marginTop: '32px' }}>
              Board-Tag-Asset Relationship
            </h3>
            <BoardTagRelationshipDiagram />

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
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
              'Navigate to Admin → Manage Boards (or "Hubs" in sidebar)',
              'Click "+ New Board"',
              'Enter name and slug (slug auto-generates)',
              'Select a color theme from the 8 presets',
              'Add an emoji icon (optional)',
              'Configure display options (default view, recently added)',
              'Save the board',
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

            {/* Tag Manager Visual */}
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              Tag Manager Interface
            </h3>
            <TagManagerVisual />

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
              Tag Properties
            </h3>
            <AttributeTable title="" attributes={[
              { name: 'Name', required: true, description: 'Display name', example: 'Zendesk' },
              { name: 'Slug', required: true, description: 'URL-safe identifier', example: 'zendesk' },
              { name: 'Category', required: false, description: 'Grouping: Product, Industry, Use Case, Team, Topic, Customer, Workflow', example: 'competitor' },
              { name: 'Color', required: false, description: 'Badge color (hex)', example: '#3B82F6' },
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

          {/* CSV Export & Import */}
          <section id="csv-export" style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>
              CSV Export &amp; Import
            </h2>

            {/* CSV Workflow Visual */}
            <CSVWorkflowVisual />

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
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

            {/* Bulk Actions Visual */}
            <BulkActionsVisual />

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', marginTop: '24px' }}>
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

// ============================================
// VISUAL COMPONENTS
// ============================================

// System Architecture Diagram
function SystemArchitectureDiagram() {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Top Level - Hubs */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hubs (Primary Organization)</div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <div style={{ background: '#8C69F020', border: '2px solid #8C69F0', borderRadius: '8px', padding: '12px 24px', color: '#8C69F0', fontWeight: 600 }}>Content</div>
            <div style={{ background: '#10B98120', border: '2px solid #10B981', borderRadius: '8px', padding: '12px 24px', color: '#10B981', fontWeight: 600 }}>Enablement</div>
            <div style={{ background: '#F59E0B20', border: '2px solid #F59E0B', borderRadius: '8px', padding: '12px 24px', color: '#F59E0B', fontWeight: 600 }}>CoE</div>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ textAlign: 'center', color: 'var(--text-muted, #888)' }}>↓</div>

        {/* Middle Level - Boards */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Boards (Collections)</div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Competitive Intel', 'Sales Training', 'Product Updates', 'Best Practices'].map((board) => (
              <div key={board} style={{ background: 'var(--hover-bg, #252530)', borderRadius: '6px', padding: '8px 16px', color: 'var(--text-secondary, #AAA)', fontSize: '13px' }}>{board}</div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div style={{ textAlign: 'center', color: 'var(--text-muted, #888)' }}>↓</div>

        {/* Bottom Level - Tags/Subsections */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tags (Subsections)</div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['zendesk', 'salesforce', 'discovery', 'demo', 'pricing'].map((tag) => (
              <div key={tag} style={{ background: '#3B82F620', border: '1px solid #3B82F650', borderRadius: '12px', padding: '4px 12px', color: '#3B82F6', fontSize: '12px' }}>{tag}</div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div style={{ textAlign: 'center', color: 'var(--text-muted, #888)' }}>↓</div>

        {/* Assets */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assets (Content)</div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {['📹', '📊', '📄', '🎓', '📋'].map((icon, i) => (
              <div key={i} style={{ background: 'var(--hover-bg, #252530)', borderRadius: '8px', padding: '12px', fontSize: '20px' }}>{icon}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin Sidebar Visual
function AdminSidebarVisual() {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '12px',
        padding: '0',
        marginBottom: '24px',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar mockup */}
      <div style={{ width: '200px', background: 'var(--bg-surface, #14141A)', padding: '16px', borderRight: '1px solid var(--card-border, #2A2A35)' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted, #888)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Admin</div>
        {[
          { icon: '📋', label: 'Assets', desc: 'Manage all content', active: true },
          { icon: '📥', label: 'Import', desc: 'CSV bulk import' },
          { icon: '🏷️', label: 'Tags', desc: 'Manage taxonomy' },
          { icon: '📊', label: 'Hubs', desc: 'Configure boards' },
          { icon: '🎨', label: 'Taxonomy', desc: 'Types & formats' },
          { icon: '📈', label: 'Analytics', desc: 'View metrics' },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '6px',
              marginBottom: '4px',
              background: item.active ? 'rgba(140, 105, 240, 0.15)' : 'transparent',
              color: item.active ? '#B794FF' : 'var(--text-secondary, #AAA)',
            }}
          >
            <span>{item.icon}</span>
            <span style={{ fontSize: '13px' }}>{item.label}</span>
          </div>
        ))}
        <div style={{ fontSize: '10px', color: 'var(--text-muted, #888)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '16px', marginBottom: '12px' }}>Help</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', color: 'var(--text-secondary, #AAA)' }}>
          <span>📖</span>
          <span style={{ fontSize: '13px' }}>User Manual</span>
        </div>
      </div>
      {/* Description panel */}
      <div style={{ flex: 1, padding: '20px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px' }}>Admin Navigation</h4>
        <ul style={{ color: 'var(--text-secondary, #AAA)', fontSize: '13px', lineHeight: 1.8, paddingLeft: '16px', margin: 0 }}>
          <li><strong style={{ color: '#B794FF' }}>Assets</strong> - Create, edit, delete, and manage all content assets</li>
          <li><strong>Import</strong> - Bulk import assets via CSV file upload</li>
          <li><strong>Tags</strong> - Create and manage tags for categorization</li>
          <li><strong>Hubs</strong> - Configure boards/collections and their appearance</li>
          <li><strong>Taxonomy</strong> - Manage content types and formats</li>
          <li><strong>Analytics</strong> - View engagement metrics and top content</li>
        </ul>
      </div>
    </div>
  );
}

// Library Sidebar Visual
function LibrarySidebarVisual() {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '12px',
        padding: '0',
        marginBottom: '24px',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar mockup */}
      <div style={{ width: '200px', background: 'var(--bg-surface, #14141A)', padding: '16px', borderRight: '1px solid var(--card-border, #2A2A35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', marginBottom: '16px', background: 'var(--hover-bg, #252530)', borderRadius: '6px' }}>
          <span>🏠</span>
          <span style={{ fontSize: '13px', color: 'var(--text-primary, #FFFFFF)' }}>Home</span>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted, #888)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Hubs</div>
        {[
          { color: '#8C69F0', label: 'Content', count: 45, active: true },
          { color: '#10B981', label: 'Enablement', count: 32 },
          { color: '#F59E0B', label: 'CoE', count: 28 },
          { color: '#3B82F6', label: 'Competitive', count: 15 },
        ].map((hub) => (
          <div
            key={hub.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '6px',
              marginBottom: '4px',
              background: hub.active ? `${hub.color}15` : 'transparent',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: hub.color }} />
            <span style={{ fontSize: '13px', flex: 1, color: hub.active ? hub.color : 'var(--text-secondary, #AAA)' }}>{hub.label}</span>
            <span style={{ fontSize: '11px', background: hub.active ? '#1A1A1A' : 'var(--hover-bg, #252530)', padding: '2px 8px', borderRadius: '10px', color: hub.active ? '#FFF' : 'var(--text-muted, #888)' }}>{hub.count}</span>
          </div>
        ))}
      </div>
      {/* Description panel */}
      <div style={{ flex: 1, padding: '20px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px' }}>Library Navigation</h4>
        <ul style={{ color: 'var(--text-secondary, #AAA)', fontSize: '13px', lineHeight: 1.8, paddingLeft: '16px', margin: 0 }}>
          <li><strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Home</strong> - Featured content and hub overview</li>
          <li><strong>Hubs</strong> - Click any hub to browse its assets</li>
          <li><strong>Count Badge</strong> - Shows number of assets in each hub</li>
          <li><strong>Active State</strong> - Current hub is highlighted with color</li>
        </ul>
      </div>
    </div>
  );
}

// Asset Card Anatomy
function AssetCardAnatomy() {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Card mockup */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div
            style={{
              background: 'var(--bg-surface, #14141A)',
              border: '1px solid var(--card-border, #2A2A35)',
              borderRadius: '12px',
              padding: '16px',
              position: 'relative',
            }}
          >
            {/* Annotation arrows */}
            <div style={{ position: 'absolute', right: '-120px', top: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '40px', height: '1px', background: '#8C69F0' }} />
              <span style={{ fontSize: '11px', color: '#8C69F0', whiteSpace: 'nowrap' }}>Type Badge</span>
            </div>
            <div style={{ position: 'absolute', right: '-100px', top: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '1px', background: '#10B981' }} />
              <span style={{ fontSize: '11px', color: '#10B981', whiteSpace: 'nowrap' }}>Format</span>
            </div>
            <div style={{ position: 'absolute', right: '-150px', top: '56px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '70px', height: '1px', background: '#00FF87' }} />
              <span style={{ fontSize: '11px', color: '#00FF87', whiteSpace: 'nowrap' }}>Status (NEW)</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ background: '#8C69F0', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>PRODUCT</span>
                <span style={{ color: '#8C69F0', fontSize: '10px', fontFamily: 'monospace' }}>SLIDES</span>
              </div>
              <span style={{ background: '#00FF87', color: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 600 }}>NEW</span>
            </div>

            {/* Body */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-140px', top: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#F59E0B', whiteSpace: 'nowrap' }}>Title</span>
                <div style={{ width: '60px', height: '1px', background: '#F59E0B' }} />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '6px', lineHeight: 1.3 }}>
                Q4 Product Launch Deck
              </h4>
              <div style={{ position: 'absolute', left: '-180px', top: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#3B82F6', whiteSpace: 'nowrap' }}>Short Description</span>
                <div style={{ width: '60px', height: '1px', background: '#3B82F6' }} />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary, #AAA)', margin: 0, lineHeight: 1.4 }}>
                New features and positioning slides
              </p>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--card-border, #2A2A35)', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-140px', top: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#EF4444', whiteSpace: 'nowrap' }}>Publish Date</span>
                <div style={{ width: '60px', height: '1px', background: '#EF4444' }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #888)' }}>Jan 2, 2026</span>
              <span style={{ fontSize: '12px', color: '#8C69F0' }}>View →</span>
            </div>
          </div>
        </div>

        {/* Field descriptions */}
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px' }}>Card Fields</h4>
          <table style={{ width: '100%', fontSize: '12px' }}>
            <tbody>
              {[
                { field: 'Type Badge', source: 'types[0]', color: '#8C69F0' },
                { field: 'Format', source: 'format', color: '#10B981' },
                { field: 'Status', source: 'isNew / featured', color: '#00FF87' },
                { field: 'Title', source: 'title', color: '#F59E0B' },
                { field: 'Short Description', source: 'shortDescription', color: '#3B82F6' },
                { field: 'Date', source: 'publishedAt', color: '#EF4444' },
              ].map((row) => (
                <tr key={row.field}>
                  <td style={{ padding: '6px 0', color: row.color, fontWeight: 500 }}>{row.field}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text-muted, #888)', fontFamily: 'monospace' }}>{row.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <InfoBox type="tip" title="6 Word Limit">
            Short Description MUST be 6 words or fewer. This is enforced to maintain clean card layouts.
          </InfoBox>
        </div>
      </div>
    </div>
  );
}

// Compact Card Anatomy
function CompactCardAnatomy() {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface, #14141A)',
          border: '1px solid var(--card-border, #2A2A35)',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ background: '#10B981', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>TRAINING</span>
          <span style={{ color: '#10B981', fontSize: '10px', fontFamily: 'monospace' }}>VIDEO</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #FFFFFF)' }}>Discovery Skills Workshop Recording</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted, #888)' }}>Master discovery calls with prospects</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted, #888)' }}>45 min</span>
          <span style={{ fontSize: '12px', color: '#10B981' }}>Watch →</span>
        </div>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary, #AAA)', margin: 0 }}>
        Compact cards show: <strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Type Badge</strong> • <strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Format</strong> • <strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Title</strong> • <strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Short Description</strong> • <strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>Duration</strong> (for videos)
      </p>
    </div>
  );
}

// Asset Detail Page Layout
function AssetDetailPageLayout() {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Main content area mockup */}
        <div>
          <div style={{ background: 'var(--bg-surface, #14141A)', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <span style={{ background: '#8C69F020', border: '1px solid #8C69F050', color: '#8C69F0', padding: '4px 10px', borderRadius: '4px', fontSize: '11px' }}>Content</span>
              <span style={{ background: '#3B82F620', border: '1px solid #3B82F650', color: '#3B82F6', padding: '4px 10px', borderRadius: '4px', fontSize: '11px' }}>Product Demo</span>
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted, #888)', marginBottom: '4px' }}>← Hub Badge + Type Badge</div>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', margin: '12px 0 4px' }}>Asset Title Here</h3>
            <div style={{ fontSize: '9px', color: 'var(--text-muted, #888)', marginBottom: '8px' }}>← title</div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary, #AAA)', lineHeight: 1.5, margin: 0 }}>
              Full description text appears here. This can be multiple sentences explaining what the asset contains and why it&apos;s valuable.
            </p>
            <div style={{ fontSize: '9px', color: 'var(--text-muted, #888)', marginTop: '4px' }}>← description</div>
          </div>

          {/* Video embed area */}
          <div style={{ background: '#000', borderRadius: '8px', padding: '40px', textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ color: 'var(--text-muted, #888)', fontSize: '12px' }}>Video Player (videoUrl)</span>
          </div>

          {/* Expandable sections */}
          <div style={{ display: 'grid', gap: '8px' }}>
            {['Takeaways', 'How-To Steps', 'Tips'].map((section) => (
              <div key={section} style={{ background: 'var(--bg-surface, #14141A)', borderRadius: '6px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-primary, #FFFFFF)' }}>{section}</span>
                <span style={{ color: 'var(--text-muted, #888)' }}>▼</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div style={{ background: 'var(--bg-surface, #14141A)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)', marginBottom: '8px' }}>PRESENTER</div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary, #FFFFFF)' }}>John Smith</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted, #888)', marginTop: '2px' }}>← presenters</div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)', marginBottom: '8px', marginTop: '16px' }}>DATE</div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary, #FFFFFF)' }}>January 15, 2026</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted, #888)', marginTop: '2px' }}>← eventDate</div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)', marginBottom: '8px', marginTop: '16px' }}>DURATION</div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary, #FFFFFF)' }}>45 min</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted, #888)', marginTop: '2px' }}>← durationMinutes</div>
          </div>

          <div style={{ background: 'var(--bg-surface, #14141A)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)', marginBottom: '8px' }}>TAGS</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['sales', 'discovery', 'enterprise'].map((tag) => (
                <span key={tag} style={{ background: '#3B82F620', color: '#3B82F6', padding: '4px 10px', borderRadius: '12px', fontSize: '11px' }}>{tag}</span>
              ))}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted, #888)', marginTop: '6px' }}>← tags (clickable)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin Table Visual
function AdminTableVisual() {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '24px',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface, #14141A)' }}>
              {['☑', 'Title', 'Hub', 'Format', 'Type', 'Status', 'Views', 'Updated'].map((header) => (
                <th key={header} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted, #888)', fontWeight: 600, borderBottom: '1px solid var(--card-border, #2A2A35)' }}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
              <td style={{ padding: '12px 16px' }}><input type="checkbox" readOnly /></td>
              <td style={{ padding: '12px 16px', color: '#8C69F0', fontSize: '13px' }}>Q4 Product Launch Deck</td>
              <td style={{ padding: '12px 16px' }}><span style={{ background: '#8C69F020', color: '#8C69F0', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Content</span></td>
              <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary, #AAA)' }}>Slides</td>
              <td style={{ padding: '12px 16px' }}><span style={{ background: '#3B82F620', color: '#3B82F6', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Product</span></td>
              <td style={{ padding: '12px 16px' }}><span style={{ background: '#10B98120', color: '#10B981', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Published</span></td>
              <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted, #888)' }}>1,234</td>
              <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted, #888)' }}>Jan 2</td>
            </tr>
            <tr>
              <td style={{ padding: '12px 16px' }}><input type="checkbox" readOnly /></td>
              <td style={{ padding: '12px 16px', color: '#8C69F0', fontSize: '13px' }}>Discovery Workshop</td>
              <td style={{ padding: '12px 16px' }}><span style={{ background: '#10B98120', color: '#10B981', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Enablement</span></td>
              <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary, #AAA)' }}>Video</td>
              <td style={{ padding: '12px 16px' }}><span style={{ background: '#F59E0B20', color: '#F59E0B', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Training</span></td>
              <td style={{ padding: '12px 16px' }}><span style={{ background: '#10B98120', color: '#10B981', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Published</span></td>
              <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted, #888)' }}>856</td>
              <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted, #888)' }}>Dec 28</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Asset Editor Visual
function AssetEditorVisual() {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '12px',
        padding: '0',
        marginBottom: '24px',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Editor form mockup */}
      <div style={{ flex: 1, padding: '20px', borderRight: '1px solid var(--card-border, #2A2A35)' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>Asset Editor Form</h4>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted, #888)', display: 'block', marginBottom: '6px' }}>TITLE *</label>
          <div style={{ background: 'var(--bg-surface, #14141A)', border: '1px solid var(--card-border, #2A2A35)', borderRadius: '6px', padding: '10px 12px', color: 'var(--text-primary, #FFFFFF)', fontSize: '13px' }}>Q4 Product Launch Deck</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted, #888)', display: 'block', marginBottom: '6px' }}>HUB *</label>
            <div style={{ background: 'var(--bg-surface, #14141A)', border: '1px solid var(--card-border, #2A2A35)', borderRadius: '6px', padding: '10px 12px', color: 'var(--text-secondary, #AAA)', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>Content <span>▼</span></div>
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted, #888)', display: 'block', marginBottom: '6px' }}>FORMAT *</label>
            <div style={{ background: 'var(--bg-surface, #14141A)', border: '1px solid var(--card-border, #2A2A35)', borderRadius: '6px', padding: '10px 12px', color: 'var(--text-secondary, #AAA)', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>Slides <span>▼</span></div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted, #888)', display: 'block', marginBottom: '6px' }}>PRIMARY LINK *</label>
          <div style={{ background: 'var(--bg-surface, #14141A)', border: '1px solid var(--card-border, #2A2A35)', borderRadius: '6px', padding: '10px 12px', color: '#3B82F6', fontSize: '13px' }}>https://docs.google.com/...</div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted, #888)', display: 'block', marginBottom: '6px' }}>TAGS</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['product', 'q4', 'launch'].map((tag) => (
              <span key={tag} style={{ background: '#3B82F620', color: '#3B82F6', padding: '4px 10px', borderRadius: '12px', fontSize: '11px' }}>{tag} ×</span>
            ))}
            <span style={{ color: 'var(--text-muted, #888)', fontSize: '13px' }}>+ Add tag</span>
          </div>
        </div>
      </div>

      {/* AI Panel mockup */}
      <div style={{ width: '260px', background: 'var(--bg-surface, #14141A)', padding: '20px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✨</span> AI Assistant
        </h4>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '10px', color: 'var(--text-muted, #888)', display: 'block', marginBottom: '4px' }}>SOURCE URL</label>
          <div style={{ background: 'var(--card-bg, #1A1A23)', border: '1px solid var(--card-border, #2A2A35)', borderRadius: '4px', padding: '8px', fontSize: '11px', color: 'var(--text-muted, #888)' }}>Enter URL...</div>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted, #888)', marginBottom: '8px' }}>GENERATE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {['Description', 'Short Description', 'Takeaways', 'Tags'].map((field) => (
            <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary, #AAA)' }}>
              <input type="checkbox" readOnly /> {field}
            </label>
          ))}
        </div>
        <button style={{ width: '100%', marginTop: '16px', padding: '10px', background: '#8C69F0', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500 }}>
          Generate
        </button>
      </div>
    </div>
  );
}

// Create Asset Workflow
function CreateAssetWorkflow() {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {[
          { step: '1', label: 'Navigate', desc: 'Admin → Assets' },
          { step: '2', label: 'Click', desc: '+ New Asset' },
          { step: '3', label: 'Fill', desc: 'Required Fields' },
          { step: '4', label: 'Add', desc: 'Tags & Boards' },
          { step: '5', label: 'Save', desc: 'Publish Asset' },
        ].map((item, i) => (
          <div key={item.step} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#8C69F0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, margin: '0 auto 8px' }}>{item.step}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary, #FFFFFF)' }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)' }}>{item.desc}</div>
            </div>
            {i < 4 && <div style={{ width: '40px', height: '2px', background: 'var(--card-border, #2A2A35)', margin: '0 8px' }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// AI Assistant Panel Visual
function AIAssistantPanelVisual() {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Input Section */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>1. Provide Source Content</h4>
          <div style={{ background: 'var(--bg-surface, #14141A)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted, #888)', marginBottom: '6px' }}>AI CONTENT URL</div>
              <div style={{ background: 'var(--card-bg, #1A1A23)', border: '1px solid var(--card-border, #2A2A35)', borderRadius: '4px', padding: '8px', fontSize: '11px', color: '#3B82F6' }}>https://notion.so/internal-doc...</div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted, #888)', marginTop: '4px' }}>For AI only - not saved to asset</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted, #888)', marginBottom: '6px' }}>OR PASTE TEXT</div>
              <div style={{ background: 'var(--card-bg, #1A1A23)', border: '1px solid var(--card-border, #2A2A35)', borderRadius: '4px', padding: '8px', fontSize: '11px', color: 'var(--text-muted, #888)', height: '60px' }}>Paste content here...</div>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', marginBottom: '16px' }}>2. Review & Apply</h4>
          <div style={{ background: 'var(--bg-surface, #14141A)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <input type="checkbox" checked readOnly />
                <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 500 }}>SHORT DESCRIPTION</span>
              </div>
              <div style={{ background: 'var(--card-bg, #1A1A23)', borderRadius: '4px', padding: '8px', fontSize: '12px', color: 'var(--text-primary, #FFFFFF)' }}>Launch features for Q4 customers</div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <input type="checkbox" checked readOnly />
                <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 500 }}>SUGGESTED TAGS</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {['product-launch', 'q4', 'features'].map((tag) => (
                  <span key={tag} style={{ background: '#3B82F620', color: '#3B82F6', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>{tag}</span>
                ))}
              </div>
            </div>
            <button style={{ width: '100%', padding: '10px', background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 500 }}>
              Apply Selected (2)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Board Page Visual
function BoardPageVisual() {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '24px',
      }}
    >
      {/* Hero header mockup */}
      <div style={{ borderTop: '3px solid #8C69F0', padding: '20px', background: 'var(--bg-surface, #14141A)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>📊</span>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', margin: 0 }}>Competitive Intel</h3>
          <span style={{ background: '#1A1A1A', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>45</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ flex: 1, maxWidth: '300px', background: 'var(--card-bg, #1A1A23)', border: '1px solid var(--card-border, #2A2A35)', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: 'var(--text-muted, #888)' }}>🔍 Search...</div>
          <div style={{ background: 'var(--card-bg, #1A1A23)', border: '1px solid var(--card-border, #2A2A35)', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: 'var(--text-secondary, #AAA)' }}>Sort ▼</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <div style={{ background: '#8C69F0', borderRadius: '4px', padding: '8px 12px' }}>⊞</div>
            <div style={{ background: 'var(--card-bg, #1A1A23)', border: '1px solid var(--card-border, #2A2A35)', borderRadius: '4px', padding: '8px 12px' }}>≡</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          {['All', 'Zendesk', 'Salesforce', 'Intercom'].map((tag, i) => (
            <span key={tag} style={{ background: i === 0 ? '#8C69F0' : 'var(--card-bg, #1A1A23)', color: i === 0 ? 'white' : 'var(--text-secondary, #AAA)', padding: '6px 14px', borderRadius: '16px', fontSize: '12px', border: i === 0 ? 'none' : '1px solid var(--card-border, #2A2A35)' }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Content sections */}
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8C69F0' }} />
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #FFFFFF)', margin: 0 }}>Zendesk</h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted, #888)' }}>12 assets</span>
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted, #888)' }}>▼</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: 'var(--bg-surface, #14141A)', border: '1px solid var(--card-border, #2A2A35)', borderRadius: '8px', padding: '12px', height: '80px' }} />
            ))}
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)', textAlign: 'center' }}>Tag subsections organize assets within the board</div>
      </div>
    </div>
  );
}

// Board-Tag Relationship Diagram
function BoardTagRelationshipDiagram() {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Board */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted, #888)', textTransform: 'uppercase', marginBottom: '8px' }}>Board</div>
          <div style={{ background: '#8C69F020', border: '2px solid #8C69F0', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontWeight: 600, color: '#8C69F0', marginBottom: '8px' }}>Competitive Intel</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)' }}>Has tags:</div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
              {['zendesk', 'salesforce'].map((tag) => (
                <span key={tag} style={{ background: '#3B82F620', color: '#3B82F6', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ padding: '40px 0', color: 'var(--text-muted, #888)' }}>←→</div>

        {/* Tag */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted, #888)', textTransform: 'uppercase', marginBottom: '8px' }}>Tag</div>
          <div style={{ background: '#3B82F620', border: '2px solid #3B82F6', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontWeight: 600, color: '#3B82F6', marginBottom: '8px' }}>zendesk</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)' }}>On boards:</div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
              {['Competitive Intel', 'Sales Training'].map((board) => (
                <span key={board} style={{ background: '#8C69F020', color: '#8C69F0', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>{board}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ padding: '40px 0', color: 'var(--text-muted, #888)' }}>←→</div>

        {/* Asset */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted, #888)', textTransform: 'uppercase', marginBottom: '8px' }}>Asset</div>
          <div style={{ background: '#10B98120', border: '2px solid #10B981', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontWeight: 600, color: '#10B981', marginBottom: '8px' }}>Zendesk Battle Card</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)' }}>Has tag: zendesk</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)', marginTop: '8px' }}>→ Appears in &quot;Zendesk&quot; section on both boards</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tag Manager Visual
function TagManagerVisual() {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '24px',
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border, #2A2A35)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: 'var(--bg-surface, #14141A)', border: '1px solid var(--card-border, #2A2A35)', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: 'var(--text-muted, #888)' }}>🔍 Search tags...</div>
          <select style={{ background: 'var(--bg-surface, #14141A)', border: '1px solid var(--card-border, #2A2A35)', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: 'var(--text-secondary, #AAA)' }}>
            <option>All Categories</option>
          </select>
        </div>
        <button style={{ background: '#8C69F0', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: 500 }}>+ New Tag</button>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg-surface, #14141A)' }}>
            {['Name', 'Slug', 'Category', 'Boards', 'Assets', ''].map((header) => (
              <th key={header} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted, #888)', fontWeight: 600 }}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { name: 'Zendesk', slug: 'zendesk', category: 'Competitor', boards: 2, assets: 12 },
            { name: 'Discovery', slug: 'discovery', category: 'Topic', boards: 3, assets: 8 },
            { name: 'Enterprise', slug: 'enterprise', category: 'Use Case', boards: 4, assets: 15 },
          ].map((tag) => (
            <tr key={tag.slug} style={{ borderBottom: '1px solid var(--card-border, #2A2A35)' }}>
              <td style={{ padding: '12px 16px', color: 'var(--text-primary, #FFFFFF)', fontSize: '13px' }}>{tag.name}</td>
              <td style={{ padding: '12px 16px', color: 'var(--text-muted, #888)', fontSize: '12px', fontFamily: 'monospace' }}>{tag.slug}</td>
              <td style={{ padding: '12px 16px' }}><span style={{ background: '#3B82F620', color: '#3B82F6', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>{tag.category}</span></td>
              <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)', fontSize: '12px' }}>{tag.boards}</td>
              <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #AAA)', fontSize: '12px' }}>{tag.assets}</td>
              <td style={{ padding: '12px 16px' }}><button style={{ background: 'none', border: 'none', color: '#8C69F0', fontSize: '12px', cursor: 'pointer' }}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// CSV Workflow Visual
function CSVWorkflowVisual() {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#10B98120', border: '2px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px' }}>📤</div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #FFFFFF)' }}>Export</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)' }}>Download CSV</div>
        </div>
        <div style={{ color: 'var(--text-muted, #888)', fontSize: '20px' }}>→</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#3B82F620', border: '2px solid #3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px' }}>📝</div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #FFFFFF)' }}>Edit</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)' }}>Modify in Excel</div>
        </div>
        <div style={{ color: 'var(--text-muted, #888)', fontSize: '20px' }}>→</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#8C69F020', border: '2px solid #8C69F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px' }}>📥</div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #FFFFFF)' }}>Import</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)' }}>Upload changes</div>
        </div>
        <div style={{ color: 'var(--text-muted, #888)', fontSize: '20px' }}>→</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#F59E0B20', border: '2px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px' }}>✓</div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #FFFFFF)' }}>Review</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)' }}>Confirm updates</div>
        </div>
      </div>
    </div>
  );
}

// Bulk Actions Visual
function BulkActionsVisual() {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '24px',
      }}
    >
      {/* Bulk action toolbar */}
      <div style={{ padding: '12px 16px', background: '#8C69F015', borderBottom: '1px solid #8C69F030', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: '#8C69F0', fontWeight: 500 }}>3 selected</span>
        <div style={{ height: '20px', width: '1px', background: 'var(--card-border, #2A2A35)' }} />
        {['Add to Boards', 'Add Tags', 'Change Status', 'Delete'].map((action) => (
          <button key={action} style={{ background: 'var(--card-bg, #1A1A23)', border: '1px solid var(--card-border, #2A2A35)', borderRadius: '4px', padding: '6px 12px', fontSize: '12px', color: action === 'Delete' ? '#EF4444' : 'var(--text-secondary, #AAA)' }}>{action}</button>
        ))}
      </div>

      {/* Table rows with checkboxes */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {[
            { title: 'Q4 Product Launch Deck', checked: true },
            { title: 'Discovery Workshop Recording', checked: true },
            { title: 'Zendesk Battle Card', checked: true },
            { title: 'Sales Playbook 2026', checked: false },
          ].map((row) => (
            <tr key={row.title} style={{ borderBottom: '1px solid var(--card-border, #2A2A35)', background: row.checked ? '#8C69F008' : 'transparent' }}>
              <td style={{ padding: '12px 16px', width: '40px' }}><input type="checkbox" checked={row.checked} readOnly /></td>
              <td style={{ padding: '12px 16px', color: 'var(--text-primary, #FFFFFF)', fontSize: '13px' }}>{row.title}</td>
              <td style={{ padding: '12px 16px' }}><span style={{ background: '#8C69F020', color: '#8C69F0', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Content</span></td>
              <td style={{ padding: '12px 16px', color: 'var(--text-muted, #888)', fontSize: '12px' }}>Published</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

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

function UrlCard({ path, label, description }: { path: string; label: string; description: string }) {
  return (
    <div
      style={{
        background: 'var(--card-bg, #1A1A23)',
        border: '1px solid var(--card-border, #2A2A35)',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <code style={{ background: 'var(--hover-bg, #252530)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#8C69F0', whiteSpace: 'nowrap' }}>{path}</code>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #FFFFFF)' }}>{label}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted, #888)' }}>{description}</div>
      </div>
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
