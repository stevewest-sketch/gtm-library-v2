'use client';

import { useState } from 'react';

// Board configuration with colors
const BOARDS = [
  { id: 'coe', name: 'CoE', color: '#F59E0B', light: '#FEF3C7', accent: '#B45309', icon: '🎯' },
  { id: 'content', name: 'Content Types', color: '#8C69F0', light: '#EDE9FE', accent: '#6D28D9', icon: '📄' },
  { id: 'enablement', name: 'Enablement', color: '#10B981', light: '#D1FAE5', accent: '#047857', icon: '📚' },
  { id: 'product', name: 'Product', color: '#3B82F6', light: '#DBEAFE', accent: '#1D4ED8', icon: '📦' },
  { id: 'competitive', name: 'Competitive', color: '#EF4444', light: '#FEE2E2', accent: '#B91C1C', icon: '⚔️' },
  { id: 'sales', name: 'Sales', color: '#0EA5E9', light: '#E0F2FE', accent: '#0369A1', icon: '💼' },
];

// Mock board tags data
const INITIAL_BOARD_TAGS: Record<string, string[]> = {
  coe: ['BVA', 'EBR', 'QBR', 'Meeting Examples', 'Best Practices', 'Templates', 'Process'],
  content: ['Decks', 'One-pagers', 'Case Studies', 'Videos', 'Battlecards'],
  enablement: ['Training', 'Certifications', 'Onboarding', 'Learning Paths', 'Workshops'],
  product: ['Release Notes', 'Roadmap', 'Feature Briefs', 'Technical Docs', 'API'],
  competitive: ['Battlecards', 'Win/Loss', 'Competitor Analysis', 'Pricing'],
  sales: ['Proposals', 'Discovery', 'Objection Handling', 'Pricing', 'Negotiation'],
};

// Suggested tags
const SUGGESTED_TAGS = [
  'Products',
  'Legal',
  'Customer Assets',
  'Partnerships',
  'Integrations',
  'Solutions',
  'Use Cases',
  'Personas',
];

interface EditModalProps {
  tag: string;
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string, selectedBoards: string[]) => void;
  onDelete: () => void;
}

