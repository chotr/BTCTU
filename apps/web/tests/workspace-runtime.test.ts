import { afterEach, describe, expect, it } from "vitest";
import {
  appPath,
  getWorkspaceMode,
  isApiWorkspace,
  setWorkspaceMode,
} from "@/lib/workspace-runtime";

afterEach(() => setWorkspaceMode("api"));

describe("workspace runtime", () => {
  it("uses unprefixed routes for the API workspace", () => {
    setWorkspaceMode("api");

    expect(getWorkspaceMode()).toBe("api");
    expect(isApiWorkspace()).toBe(true);
    expect(appPath("/tasks/NV-01")).toBe("/tasks/NV-01");
  });

  it("keeps mock navigation inside the demo namespace", () => {
    setWorkspaceMode("mock");

    expect(isApiWorkspace()).toBe(false);
    expect(appPath("/tasks/NV-01")).toBe("/demo/tasks/NV-01");
  });
});
