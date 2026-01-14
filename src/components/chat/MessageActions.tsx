import { useState, useCallback } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  FileDown,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Message } from '@/types';
import { formatTimestamp } from '@/utils/formatTimestamp';
import { ExportMenu } from './ExportMenu';

type FeedbackType = 'positive' | 'negative';

interface MessageActionsProps {
  message: Message;
  conversationTitle?: string;
  onRegenerate?: () => void;
  onFeedback?: (type: FeedbackType) => void;
}

/**
 * Action buttons shown at the bottom of assistant messages when complete.
 * Includes copy, regenerate, export, thumbs up/down, and timestamp.
 */
export function MessageActions({
  message,
  conversationTitle,
  onRegenerate,
  onFeedback,
}: MessageActionsProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [isSpinning, setIsSpinning] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Handle copy action
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopyState('copied');
      toast.success('Kopierat till urklipp');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch (error) {
      toast.error('Kunde inte kopiera');
    }
  }, [message.content]);

  // Handle regenerate action
  const handleRegenerate = useCallback(() => {
    if (!onRegenerate) return;
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      onRegenerate();
    }, 500);
  }, [onRegenerate]);

  // Handle feedback action (toggle)
  const handleFeedback = useCallback((type: FeedbackType) => {
    onFeedback?.(type);
  }, [onFeedback]);

  // Get feedback state from message
  const feedbackState = message.feedback;

  return (
    <div className="
      flex items-center justify-between
      pt-3 mt-4 border-t border-gray-100
      opacity-0 group-hover:opacity-100 max-md:opacity-100
      transition-opacity duration-200
    ">
      {/* Action buttons - left side */}
      <div className="flex items-center gap-1.5">
        {/* Copy */}
        <ActionButton
          icon={copyState === 'copied' ? Check : Copy}
          label="Kopiera"
          onClick={handleCopy}
          active={copyState === 'copied'}
          activeColor="text-green-500"
        />

        {/* Regenerate */}
        {onRegenerate && (
          <ActionButton
            icon={RefreshCw}
            label="Generera igen"
            onClick={handleRegenerate}
            spinning={isSpinning}
          />
        )}

        {/* Export */}
        <div className="relative">
          <ActionButton
            icon={FileDown}
            label="Exportera"
            onClick={() => setShowExportMenu(!showExportMenu)}
            active={showExportMenu}
          />
          <ExportMenu
            message={message}
            conversationTitle={conversationTitle}
            isOpen={showExportMenu}
            onClose={() => setShowExportMenu(false)}
          />
        </div>

        {/* Thumbs up */}
        <ActionButton
          icon={ThumbsUp}
          label="Bra svar"
          onClick={() => handleFeedback('positive')}
          active={feedbackState === 'positive'}
          activeColor="text-blue-500"
          filled={feedbackState === 'positive'}
        />

        {/* Thumbs down */}
        <ActionButton
          icon={ThumbsDown}
          label="Dåligt svar"
          onClick={() => handleFeedback('negative')}
          active={feedbackState === 'negative'}
          activeColor="text-blue-500"
          filled={feedbackState === 'negative'}
        />
      </div>

      {/* Timestamp - right side */}
      <span className="text-xs text-gray-400">
        {formatTimestamp(message.timestamp)}
      </span>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
  filled?: boolean;
  spinning?: boolean;
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  active,
  activeColor = 'text-blue-500',
  filled,
  spinning,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        p-1.5 rounded-md transition-all duration-150 focus-ring
        ${active
          ? activeColor
          : 'text-gray-400 hover:text-gray-600 hover:scale-110'
        }
        hover:bg-gray-100 active:scale-95
      `}
      aria-label={label}
      title={label}
    >
      <Icon
        className={`
          w-[18px] h-[18px]
          ${spinning ? 'animate-spin' : ''}
          ${filled ? 'fill-current' : ''}
        `}
      />
    </button>
  );
}
