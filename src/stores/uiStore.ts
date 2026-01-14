import { create } from 'zustand';

export type ActiveIcon = 'home' | 'chat' | 'documents' | 'settings';

interface UIStore {
  // Layout state (4-zone)
  activeIcon: ActiveIcon;
  expandablePanelOpen: boolean;
  contextPanelOpen: boolean;

  // Legacy sidebar state
  sidebarOpen: boolean;
  activeModal: string | null;
  isLoading: boolean;
  expandedProjects: string[];
  searchQuery: string;
  showArchived: boolean;

  // Layout actions
  setActiveIcon: (icon: ActiveIcon) => void;
  toggleExpandablePanel: () => void;
  setExpandablePanelOpen: (open: boolean) => void;
  toggleContextPanel: () => void;
  setContextPanelOpen: (open: boolean) => void;

  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleProject: (projectId: string) => void;
  setSearchQuery: (query: string) => void;
  toggleArchived: () => void;

  // Modal actions
  setActiveModal: (modal: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Layout state (4-zone) - defaults
  activeIcon: 'chat',
  expandablePanelOpen: true,
  contextPanelOpen: false,

  // Legacy sidebar state
  sidebarOpen: true,
  activeModal: null,
  isLoading: false,
  expandedProjects: [],
  searchQuery: '',
  showArchived: false,

  // Layout actions
  setActiveIcon: (icon) =>
    set((state) => {
      // Toggle behavior: clicking same icon closes panel
      if (state.activeIcon === icon && state.expandablePanelOpen) {
        return { expandablePanelOpen: false };
      }
      return { activeIcon: icon, expandablePanelOpen: true };
    }),

  toggleExpandablePanel: () =>
    set((state) => ({ expandablePanelOpen: !state.expandablePanelOpen })),

  setExpandablePanelOpen: (open) => set({ expandablePanelOpen: open }),

  toggleContextPanel: () =>
    set((state) => ({ contextPanelOpen: !state.contextPanelOpen })),

  setContextPanelOpen: (open) => set({ contextPanelOpen: open }),

  // Legacy sidebar actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleProject: (projectId) =>
    set((state) => ({
      expandedProjects: state.expandedProjects.includes(projectId)
        ? state.expandedProjects.filter((id) => id !== projectId)
        : [...state.expandedProjects, projectId],
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleArchived: () => set((state) => ({ showArchived: !state.showArchived })),

  setActiveModal: (modal) => set({ activeModal: modal }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
