'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Available colors for boards
const BOARD_COLORS = [
  { name: 'Amber', color: '#F59E0B', light: '#FEF3C7', accent: '#B45309' },
  { name: 'Purple', color: '#8C69F0', light: '#EDE9FE', accent: '#6D28D9' },
  { name: 'Emerald', color: '#10B981', light: '#D1FAE5', accent: '#047857' },
  { name: 'Blue', color: '#3B82F6', light: '#DBEAFE', accent: '#1D4ED8' },
  { name: 'Red', color: '#EF4444', light: '#FEE2E2', accent: '#B91C1C' },
  { name: 'Sky', color: '#0EA5E9', light: '#E0F2FE', accent: '#0369A1' },
  { name: 'Pink', color: '#EC4899', light: '#FCE7F3', accent: '#BE185D' },
  { name: 'Indigo', color: '#6366F1', light: '#E0E7FF', accent: '#4338CA' },
];

interface BoardTag {
  id: string;
  name: string;
  slug: string;
  displayName?: string | null;
  sortOrder?: number;
  assetCount?: number;
}

interface Board {
  id: string;
  slug: string;
  name: string;
  color: string;
  lightColor: string;
  accentColor: string;
  icon: string;
  description: string;
  defaultView: 'grid' | 'stack';
  showRecentlyAdded: boolean;
  assetCount: number;
  tags: BoardTag[];
}

// Sortable Tag Item Component
function SortableTagItem({
  tag,
  onRemove,
  onEditDisplayName,
  isExpanded,
  onToggleExpand,
  accentColor,
}: {
  tag: BoardTag;
  onRemove: (tagId: string) => void;
  onEditDisplayName: (tagId: string, displayName: string) => void;
  isExpanded: boolean;
  onToggleExpand: (tagId: string) => void;
  accentColor: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-wrap items-center gap-2 p-3 bg-white border rounded-lg ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex flex-col gap-0.5 cursor-grab text-gray-400 hover:text-gray-600"
        style={{ width: '20px' }}
      >
        <span className="block h-0.5 bg-current rounded" />
        <span className="block h-0.5 bg-current rounded" />
        <span className="block h-0.5 bg-current rounded" />
      </div>

      {/* Main Row */}
      <div className="flex items-center gap-2 flex-1">
        <span className="font-medium text-sm text-gray-900">{tag.name}</span>
        {tag.displayName && tag.displayName !== tag.name && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: '#EDE9FE', color: accentColor }}
          >
            → {tag.displayName}
          </span>
        )}
        {tag.assetCount !== undefined && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {tag.assetCount} assets
          </span>
        )}
      </div>

      {/* Actions */}
      <button
        onClick={() => onToggleExpand(tag.id)}
        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:bg-purple-100 hover:text-purple-600 rounded"
        title="Edit display name"
      >
        ✏️
      </button>
      <button
        onClick={() => onRemove(tag.id)}
        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-600 rounded"
        title="Remove from board"
      >
        ×
      </button>

      {/* Expanded Display Name Row */}
      {isExpanded && (
        <div className="w-full flex items-center gap-2 mt-2 pt-2 border-t border-dashed border-gray-200 ml-7">
          <span className="text-xs text-gray-500 whitespace-nowrap">Display as:</span>
          <input
            type="text"
            value={tag.displayName || ''}
            onChange={(e) => onEditDisplayName(tag.id, e.target.value)}
            placeholder="Same as tag name"
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-purple-500"
          />
        </div>
      )}
    </div>
  );
}

