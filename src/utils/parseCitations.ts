import type { Source } from '@/types';

export interface ParsedSegment {
  type: 'text' | 'citation';
  content: string;
  citationNumber?: number;
}

/**
 * Parse message content and identify citation patterns [1], [2], etc.
 */
export function parseCitations(content: string): ParsedSegment[] {
  const citationRegex = /\[(\d+)\]/g;
  const segments: ParsedSegment[] = [];
  let lastIndex = 0;
  let match;

  while ((match = citationRegex.exec(content)) !== null) {
    // Add text before citation
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
    }

    // Add citation
    segments.push({
      type: 'citation',
      content: match[0],
      citationNumber: parseInt(match[1], 10),
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  return segments;
}

/**
 * Get source by citation number (1-indexed, matches source.id)
 */
export function getSourceByCitationNumber(
  sources: Source[],
  citationNumber: number
): Source | undefined {
  return sources.find((s) => s.id === String(citationNumber));
}

/**
 * Truncate excerpt to max length with ellipsis
 */
export function truncateExcerpt(excerpt: string, maxLength = 100): string {
  if (excerpt.length <= maxLength) return excerpt;
  return excerpt.slice(0, maxLength).trim() + '...';
}
