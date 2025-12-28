# GTM Library - Enhanced Admin & CMS Architecture Plan v2

## New Capabilities Overview

1. **Section Customization** - Drag-and-drop section ordering, show/hide toggles
2. **Media Preview & Embed** - Direct video playback, document previews via Google Drive/iframe
3. **AI Auto-Generation** - Automatic metadata, tags, and learning content from uploads
4. **Flexible Resource URLs** - Custom URL types with labels
5. **Bulk CSV Import** - Mass asset creation with validation

---

## 1. Section Customization System

### Concept
Each asset can have a custom `sections_config` JSON field that defines:
- Which sections are visible
- The order of sections
- Section-specific settings

### Database Schema Addition

```sql
-- Add to catalog table
ALTER TABLE catalog ADD COLUMN sections_config JSONB DEFAULT NULL;

-- Example sections_config structure:
-- {
--   "sections": [
--     { "id": "video", "visible": true, "order": 1 },
--     { "id": "takeaways", "visible": true, "order": 2, "collapsed": false },
--     { "id": "howtos", "visible": true, "order": 3, "collapsed": false },
--     { "id": "tips", "visible": true, "order": 4 },
--     { "id": "materials", "visible": true, "order": 5 },
--     { "id": "metadata", "visible": true, "order": 6 }
--   ],
--   "layout": "training"  -- or "simple", "two-column"
-- }
```

### Available Sections Registry

```typescript
const SECTION_REGISTRY = {
  // Universal sections
  video: {
    id: 'video',
    label: 'Video Player',
    icon: '📹',
    description: 'Embedded video from Loom, Zoom, YouTube, Vimeo, or Google Drive',
    requiresField: 'training_content.video_url',
    hubs: ['enablement', 'content', 'coe']
  },
  preview: {
    id: 'preview',
    label: 'Document Preview',
    icon: '📄',
    description: 'Preview carousel for slides, PDFs, documents',
    requiresField: 'preview_image OR primary_link',
    hubs: ['content', 'coe']
  },
  file_info: {
    id: 'file_info',
    label: 'File Information',
    icon: '📎',
    description: 'Filename, size, download button',
    requiresField: 'filename OR primary_link',
    hubs: ['content', 'coe', 'enablement']
  },
  quick_links: {
    id: 'quick_links',
    label: 'Quick Links',
    icon: '🔗',
    description: 'Grid of clickable resource links with copy buttons',
    requiresField: 'resource_links',
    hubs: ['content', 'coe']
  },
  
  // Enablement-specific sections
  takeaways: {
    id: 'takeaways',
    label: 'Key Takeaways',
    icon: '✅',
    description: 'Bulleted list of main learning points',
    requiresField: 'training_content.takeaways',
    hubs: ['enablement'],
    collapsible: true
  },
  howtos: {
    id: 'howtos',
    label: 'How-To Steps',
    icon: '📋',
    description: 'Numbered steps with titles and descriptions',
    requiresField: 'howtos',
    hubs: ['enablement'],
    collapsible: true
  },
  tips: {
    id: 'tips',
    label: 'Tips & Best Practices',
    icon: '💡',
    description: 'Actionable tips in a highlighted card',
    requiresField: 'training_content.tips',
    hubs: ['enablement']
  },
  materials: {
    id: 'materials',
    label: 'Session Materials',
    icon: '📚',
    description: 'Sidebar list of related resources (slides, transcript, etc.)',
    requiresField: 'resource_links',
    hubs: ['enablement']
  },
  
  // Universal footer
  metadata: {
    id: 'metadata',
    label: 'Metadata',
    icon: 'ℹ️',
    description: 'Hub, format, tags, views, owner info',
    requiresField: null, // Always available
    hubs: ['content', 'coe', 'enablement']
  }
};
```

### Section Editor UI Component

```html
<!-- Section Configuration Panel in Asset Editor -->
<div class="section-config-panel">
    <div class="panel-header">
        <h3>Page Sections</h3>
        <p>Drag to reorder, toggle visibility</p>
    </div>
    
    <div class="section-list" id="sortableSections">
        <!-- Draggable section items -->
        <div class="section-item" data-section="video">
            <span class="drag-handle">⋮⋮</span>
            <span class="section-icon">📹</span>
            <span class="section-label">Video Player</span>
            <label class="toggle">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
            </label>
        </div>
        
        <div class="section-item" data-section="takeaways">
            <span class="drag-handle">⋮⋮</span>
            <span class="section-icon">✅</span>
            <span class="section-label">Key Takeaways</span>
            <label class="toggle">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
            </label>
            <button class="section-settings">⚙️</button>
        </div>
        
        <!-- More sections... -->
    </div>
    
    <button class="add-section-btn">+ Add Custom Section</button>
</div>
```

---

## 2. Media Preview & Embed System

### Video Embed Support

