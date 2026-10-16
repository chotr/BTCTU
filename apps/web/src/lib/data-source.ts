import { loadApiWorkspace } from "./api-adapter";
import { ApiError } from "./http-client";
import { runtimeConfig } from "./runtime-config";

export async function initializeDataSource(
  hydrateLocal: () => void,
): Promise<void> {
  if (runtimeConfig.dataSource === "local") {
    hydrateLocal();
    return;
  }

  try {
    await loadApiWorkspace();
  } catch (error) {
    if (error instanceof ApiError) {
      const requestId = error.requestId
        ? ` Mã yêu cầu: ${error.requestId}.`
        : "";
      throw new Error(`Không kết nối được API.${requestId}`);
    }
    throw error;
  }
}
