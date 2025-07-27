import { publicApiClient } from '@/lib/public-api-client';
import { apiClient } from '@/lib/api-client';
import { Chat, ChatHistory } from '@/components/chat/types';

interface SendMessageResponseData {
  session_id: string;
  response: string;
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

  return apiClient<any>(`/api/v1/chat/${sessionId}`, { // Type can be more specific if backend provides a response
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

  const response = await apiClient<Chat[]>(`/api/v1/chat/${sessionId}`, {
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
