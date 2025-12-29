# Board & Tag Management v2 - Implementation Plan

## Overview

Enhanced admin interfaces for managing boards and tags with drag-drop reordering, bulk asset updates, and improved UX.

---

## 1. Edit Board Modal - Enhancements

### Current State (Screenshot)
- Board Name input
- Description textarea
- Icon picker (emoji grid)
- Color picker (8 colors)
- Board Tags with add/remove
- Preview card
- Delete Board option

### Enhancements

#### A. Drag-and-Drop Tag Reordering with Display Names
```
┌─────────────────────────────────────────────────────────────┐
│ Board Tags (Tags that appear as sections on this board)     │
├─────────────────────────────────────────────────────────────┤
│  6 tags                                    ⋮⋮ Drag to reorder│
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⋮⋮  battlecard  → Battlecards       12 assets  ✏️ × │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⋮⋮  demo        → Demos              8 assets  ✏️ × │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⋮⋮  tool        → Tools             24 assets  ✏️ × │   │
│  │  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │   │
│  │     Display as: [Tools____________]                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────┐ ┌───────────────────────┐    │
│  │ + Add new tag...         │ │ Add existing ▾        │    │
│  └──────────────────────────┘ └───────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Drag handle (⋮⋮) on left side of each tag
- **Display name badge** shows "→ DisplayName" when custom name is set
- **Edit button (✏️)** expands inline input for display name
- Asset count shown for context
- Remove button (×) on right
- Visual feedback during drag (opacity, shadow)
- Drop indicator between items

**Display Name Behavior:**
- Optional per-board override for tag name
- When set: Shows as section header on board view
- When empty: Uses original tag name
- Common use cases:
  - Pluralization: `tool` → `Tools`
  - Clarity: `slides` → `Slide Decks`
  - Branding: `demo` → `Product Demos`

#### B. Default View Toggle
```
Default View:
┌────────────────────────────────┐
│  ▢▢  Grid  │  ≡  Stack        │
│   [active] │                  │
└────────────────────────────────┘
```

- **Grid:** Card layout (default for most boards)
- **Stack:** List layout (default for Proof Points)

#### C. Bulk Actions in Board Editor
```
┌─────────────────────────────────────────────────┐
│ 🏷️ Bulk Tag Actions                             │
│                                                 │
│ Apply changes to all assets matching this       │
│ board's tags                                    │
│                                                 │
│ [Add Tag to All] [Remove Tag] [View Assets →]   │
└─────────────────────────────────────────────────┘
```

---

## 2. Edit Tag Modal - Enhancements

### Current State (Screenshot)
- Tag Name input
- Category (optional)
- Assigned Boards with add/remove
- Stats: Boards count, Assets count
- Delete Tag option

### Enhancements

#### A. Improved Assigned Boards
```
Assigned Boards (Boards where this tag appears as a section)

