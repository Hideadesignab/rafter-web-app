import { MessageSquare, MoreHorizontal } from 'lucide-react';
import { formatTimeAgo } from '@/utils/formatTimeAgo';
import type { Conversation } from '@/types';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onMenuOpen: (e: React.MouseEvent) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onMenuOpen,
}: ConversationItemProps) {
  return (
    <button
      onClick={onSelect}
      onContextMenu={onMenuOpen}
      className={`
        group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-left
        transition-all duration-150 cursor-pointer focus-ring
        active:scale-[0.98]
        ${isActive
          ? 'bg-gray-900 text-white'
          : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      <MessageSquare
        size={16}
        className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`}
      />

      <span className="flex-1 truncate text-sm">
        {conversation.title}
      </span>

      <span
        className={`
          text-xs flex-shrink-0
          ${isActive ? 'text-gray-300' : 'text-gray-400'}
        `}
      >
        {formatTimeAgo(conversation.updatedAt)}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onMenuOpen(e);
        }}
        className={`
          p-1 rounded opacity-0 group-hover:opacity-100
          transition-all duration-150 focus-ring
          active:scale-90
          ${isActive
            ? 'hover:bg-gray-700 text-gray-300'
            : 'hover:bg-gray-200 text-gray-500'
          }
        `}
      >
        <MoreHorizontal size={14} />
      </button>
    </button>
  );
}
