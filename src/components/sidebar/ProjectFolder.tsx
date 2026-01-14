import { ChevronDown, Folder, FolderOpen, MoreHorizontal } from 'lucide-react';
import { ConversationItem } from './ConversationItem';
import type { Conversation, Project } from '@/types';

interface ProjectFolderProps {
  project: Project;
  conversations: Conversation[];
  isExpanded: boolean;
  activeConversationId: string | null;
  onToggle: () => void;
  onSelectConversation: (id: string) => void;
  onConversationMenu: (conversationId: string, e: React.MouseEvent) => void;
  onProjectMenu: (e: React.MouseEvent) => void;
}

export function ProjectFolder({
  project,
  conversations,
  isExpanded,
  activeConversationId,
  onToggle,
  onSelectConversation,
  onConversationMenu,
  onProjectMenu,
}: ProjectFolderProps) {
  const FolderIcon = isExpanded ? FolderOpen : Folder;

  return (
    <div>
      <button
        onClick={onToggle}
        onContextMenu={onProjectMenu}
        className="group w-full flex items-center gap-2 px-3 py-2 rounded-md text-left hover:bg-gray-100 transition-all duration-150 focus-ring active:scale-[0.98]"
      >
        <ChevronDown
          size={14}
          className={`
            text-gray-400 transition-transform duration-200 flex-shrink-0
            ${isExpanded ? '' : '-rotate-90'}
          `}
        />
        <FolderIcon size={16} className="text-gray-500 flex-shrink-0" />
        <span className="flex-1 truncate text-sm text-gray-700 font-medium">
          {project.name}
        </span>
        <span className="text-xs text-gray-400">
          {conversations.length}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onProjectMenu(e);
          }}
          className="p-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-gray-200 text-gray-500 focus-ring active:scale-90"
        >
          <MoreHorizontal size={14} />
        </button>
      </button>

      {isExpanded && conversations.length > 0 && (
        <div className="ml-5 border-l border-gray-200 pl-2 space-y-0.5">
          {conversations.map((conversation, index) => (
            <div
              key={conversation.id}
              className="animate-sidebar-item"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <ConversationItem
                conversation={conversation}
                isActive={activeConversationId === conversation.id}
                onSelect={() => onSelectConversation(conversation.id)}
                onMenuOpen={(e) => onConversationMenu(conversation.id, e)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
