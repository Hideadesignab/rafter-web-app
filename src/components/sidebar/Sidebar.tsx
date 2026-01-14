import { useState, useMemo } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { useSidebarKeyboard } from '@/hooks/useSidebarKeyboard';
import { SidebarHeader } from './SidebarHeader';
import { NewConversationButton } from './NewConversationButton';
import { SearchInput } from './SearchInput';
import { ProjectFolder } from './ProjectFolder';
import { ConversationItem } from './ConversationItem';
import { SidebarSection } from './SidebarSection';
import { ContextMenu } from './ContextMenu';
import type { Conversation } from '@/types';

interface MenuState {
  conversationId: string | null;
  projectId: string | null;
  x: number;
  y: number;
}

export function Sidebar() {
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
    sidebarOpen,
    setSidebarOpen,
    expandedProjects,
    toggleProject,
    searchQuery,
    setSearchQuery,
    showArchived,
    toggleArchived,
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
    // Add project conversations (only from expanded projects)
    for (const project of projects) {
      if (expandedProjects.includes(project.id)) {
        const convs = projectConversations[project.id] || [];
        result.push(...convs);
      }
    }
    // Add recent conversations
    result.push(...recentConversations);
    // Add archived if expanded
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
    sidebarOpen,
  });

  const handleNewConversation = () => {
    createConversation();
    // Close sidebar on mobile after creating conversation
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    // Close sidebar on mobile after selecting
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
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
    // For now, show a simple prompt - could be enhanced with a proper modal
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
        // Create new project
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

  if (!sidebarOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/20 z-40 lg:hidden"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className="
          fixed lg:static inset-y-0 left-0 z-50
          w-[280px] bg-white border-r border-gray-200
          flex flex-col h-screen
          transform transition-transform duration-200
          lg:transform-none
        "
      >
        <div className="p-5">
          <SidebarHeader onCollapse={() => setSidebarOpen(false)} />

          <div className="mb-4">
            <NewConversationButton onClick={handleNewConversation} />
          </div>

          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
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
      </aside>

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
