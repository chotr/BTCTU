import { getState, setState } from "@/lib/store";
import { uid } from "@/lib/shared/ids";
import type { Department } from "@/lib/types";
import { actor, logged, required } from "./shared";

export const departmentActions = {
  saveDepartment(
    input: Omit<Department, "id" | "responsibilityIds"> & { id?: string },
    reason: string,
  ) {
    actor("department.save");
    required(reason, "lý do thay đổi");
    const state = getState();
    const old = state.departments.find((d) => d.id === input.id);
    if (input.id && !old) throw new Error("Không tìm thấy đơn vị.");
    const code = required(input.code, "mã đơn vị").toUpperCase();
    if (
      state.departments.some(
        (d) => d.code.toUpperCase() === code && d.id !== input.id,
      )
    )
      throw new Error("Mã đơn vị đã tồn tại.");
    if (
      input.headId &&
      !state.people.some(
        (p) => p.id === input.headId && p.departmentId === input.id,
      )
    )
      throw new Error("Người đứng đầu phải là nhân sự của đơn vị.");
    const item: Department = {
      ...input,
      id: old?.id ?? uid("dept"),
      code,
      name: required(input.name, "tên đơn vị"),
      shortName: required(input.shortName, "tên ngắn"),
      functionText: required(input.functionText, "chức năng"),
      responsibilityIds: old?.responsibilityIds ?? [],
    };
    setState((s) => ({
      ...s,
      departments: old
        ? s.departments.map((d) => (d.id === item.id ? item : d))
        : [...s.departments, item],
    }));
    logged(
      "department.save",
      item.id,
      `Cập nhật cấu hình: ${item.name}. Lý do: ${reason}`,
      "Đã lưu đơn vị.",
    );
  },
  removeDepartment(id: string, reason: string) {
    actor("department.delete");
    required(reason, "lý do xóa");
    const s = getState();
    if (
      s.people.some((p) => p.departmentId === id) ||
      s.tasks.some((t) => t.departmentId === id) ||
      s.evaluations.some((e) => e.departmentId === id) ||
      s.responsibilities.some((r) => r.departmentId === id)
    )
      throw new Error(
        "Đơn vị còn nhân sự, nhiệm vụ, hồ sơ đánh giá hoặc trách nhiệm. Không thể xóa để bảo toàn tham chiếu.",
      );
    setState((x) => ({
      ...x,
      departments: x.departments.filter((d) => d.id !== id),
    }));
    logged("department.delete", id, reason, "Đã xóa đơn vị chưa được sử dụng.");
  },
};
