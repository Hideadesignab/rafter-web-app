import { useState, useCallback } from 'react';
import type { Message } from '@/types';
import type { ExportFormat, ExportResult } from '@/utils/export';
import {
  copyToClipboard,
  exportToWord,
  exportToPdf,
  sendViaEmail,
} from '@/utils/export';

interface UseExportReturn {
  isExporting: boolean;
  exportFormat: ExportFormat | null;
  lastResult: ExportResult | null;
  exportMessage: (message: Message, format: ExportFormat, title?: string) => Promise<ExportResult>;
  clearResult: () => void;
}

/**
 * Hook for managing export operations with loading state.
 */
export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null);
  const [lastResult, setLastResult] = useState<ExportResult | null>(null);

  const exportMessage = useCallback(
    async (
      message: Message,
      format: ExportFormat,
      title?: string
    ): Promise<ExportResult> => {
      setIsExporting(true);
      setExportFormat(format);
      setLastResult(null);

      let result: ExportResult;

      try {
        switch (format) {
          case 'text':
            result = await copyToClipboard(message);
            break;
          case 'word':
            result = await exportToWord(message, title);
            break;
          case 'pdf':
            result = await exportToPdf(message, title);
            break;
          case 'email':
            result = sendViaEmail(message, title);
            break;
          default:
            result = { success: false, error: 'Okänt exportformat' };
        }
      } catch (error) {
        result = {
          success: false,
          error: error instanceof Error ? error.message : 'Export misslyckades',
        };
      }

      setLastResult(result);
      setIsExporting(false);
      setExportFormat(null);

      return result;
    },
    []
  );

  const clearResult = useCallback(() => {
    setLastResult(null);
  }, []);

  return {
    isExporting,
    exportFormat,
    lastResult,
    exportMessage,
    clearResult,
  };
}
