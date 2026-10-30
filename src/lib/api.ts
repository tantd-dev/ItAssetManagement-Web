import type { ListParams, Page } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function toQuery(params?: Record<string, unknown>) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      q.set(key, String(value));
    }
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function request<T>(
  method: string,
  path: string,
  options: { params?: Record<string, unknown>; body?: unknown } = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}${toQuery(options.params)}`, {
      method,
      headers: options.body
        ? { "Content-Type": "application/json" }
        : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError("Không thể kết nối tới máy chủ", 0);
  }
  if (res.status === 204) return undefined as T;
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const message = Array.isArray(payload?.message)
      ? payload.message.join("; ")
      : (payload?.message ?? res.statusText);
    throw new ApiError(message, res.status);
  }
  return payload as T;
}

export const api = {
  get: <T>(path: string, params?: Record<string, unknown>) =>
    request<T>("GET", path, { params }),
  list: <T>(path: string, params?: ListParams) =>
    request<Page<T>>("GET", path, { params }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>("PATCH", path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),
  delete: (path: string) => request<void>("DELETE", path),
};

export const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : "Đã xảy ra lỗi";
