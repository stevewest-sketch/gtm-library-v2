# GTM Library v2 - Project Plan & Claude Code Prompt

## Overview

A complete rebuild of the Gladly GTM enablement platform with:
- New design system (unified card components, hub-based color theming)
- New organization schema (Hub → Format → Type → Tags)
- Claude Skills-powered content management system
- Automatic cataloging and tag inference from uploaded content

---

## Project Structure

```
gtm-library-v2/
├── .claude/
│   └── skills/                     # Custom Claude Skills
│       ├── content-ingest/         # Content upload & cataloging
│       │   └── SKILL.md
│       ├── catalog-manager/        # Catalog CRUD operations
│       │   └── SKILL.md
│       └── page-builder/           # Generate pages from templates
│           └── SKILL.md
├── app/                            # Next.js App Router
│   ├── (library)/                  # Library routes
│   │   ├── page.tsx                # Home/Dashboard
│   │   ├── [board]/
│   │   │   └── page.tsx            # Board view (CoE, Content, etc.)
│   │   └── asset/
│   │       └── [slug]/
│   │           └── page.tsx        # Resource detail page
│   ├── api/
│   │   ├── catalog/                # Catalog API routes
│   │   ├── upload/                 # Content upload endpoints
│   │   └── search/                 # Search API
│   └── layout.tsx
├── components/
│   ├── ui/                         # Base UI components
│   ├── library/                    # Library-specific components
│   │   ├── LibraryCard.tsx         # Unified card component
│   │   ├── LibrarySidebar.tsx      # Navigation sidebar
│   │   ├── LibraryHeader.tsx       # Global header
│   │   ├── FilterSidebar.tsx       # Tag/filter sidebar
│   │   ├── ResourceDetail.tsx      # Content detail view
│   │   └── TrainingDetail.tsx      # Enablement detail view
│   └── admin/                      # Content management UI
│       ├── ContentUploader.tsx
│       ├── CatalogEditor.tsx
│       └── TagManager.tsx
├── lib/
│   ├── sanity/                     # Sanity CMS client
│   ├── catalog/                    # Catalog utilities
│   │   ├── schema.ts               # TypeScript types
│   │   ├── inference.ts            # Auto-tag inference
│   │   └── transform.ts            # Data transformations
│   ├── search/                     # Search implementation
│   │   ├── pinecone.ts             # Vector search
│   │   └── fuse.ts                 # Text search fallback
│   └── skills/                     # Skill utilities
├── sanity/
│   ├── schemas/                    # Sanity schema definitions
│   │   ├── resource.ts
│   │   ├── training.ts
│   │   ├── board.ts
│   │   └── tag.ts
│   └── sanity.config.ts
├── styles/
│   └── design-system.css           # Unified CSS framework
├── content/
│   └── catalog.json                # Local catalog (dev/backup)
├── scripts/
│   ├── migrate-catalog.ts          # Migrate from v1
│   ├── ingest-content.ts           # Bulk content import
│   └── generate-embeddings.ts      # Generate search embeddings
└── docs/
    ├── DESIGN_SYSTEM.md
    ├── ORGANIZATION_SCHEMA.md
    └── CONTENT_WORKFLOW.md
```

---

## Design System

### Hub Color Themes

| Hub | Primary | Light | Hover | Accent |
|-----|---------|-------|-------|--------|
| **CoE** | #F59E0B | #FEF3C7 | #FFFBEB | #B45309 |
| **Content** | #8C69F0 | #EDE9FE | #F5F3FF | #6D28D9 |
| **Enablement** | #10B981 | #D1FAE5 | #ECFDF5 | #047857 |

### Board Colors (Navigation)

| Board | Color | Dot |
|-------|-------|-----|
| Product | #3B82F6 | Blue |
| Competitive | #EF4444 | Red |
| Sales | #0EA5E9 | Cyan |
| CSM | #8B5CF6 | Violet |
| SC | #EC4899 | Pink |
| Demo | #06B6D4 | Teal |
| Proof Points | #84CC16 | Lime |

### Card Component

```tsx
// LibraryCard.tsx - Unified card for all content types
interface LibraryCardProps {
  hub: 'coe' | 'content' | 'enablement';
  format: FormatType;
  title: string;
  description: string;
  tags: string[];
  views?: number;
  shares?: number;
  duration?: string;  // For training content
  href: string;
}
```

**Card Anatomy:**
1. Hub color bar (4px)
2. Hub badge + Format icon (header)
3. Title (14px bold, 2-line clamp)
4. Description (12px, 2-line clamp)
5. Tags (10px pills)
6. Footer: Stats + Action link

