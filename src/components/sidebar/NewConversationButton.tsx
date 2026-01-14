import { Plus } from 'lucide-react';

interface NewConversationButtonProps {
  onClick: () => void;
}

export function NewConversationButton({ onClick }: NewConversationButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        w-full flex items-center justify-center gap-2
        px-3 py-2.5
        bg-gray-900 text-white text-sm font-medium
        rounded-lg
        hover:bg-gray-800 hover:-translate-y-[1px]
        active:scale-[0.98] active:translate-y-0
        transition-all duration-150 focus-ring
      "
    >
      <Plus size={16} strokeWidth={2} />
      Ny konversation
    </button>
  );
}
