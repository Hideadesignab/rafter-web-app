import { Scale, FileText, Globe, Database, ExternalLink } from 'lucide-react';
import type { Source, SourceType } from '@/types';

// Icon mapping for source types
const SOURCE_ICONS: Record<SourceType, typeof Scale> = {
  law: Scale,
  document: FileText,
  web: Globe,
  internal: Database,
};

// Confidence indicator styles
const CONFIDENCE_STYLES = {
  high: 'bg-green-500',
  medium: 'bg-yellow-500',
  low: 'bg-orange-500',
} as const;

const CONFIDENCE_LABELS = {
  medium: 'Medelhögt förtroende',
  low: 'Lågt förtroende',
} as const;

interface SourceItemProps {
  source: Source;
  index: number;
  variant?: 'compact' | 'full';
  onClick?: () => void;
  isActive?: boolean;
}

function ConfidenceIndicator({ confidence }: { confidence?: Source['confidence'] }) {
  if (!confidence) return null;

  const bgColor = CONFIDENCE_STYLES[confidence];
  const label = confidence !== 'high' ? CONFIDENCE_LABELS[confidence as 'medium' | 'low'] : null;

  return (
    <span className="relative group/confidence">
      <span className={`inline-block w-2 h-2 rounded-full ${bgColor} ml-1`} />
      {label && (
        <span className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-1
          bg-neutral-900 text-white text-[11px] px-2.5 py-1 rounded-md
          opacity-0 group-hover/confidence:opacity-100 transition-opacity
          whitespace-nowrap pointer-events-none z-50
        ">
          {label}
        </span>
      )}
    </span>
  );
}

export function SourceItem({
  source,
  index,
  variant = 'compact',
  onClick,
  isActive = false,
}: SourceItemProps) {
  const IconComponent = SOURCE_ICONS[source.type] || FileText;
  const hasUrl = !!source.url;
  const isCompact = variant === 'compact';

  const handleClick = () => {
    if (source.url) {
      window.open(source.url, '_blank', 'noopener,noreferrer');
    }
    onClick?.();
  };

  return (
    <li
      className={`
        group flex items-start gap-3 px-4 py-3 rounded-[10px] cursor-pointer
        transition-all duration-150 ease-out
        ${isActive
          ? 'bg-blue-50 border border-blue-200'
          : 'bg-neutral-50 border border-neutral-100 hover:bg-neutral-100 hover:border-neutral-200'
        }
      `}
      onClick={handleClick}
    >
      <IconComponent size={20} className="text-neutral-600 flex-shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-neutral-600 text-sm font-semibold mr-1">[{index}]</span>
          <p className="text-[14px] font-medium text-neutral-800 truncate flex-1">
            {source.title}
          </p>
          <ConfidenceIndicator confidence={source.confidence} />
          {hasUrl && (
            <ExternalLink
              size={16}
              className="text-neutral-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          )}
        </div>

        {source.reference && (
          <p className="text-xs text-neutral-500 truncate mt-0.5">
            {source.reference}
            {source.page && `, s. ${source.page}`}
          </p>
        )}

        {!isCompact && source.excerpt && (
          <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
            "{source.excerpt}"
          </p>
        )}
      </div>
    </li>
  );
}
