import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative mt-4 mb-5">
      <Search
        size={16}
        strokeWidth={2}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Sök konversationer..."
        data-search-input
        className="
          w-full pl-9 pr-12 py-2 text-sm
          bg-gray-100 border-none rounded-lg
          placeholder:text-gray-400 text-gray-900
          focus:outline-none focus:ring-1 focus:ring-gray-200 focus:bg-gray-50
          transition-all duration-150
        "
      />
      {value ? (
        <button
          onClick={() => onChange('')}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            p-1 rounded
            text-gray-400 hover:text-gray-600 hover:bg-gray-200
            transition-colors
          "
        >
          <X size={14} strokeWidth={2} />
        </button>
      ) : (
        <kbd className="
          absolute right-3 top-1/2 -translate-y-1/2
          px-1.5 py-0.5
          text-[10px] font-medium
          bg-gray-200 text-gray-500
          rounded border border-gray-300
        ">
          ⌘K
        </kbd>
      )}
    </div>
  );
}