---

## Organization Schema

### Taxonomy Structure

```typescript
interface CatalogEntry {
  // Required fields
  id: string;
  title: string;
  hub: 'coe' | 'content' | 'enablement';
  format: FormatType;
  
  // Content fields
  description: string;
  primaryLink: string;
  shareLink?: string;
  
  // Classification
  types: TypeValue[];      // Multiple selection
  tags: string[];          // Free-form, comma-separated
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  owner?: string;
  presenters?: string[];   // For training
  duration?: string;       // For video/training
  
  // Analytics
  views: number;
  shares: number;
  
  // Learning content (optional)
  takeaways?: string[];
  howtos?: HowToItem[];
  tips?: string[];
  
  // Links (optional)
  links?: ResourceLink[];
}

type FormatType = 
  | 'slides' | 'pdf' | 'document' | 'video' 
  | 'article' | 'tool' | 'guide' | 'sequence' 
  | 'sheet' | 'training' | 'playbook';

type TypeValue =
  | 'deck' | 'one-pager' | 'battlecard' | 'template'
  | 'calculator' | 'meeting-asset' | 'proof-point'
  | 'best-practice' | 'certification' | 'case-study';

interface ResourceLink {
  type: 'video' | 'slides' | 'document' | 'transcript' | 'link';
  title: string;
  subtitle: string;
  url: string;
}

interface HowToItem {
  title: string;
  content: string;
}
```

### Hub Definitions

| Hub | Purpose | Content Types |
|-----|---------|---------------|
| **CoE** | Best practices, templates, meeting examples | BVA/EBR/QBR decks, customer examples, methodologies |
| **Content** | External-facing materials | Battlecards, one-pagers, product decks, case studies |
| **Enablement** | Internal training & learning | Training sessions, certifications, playbooks |

---

## Claude Skills for Content Management

### Skill 1: Content Ingest (`content-ingest`)

Automatically processes uploaded content and generates catalog entries.

```markdown
---
name: content-ingest
description: |
  Processes uploaded content (links, documents, presentations) and 
  generates structured catalog entries with automatic tag inference.
  Extracts metadata, suggests hub/format/type, and creates entries.
---

# Content Ingest Skill

## Capabilities
- Parse Google Drive/Slides/Docs links
- Extract metadata from URLs (title, description)
- Infer hub, format, and type from content
- Suggest relevant tags based on content analysis
- Generate catalog entry JSON

## Input Types
- Google Drive links
- Google Slides links
- Google Docs links
- Loom/Zoom recording links
- PDF files
- Raw text content

## Workflow
1. Parse input URL or content
2. Fetch metadata (title, description, etc.)
3. Analyze content to determine:
   - Hub (CoE/Content/Enablement)
   - Format (slides/pdf/video/etc.)
   - Type (deck/battlecard/training/etc.)
4. Generate suggested tags based on:
   - Keywords in title/description
   - Known product names (Sidekick, Hero, Voice)
   - Known competitor names (Zendesk, Intercom)
   - Role indicators (sales, csm, sc)
5. Output structured catalog entry

## Tag Inference Rules
- Contains "battle" or "vs" or competitor name → competitive tag
- Contains "BVA" or "value" → bva tag
- Contains "EBR" or "QBR" → meeting type tag
- Contains product name → product tag
- Contains "training" or "enablement" → training tag
- Contains role name → role tag

## Example

Input:
```
https://docs.google.com/presentation/d/abc123/edit
Title: Zendesk Sidekick Competitive Battle Card
```

Output:
```json
{
  "title": "Zendesk Sidekick Competitive Battle Card",
  "hub": "content",
  "format": "slides",
  "types": ["battlecard"],
  "tags": ["competitive", "zendesk", "sidekick", "sales"],
  "primaryLink": "https://docs.google.com/presentation/d/abc123/edit",
  "description": "Competitive positioning guide for Sidekick deals against Zendesk AI"
}
```
```

### Skill 2: Catalog Manager (`catalog-manager`)

CRUD operations for the content catalog.

