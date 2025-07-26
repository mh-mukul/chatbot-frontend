const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ApiResponse<T> {
  status: number;
  data?: T;
  message?: string;
}

export async function publicApiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (response.ok) {
      return { status: response.status, data: data.data, message: data.message };
    } else {
      return { status: response.status, message: data.message || 'An error occurred' };
    }
  } catch (error) {
    console.error('Public API client error:', error);
    return { status: 500, message: 'Network error or server is unreachable' };
  }
}