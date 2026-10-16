import type { CatalogItem } from "@/lib/types";
import {
  assertDraft,
  required,
  validateCatalog,
  type CatalogInput,
  type ImportRow,
} from "./shared";

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
  if (raw.length > 1_000_000) throw new Error("Tệp CSV tối đa 1 MB.");
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

export const catalogCsvTemplate = `${CSV_FIELDS.join(",")}\nNV-DEV-01,Tổng hợp số liệu,Báo cáo tổng hợp,Báo cáo,Trung bình,8,1,7,Danh mục vận hành\n`;
