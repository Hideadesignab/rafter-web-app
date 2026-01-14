import type { Message, Source } from '@/types';
import type { FormattedContent, FormattedParagraph, FormattedSource } from './types';

/**
 * Generate Swedish filename with timestamp.
 * Format: svar-YYYYMMDD-HHMM.ext
 */
export function generateFilename(extension: 'docx' | 'pdf'): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `svar-${timestamp}.${extension}`;
}

/**
 * Convert message content to plain text with inline citations expanded.
 * Citations [1] become "(Källa 1: Title)"
 */
export function toPlainText(content: string, sources: Source[]): string {
  return content.replace(/\[(\d+)\]/g, (match, num) => {
    const sourceIndex = parseInt(num, 10) - 1;
    const source = sources[sourceIndex];
    if (source) {
      return `(Källa ${num}: ${source.title})`;
    }
    return match;
  });
}

/**
 * Strip markdown formatting for plain text output.
 */
export function stripMarkdown(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
    .replace(/\*(.*?)\*/g, '$1')       // Italic
    .replace(/`(.*?)`/g, '$1')         // Inline code
    .replace(/^#+\s+/gm, '')           // Headings
    .replace(/^[-*]\s+/gm, '- ')       // List items
    .trim();
}

/**
 * Parse markdown content into structured paragraphs.
 */
export function parseMarkdownParagraphs(content: string): FormattedParagraph[] {
  const lines = content.split('\n');
  const paragraphs: FormattedParagraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      paragraphs.push({
        type: 'heading',
        content: headingMatch[2],
        level: headingMatch[1].length,
      });
      continue;
    }

    // List items
    if (trimmed.match(/^[-*]\s+/)) {
      paragraphs.push({
        type: 'list-item',
        content: trimmed.replace(/^[-*]\s+/, ''),
      });
      continue;
    }

    // Regular text
    paragraphs.push({
      type: 'text',
      content: trimmed,
    });
  }

  return paragraphs;
}

/**
 * Format sources for export with numbered references.
 */
export function formatSources(sources: Source[]): FormattedSource[] {
  return sources.map((source, index) => ({
    number: index + 1,
    title: source.title,
    reference: source.reference,
    excerpt: source.excerpt,
    url: source.url,
    page: source.page,
  }));
}

/**
 * Full content formatting pipeline.
 */
export function formatContent(message: Message): FormattedContent {
  const sources = message.sources || [];

  return {
    plainText: stripMarkdown(toPlainText(message.content, sources)),
    paragraphs: parseMarkdownParagraphs(message.content),
    sources: formatSources(sources),
  };
}
