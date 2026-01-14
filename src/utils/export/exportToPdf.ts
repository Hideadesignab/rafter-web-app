import jsPDF from 'jspdf';
import type { Message } from '@/types';
import type { ExportResult, FormattedParagraph, FormattedSource } from './types';
import { generateFilename, formatContent } from './formatters';

const FONT_SIZES = {
  title: 18,
  h1: 16,
  h2: 14,
  h3: 12,
  body: 11,
  small: 9,
};

const COLORS = {
  text: '#1a1a1a',
  heading: '#0d0d0d',
  muted: '#666666',
  link: '#0066cc',
};

/**
 * PDF Generator class for cleaner state management.
 */
class PDFGenerator {
  private pdf: jsPDF;
  private yPosition: number;
  private leftMargin: number;
  private pageWidth: number;
  private pageHeight: number;
  private lineHeight: number;

  constructor() {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    this.leftMargin = 20;
    this.pageWidth = 210 - 40;
    this.pageHeight = 297;
    this.yPosition = 25;
    this.lineHeight = 6;
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.yPosition + requiredSpace > this.pageHeight - 20) {
      this.pdf.addPage();
      this.yPosition = 25;
    }
  }

  private setFont(style: 'normal' | 'bold' | 'italic', size: number): void {
    this.pdf.setFontSize(size);
    this.pdf.setFont('helvetica', style);
  }

  addTitle(text: string): void {
    this.setFont('bold', FONT_SIZES.title);
    this.pdf.setTextColor(COLORS.heading);
    this.pdf.text(text, this.leftMargin, this.yPosition);
    this.yPosition += 10;
  }

  addSubtitle(text: string): void {
    this.setFont('italic', FONT_SIZES.small);
    this.pdf.setTextColor(COLORS.muted);
    this.pdf.text(text, this.leftMargin, this.yPosition);
    this.yPosition += 10;
  }

  addParagraph(paragraph: FormattedParagraph): void {
    this.checkPageBreak(20);

    if (paragraph.type === 'heading') {
      const size = paragraph.level === 1 ? FONT_SIZES.h1
        : paragraph.level === 2 ? FONT_SIZES.h2
          : FONT_SIZES.h3;
      this.setFont('bold', size);
      this.pdf.setTextColor(COLORS.heading);
      this.yPosition += 4;
    } else if (paragraph.type === 'list-item') {
      this.setFont('normal', FONT_SIZES.body);
      this.pdf.setTextColor(COLORS.text);
      this.pdf.text('\u2022', this.leftMargin, this.yPosition);
    } else {
      this.setFont('normal', FONT_SIZES.body);
      this.pdf.setTextColor(COLORS.text);
    }

    const text = this.stripMarkdown(paragraph.content);
    const xOffset = paragraph.type === 'list-item' ? this.leftMargin + 5 : this.leftMargin;
    const maxWidth = paragraph.type === 'list-item' ? this.pageWidth - 5 : this.pageWidth;

    const lines = this.pdf.splitTextToSize(text, maxWidth);

    for (const line of lines) {
      this.checkPageBreak(this.lineHeight);
      this.pdf.text(line, xOffset, this.yPosition);
      this.yPosition += this.lineHeight;
    }

    this.yPosition += 2;
  }

  addSourcesSection(sources: FormattedSource[]): void {
    if (sources.length === 0) return;

    this.yPosition += 8;
    this.checkPageBreak(30);

    // Sources heading
    this.setFont('bold', FONT_SIZES.h2);
    this.pdf.setTextColor(COLORS.heading);
    this.pdf.text('Källor', this.leftMargin, this.yPosition);
    this.yPosition += 8;

    // Separator line
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(this.leftMargin, this.yPosition, this.leftMargin + this.pageWidth, this.yPosition);
    this.yPosition += 6;

    // Each source
    for (const source of sources) {
      this.checkPageBreak(20);

      // Source number and title
      this.setFont('bold', FONT_SIZES.body);
      this.pdf.setTextColor(COLORS.text);
      this.pdf.text(`[${source.number}] ${source.title}`, this.leftMargin, this.yPosition);
      this.yPosition += this.lineHeight;

      // Reference
      if (source.reference) {
        this.setFont('normal', FONT_SIZES.small);
        this.pdf.setTextColor(COLORS.muted);
        let refText = source.reference;
        if (source.page) refText += `, s. ${source.page}`;
        this.pdf.text(refText, this.leftMargin + 5, this.yPosition);
        this.yPosition += this.lineHeight;
      }

      // Excerpt
      if (source.excerpt) {
        this.setFont('italic', FONT_SIZES.small);
        this.pdf.setTextColor(COLORS.muted);
        const excerptLines = this.pdf.splitTextToSize(`"${source.excerpt}"`, this.pageWidth - 10);
        for (const line of excerptLines) {
          this.checkPageBreak(5);
          this.pdf.text(line, this.leftMargin + 5, this.yPosition);
          this.yPosition += 4.5;
        }
      }

      // URL
      if (source.url) {
        this.setFont('normal', FONT_SIZES.small);
        this.pdf.setTextColor(COLORS.link);
        this.pdf.textWithLink(source.url, this.leftMargin + 5, this.yPosition, { url: source.url });
        this.yPosition += this.lineHeight;
      }

      this.yPosition += 4;
    }
  }

  private stripMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1');
  }

  save(filename: string): void {
    this.pdf.save(filename);
  }
}

/**
 * Export message to PDF document.
 */
export async function exportToPdf(
  message: Message,
  title?: string
): Promise<ExportResult> {
  try {
    const formatted = formatContent(message);
    const filename = generateFilename('pdf');

    const generator = new PDFGenerator();

    // Add header
    if (title) {
      generator.addTitle(title);
    }
    generator.addSubtitle(
      `Genererat: ${new Date().toLocaleDateString('sv-SE')} ${new Date().toLocaleTimeString('sv-SE')}`
    );

    // Add content paragraphs
    for (const paragraph of formatted.paragraphs) {
      generator.addParagraph(paragraph);
    }

    // Add sources
    generator.addSourcesSection(formatted.sources);

    // Save
    generator.save(filename);

    return { success: true, filename };
  } catch (error) {
    console.error('Failed to export to PDF:', error);
    return {
      success: false,
      error: 'Kunde inte skapa PDF-dokument',
    };
  }
}