```typescript
interface VideoEmbed {
  platform: 'loom' | 'zoom' | 'youtube' | 'vimeo' | 'google_drive' | 'wistia' | 'direct';
  url: string;
  embedUrl: string;
  thumbnail?: string;
}

function detectVideoPlatform(url: string): VideoEmbed {
  const patterns = {
    loom: /loom\.com\/(share|embed)\/([a-zA-Z0-9]+)/,
    zoom: /zoom\.us\/rec\/(share|play)\/([a-zA-Z0-9\-_]+)/,
    youtube: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    vimeo: /vimeo\.com\/(\d+)/,
    google_drive: /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    wistia: /wistia\.com\/medias\/([a-zA-Z0-9]+)/
  };
  
  for (const [platform, regex] of Object.entries(patterns)) {
    const match = url.match(regex);
    if (match) {
      return {
        platform: platform as VideoEmbed['platform'],
        url,
        embedUrl: generateEmbedUrl(platform, match[1]),
        thumbnail: generateThumbnailUrl(platform, match[1])
      };
    }
  }
  
  return { platform: 'direct', url, embedUrl: url };
}

function generateEmbedUrl(platform: string, id: string): string {
  const embedFormats = {
    loom: `https://www.loom.com/embed/${id}`,
    zoom: `https://zoom.us/rec/play/${id}`, // Note: Zoom requires auth
    youtube: `https://www.youtube.com/embed/${id}`,
    vimeo: `https://player.vimeo.com/video/${id}`,
    google_drive: `https://drive.google.com/file/d/${id}/preview`,
    wistia: `https://fast.wistia.net/embed/iframe/${id}`
  };
  return embedFormats[platform] || id;
}
```

### Document Preview Support

```typescript
interface DocumentPreview {
  type: 'google_slides' | 'google_docs' | 'google_sheets' | 'pdf' | 'image';
  url: string;
  embedUrl: string;
  canPreview: boolean;
}

function getDocumentPreview(url: string): DocumentPreview {
  // Google Slides
  if (url.includes('docs.google.com/presentation')) {
    const id = extractGoogleId(url);
    return {
      type: 'google_slides',
      url,
      embedUrl: `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=3000`,
      canPreview: true
    };
  }
  
  // Google Docs
  if (url.includes('docs.google.com/document')) {
    const id = extractGoogleId(url);
    return {
      type: 'google_docs',
      url,
      embedUrl: `https://docs.google.com/document/d/${id}/preview`,
      canPreview: true
    };
  }
  
  // Google Drive files (PDFs, etc.)
  if (url.includes('drive.google.com/file')) {
    const id = extractGoogleId(url);
    return {
      type: 'pdf',
      url,
      embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      canPreview: true
    };
  }
  
  // Direct PDF URL
  if (url.endsWith('.pdf')) {
    return {
      type: 'pdf',
      url,
      embedUrl: url,
      canPreview: true
    };
  }
  
  return { type: 'pdf', url, embedUrl: url, canPreview: false };
}
```

### Preview Component

```tsx
// components/preview/MediaPreview.tsx
interface MediaPreviewProps {
  url: string;
  type: 'video' | 'document' | 'auto';
  title: string;
  thumbnail?: string;
}

