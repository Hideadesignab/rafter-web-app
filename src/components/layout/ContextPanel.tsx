import { X, FileText, Scale, Globe, Database } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useTaskStore } from '@/stores/taskStore';
import { TaskProgress } from '@/components/chat/TaskProgress';
import type { Source, SourceType } from '@/types';

interface ContextPanelProps {
  attachedFiles?: File[];
  sources?: Source[];
}

// Icon mapping for source types
const SOURCE_ICONS: Record<SourceType, typeof Scale> = {
  law: Scale,
  document: FileText,
  web: Globe,
  internal: Database,
};

// Get source icon based on type
function getSourceIcon(source: Source) {
  const IconComponent = SOURCE_ICONS[source.type] || FileText;
  return <IconComponent size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />;
}

// Confidence indicator component
function ConfidenceIndicator({ confidence }: { confidence?: Source['confidence'] }) {
  if (!confidence || confidence === 'high') return null;

  const styles = {
    medium: { bg: 'bg-yellow-400', text: 'Medelhögt förtroende' },
    low: { bg: 'bg-orange-400', text: 'Lågt förtroende' },
  };

  const { bg, text } = styles[confidence];

  return (
    <span className="relative group">
      <span className={`inline-block w-2 h-2 rounded-full ${bg} ml-1`} />
      <span className="
        absolute bottom-full left-1/2 -translate-x-1/2 mb-1
        bg-gray-800 text-white text-xs px-2 py-1 rounded
        opacity-0 group-hover:opacity-100 transition-opacity
        whitespace-nowrap pointer-events-none z-50
      ">
        {text}
      </span>
    </span>
  );
}

export function ContextPanel({
  attachedFiles = [],
  sources = [],
}: ContextPanelProps) {
  const { contextPanelOpen, toggleContextPanel } = useUIStore();
  const { steps } = useTaskStore();

  // Don't render if closed
  if (!contextPanelOpen) {
    return null;
  }

  const hasContent = steps.length > 0 || attachedFiles.length > 0 || sources.length > 0;

  const handleSourceClick = (source: Source) => {
    if (source.url) {
      window.open(source.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <aside className="w-[320px] bg-gray-50 border-l border-gray-200 flex flex-col h-full shrink-0 animate-panel-enter">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Kontext</h2>
        <button
          onClick={toggleContextPanel}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-150 btn-interactive focus-ring"
          aria-label="Stäng panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-panel-content">
        {/* Task Progress Section - Always at top */}
        <TaskProgress />

        {/* Attached Files Section */}
        {attachedFiles.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Bifogade filer
            </h3>
            <ul className="space-y-2">
              {attachedFiles.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-2 py-3 px-3 bg-white rounded-lg border border-gray-200"
                >
                  <FileText size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">
                    {file.name}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Sources Section */}
        {sources.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Källor
            </h3>
            <ul className="space-y-2">
              {sources.map((source, index) => (
                <li
                  key={source.id}
                  className="flex items-start gap-2 py-3 px-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  onClick={() => handleSourceClick(source)}
                >
                  {getSourceIcon(source)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-gray-700 truncate flex-1">
                        [{index + 1}] {source.title}
                      </p>
                      <ConfidenceIndicator confidence={source.confidence} />
                    </div>
                    {source.reference && (
                      <p className="text-xs text-gray-500 truncate">
                        {source.reference}
                        {source.page && `, s. ${source.page}`}
                      </p>
                    )}
                    {source.excerpt && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        "{source.excerpt}"
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Empty state */}
        {!hasContent && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <FileText size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Ingen kontext att visa</p>
            <p className="text-xs text-gray-400 mt-1">
              Bifoga filer eller starta en sökning
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
