"use client";

import { Button, Callout, Field, Input, Modal } from "@/components/ui";
import type { ImportRow } from "@/lib/api";
import type { CatalogItem } from "@/lib/types";
import { CatalogEditFields } from "./catalog-edit-fields";
import { CatalogImportFields } from "./catalog-import-fields";
import type { CatalogMode } from "./model";

const TITLES: Record<CatalogMode, string> = {
  edit: "Công việc nháp",
  copy: "Tạo phiên bản từ bản hiện tại",
  publish: "Công bố danh mục",
  delete: "Xóa công việc nháp",
  import: "Nhập danh mục — staging",
};

/** Modal danh mục có phiên bản: sửa nháp, sao chép, công bố, xóa và nhập CSV. */
export function CatalogModal({
  mode,
  item,
  setItem,
  error,
  onError,
  newVersion,
  setNewVersion,
  reason,
  setReason,
  csv,
  setCsv,
  preview,
  setPreview,
  onPreview,
  selectedCount,
  version,
  onSubmit,
  onClose,
}: {
  mode: CatalogMode | null;
  item: CatalogItem | null;
  setItem: (item: CatalogItem) => void;
  error: string;
  onError: (message: string) => void;
  newVersion: string;
  setNewVersion: (value: string) => void;
  reason: string;
  setReason: (value: string) => void;
  csv: string;
  setCsv: (value: string) => void;
  preview: ImportRow[];
  setPreview: (value: ImportRow[]) => void;
  onPreview: () => void;
  selectedCount: number;
  version: string;
  onSubmit: (event: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={mode !== null}
      title={mode ? TITLES[mode] : "Danh mục"}
      onClose={onClose}
    >
      <form className="space-y-3" onSubmit={onSubmit}>
        {error && (
          <p
            role="alert"
            className="rounded-ctl bg-danger-50 p-3 text-xs text-danger-600"
          >
            {error}
          </p>
        )}
        {mode === "edit" && item && (
          <CatalogEditFields item={item} setItem={setItem} />
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
              {selectedCount} công việc thuộc {version}. Không sửa các phiên bản
              cũ hoặc nhiệm vụ đã giao.
            </Callout>
            <Field label="Căn cứ phát hành">
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
          <CatalogImportFields
            csv={csv}
            setCsv={setCsv}
            preview={preview}
            setPreview={setPreview}
            onPreview={onPreview}
            onError={onError}
          />
        )}
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Hủy</Button>
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
                ? "Công bố"
                : mode === "copy"
                  ? "Tạo phiên bản"
                  : mode === "delete"
                    ? "Xóa mục nháp"
                    : "Lưu nháp"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
