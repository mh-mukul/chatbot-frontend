export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isGenerating?: boolean;
  suggestedQuestions?: string[];
}

export interface Conversation {
  id: string;
  title: string;
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

export interface ChatData {
  chats: Chat[];
  pagination: Pagination;
}

export interface ChatHistoryResponse {
  status: number;
  message: string;
  data: ChatData;
}
