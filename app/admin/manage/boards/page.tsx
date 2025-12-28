'use client';

import { useState } from 'react';

// Board configuration with colors
const INITIAL_BOARDS = [
  { id: 'coe', name: 'CoE', color: '#F59E0B', light: '#FEF3C7', accent: '#B45309', icon: '🎯', description: 'Customer facing excellence materials', assetCount: 89 },
  { id: 'content', name: 'Content Types', color: '#8C69F0', light: '#EDE9FE', accent: '#6D28D9', icon: '📄', description: 'Sales and marketing content by type', assetCount: 127 },
  { id: 'enablement', name: 'Enablement', color: '#10B981', light: '#D1FAE5', accent: '#047857', icon: '📚', description: 'Training and enablement resources', assetCount: 143 },
  { id: 'product', name: 'Product', color: '#3B82F6', light: '#DBEAFE', accent: '#1D4ED8', icon: '📦', description: 'Product documentation and updates', assetCount: 56 },
  { id: 'competitive', name: 'Competitive', color: '#EF4444', light: '#FEE2E2', accent: '#B91C1C', icon: '⚔️', description: 'Competitive intelligence and battlecards', assetCount: 34 },
  { id: 'sales', name: 'Sales', color: '#0EA5E9', light: '#E0F2FE', accent: '#0369A1', icon: '💼', description: 'Sales process and methodology', assetCount: 78 },
];

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

interface Board {
  id: string;
  name: string;
  color: string;
  light: string;
  accent: string;
  icon: string;
  description: string;
  assetCount: number;
}

interface EditBoardModalProps {
  board: Board | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (board: Board) => void;
  onDelete: (id: string) => void;
  isNew?: boolean;
}

function EditBoardModal({ board, isOpen, onClose, onSave, onDelete, isNew }: EditBoardModalProps) {
  const [formData, setFormData] = useState<Board>(
    board || {
      id: '',
      name: '',
      color: '#8C69F0',
      light: '#EDE9FE',
      accent: '#6D28D9',
      icon: '📋',
      description: '',
      assetCount: 0,
    }
  );

  if (!isOpen) return null;

  const handleColorSelect = (colorOption: typeof BOARD_COLORS[0]) => {
    setFormData((prev) => ({
      ...prev,
      color: colorOption.color,
      light: colorOption.light,
      accent: colorOption.accent,
    }));
  };

  const handleSave = () => {
    const newBoard = {
      ...formData,
      id: formData.id || formData.name.toLowerCase().replace(/\s+/g, '-'),
    };
    onSave(newBoard);
    onClose();
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
          width: '520px',
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
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
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
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
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

          {/* Icon */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
              Icon
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
              placeholder="Enter an emoji"
              style={{
                width: '80px',
                padding: '12px 14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '20px',
                textAlign: 'center',
              }}
            />
          </div>

          {/* Color */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
              Color
            </label>
            <div className="flex flex-wrap" style={{ gap: '8px' }}>
              {BOARD_COLORS.map((colorOption) => (
                <button
                  key={colorOption.name}
                  onClick={() => handleColorSelect(colorOption)}
                  className="flex items-center justify-center"
                  style={{
                    width: '40px',
                    height: '40px',
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

          {/* Preview */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
              Preview
            </label>
            <div
              style={{
                padding: '16px 20px',
                background: formData.light,
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
              }}
            >
              <div className="flex items-center" style={{ gap: '12px' }}>
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: formData.color,
                  }}
                />
                <span style={{ fontSize: '20px' }}>{formData.icon}</span>
                <span style={{ fontSize: '15px', fontWeight: 600, color: formData.accent }}>
                  {formData.name || 'Board Name'}
                </span>
              </div>
              {formData.description && (
                <p style={{ fontSize: '13px', color: '#4B5563', marginTop: '8px', marginLeft: '44px' }}>
                  {formData.description}
                </p>
              )}
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
    </div>
  );
}

export default function BoardsManagePage() {
  const [boards, setBoards] = useState(INITIAL_BOARDS);
  const [editModal, setEditModal] = useState<{ isOpen: boolean; board: Board | null; isNew: boolean }>({
    isOpen: false,
    board: null,
    isNew: false,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBoards = boards.filter(
    (board) =>
      board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.description.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleSave = (updatedBoard: Board) => {
    if (editModal.isNew) {
      setBoards((prev) => [...prev, updatedBoard]);
    } else {
      setBoards((prev) =>
        prev.map((b) => (b.id === updatedBoard.id ? updatedBoard : b))
      );
    }
  };

  const handleDelete = (id: string) => {
    setBoards((prev) => prev.filter((b) => b.id !== id));
    closeModal();
  };

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Page Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
            Manage Boards
          </h1>
          <p style={{ fontSize: '14px', color: '#4B5563' }}>
            Create and organize boards to categorize your content library.
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
            background: 'white',
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

      {/* Boards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredBoards.map((board) => (
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
                padding: '16px 20px',
                background: board.light,
              }}
            >
              <div className="flex items-center" style={{ gap: '12px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: board.color,
                  }}
                />
                <span style={{ fontSize: '20px' }}>{board.icon}</span>
                <span style={{ fontSize: '15px', fontWeight: 600, color: board.accent }}>
                  {board.name}
                </span>
              </div>
              <button
                onClick={() => openEditModal(board)}
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
              <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.5, marginBottom: '16px' }}>
                {board.description}
              </p>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '13px', color: '#9CA3AF' }}>
                  {board.assetCount} assets
                </span>
                <a
                  href={`/library/board/${board.id}`}
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
        ))}

        {/* Add New Board Card */}
        <button
          onClick={openCreateModal}
          className="flex flex-col items-center justify-center"
          style={{
            minHeight: '180px',
            background: '#F9FAFB',
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
              background: '#E5E7EB',
              borderRadius: '12px',
              color: '#9CA3AF',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>
            Create New Board
          </span>
        </button>
      </div>

      {/* Edit Modal */}
      <EditBoardModal
        board={editModal.board}
        isOpen={editModal.isOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={handleDelete}
        isNew={editModal.isNew}
      />
    </div>
  );
}
