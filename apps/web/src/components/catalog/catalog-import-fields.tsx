"use client";

import { Button, Field } from "@/components/ui";
import { catalogCsvTemplate, type ImportRow } from "@/lib/master-data";
import { downloadCsv } from "@/lib/shared/csv";

/** CSV import block: template, file picker, raw text and validation preview. */
export function CatalogImportFields({
  csv,
  setCsv,
  preview,
  setPreview,
  onPreview,
  onError,
}: {
  csv: string;
  setCsv: (value: string) => void;
  preview: ImportRow[];
  setPreview: (value: ImportRow[]) => void;
  onPreview: () => void;
  onError: (message: string) => void;
}) {
  return (
    <>
      <p className="text-xs leading-relaxed text-ink-2">
        Hỗ trợ CSV/TSV xuất từ Excel, tối đa 500 dòng / 1 MB. Không đọc trực tiếp
        XLSX. Nhập dữ liệu giả và kiểm tra trước khi xác nhận.
      </p>
      <Button
        onClick={() =>
          downloadCsv("BTCTU-catalog-template.csv", catalogCsvTemplate)
        }
      >
        Tải mẫu CSV
      </Button>
      <Field label="Chọn tệp CSV">
        <input
          type="file"
          accept=".csv,.tsv,text/csv,text/tab-separated-values"
          className="w-full text-xs"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > 1_000_000) {
              onError("Tệp tối đa 1 MB.");
              return;
            }
            setCsv(await f.text());
            setPreview([]);
          }}
        />
      </Field>
      <Field label="Nội dung CSV">
        <textarea
          className="control min-h-32 w-full py-2 font-mono text-xs"
          value={csv}
          onChange={(e) => {
            setCsv(e.target.value);
            setPreview([]);
          }}
        />
      </Field>
      <Button onClick={onPreview}>Kiểm tra dữ liệu</Button>
      {preview.length > 0 && (
        <div className="max-h-64 overflow-auto rounded-ctl bg-fill p-3">
          <p className="mb-2 text-xs font-semibold">
            {preview.length} dòng ·{" "}
            {preview.filter((r) => r.errors.length).length} dòng lỗi
          </p>
          {preview.map((r) => (
            <div key={r.row} className="py-2 text-xs">
              <span className="font-medium">
                Dòng {r.row}: {r.item.code} — {r.item.name}
              </span>
              <p
                className={
                  r.errors.length ? "mt-1 text-danger-600" : "mt-1 text-ok-600"
                }
              >
                {r.errors.join(" ") || "Hợp lệ · sẽ nhập DRAFT"}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
