import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

interface MessageContentProps {
  content: string;
  isStreaming: boolean;
}

/**
 * Message content component with markdown rendering.
 * Handles incomplete markdown during streaming gracefully.
 */
export function MessageContent({ content, isStreaming }: MessageContentProps) {
  // Process content: handle incomplete markdown during streaming
  const processedContent = useMemo(() => {
    if (!isStreaming) return content;
    return sanitizeIncompleteMarkdown(content);
  }, [content, isStreaming]);

  // Custom components for markdown rendering
  const components: Components = useMemo(() => ({
    // Bold text
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),

    // Emphasis/italic
    em: ({ children }) => (
      <em className="italic">{children}</em>
    ),

    // Unordered lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 my-2">{children}</ul>
    ),

    // Ordered lists
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 my-2">{children}</ol>
    ),

    // List items
    li: ({ children }) => (
      <li className="text-sm leading-relaxed">{children}</li>
    ),

    // Inline code
    code: ({ children, className }) => {
      // Check if it's a code block (has language class) or inline
      const isBlock = className?.includes('language-');

      if (isBlock) {
        return (
          <code className="text-sm font-mono">{children}</code>
        );
      }

      return (
        <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono text-gray-800">
          {children}
        </code>
      );
    },

    // Code blocks
    pre: ({ children }) => (
      <pre className="p-3 bg-gray-100 rounded-md overflow-x-auto my-2 text-sm">
        {children}
      </pre>
    ),

    // Paragraphs
    p: ({ children }) => (
      <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
    ),

    // Headings (rarely used in chat but supported)
    h1: ({ children }) => (
      <h1 className="text-lg font-semibold text-gray-900 mb-2">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-base font-semibold text-gray-900 mb-2">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{children}</h3>
    ),

    // Links
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {children}
      </a>
    ),

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 my-2 text-gray-600 italic">
        {children}
      </blockquote>
    ),

    // Horizontal rules
    hr: () => (
      <hr className="my-4 border-gray-200" />
    ),
  }), []);

  return (
    <div className="text-base leading-relaxed prose-sm max-w-none">
      <ReactMarkdown components={components}>
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Handle incomplete markdown during streaming.
 * Closes unclosed formatting markers to prevent rendering issues.
 */
function sanitizeIncompleteMarkdown(content: string): string {
  let result = content;

  // Count and close unclosed bold markers (**)
  const boldMatches = result.match(/\*\*/g) || [];
  if (boldMatches.length % 2 !== 0) {
    result = result + '**';
  }

  // Count and close unclosed italic markers (single *)
  // Be careful not to count ** as two *
  const withoutBold = result.replace(/\*\*/g, '');
  const italicMatches = withoutBold.match(/\*/g) || [];
  if (italicMatches.length % 2 !== 0) {
    result = result + '*';
  }

  // Count and close unclosed inline code markers (`)
  const codeMatches = result.match(/`/g) || [];
  if (codeMatches.length % 2 !== 0) {
    result = result + '`';
  }

  return result;
}