┌────────────────────────────────────────────┐
│ 💰 Sales                              ×    │
├────────────────────────────────────────────┤
│ 🤝 Post-Sales                         ×    │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Search boards to add...                    │
└────────────────────────────────────────────┘
```

#### B. Bulk Actions Panel
```
┌─────────────────────────────────────────────────┐
│ 🏷️ Bulk Update Assets           [14 assets]    │
│                                                 │
│ Apply changes to all 14 assets with this tag   │
│                                                 │
│ [Add Another Tag] [Move to Board] [View Assets →]│
└─────────────────────────────────────────────────┘
```

**Actions:**
- **Add Another Tag:** Opens tag picker modal, adds selected tags to all assets with this tag
- **Move to Board:** Opens board picker, updates board assignment
- **View Assets →:** Navigates to Asset Management filtered by this tag

---

## 3. Asset Management - Bulk Selection

### Selection UI
```
┌──────────────────────────────────────────────────────────────────┐
│ ☑ 8 selected          [Bulk Actions ▾]              25 of 413   │
├──────────────────────────────────────────────────────────────────┤
│ ☐  Title              Hub         Type          Tags            │
├──────────────────────────────────────────────────────────────────┤
│ ☑  Ada Battlecard     Content     battlecard    ada, competitive │
│ ☑  Zendesk Battlecard Content     battlecard    zendesk, comp... │
│ ☑  Intercom Fin...    Content     battlecard    intercom, comp.. │
│ ☐  First Meeting...   Content     template      deck, sales      │
└──────────────────────────────────────────────────────────────────┘
```

### Bulk Actions Dropdown
```
┌─────────────────────────┐
│ 🏷️ Add tags...         │
│ 🏷️ Remove tags...      │
├─────────────────────────┤
│ 📁 Move to board...     │
│ 📤 Export selected      │
├─────────────────────────┤
│ 🗑️ Delete selected     │
└─────────────────────────┘
```

---

## 4. Bulk Tag Modal

### Add Tags Mode
```
┌────────────────────────────────────────────────────┐
│ Bulk Add Tags                                    × │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────┐  ┌──────────────┐               │
│  │   ➕         │  │   ➖         │               │
│  │ Add Tags    │  │ Remove Tags │               │
│  │  [active]   │  │             │               │
│  └──────────────┘  └──────────────┘               │
│                                                    │
│  Select tags to add to 8 assets:                   │
│                                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │ ☑ competitive│ │ ☑ Q4-2024   │ │ ☐ sales     │  │
│  └─────────────┘ └─────────────┘ └─────────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │ ☐ enterprise │ │ ☐ sidekick  │ │ ☐ hero      │  │
│  └─────────────┘ └─────────────┘ └─────────────┘  │
│                                                    │
│  ┌────────────────────────────────────────────┐   │
│  │ Will add 2 tags to 8 assets:               │   │
│  │ [competitive] [Q4-2024]                    │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
├────────────────────────────────────────────────────┤
│                    [Cancel] [Apply to 8 Assets]    │
└────────────────────────────────────────────────────┘
```

---

## 5. Data Model Changes

### boards table
```sql
ALTER TABLE boards 
ADD COLUMN description TEXT,
ADD COLUMN default_view TEXT DEFAULT 'grid' 
  CHECK (default_view IN ('grid', 'stack'));

COMMENT ON COLUMN boards.default_view IS 
'Default view mode when viewing this board (grid=cards, stack=list)';
```

### board_tags table (new or modified)
```sql
CREATE TABLE IF NOT EXISTS board_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  display_name TEXT,  -- Optional override for tag name on this board
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(board_id, tag_id)
);

CREATE INDEX idx_board_tags_order ON board_tags(board_id, sort_order);

COMMENT ON COLUMN board_tags.display_name IS 
'Optional display name override for this tag on this board (e.g., "tool" → "Tools")';
```

### tags table
```sql
ALTER TABLE tags 
ADD COLUMN category TEXT;

COMMENT ON COLUMN tags.category IS 
'Optional grouping category (e.g., Product, Industry, Use Case)';
```

### Display Name Logic
```typescript
// When rendering tags on a board, use display_name if set, otherwise tag.name
function getTagDisplayName(boardTag: BoardTag, tag: Tag): string {
  return boardTag.display_name || tag.name;
}
```

---

## 6. API Endpoints

### Board Tag Reordering
```typescript
// POST /api/boards/:boardId/tags/reorder
interface ReorderTagsRequest {
  tagIds: string[]; // Ordered list of tag IDs
}

// Implementation
async function reorderBoardTags(boardId: string, tagIds: string[]) {
  const updates = tagIds.map((tagId, index) => ({
    board_id: boardId,
    tag_id: tagId,
    sort_order: index
  }));
  
  await supabase
    .from('board_tags')
    .upsert(updates, { onConflict: 'board_id,tag_id' });
}
```

### Bulk Tag Operations
```typescript
// POST /api/assets/bulk-tags
interface BulkTagsRequest {
  assetIds: string[];
  action: 'add' | 'remove';
  tagIds: string[];
}

