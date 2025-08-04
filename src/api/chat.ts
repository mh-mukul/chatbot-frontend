import { publicApiClient } from '@/lib/public-api-client';
import { apiClient } from '@/lib/api-client';
import { Chat, ChatHistory } from '@/components/chat/types';

interface SendMessageResponseData {
  id: number;
  session_id: string;
  human_message: string;
  ai_message: string;
  date_time: string;
  duration: number;
}

// Simple in-memory cache
const chatCache: {
  chatHistory?: { data: ChatHistory; timestamp: number };
  chatMessages: { [sessionId: string]: { data: Chat[]; timestamp: number } };
} = {
  chatMessages: {}
};

// Cache expiration time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

export async function fetchChatHistory(page: number = 1, limit: number = 50) {
  // Only use cache for the first page
  if (page === 1 && chatCache.chatHistory) {
    const now = Date.now();
    if (now - chatCache.chatHistory.timestamp < CACHE_EXPIRY) {
      return { status: 200, data: chatCache.chatHistory.data, message: "Success (cached)" };
    }
  }

  const response = await apiClient<ChatHistory>(`/api/v1/chat?page=${page}&limit=${limit}`, {
    method: 'GET',
  });

  if (response.status === 200 && response.data && page === 1) {
    chatCache.chatHistory = {
      data: response.data,
      timestamp: Date.now()
    };
  }

  return response;
}

export async function deleteChat(sessionId: string) {
  // Clear cache after deletion
  delete chatCache.chatMessages[sessionId];
  if (chatCache.chatHistory) {
    // Invalidate chat history cache since it will change
    chatCache.chatHistory = undefined;
  }

  return apiClient<any>(`/api/v1/chat?session_id=${sessionId}`, { // Type can be more specific if backend provides a response
    method: 'DELETE',
  });
}

export async function fetchChatMessages(sessionId: string) {
  // Check cache first
  if (chatCache.chatMessages[sessionId]) {
    const now = Date.now();
    if (now - chatCache.chatMessages[sessionId].timestamp < CACHE_EXPIRY) {
      return { status: 200, data: chatCache.chatMessages[sessionId].data, message: "Success (cached)" };
    }
  }

  const response = await apiClient<Chat[]>(`/api/v1/chat/session?session_id=${sessionId}`, {
    method: 'GET',
  });

  if (response.status === 200 && response.data) {
    chatCache.chatMessages[sessionId] = {
      data: response.data,
      timestamp: Date.now()
    };
  }

  return response;
}

export async function sendMessage(query: string, sessionId?: string) {
  // Invalidate cache for the session and history when sending a new message
  if (sessionId) {
    delete chatCache.chatMessages[sessionId];
  }
  chatCache.chatHistory = undefined;

  const requestBody: { query: string; session_id?: string } = {
    query: query,
  };

  if (sessionId) {
    requestBody.session_id = sessionId;
  }

  return apiClient<SendMessageResponseData>(`/api/v1/chat`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}

export async function shareChat(sessionId: string) {
  return apiClient<any>(`/api/v1/chat/share/${sessionId}`, {
    method: 'POST',
  });
}

export async function fetchSharedChat(sessionId: string) {
  return publicApiClient<Chat[]>(`/api/v1/chat/share/${sessionId}`, {
    method: 'GET',
  });
}

export async function getChatTitle(user_message: string, session_id: string) {
  const requestBody = {
    user_message,
    session_id,
  };

  return apiClient<any>(`/api/v1/chat/title`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}

export async function sendPositiveFeedback(messageId: number) {
  // Invalidate cache for chat history when sending feedback
  chatCache.chatHistory = undefined;

  // Update the message in all session caches
  Object.keys(chatCache.chatMessages).forEach(sessionId => {
    const sessionCache = chatCache.chatMessages[sessionId];
    if (sessionCache && sessionCache.data) {
      const updatedData = sessionCache.data.map(chat => {
        if (chat.id === messageId) {
          return {
            ...chat,
            positive_feedback: true,
            negative_feedback: false
          };
        }
        return chat;
      });
      chatCache.chatMessages[sessionId].data = updatedData;
    }
  });

  return apiClient<any>(`/api/v1/chat/feedback`, {
    method: 'POST',
    body: JSON.stringify({
      id: messageId,
      positive_feedback: true,
      negative_feedback: false,
    }),
  });
}

export async function sendNegativeFeedback(messageId: number) {
  // Invalidate cache for chat history when sending feedback
  chatCache.chatHistory = undefined;

  // Update the message in all session caches
  Object.keys(chatCache.chatMessages).forEach(sessionId => {
    const sessionCache = chatCache.chatMessages[sessionId];
    if (sessionCache && sessionCache.data) {
      const updatedData = sessionCache.data.map(chat => {
        if (chat.id === messageId) {
          return {
            ...chat,
            positive_feedback: false,
            negative_feedback: true
          };
        }
        return chat;
      });
      chatCache.chatMessages[sessionId].data = updatedData;
    }
  });

  return apiClient<any>(`/api/v1/chat/feedback`, {
    method: 'POST',
    body: JSON.stringify({
      id: messageId,
      positive_feedback: false,
      negative_feedback: true,
    }),
  });
}

export async function resubmitChat(chatId: number, sessionId: string, query: string) {
  // Invalidate cache for the session and history when resubmitting a message
  delete chatCache.chatMessages[sessionId];
  chatCache.chatHistory = undefined;

  return apiClient<SendMessageResponseData>(`/api/v1/chat/resubmit`, {
    method: 'POST',
    body: JSON.stringify({
      chat_id: chatId,
      session_id: sessionId,
      query: query
    }),
  });
}

export async function searchChats(query: string) {
  return apiClient<{
    status: number;
    message: string;
    data: Array<{
      session_id: string;
      title: string;
      user_id: number;
      date_time: string;
      shared_to_public: boolean;
    }>;
  }>(`/api/v1/chat/search?query=${encodeURIComponent(query)}`, {
    method: 'GET',
  });
}
