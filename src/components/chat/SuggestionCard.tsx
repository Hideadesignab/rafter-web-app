import type { LucideIcon } from 'lucide-react';

interface SuggestionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  prompt: string;
  index: number;
  onClick?: (prompt: string) => void;
}

export function SuggestionCard({
  icon: Icon,
  title,
  description,
  prompt,
  index,
  onClick,
}: SuggestionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(prompt)}
      className="
        group flex flex-col gap-3 p-5 min-h-[120px]
        text-left cursor-pointer
        bg-white border border-gray-200 rounded-xl
        transition-all duration-200 transition-bounce focus-ring
        hover:bg-gray-50 hover:border-gray-300 hover:shadow-md
        hover:-translate-y-[2px]
        active:scale-[0.98] active:translate-y-0 active:shadow-sm
      "
      style={{
        animation: 'fadeInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        animationDelay: `${index * 50}ms`,
      }}
    >
      <Icon
        className="
          w-6 h-6 text-gray-600
          transition-all duration-200
          group-hover:text-gray-900 group-hover:scale-110
        "
        strokeWidth={1.5}
      />
      <div className="space-y-1">
        <span className="block text-base font-semibold text-gray-800">
          {title}
        </span>
        <span className="block text-sm font-normal text-gray-500">
          {description}
        </span>
      </div>
    </button>
  );
}