// Implementation
async function bulkUpdateTags(req: BulkTagsRequest) {
  const { assetIds, action, tagIds } = req;
  
  for (const assetId of assetIds) {
    const { data: asset } = await supabase
      .from('catalog')
      .select('tags')
      .eq('id', assetId)
      .single();
    
    let updatedTags = asset.tags || [];
    
    if (action === 'add') {
      updatedTags = [...new Set([...updatedTags, ...tagIds])];
    } else {
      updatedTags = updatedTags.filter(t => !tagIds.includes(t));
    }
    
    await supabase
      .from('catalog')
      .update({ tags: updatedTags })
      .eq('id', assetId);
  }
}
```

### Bulk Board Move
```typescript
// POST /api/assets/bulk-move
interface BulkMoveRequest {
  assetIds: string[];
  boardId: string;
}
```

---

## 7. React Components

### DraggableTags Component
```tsx
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

function DraggableTags({ tags, onReorder, onRemove }) {
  const [activeId, setActiveId] = useState(null);
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = tags.findIndex(t => t.id === active.id);
      const newIndex = tags.findIndex(t => t.id === over.id);
      onReorder(arrayMove(tags, oldIndex, newIndex));
    }
  };
  
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tags} strategy={verticalListSortingStrategy}>
        {tags.map(tag => (
          <SortableTag key={tag.id} tag={tag} onRemove={onRemove} />
        ))}
      </SortableContext>
    </DndContext>
  );
}

function SortableTag({ tag, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tag.id });
  
  return (
    <div 
      ref={setNodeRef} 
      className={`draggable-tag ${isDragging ? 'dragging' : ''}`}
      style={{ transform, transition }}
    >
      <div className="drag-handle" {...attributes} {...listeners}>⋮⋮</div>
      <span className="tag-name">{tag.name}</span>
      <span className="tag-asset-count">{tag.assetCount} assets</span>
      <button className="tag-remove" onClick={() => onRemove(tag.id)}>×</button>
    </div>
  );
}
```

### BulkSelectionProvider
```tsx
const BulkSelectionContext = createContext();

export function BulkSelectionProvider({ children }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  const select = (id) => setSelectedIds(prev => new Set([...prev, id]));
  const deselect = (id) => setSelectedIds(prev => {
    const next = new Set(prev);
    next.delete(id);
    return next;
  });
  const toggle = (id) => selectedIds.has(id) ? deselect(id) : select(id);
  const selectAll = (ids) => setSelectedIds(new Set(ids));
  const clearSelection = () => setSelectedIds(new Set());
  
  return (
    <BulkSelectionContext.Provider value={{
      selectedIds,
      selectedCount: selectedIds.size,
      isSelected: (id) => selectedIds.has(id),
      select, deselect, toggle, selectAll, clearSelection
    }}>
      {children}
    </BulkSelectionContext.Provider>
  );
}
```

---

## 8. User Flows

### Flow 1: Reorder Tags in Board
1. Open Edit Board modal
2. Hover over tag row → See drag handle
3. Click and drag tag to new position
4. Drop in desired position
5. Save Changes → API call to reorder

### Flow 2: Bulk Tag Assets from Tag Editor
1. Open Edit Tag modal for "competitive"
2. See "14 assets" with this tag
3. Click "Add Another Tag"
4. Select "Q4-2024" from tag picker
5. Confirm → All 14 assets now have both tags

### Flow 3: Bulk Tag from Asset Management
1. In asset table, select multiple checkboxes
2. Click "Bulk Actions" → "Add tags..."
3. Select tags from picker
4. Click "Apply to X Assets"
5. All selected assets updated

### Flow 4: Set Board Default View
1. Open Edit Board for "Proof Points"
2. Click "Stack" in Default View toggle
3. Save Changes
4. When users visit Proof Points board, it shows list view by default

---

## 9. Files Delivered

| File | Description |
|------|-------------|
| `admin-board-tag-management-v2.html` | Full mockup with all 4 modal/UI states |
| `BOARD_TAG_MANAGEMENT_PLAN.md` | This implementation plan |

---

## 10. Implementation Priority

| Priority | Feature | Effort |
|----------|---------|--------|
| 1 | Drag-drop tag reordering | Medium |
| 2 | Default view toggle | Low |
| 3 | Bulk selection in asset table | Medium |
| 4 | Bulk add/remove tags modal | Medium |
| 5 | Bulk actions in tag editor | Low |
| 6 | Bulk actions in board editor | Low |

**Estimated Total Effort:** 2-3 days of development