function EditTagModal({ tag, boardId, isOpen, onClose, onSave, onDelete }: EditModalProps) {
  const [tagName, setTagName] = useState(tag);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoards, setSelectedBoards] = useState<Set<string>>(new Set([boardId]));

  if (!isOpen) return null;

  const filteredBoards = BOARDS.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleBoard = (id: string) => {
    const newSet = new Set(selectedBoards);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedBoards(newSet);
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
        className="bg-white flex flex-col"
        style={{
          borderRadius: '16px',
          width: '800px',
          maxHeight: '90vh',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Edit Tag</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              background: 'transparent',
              color: '#9CA3AF',
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr 220px',
            gap: '24px',
            padding: '24px',
            overflowY: 'auto',
          }}
        >
          {/* Details Section */}
          <div className="flex flex-col">
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563', marginBottom: '12px' }}>
              Details
            </div>
            <label style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px', display: 'block' }}>
              Name
            </label>
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Boards Section */}
          <div className="flex flex-col">
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563', marginBottom: '12px' }}>
              Organisation Boards
            </div>
            <div
              className="flex items-center"
              style={{
                gap: '10px',
                padding: '10px 14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {filteredBoards.map((board) => (
                <label
                  key={board.id}
                  className="flex items-center cursor-pointer"
                  style={{
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: '1px solid #F3F4F6',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedBoards.has(board.id)}
                    onChange={() => toggleBoard(board.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#8C69F0',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '16px' }}>{board.icon}</span>
                  <span style={{ flex: 1, fontSize: '14px', color: '#111827' }}>{board.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Selected Boards Section */}
          <div className="flex flex-col">
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563', marginBottom: '12px' }}>
              Selected Boards
            </div>
            <div
              style={{
                background: '#F9FAFB',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563', marginBottom: '12px' }}>
                Selected Boards ({selectedBoards.size})
              </div>
              <div className="flex flex-col" style={{ gap: '8px' }}>
                {Array.from(selectedBoards).map((boardId) => {
                  const board = BOARDS.find((b) => b.id === boardId);
                  if (!board) return null;
                  return (
                    <div
                      key={boardId}
                      className="flex items-center justify-between"
                      style={{
                        padding: '10px 12px',
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                    >
                      <div className="flex items-center" style={{ gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>{board.icon}</span>
                        {board.name}
                      </div>
                      <button
                        onClick={() => toggleBoard(boardId)}
                        className="flex items-center justify-center"
                        style={{
                          width: '20px',
                          height: '20px',
                          color: '#9CA3AF',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          border: 'none',
                          background: 'transparent',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
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
            background: '#F9FAFB',
          }}
        >
          <button
            onClick={onDelete}
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
            Delete
          </button>
          <div className="flex" style={{ gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(tagName, Array.from(selectedBoards))}
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
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TagsManagePage() {
  const [activeTab, setActiveTab] = useState<'boards' | 'tags'>('boards');
  const [boardTags, setBoardTags] = useState(INITIAL_BOARD_TAGS);
  const [selectedSuggested, setSelectedSuggested] = useState<Set<string>>(
    new Set(['Integrations', 'Solutions', 'Use Cases', 'Personas'])
  );
  const [newTagInputs, setNewTagInputs] = useState<Record<string, string>>({});
  const [editModal, setEditModal] = useState<{ isOpen: boolean; tag: string; boardId: string } | null>(null);

  const handleAddNewTag = (boardId: string) => {
    const newTag = newTagInputs[boardId]?.trim();
    if (newTag && !boardTags[boardId]?.includes(newTag)) {
      setBoardTags((prev) => ({
        ...prev,
        [boardId]: [...(prev[boardId] || []), newTag],
      }));
      setNewTagInputs((prev) => ({ ...prev, [boardId]: '' }));
    }
  };

  const handleRemoveTag = (boardId: string, tag: string) => {
    setBoardTags((prev) => ({
      ...prev,
      [boardId]: prev[boardId]?.filter((t) => t !== tag) || [],
    }));
  };

  const handleToggleSuggested = (tag: string) => {
    const newSet = new Set(selectedSuggested);
    if (newSet.has(tag)) {
      newSet.delete(tag);
    } else {
      newSet.add(tag);
    }
    setSelectedSuggested(newSet);
  };

  const handleAddSuggestedToBoard = (tag: string, boardId: string) => {
    if (!boardTags[boardId]?.includes(tag)) {
      setBoardTags((prev) => ({
        ...prev,
        [boardId]: [...(prev[boardId] || []), tag],
      }));
    }
  };

  const openEditModal = (tag: string, boardId: string) => {
    setEditModal({ isOpen: true, tag, boardId });
  };

  const closeEditModal = () => {
    setEditModal(null);
  };

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
          Manage Library
        </h1>
        <p style={{ fontSize: '14px', color: '#4B5563' }}>
          Configure boards and tags for organizing your content.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex"
        style={{
          gap: '4px',
          marginBottom: '28px',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <button
          onClick={() => setActiveTab('boards')}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 500,
            color: activeTab === 'boards' ? '#8C69F0' : '#4B5563',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'boards' ? '2px solid #8C69F0' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          Boards
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 500,
            color: activeTab === 'tags' ? '#8C69F0' : '#4B5563',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'tags' ? '2px solid #8C69F0' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          Tags
        </button>
      </div>

      {/* Tag Manager Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '28px',
        }}
      >
        {/* Suggested Tags Panel */}
        <div
          style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '20px',
            height: 'fit-content',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#9CA3AF',
              marginBottom: '8px',
            }}
          >
            Suggested Tags
          </div>
          <div style={{ fontSize: '13px', color: '#4B5563', marginBottom: '20px', lineHeight: 1.5 }}>
            Tags that can be added to boards as subgroups.
          </div>

          <div className="flex flex-col">
            {SUGGESTED_TAGS.map((tag) => (
              <div
                key={tag}
                className="flex items-center"
                style={{
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: '1px solid #F3F4F6',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedSuggested.has(tag)}
                  onChange={() => handleToggleSuggested(tag)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#8C69F0',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ flex: 1, fontSize: '14px', color: '#111827' }}>{tag}</span>
                <button
                  onClick={() => {
                    // Show a simple dropdown or add to first board
                    handleAddSuggestedToBoard(tag, 'coe');
                  }}
                  className="flex items-center justify-center"
                  style={{
                    width: '28px',
                    height: '28px',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Active Boards */}
        <div className="flex flex-col" style={{ gap: '16px' }}>
          <div className="flex items-center justify-between">
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#9CA3AF',
              }}
            >
              Active Boards and Tags
            </div>
          </div>

          {BOARDS.map((board) => (
            <div
              key={board.id}
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {/* Board Header */}
              <div
                className="flex items-center justify-between"
                style={{
                  padding: '14px 20px',
                  background: board.light,
                }}
              >
                <div className="flex items-center" style={{ gap: '10px', fontSize: '14px', fontWeight: 600, color: board.accent }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: board.color,
                    }}
                  />
                  {board.name}
                </div>
                <button
                  onClick={() => {
                    const firstTag = boardTags[board.id]?.[0];
                    if (firstTag) {
                      openEditModal(firstTag, board.id);
                    }
                  }}
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

              {/* Board Tags */}
              <div style={{ padding: '16px 20px' }}>
                {boardTags[board.id]?.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center justify-between group"
                    style={{
                      padding: '10px 0',
                      fontSize: '14px',
                      color: '#4B5563',
                      borderBottom: '1px solid #F3F4F6',
                    }}
                  >
                    <span
                      onClick={() => openEditModal(tag, board.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {tag}
                    </span>
                    <button
                      onClick={() => handleRemoveTag(board.id, tag)}
                      className="opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      style={{
                        width: '24px',
                        height: '24px',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        border: 'none',
                        background: 'transparent',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Tag Actions */}
              <div
                className="flex"
                style={{
                  gap: '8px',
                  padding: '12px 20px',
                  borderTop: '1px solid #F3F4F6',
                }}
              >
                <input
                  type="text"
                  value={newTagInputs[board.id] || ''}
                  onChange={(e) => setNewTagInputs((prev) => ({ ...prev, [board.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddNewTag(board.id);
                    }
                  }}
                  placeholder="+ Add new tag"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <button
                  className="flex items-center"
                  style={{
                    gap: '6px',
                    padding: '10px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    background: 'white',
                    fontSize: '13px',
                    color: '#4B5563',
                    cursor: 'pointer',
                  }}
                >
                  Add existing
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <EditTagModal
          tag={editModal.tag}
          boardId={editModal.boardId}
          isOpen={editModal.isOpen}
          onClose={closeEditModal}
          onSave={(newName, selectedBoards) => {
            // Update tag name and board assignments
            // For now, just close the modal
            closeEditModal();
          }}
          onDelete={() => {
            handleRemoveTag(editModal.boardId, editModal.tag);
            closeEditModal();
          }}
        />
      )}
    </div>
  );
}
