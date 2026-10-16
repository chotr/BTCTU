import type { ApiEnvelope, ProblemResponse } from "@btctu/shared";
import { runtimeConfig } from "./runtime-config";

const DEVELOPMENT_IDENTITY_KEY = "btctu:api-user:v1";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly requestId: string | null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Body lỗi có thể thiếu trường, nên chỉ đọc phần có mặt. */
type ProblemBody = Partial<ProblemResponse>;

function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  if (!value || typeof value !== "object" || !("data" in value)) {
    return false;
  }
  return !("meta" in value) ||
    value.meta === undefined ||
    (typeof value.meta === "object" && value.meta !== null);
}

export function getDevelopmentIdentity(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(DEVELOPMENT_IDENTITY_KEY);
  } catch {
    return null;
  }
}

export function setDevelopmentIdentity(userId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (userId) {
      window.sessionStorage.setItem(DEVELOPMENT_IDENTITY_KEY, userId);
    } else {
      window.sessionStorage.removeItem(DEVELOPMENT_IDENTITY_KEY);
    }
  } catch {
    // Phiên phát triển vẫn có thể tiếp tục cho đến khi tải lại trang.
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");
  if (init.body) headers.set("content-type", "application/json");
  const developmentIdentity = getDevelopmentIdentity();
  if (developmentIdentity && runtimeConfig.environment !== "production") {
    headers.set("x-dev-user-id", developmentIdentity);
  }

  try {
    const response = await fetch(`${runtimeConfig.apiBaseUrl}${path}`, {
      ...init,
      headers,
      credentials: "include",
      signal: controller.signal,
    });
    const requestId = response.headers.get("x-request-id");

    if (!response.ok) {
      const problem = (await response.json().catch(() => ({}))) as ProblemBody;
      throw new ApiError(
        problem.detail ?? problem.title ?? "Yêu cầu không thành công",
        response.status,
        problem.requestId ?? requestId,
      );
    }

    if (response.status === 204) {
      return { data: undefined as T };
    }

    const body: unknown = await response.json().catch(() => {
      throw new ApiError("API trả về JSON không hợp lệ", response.status, requestId);
    });
    if (!isApiEnvelope(body)) {
      throw new ApiError("API trả về envelope không hợp lệ", response.status, requestId);
    }
    return body as ApiEnvelope<T>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        "API không phản hồi trong thời gian cho phép",
        408,
        null,
      );
    }
    throw new ApiError("Không thể kết nối tới API", 0, null);
  } finally {
    clearTimeout(timeout);
  }
}
