const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const apiKey = process.env.NEXT_PUBLIC_API_KEY;

if (!baseUrl || !apiKey) {
  console.error("API Base URL or API Key not configured in .env");
  throw new Error("API Base URL or API Key not configured in .env");
}

function getAuthHeaders() {
  const jwtToken = typeof window !== 'undefined' ? sessionStorage.getItem('jwtToken') : null;
  if (!jwtToken) {
    throw new Error("JWT token not found. User not authenticated.");
  }
  return {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json',
  };
}

// Helper function to handle unauthorized responses
async function handleUnauthorized(response: Response) {
  if (response.status === 401 || response.status === 403) {
    console.error("Unauthorized or Forbidden: Token expired or invalid. Redirecting to login.");
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('jwtToken');
      window.location.href = '/login'; // Redirect to login page
    }
    return true; // Indicate that a redirect is happening
  }
  return false; // Indicate no redirect
}

export async function fetchChatHistory(page: number = 1, limit: number = 50) {
  const url = `${baseUrl}/api/v1/chat?page=${page}&limit=${limit}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (await handleUnauthorized(response)) {
    throw new Error("Unauthorized access, redirecting to login.");
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function deleteChat(sessionId: string) {
  const url = `${baseUrl}/api/v1/chat/${sessionId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (await handleUnauthorized(response)) {
    throw new Error("Unauthorized access, redirecting to login.");
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function fetchChatMessages(sessionId: string) {
  const url = `${baseUrl}/api/v1/chat/${sessionId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (await handleUnauthorized(response)) {
    throw new Error("Unauthorized access, redirecting to login.");
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function sendMessage(query: string, sessionId?: string) {
  const requestBody: { query: string; session_id?: string } = {
    query: query,
  };

  if (sessionId) {
    requestBody.session_id = sessionId;
  }

  const response = await fetch(`${baseUrl}/api/v1/chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody),
  });

  if (await handleUnauthorized(response)) {
    throw new Error("Unauthorized access, redirecting to login.");
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
