import { X } from 'lucide-react';

interface AttachedFileProps {
  file: File;
  onRemove: () => void;
}

function truncateFilename(filename: string, maxLength = 20): string {
  if (filename.length <= maxLength) return filename;

  const extension = filename.lastIndexOf('.') > 0
    ? filename.slice(filename.lastIndexOf('.'))
    : '';
  const nameWithoutExt = filename.slice(0, filename.length - extension.length);
  const availableLength = maxLength - extension.length - 3; // 3 for "..."

  if (availableLength <= 0) return filename.slice(0, maxLength - 3) + '...';

  return nameWithoutExt.slice(0, availableLength) + '...' + extension;
}

export function AttachedFile({ file, onRemove }: AttachedFileProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#F5F5F5] rounded-lg">
      <span className="text-sm text-gray-700">
        {truncateFilename(file.name)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={`Remove ${file.name}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
