export async function login(phone: string, password: string): Promise<{ token?: string; message?: string }> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return { token: data.data.access_token, message: data.message };
    } else {
      return { message: data.message || 'Login failed' };
    }
  } catch (error) {
    console.error('Login API error:', error);
    return { message: 'Network error or server is unreachable' };
  }
}
