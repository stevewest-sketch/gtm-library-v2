# GTM Library v2 - Claude Code Initialization Prompt

Copy and paste this entire prompt into Claude Code to start the project.

---

## PROMPT

I need help building **GTM Library v2**, a Next.js enablement platform for Gladly's GTM team. This is a complete rebuild with a new design system, organization schema, and Claude Skills-powered content management.

## Project Context

**Current State:**
- Existing site at gladly-gtm-hub.vercel.app (Vercel + Sanity)
- ~360+ content items in catalog
- Team-based organization (confusing for users)

**New Version Goals:**
- Collection-based organization (Hub → Format → Type → Tags)
- Unified card design system with hub-based colors
- Claude Skills for automatic content cataloging
- One-click copy-to-clipboard for sharing
- Search with vector embeddings

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom design tokens
- **CMS**: Sanity (headless)
- **Search**: Pinecone (vectors) + Fuse.js (text)
- **Embeddings**: Voyage AI (voyage-3.5)
- **Hosting**: Vercel
- **Auth**: NextAuth.js with Google OAuth (optional)

## Design System

### Hub Colors (Primary Differentiator)

| Hub | Primary | Light | Accent | Purpose |
|-----|---------|-------|--------|---------|
| **CoE** | #F59E0B | #FEF3C7 | #B45309 | Best practices, templates, meeting examples |
| **Content** | #8C69F0 | #EDE9FE | #6D28D9 | External materials (decks, battlecards, one-pagers) |
| **Enablement** | #10B981 | #D1FAE5 | #047857 | Training, certifications, playbooks |

### Board Colors (Navigation)

| Board | Color | Content |
|-------|-------|---------|
| Product | #3B82F6 | Product-specific materials |
| Competitive | #EF4444 | Battle cards, competitive intel |
| Sales | #0EA5E9 | Sales resources |
| CSM | #8B5CF6 | Customer success materials |
| Demo | #06B6D4 | Demo assets |
| Proof Points | #84CC16 | Case studies, metrics |

### Unified Card Component

All content displayed via single `LibraryCard` component:
- 4px colored top bar (hub color)
- Hub badge (left) + Format icon (right)
- Title (14px bold, 2-line clamp)
- Description (12px, 2-line clamp)
- Tag pills (10px)
- Footer: Stats + action link

Hover: `translateY(-4px)`, shadow, hub-colored border, light background tint.

## Organization Schema

```typescript
interface CatalogEntry {
  id: string;
  slug: string;
  title: string;
  hub: 'coe' | 'content' | 'enablement';
  format: 'slides' | 'pdf' | 'document' | 'video' | 'article' | 'tool' | 'guide' | 'sheet' | 'training' | 'playbook';
  types: string[];  // deck, battlecard, template, calculator, etc.
  tags: string[];   // sales, csm, sidekick, zendesk, retail, etc.
  description: string;
  primaryLink: string;
  shareLink?: string;
  
  // Training-specific (optional)
  presenters?: string[];
  duration?: string;
  takeaways?: string[];
  howtos?: { title: string; content: string }[];
  tips?: string[];
  
  // Metadata
  owner?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  shares: number;
  status: 'draft' | 'published' | 'archived';
}
```

## Key Features

### 1. Library Shell
- Global header (56px, dark gradient, G+ logo, breadcrumb, ⌘K search)
- Left sidebar with boards navigation (colored dots, counts)
- Filter sidebar (board tags + cross-filters with collapsible groups)
- Card grid (4-col responsive → 3 → 2 → 1)

### 2. Resource Detail Page (Content/CoE)
- Title + Share button
- Shareable URL below title
- Preview carousel with navigation
- File info bar (filename, size, download)
- Quick links grid with copy-to-clipboard
- Metadata grid (hub, format, type, updated, views, shares, owner, tags)

### 3. Training Detail Page (Enablement)
- Title + presenters + duration + date
- Video player with materials sidebar
- Key Takeaways (collapsible)
- How To section (numbered steps, collapsible)
- Tips & Best Practices (green card)
- Metadata grid

### 4. Content Management (Admin)
- Paste link or upload content
- Auto-extract metadata from URL
- Auto-suggest hub, format, types, tags
- Review and edit suggestions
- Save to catalog

### 5. Claude Skills
Three custom skills in `.claude/skills/`:
- `content-ingest`: Parse URLs, extract metadata, infer tags
- `catalog-manager`: CRUD operations, Sanity sync
- `page-builder`: Generate pages from templates

## Project Structure

```
gtm-library-v2/
├── .claude/skills/           # Custom Claude Skills
├── app/                      # Next.js App Router
│   ├── (library)/           # Library routes
│   │   ├── page.tsx         # Home
│   │   ├── [board]/page.tsx # Board view
│   │   └── asset/[slug]/    # Resource detail
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # Base components
│   ├── library/             # LibraryCard, Sidebar, etc.
│   └── admin/               # Content management UI
├── lib/
│   ├── sanity/              # Sanity client
│   ├── catalog/             # Schema, transforms
│   └── search/              # Pinecone, Fuse.js
├── sanity/schemas/          # CMS schemas
├── styles/design-system.css # Unified CSS
└── scripts/                 # Migration, import
```

## Initial Tasks

Please help me:

1. **Initialize the project**
   - Create Next.js app with TypeScript and Tailwind
   - Set up the folder structure
   - Configure Tailwind with custom colors

2. **Create the design system**
   - CSS variables for hub colors
   - Base typography and spacing
   - Card component styles

3. **Build core components**
   - `LibraryCard` - unified card with hub variants
   - `LibrarySidebar` - boards navigation
   - `LibraryHeader` - global header with search
   - `FilterSidebar` - tag filters

4. **Set up routing**
   - Home page (dashboard)
   - Board view pages
   - Resource detail page (adapts to hub)

5. **Create Claude Skills**
   - Set up `.claude/skills/` directory
   - Create SKILL.md files for each skill

## Reference

I have HTML mockups showing the exact designs for:
- Library view with cards and navigation
- Resource detail page (Content hub style)
- Training detail page (Enablement hub style)
- Card design system with all variants

Let's start with project initialization and the design system foundation.

---

## END PROMPT
