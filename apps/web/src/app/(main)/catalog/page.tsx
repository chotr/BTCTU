"use client";
import { useState } from "react";
import { Plus, UploadSimple, Copy, CheckCircle } from "@phosphor-icons/react";
import { useApp } from "@/lib/store";
import { canManage } from "@/lib/policy";
import {
  api,
  catalogCsvTemplate,
  previewCatalogCsv,
  type ImportRow,
} from "@/lib/api";
import { downloadCsv } from "@/lib/shared/csv";
import type { CatalogItem } from "@/lib/types";
import {
  Badge,
  Button,
  Callout,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  SectionHeader,
  Select,
} from "@/components/ui";

export default function CatalogPage() {
  const { catalog, user, activeCatalogVersion } = useApp();
  const [version, setVersion] = useState(activeCatalogVersion);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<
    "edit" | "copy" | "publish" | "import" | "delete" | null
  >(null);
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [error, setError] = useState("");
  const [newVersion, setNewVersion] = useState("");
  const [reason, setReason] = useState("");
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<ImportRow[]>([]);
  const versions = [...new Set(catalog.map((c) => c.version))];
  const selected = catalog.filter((c) => c.version === version);
  const published = selected.some((c) => c.status === "PUBLISHED");
  const rows = selected.filter((c) =>
    (c.code + " " + c.name + " " + c.product)
      .toLocaleLowerCase("vi")
      .includes(q.toLocaleLowerCase("vi")),
  );
  const allowed = canManage(user);
  function show(next: typeof mode, c?: CatalogItem) {
    setMode(next);
    setError("");
    setReason("");
    setNewVersion(next === "import" ? "v-next" : "");
    setPreview([]);
    setCsv("");
    setItem(
      c ?? {
        id: "",
        code: "",
        name: "",
        product: "",
        unit: "Sản phẩm",
        complexity: "Trung bình",
        standardScore: 10,
        coefficient: 1,
        durationDays: 7,
        version,
        status: "DRAFT",
        sourceRef: "Operational draft · synthetic",
      },
    );
  }
  function attempt(fn: () => void) {
    try {
      fn();
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Dữ liệu không hợp lệ.");
    }
  }
  function save(e: React.FormEvent) {
    e.preventDefault();
    attempt(() => {
      if (mode === "copy") {
        setVersion(api.duplicateVersion(version, newVersion));
      }
      if (mode === "publish") api.publishVersion(version, reason);
      if (mode === "delete" && item) api.removeCatalog(item.id);
      if (mode === "edit" && item)
        api.saveCatalog({ ...item, id: item.id || undefined });
      if (mode === "import") {
        api.importCatalog(csv, newVersion);
        setVersion(newVersion);
      }
      setMode(null);
    });
  }
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Danh mục công việc"
        hint="Từ dữ liệu vận hành → bản nháp → phát hành phiên bản → phân công nhiệm vụ."
        actions={
          allowed && (
            <>
              <Button
                icon={<UploadSimple size={16} />}
                onClick={() => show("import")}
              >
                Nhập dữ liệu
              </Button>
              <Button icon={<Copy size={16} />} onClick={() => show("copy")}>
                Sao chép phiên bản
              </Button>
              {!published && (
                <Button
                  variant="primary"
                  icon={<Plus size={16} />}
                  onClick={() => show("edit")}
                >
                  Thêm công việc
                </Button>
              )}
            </>
          )
        }
      />
      <Card className="flex flex-wrap items-center gap-3 p-3">
        <Field label="Phiên bản">
          <Select value={version} onChange={(e) => setVersion(e.target.value)}>
            {versions.map((v) => (
              <option key={v} value={v}>
                {v}
                {v === activeCatalogVersion ? " · đang sử dụng" : ""}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tìm công việc">
          <Input
            className="w-full sm:w-80"
            placeholder="Mã, tên hoặc sản phẩm…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Field>
        <Badge tone={published ? "ok" : "warn"}>
          {published ? "Đã công bố · chỉ đọc" : "Bản nháp"}
        </Badge>
        {allowed && !published && selected.length > 0 && (
          <Button
            variant="primary"
            icon={<CheckCircle size={16} />}
            onClick={() => show("publish")}
          >
            Công bố phiên bản
          </Button>
        )}
      </Card>
      <Card className="overflow-x-auto">
        {rows.length ? (
          <table className="w-full min-w-[920px] text-[13px]">
            <thead className="bg-fill text-left text-xs text-ink-3">
              <tr>
                {[
                  "Mã / công việc",
                  "Sản phẩm",
                  "Độ phức tạp",
                  "Điểm / hệ số",
                  "Thời hạn",
                  "Nguồn",
                  "",
                ].map((h, i) => (
                  <th className="p-3" key={i}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.id}
                  className="shadow-[0_1px_0_#edf1f6] hover:bg-fill"
                >
                  <td className="max-w-xs p-3">
                    <p className="font-semibold">{c.name}</p>
                    <p className="mt-1 text-xs text-ink-3">{c.code}</p>
                  </td>
                  <td className="p-3">
                    {c.product}
                    <p className="mt-1 text-xs text-ink-3">Đơn vị: {c.unit}</p>
                  </td>
                  <td className="p-3">{c.complexity}</td>
                  <td className="p-3 tabular-nums">
                    {c.standardScore} / ×{c.coefficient}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {c.durationDays} ngày
                  </td>
                  <td className="max-w-56 p-3 text-xs text-ink-3">
                    {c.sourceRef}
                  </td>
                  <td className="p-3">
                    {allowed && c.status === "DRAFT" && (
                      <div className="flex gap-1">
                        <Button onClick={() => show("edit", c)}>Sửa</Button>
                        <Button
                          variant="ghost"
                          onClick={() => show("delete", c)}
                        >
                          Xóa
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title="Chưa có công việc phù hợp"
            hint="Tạo công việc nháp hoặc nhập dữ liệu theo mẫu CSV."
          />
        )}
      </Card>
      <Modal
        open={mode !== null}
        title={
          mode === "edit"
            ? "Công việc nháp"
            : mode === "copy"
              ? "Tạo phiên bản từ bản hiện tại"
              : mode === "publish"
                ? "Công bố danh mục demo"
                : mode === "delete"
                  ? "Xóa công việc nháp"
                  : "Nhập danh mục — staging"
        }
        onClose={() => setMode(null)}
      >
        <form className="space-y-3" onSubmit={save}>
          {error && (
            <p
              role="alert"
              className="rounded-ctl bg-danger-50 p-3 text-xs text-danger-600"
            >
              {error}
            </p>
          )}
          {mode === "edit" && item && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(
                  [
                    ["code", "Mã công việc"],
                    ["name", "Tên công việc"],
                    ["product", "Sản phẩm"],
                    ["unit", "Đơn vị tính"],
                    ["sourceRef", "Nguồn dữ liệu"],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={label}>
                    <Input
                      className="w-full"
                      required
                      value={item[key]}
                      onChange={(e) =>
                        setItem({ ...item, [key]: e.target.value })
                      }
                    />
                  </Field>
                ))}
                <Field label="Độ phức tạp">
                  <Select
                    className="w-full"
                    value={item.complexity}
                    onChange={(e) =>
                      setItem({
                        ...item,
                        complexity: e.target.value as CatalogItem["complexity"],
                      })
                    }
                  >
                    {["Thấp", "Trung bình", "Cao"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Select>
                </Field>
                {(
                  [
                    ["standardScore", "Điểm chuẩn"],
                    ["coefficient", "Hệ số"],
                    ["durationDays", "Thời hạn (ngày)"],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={label}>
                    <Input
                      required
                      className="w-full"
                      type="number"
                      min="0.01"
                      step={key === "durationDays" ? "1" : "0.01"}
                      value={item[key]}
                      onChange={(e) =>
                        setItem({ ...item, [key]: Number(e.target.value) })
                      }
                    />
                  </Field>
                ))}
              </div>
            </>
          )}
          {(mode === "copy" || mode === "import") && (
            <Field label="Tên phiên bản nháp đích">
              <Input
                required
                className="w-full"
                value={newVersion}
                onChange={(e) => {
                  setNewVersion(e.target.value);
                  setPreview([]);
                }}
              />
            </Field>
          )}
          {mode === "publish" && (
            <>
              <Callout title="Phiên bản sẽ trở thành chỉ đọc" tone="warn">
                {selected.length} công việc thuộc {version}. Không sửa các phiên
                bản cũ hoặc nhiệm vụ đã giao.
              </Callout>
              <Field label="Căn cứ phát hành mô phỏng">
                <Input
                  required
                  className="w-full"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </Field>
            </>
          )}
          {mode === "delete" && (
            <p className="text-sm">
              Xóa mục nháp “{item?.name}”? Chỉ cho phép nếu chưa được sử dụng.
            </p>
          )}
          {mode === "import" && (
            <>
              <p className="text-xs leading-relaxed text-ink-2">
                Hỗ trợ CSV/TSV xuất từ Excel, tối đa 500 dòng / 1 MB. Không đọc
                trực tiếp XLSX. Nhập dữ liệu giả và kiểm tra trước khi xác nhận.
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
                      setError("Tệp tối đa 1 MB.");
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
              <Button
                onClick={() =>
                  attempt(() => setPreview(previewCatalogCsv(csv, newVersion)))
                }
              >
                Kiểm tra dữ liệu
              </Button>
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
                          r.errors.length
                            ? "mt-1 text-danger-600"
                            : "mt-1 text-ok-600"
                        }
                      >
                        {r.errors.join(" ") || "Hợp lệ · sẽ nhập DRAFT"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setMode(null)}>Hủy</Button>
            <Button
              type="submit"
              variant={mode === "delete" ? "danger" : "primary"}
              disabled={
                mode === "import" &&
                (!preview.length || preview.some((r) => r.errors.length > 0))
              }
            >
              {mode === "import"
                ? "Xác nhận nhập"
                : mode === "publish"
                  ? "Công bố demo"
                  : mode === "copy"
                    ? "Tạo phiên bản"
                    : mode === "delete"
                      ? "Xóa mục nháp"
                      : "Lưu nháp"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
