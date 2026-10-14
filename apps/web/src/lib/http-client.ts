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

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
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

    if (!response.ok) {
      const problem = (await response.json().catch(() => ({}))) as ProblemBody;
      throw new ApiError(
        problem.detail ?? problem.title ?? "Yêu cầu không thành công",
        response.status,
        problem.requestId ?? requestId,
      );
    }

    return (await response.json()) as ApiEnvelope<T>;
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
