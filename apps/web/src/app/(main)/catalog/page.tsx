"use client";

import { FileXlsx, Info, Upload } from "@phosphor-icons/react";
import { useState } from "react";
import { api } from "@/lib/api";
import { fmtNum } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Badge, Button, Callout, Card, SectionHeader } from "@/components/ui";

export default function CatalogPage() {
  const { catalog, activeCatalogVersion } = useApp();
  const [version, setVersion] = useState(activeCatalogVersion);
  const versions = ["v1.1", "v1.0"];
  const items = catalog.filter((c) => c.version === version);

  return (
    <div>
      <SectionHeader
        title="Danh mục công việc"
        hint="Danh mục sản phẩm/công việc chuẩn (05-HD/TU Phụ lục 1) · nguồn hiện là Excel draft"
        actions={
          <Button variant="primary" icon={<Upload size={14} weight="bold" />} onClick={() => api.exportReport("Nhập Excel danh mục")}>
            Nhập Excel
          </Button>
        }
      />

      <Callout tone="warn" icon={<Info size={16} />} title="Excel là dữ liệu vận hành nháp, chưa phải quy định">
        Mọi điểm chuẩn/hệ số đang ở trạng thái DRAFT cho tới khi được cấp có thẩm quyền phê duyệt phiên bản. Hệ thống yêu cầu
        publish version tường minh và giữ vết nguồn cho từng dòng.
      </Callout>

      <div className="mt-4 flex gap-1">
        {versions.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVersion(v)}
            className={
              version === v
                ? "rounded-ctl bg-accent-600 px-3 py-1.5 text-[12px] font-semibold text-white shadow-card"
                : "rounded-ctl bg-fill-2 px-3 py-1.5 text-[12px] font-medium text-ink-2 transition-colors hover:bg-[#e2e7ee]"
            }
          >
            Phiên bản {v}
          </button>
        ))}
        <span className="ml-2 self-center text-[11px] text-ink-3">
          {items.length} mục · hiển thị bản {version === "v1.1" ? "đã publish" : "nháp"}
        </span>
      </div>

      <Card className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[900px] text-[13px]">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-ink-3">
              <th className="px-3 py-2.5">Mã</th>
              <th className="px-3 py-2.5">Công việc / sản phẩm</th>
              <th className="px-3 py-2.5">Đơn vị</th>
              <th className="px-3 py-2.5">Mức độ</th>
              <th className="px-3 py-2.5">Điểm chuẩn</th>
              <th className="px-3 py-2.5">Hệ số</th>
              <th className="px-3 py-2.5">Thời gian</th>
              <th className="px-3 py-2.5">Nguồn</th>
              <th className="px-3 py-2.5">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-fill">
                <td className="px-3 py-2.5 font-medium text-accent-600">{c.code}</td>
                <td className="px-3 py-2.5">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-[11px] text-ink-3">Sản phẩm: {c.product}</p>
                </td>
                <td className="px-3 py-2.5 text-ink-2">{c.unit}</td>
                <td className="px-3 py-2.5 text-ink-2">{c.complexity}</td>
                <td className="px-3 py-2.5">{fmtNum(c.standardScore)}</td>
                <td className="px-3 py-2.5">{fmtNum(c.coefficient, 1)}</td>
                <td className="px-3 py-2.5 text-ink-2">{c.durationDays} ngày</td>
                <td className="px-3 py-2.5 text-[11px] text-ink-3">{c.sourceRef}</td>
                <td className="px-3 py-2.5">
                  {c.status === "PUBLISHED" ? <Badge tone="ok">Đã publish</Badge> : <Badge tone="neutral">DRAFT</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-3">
        <FileXlsx size={13} /> Nguồn nhập: Excel cây phân công nhiệm vụ + danh mục công việc — operational draft, chưa phê duyệt.
      </p>
    </div>
  );
}

