import { useState, useRef, type KeyboardEvent, type ChangeEvent } from 'react';
import { Paperclip, Mic, ArrowUp, Check } from 'lucide-react';
import { useAutoResizeTextarea } from '@/hooks/useAutoResizeTextarea';
import { AttachedFile } from './AttachedFile';

const ACCEPTED_FILES = '.pdf,.docx,.xlsx,.csv,.jpg,.jpeg,.png';

interface ChatInputProps {
  onSend: (message: string, files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  value?: string;
  onValueChange?: (value: string) => void;
  onFilesChange?: (files: File[]) => void;
}

export function ChatInput({
  onSend,
  disabled = false,
  maxFiles = 5,
  value: controlledValue,
  onValueChange,
  onFilesChange,
}: ChatInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const [attachedFiles, setAttachedFilesInternal] = useState<File[]>([]);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Wrapper to also notify parent of file changes
  const setAttachedFiles = (updater: File[] | ((prev: File[]) => File[])) => {
    setAttachedFilesInternal((prev) => {
      const newFiles = typeof updater === 'function' ? updater(prev) : updater;
      onFilesChange?.(newFiles);
      return newFiles;
    });
  };

  // Support both controlled and uncontrolled modes
  const isControlled = controlledValue !== undefined;
  const inputValue = isControlled ? controlledValue : internalValue;
  const setInputValue = isControlled ? (onValueChange ?? (() => {})) : setInternalValue;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { textareaRef, resize } = useAutoResizeTextarea(1, 6);

  const canSend = (inputValue.trim().length > 0 || attachedFiles.length > 0) && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    onSend(inputValue.trim(), attachedFiles);
    setInputValue('');
    setAttachedFiles([]);
    // Reset textarea height after clearing
    setTimeout(resize, 0);
    // Show success checkmark briefly
    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 800);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) handleSend();
    }
    if (e.key === 'Escape') {
      handleClear();
      e.currentTarget.blur();
      setTimeout(resize, 0);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    resize();
  };

  const handleClear = () => {
    setInputValue('');
    setAttachedFiles([]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
    e.target.value = ''; // Reset for re-selection of same file
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="sticky bottom-0 w-full bg-white border-t border-gray-100 pt-4 px-6 pb-6">
      {/* Attached files */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachedFiles.map((file, index) => (
            <AttachedFile
              key={`${file.name}-${index}`}
              file={file}
              onRemove={() => handleRemoveFile(index)}
            />
          ))}
        </div>
      )}

      {/* Input area */}
      <div
        className="
          flex items-center gap-3 py-3 px-4
          bg-white border-[1.5px] border-[#E5E5E5] rounded-2xl
          shadow-[0_2px_8px_rgba(0,0,0,0.04)]
          transition-all duration-200
          focus-within:border-[#A3A3A3] focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.08)] focus-within:-translate-y-[1px]
        "
      >
        {/* Left action buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleAttachClick}
            disabled={disabled}
            className="
              flex items-center justify-center w-9 h-9 rounded-lg
              text-[#737373] hover:text-[#525252] hover:bg-gray-100
              transition-all duration-150 active:scale-95
              focus-ring
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            aria-label="Attach file"
          >
            <Paperclip className="w-[22px] h-[22px]" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            disabled
            className="
              flex items-center justify-center w-9 h-9 rounded-lg
              text-[#737373] hover:text-[#525252] hover:bg-gray-100
              transition-all duration-150 active:scale-95
              focus-ring
              cursor-not-allowed opacity-50
            "
            aria-label="Voice input (coming soon)"
          >
            <Mic className="w-[22px] h-[22px]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILES}
          onChange={handleFileChange}
          multiple
          className="hidden"
          aria-hidden="true"
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Skriv ditt meddelande..."
          rows={1}
          className="
            flex-1 resize-none border-none outline-none bg-transparent
            text-[#262626] placeholder:text-[#A3A3A3]
            text-[15px] leading-[1.5]
            min-h-[24px] max-h-[120px]
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend && !sendSuccess}
          className={`
            flex items-center justify-center w-10 h-10 rounded-full
            btn-send focus-ring
            ${sendSuccess
              ? 'bg-gray-700 text-white'
              : canSend
                ? 'bg-[#171717] text-white hover:bg-[#262626] hover:scale-105 active:scale-95'
                : 'bg-[#F5F5F5] text-[#D4D4D4] cursor-not-allowed'
            }
          `}
          aria-label="Send message"
        >
          {sendSuccess ? (
            <Check className="w-5 h-5 transition-transform duration-200" strokeWidth={2} />
          ) : (
            <ArrowUp className="w-5 h-5 transition-transform duration-200" strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  );
}
