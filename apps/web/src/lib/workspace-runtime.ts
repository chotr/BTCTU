export type WorkspaceMode = "api" | "mock";

let activeMode: WorkspaceMode = "api";

export function setWorkspaceMode(mode: WorkspaceMode): void {
  activeMode = mode;
}

export function getWorkspaceMode(): WorkspaceMode {
  return activeMode;
}

export function isApiWorkspace(): boolean {
  return activeMode === "api";
}

export function appPath(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`Đường dẫn ứng dụng phải bắt đầu bằng "/": ${path}`);
  }
  return activeMode === "mock" ? `/demo${path}` : path;
}
