"use client";

import { useState } from "react";
import { Plus, UploadSimple, Copy, CheckCircle } from "@phosphor-icons/react";
import { useApp } from "@/lib/store";
import { canManage } from "@/lib/policy";
import { api, previewCatalogCsv, type ImportRow } from "@/lib/api";
import type { CatalogItem } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  SectionHeader,
  Select,
} from "@/components/ui";
import {
  CatalogModal,
  CatalogTable,
  type CatalogMode,
} from "@/components/catalog";

export default function CatalogPage() {
  const { catalog, user, activeCatalogVersion } = useApp();
  const [version, setVersion] = useState(activeCatalogVersion);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<CatalogMode | null>(null);
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
  function show(next: CatalogMode, c?: CatalogItem) {
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
        <Badge className="min-h-9 mt-auto" tone={published ? "ok" : "warn"}>
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
      <CatalogTable
        rows={rows}
        allowed={allowed}
        onEdit={(c) => show("edit", c)}
        onDelete={(c) => show("delete", c)}
      />
      <CatalogModal
        mode={mode}
        item={item}
        setItem={setItem}
        error={error}
        onError={setError}
        newVersion={newVersion}
        setNewVersion={setNewVersion}
        reason={reason}
        setReason={setReason}
        csv={csv}
        setCsv={setCsv}
        preview={preview}
        setPreview={setPreview}
        onPreview={() =>
          attempt(() => setPreview(previewCatalogCsv(csv, newVersion)))
        }
        selectedCount={selected.length}
        version={version}
        onSubmit={save}
        onClose={() => setMode(null)}
      />
    </div>
  );
}
