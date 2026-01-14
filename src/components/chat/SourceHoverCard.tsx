import { Scale, FileText, Globe, Database } from 'lucide-react';
import type { Source, SourceType } from '@/types';
import { truncateExcerpt } from '@/utils/parseCitations';

// Icon mapping for source types
const SOURCE_ICONS: Record<SourceType, typeof Scale> = {
  law: Scale,
  document: FileText,
  web: Globe,
  internal: Database,
};

interface SourceHoverCardProps {
  source: Source;
  visible: boolean;
  position: { x: number; y: number };
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function SourceHoverCard({
  source,
  visible,
  position,
  onMouseEnter,
  onMouseLeave,
}: SourceHoverCardProps) {
  const IconComponent = SOURCE_ICONS[source.type] || FileText;

  if (!visible) return null;

  return (
    <div
      className="
        fixed z-50
        bg-white rounded-lg shadow-lg border border-gray-200
        p-3 max-w-[280px]
        animate-in fade-in duration-150
      "
      style={{
        left: position.x,
        top: position.y - 8,
        transform: 'translateX(-50%) translateY(-100%)',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Source icon and title */}
      <div className="flex items-start gap-2">
        <IconComponent size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-700 leading-tight">
            {source.title}
          </p>
          {source.reference && (
            <p className="text-xs text-gray-500 mt-0.5">
              {source.reference}
              {source.page && `, s. ${source.page}`}
            </p>
          )}
        </div>
      </div>

      {/* Excerpt */}
      {source.excerpt && (
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          "{truncateExcerpt(source.excerpt, 100)}"
        </p>
      )}

      {/* Call to action */}
      <p className="text-xs text-blue-500 mt-2">
        Klicka för att öppna
      </p>

      {/* Arrow pointer */}
      <div
        className="
          absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full
          w-0 h-0
          border-l-[6px] border-l-transparent
          border-r-[6px] border-r-transparent
          border-t-[6px] border-t-white
        "
        style={{
          filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1))',
        }}
      />
    </div>
  );
}
