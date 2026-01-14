import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Pencil, FolderInput, Archive, ArchiveRestore, Trash2 } from 'lucide-react';

export interface ContextMenuAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  isArchived?: boolean;
  onRename: () => void;
  onMoveToProject: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function ContextMenu({
  x,
  y,
  onClose,
  isArchived,
  onRename,
  onMoveToProject,
  onArchive,
  onDelete,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    // Adjust position if menu would go off screen
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const newX = x + rect.width > window.innerWidth ? x - rect.width : x;
      const newY = y + rect.height > window.innerHeight ? y - rect.height : y;
      setPosition({ x: newX, y: newY });
    }
  }, [x, y]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const actions: ContextMenuAction[] = [
    { label: 'Byt namn', icon: <Pencil size={14} />, onClick: onRename },
    { label: 'Flytta till...', icon: <FolderInput size={14} />, onClick: onMoveToProject },
    {
      label: isArchived ? 'Återställ' : 'Arkivera',
      icon: isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />,
      onClick: onArchive,
    },
    {
      label: showDeleteConfirm ? 'Bekräfta radering' : 'Radera',
      icon: <Trash2 size={14} />,
      onClick: handleDelete,
      danger: true,
    },
  ];

  return createPortal(
    <div
      ref={menuRef}
      style={{ left: position.x, top: position.y }}
      className="fixed z-50 min-w-[160px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-in fade-in duration-100"
    >
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick();
            if (!action.danger || showDeleteConfirm) {
              onClose();
            }
          }}
          className={`
            w-full flex items-center gap-2 px-3 py-2 text-sm text-left
            transition-colors
            ${action.danger
              ? 'text-red-600 hover:bg-red-50'
              : 'text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>,
    document.body
  );
}
