import { ChevronDown } from 'lucide-react';

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  count?: number;
}

export function SidebarSection({
  title,
  children,
  collapsible = false,
  isExpanded = true,
  onToggle,
  count,
}: SidebarSectionProps) {
  const Header = collapsible ? 'button' : 'div';

  return (
    <div className="mt-7">
      <Header
        onClick={collapsible ? onToggle : undefined}
        className={`
          flex items-center gap-1.5 px-1 py-1 w-full text-left mb-3
          ${collapsible ? 'cursor-pointer hover:bg-gray-50 rounded' : ''}
        `}
      >
        {collapsible && (
          <ChevronDown
            size={12}
            className={`
              text-gray-400 transition-transform duration-200
              ${isExpanded ? '' : '-rotate-90'}
            `}
          />
        )}
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-[0.05em]">
          {title}
        </span>
        {count !== undefined && count > 0 && (
          <span className="text-xs text-gray-400 ml-auto">
            {count}
          </span>
        )}
      </Header>

      {isExpanded && (
        <div className="space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}
