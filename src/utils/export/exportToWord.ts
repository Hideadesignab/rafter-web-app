import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  ExternalHyperlink,
  Packer,
} from 'docx';
import { saveAs } from 'file-saver';
import type { Message } from '@/types';
import type { ExportResult, FormattedParagraph, FormattedSource } from './types';
import { generateFilename, formatContent } from './formatters';

/**
 * Map heading levels to docx HeadingLevel.
 */
function getHeadingLevel(level: number): (typeof HeadingLevel)[keyof typeof HeadingLevel] {
  const levels: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
  };
  return levels[level] || HeadingLevel.HEADING_3;
}

/**
 * Parse text with markdown formatting into TextRuns.
 */
function parseTextRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|[^*]+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const segment = match[1];

    if (segment.startsWith('**') && segment.endsWith('**')) {
      runs.push(new TextRun({
        text: segment.slice(2, -2),
        bold: true,
      }));
    } else if (segment.startsWith('*') && segment.endsWith('*')) {
      runs.push(new TextRun({
        text: segment.slice(1, -1),
        italics: true,
      }));
    } else if (segment) {
      runs.push(new TextRun(segment));
    }
  }

  return runs.length > 0 ? runs : [new TextRun(text)];
}

/**
 * Convert formatted paragraph to docx Paragraph.
 */
function createParagraph(paragraph: FormattedParagraph): Paragraph {
  if (paragraph.type === 'heading') {
    return new Paragraph({
      text: paragraph.content,
      heading: getHeadingLevel(paragraph.level || 2),
    });
  }

  if (paragraph.type === 'list-item') {
    return new Paragraph({
      bullet: { level: 0 },
      children: parseTextRuns(paragraph.content),
    });
  }

  // Regular text with potential formatting
  return new Paragraph({ children: parseTextRuns(paragraph.content) });
}

/**
 * Create sources section for the document.
 */
function createSourcesSection(sources: FormattedSource[]): Paragraph[] {
  if (sources.length === 0) return [];

  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: 'Källor',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400 },
    }),
  ];

  sources.forEach((source) => {
    const children: (TextRun | ExternalHyperlink)[] = [
      new TextRun({ text: `[${source.number}] `, bold: true }),
      new TextRun({ text: source.title, bold: true }),
    ];

    if (source.reference) {
      children.push(new TextRun({ text: ` - ${source.reference}` }));
    }

    if (source.page) {
      children.push(new TextRun({ text: `, s. ${source.page}` }));
    }

    paragraphs.push(new Paragraph({
      children,
      spacing: { after: 100 },
    }));

    // Add excerpt if available
    if (source.excerpt) {
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: `"${source.excerpt}"`,
            italics: true,
            size: 20,
          }),
        ],
        indent: { left: 720 },
        spacing: { after: 200 },
      }));
    }

    // Add URL if available
    if (source.url) {
      paragraphs.push(new Paragraph({
        children: [
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: source.url,
                style: 'Hyperlink',
              }),
            ],
            link: source.url,
          }),
        ],
        indent: { left: 720 },
        spacing: { after: 200 },
      }));
    }
  });

  return paragraphs;
}

/**
 * Export message to Word document (.docx).
 */
export async function exportToWord(
  message: Message,
  title?: string
): Promise<ExportResult> {
  try {
    const formatted = formatContent(message);
    const filename = generateFilename('docx');

    // Build document content
    const contentParagraphs = formatted.paragraphs.map(createParagraph);
    const sourcesParagraphs = createSourcesSection(formatted.sources);

    // Add header with title and date
    const headerParagraphs: Paragraph[] = [];

    if (title) {
      headerParagraphs.push(
        new Paragraph({
          text: title,
          heading: HeadingLevel.TITLE,
        })
      );
    }

    headerParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Genererat: ${new Date().toLocaleDateString('sv-SE')} ${new Date().toLocaleTimeString('sv-SE')}`,
            italics: true,
            color: '666666',
          }),
        ],
        spacing: { after: 400 },
      })
    );

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          ...headerParagraphs,
          ...contentParagraphs,
          ...sourcesParagraphs,
        ],
      }],
      styles: {
        paragraphStyles: [{
          id: 'Normal',
          name: 'Normal',
          run: {
            font: 'Arial',
            size: 24,
          },
          paragraph: {
            spacing: { line: 276 },
          },
        }],
      },
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);

    return { success: true, filename };
  } catch (error) {
    console.error('Failed to export to Word:', error);
    return {
      success: false,
      error: 'Kunde inte skapa Word-dokument',
    };
  }
}
