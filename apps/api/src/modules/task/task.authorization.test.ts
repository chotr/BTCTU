import { describe, expect, it } from "vitest";
import { canReadTask, canReadEvaluation } from "@/middleware/authorization";
import { ROLES, type Actor } from "@/types";

describe("Authorization: Read boundaries", () => {
  const leader: Actor = {
    id: "u-leader",
    name: "Lãnh đạo",
    role: ROLES.lanhDao,
    departmentId: null,
  };

  const headDept1: Actor = {
    id: "u-head-1",
    name: "Trưởng phòng 1",
    role: ROLES.truongPhong,
    departmentId: "dept-1",
  };

  const staffDept1: Actor = {
    id: "u-staff-1",
    name: "Chuyên viên 1",
    role: ROLES.congChuc,
    departmentId: "dept-1",
  };

  const staffDept2: Actor = {
    id: "u-staff-2",
    name: "Chuyên viên 2",
    role: ROLES.congChuc,
    departmentId: "dept-2",
  };

  const task1 = { departmentId: "dept-1", assigneeId: "u-staff-1" };
  const task2 = { departmentId: "dept-2", assigneeId: "u-staff-2" };

  it("allows leader to read any task", () => {
    expect(canReadTask(leader, task1)).toBe(true);
    expect(canReadTask(leader, task2)).toBe(true);
  });

  it("restricts department head to their own department", () => {
    expect(canReadTask(headDept1, task1)).toBe(true);
    expect(canReadTask(headDept1, task2)).toBe(false);
  });

  it("restricts staff to tasks assigned to them", () => {
    expect(canReadTask(staffDept1, task1)).toBe(true);
    expect(canReadTask(staffDept1, task2)).toBe(false);
  });

  const eval1 = { departmentId: "dept-1", subjectId: "u-staff-1" };
  const eval2 = { departmentId: "dept-2", subjectId: "u-staff-2" };

  it("allows leader to read any evaluation", () => {
    expect(canReadEvaluation(leader, eval1)).toBe(true);
    expect(canReadEvaluation(leader, eval2)).toBe(true);
  });

  it("restricts department head to evaluations in their department", () => {
    expect(canReadEvaluation(headDept1, eval1)).toBe(true);
    expect(canReadEvaluation(headDept1, eval2)).toBe(false);
  });

  it("restricts staff to their own evaluation", () => {
    expect(canReadEvaluation(staffDept1, eval1)).toBe(true);
    expect(canReadEvaluation(staffDept1, eval2)).toBe(false);
  });
});
