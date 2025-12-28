# Library Browse Page - Dock-Style Boards Grid

## Overview

The Library browse page (`/library`) should display boards as a visual grid of button cards (like Dock.us), NOT as horizontal text tabs.

---

## Current State (WRONG)

```
BOARDS
CoE 89 | Content Types 127 | Enablement 143 | Product 85 | Competitive 34 | Sales 156 | CSM 78 | SC 52 | +2 more ▼

FILES
[Card] [Card] [Card] [Card]
```

---

## Target State (Dock-style)

```
Browse Library
Explore all resources across 10 boards with 867 total items.

BOARDS
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│    🏆    │ │    📚    │ │    🎓    │ │    📦    │ │    ⚔️    │
│   CoE    │ │ Content  │ │Enablement│ │ Product  │ │Competitiv│
│    89    │ │   127    │ │   143    │ │    85    │ │    34    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│    💼    │ │    🎯    │ │    🔧    │ │    🎬    │ │    📈    │
│  Sales   │ │   CSM    │ │    SC    │ │   Demo   │ │  Proof   │
│   156    │ │    78    │ │    52    │ │    45    │ │    67    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘

FILES                                        [Recently modified ▼] [⊞] [≡]
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  Card   │ │  Card   │ │  Card   │ │  Card   │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

---

## Board Configuration Data

```typescript
const boards = [
    { id: 'coe', name: 'CoE', icon: '🏆', color: '#F59E0B', bg: '#FEF3C7', count: 89 },
    { id: 'content', name: 'Content Types', icon: '📚', color: '#8C69F0', bg: '#EDE9FE', count: 127 },
    { id: 'enablement', name: 'Enablement', icon: '🎓', color: '#10B981', bg: '#D1FAE5', count: 143 },
    { id: 'product', name: 'Product', icon: '📦', color: '#3B82F6', bg: '#DBEAFE', count: 85 },
    { id: 'competitive', name: 'Competitive', icon: '⚔️', color: '#EF4444', bg: '#FEE2E2', count: 34 },
    { id: 'sales', name: 'Sales', icon: '💼', color: '#0EA5E9', bg: '#E0F2FE', count: 156 },
    { id: 'csm', name: 'CSM', icon: '🎯', color: '#8B5CF6', bg: '#EDE9FE', count: 78 },
    { id: 'sc', name: 'SC', icon: '🔧', color: '#EC4899', bg: '#FCE7F3', count: 52 },
    { id: 'demo', name: 'Demo', icon: '🎬', color: '#06B6D4', bg: '#CFFAFE', count: 45 },
    { id: 'proof', name: 'Proof Points', icon: '📈', color: '#84CC16', bg: '#ECFCCB', count: 67 }
];
```

---

## HTML Structure

```html
<div class="content-area">
    <!-- Page Header -->
    <div class="page-header">
        <h1 class="page-title">Browse Library</h1>
        <p class="page-subtitle">Explore all resources across 10 boards with 867 total items.</p>
    </div>
    
    <!-- Boards Section -->
    <section class="boards-section">
        <h3 class="section-label">BOARDS</h3>
        <div class="boards-grid">
            <a href="/coe" class="board-button" data-board="coe">
                <span class="board-icon">🏆</span>
                <div class="board-name">CoE</div>
                <div class="board-count">89 items</div>
            </a>
            <a href="/content" class="board-button" data-board="content">
                <span class="board-icon">📚</span>
                <div class="board-name">Content Types</div>
                <div class="board-count">127 items</div>
            </a>
            <a href="/enablement" class="board-button" data-board="enablement">
                <span class="board-icon">🎓</span>
                <div class="board-name">Enablement</div>
                <div class="board-count">143 items</div>
            </a>
            <a href="/product" class="board-button" data-board="product">
                <span class="board-icon">📦</span>
                <div class="board-name">Product</div>
                <div class="board-count">85 items</div>
            </a>
            <a href="/competitive" class="board-button" data-board="competitive">
                <span class="board-icon">⚔️</span>
                <div class="board-name">Competitive</div>
                <div class="board-count">34 items</div>
            </a>
            <a href="/sales" class="board-button" data-board="sales">
                <span class="board-icon">💼</span>
                <div class="board-name">Sales</div>
                <div class="board-count">156 items</div>
            </a>
            <a href="/csm" class="board-button" data-board="csm">
                <span class="board-icon">🎯</span>
                <div class="board-name">CSM</div>
                <div class="board-count">78 items</div>
            </a>
            <a href="/sc" class="board-button" data-board="sc">
                <span class="board-icon">🔧</span>
                <div class="board-name">SC</div>
                <div class="board-count">52 items</div>
            </a>
            <a href="/demo" class="board-button" data-board="demo">
                <span class="board-icon">🎬</span>
                <div class="board-name">Demo</div>
                <div class="board-count">45 items</div>
            </a>
            <a href="/proof" class="board-button" data-board="proof">
                <span class="board-icon">📈</span>
                <div class="board-name">Proof Points</div>
                <div class="board-count">67 items</div>
            </a>
        </div>
    </section>
    
    <!-- Files Section -->
    <section class="files-section">
        <div class="files-header">
            <h3 class="section-label">FILES</h3>
            <div class="files-controls">
                <select class="sort-select">
                    <option>Recently modified</option>
                    <option>Most viewed</option>
                    <option>Alphabetical</option>
                </select>
                <button class="view-toggle view-toggle--grid" title="Grid view">
                    <svg>...</svg>
                </button>
                <button class="view-toggle" title="List view">
                    <svg>...</svg>
                </button>
            </div>
        </div>
        <div class="card-grid">
            <!-- Library cards here -->
        </div>
    </section>
