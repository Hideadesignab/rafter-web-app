import { useState, useEffect, useRef } from 'react';
import { Home, MessageSquare, Folder, HelpCircle, Settings } from 'lucide-react';
import { useUIStore, type ActiveIcon } from '@/stores/uiStore';

interface NavItem {
  id: ActiveIcon;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  label: string;
}

const mainNavItems: NavItem[] = [
  { id: 'home', icon: Home, label: 'Hem' },
  { id: 'chat', icon: MessageSquare, label: 'Konversationer' },
  { id: 'documents', icon: Folder, label: 'Dokument' },
];

const bottomNavItems: NavItem[] = [
  { id: 'settings', icon: Settings, label: 'Inställningar' },
];

interface IconButtonProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}

function IconButton({ item, isActive, onClick }: IconButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const Icon = item.icon;

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          w-11 h-11 flex items-center justify-center rounded-xl
          transition-all duration-150 ease-out
          ${isActive
            ? 'bg-[#F5F5F5] text-[#171717]'
            : 'bg-transparent text-[#737373] hover:bg-[#F5F5F5] hover:text-[#525252]'
          }
        `}
        aria-label={item.label}
      >
        <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="
            absolute left-full ml-2 top-1/2 -translate-y-1/2
            px-2.5 py-1.5 bg-[#171717] text-white text-xs rounded-md
            whitespace-nowrap z-50
            pointer-events-none
          "
        >
          {item.label}
        </div>
      )}
    </div>
  );
}

interface UserAvatarProps {
  initials: string;
  onClick: () => void;
}

function UserAvatar({ initials, onClick }: UserAvatarProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="
          w-9 h-9 rounded-full bg-gray-200
          flex items-center justify-center
          text-xs font-medium text-gray-600
          border-2 border-transparent
          hover:border-[#E5E5E5] transition-all duration-150
        "
        aria-label="Användarmeny"
      >
        {initials}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="
            absolute left-full ml-2 top-1/2 -translate-y-1/2
            px-2.5 py-1.5 bg-[#171717] text-white text-xs rounded-md
            whitespace-nowrap z-50
            pointer-events-none
          "
        >
          Profil
        </div>
      )}
    </div>
  );
}

export function IconSidebar() {
  const { activeIcon, setActiveIcon, expandablePanelOpen } = useUIStore();

  const handleNavClick = (id: ActiveIcon) => {
    setActiveIcon(id);
  };

  const handleAvatarClick = () => {
    // TODO: Open user dropdown menu
    console.log('Avatar clicked');
  };

  const handleHelpClick = () => {
    // TODO: Open help/shortcuts panel
    console.log('Help clicked');
  };

  return (
    <aside
      className="
        w-[72px] bg-[#FAFAFA] border-r border-[#E5E5E5]
        flex flex-col justify-between h-screen
        shrink-0 py-4
      "
    >
      {/* Main navigation - top */}
      <nav className="flex flex-col items-center gap-2">
        {mainNavItems.map((item) => (
          <IconButton
            key={item.id}
            item={item}
            isActive={activeIcon === item.id && expandablePanelOpen}
            onClick={() => handleNavClick(item.id)}
          />
        ))}

        {/* Help button (not part of panel toggle) */}
        <div className="relative mt-1">
          <button
            onClick={handleHelpClick}
            className="
              w-11 h-11 flex items-center justify-center rounded-xl
              bg-transparent text-[#737373] hover:bg-[#F5F5F5] hover:text-[#525252]
              transition-all duration-150 ease-out
            "
            aria-label="Hjälp"
          >
            <HelpCircle size={22} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* Bottom section - settings & avatar */}
      <div className="flex flex-col items-center gap-2">
        {/* Separator */}
        <div className="w-8 h-px bg-gray-200 mb-2" />

        {bottomNavItems.map((item) => (
          <IconButton
            key={item.id}
            item={item}
            isActive={activeIcon === item.id && expandablePanelOpen}
            onClick={() => handleNavClick(item.id)}
          />
        ))}

        <div className="mt-1">
          <UserAvatar initials="BW" onClick={handleAvatarClick} />
        </div>
      </div>
    </aside>
  );
}