// Sortable Board Card Component
function SortableBoardCard({
  board,
  onEdit,
}: {
  board: Board;
  onEdit: (board: Board) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: board.slug });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: 'var(--card-bg)',
        border: isDragging ? '2px solid #8C69F0' : '1px solid #E5E7EB',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Board Header */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: '16px 20px',
          background: board.lightColor || '#F3F4F6',
        }}
      >
        <div className="flex items-center" style={{ gap: '12px' }}>
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex flex-col gap-0.5 cursor-grab text-gray-400 hover:text-gray-600"
            style={{ marginRight: '4px' }}
          >
            <span className="block h-0.5 w-3 bg-current rounded" />
            <span className="block h-0.5 w-3 bg-current rounded" />
            <span className="block h-0.5 w-3 bg-current rounded" />
          </div>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: board.color,
            }}
          />
          <span style={{ fontSize: '20px' }}>{board.icon || '📁'}</span>
          <span style={{ fontSize: '15px', fontWeight: 600, color: board.accentColor || '#4B5563' }}>
            {board.name}
          </span>
        </div>
        <button
          onClick={() => onEdit(board)}
          style={{
            fontSize: '13px',
            color: '#8C69F0',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
          }}
        >
          Edit
        </button>
      </div>

      {/* Board Body */}
      <div style={{ padding: '16px 20px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
          {board.description || 'No description'}
        </p>

        {/* Tags preview */}
        {board.tags && board.tags.length > 0 && (
          <div className="flex flex-wrap" style={{ gap: '6px', marginBottom: '12px' }}>
            {board.tags.slice(0, 4).map((tag) => (
              <span
                key={tag.id}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '4px',
                  color: 'var(--text-muted)',
                }}
              >
                {tag.displayName || tag.name}
              </span>
            ))}
            {board.tags.length > 4 && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                +{board.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {board.assetCount || 0} assets
            </span>
            {board.defaultView && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>
                {board.defaultView === 'grid' ? '▦ Grid' : '☰ Stack'}
              </span>
            )}
          </div>
          <a
            href={`/library/board/${board.slug}`}
            style={{
              fontSize: '13px',
              color: '#8C69F0',
              textDecoration: 'none',
            }}
          >
            View Board →
          </a>
        </div>
      </div>
    </div>
  );
}

interface EditBoardModalProps {
  board: Board | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (board: Board) => void;
  onDelete: (id: string) => void;
  isNew?: boolean;
  allTags: BoardTag[];
}

function EditBoardModal({ board, isOpen, onClose, onSave, onDelete, isNew, allTags }: EditBoardModalProps) {
  const [formData, setFormData] = useState<Board>(
    board || {
      id: '',
      slug: '',
      name: '',
      color: '#8C69F0',
      lightColor: '#EDE9FE',
      accentColor: '#6D28D9',
      icon: '📋',
      description: '',
      defaultView: 'grid',
      showRecentlyAdded: false,
      assetCount: 0,
      tags: [],
    }
  );
  const [newTagName, setNewTagName] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [expandedTagId, setExpandedTagId] = useState<string | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reset form when board changes
  useEffect(() => {
    if (board) {
      setFormData(board);
    } else {
      setFormData({
        id: '',
        slug: '',
        name: '',
        color: '#8C69F0',
        lightColor: '#EDE9FE',
        accentColor: '#6D28D9',
        icon: '📋',
        description: '',
        defaultView: 'grid',
        showRecentlyAdded: false,
        assetCount: 0,
        tags: [],
      });
    }
    setExpandedTagId(null);
  }, [board]);

  if (!isOpen) return null;

  const handleColorSelect = (colorOption: typeof BOARD_COLORS[0]) => {
    setFormData((prev) => ({
      ...prev,
      color: colorOption.color,
      lightColor: colorOption.light,
      accentColor: colorOption.accent,
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.tags.findIndex((t) => t.id === active.id);
        const newIndex = prev.tags.findIndex((t) => t.id === over.id);
        const newTags = arrayMove(prev.tags, oldIndex, newIndex).map((t, i) => ({
          ...t,
          sortOrder: i,
        }));
        return { ...prev, tags: newTags };
      });
    }
  };

  const handleAddTag = (tag?: BoardTag) => {
    if (tag) {
      // Add existing tag from dropdown
      if (!formData.tags.some(t => t.slug === tag.slug)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, { ...tag, sortOrder: prev.tags.length }],
        }));
      }
      setNewTagName('');
      setShowTagDropdown(false);
    } else if (newTagName.trim() && !formData.tags.some(t => t.name.toLowerCase() === newTagName.trim().toLowerCase())) {
      // Add new tag by name
      const tagSlug = newTagName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, {
          id: `temp-${Date.now()}`,
          name: newTagName.trim(),
          slug: tagSlug,
          sortOrder: prev.tags.length,
        }],
      }));
      setNewTagName('');
      setShowTagDropdown(false);
    }
  };

  // Filter available tags based on search and exclude already selected
  const filteredTags = allTags.filter(
    tag => !formData.tags.some(t => t.slug === tag.slug) &&
    (newTagName === '' || tag.name.toLowerCase().includes(newTagName.toLowerCase()))
  );

  const handleRemoveTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t.id !== tagId),
    }));
    if (expandedTagId === tagId) {
      setExpandedTagId(null);
    }
  };

  const handleEditDisplayName = (tagId: string, displayName: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.map((t) =>
        t.id === tagId ? { ...t, displayName: displayName || null } : t
      ),
    }));
  };

  const handleToggleExpand = (tagId: string) => {
    setExpandedTagId((prev) => (prev === tagId ? null : tagId));
  };

  const handleSave = () => {
    const newBoard = {
      ...formData,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
    };
    onSave(newBoard);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white flex"
        style={{
          borderRadius: '16px',
          width: '900px',
          maxHeight: '90vh',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        }}
      >
        {/* Left: Form */}
        <div className="flex flex-col flex-1" style={{ maxHeight: '90vh' }}>
          {/* Header */}
          <div
            className="flex items-center justify-between"
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
              {isNew ? 'Create New Board' : 'Edit Board'}
            </h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center"
              style={{
                width: '32px',
                height: '32px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            {/* Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Board Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Sales Resources"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this board..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Icon and Color row */}
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '20px', marginBottom: '20px' }}>
              {/* Icon */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Icon
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                  placeholder="📋"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '20px',
                    textAlign: 'center',
                  }}
                />
              </div>

              {/* Color */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Color
                </label>
                <div className="flex flex-wrap" style={{ gap: '8px' }}>
                  {BOARD_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.name}
                      onClick={() => handleColorSelect(colorOption)}
                      className="flex items-center justify-center"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: colorOption.color,
                        border: formData.color === colorOption.color ? '3px solid #111827' : '2px solid transparent',
                        cursor: 'pointer',
                      }}
                      title={colorOption.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Default View */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Default View
              </label>
              <div className="flex" style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', width: 'fit-content' }}>
                <button
                  onClick={() => setFormData((prev) => ({ ...prev, defaultView: 'grid' }))}
                  className="flex items-center gap-2"
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    border: 'none',
                    background: formData.defaultView === 'grid' ? '#8C69F0' : 'white',
                    color: formData.defaultView === 'grid' ? 'white' : '#374151',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Grid
                </button>
                <button
                  onClick={() => setFormData((prev) => ({ ...prev, defaultView: 'stack' }))}
                  className="flex items-center gap-2"
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    border: 'none',
                    borderLeft: '1px solid #E5E7EB',
                    background: formData.defaultView === 'stack' ? '#8C69F0' : 'white',
                    color: formData.defaultView === 'stack' ? 'white' : '#374151',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <circle cx="3" cy="6" r="1" fill="currentColor" />
                    <circle cx="3" cy="12" r="1" fill="currentColor" />
                    <circle cx="3" cy="18" r="1" fill="currentColor" />
                  </svg>
                  Stack
                </button>
              </div>
            </div>

            {/* Show Recently Added Toggle */}
            <div style={{ marginBottom: '20px' }}>
              <label
                className="flex items-center gap-3 cursor-pointer"
                style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px' }}
              >
                <input
                  type="checkbox"
                  checked={formData.showRecentlyAdded}
                  onChange={(e) => setFormData((prev) => ({ ...prev, showRecentlyAdded: e.target.checked }))}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#8C69F0',
                    cursor: 'pointer',
                  }}
                />
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    Show Recently Added Carousel
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Display a carousel of assets added or updated in the last 14 days
                  </p>
                </div>
              </label>
            </div>

            {/* Tags with Drag & Drop */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Board Tags
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '8px' }}>
                  (Tags that appear as sections on this board)
                </span>
              </label>

              <div style={{ background: 'var(--bg-elevated)', borderRadius: '12px', padding: '16px' }}>
                {/* Header */}
                <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {formData.tags.length} tags
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    ⋮⋮ Drag to reorder
                  </span>
                </div>

                {/* Draggable Tags */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={formData.tags.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-1" style={{ minHeight: '60px' }}>
                      {formData.tags.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                          No tags added yet. Add tags below.
                        </div>
                      ) : (
                        formData.tags.map((tag) => (
                          <SortableTagItem
                            key={tag.id}
                            tag={tag}
                            onRemove={handleRemoveTag}
                            onEditDisplayName={handleEditDisplayName}
                            isExpanded={expandedTagId === tag.id}
                            onToggleExpand={handleToggleExpand}
                            accentColor={formData.accentColor}
                          />
                        ))
                      )}
                    </div>
                  </SortableContext>
                </DndContext>

                {/* Add Tag Input */}
                <div style={{ position: 'relative', marginTop: '12px' }}>
                  <div className="flex" style={{ gap: '8px' }}>
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => {
                        setNewTagName(e.target.value);
                        setShowTagDropdown(true);
                      }}
                      onFocus={() => setShowTagDropdown(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        } else if (e.key === 'Escape') {
                          setShowTagDropdown(false);
                        }
                      }}
                      placeholder="+ Add new tag..."
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '13px',
                        background: 'var(--card-bg)',
                      }}
                    />
                    <button
                      onClick={() => handleAddTag()}
                      style={{
                        padding: '10px 16px',
                        background: '#8C69F0',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Add
                    </button>
                  </div>

                  {/* Tag dropdown */}
                  {showTagDropdown && filteredTags.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 64,
                        marginTop: '4px',
                        background: 'var(--card-bg)',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 10,
                      }}
                    >
                      {filteredTags.slice(0, 10).map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleAddTag(tag)}
                          className="flex items-center"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: 'var(--text-primary)',
                            borderBottom: '1px solid #F3F4F6',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#F9FAFB';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Click outside to close dropdown */}
                  {showTagDropdown && (
                    <div
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 5,
                      }}
                      onClick={() => setShowTagDropdown(false)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between"
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #E5E7EB',
              background: 'var(--bg-elevated)',
            }}
          >
            {!isNew && board ? (
              <button
                onClick={() => onDelete(board.id)}
                className="flex items-center"
                style={{
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: '#EF4444',
                  fontSize: '14px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete Board
              </button>
            ) : (
              <div />
            )}
            <div className="flex" style={{ gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  background: 'var(--card-bg)',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '10px 20px',
                  background: '#8C69F0',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {isNew ? 'Create Board' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div
          style={{
            width: '320px',
            background: 'var(--bg-elevated)',
            borderRadius: '0 16px 16px 0',
            padding: '24px',
            borderLeft: '1px solid #E5E7EB',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
            Preview
          </div>

          {/* Board Card Preview */}
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <div
              className="flex items-center gap-3"
              style={{
                padding: '14px 16px',
                background: formData.lightColor,
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  background: 'var(--card-bg)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                }}
              >
                {formData.icon}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: formData.accentColor }}>
                {formData.name || 'Board Name'}
              </span>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <div className="flex flex-wrap" style={{ gap: '6px' }}>
                {formData.tags.length === 0 ? (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Tags will appear here
                  </span>
                ) : (
                  formData.tags.map((tag) => (
                    <span
                      key={tag.id}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--bg-elevated)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {tag.displayName || tag.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Default View Info */}
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: 'var(--card-bg)',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Default View
            </div>
            <div className="flex items-center gap-2" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {formData.defaultView === 'grid' ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Grid View
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                  </svg>
                  Stack View
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BoardsManagePage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [allTags, setAllTags] = useState<BoardTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<{ isOpen: boolean; board: Board | null; isNew: boolean }>({
    isOpen: false,
    board: null,
    isNew: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);

  // Drag and drop sensors for board reordering
  const boardSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch boards and tags from database
  useEffect(() => {
    fetchBoards();
    fetchTags();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await fetch('/api/boards');
      if (res.ok) {
        const data = await res.json();
        // Fetch tags for each board including displayName
        const boardsWithTags = await Promise.all(
          data.map(async (board: Board) => {
            const tagsRes = await fetch(`/api/boards/${board.slug}/tags`);
            if (tagsRes.ok) {
              const tags = await tagsRes.json();
              return { ...board, tags };
            }
            return { ...board, tags: [] };
          })
        );
        setBoards(boardsWithTags);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags');
      if (res.ok) {
        const data = await res.json();
        setAllTags(data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const filteredBoards = boards.filter(
    (board) =>
      board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEditModal = (board: Board) => {
    setEditModal({ isOpen: true, board, isNew: false });
  };

  const openCreateModal = () => {
    setEditModal({ isOpen: true, board: null, isNew: true });
  };

  const closeModal = () => {
    setEditModal({ isOpen: false, board: null, isNew: false });
  };

  const handleSave = async (updatedBoard: Board) => {
    setSaving(true);
    try {
      const originalBoard = editModal.board;
      const boardSlug = editModal.isNew
        ? updatedBoard.slug || updatedBoard.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : originalBoard?.slug || updatedBoard.slug;

      // 1. Save board properties
      const method = editModal.isNew ? 'POST' : 'PUT';
      const url = editModal.isNew ? '/api/boards' : `/api/boards/${boardSlug}`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedBoard.name,
          slug: boardSlug,
          icon: updatedBoard.icon,
          color: updatedBoard.color,
          lightColor: updatedBoard.lightColor,
          accentColor: updatedBoard.accentColor,
          defaultView: updatedBoard.defaultView,
          showRecentlyAdded: updatedBoard.showRecentlyAdded,
        }),
      });

      if (!res.ok) {
        console.error('Failed to save board');
        return;
      }

      // 2. Sync tags using the dedicated tags endpoint
      const originalTags = originalBoard?.tags || [];
      const newTags = updatedBoard.tags;

      // Find tags to remove (in original but not in new)
      const tagsToRemove = originalTags.filter(
        origTag => !newTags.some(newTag => newTag.slug === origTag.slug || newTag.name.toLowerCase() === origTag.name.toLowerCase())
      );

      // Find tags to add (in new but not in original)
      const tagsToAdd = newTags.filter(
        newTag => !originalTags.some(origTag => origTag.slug === newTag.slug || origTag.name.toLowerCase() === newTag.name.toLowerCase())
      );

      // Remove tags
      for (const tag of tagsToRemove) {
        await fetch(`/api/boards/${boardSlug}/tags?tagSlug=${tag.slug}`, {
          method: 'DELETE',
        });
      }

      // Add tags
      for (const tag of tagsToAdd) {
        await fetch(`/api/boards/${boardSlug}/tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagName: tag.name }),
        });
      }

      // 3. Update tag order and display names using reorder endpoint
      if (newTags.length > 0) {
        await fetch(`/api/boards/${boardSlug}/tags/reorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tagOrder: newTags.map((tag, index) => ({
              tagSlug: tag.slug,
              sortOrder: index,
              displayName: tag.displayName || null,
            })),
          }),
        });
      }

      await fetchBoards(); // Refresh the list
      await fetchTags(); // Refresh tags in case new ones were created
      closeModal();
    } catch (error) {
      console.error('Error saving board:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const board = boards.find(b => b.id === id);
    if (!board) return;

    if (!confirm(`Are you sure you want to delete "${board.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/boards/${board.slug}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchBoards();
        closeModal();
      } else {
        console.error('Failed to delete board');
      }
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  // Handle board reordering via drag and drop
  const handleBoardDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = boards.findIndex((b) => b.slug === active.id);
      const newIndex = boards.findIndex((b) => b.slug === over.id);
      const newBoards = arrayMove(boards, oldIndex, newIndex);

      // Optimistically update the UI
      setBoards(newBoards);
      setReordering(true);

      try {
        // Save the new order to the database
        const res = await fetch('/api/boards/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            boardOrder: newBoards.map(b => b.slug),
          }),
        });

        if (!res.ok) {
          console.error('Failed to save board order');
          // Revert on failure
          await fetchBoards();
        }
      } catch (error) {
        console.error('Error saving board order:', error);
        // Revert on failure
        await fetchBoards();
      } finally {
        setReordering(false);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '28px 32px' }}>
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading boards...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Page Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Manage Hubs
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Create and organize hubs to categorize your content library.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center"
          style={{
            gap: '8px',
            padding: '10px 18px',
            background: '#8C69F0',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Board
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <div
          className="flex items-center"
          style={{
            gap: '10px',
            padding: '10px 14px',
            background: 'var(--card-bg)',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            maxWidth: '320px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search boards..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px',
            }}
          />
        </div>
      </div>

      {/* Reordering indicator */}
      {reordering && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#8C69F0',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            zIndex: 50,
          }}
        >
          Saving order...
        </div>
      )}

      {/* Drag hint */}
      {!searchQuery && (
        <div style={{ marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          ⋮⋮ Drag boards to reorder them in the library navigation
        </div>
      )}

      {/* Boards Grid with Drag and Drop */}
      <DndContext
        sensors={boardSensors}
        collisionDetection={closestCenter}
        onDragEnd={handleBoardDragEnd}
      >
        <SortableContext
          items={filteredBoards.map(b => b.slug)}
          strategy={rectSortingStrategy}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {filteredBoards.map((board) => (
              <SortableBoardCard
                key={board.slug}
                board={board}
                onEdit={openEditModal}
              />
            ))}

            {/* Add New Board Card */}
            <button
              onClick={openCreateModal}
              className="flex flex-col items-center justify-center"
              style={{
                minHeight: '180px',
                background: 'var(--bg-elevated)',
                border: '2px dashed #E5E7EB',
                borderRadius: '12px',
                cursor: 'pointer',
                gap: '12px',
              }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>
                Create New Board
              </span>
            </button>
          </div>
        </SortableContext>
      </DndContext>

      {/* Edit Modal */}
      <EditBoardModal
        board={editModal.board}
        isOpen={editModal.isOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={handleDelete}
        isNew={editModal.isNew}
        allTags={allTags}
      />
    </div>
  );
}
