import { getState, setState } from "@/lib/store";
import { uid } from "@/lib/shared/ids";
import type { PositionRef, ResponsibilityRef } from "@/lib/types";
import { actor, logged, required } from "./shared";

export const referenceActions = {
  savePosition(input: PositionRef) {
    actor("position.save");
    const item = {
      ...input,
      id: input.id || uid("position"),
      title: required(input.title, "tên vị trí"),
      scope: required(input.scope, "nguồn/phạm vi tham chiếu"),
    };
    if (
      getState().positions.some(
        (p) =>
          p.title.toLocaleLowerCase("vi") ===
            item.title.toLocaleLowerCase("vi") && p.id !== item.id,
      )
    )
      throw new Error("Vị trí đã tồn tại.");
    setState((s) => ({
      ...s,
      positions: s.positions.some((p) => p.id === item.id)
        ? s.positions.map((p) => (p.id === item.id ? item : p))
        : [...s.positions, item],
    }));
    logged(
      "position.save",
      item.id,
      `${item.title} · ${item.scope}. Danh mục tham chiếu.`,
      "Đã lưu vị trí tham chiếu.",
    );
  },
  removePosition(id: string) {
    actor("position.delete");
    const s = getState();
    if (
      s.people.some((p) => p.positionRefId === id) ||
      s.tasks.some((t) => t.positionRefId === id)
    )
      throw new Error(
        "Vị trí đang được nhân sự hoặc nhiệm vụ sử dụng, không thể xóa.",
      );
    setState((x) => ({
      ...x,
      positions: x.positions.filter((p) => p.id !== id),
    }));
    logged(
      "position.delete",
      id,
      "Xóa vị trí tham chiếu chưa sử dụng.",
      "Đã xóa vị trí.",
    );
  },
  saveResponsibility(input: ResponsibilityRef) {
    actor("responsibility.save");
    if (!getState().departments.some((d) => d.id === input.departmentId))
      throw new Error("Đơn vị không hợp lệ.");
    const item = {
      ...input,
      id: input.id || uid("responsibility"),
      name: required(input.name, "trách nhiệm"),
      sourceRef: required(input.sourceRef, "nguồn/điều khoản"),
    };
    setState((s) => ({
      ...s,
      responsibilities: s.responsibilities.some((r) => r.id === item.id)
        ? s.responsibilities.map((r) => (r.id === item.id ? item : r))
        : [...s.responsibilities, item],
      departments: s.departments.map((d) => ({
        ...d,
        responsibilityIds: [
          ...d.responsibilityIds.filter((id) => id !== item.id),
          ...(d.id === item.departmentId ? [item.id] : []),
        ],
      })),
    }));
    logged(
      "responsibility.save",
      item.id,
      `${item.name} · ${item.sourceRef}`,
      "Đã lưu trách nhiệm.",
    );
  },
  removeResponsibility(id: string) {
    actor("responsibility.delete");
    setState((s) => ({
      ...s,
      responsibilities: s.responsibilities.filter((r) => r.id !== id),
      departments: s.departments.map((d) => ({
        ...d,
        responsibilityIds: d.responsibilityIds.filter((r) => r !== id),
      })),
    }));
    logged(
      "responsibility.delete",
      id,
      "Xóa liên kết trách nhiệm trong cấu hình; không sửa nguồn pháp lý.",
      "Đã xóa trách nhiệm.",
    );
  },
};
