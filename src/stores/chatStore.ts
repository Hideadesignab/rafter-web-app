import { create } from 'zustand';
import type { Conversation, Message, MessageFeedback, Project } from '@/types';

interface ChatStore {
  conversations: Conversation[];
  projects: Project[];
  activeConversationId: string | null;

  // Conversation actions
  setActiveConversation: (id: string | null) => void;
  addConversation: (conversation: Conversation) => void;
  createConversation: (title?: string, projectId?: string) => Conversation;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  setMessageFeedback: (conversationId: string, messageId: string, feedback: MessageFeedback) => void;

  // Project actions
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  projects: [],
  activeConversationId: null,

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [...state.conversations, conversation],
    })),

  createConversation: (title = 'Ny konversation', projectId) => {
    const now = Date.now();
    const conversation: Conversation = {
      id: `conv-${now}`,
      title,
      projectId,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      activeConversationId: conversation.id,
    }));
    return conversation;
  },

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates, updatedAt: Date.now() } : conv
      ),
    })),

  deleteConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((conv) => conv.id !== id),
      activeConversationId:
        state.activeConversationId === id ? null : state.activeConversationId,
    })),

  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, message], updatedAt: Date.now() }
          : conv
      ),
    })),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === messageId ? { ...msg, ...updates } : msg
              ),
              updatedAt: Date.now(),
            }
          : conv
      ),
    })),

  setMessageFeedback: (conversationId, messageId, feedback) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === messageId
                  ? { ...msg, feedback: msg.feedback === feedback ? undefined : feedback }
                  : msg
              ),
            }
          : conv
      ),
    })),

  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project],
    })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((proj) =>
        proj.id === id ? { ...proj, ...updates } : proj
      ),
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((proj) => proj.id !== id),
      // Unlink conversations from deleted project
      conversations: state.conversations.map((conv) =>
        conv.projectId === id ? { ...conv, projectId: undefined } : conv
      ),
    })),
}));
