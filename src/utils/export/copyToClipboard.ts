import type { Message } from '@/types';
import type { ExportResult } from './types';
import { toPlainText, stripMarkdown } from './formatters';

/**
 * Copy message as plain text to clipboard.
 * Converts citations [1] to readable format and appends sources section.
 */
export async function copyToClipboard(message: Message): Promise<ExportResult> {
  try {
    const sources = message.sources || [];

    // Convert content with expanded citations
    let text = stripMarkdown(toPlainText(message.content, sources));

    // Append sources section if available
    if (sources.length > 0) {
      text += '\n\n---\nKällor:\n';
      sources.forEach((source, index) => {
        text += `[${index + 1}] ${source.title}`;
        if (source.reference) text += ` - ${source.reference}`;
        if (source.url) text += ` (${source.url})`;
        text += '\n';
      });
    }

    await navigator.clipboard.writeText(text);

    return { success: true };
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return {
      success: false,
      error: 'Kunde inte kopiera till urklipp',
    };
  }
}
