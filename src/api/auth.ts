import { apiClient } from '@/lib/api-client';

export async function login(phone: string, password: string): Promise<{ accessToken?: string; refreshToken?: string; message?: string }> {
  const response = await apiClient<{ access_token: string; refresh_token: string }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });

  if (response.status === 200 && response.data) {
    return { accessToken: response.data.access_token, refreshToken: response.data.refresh_token, message: response.message };
  } else {
    return { message: response.message || 'Login failed' };
  }
}

export async function logout(refreshToken: string): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient('/api/v1/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (response.status === 200) {
    return { success: true, message: response.message };
  } else {
    return { success: false, message: response.message || 'Logout failed' };
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