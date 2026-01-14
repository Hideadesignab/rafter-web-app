import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { EmptyState } from './EmptyState';
import { MessageList } from './MessageList';
import { MessageSkeleton } from './MessageSkeleton';

export function ChatContainer() {
  const { activeConversationId, conversations } = useChatStore();
  const { isLoading } = useUIStore();

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const messages = activeConversation?.messages ?? [];
  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex-1 bg-gray-50 relative overflow-hidden">
      {isLoading ? (
        <MessageSkeleton />
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <MessageList messages={messages} />
      )}
    </div>
  );
}
