import { appendAudit, getState, pushToast, setState } from "@/lib/store";
import type {
  CatalogItem,
  Department,
  Person,
  PositionRef,
  ResponsibilityRef,
} from "@/lib/types";
import { uid, now } from "@/lib/shared/ids";

type CatalogInput = Omit<CatalogItem, "id" | "status"> & { id?: string };
type PersonRecord = Person & {
  membershipHistory?: {
    departmentId: string;
    positionRefId: string;
    at: string;
    reason: string;
  }[];
};
export type ImportRow = { row: number; item: CatalogInput; errors: string[] };
const required = (value: string, name: string) => {
  if (!value.trim()) throw new Error(`Vui lòng nhập ${name}.`);
  if (value.trim().length > 1000)
    throw new Error(`${name} không được quá 1.000 ký tự.`);
  return value.trim();
};
function actor(action: string, departmentId?: string) {
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
function logged(
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
function validateCatalog(input: CatalogInput, ignoreId?: string): CatalogInput {
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
function assertDraft(version: string) {
  if (
    getState().catalog.some(
      (c) => c.version === version && c.status === "PUBLISHED",
    )
  )
    throw new Error(
      "Phiên bản đã phát hành không được sửa. Hãy sao chép sang phiên bản nháp mới.",
    );
}

export const masterActions = {
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
      `Cấu hình mô phỏng: ${item.name}. Lý do: ${reason}`,
      "Đã lưu đơn vị mô phỏng.",
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
        "Không chuyển đơn vị người đứng đầu hoặc tài khoản demo cố định. Hãy thay người đứng đầu trước hoặc tạo nhân sự mô phỏng khác.",
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
        "Nhân sự đang có tài khoản demo, vai trò đứng đầu hoặc hồ sơ nghiệp vụ. Không thể xóa để bảo toàn lịch sử.",
      );
    setState((x) => ({ ...x, people: x.people.filter((p) => p.id !== id) }));
    logged("person.delete", id, reason, "Đã xóa nhân sự chưa được sử dụng.");
  },
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
      `${item.title} · ${item.scope}. Danh mục tham chiếu mô phỏng.`,
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
      "Xóa liên kết trách nhiệm trong cấu hình mô phỏng; không sửa nguồn pháp lý.",
      "Đã xóa trách nhiệm mô phỏng.",
    );
  },
  saveCatalog(input: CatalogInput) {
    actor("catalog.save");
    const old = getState().catalog.find((c) => c.id === input.id);
    if (input.id && !old) throw new Error("Không tìm thấy công việc.");
    if (old?.status === "PUBLISHED")
      throw new Error("Không được sửa công việc đã phát hành.");
    if (old && old.version !== input.version)
      throw new Error(
        "Không được chuyển mục sang phiên bản khác; hãy sao chép phiên bản.",
      );
    assertDraft(input.version);
    const validated = validateCatalog(input, input.id);
    const item: CatalogItem = {
      ...validated,
      id: old?.id ?? uid("catalog"),
      status: "DRAFT",
    };
    setState((s) => ({
      ...s,
      catalog: old
        ? s.catalog.map((c) => (c.id === item.id ? item : c))
        : [...s.catalog, item],
    }));
    logged(
      "catalog.save",
      item.id,
      `${item.code} · ${item.version} · DRAFT · ${item.sourceRef}`,
      "Đã lưu công việc nháp.",
    );
  },
  removeCatalog(id: string) {
    actor("catalog.delete");
    const s = getState();
    const item = s.catalog.find((c) => c.id === id);
    if (
      !item ||
      item.status !== "DRAFT" ||
      s.tasks.some((t) => t.catalogItemId === id)
    )
      throw new Error("Chỉ được xóa mục nháp chưa được nhiệm vụ sử dụng.");
    setState((x) => ({ ...x, catalog: x.catalog.filter((c) => c.id !== id) }));
    logged(
      "catalog.delete",
      id,
      `${item.code} · ${item.version}`,
      "Đã xóa công việc nháp.",
    );
  },
  duplicateVersion(from: string, to: string) {
    actor("catalog.version.create");
    const version = required(to, "tên phiên bản mới");
    if (!/^[\p{L}\d._-]{1,40}$/u.test(version))
      throw new Error(
        "Phiên bản gồm 1–40 chữ, số, chấm, gạch nối hoặc gạch dưới.",
      );
    const s = getState();
    if (
      s.catalog.some((c) => c.version.toLowerCase() === version.toLowerCase())
    )
      throw new Error("Tên phiên bản đã tồn tại.");
    const source = s.catalog.filter((c) => c.version === from);
    if (!source.length) throw new Error("Phiên bản nguồn không tồn tại.");
    const rows: CatalogItem[] = source.map((c) => ({
      ...c,
      id: uid("catalog"),
      version,
      status: "DRAFT",
    }));
    setState((x) => ({ ...x, catalog: [...x.catalog, ...rows] }));
    logged(
      "catalog.version.create",
      version,
      `Sao chép ${from}, ${rows.length} mục.`,
      "Đã tạo phiên bản nháp mới.",
    );
    return version;
  },
  publishVersion(version: string, reason: string) {
    actor("catalog.version.publish");
    required(reason, "căn cứ phát hành mô phỏng");
    assertDraft(version);
    const items = getState().catalog.filter((c) => c.version === version);
    if (!items.length) throw new Error("Phiên bản chưa có công việc.");
    for (const item of items) validateCatalog(item, item.id);
    setState((s) => ({
      ...s,
      activeCatalogVersion: version,
      catalog: s.catalog.map((c) =>
        c.version === version ? { ...c, status: "PUBLISHED" as const } : c,
      ),
    }));
    logged(
      "catalog.version.publish",
      version,
      `${items.length} mục. ${reason}. Phát hành trong DEMO, không xác nhận phê duyệt pháp lý.`,
      "Đã phát hành phiên bản demo. Các nhiệm vụ cũ giữ nguyên danh mục gốc.",
    );
  },
  importCatalog(text: string, version: string) {
    actor("catalog.import");
    assertDraft(version);
    const rows = previewCatalogCsv(text, version);
    if (!rows.length || rows.some((r) => r.errors.length))
      throw new Error(
        "Dữ liệu nhập chưa hợp lệ. Hãy sửa tất cả lỗi trước khi xác nhận.",
      );
    const items: CatalogItem[] = rows.map((r) => ({
      ...r.item,
      id: uid("catalog"),
      status: "DRAFT",
    }));
    setState((s) => ({ ...s, catalog: [...s.catalog, ...items] }));
    logged(
      "catalog.import",
      version,
      `${items.length} dòng CSV đã kiểm tra. Operational/master-data draft; không phải quy định pháp lý.`,
      `Đã nhập ${items.length} công việc vào bản nháp.`,
    );
  },
};

