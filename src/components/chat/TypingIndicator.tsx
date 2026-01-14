import { useState, useEffect } from 'react';

interface TypingIndicatorProps {
  visible: boolean;
}

/**
 * "Skriver..." indicator shown while AI is generating response.
 * Fades out with 200ms transition when complete.
 */
export function TypingIndicator({ visible }: TypingIndicatorProps) {
  const [shouldRender, setShouldRender] = useState(visible);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setIsAnimatingOut(false);
    } else if (shouldRender) {
      // Start fade out animation
      setIsAnimatingOut(true);
      // Remove from DOM after animation completes
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsAnimatingOut(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [visible, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className={`
        text-xs text-gray-400 italic mb-1
        ${isAnimatingOut ? 'animate-fadeOut' : 'animate-fadeIn'}
      `}
    >
      Skriver...
    </div>
  );
}