```markdown
---
name: catalog-manager
description: |
  Manages the GTM Library catalog - create, read, update, delete entries.
  Syncs with Sanity CMS and maintains local backup.
---

# Catalog Manager Skill

## Operations

### Create Entry
- Validate required fields
- Generate unique slug
- Set timestamps
- Sync to Sanity
- Update local catalog.json

### Update Entry
- Preserve existing analytics (views/shares)
- Update modified timestamp
- Sync changes to Sanity

### Delete Entry
- Soft delete (archive) by default
- Hard delete with confirmation
- Remove from search index

### Bulk Operations
- Import from CSV
- Export to CSV
- Batch update tags
- Migrate hub assignments

## Validation Rules
- Title: Required, max 100 chars
- Hub: Required, must be valid hub
- Format: Required, must be valid format
- Primary Link: Required, valid URL
- Tags: At least 1 tag recommended

## Search & Filter
- Filter by hub, format, type, tags
- Full-text search on title/description
- Sort by views, shares, date
```

### Skill 3: Page Builder (`page-builder`)

Generate pages from templates.

```markdown
---
name: page-builder
description: |
  Generates resource detail pages and board views from templates.
  Handles both content resources and training/enablement content.
---

# Page Builder Skill

## Page Types

### Resource Detail Page
For Content and CoE hub items (external resources).

Components:
- Header with title, share button
- Shareable URL
- Preview carousel
- File info bar
- Quick links grid
- Metadata grid

### Training Detail Page
For Enablement hub items (learning content).

Components:
- Header with presenters, duration
- Video player + materials sidebar
- Key Takeaways section
- How To section (collapsible)
- Tips & Best Practices
- Metadata grid

### Board View Page
Grid of cards for a specific board.

Components:
- Board header with count
- Filter sidebar (board tags, cross-filters)
- Card grid (4-col responsive)
- Pagination/infinite scroll

## Template Variables
- {{hub}} - Hub name and color
- {{format}} - Format icon and label
- {{title}} - Resource title
- {{description}} - Description text
- {{tags}} - Tag pills
- {{links}} - Quick links array
- {{takeaways}} - Learning takeaways
- {{howtos}} - How-to steps
- {{tips}} - Best practices
```

---

## Content Upload Workflow

### Manual Upload Flow

1. User pastes link or uploads file
2. System extracts metadata
3. Content Ingest skill analyzes content
4. Suggested catalog entry displayed
5. User reviews and adjusts:
   - Confirm/change hub
   - Confirm/change format
   - Add/remove types
   - Add/remove tags
   - Edit description
6. User saves entry
7. System syncs to Sanity
8. Search index updated

### Bulk Import Flow

1. User uploads CSV with columns:
   - title, link, hub, format, types, tags, description
2. System validates each row
3. Content Ingest skill fills missing fields
4. Preview table shown with suggestions
5. User reviews and bulk approves
6. Entries created in Sanity
7. Search index rebuilt

### Auto-Catalog Flow (Advanced)

1. Connect Google Drive folder
2. System watches for new files
3. On new file:
   - Extract metadata
   - Run Content Ingest skill
   - Create draft entry
   - Notify admin for review
4. Admin approves or adjusts
5. Entry published

---

## Search Implementation

### Hybrid Search Architecture

```
User Query
    │
    ├──► Fuse.js (Text Search)
    │       - Title matching
    │       - Description matching
    │       - Tag matching
    │
    └──► Pinecone (Vector Search)
            - Semantic similarity
            - Related content
            - Cross-hub discovery
                    │
                    ▼
            Merge & Rank Results
                    │
                    ▼
            Return Top N Results
```

### Embedding Generation

- Model: Voyage AI (voyage-3.5)
- Dimensions: 1024
- Content indexed:
  - Title + Description
  - Tags (expanded)
  - Takeaways (for training)
  - How-to content (for training)

---

## Migration Plan

### Phase 1: Foundation (Week 1)
- [ ] Set up new GitHub repo
- [ ] Set up new Vercel project
- [ ] Initialize Next.js with App Router
- [ ] Configure Sanity studio
- [ ] Implement design system CSS
- [ ] Create base components

### Phase 2: Core Features (Week 2)
- [ ] Implement LibraryCard component
- [ ] Build sidebar navigation
- [ ] Create board view pages
- [ ] Implement resource detail page
- [ ] Implement training detail page

### Phase 3: Content Management (Week 3)
- [ ] Set up Claude Skills
- [ ] Build content upload UI
- [ ] Implement Content Ingest skill
- [ ] Create catalog manager
- [ ] Build tag management UI

### Phase 4: Search & Polish (Week 4)
- [ ] Implement Fuse.js search
- [ ] Set up Pinecone integration
- [ ] Generate embeddings
- [ ] Add analytics tracking
- [ ] Performance optimization

### Phase 5: Migration (Week 5)
- [ ] Export existing catalog
- [ ] Transform to new schema
- [ ] Import to new system
- [ ] Verify all content
- [ ] Redirect old URLs

