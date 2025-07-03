import { getAccessToken, attemptTokenRefresh, clearTokens, redirectToLogin } from './auth-utils';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ApiResponse<T> {
  status: number;
  data?: T;
  message?: string;
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  const accessToken = getAccessToken();
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    let response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      const refreshed = await attemptTokenRefresh();
      if (refreshed) {
        // Retry the original request with the new token
        const newAccessToken = getAccessToken();
        if (newAccessToken) {
          headers['Authorization'] = `Bearer ${newAccessToken}`;
        }
        response = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
      } else {
        // If refresh failed, auth-utils would have already redirected to login
        return { status: 401, message: 'Unauthorized: Token refresh failed' };
      }
    }

    const data = await response.json();

    if (response.ok) {
      return { status: response.status, data: data.data, message: data.message };
    } else {
      return { status: response.status, message: data.message || 'An error occurred' };
    }
  } catch (error) {
    console.error('API client error:', error);
    // If it's a network error and not a 401, we might still want to clear tokens
    // if the user is truly unauthenticated, but for now, let's assume
    // attemptTokenRefresh handles the 401 case.
    return { status: 500, message: 'Network error or server is unreachable' };
  }
}