import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiRequest } from "@/lib/http-client";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("apiRequest", () => {
  it("rejects a successful response that is not an API envelope", async () => {
    global.fetch = vi.fn(async () =>
      ({
        ok: true,
        status: 200,
        headers: new Headers({ "x-request-id": "req-invalid" }),
        json: async () => ({ result: {} }),
      }) as unknown as Response,
    );

    await expect(apiRequest("/api/v1/me")).rejects.toMatchObject({
      name: "ApiError",
      status: 200,
      requestId: "req-invalid",
      message: "API trả về envelope không hợp lệ",
    } satisfies Partial<ApiError>);
  });

  it("keeps a valid envelope unchanged", async () => {
    global.fetch = vi.fn(async () =>
      ({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ data: { id: "u-staff" }, meta: { total: 1 } }),
      }) as unknown as Response,
    );

    await expect(apiRequest<{ id: string }>("/api/v1/me")).resolves.toEqual({
      data: { id: "u-staff" },
      meta: { total: 1 },
    });
  });
});
