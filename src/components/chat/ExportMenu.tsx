import { useState, useRef, useEffect } from 'react';
import {
  Copy,
  FileText,
  FileDown,
  Mail,
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Message } from '@/types';
import type { ExportFormat } from '@/utils/export';
import { useExport } from '@/hooks';

interface ExportMenuProps {
  message: Message;
  conversationTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ExportOption {
  id: ExportFormat;
  label: string;
  icon: typeof Copy;
}

const EXPORT_OPTIONS: ExportOption[] = [
  { id: 'text', label: 'Kopiera som text', icon: Copy },
  { id: 'word', label: 'Exportera till Word', icon: FileText },
  { id: 'pdf', label: 'Exportera till PDF', icon: FileDown },
  { id: 'email', label: 'Skicka via e-post', icon: Mail },
];

export function ExportMenu({ message, conversationTitle, isOpen, onClose }: ExportMenuProps) {
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isExporting, exportFormat, exportMessage } = useExport();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close menu on escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleExport = async (format: ExportFormat) => {
    const result = await exportMessage(message, format, conversationTitle);

    if (result.success) {
      if (format === 'text') {
        setCopiedFeedback(true);
        toast.success('Kopierat till urklipp');
        setTimeout(() => setCopiedFeedback(false), 2000);
      } else if (format === 'word' || format === 'pdf') {
        toast.success(`Exporterat till ${format === 'word' ? 'Word' : 'PDF'}`);
      }
    } else if (result.error) {
      toast.error(result.error);
    }

    // Close menu after action (except while loading)
    if (!isExporting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="
        absolute bottom-full right-0 mb-2 w-52 py-1
        bg-white rounded-lg shadow-lg border border-gray-200
        z-50 animate-in fade-in slide-in-from-bottom-2 duration-150
      "
      role="menu"
    >
      {EXPORT_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = isExporting && exportFormat === option.id;
        const showCheck = option.id === 'text' && copiedFeedback;

        return (
          <button
            key={option.id}
            onClick={() => handleExport(option.id)}
            disabled={isExporting}
            className="
              w-full flex items-center gap-3 px-3 py-2
              text-sm text-gray-700 hover:bg-gray-50
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
            role="menuitem"
          >
            {isActive ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            ) : showCheck ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Icon className="w-4 h-4 text-gray-500" />
            )}
            <span>{showCheck ? 'Kopierat!' : option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
