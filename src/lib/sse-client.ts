import { getAccessToken, attemptTokenRefresh, redirectToLogin } from './auth-utils';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface StreamingResponse {
    done: boolean;
    text?: string;
    fullResponse?: any;
}

export async function* createEventSourceStream(
    endpoint: string,
    options?: RequestInit,
    onComplete?: (data: any) => void
): AsyncGenerator<StreamingResponse, void, unknown> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string> || {}),
    };

    const accessToken = getAccessToken();
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        // Check if endpoint is a full URL (starts with http:// or https://)
        const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
            ? endpoint
            : `${BASE_URL}${endpoint}`;

        console.log(`SSE Client: Fetching from URL: ${url}`);

        let response = await fetch(url, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            if (endpoint === '/api/v1/auth/refresh-token') {
                redirectToLogin();
                throw new Error('Unauthorized: Refresh token expired.');
            }

            const refreshed = await attemptTokenRefresh();
            if (refreshed) {
                const newAccessToken = getAccessToken();
                if (newAccessToken) {
                    headers['Authorization'] = `Bearer ${newAccessToken}`;
                }
                response = await fetch(`${BASE_URL}${endpoint}`, {
                    ...options,
                    headers,
                });
            } else {
                redirectToLogin();
                throw new Error('Unauthorized: Token refresh failed.');
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        if (!response.body) {
            throw new Error('ReadableStream not supported');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        console.log('SSE Client: Stream connection established');

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log('SSE Client: Stream completed');
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // Process complete SSE events in the buffer
            let processBuffer = buffer;
            buffer = '';

            const events = processBuffer.split('\n\n');
            // If the last chunk is incomplete, put it back in the buffer
            if (!processBuffer.endsWith('\n\n') && events.length > 0) {
                buffer = events.pop() || '';
            }

            for (const event of events) {
                if (!event.trim()) continue;

                const lines = event.split('\n');
                const eventType = lines.find(line => line.startsWith('event:'))?.substring(6).trim();
                const dataLine = lines.find(line => line.startsWith('data:'))?.substring(5).trim();

                if (!eventType || !dataLine) continue;

                try {
                    const parsedData = JSON.parse(dataLine);

                    if (eventType === 'chunk') {
                        console.log('SSE Client: Received chunk:', parsedData.text);
                        yield { done: false, text: parsedData.text };
                    } else if (eventType === 'done') {
                        console.log('SSE Client: Received done event');
                        if (onComplete) {
                            onComplete(parsedData);
                        }
                        yield { done: true, fullResponse: parsedData };
                    }
                } catch (error) {
                    console.error('Error parsing SSE data:', error);
                }
            }
        }
    } catch (error) {
        console.error('SSE client error:', error);
        // Log more specific details to help diagnose the problem
        if (error instanceof TypeError && error.message.includes('is not a valid URL')) {
            console.error('URL construction error. Endpoint:', endpoint, 'BASE_URL:', BASE_URL);
        }

        if (getAccessToken()) {
            // Only redirect to login for auth errors, not for all errors
            if (error instanceof Error && error.message.includes('Unauthorized')) {
                redirectToLogin();
            }
        }
        throw error;
    }
}
