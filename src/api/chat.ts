import { apiClient } from '@/lib/api-client';
import { Chat, ChatData, Pagination } from '@/components/chat/types';

interface SendMessageResponseData {
  session_id: string;
  response: string;
  duration: number;
}

export async function fetchChatHistory(page: number = 1, limit: number = 50) {
  return apiClient<ChatData>(`/api/v1/chat?page=${page}&limit=${limit}`, {
    method: 'GET',
  });
}

export async function deleteChat(sessionId: string) {
  return apiClient<any>(`/api/v1/chat/${sessionId}`, { // Type can be more specific if backend provides a response
    method: 'DELETE',
  });
}

export async function fetchChatMessages(sessionId: string) {
  return apiClient<Chat[]>(`/api/v1/chat/${sessionId}`, {
    method: 'GET',
  });
}

export async function sendMessage(query: string, sessionId?: string) {
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
