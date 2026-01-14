import type { Message, Source } from '@/types';

export type ExportFormat = 'text' | 'word' | 'pdf' | 'email';

export interface ExportOptions {
  includeTimestamp?: boolean;
  includeSources?: boolean;
  includeConversationTitle?: boolean;
}

export interface ExportContent {
  title?: string;
  message: Message;
  sources: Source[];
  timestamp: number;
}

export interface ExportResult {
  success: boolean;
  error?: string;
  filename?: string;
}

export interface FormattedParagraph {
  type: 'heading' | 'text' | 'list-item';
  content: string;
  level?: number;
}

export interface FormattedSource {
  number: number;
  title: string;
  reference: string;
  excerpt?: string;
  url?: string;
  page?: number;
}

export interface FormattedContent {
  plainText: string;
  paragraphs: FormattedParagraph[];
  sources: FormattedSource[];
}
