// civiclink-web/lib/api.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type HttpMethod = 'GET' | 'POST' | 'PATCH';

async function request<TResponse, TBody = unknown>(
  method: HttpMethod,
  path: string,
  token?: string | null,
  body?: TBody,
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `API error (${res.status})`;
    try {
      const data = await res.json();
      if (data && typeof data.message === 'string') {
        message = `API error (${res.status}): ${data.message}`;
      } else if (Array.isArray(data?.message)) {
        message = `API error (${res.status}): ${data.message.join(', ')}`;
      }
    } catch {
      // ignore parse errors, keep default message
    }

    throw new Error(message);
  }

  // If no content
  if (res.status === 204) {
    return undefined as unknown as TResponse;
  }

  return (await res.json()) as TResponse;
}

export async function apiGet<TResponse>(
  path: string,
  token?: string | null,
): Promise<TResponse> {
  return request<TResponse>('GET', path, token);
}

export async function apiPost<TResponse, TBody = unknown>(
  path: string,
  body: TBody,
  token?: string | null,
): Promise<TResponse> {
  return request<TResponse, TBody>('POST', path, token, body);
}

export async function apiPatch<TResponse, TBody = unknown>(
  path: string,
  body: TBody,
  token?: string | null,
): Promise<TResponse> {
  return request<TResponse, TBody>('PATCH', path, token, body);
}