---

## Environment Variables

```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=

# Search
PINECONE_API_KEY=
PINECONE_INDEX=gtm-library

# Voyage AI (Embeddings)
VOYAGE_API_KEY=

# Auth (if needed)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Analytics
NEXT_PUBLIC_GA_ID=
```

---

## File References

The following HTML mockups from v1 serve as design references:

| File | Purpose |
|------|---------|
| `gtm-library-v7.html` | Main library view with v5 nav + v6 cards |
| `gtm-resource-in-library.html` | Content resource detail page |
| `gtm-enablement-in-library.html` | Training detail page |
| `gtm-library-card-system-v6.html` | Card design system documentation |

---

## Success Metrics

- **Findability**: Time to locate content < 30 seconds
- **Adoption**: 40+ daily active users
- **Content**: 400+ cataloged resources
- **Satisfaction**: User feedback score > 4/5
- **Maintenance**: < 5 min to add new content

---

# Claude Code Prompt

Use this prompt to initialize the project with Claude Code:

---

## PROMPT START

```
I need help building GTM Library v2, a Next.js enablement platform for Gladly's GTM team.

## Project Context

This is a rebuild of an existing enablement site with:
- New design system (unified cards, hub-based colors)
- New organization schema (Hub → Format → Type → Tags)  
- Claude Skills for content management
- Automatic cataloging and tag inference

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Sanity CMS (headless)
- Pinecone (vector search)
- Voyage AI (embeddings)
- Vercel (hosting)

## Design System

Three hubs with distinct colors:
- CoE (orange): #F59E0B - Best practices, templates
- Content (purple): #8C69F0 - External materials
- Enablement (green): #10B981 - Training, learning

Unified card component with:
- 4px colored top bar (hub color)
- Hub badge + format icon header
- Title, description (clamped)
- Tag pills
- Footer with stats + action link

## Organization Schema

```typescript
interface CatalogEntry {
  id: string;
  title: string;
  hub: 'coe' | 'content' | 'enablement';
  format: 'slides' | 'pdf' | 'document' | 'video' | 'article' | 'tool' | 'guide' | 'sheet' | 'training' | 'playbook';
  types: string[];  // deck, battlecard, template, etc.
  tags: string[];   // free-form: sales, csm, sidekick, zendesk, etc.
  description: string;
  primaryLink: string;
  // ... additional fields for training content
}
```

## Key Features Needed

1. **Library Shell**
   - Global header with search (⌘K)
   - Left sidebar with boards navigation
   - Filter sidebar with board tags + cross-filters
   - Card grid view (4-col responsive)

2. **Resource Detail Page**
   - For Content/CoE items
   - Preview carousel
   - Quick links with copy-to-clipboard
   - Shareable URL

3. **Training Detail Page**
   - For Enablement items
   - Video player + materials
   - Key Takeaways
   - How To (collapsible)
   - Tips section

4. **Content Management**
   - Upload form (paste link or upload)
   - Auto-extract metadata
   - Auto-suggest hub/format/tags
   - Review and save flow

5. **Claude Skills**
   - content-ingest: Process uploads, infer tags
   - catalog-manager: CRUD operations
   - page-builder: Generate pages from templates

## Initial Tasks

1. Initialize Next.js project with TypeScript and Tailwind
2. Set up project structure per the plan
3. Create design system CSS with hub colors and card styles
4. Build LibraryCard component
5. Build LibrarySidebar component
6. Create basic routing structure

## Reference Files

I have HTML mockups showing the exact designs:
- Library view with cards and navigation
- Resource detail page layout
- Training detail page layout
- Card design system documentation

Please start by setting up the project foundation and core components.
```

## PROMPT END

---

## Quick Start Commands

```bash
# Create new project
npx create-next-app@latest gtm-library-v2 --typescript --tailwind --app --src-dir

# Navigate to project
cd gtm-library-v2

# Install dependencies
npm install @sanity/client @sanity/image-url next-sanity
npm install @pinecone-database/pinecone
npm install fuse.js
npm install lucide-react
npm install clsx tailwind-merge

# Set up Sanity
npm create sanity@latest -- --project gtm-library-v2 --dataset production

# Initialize Claude Skills directory
mkdir -p .claude/skills/content-ingest
mkdir -p .claude/skills/catalog-manager
mkdir -p .claude/skills/page-builder
```

---

## Notes

- Keep existing site running during migration
- Use feature flags for gradual rollout
- Export/import catalog data carefully
- Test in Google Sites iframe compatibility
- Maintain URL structure for redirects
