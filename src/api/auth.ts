import { apiClient } from '@/lib/api-client';
import { getRefreshToken, redirectToLogin } from '@/lib/auth-utils';

import { LoginResponse } from '@/components/chat/types';

export async function login(phone: string, password: string): Promise<{ accessToken?: string; refreshToken?: string; message?: string; user?: LoginResponse['data']['user'] }> {
  const response = await apiClient<LoginResponse['data']>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });

  if (response.status === 200 && response.data) {
    return { accessToken: response.data.access_token, refreshToken: response.data.refresh_token, message: response.message, user: response.data.user };
  } else {
    return { message: response.message || 'Login failed' };
  }
}

export async function logout(): Promise<{ success: boolean; message?: string }> {
  const refreshToken = getRefreshToken(); // Get refresh token locally

  if (!refreshToken) {
    // If no refresh token, we've already cleared local state, so consider it a success.
    // No need to call backend if no token to send.
    redirectToLogin(); // Ensure redirection if not already
    return { success: true, message: 'Logged out successfully (no refresh token found).' };
  }

  try {
    const response = await apiClient('/api/v1/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.status === 200) {
      return { success: true, message: response.message };
    } else {
      // Even if backend logout fails, local tokens are cleared.
      // We should still redirect to login if not already.
      redirectToLogin();
      return { success: true, message: response.message || 'Logout failed on server, but local session cleared.' };
    }
  } catch (error) {
    console.error('Error during logout API call:', error);
    // Even if network error, local tokens are cleared.
    redirectToLogin();
    return { success: true, message: 'Network error during logout, but local session cleared.' };
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken?: string; refreshToken?: string; message?: string }> {
  const response = await apiClient<{ access_token: string; refresh_token: string }>('/api/v1/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (response.status === 200 && response.data) {
    return { accessToken: response.data.access_token, refreshToken: response.data.refresh_token, message: response.message };
  } else {
    return { message: response.message || 'Failed to refresh token' };
  }
}
export async function passwordReset(current_password: string, new_password: string): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient('/api/v1/auth/password-reset', {
    method: 'POST',
    body: JSON.stringify({ current_password, new_password }),
  });

  if (response.status === 200) {
    return { success: true, message: response.message };
  } else {
    return { success: false, message: response.message || 'Password reset failed' };
  }
}