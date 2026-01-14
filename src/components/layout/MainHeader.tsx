import { Share, Download, MoreHorizontal, PanelRight, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useChatStore } from '@/stores/chatStore';
import { useTaskStore } from '@/stores/taskStore';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export function MainHeader() {
  const { contextPanelOpen, toggleContextPanel } = useUIStore();
  const { steps } = useTaskStore();
  const { activeConversationId, conversations } = useChatStore();

  // Get active conversation for breadcrumb
  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Build breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = [];
  if (activeConversation) {
    // If conversation has a project, show it first
    if (activeConversation.projectId) {
      // TODO: Get project name from store
      breadcrumbs.push({ label: 'Projekt' });
    }
    breadcrumbs.push({ label: activeConversation.title });
  } else {
    breadcrumbs.push({ label: 'Ny konversation' });
  }

  // Check if there's context to show (task progress, attached files, etc.)
  const hasContext = steps.length > 0;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      {/* Left side - Breadcrumbs */}
      <nav className="flex items-center gap-4 min-w-0">
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center gap-2 min-w-0">
            {index > 0 && (
              <ChevronRight size={14} className="text-gray-400 shrink-0" />
            )}
            {item.onClick ? (
              <button
                onClick={item.onClick}
                className="text-[15px] text-gray-600 hover:text-gray-900 hover:underline truncate"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-[15px] text-gray-900 font-medium truncate">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        <button
          className="
            flex items-center gap-1.5 px-3 py-1.5 rounded-md
            text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100
            transition-colors
          "
          aria-label="Dela"
        >
          <Share size={16} />
          <span className="hidden sm:inline">Dela</span>
        </button>

        <button
          className="
            flex items-center gap-1.5 px-3 py-1.5 rounded-md
            text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100
            transition-colors
          "
          aria-label="Exportera"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Exportera</span>
        </button>

        <button
          className="
            p-1.5 rounded-md
            text-gray-600 hover:text-gray-900 hover:bg-gray-100
            transition-colors
          "
          aria-label="Fler alternativ"
        >
          <MoreHorizontal size={18} />
        </button>

        {/* Context panel toggle */}
        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button
          onClick={toggleContextPanel}
          className={`
            p-1.5 rounded-md transition-colors
            ${contextPanelOpen
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }
            ${hasContext ? 'relative' : ''}
          `}
          aria-label={contextPanelOpen ? 'Stäng kontextpanel' : 'Öppna kontextpanel'}
        >
          <PanelRight size={18} />
          {/* Indicator dot when there's context */}
          {hasContext && !contextPanelOpen && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </button>
      </div>
    </header>
  );
}
