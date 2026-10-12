/** Tiện ích CSV + tải xuống dùng chung cho báo cáo và nhập/xuất danh mục. */

// CSV có dấu nháy bao + vô hiệu hóa công thức để bảo vệ tệp khi mở bằng Excel.
export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}

export function toCsv(rows: unknown[][]): string {
  return "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function downloadText(
  filename: string,
  content: string,
  mime = "text/csv;charset=utf-8",
): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** BOM UTF-8 để Excel hiển thị tiếng Việt đúng. */
export function downloadCsv(filename: string, content: string): void {
  downloadText(filename, "\uFEFF" + content, "text/csv;charset=utf-8");
}
