import { PanelLeftClose } from 'lucide-react';

interface SidebarHeaderProps {
  onCollapse: () => void;
}

export function SidebarHeader({ onCollapse }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
      {/* Brand wordmark */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">R</span>
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900">
          Rafter
        </span>
      </div>

      {/* Collapse button (mobile only) */}
      <button
        onClick={onCollapse}
        className="
          p-1.5 rounded-lg
          text-gray-500 hover:text-gray-700 hover:bg-gray-100
          transition-colors lg:hidden
        "
        aria-label="Stäng sidopanel"
      >
        <PanelLeftClose size={20} strokeWidth={2} />
      </button>
    </div>
  );
}
