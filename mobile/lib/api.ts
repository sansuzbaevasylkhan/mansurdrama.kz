import { userStore } from "./user-store";
import { API_BASE_URL } from "./config";

export const tokenStore = {
  async getToken(): Promise<string | null> {
    return userStore.getToken();
  },
  async setToken(token: string) {
    return userStore.setToken(token);
  },
  async clear() {
    return userStore.clear();
  },
  async getUser<T = unknown>(): Promise<T | null> {
    return userStore.getUser() as Promise<T | null>;
  },
  async setUser<T>(user: T) {
    return userStore.setUser(user as any);
  },
};

export type ApiFetchOptions = RequestInit & {
  json?: boolean;
  formData?: FormData;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: ApiFetchOptions = {},
): Promise<T> {
  const { json = true, formData, headers, ...rest } = opts;
  const token = await tokenStore.getToken();

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined),
  };
  if (json && !formData) {
    finalHeaders["Content-Type"] = "application/json";
  }
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: formData ?? (json && rest.body ? JSON.stringify(rest.body) : rest.body),
  });

  if (!res.ok) {
    let message = `Қате: ${res.status}`;
    try {
      const data = await res.json();
      message = data?.error || data?.message || message;
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  if (!json) return (await res.text()) as unknown as T;
  return (await res.json()) as T;
}
