import type { Source } from '@/types';
import { SourceItem } from './SourceItem';

interface SourcesListProps {
  sources: Source[];
  activeSourceId?: string | null;
  onSourceClick?: (source: Source) => void;
}

export function SourcesList({
  sources,
  activeSourceId,
  onSourceClick,
}: SourcesListProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-5 pt-4 border-t border-neutral-200">
      {/* Header */}
      <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.05em] mb-3">
        Källor
      </h4>

      {/* Sources list */}
      <ul className="space-y-2">
        {sources.map((source, index) => (
          <SourceItem
            key={source.id}
            source={source}
            index={index + 1}
            variant="compact"
            isActive={source.id === activeSourceId}
            onClick={() => onSourceClick?.(source)}
          />
        ))}
      </ul>
    </div>
  );
}