</div>
```

---

## CSS (Complete)

```css
/* Page Header */
.page-header {
    margin-bottom: 32px;
}

.page-title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
}

.page-subtitle {
    font-size: 14px;
    color: #6B7280;
}

/* Section Labels */
.section-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #9CA3AF;
    margin-bottom: 16px;
}

/* Boards Section */
.boards-section {
    margin-bottom: 40px;
}

.boards-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
}

.board-button {
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 20px 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
}

.board-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.08);
}

/* Board-specific backgrounds */
.board-button[data-board="coe"] { background: #FEF3C7; }
.board-button[data-board="coe"]:hover { border-color: #F59E0B; }

.board-button[data-board="content"] { background: #EDE9FE; }
.board-button[data-board="content"]:hover { border-color: #8C69F0; }

.board-button[data-board="enablement"] { background: #D1FAE5; }
.board-button[data-board="enablement"]:hover { border-color: #10B981; }

.board-button[data-board="product"] { background: #DBEAFE; }
.board-button[data-board="product"]:hover { border-color: #3B82F6; }

.board-button[data-board="competitive"] { background: #FEE2E2; }
.board-button[data-board="competitive"]:hover { border-color: #EF4444; }

.board-button[data-board="sales"] { background: #E0F2FE; }
.board-button[data-board="sales"]:hover { border-color: #0EA5E9; }

.board-button[data-board="csm"] { background: #EDE9FE; }
.board-button[data-board="csm"]:hover { border-color: #8B5CF6; }

.board-button[data-board="sc"] { background: #FCE7F3; }
.board-button[data-board="sc"]:hover { border-color: #EC4899; }

.board-button[data-board="demo"] { background: #CFFAFE; }
.board-button[data-board="demo"]:hover { border-color: #06B6D4; }

.board-button[data-board="proof"] { background: #ECFCCB; }
.board-button[data-board="proof"]:hover { border-color: #84CC16; }

.board-icon {
    font-size: 28px;
    margin-bottom: 8px;
    display: block;
}

.board-name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
}

.board-count {
    font-size: 12px;
    color: #9CA3AF;
}

/* Files Section */
.files-section {
    /* Uses existing styles */
}

.files-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.files-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

.view-toggle {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    cursor: pointer;
    color: #6B7280;
}

.view-toggle:hover {
    background: #F3F4F6;
    color: #111827;
}

.view-toggle--active {
    background: #F3F4F6;
    color: #8C69F0;
    border-color: #8C69F0;
}

/* Responsive */
@media (max-width: 1200px) {
    .boards-grid { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 900px) {
    .boards-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 600px) {
    .boards-grid { grid-template-columns: repeat(2, 1fr); }
}
```

---

## React Component

```tsx
// components/library/BoardsGrid.tsx

interface Board {
    id: string;
    name: string;
    icon: string;
    color: string;
    bg: string;
    count: number;
}

interface BoardsGridProps {
    boards: Board[];
}

export function BoardsGrid({ boards }: BoardsGridProps) {
    return (
        <section className="boards-section">
            <h3 className="section-label">BOARDS</h3>
            <div className="boards-grid">
                {boards.map(board => (
                    <Link 
                        key={board.id}
                        href={`/${board.id}`}
                        className="board-button"
                        data-board={board.id}
                        style={{ 
                            '--board-bg': board.bg,
                            '--board-color': board.color 
                        } as React.CSSProperties}
                    >
                        <span className="board-icon">{board.icon}</span>
                        <div className="board-name">{board.name}</div>
                        <div className="board-count">{board.count} items</div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
```

---

## Library Browse Page Component

```tsx
// app/(library)/library/page.tsx

import { BoardsGrid } from '@/components/library/BoardsGrid';
import { LibraryCard } from '@/components/library/LibraryCard';
import { getCatalog, getBoards } from '@/lib/catalog';

export default async function LibraryPage() {
    const boards = await getBoards();
    const recentItems = await getCatalog({ limit: 12, sort: 'updated_at' });
    const totalCount = boards.reduce((sum, b) => sum + b.count, 0);
    
    return (
        <div className="content-area">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Browse Library</h1>
                <p className="page-subtitle">
                    Explore all resources across {boards.length} boards with {totalCount} total items.
                </p>
            </div>
            
            {/* Boards Grid */}
            <BoardsGrid boards={boards} />
            
            {/* Files Section */}
            <section className="files-section">
                <div className="files-header">
                    <h3 className="section-label">FILES</h3>
                    <div className="files-controls">
                        <SortSelect />
                        <ViewToggle />
                    </div>
                </div>
                <div className="card-grid">
                    {recentItems.map(item => (
                        <LibraryCard key={item.id} {...item} />
                    ))}
                </div>
            </section>
        </div>
    );
}
```

---

## Key Points

1. **Remove** the horizontal text tabs for boards
2. **Add** Dock-style button grid (5 columns)
3. Each button has:
   - Light colored background based on board color
   - Large emoji icon (28px)
   - Board name (14px semibold)
   - Item count (12px muted)
4. Hover effect: lift + shadow + colored border
5. Responsive: 5 → 4 → 3 → 2 columns
6. Keep "FILES" section below boards grid with card grid
