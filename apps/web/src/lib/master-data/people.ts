import { getState, setState } from "@/lib/store";
import { uid, now } from "@/lib/shared/ids";
import type { Person } from "@/lib/types";
import { actor, logged, required, type PersonRecord } from "./shared";

export const peopleActions = {
  savePerson(input: Omit<Person, "id"> & { id?: string }, reason: string) {
    actor("person.save", input.departmentId);
    required(reason, "lý do thay đổi");
    const s = getState();
    const old = s.people.find((p) => p.id === input.id) as
      PersonRecord | undefined;
    if (input.id && !old) throw new Error("Không tìm thấy nhân sự.");
    if (old) actor("person.save", old.departmentId);
    if (
      !s.departments.some((d) => d.id === input.departmentId) ||
      !s.positions.some((p) => p.id === input.positionRefId)
    )
      throw new Error("Vui lòng chọn đơn vị và vị trí hợp lệ.");
    if (
      old &&
      input.departmentId !== old.departmentId &&
      (s.departments.some((d) => d.headId === old.id) ||
        ["u-head", "u-staff"].includes(old.id))
    )
      throw new Error(
        "Không chuyển đơn vị người đứng đầu hoặc tài khoản hệ thống cố định. Hãy thay người đứng đầu trước hoặc tạo nhân sự khác.",
      );
    const history =
      old?.membershipHistory ??
      (old
        ? [
            {
              departmentId: old.departmentId,
              positionRefId: old.positionRefId,
              at: "2026-07-01T00:00:00.000Z",
              reason: "Dữ liệu ban đầu (synthetic)",
            },
          ]
        : []);
    const item: PersonRecord = {
      ...input,
      id: old?.id ?? uid("person"),
      name: required(input.name, "họ tên"),
      title: required(input.title, "chức danh"),
      membershipHistory: [
        ...history,
        {
          departmentId: input.departmentId,
          positionRefId: input.positionRefId,
          at: now(),
          reason,
        },
      ],
    };
    setState((x) => ({
      ...x,
      people: old
        ? x.people.map((p) => (p.id === item.id ? item : p))
        : [...x.people, item],
    }));
    logged(
      "person.save",
      item.id,
      `${item.name}: ${old?.departmentId ?? "mới"} → ${item.departmentId}. ${reason}. Lịch sử nhiệm vụ cũ không thay đổi.`,
      "Đã lưu nhân sự và lịch sử phân công.",
    );
  },
  removePerson(id: string, reason: string) {
    const s = getState();
    const person = s.people.find((p) => p.id === id);
    actor("person.delete", person?.departmentId);
    required(reason, "lý do xóa");
    if (!person) throw new Error("Không tìm thấy nhân sự.");
    if (
      ["u-leader", "u-head", "u-staff"].includes(id) ||
      s.departments.some((d) => d.headId === id) ||
      s.tasks.some((t) => t.assigneeId === id || t.assignerId === id) ||
      s.evaluations.some((e) => e.subjectId === id)
    )
      throw new Error(
        "Nhân sự đang có tài khoản, vai trò đứng đầu hoặc hồ sơ nghiệp vụ. Không thể xóa để bảo toàn lịch sử.",
      );
    setState((x) => ({ ...x, people: x.people.filter((p) => p.id !== id) }));
    logged("person.delete", id, reason, "Đã xóa nhân sự chưa được sử dụng.");
  },
};
