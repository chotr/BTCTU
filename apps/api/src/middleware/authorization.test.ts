import { describe, expect, it } from "vitest";
import { ROLES, type Actor } from "@/types";
import { AUTHORIZATION_RULES, can } from "./authorization";

const leader: Actor = {
  id: "u-leader",
  name: "Lãnh đạo Ban",
  role: ROLES.lanhDao,
  departmentId: "d4",
};
const head: Actor = {
  id: "u-head",
  name: "Trưởng phòng TCCB",
  role: ROLES.truongPhong,
  departmentId: "d2",
};
const staff: Actor = {
  id: "u-staff",
  name: "Chuyên viên",
  role: ROLES.congChuc,
  departmentId: "d2",
};

describe("authorization policy", () => {
  it("lets a leader assign work in any department", () => {
    expect(
      can(leader, { action: "task.create", resource: { departmentId: "d2" } }),
    ).toBe(true);
  });

  it("limits a department head to their own department", () => {
    expect(
      can(head, { action: "task.create", resource: { departmentId: "d2" } }),
    ).toBe(true);
    expect(
      can(head, { action: "task.create", resource: { departmentId: "d3" } }),
    ).toBe(false);
  });

  it("does not read a missing department as a match", () => {
    const orphan: Actor = { ...head, departmentId: null };

    expect(
      can(orphan, { action: "task.accept", resource: { departmentId: "d2" } }),
    ).toBe(false);
  });

  it("lets only the subject submit their own self-evaluation", () => {
    expect(
      can(staff, {
        action: "evaluation.self",
        resource: { subjectId: "u-staff" },
      }),
    ).toBe(true);
    expect(
      can(head, {
        action: "evaluation.self",
        resource: { subjectId: "u-staff" },
      }),
    ).toBe(false);
  });

  it("reserves the decision and the period lock for the competent authority", () => {
    expect(can(leader, { action: "evaluation.decide" })).toBe(true);
    expect(can(head, { action: "evaluation.decide" })).toBe(false);
    expect(can(leader, { action: "period.lock" })).toBe(true);
    expect(can(head, { action: "period.lock" })).toBe(false);
  });

  it("hides the audit stream from staff", () => {
    expect(can(staff, { action: "audit.read" })).toBe(false);
    expect(can(head, { action: "audit.read" })).toBe(true);
    expect(can(leader, { action: "audit.read" })).toBe(true);
  });

  it("answers every declared action with a rule", () => {
    for (const action of Object.keys(AUTHORIZATION_RULES)) {
      expect(typeof can(staff, { action: action as never })).toBe("boolean");
    }
  });
});
