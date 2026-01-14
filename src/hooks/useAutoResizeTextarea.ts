import { useRef, useCallback, useEffect } from 'react';

export function useAutoResizeTextarea(minRows = 1, maxRows = 6) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate scroll height accurately
    textarea.style.height = 'auto';

    // Get line height from computed styles
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseInt(computedStyle.lineHeight) || 24;
    const paddingTop = parseInt(computedStyle.paddingTop) || 0;
    const paddingBottom = parseInt(computedStyle.paddingBottom) || 0;

    const minHeight = lineHeight * minRows + paddingTop + paddingBottom;
    const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;

    // Clamp the height between min and max
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [minRows, maxRows]);

  // Resize on mount and when resize function changes
  useEffect(() => {
    resize();
  }, [resize]);

  return { textareaRef, resize };
}