const CSV_FIELDS = [
  "code",
  "name",
  "product",
  "unit",
  "complexity",
  "standardScore",
  "coefficient",
  "durationDays",
  "sourceRef",
] as const;
function parseCsv(text: string): string[][] {
  const raw = text.replace(/^\uFEFF/, "").trim();
  if (!raw) throw new Error("Chưa có dữ liệu CSV.");
  if (raw.length > 1_000_000)
    throw new Error("Tệp CSV tối đa 1 MB cho bản demo.");
  const firstLine = raw.split(/\r?\n/, 1)[0];
  const delimiter = firstLine.includes("\t")
    ? "\t"
    : firstLine.includes(";")
      ? ";"
      : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let closed = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (quoted) {
      if (c === '"' && raw[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
        closed = true;
      } else field += c;
    } else if (c === '"' && !field && !closed) quoted = true;
    else if (c === delimiter) {
      row.push(field.trim());
      field = "";
      closed = false;
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && raw[i + 1] === "\n") i++;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
      closed = false;
    } else if (closed && c.trim())
      throw new Error("CSV không hợp lệ: có ký tự sau dấu đóng ngoặc kép.");
    else if (c === '"')
      throw new Error("CSV không hợp lệ: dấu ngoặc kép phải bao toàn bộ ô.");
    else field += c;
  }
  if (quoted) throw new Error("CSV thiếu dấu đóng ngoặc kép.");
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
export function previewCatalogCsv(text: string, version: string): ImportRow[] {
  required(version, "phiên bản nháp đích");
  assertDraft(version);
  const [header, ...rows] = parseCsv(text);
  if (!header || CSV_FIELDS.some((name) => !header.includes(name)))
    throw new Error(`Thiếu cột. Dùng đúng mẫu: ${CSV_FIELDS.join(", ")}.`);
  if (new Set(header).size !== header.length)
    throw new Error("Tiêu đề CSV có cột trùng.");
  if (!rows.length || rows.length > 500)
    throw new Error("Mỗi lần nhập từ 1 đến 500 công việc.");
  const seen = new Set<string>();
  return rows.map((cells, index) => {
    const values = Object.fromEntries(
      CSV_FIELDS.map((name) => [name, cells[header.indexOf(name)] ?? ""]),
    );
    const item: CatalogInput = {
      version,
      code: values.code.toUpperCase(),
      name: values.name,
      product: values.product,
      unit: values.unit,
      complexity: values.complexity as CatalogItem["complexity"],
      standardScore: Number(values.standardScore),
      coefficient: Number(values.coefficient),
      durationDays: Number(values.durationDays),
      sourceRef: values.sourceRef,
    };
    const errors: string[] = [];
    if (cells.length !== header.length) errors.push("Số ô không khớp tiêu đề.");
    if (seen.has(item.code)) errors.push("Trùng mã trong tệp nhập.");
    seen.add(item.code);
    try {
      validateCatalog(item);
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : "Dữ liệu không hợp lệ.",
      );
    }
    return { row: index + 2, item, errors };
  });
}
export const catalogCsvTemplate = `${CSV_FIELDS.join(",")}\nNV-MOCK-01,Tổng hợp số liệu minh họa,Báo cáo mẫu,Báo cáo,Trung bình,8,1,7,Excel operational draft - synthetic\n`;
