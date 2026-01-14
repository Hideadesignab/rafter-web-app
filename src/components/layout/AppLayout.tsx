import { Menu } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { IconSidebar } from './IconSidebar';
import { ExpandablePanel } from './ExpandablePanel';
import { MainHeader } from './MainHeader';
import { ContextPanel } from './ContextPanel';
import type { Source } from '@/types';

interface AppLayoutProps {
  children: React.ReactNode;
  attachedFiles?: File[];
  sources?: Source[];
}

export function AppLayout({ children, attachedFiles = [], sources = [] }: AppLayoutProps) {
  const { activeIcon, expandablePanelOpen, setExpandablePanelOpen } = useUIStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Zone A - Icon Sidebar (always visible on desktop) */}
      <div className="hidden md:block">
        <IconSidebar />
      </div>

      {/* Mobile header with hamburger (only on mobile) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <button
          onClick={() => setExpandablePanelOpen(true)}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Öppna meny"
        >
          <Menu size={20} />
        </button>
        <span className="text-lg font-bold text-gray-800">Rafter</span>
      </div>

      {/* Zone B - Expandable Panel (conditional) */}
      {expandablePanelOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setExpandablePanelOpen(false)}
          />
          <div className="fixed md:static inset-y-0 left-0 z-50 md:z-auto">
            <ExpandablePanel activeIcon={activeIcon} />
          </div>
        </>
      )}

      {/* Zone C - Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header bar (hidden on mobile, replaced by fixed header) */}
        <div className="hidden md:block">
          <MainHeader />
        </div>

        {/* Spacer for mobile fixed header */}
        <div className="h-14 md:hidden" />

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Zone D - Context Panel (conditional) */}
      <div className="hidden lg:block">
        <ContextPanel attachedFiles={attachedFiles} sources={sources} />
      </div>
    </div>
  );
}
