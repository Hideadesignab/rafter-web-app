import { memo, useState, useMemo, useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { Message, Source, MessageFeedback } from '@/types';
import { useStreamingText } from '@/hooks/useStreamingText';
import { StreamingCursor } from './StreamingCursor';
import { TypingIndicator } from './TypingIndicator';
import { MessageActions } from './MessageActions';
import { MessageContent } from './MessageContent';
import { InlineCitation } from './InlineCitation';
import { SourcesList } from './SourcesList';
import { parseCitations, getSourceByCitationNumber } from '@/utils/parseCitations';

interface MessageBubbleProps {
  message: Message;
  conversationTitle?: string;
  index?: number;
  onRegenerate?: () => void;
  onSourceClick?: (source: Source) => void;
  onFeedback?: (messageId: string, feedback: MessageFeedback) => void;
}

/**
 * Message bubble component with streaming text support, inline citations,
 * visual states, and action bar.
 */
export const MessageBubble = memo(function MessageBubble({
  message,
  conversationTitle,
  index,
  onRegenerate,
  onSourceClick,
  onFeedback,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isPending = message.status === 'pending';
  const isStreamingStatus = message.status === 'streaming';
  const isComplete = message.status === 'complete';
  const isError = message.status === 'error';

  // Track which source is being hovered for highlighting
  const [hoveredSourceId, setHoveredSourceId] = useState<string | null>(null);

  // Use streaming text hook for assistant messages
  const { displayText, isStreaming } = useStreamingText(
    message.content,
    message.status,
    {
      enabled: isAssistant,
      charInterval: 8,
    }
  );

  // Determine which text to display
  const textToDisplay = isAssistant ? displayText : message.content;

  // Show cursor while streaming animation is active
  const showCursor = isAssistant && isStreaming;

  // Show typing indicator when streaming starts but no text yet
  const showTypingIndicator = isAssistant && isStreamingStatus && displayText.length === 0;

  // Show message actions when complete (for assistant messages)
  const showActions = isAssistant && isComplete && !isStreaming;

  // Show sources when complete and sources exist
  const showSources = isAssistant && isComplete && !isStreaming && message.sources && message.sources.length > 0;

  // State-based styling
  const stateStyles = useMemo(() => {
    if (isPending) {
      return {
        bubble: 'opacity-70 animate-pulse',
        showTimestamp: false,
      };
    }
    if (isStreamingStatus) {
      return {
        bubble: '',
        showTimestamp: false,
      };
    }
    if (isError) {
      return {
        bubble: 'bg-red-50 border-red-200',
        showTimestamp: true,
      };
    }
    // Complete or default
    return {
      bubble: '',
      showTimestamp: true,
    };
  }, [isPending, isStreamingStatus, isError]);

  // Hover handlers for citation highlighting
  const handleHoverStart = useCallback((sourceId: string) => {
    setHoveredSourceId(sourceId);
  }, []);

  const handleHoverEnd = useCallback(() => {
    setHoveredSourceId(null);
  }, []);

  // Handle feedback
  const handleFeedback = useCallback((feedback: MessageFeedback) => {
    onFeedback?.(message.id, feedback);
  }, [message.id, onFeedback]);

  // Parse and render content with inline citations
  const renderContent = useMemo(() => {
    // Use MessageContent for markdown rendering (user messages or streaming)
    if (isUser || isStreaming || !message.sources?.length) {
      return (
        <MessageContent content={textToDisplay} isStreaming={isStreaming} />
      );
    }

    // For complete assistant messages with sources, render with inline citations
    const segments = parseCitations(textToDisplay);

    return (
      <div className="text-sm leading-relaxed">
        {segments.map((segment, index) => {
          if (segment.type === 'text') {
            return <span key={index}>{segment.content}</span>;
          }

          const source = getSourceByCitationNumber(
            message.sources!,
            segment.citationNumber!
          );

          // Citation number doesn't match any source - render as plain text
          if (!source) {
            return <span key={index}>{segment.content}</span>;
          }

          return (
            <InlineCitation
              key={index}
              citationNumber={segment.citationNumber!}
              source={source}
              onHoverStart={() => handleHoverStart(source.id)}
              onHoverEnd={handleHoverEnd}
              onClick={() => onSourceClick?.(source)}
            />
          );
        })}
      </div>
    );
  }, [textToDisplay, message.sources, isUser, isStreaming, onSourceClick, handleHoverStart, handleHoverEnd]);

  return (
    <div
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
      style={{
        animation: `${isUser ? 'slideFromRight' : 'slideFromLeft'} 0.3s cubic-bezier(0, 0, 0.2, 1) both`,
        animationDelay: index !== undefined ? `${Math.min(index * 50, 300)}ms` : '0ms',
      }}
    >
      {/* Typing indicator above the bubble */}
      {!isUser && (
        <TypingIndicator visible={showTypingIndicator} />
      )}

      {/* Message bubble with group class for hover detection */}
      <div
        className={`
          group max-w-[70%] rounded-2xl
          ${isUser
            ? 'px-5 py-4 bg-gray-800 text-white rounded-br-md'
            : `px-5 py-4 bg-white text-gray-800 rounded-bl-md border border-gray-200 ${stateStyles.bubble}`
          }
        `}
      >
        {/* Message content */}
        <div className="whitespace-pre-wrap">
          {renderContent}
          <StreamingCursor visible={showCursor} />
        </div>

        {/* Sources list */}
        {showSources && (
          <SourcesList
            sources={message.sources!}
            activeSourceId={hoveredSourceId}
            onSourceClick={onSourceClick}
          />
        )}

        {/* Error state */}
        {isError && (
          <div className="mt-3 flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Något gick fel.</span>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="text-sm underline hover:no-underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Försök igen
              </button>
            )}
          </div>
        )}

        {/* Message actions (inside bubble, at bottom) */}
        {showActions && (
          <MessageActions
            message={message}
            conversationTitle={conversationTitle}
            onRegenerate={onRegenerate}
            onFeedback={handleFeedback}
          />
        )}
      </div>
    </div>
  );
});
