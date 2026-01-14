import { useRef, useState, useEffect, useCallback } from 'react';
import type { RefObject } from 'react';

interface UseScrollManagerOptions {
  /** Threshold for considering user "at bottom" (pixels from bottom) */
  threshold?: number;
}

interface UseScrollManagerReturn {
  /** Whether the user is currently at the bottom of the scroll container */
  isAtBottom: boolean;
  /** Programmatically scroll to the bottom */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  /** Ref to attach to the sentinel element at the bottom of the list */
  sentinelRef: RefObject<HTMLDivElement | null>;
  /** Force scroll on next render (use when user sends a message) */
  forceScrollOnNext: () => void;
}

/**
 * Hook for managing scroll behavior in a chat-like interface.
 * Uses IntersectionObserver with a sentinel element for efficient scroll detection.
 *
 * @param containerRef - Ref to the scrollable container element
 * @param deps - Dependencies that should trigger auto-scroll check (e.g., messages array)
 * @param options - Configuration options
 */
export function useScrollManager(
  containerRef: RefObject<HTMLDivElement | null>,
  deps: unknown[],
  options: UseScrollManagerOptions = {}
): UseScrollManagerReturn {
  const { threshold = 10 } = options;

  const [isAtBottom, setIsAtBottom] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const forceScrollRef = useRef(false);
  const isInitialMount = useRef(true);

  // Set up IntersectionObserver to track sentinel visibility
  useEffect(() => {
    const container = containerRef.current;
    const sentinel = sentinelRef.current;

    if (!container || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtBottom(entry.isIntersecting);
      },
      {
        root: container,
        threshold: 0,
        rootMargin: `0px 0px ${threshold}px 0px`,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [containerRef, threshold]);

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, [containerRef]);

  // Force scroll on next render (for user-sent messages)
  const forceScrollOnNext = useCallback(() => {
    forceScrollRef.current = true;
  }, []);

  // Auto-scroll effect when dependencies change
  useEffect(() => {
    // On initial mount, scroll to bottom instantly
    if (isInitialMount.current) {
      isInitialMount.current = false;
      scrollToBottom('instant');
      return;
    }

    // If force scroll is set (user sent a message), always scroll
    if (forceScrollRef.current) {
      forceScrollRef.current = false;
      scrollToBottom('smooth');
      return;
    }

    // Otherwise, only scroll if user is at bottom
    if (isAtBottom) {
      scrollToBottom('smooth');
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isAtBottom,
    scrollToBottom,
    sentinelRef,
    forceScrollOnNext,
  };
}
