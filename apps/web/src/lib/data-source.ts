import { loadApiWorkspace } from "./api-adapter";
import { ApiError } from "./http-client";
import type { WorkspaceMode } from "./workspace-runtime";

export async function initializeDataSource(
  mode: WorkspaceMode,
  hydrateLocal: () => void,
): Promise<void> {
  if (mode === "mock") {
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
