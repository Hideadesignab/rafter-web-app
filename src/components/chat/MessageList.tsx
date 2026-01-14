import { Fragment, useRef, useMemo } from 'react';
import type { Message, MessageFeedback } from '@/types';
import { useScrollManager } from '@/hooks/useScrollManager';
import { DateSeparator } from './DateSeparator';
import { ScrollToBottom } from './ScrollToBottom';
import { FollowUpSuggestions, getSuggestions } from './FollowUpSuggestions';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  conversationTitle?: string;
  onSuggestionSend?: (text: string) => void;
  onRegenerateMessage?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: MessageFeedback) => void;
}

/**
 * Check if we should show a date separator between two messages
 */
function shouldShowDateSeparator(
  current: Message,
  previous: Message | undefined
): boolean {
  if (!previous) return true;

  const currentDate = new Date(current.timestamp);
  const previousDate = new Date(previous.timestamp);

  return (
    currentDate.getFullYear() !== previousDate.getFullYear() ||
    currentDate.getMonth() !== previousDate.getMonth() ||
    currentDate.getDate() !== previousDate.getDate()
  );
}

export function MessageList({
  messages,
  conversationTitle,
  onSuggestionSend,
  onRegenerateMessage,
  onFeedback,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track messages length and last message content for scroll triggers
  const lastMessage = messages[messages.length - 1];
  const scrollDeps = useMemo(
    () => [
      messages.length,
      lastMessage?.content?.length ?? 0,
      lastMessage?.status,
    ],
    [messages.length, lastMessage?.content?.length, lastMessage?.status]
  );

  const { isAtBottom, scrollToBottom, sentinelRef } =
    useScrollManager(containerRef, scrollDeps);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto relative">
      <div className="max-w-[800px] mx-auto px-8 py-6 flex flex-col gap-6">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          const isAssistantComplete =
            message.role === 'assistant' && message.status === 'complete';
          const showSuggestions = isLast && isAssistantComplete && onSuggestionSend;

          return (
            <Fragment key={message.id}>
              {shouldShowDateSeparator(message, messages[index - 1]) && (
                <DateSeparator timestamp={message.timestamp} />
              )}
              <MessageBubble
                  message={message}
                  conversationTitle={conversationTitle}
                  index={index}
                  onRegenerate={
                    isLast && isAssistantComplete && onRegenerateMessage
                      ? () => onRegenerateMessage(message.id)
                      : undefined
                  }
                  onFeedback={onFeedback}
                />
              {showSuggestions && (
                <FollowUpSuggestions
                  suggestions={getSuggestions(message.content)}
                  onSend={onSuggestionSend}
                />
              )}
            </Fragment>
          );
        })}

        {/* Sentinel element for scroll detection */}
        <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
      </div>

      <ScrollToBottom visible={!isAtBottom} onClick={() => scrollToBottom()} />
    </div>
  );
}

// Export forceScrollOnNext capability for use when sending messages
export { useScrollManager };
