import type { Message } from '@/types';
import type { ExportResult } from './types';
import { toPlainText, stripMarkdown } from './formatters';

/**
 * Open email client with message content.
 * Uses mailto: protocol.
 */
export function sendViaEmail(
  message: Message,
  subject?: string
): ExportResult {
  try {
    const sources = message.sources || [];

    // Build plain text body
    let body = stripMarkdown(toPlainText(message.content, sources));

    // Add sources section
    if (sources.length > 0) {
      body += '\n\n---\nKällor:\n';
      sources.forEach((source, index) => {
        body += `[${index + 1}] ${source.title}`;
        if (source.reference) body += ` - ${source.reference}`;
        if (source.url) body += `\n    ${source.url}`;
        body += '\n';
      });
    }

    // Add footer
    body += '\n---\nGenererat med Rafter AI';

    // Build mailto URL
    const emailSubject = subject || 'Svar från Rafter';
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;

    // Open email client
    window.location.href = mailtoUrl;

    return { success: true };
  } catch (error) {
    console.error('Failed to open email client:', error);
    return {
      success: false,
      error: 'Kunde inte öppna e-postklient',
    };
  }
}
