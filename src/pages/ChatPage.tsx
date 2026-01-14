import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { useTaskStore } from '@/stores/taskStore';
import { EmptyState } from '@/components/chat/EmptyState';
import { ChatInput } from '@/components/chat/ChatInput';
import { MessageList } from '@/components/chat/MessageList';
import { MessageSkeleton } from '@/components/chat/MessageSkeleton';
import { AppLayout } from '@/components/layout';
import { detectQueryType, getStepsForQuery, simulateTaskProgress } from '@/utils/taskSteps';
import { simulateStreaming } from '@/utils/simulateStreaming';
import type { Message } from '@/types';

export function ChatPage() {
  const [inputValue, setInputValue] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const {
    conversations,
    activeConversationId,
    createConversation,
    addMessage,
    updateMessage,
    updateConversation,
  } = useChatStore();

  const { isLoading, setLoading, setContextPanelOpen } = useUIStore();
  const { setSteps, updateStep, clearSteps } = useTaskStore();

  // Keep track of cleanup function for task simulation
  const cleanupRef = useRef<(() => void) | null>(null);

  // Get active conversation and its messages
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const messages = activeConversation?.messages ?? [];
  const isEmpty = messages.length === 0 && !isLoading;

  // Get sources from the last assistant message
  const lastAssistantMessage = useMemo(() => {
    return [...messages].reverse().find((m) => m.role === 'assistant');
  }, [messages]);
  const sources = lastAssistantMessage?.sources ?? [];

  // Show context panel when files attached or sources present
  const hasContextContent = pendingFiles.length > 0 || sources.length > 0;

  // Auto-open context panel when content is available
  useEffect(() => {
    if (hasContextContent) {
      setContextPanelOpen(true);
    }
  }, [hasContextContent, setContextPanelOpen]);

  // Handle sending a message
  const handleSend = useCallback(
    (message: string, _files: File[]) => {
      if (!message.trim()) return;

      let conversationId = activeConversationId;

      // If no active conversation, create one
      if (!conversationId) {
        const newConversation = createConversation();
        conversationId = newConversation.id;
      }

      // Add user message
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: Date.now(),
        status: 'complete',
      };
      addMessage(conversationId, userMessage);

      // Update conversation title from first message (if untitled)
      const conv = useChatStore.getState().conversations.find(c => c.id === conversationId);
      if (conv && conv.messages.length === 1 && conv.title === 'Ny konversation') {
        const title = message.slice(0, 50) + (message.length > 50 ? '...' : '');
        updateConversation(conversationId, { title });
      }

      // Clear input and files
      setInputValue('');
      setPendingFiles([]);

      // Detect query type and get appropriate steps
      const hasFiles = _files.length > 0;
      const queryType = detectQueryType(message, hasFiles);
      const steps = getStepsForQuery(queryType);

      // Show task progress and open context panel
      setContextPanelOpen(true);
      setSteps(steps);
      setLoading(true);

      // Clean up previous simulation if any
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      // Create AI message in streaming state (empty content initially)
      const aiMessageId = `msg-${Date.now() + 1}`;
      const aiMessage: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '', // Start empty for streaming effect
        timestamp: Date.now(),
        status: 'streaming',
        sources: [
          {
            id: '1',
            type: 'law',
            title: '12 kap. 4§ Jordabalken',
            reference: 'Hyreslagen',
            excerpt: 'Hyresavtal som gäller för obestämd tid kan sägas upp att upphöra att gälla vid det månadsskifte som inträffar närmast efter tre månader från uppsägningen.',
            url: 'https://lagen.nu/1970:994#K12P4',
            confidence: 'high',
          },
          {
            id: '2',
            type: 'document',
            title: 'hyresavtal-302.pdf',
            reference: 'Uppladdad 2025-01-10',
            excerpt: 'Uppsägningstiden för detta avtal är tre kalendermånader.',
            page: 4,
            confidence: 'medium',
          },
          {
            id: '3',
            type: 'web',
            title: 'Hyresgästföreningen - Besittningsskydd',
            reference: 'hyresgastforeningen.se',
            excerpt: 'Besittningsskydd innebär att du som hyresgäst har rätt att bo kvar i din lägenhet trots att hyresvärden vill säga upp dig.',
            url: 'https://www.hyresgastforeningen.se/besittningsskydd',
            confidence: 'high',
          },
        ],
      };
      addMessage(conversationId!, aiMessage);

      // Full response text with citation markers (in production this comes from the API)
      const fullResponse =
        'Enligt hyreslagen[1] har hyresgästen besittningsskydd efter att ha bott i lägenheten i minst två år. Uppsägningstiden i ditt hyresavtal är tre kalendermånader[2]. För mer information om besittningsskydd och dina rättigheter som hyresgäst, se Hyresgästföreningens guide[3].';

      // Track cleanup functions
      let streamingCleanup: (() => void) | null = null;
      let taskCleanup: (() => void) | null = null;

      // Simulate task progress with realistic timing
      taskCleanup = simulateTaskProgress(
        steps,
        updateStep,
        () => {
          // When task progress completes, start streaming the response
          streamingCleanup = simulateStreaming(
            fullResponse,
            {
              onChunk: (text) => {
                updateMessage(conversationId!, aiMessageId, { content: text });
              },
              onComplete: () => {
                updateMessage(conversationId!, aiMessageId, { status: 'complete' });
                setLoading(false);

                // Clear task progress after a short delay
                setTimeout(() => {
                  clearSteps();
                }, 2000);
              },
            },
            {
              minChunkSize: 5,
              maxChunkSize: 20,
              minDelay: 50,
              maxDelay: 150,
            }
          );
        }
      );

      // Combined cleanup function
      cleanupRef.current = () => {
        taskCleanup?.();
        streamingCleanup?.();
      };
    },
    [activeConversationId, createConversation, addMessage, updateMessage, updateConversation, setLoading, setContextPanelOpen, setSteps, updateStep, clearSteps]
  );

  // Handle suggestion click - populate input instead of sending
  const handleSuggestionClick = useCallback((prompt: string) => {
    setInputValue(prompt);
    // Focus input after populating
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      textarea?.focus();
    }, 0);
  }, []);

  // Handle follow-up suggestion from MessageList
  const handleSuggestionSend = useCallback(
    (text: string) => {
      handleSend(text, []);
    },
    [handleSend]
  );

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // ⌘K / Ctrl+K: Focus search
      if (modifier && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        searchInput?.focus();
      }

      // ⌘N / Ctrl+N: New conversation
      if (modifier && e.key === 'n') {
        e.preventDefault();
        createConversation();
      }

      // Escape: Clear input or close modals
      if (e.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement?.tagName === 'TEXTAREA' || activeElement?.tagName === 'INPUT') {
          activeElement.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createConversation]);

  // Cleanup task simulation on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return (
    <AppLayout attachedFiles={pendingFiles} sources={sources}>
      <div className="flex h-full w-full flex-col bg-white">
        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && messages.length === 0 ? (
            <MessageSkeleton />
          ) : isEmpty ? (
            <EmptyState onSuggestionClick={handleSuggestionClick} />
          ) : (
            <MessageList
              messages={messages}
              onSuggestionSend={handleSuggestionSend}
            />
          )}
        </div>

        {/* Chat input - fixed at bottom */}
        <ChatInput
          onSend={handleSend}
          value={inputValue}
          onValueChange={setInputValue}
          onFilesChange={setPendingFiles}
          disabled={isLoading}
        />
      </div>
    </AppLayout>
  );
}
