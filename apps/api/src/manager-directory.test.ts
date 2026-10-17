import { describe, expect, it } from "vitest";
import { MANAGER_DIRECTORY, MANAGER_SEED_ACCOUNTS } from "./manager-directory";

describe("manager directory seed", () => {
  it("keeps one sample account for each manager without exposing email in the directory", () => {
    expect(MANAGER_DIRECTORY).toHaveLength(19);
    expect(MANAGER_SEED_ACCOUNTS).toHaveLength(19);
    expect(new Set(MANAGER_DIRECTORY.map((person) => person.id))).toEqual(
      new Set(MANAGER_SEED_ACCOUNTS.map((account) => account.directoryActorId)),
    );
    expect(MANAGER_DIRECTORY.every((person) => !("email" in person))).toBe(true);
  });
});
