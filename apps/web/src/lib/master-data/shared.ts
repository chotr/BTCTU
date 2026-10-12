import { appendAudit, getState, pushToast } from "@/lib/store";
import type { CatalogItem, Person } from "@/lib/types";

export type CatalogInput = Omit<CatalogItem, "id" | "status"> & { id?: string };
export type PersonRecord = Person & {
  membershipHistory?: {
    departmentId: string;
    positionRefId: string;
    at: string;
    reason: string;
  }[];
};
export type ImportRow = { row: number; item: CatalogInput; errors: string[] };

export const required = (value: string, name: string) => {
  if (!value.trim()) throw new Error(`Vui lòng nhập ${name}.`);
  if (value.trim().length > 1000)
    throw new Error(`${name} không được quá 1.000 ký tự.`);
  return value.trim();
};

export function actor(action: string, departmentId?: string) {
  const user = getState().user;
  const allowed =
    user &&
    (user.role === "lanh_dao" ||
      (action.startsWith("person.") &&
        user.role === "truong_phong" &&
        departmentId === user.departmentId));
  if (!allowed) {
    appendAudit({
      actorId: user?.id ?? "anonymous",
      action,
      resource: departmentId ?? "master-data",
      detail: "Từ chối: vai trò hoặc phạm vi đơn vị không phù hợp.",
      outcome: "DENIED",
    });
    throw new Error("Bạn không có quyền thực hiện thao tác trong phạm vi này.");
  }
  return user;
}

export function logged(
  action: string,
  resource: string,
  detail: string,
  message: string,
) {
  appendAudit({
    actorId: getState().user!.id,
    action,
    resource,
    detail,
    outcome: "OK",
  });
  pushToast("success", message);
}

export function validateCatalog(
  input: CatalogInput,
  ignoreId?: string,
): CatalogInput {
  const item = {
    ...input,
    code: required(input.code, "mã công việc").toUpperCase(),
    name: required(input.name, "tên công việc"),
    product: required(input.product, "sản phẩm"),
    unit: required(input.unit, "đơn vị tính"),
    sourceRef: required(input.sourceRef, "nguồn dữ liệu"),
    version: required(input.version, "phiên bản"),
  };
  if (!/^[\p{L}\d._-]+$/u.test(item.code))
    throw new Error(
      "Mã công việc chỉ gồm chữ, số, dấu chấm, gạch nối hoặc gạch dưới.",
    );
  if (!["Cao", "Trung bình", "Thấp"].includes(item.complexity))
    throw new Error("Mức độ phải là Cao, Trung bình hoặc Thấp.");
  if (
    !Number.isFinite(item.standardScore) ||
    item.standardScore <= 0 ||
    item.standardScore > 100
  )
    throw new Error("Điểm chuẩn phải lớn hơn 0 và không quá 100.");
  if (
    !Number.isFinite(item.coefficient) ||
    item.coefficient <= 0 ||
    item.coefficient > 100
  )
    throw new Error("Hệ số phải lớn hơn 0 và không quá 100.");
  if (
    !Number.isInteger(item.durationDays) ||
    item.durationDays <= 0 ||
    item.durationDays > 3650
  )
    throw new Error("Thời hạn phải là số nguyên từ 1 đến 3.650 ngày.");
  if (
    getState().catalog.some(
      (c) =>
        c.version === item.version &&
        c.code.toUpperCase() === item.code &&
        c.id !== ignoreId,
    )
  )
    throw new Error(
      `Mã ${item.code} đã tồn tại trong phiên bản ${item.version}.`,
    );
  return item;
}

export function assertDraft(version: string) {
  if (
    getState().catalog.some(
      (c) => c.version === version && c.status === "PUBLISHED",
    )
  )
    throw new Error(
      "Phiên bản đã phát hành không được sửa. Hãy sao chép sang phiên bản nháp mới.",
    );
}
