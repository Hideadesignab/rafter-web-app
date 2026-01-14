// Message status
export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error';

// Message role
export type MessageRole = 'user' | 'assistant' | 'system';

// Source type for citations
export type SourceType = 'law' | 'document' | 'web' | 'internal';

// Confidence level for source reliability
export type SourceConfidence = 'high' | 'medium' | 'low';

// Source reference for message citations
export interface Source {
  id: string;
  type: SourceType;
  title: string;
  reference: string;
  excerpt?: string;
  url?: string;
  page?: number;
  confidence?: SourceConfidence;
}

// Message feedback type
export type MessageFeedback = 'positive' | 'negative';

// Chat message
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  sources?: Source[];
  timestamp: number;
  status: MessageStatus;
  feedback?: MessageFeedback;
}

// Conversation containing messages
export interface Conversation {
  id: string;
  title: string;
  projectId?: string;
  isArchived?: boolean;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// Document within a project
export interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: number;
}

// Project grouping conversations and documents
export interface Project {
  id: string;
  name: string;
  description?: string;
  documents: Document[];
}
