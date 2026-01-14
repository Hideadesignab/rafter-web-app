import { useEffect, useCallback } from 'react';
import type { Conversation } from '@/types';

interface UseSidebarKeyboardProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  sidebarOpen: boolean;
}

export function useSidebarKeyboard({
  conversations,
  activeConversationId,
  onSelectConversation,
  sidebarOpen,
}: UseSidebarKeyboardProps) {
  const navigateConversations = useCallback(
    (direction: 'up' | 'down') => {
      if (conversations.length === 0) return;

      const currentIndex = activeConversationId
        ? conversations.findIndex((c) => c.id === activeConversationId)
        : -1;

      let nextIndex: number;
      if (direction === 'down') {
        nextIndex = currentIndex < conversations.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : conversations.length - 1;
      }

      onSelectConversation(conversations[nextIndex].id);
    },
    [conversations, activeConversationId, onSelectConversation]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle when sidebar is open and no input is focused
      if (!sidebarOpen) return;

      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement;

      if (isInputFocused) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          navigateConversations('down');
          break;
        case 'ArrowUp':
          e.preventDefault();
          navigateConversations('up');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, navigateConversations]);
}
