import type { ApiEnvelope, ProblemResponse } from "@btctu/shared";
import { runtimeConfig } from "./runtime-config";

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

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  return executeRequest<T>(path, init, true);
}

async function executeRequest<T>(
  path: string,
  init: RequestInit = {},
  allowRetry = true,
): Promise<ApiEnvelope<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");
  if (init.body) headers.set("content-type", "application/json");
  try {
    const response = await fetch(`${runtimeConfig.apiBaseUrl}${path}`, {
      ...init,
      headers,
      credentials: "include",
      signal: controller.signal,
    });
    const requestId = response.headers.get("x-request-id");

    if (
      response.status === 401 &&
      allowRetry &&
      path !== "/api/v1/auth/login" &&
      path !== "/api/v1/auth/refresh"
    ) {
      try {
        const refreshResponse = await fetch(
          `${runtimeConfig.apiBaseUrl}/api/v1/auth/refresh`,
          {
            method: "POST",
            headers: { accept: "application/json" },
            credentials: "include",
          },
        );
        if (refreshResponse.ok) {
          return executeRequest<T>(path, init, false);
        }
      } catch {
        // Thử refresh không thành công, tiếp tục xử lý lỗi 401 ban đầu
      }
    }

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
