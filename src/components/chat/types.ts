export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isGenerating?: boolean;
  createdAt: number;
  duration?: number;
  originalId?: number; // To keep track of the original message ID for feedback
  positiveFeedback?: boolean;
  negativeFeedback?: boolean;
}

export interface Conversation {
  id: string;
  title: string | null;
  messages: Message[];
  date_time?: string;
}

export interface Chat {
  id: number;
  session_id: string;
  human_message: string;
  ai_message: string;
  date_time: string;
  duration: number;
  positive_feedback: boolean;
  negative_feedback: boolean;
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