export function MediaPreview({ url, type, title, thumbnail }: MediaPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Auto-detect type
  const mediaType = type === 'auto' ? detectMediaType(url) : type;
  
  if (mediaType === 'video') {
    const videoEmbed = detectVideoPlatform(url);
    
    return (
      <div className="video-preview">
        {!isLoading && thumbnail && (
          <div className="video-thumbnail" onClick={() => setIsLoading(true)}>
            <img src={thumbnail} alt={title} />
            <button className="play-button">▶</button>
          </div>
        )}
        
        {isLoading && (
          <iframe
            src={videoEmbed.embedUrl}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            onError={() => setError('Failed to load video')}
          />
        )}
        
        {error && (
          <div className="preview-error">
            <p>{error}</p>
            <a href={url} target="_blank" rel="noopener noreferrer">
              Open in new tab →
            </a>
          </div>
        )}
      </div>
    );
  }
  
  // Document preview
  const docPreview = getDocumentPreview(url);
  
  return (
    <div className="document-preview">
      {docPreview.canPreview ? (
        <iframe
          src={docPreview.embedUrl}
          title={title}
          frameBorder="0"
          onError={() => setError('Failed to load preview')}
        />
      ) : (
        <div className="preview-placeholder">
          <DocumentIcon type={docPreview.type} />
          <h4>{title}</h4>
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Open Document →
          </a>
        </div>
      )}
    </div>
  );
}
```

---

## 3. AI Auto-Generation System

### Overview
When a user uploads/pastes a URL, AI automatically:
1. Analyzes the content (title, description from metadata or content)
2. Suggests appropriate hub, format, and tags
3. For enablement content: generates takeaways, how-tos, and tips

### Database Schema for AI Jobs

```sql
-- AI generation jobs queue
CREATE TABLE ai_generation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog_id UUID REFERENCES catalog(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL,  -- 'metadata', 'tags', 'learning_content', 'full'
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'processing', 'completed', 'failed'
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- AI suggestions (for review before applying)
CREATE TABLE ai_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog_id UUID REFERENCES catalog(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,  -- 'title', 'description', 'tags', 'takeaways', etc.
    suggested_value JSONB NOT NULL,
    confidence DECIMAL(3,2),  -- 0.00 to 1.00
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'accepted', 'rejected', 'modified'
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### AI Generation API Endpoint

```typescript
// app/api/ai/generate/route.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface GenerateRequest {
  url: string;
  hub?: string;
  format?: string;
  generateLearningContent?: boolean;
}

export async function POST(request: Request) {
  const { url, hub, format, generateLearningContent } = await request.json();
  
  // Step 1: Fetch content metadata
  const metadata = await fetchUrlMetadata(url);
  
  // Step 2: Generate with Claude
  const prompt = buildGenerationPrompt(url, metadata, hub, format, generateLearningContent);
  
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });
  
  // Step 3: Parse and structure response
  const generated = parseAIResponse(message.content[0].text);
  
  return Response.json(generated);
}

function buildGenerationPrompt(
  url: string, 
  metadata: any, 
  hub?: string, 
  format?: string,
  generateLearningContent?: boolean
): string {
  return `You are helping organize content for a GTM (Go-To-Market) enablement library. 
Analyze the following content and generate structured metadata.

URL: ${url}
${metadata.title ? `Page Title: ${metadata.title}` : ''}
${metadata.description ? `Page Description: ${metadata.description}` : ''}
${metadata.content ? `Content Preview: ${metadata.content.substring(0, 2000)}` : ''}

Our library has 3 Hubs:
- CoE (Center of Excellence): BVA calculators, QBR templates, EBR guides, best practices
- Content: Sales decks, battlecards, one-pagers, case studies, videos
- Enablement: Training sessions, workshops, certifications, onboarding

Our Boards include: CoE, Content Types, Enablement, Product, Competitive, Sales, CSM, SC, Demo, Proof Points

Common Tags: sidekick, hero, voice, zendesk, intercom, ada, sierra, retail, travel, enterprise, sales, discovery, objection-handling

Please generate the following in JSON format:
{
  "title": "Clear, concise title (max 80 chars)",
  "description": "2-3 sentence description of the content",
  "hub": "coe | content | enablement",
  "format": "slides | video | training | document | pdf | sheet | tool | guide",
  "boards": ["array of relevant board slugs"],
  "tags": ["array of relevant tags"],
  "confidence": {
    "hub": 0.0-1.0,
    "tags": 0.0-1.0
  }
  ${generateLearningContent ? `,
  "learningContent": {
    "takeaways": ["3-5 key learning points"],
    "howtos": [
      {"title": "Step title", "content": "Step description"}
    ],
    "tips": ["3-5 actionable tips"]
  }` : ''}
}

Be accurate and conservative with confidence scores. Only suggest tags that are clearly relevant.`;
}
```

### AI Generation UI Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Add New Asset                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Step 1: Enter URL or Upload                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────┐│
│ │ https://zoom.us/rec/share/technical-buyer-training-xyz123              ││
│ └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ [🔮 Generate with AI]    [Skip - Manual Entry]                             │
│                                                                             │
│ ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│ AI Suggestions (Click to accept, ✏️ to edit)                   [Accept All]│
│                                                                             │
│ ┌─ Title ──────────────────────────────────────────────────────────────┐  │
│ │ Technical Buyer Enablement Training                    ✓ 95% confident│  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ Description ────────────────────────────────────────────────────────┐  │
│ │ Training on engaging CIO and CTO buyers in enterprise deals,         │  │
│ │ covering persona differences and meeting preparation strategies.     │  │
│ │                                                         ✓ 88% confident│  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ Hub & Format ───────────────────────────────────────────────────────┐  │
│ │ Hub: [🟢 Enablement ▼]        Format: [Training ▼]    ✓ 92% confident │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ Suggested Tags ─────────────────────────────────────────────────────┐  │
│ │ [✓ sales] [✓ enterprise] [✓ technical] [✓ cio] [✓ cto] [✓ sierra]   │  │
│ │ [+ Add more tags...]                                                  │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ Learning Content (Enablement) ──────────────────────────────────────┐  │
│ │ ☑ Generate Key Takeaways                                              │  │
│ │ ☑ Generate How-To Steps                                               │  │
│ │ ☑ Generate Tips & Best Practices                                      │  │
│ │                                                                        │  │
│ │ [🔮 Generate Learning Content]                                        │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│                                              [Cancel]  [Save as Draft]     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Flexible Resource URLs System

### Database Schema

```sql
-- Enhanced resource_links table
CREATE TABLE resource_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog_id UUID REFERENCES catalog(id) ON DELETE CASCADE,
    
    -- Link details
    url TEXT NOT NULL,
    link_type VARCHAR(50) NOT NULL,  -- Flexible type field
    label VARCHAR(200) NOT NULL,     -- Display label
    subtitle VARCHAR(200),           -- Optional subtitle
    
    -- Display options
    icon VARCHAR(10),                -- Emoji or icon code
    color VARCHAR(7),                -- Hex color for styling
    show_in_quick_links BOOLEAN DEFAULT true,
    show_in_materials BOOLEAN DEFAULT true,
    
    -- Metadata
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link types reference table (configurable)
CREATE TABLE link_types (
    id VARCHAR(50) PRIMARY KEY,      -- e.g., 'video', 'slides', 'pdf'
    label VARCHAR(100) NOT NULL,     -- Display name
    icon VARCHAR(10) NOT NULL,       -- Default icon
    color VARCHAR(7),                -- Default color
    is_system BOOLEAN DEFAULT false, -- Built-in vs user-created
    sort_order INT DEFAULT 0
);

-- Seed default link types
INSERT INTO link_types (id, label, icon, color, is_system, sort_order) VALUES
    ('video', 'Video Recording', '📹', '#EF4444', true, 1),
    ('slides', 'Slides', '📊', '#F59E0B', true, 2),
    ('document', 'Document', '📄', '#3B82F6', true, 3),
    ('pdf', 'PDF', '📕', '#DC2626', true, 4),
    ('transcript', 'Transcript', '📝', '#6B7280', true, 5),
    ('sheet', 'Spreadsheet', '📗', '#10B981', true, 6),
    ('link', 'External Link', '🔗', '#8B5CF6', true, 7),
    ('loom', 'Loom Video', '🎥', '#6366F1', true, 8),
    ('gong', 'Gong Recording', '🎙️', '#EC4899', true, 9),
    ('figma', 'Figma Design', '🎨', '#A855F7', true, 10),
    ('notion', 'Notion Page', '📓', '#000000', true, 11),
    ('confluence', 'Confluence', '📘', '#0052CC', true, 12);
```

### Resource Links Editor UI

```html
<!-- Flexible Resource Links Editor -->
<div class="resource-links-editor">
    <div class="links-header">
        <h3>Resource Links</h3>
        <div class="links-actions">
            <button class="btn-secondary" onclick="addLinkRow()">+ Add Link</button>
            <button class="btn-secondary" onclick="openLinkTypeManager()">Manage Types</button>
        </div>
    </div>
    
    <div class="links-list" id="linksList">
        <!-- Link Row -->
        <div class="link-row" data-id="1">
            <span class="drag-handle">⋮⋮</span>
            
            <div class="link-type-select">
                <select class="type-dropdown">
                    <option value="video" data-icon="📹">📹 Video</option>
                    <option value="slides" data-icon="📊">📊 Slides</option>
                    <option value="document" data-icon="📄">📄 Document</option>
                    <option value="pdf" data-icon="📕">📕 PDF</option>
                    <option value="transcript" data-icon="📝">📝 Transcript</option>
                    <option value="loom" data-icon="🎥">🎥 Loom</option>
                    <option value="gong" data-icon="🎙️">🎙️ Gong</option>
                    <optgroup label="Custom">
                        <option value="custom">+ Custom Type...</option>
                    </optgroup>
                </select>
            </div>
            
            <div class="link-details">
                <input type="text" class="link-label" placeholder="Label (e.g., Session Recording)" value="Session Recording">
                <input type="text" class="link-subtitle" placeholder="Subtitle (optional)" value="47 minutes">
            </div>
            
            <div class="link-url">
                <input type="url" placeholder="https://..." value="https://zoom.us/rec/share/xyz">
                <button class="preview-btn" title="Preview">👁️</button>
            </div>
            
            <div class="link-options">
                <label title="Show in Quick Links">
                    <input type="checkbox" checked> QL
                </label>
                <label title="Show in Materials sidebar">
                    <input type="checkbox" checked> Mat
                </label>
                <label title="Primary link">
                    <input type="radio" name="primary"> Pri
                </label>
            </div>
            
            <button class="remove-btn">🗑️</button>
        </div>
        
        <!-- More link rows... -->
    </div>
    
    <div class="links-footer">
        <p class="links-hint">Drag to reorder. Check QL for Quick Links grid, Mat for Materials sidebar.</p>
    </div>
</div>

<!-- Custom Link Type Modal -->
<div class="modal" id="customTypeModal">
    <div class="modal-content">
        <h3>Create Custom Link Type</h3>
        <div class="form-row">
            <label>ID (slug)</label>
            <input type="text" id="customTypeId" placeholder="e.g., workshop-recording">
        </div>
        <div class="form-row">
            <label>Label</label>
            <input type="text" id="customTypeLabel" placeholder="e.g., Workshop Recording">
        </div>
        <div class="form-row">
            <label>Icon (emoji)</label>
            <input type="text" id="customTypeIcon" placeholder="e.g., 🎓" maxlength="2">
        </div>
        <div class="form-row">
            <label>Color</label>
            <input type="color" id="customTypeColor" value="#6B7280">
        </div>
        <div class="modal-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="saveCustomType()">Save Type</button>
        </div>
    </div>
</div>
```

---

## 5. Bulk CSV Import System

### CSV Format Specification

```csv
title,description,hub,format,primary_link,boards,tags,owner,video_url,slides_url,document_url,presenters,duration,takeaways,tips
"Technical Buyer Training","Training on CIO/CTO engagement","enablement","training","https://zoom.us/rec/xyz","enablement,sales","sales,enterprise,cio,cto","Enablement Team","https://zoom.us/rec/xyz","https://docs.google.com/presentation/d/abc","","Christian Shockley","47 min","Takeaway 1|Takeaway 2|Takeaway 3","Tip 1|Tip 2"
"Zendesk Battle Card","Competitive positioning vs Zendesk","content","pdf","https://drive.google.com/file/d/xyz","competitive,sales","zendesk,competitive,sidekick","PMM Team","","https://docs.google.com/presentation/d/abc","","","","",""
```

### Database Schema for Import Jobs

```sql
-- Import jobs tracking
CREATE TABLE import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255),
    total_rows INT,
    processed_rows INT DEFAULT 0,
    successful_rows INT DEFAULT 0,
    failed_rows INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, processing, completed, failed
    error_log JSONB,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Import row results
CREATE TABLE import_row_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    import_job_id UUID REFERENCES import_jobs(id) ON DELETE CASCADE,
    row_number INT,
    status VARCHAR(20),  -- success, error, skipped
    catalog_id UUID REFERENCES catalog(id),
    error_message TEXT,
    original_data JSONB
);
```

### Import API Endpoint

```typescript
// app/api/import/csv/route.ts
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const options = JSON.parse(formData.get('options') as string);
  
  // Parse CSV
  const content = await file.text();
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  
  // Create import job
  const { data: job } = await supabase
    .from('import_jobs')
    .insert({
      filename: file.name,
      total_rows: records.length,
      status: 'processing'
    })
    .select()
    .single();
  
  // Process rows
  const results = [];
  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    try {
      const catalogEntry = await processImportRow(row, options);
      results.push({ row: i + 1, status: 'success', catalogId: catalogEntry.id });
    } catch (error) {
      results.push({ row: i + 1, status: 'error', error: error.message });
    }
  }
  
  // Update job status
  await supabase
    .from('import_jobs')
    .update({
      status: 'completed',
      processed_rows: records.length,
      successful_rows: results.filter(r => r.status === 'success').length,
      failed_rows: results.filter(r => r.status === 'error').length,
      completed_at: new Date().toISOString()
    })
    .eq('id', job.id);
  
  return Response.json({ jobId: job.id, results });
}

async function processImportRow(row: any, options: ImportOptions) {
  // 1. Create catalog entry
  const catalogData = {
    title: row.title,
    slug: generateSlug(row.title),
    description: row.description,
    hub: row.hub,
    format: row.format,
    primary_link: row.primary_link,
    owner: row.owner,
    status: options.defaultStatus || 'draft'
  };
  
  const { data: catalog, error } = await supabase
    .from('catalog')
    .insert(catalogData)
    .select()
    .single();
  
  if (error) throw error;
  
  // 2. Process boards
  if (row.boards) {
    const boardSlugs = row.boards.split(',').map(s => s.trim());
    const { data: boards } = await supabase
      .from('boards')
      .select('id')
      .in('slug', boardSlugs);
    
    if (boards?.length) {
      await supabase.from('catalog_boards').insert(
        boards.map(b => ({ catalog_id: catalog.id, board_id: b.id }))
      );
    }
  }
  
  // 3. Process tags
  if (row.tags) {
    const tagNames = row.tags.split(',').map(s => s.trim());
    for (const tagName of tagNames) {
      // Upsert tag
      const { data: tag } = await supabase
        .from('tags')
        .upsert({ name: tagName, slug: generateSlug(tagName) }, { onConflict: 'slug' })
        .select()
        .single();
      
      await supabase.from('catalog_tags').insert({
        catalog_id: catalog.id,
        tag_id: tag.id
      });
    }
  }
  
  // 4. Process resource links
  const links = [];
  if (row.video_url) links.push({ type: 'video', label: 'Video Recording', url: row.video_url });
  if (row.slides_url) links.push({ type: 'slides', label: 'Presentation', url: row.slides_url });
  if (row.document_url) links.push({ type: 'document', label: 'Document', url: row.document_url });
  
  if (links.length) {
    await supabase.from('resource_links').insert(
      links.map((link, i) => ({
        catalog_id: catalog.id,
        link_type: link.type,
        label: link.label,
        url: link.url,
        sort_order: i
      }))
    );
  }
  
  // 5. Process training content (if enablement)
  if (row.hub === 'enablement') {
    const trainingData = {
      catalog_id: catalog.id,
      presenters: row.presenters ? row.presenters.split(',').map(s => s.trim()) : null,
      duration: row.duration || null,
      video_url: row.video_url || null,
      takeaways: row.takeaways ? row.takeaways.split('|').map(s => s.trim()) : null,
      tips: row.tips ? row.tips.split('|').map(s => s.trim()) : null
    };
    
    await supabase.from('training_content').insert(trainingData);
  }
  
  // 6. Optionally run AI generation
  if (options.generateWithAI) {
    await queueAIGeneration(catalog.id, options.aiOptions);
  }
  
  return catalog;
}
```

### Bulk Import UI

```html
<!-- Bulk Import Page -->
<div class="import-page">
    <div class="page-header">
        <h1>Bulk Import Assets</h1>
        <p>Import multiple assets from a CSV file</p>
    </div>
    
    <!-- Step 1: Upload -->
    <div class="import-step" id="step1">
        <div class="step-header">
            <span class="step-number">1</span>
            <h3>Upload CSV File</h3>
        </div>
        <div class="step-content">
            <div class="upload-zone" id="uploadZone">
                <svg><!-- upload icon --></svg>
                <p>Drag & drop your CSV file here, or click to browse</p>
                <input type="file" accept=".csv" id="csvInput">
            </div>
            
            <div class="template-download">
                <p>Need a template?</p>
                <a href="/templates/import-template.csv" download>📥 Download CSV Template</a>
                <a href="/templates/import-template-enablement.csv" download>📥 Download Enablement Template</a>
            </div>
        </div>
    </div>
    
    <!-- Step 2: Preview & Map -->
    <div class="import-step hidden" id="step2">
        <div class="step-header">
            <span class="step-number">2</span>
            <h3>Preview & Configure</h3>
        </div>
        <div class="step-content">
            <div class="import-preview">
                <p><strong>File:</strong> <span id="fileName">assets.csv</span></p>
                <p><strong>Rows found:</strong> <span id="rowCount">24</span></p>
            </div>
            
            <div class="import-options">
                <h4>Import Options</h4>
                
                <label class="checkbox-option">
                    <input type="checkbox" id="optGenerateAI">
                    <span>🔮 Generate metadata with AI (titles, descriptions, tags)</span>
                </label>
                
                <label class="checkbox-option">
                    <input type="checkbox" id="optGenerateLearning">
                    <span>📚 Generate learning content for Enablement items</span>
                </label>
                
                <label class="checkbox-option">
                    <input type="checkbox" id="optSkipDuplicates" checked>
                    <span>Skip duplicate URLs (based on primary_link)</span>
                </label>
                
                <div class="select-option">
                    <label>Default status:</label>
                    <select id="optDefaultStatus">
                        <option value="draft">Draft (review before publishing)</option>
                        <option value="published">Published immediately</option>
                    </select>
                </div>
            </div>
            
            <div class="preview-table-container">
                <h4>Preview (first 5 rows)</h4>
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Hub</th>
                            <th>Format</th>
                            <th>Boards</th>
                            <th>Tags</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="previewBody">
                        <!-- Populated by JS -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <!-- Step 3: Import Progress -->
    <div class="import-step hidden" id="step3">
        <div class="step-header">
            <span class="step-number">3</span>
            <h3>Importing...</h3>
        </div>
        <div class="step-content">
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                </div>
                <p class="progress-text"><span id="progressCount">0</span> of <span id="progressTotal">24</span> rows processed</p>
            </div>
            
            <div class="import-log" id="importLog">
                <!-- Real-time log entries -->
            </div>
        </div>
    </div>
    
    <!-- Step 4: Results -->
    <div class="import-step hidden" id="step4">
        <div class="step-header">
            <span class="step-number">4</span>
            <h3>Import Complete</h3>
        </div>
        <div class="step-content">
            <div class="results-summary">
                <div class="result-card success">
                    <span class="result-number" id="successCount">22</span>
                    <span class="result-label">Successful</span>
                </div>
                <div class="result-card error">
                    <span class="result-number" id="errorCount">2</span>
                    <span class="result-label">Failed</span>
                </div>
                <div class="result-card skipped">
                    <span class="result-number" id="skippedCount">0</span>
                    <span class="result-label">Skipped</span>
                </div>
            </div>
            
            <div class="error-details" id="errorDetails">
                <h4>Errors</h4>
                <table class="error-table">
                    <thead>
                        <tr><th>Row</th><th>Title</th><th>Error</th></tr>
                    </thead>
                    <tbody id="errorTableBody"></tbody>
                </table>
            </div>
            
            <div class="results-actions">
                <a href="/manage" class="btn-primary">View All Assets</a>
                <button class="btn-secondary" onclick="startNewImport()">Import Another File</button>
                <a href="#" class="btn-secondary" id="downloadReport">📥 Download Report</a>
            </div>
        </div>
    </div>
    
    <!-- Navigation -->
    <div class="import-nav">
        <button class="btn-secondary" id="btnBack" onclick="prevStep()" disabled>← Back</button>
        <button class="btn-primary" id="btnNext" onclick="nextStep()">Continue →</button>
    </div>
</div>
```

---

## 6. Complete Supabase Schema Update

```sql
-- ================================================
-- COMPLETE ENHANCED SCHEMA
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE hub_type AS ENUM ('coe', 'content', 'enablement');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

-- ================================================
-- CORE TABLES
-- ================================================

-- Link types (configurable)
CREATE TABLE link_types (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    color VARCHAR(7),
    is_system BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boards
CREATE TABLE boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(10),
    color VARCHAR(7),
    bg_color VARCHAR(7),
    hub hub_type,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    display_name VARCHAR(100),
    color VARCHAR(7),
    is_suggested BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Board-Tag relationships
CREATE TABLE board_tags (
    board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    sort_order INT DEFAULT 0,
    PRIMARY KEY (board_id, tag_id)
);

-- Main catalog table (ENHANCED)
CREATE TABLE catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Info
    slug VARCHAR(200) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    
    -- Classification
    hub hub_type NOT NULL,
    format VARCHAR(50) NOT NULL,
    status content_status DEFAULT 'draft',
    
    -- Links
    primary_link TEXT,
    share_link TEXT,
    
    -- Preview
    preview_image TEXT,
    thumbnail_url TEXT,
    filename VARCHAR(255),
    filesize VARCHAR(50),
    
    -- Section configuration (NEW)
    sections_config JSONB DEFAULT NULL,
    
    -- Ownership
    owner VARCHAR(200),
    created_by UUID,
    
    -- Stats
    views INT DEFAULT 0,
    shares INT DEFAULT 0,
    
    -- Search
    search_vector TSVECTOR,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ
);

-- Catalog-Board relationships
CREATE TABLE catalog_boards (
    catalog_id UUID REFERENCES catalog(id) ON DELETE CASCADE,
    board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
    PRIMARY KEY (catalog_id, board_id)
);

-- Catalog-Tag relationships
CREATE TABLE catalog_tags (
    catalog_id UUID REFERENCES catalog(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (catalog_id, tag_id)
);

-- Resource links (ENHANCED)
CREATE TABLE resource_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog_id UUID REFERENCES catalog(id) ON DELETE CASCADE,
    
    -- Link details
    url TEXT NOT NULL,
    link_type VARCHAR(50) NOT NULL,
    label VARCHAR(200) NOT NULL,
    subtitle VARCHAR(200),
    
    -- Display options
    icon VARCHAR(10),
    color VARCHAR(7),
    show_in_quick_links BOOLEAN DEFAULT true,
    show_in_materials BOOLEAN DEFAULT true,
    
    -- Metadata
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training content
CREATE TABLE training_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog_id UUID UNIQUE REFERENCES catalog(id) ON DELETE CASCADE,
    
    -- Session info
    presenters TEXT[],
    duration VARCHAR(50),
    session_date DATE,
    
    -- Video
    video_url TEXT,
    video_platform VARCHAR(50),  -- 'loom', 'zoom', 'youtube', etc.
    video_thumbnail TEXT,
    
    -- Content arrays
    takeaways TEXT[],
    tips TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- How-to steps
CREATE TABLE training_howtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_id UUID REFERENCES training_content(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- AI & IMPORT TABLES
-- ================================================

-- AI generation jobs
CREATE TABLE ai_generation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog_id UUID REFERENCES catalog(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- AI suggestions
CREATE TABLE ai_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog_id UUID REFERENCES catalog(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    suggested_value JSONB NOT NULL,
    confidence DECIMAL(3,2),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Import jobs
CREATE TABLE import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255),
    total_rows INT,
    processed_rows INT DEFAULT 0,
    successful_rows INT DEFAULT 0,
    failed_rows INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    options JSONB,
    error_log JSONB,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Import row results
CREATE TABLE import_row_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    import_job_id UUID REFERENCES import_jobs(id) ON DELETE CASCADE,
    row_number INT,
    status VARCHAR(20),
    catalog_id UUID REFERENCES catalog(id),
    error_message TEXT,
    original_data JSONB
);

-- Analytics events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog_id UUID REFERENCES catalog(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    user_id UUID,
    user_email VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX catalog_search_idx ON catalog USING GIN(search_vector);
CREATE INDEX catalog_hub_idx ON catalog(hub);
CREATE INDEX catalog_status_idx ON catalog(status);
CREATE INDEX catalog_format_idx ON catalog(format);
CREATE INDEX catalog_updated_idx ON catalog(updated_at DESC);

CREATE INDEX resource_links_catalog_idx ON resource_links(catalog_id);
CREATE INDEX resource_links_type_idx ON resource_links(link_type);

CREATE INDEX ai_jobs_catalog_idx ON ai_generation_jobs(catalog_id);
CREATE INDEX ai_jobs_status_idx ON ai_generation_jobs(status);

CREATE INDEX import_jobs_status_idx ON import_jobs(status);
CREATE INDEX import_results_job_idx ON import_row_results(import_job_id);

-- ================================================
-- FUNCTIONS
-- ================================================

-- Generate slug
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Update search vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Get full asset with all relations
CREATE OR REPLACE FUNCTION get_asset_full(asset_slug TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'catalog', row_to_json(c.*),
        'boards', (
            SELECT COALESCE(json_agg(b.*), '[]'::json)
            FROM boards b
            JOIN catalog_boards cb ON cb.board_id = b.id
            WHERE cb.catalog_id = c.id
        ),
        'tags', (
            SELECT COALESCE(json_agg(t.*), '[]'::json)
            FROM tags t
            JOIN catalog_tags ct ON ct.tag_id = t.id
            WHERE ct.catalog_id = c.id
        ),
        'resource_links', (
            SELECT COALESCE(json_agg(rl.* ORDER BY rl.sort_order), '[]'::json)
            FROM resource_links rl
            WHERE rl.catalog_id = c.id
        ),
        'training_content', (
            SELECT row_to_json(tc.*)
            FROM training_content tc
            WHERE tc.catalog_id = c.id
        ),
        'howtos', (
            SELECT COALESCE(json_agg(th.* ORDER BY th.sort_order), '[]'::json)
            FROM training_howtos th
            JOIN training_content tc ON tc.id = th.training_id
            WHERE tc.catalog_id = c.id
        )
    ) INTO result
    FROM catalog c
    WHERE c.slug = asset_slug;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- TRIGGERS
-- ================================================

CREATE TRIGGER catalog_search_update
    BEFORE INSERT OR UPDATE ON catalog
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

CREATE TRIGGER catalog_timestamp_update
    BEFORE UPDATE ON catalog
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER training_content_timestamp_update
    BEFORE UPDATE ON training_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================
-- SEED DATA
-- ================================================

-- Link types
INSERT INTO link_types (id, label, icon, color, is_system, sort_order) VALUES
    ('video', 'Video Recording', '📹', '#EF4444', true, 1),
    ('slides', 'Slides', '📊', '#F59E0B', true, 2),
    ('document', 'Document', '📄', '#3B82F6', true, 3),
    ('pdf', 'PDF', '📕', '#DC2626', true, 4),
    ('transcript', 'Transcript', '📝', '#6B7280', true, 5),
    ('sheet', 'Spreadsheet', '📗', '#10B981', true, 6),
    ('link', 'External Link', '🔗', '#8B5CF6', true, 7),
    ('loom', 'Loom Video', '🎥', '#6366F1', true, 8),
    ('gong', 'Gong Recording', '🎙️', '#EC4899', true, 9),
    ('figma', 'Figma Design', '🎨', '#A855F7', true, 10),
    ('notion', 'Notion Page', '📓', '#1F2937', true, 11),
    ('confluence', 'Confluence', '📘', '#0052CC', true, 12);

-- Boards
INSERT INTO boards (name, slug, icon, color, bg_color, hub, sort_order) VALUES
    ('CoE', 'coe', '🏆', '#F59E0B', '#FEF3C7', 'coe', 1),
    ('Content Types', 'content-types', '📚', '#8C69F0', '#EDE9FE', 'content', 2),
    ('Enablement', 'enablement', '🎓', '#10B981', '#D1FAE5', 'enablement', 3),
    ('Product', 'product', '📦', '#3B82F6', '#DBEAFE', NULL, 4),
    ('Competitive', 'competitive', '⚔️', '#EF4444', '#FEE2E2', NULL, 5),
    ('Sales', 'sales', '💼', '#0EA5E9', '#E0F2FE', NULL, 6),
    ('CSM', 'csm', '🎯', '#8B5CF6', '#EDE9FE', NULL, 7),
    ('SC', 'sc', '🔧', '#EC4899', '#FCE7F3', NULL, 8),
    ('Demo', 'demo', '🎬', '#06B6D4', '#CFFAFE', NULL, 9),
    ('Proof Points', 'proof-points', '📈', '#84CC16', '#ECFCCB', NULL, 10);
```

---

## Summary: New Feature Checklist

### Section Customization
- [x] `sections_config` JSONB field in catalog table
- [x] Section registry with visibility rules
- [x] Drag-and-drop section editor UI
- [x] Show/hide toggles per section
- [x] Section-specific settings (collapsed by default, etc.)

### Media Preview & Embed
- [x] Video platform detection (Loom, Zoom, YouTube, Vimeo, Google Drive)
- [x] Auto-generate embed URLs
- [x] Document preview for Google Slides/Docs/Drive
- [x] Fallback handling for unsupported platforms
- [x] Preview button in resource links editor

### AI Auto-Generation
- [x] `ai_generation_jobs` table for async processing
- [x] `ai_suggestions` table for review workflow
- [x] Claude API integration for metadata generation
- [x] Learning content generation (takeaways, how-tos, tips)
- [x] Confidence scores for suggestions
- [x] Accept/reject/modify UI workflow

### Flexible Resource URLs
- [x] `link_types` configuration table
- [x] Custom link type creation
- [x] Icon and color customization
- [x] Show in Quick Links / Materials toggles
- [x] Primary link designation
- [x] Drag-and-drop reordering

### Bulk CSV Import
- [x] `import_jobs` tracking table
- [x] `import_row_results` for detailed logging
- [x] CSV parsing with column mapping
- [x] Validation and error handling
- [x] AI generation option during import
- [x] Skip duplicates option
- [x] Progress tracking UI
- [x] Downloadable results report
