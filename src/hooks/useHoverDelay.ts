import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseHoverDelayOptions {
  /** Delay before showing (default: 300ms) */
  showDelay?: number;
  /** Delay before hiding (default: 150ms) */
  hideDelay?: number;
}

export interface UseHoverDelayReturn {
  /** Whether the hover state is visible */
  isVisible: boolean;
  /** Call on mouse enter */
  onMouseEnter: () => void;
  /** Call on mouse leave */
  onMouseLeave: () => void;
  /** Manually show */
  show: () => void;
  /** Manually hide */
  hide: () => void;
}

/**
 * Hook for managing hover state with configurable delays.
 * Useful for hover cards and tooltips that shouldn't flicker.
 */
export function useHoverDelay(
  options: UseHoverDelayOptions = {}
): UseHoverDelayReturn {
  const { showDelay = 300, hideDelay = 150 } = options;

  const [isVisible, setIsVisible] = useState(false);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  const show = useCallback(() => {
    clearTimeouts();
    setIsVisible(true);
  }, [clearTimeouts]);

  const hide = useCallback(() => {
    clearTimeouts();
    setIsVisible(false);
  }, [clearTimeouts]);

  const onMouseEnter = useCallback(() => {
    clearTimeouts();
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);
  }, [clearTimeouts, showDelay]);

  const onMouseLeave = useCallback(() => {
    clearTimeouts();
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  }, [clearTimeouts, hideDelay]);

  return {
    isVisible,
    onMouseEnter,
    onMouseLeave,
    show,
    hide,
  };
}
