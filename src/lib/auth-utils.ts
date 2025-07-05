import { refreshAccessToken } from '@/api/auth';

export function getAccessToken(): string | null {
  return sessionStorage.getItem('accessToken');
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem('refreshToken');
}

export function setTokens(accessToken: string, refreshToken: string): void {
  sessionStorage.setItem('accessToken', accessToken);
  sessionStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens(): void {
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
}

export function redirectToLogin(): void {
  clearTokens(); // Ensure tokens are cleared immediately before redirection
  window.location.href = '/login';
}

export function redirectToChat(sessionId?: string): void {
  const url = sessionId ? `/chat/${sessionId}` : '/chat';
  window.location.href = url;
}

let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

export async function attemptTokenRefresh(): Promise<boolean> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    redirectToLogin();
    processQueue('No refresh token available');
    isRefreshing = false;
    return false;
  }

  try {
    const response = await refreshAccessToken(refreshToken);
    if (response.accessToken && response.refreshToken) {
      setTokens(response.accessToken, response.refreshToken);
      processQueue(null);
      return true;
    } else {
      redirectToLogin();
      processQueue(response.message || 'Failed to refresh token');
      return false;
    }
  } catch (error) {
    console.error('Error during token refresh attempt:', error); // Keep this log
    redirectToLogin();
    processQueue(error);
    return false;
  } finally {
    isRefreshing = false;
  }
}