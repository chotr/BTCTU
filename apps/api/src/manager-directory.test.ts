import { describe, expect, it } from "vitest";
import { MANAGER_DIRECTORY } from "./manager-directory";

describe("manager directory", () => {
  it("has unique directory actors", () => {
    expect(MANAGER_DIRECTORY).toHaveLength(19);
    expect(new Set(MANAGER_DIRECTORY.map((person) => person.id)).size).toBe(
      MANAGER_DIRECTORY.length,
    );
  });
});
