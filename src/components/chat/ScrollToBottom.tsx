import { ChevronDown } from 'lucide-react';

interface ScrollToBottomProps {
  visible: boolean;
  onClick: () => void;
}

export function ScrollToBottom({ visible, onClick }: ScrollToBottomProps) {
  return (
    <button
      onClick={onClick}
      className={`
        absolute bottom-4 right-4 w-10 h-10 rounded-full
        bg-gray-800 text-white shadow-lg
        flex items-center justify-center
        btn-interactive focus-ring
        hover:bg-gray-700 transition-all duration-200
        ${visible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
        }
      `}
      aria-label="Scrolla till botten"
    >
      <ChevronDown size={20} />
    </button>
  );
}
