export interface ApiClient {
  get<T>(url: string, init?: RequestInit): Promise<T>;
  post<T>(url: string, body: unknown, init?: RequestInit): Promise<T>;
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Request failed with ${response.status}: ${detail}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export const api: ApiClient = {
  get: (url, init) => request(url, { method: 'GET', ...init }),
  post: (url, body, init) => request(url, {
    method: 'POST',
    body: JSON.stringify(body),
    ...init
  })
};

export default api;
