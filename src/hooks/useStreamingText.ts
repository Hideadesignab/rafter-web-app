import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseStreamingTextOptions {
  /** Character reveal interval in ms (default: 8ms = ~125 chars/sec) */
  charInterval?: number;
  /** Callback when streaming completes */
  onComplete?: () => void;
  /** Whether streaming is enabled (for non-assistant messages) */
  enabled?: boolean;
}

export interface UseStreamingTextReturn {
  /** The currently displayed text (revealed portion) */
  displayText: string;
  /** Whether text is still being revealed */
  isStreaming: boolean;
  /** Manually complete streaming (skip to end) */
  skipToEnd: () => void;
}

/**
 * Hook for smooth typewriter-style text streaming.
 * Uses requestAnimationFrame for 60fps animation with character buffering.
 *
 * @param rawText - The complete text (may arrive in chunks)
 * @param status - Message status ('pending' | 'streaming' | 'complete' | 'error')
 * @param options - Configuration options
 */
export function useStreamingText(
  rawText: string,
  status: 'pending' | 'streaming' | 'complete' | 'error',
  options: UseStreamingTextOptions = {}
): UseStreamingTextReturn {
  const {
    charInterval = 8, // ~125 chars/sec for smooth reading
    onComplete,
    enabled = true,
  } = options;

  // State
  const [displayText, setDisplayText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Refs for animation loop
  const displayIndexRef = useRef(0);
  const lastTickRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const onCompleteCalledRef = useRef(false);
  const prevRawTextLengthRef = useRef(0);

  // Animation loop using requestAnimationFrame
  const animate = useCallback(
    (timestamp: number) => {
      // Calculate elapsed time since last character reveal
      const elapsed = timestamp - lastTickRef.current;

      // Reveal characters at the specified interval
      if (elapsed >= charInterval) {
        const charsToReveal = Math.floor(elapsed / charInterval);
        const newIndex = Math.min(
          displayIndexRef.current + charsToReveal,
          rawText.length
        );

        if (newIndex > displayIndexRef.current) {
          displayIndexRef.current = newIndex;
          setDisplayText(rawText.slice(0, newIndex));
          lastTickRef.current = timestamp - (elapsed % charInterval);
        }
      }

      // Continue animation if more text to reveal
      if (displayIndexRef.current < rawText.length) {
        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        // All text revealed
        rafIdRef.current = null;
        setIsStreaming(false);

        // Call onComplete only once when status is 'complete'
        if (status === 'complete' && !onCompleteCalledRef.current) {
          onCompleteCalledRef.current = true;
          onComplete?.();
        }
      }
    },
    [rawText, charInterval, status, onComplete]
  );

  // Start/manage animation when text or status changes
  useEffect(() => {
    // If not enabled (e.g., user messages), show full text immediately
    if (!enabled) {
      displayIndexRef.current = rawText.length;
      setDisplayText(rawText);
      setIsStreaming(false);
      return;
    }

    // For error status, show full text immediately
    if (status === 'error') {
      displayIndexRef.current = rawText.length;
      setDisplayText(rawText);
      setIsStreaming(false);
      return;
    }

    // If status is complete and we haven't started streaming yet,
    // show full text (e.g., loading existing messages from history)
    if (status === 'complete' && displayIndexRef.current === 0 && displayText === '') {
      displayIndexRef.current = rawText.length;
      setDisplayText(rawText);
      return;
    }

    // Detect if this is a new message (rawText got shorter, meaning reset)
    if (rawText.length < prevRawTextLengthRef.current) {
      // New message started - reset state
      displayIndexRef.current = 0;
      setDisplayText('');
      setIsStreaming(false);
      onCompleteCalledRef.current = false;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    }
    prevRawTextLengthRef.current = rawText.length;

    // New text arrived - check if we need to start/continue animation
    if (rawText.length > displayIndexRef.current) {
      setIsStreaming(true);

      // Start animation if not already running
      if (rafIdRef.current === null) {
        lastTickRef.current = performance.now();
        rafIdRef.current = requestAnimationFrame(animate);
      }
    }

    // Cleanup on unmount
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [rawText, status, enabled, animate, displayText]);

  // Skip to end function
  const skipToEnd = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    displayIndexRef.current = rawText.length;
    setDisplayText(rawText);
    setIsStreaming(false);
  }, [rawText]);

  return {
    displayText,
    isStreaming,
    skipToEnd,
  };
}
