import { getAccessToken, attemptTokenRefresh, redirectToLogin } from './auth-utils';

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
      // If the current request is for refreshing the token and it returns 401,
      // it means the refresh token itself is invalid/expired.
      // In this case, do NOT attempt to refresh again. Just clear and redirect.
      if (endpoint === '/api/v1/auth/refresh-token') {
        redirectToLogin(); // This handles clearTokens()
        return { status: 401, message: 'Unauthorized: Refresh token expired.' };
      }

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
        redirectToLogin(); // This now handles clearTokens()
        return { status: 401, message: 'Unauthorized: Token refresh failed and redirected to login.' };
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
    // If a network error occurs, and we have tokens, it's safer to clear and redirect.
    // This prevents the app from being stuck if the server is down or unreachable
    // and the user's session might implicitly be invalid.
    if (getAccessToken()) { // Only redirect if we actually had tokens
      redirectToLogin(); // This now handles clearTokens()
    }
    return { status: 500, message: 'Network error or server is unreachable' };
  }
}