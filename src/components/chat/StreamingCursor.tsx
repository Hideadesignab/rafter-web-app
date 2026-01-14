interface StreamingCursorProps {
  visible: boolean;
}

/**
 * Blinking cursor shown during text streaming.
 * Uses step-end timing for classic terminal-style blink.
 */
export function StreamingCursor({ visible }: StreamingCursorProps) {
  if (!visible) return null;

  return (
    <span
      className="text-gray-400 animate-blink ml-0.5 select-none"
      aria-hidden="true"
    >
      ▌
    </span>
  );
}
