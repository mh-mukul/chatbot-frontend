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
}
