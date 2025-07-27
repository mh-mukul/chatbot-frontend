export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isGenerating?: boolean;
  createdAt: number;
  chat_metadata?: {
    duration?: number;
  };
}

export interface Conversation {
  id: string;
  title: string | null;
  messages: Message[];
  date_time?: string;
}

export interface ChatMessageContent {
  type: 'human' | 'ai';
  content: string;
}

export interface Chat {
  id: number;
  session_id: string;
  user_id: number;
  message: ChatMessageContent;
  date_time: string;
  chat_metadata: Record<string, any>;
}

export interface Pagination {
  current_page: number;
  total_pages: number;
  total_records: number;
  record_per_page: number;
  previous_page_url: string | null;
  next_page_url: string | null;
}

export interface Session {
  session_id: string;
  title: string | null;
  user_id: number;
  date_time: string;
  shared_to_public: boolean;
}

export interface ChatHistory {
  sessions: Session[];
  pagination: Pagination;
}

export interface ChatHistoryResponse {
  status: number;
  message: string;
  data: ChatHistory;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  image_url: string;
}

export interface LoginResponse {
  status: number;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    user: User;
  };
}
