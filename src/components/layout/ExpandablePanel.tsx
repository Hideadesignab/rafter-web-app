import { useMemo, useState } from 'react';
import { PanelLeftClose, FileText, Zap } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore, type ActiveIcon } from '@/stores/uiStore';
import { useSidebarKeyboard } from '@/hooks/useSidebarKeyboard';
import { NewConversationButton } from '@/components/sidebar/NewConversationButton';
import { SearchInput } from '@/components/sidebar/SearchInput';
import { ProjectFolder } from '@/components/sidebar/ProjectFolder';
import { ConversationItem } from '@/components/sidebar/ConversationItem';
import { SidebarSection } from '@/components/sidebar/SidebarSection';
import { ContextMenu } from '@/components/sidebar/ContextMenu';
import type { Conversation } from '@/types';

interface MenuState {
  conversationId: string | null;
  projectId: string | null;
  x: number;
  y: number;
}

interface ExpandablePanelProps {
  activeIcon: ActiveIcon;
}

// Chat Panel Content - extracted from Sidebar.tsx
function ChatPanelContent() {
  const {
    conversations,
    projects,
    activeConversationId,
    setActiveConversation,
    createConversation,
    updateConversation,
    deleteConversation,
  } = useChatStore();

  const {
    expandedProjects,
    toggleProject,
    searchQuery,
    setSearchQuery,
    showArchived,
    toggleArchived,
    setExpandablePanelOpen,
  } = useUIStore();

  const [menuState, setMenuState] = useState<MenuState | null>(null);

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  // Group conversations
  const { projectConversations, recentConversations, archivedConversations } = useMemo(() => {
    const projectConvs: Record<string, Conversation[]> = {};
    const recent: Conversation[] = [];
    const archived: Conversation[] = [];

    for (const conv of filteredConversations) {
      if (conv.isArchived) {
        archived.push(conv);
      } else if (conv.projectId) {
        if (!projectConvs[conv.projectId]) {
          projectConvs[conv.projectId] = [];
        }
        projectConvs[conv.projectId].push(conv);
      } else {
        recent.push(conv);
      }
    }

    // Sort by updatedAt descending
    const sortByUpdated = (a: Conversation, b: Conversation) => b.updatedAt - a.updatedAt;
    recent.sort(sortByUpdated);
    archived.sort(sortByUpdated);
    Object.values(projectConvs).forEach((convs) => convs.sort(sortByUpdated));

    return {
      projectConversations: projectConvs,
      recentConversations: recent,
      archivedConversations: archived,
    };
  }, [filteredConversations]);

  // Flat list of navigable conversations for keyboard navigation
  const navigableConversations = useMemo(() => {
    const result: Conversation[] = [];
    for (const project of projects) {
      if (expandedProjects.includes(project.id)) {
        const convs = projectConversations[project.id] || [];
        result.push(...convs);
      }
    }
    result.push(...recentConversations);
    if (showArchived) {
      result.push(...archivedConversations);
    }
    return result;
  }, [projects, expandedProjects, projectConversations, recentConversations, archivedConversations, showArchived]);

  // Keyboard navigation
  useSidebarKeyboard({
    conversations: navigableConversations,
    activeConversationId,
    onSelectConversation: setActiveConversation,
    sidebarOpen: true,
  });

  const handleNewConversation = () => {
    createConversation();
    if (window.innerWidth < 1024) {
      setExpandablePanelOpen(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    if (window.innerWidth < 1024) {
      setExpandablePanelOpen(false);
    }
  };

  const handleConversationMenu = (conversationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setMenuState({
      conversationId,
      projectId: null,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleProjectMenu = (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setMenuState({
      conversationId: null,
      projectId,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const closeMenu = () => setMenuState(null);

  const getActiveConversation = () => {
    if (!menuState?.conversationId) return null;
    return conversations.find((c) => c.id === menuState.conversationId);
  };

  const handleRename = () => {
    const conv = getActiveConversation();
    if (!conv) return;
    const newTitle = prompt('Nytt namn:', conv.title);
    if (newTitle && newTitle.trim()) {
      updateConversation(conv.id, { title: newTitle.trim() });
    }
    closeMenu();
  };

  const handleMoveToProject = () => {
    const conv = getActiveConversation();
    if (!conv) return;
    const projectName = prompt('Ange projektnamn (lämna tomt för att ta bort från projekt):');
    if (projectName === null) return;

    if (!projectName.trim()) {
      updateConversation(conv.id, { projectId: undefined });
    } else {
      const existingProject = projects.find(
        (p) => p.name.toLowerCase() === projectName.trim().toLowerCase()
      );
      if (existingProject) {
        updateConversation(conv.id, { projectId: existingProject.id });
      } else {
        const newProject = {
          id: `proj-${Date.now()}`,
          name: projectName.trim(),
          documents: [],
        };
        useChatStore.getState().addProject(newProject);
        updateConversation(conv.id, { projectId: newProject.id });
      }
    }
    closeMenu();
  };

  const handleArchive = () => {
    const conv = getActiveConversation();
    if (!conv) return;
    updateConversation(conv.id, { isArchived: !conv.isArchived });
    closeMenu();
  };

  const handleDelete = () => {
    if (!menuState?.conversationId) return;
    deleteConversation(menuState.conversationId);
    closeMenu();
  };

  return (
    <>
      <div className="p-4">
        <NewConversationButton onClick={handleNewConversation} />
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 scroll-shadows">
        {/* Projects */}
        {projects.map((project) => {
          const convs = projectConversations[project.id] || [];
          if (searchQuery && convs.length === 0) return null;

          return (
            <ProjectFolder
              key={project.id}
              project={project}
              conversations={convs}
              isExpanded={expandedProjects.includes(project.id)}
              activeConversationId={activeConversationId}
              onToggle={() => toggleProject(project.id)}
              onSelectConversation={handleSelectConversation}
              onConversationMenu={handleConversationMenu}
              onProjectMenu={(e) => handleProjectMenu(project.id, e)}
            />
          );
        })}

        {/* Recent (unfiled) */}
        {recentConversations.length > 0 && (
          <SidebarSection title="Senaste">
            {recentConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={activeConversationId === conversation.id}
                onSelect={() => handleSelectConversation(conversation.id)}
                onMenuOpen={(e) => handleConversationMenu(conversation.id, e)}
              />
            ))}
          </SidebarSection>
        )}

        {/* Archived */}
        {archivedConversations.length > 0 && (
          <SidebarSection
            title="Arkiverade"
            collapsible
            isExpanded={showArchived}
            onToggle={toggleArchived}
            count={archivedConversations.length}
          >
            {archivedConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={activeConversationId === conversation.id}
                onSelect={() => handleSelectConversation(conversation.id)}
                onMenuOpen={(e) => handleConversationMenu(conversation.id, e)}
              />
            ))}
          </SidebarSection>
        )}

        {/* Empty state */}
        {filteredConversations.length === 0 && (
          <div className="px-3 py-8 text-center text-sm text-gray-400">
            {searchQuery
              ? 'Inga konversationer hittades'
              : 'Inga konversationer ännu'}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {menuState && menuState.conversationId && (
        <ContextMenu
          x={menuState.x}
          y={menuState.y}
          onClose={closeMenu}
          isArchived={getActiveConversation()?.isArchived}
          onRename={handleRename}
          onMoveToProject={handleMoveToProject}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}

// Documents Panel Content - placeholder
function DocumentsPanelContent() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Dokument</h2>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <FileText size={24} className="text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 mb-1">Inga dokument ännu</p>
        <p className="text-xs text-gray-400">
          Ladda upp dokument för att använda dem i konversationer
        </p>
      </div>
    </div>
  );
}

// Settings Panel Content - placeholder
function SettingsPanelContent() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Inställningar</h2>
      </div>
      <div className="px-4 space-y-2">
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700 transition-all duration-150 focus-ring active:scale-[0.98]">
          Profil
        </button>
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700 transition-all duration-150 focus-ring active:scale-[0.98]">
          Team
        </button>
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700 transition-all duration-150 focus-ring active:scale-[0.98]">
          Fakturering
        </button>
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700 transition-all duration-150 focus-ring active:scale-[0.98]">
          Integrationer
        </button>
      </div>
    </div>
  );
}

// Home Panel Content - placeholder
function HomePanelContent() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Snabbåtgärder</h2>
      </div>
      <div className="px-4 space-y-2">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700 transition-all duration-150 focus-ring active:scale-[0.98]">
          <Zap size={16} className="text-gray-400" />
          Ny konversation
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700 transition-all duration-150 focus-ring active:scale-[0.98]">
          <FileText size={16} className="text-gray-400" />
          Ladda upp dokument
        </button>
      </div>
    </div>
  );
}

export function ExpandablePanel({ activeIcon }: ExpandablePanelProps) {
  const { setExpandablePanelOpen } = useUIStore();

  const handleCollapse = () => {
    setExpandablePanelOpen(false);
  };

  const getPanelTitle = () => {
    switch (activeIcon) {
      case 'chat':
        return 'Konversationer';
      case 'documents':
        return 'Dokument';
      case 'settings':
        return 'Inställningar';
      case 'home':
        return 'Hem';
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (activeIcon) {
      case 'chat':
        return <ChatPanelContent />;
      case 'documents':
        return <DocumentsPanelContent />;
      case 'settings':
        return <SettingsPanelContent />;
      case 'home':
        return <HomePanelContent />;
      default:
        return null;
    }
  };

  return (
    <aside
      className="
        w-[260px] bg-white border-r border-gray-200
        flex flex-col h-screen
        shrink-0
        animate-slideIn
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">{getPanelTitle()}</h2>
        <button
          onClick={handleCollapse}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-150 btn-interactive focus-ring"
          aria-label="Stäng panel"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* Content */}
      {renderContent()}
    </aside>
  );
}
