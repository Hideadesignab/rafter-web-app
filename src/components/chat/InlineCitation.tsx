import { useRef, useState, useEffect } from 'react';
import type { Source } from '@/types';
import { useHoverDelay } from '@/hooks/useHoverDelay';
import { SourceHoverCard } from './SourceHoverCard';

interface InlineCitationProps {
  citationNumber: number;
  source: Source;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onClick?: () => void;
}

export function InlineCitation({
  citationNumber,
  source,
  onHoverStart,
  onHoverEnd,
  onClick,
}: InlineCitationProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const { isVisible, onMouseEnter, onMouseLeave } = useHoverDelay({
    showDelay: 300,
    hideDelay: 150,
  });

  // Calculate position when becoming visible
  useEffect(() => {
    if (isVisible && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCardPosition({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
  }, [isVisible]);

  // Notify parent of hover state changes
  useEffect(() => {
    if (isVisible) {
      onHoverStart?.();
    } else {
      onHoverEnd?.();
    }
  }, [isVisible, onHoverStart, onHoverEnd]);

  const handleClick = () => {
    if (source.url) {
      window.open(source.url, '_blank', 'noopener,noreferrer');
    }
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <>
      <span
        ref={ref}
        role="button"
        tabIndex={0}
        className="
          inline-block align-super
          text-[10px] text-neutral-600
          hover:bg-neutral-100 rounded-[3px]
          cursor-pointer px-[3px]
          transition-colors
          focus:outline-none focus:ring-1 focus:ring-neutral-300
        "
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Källa ${citationNumber}: ${source.title}`}
      >
        [{citationNumber}]
      </span>

      <SourceHoverCard
        source={source}
        visible={isVisible}
        position={cardPosition}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    </>
  );
}
