const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const apiKey = process.env.NEXT_PUBLIC_API_KEY;

if (!baseUrl || !apiKey) {
  console.error("API Base URL or API Key not configured in .env");
  throw new Error("API Base URL or API Key not configured in .env");
}

export async function fetchChatHistory(userId: string, page: number = 1, limit: number = 50) {
  const url = `${baseUrl}/api/v1/chat?user_id=${userId}&page=${page}&limit=${limit}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': apiKey || '',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function deleteChat(sessionId: string) {
  const url = `${baseUrl}/api/v1/chat/${sessionId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': apiKey || '',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function fetchChatMessages(sessionId: string) {
  const url = `${baseUrl}/api/v1/chat/${sessionId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': apiKey || '',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function sendMessage(userId: string, query: string, sessionId?: string) {
  const requestBody: { user_id: string; query: string; session_id?: string } = {
    user_id: userId,
    query: query,
  };

  if (sessionId) {
    requestBody.session_id = sessionId;
  }

  const response = await fetch(`${baseUrl}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Authorization': apiKey || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
