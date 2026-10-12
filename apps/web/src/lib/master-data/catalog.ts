import { getState, setState } from "@/lib/store";
import { uid } from "@/lib/shared/ids";
import type { CatalogItem } from "@/lib/types";
import {
  actor,
  assertDraft,
  logged,
  required,
  validateCatalog,
  type CatalogInput,
} from "./shared";
import { previewCatalogCsv } from "./csv";

export const catalogActions = {
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
    if (s.catalog.some((c) => c.version.toLowerCase() === version.toLowerCase()))
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
    required(reason, "căn cứ phát hành");
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
      `${items.length} mục. ${reason}. Các căn cứ nghiệp vụ phải được phê duyệt trước khi áp dụng chính thức.`,
      "Đã phát hành phiên bản. Các nhiệm vụ cũ giữ nguyên danh mục gốc.",
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
