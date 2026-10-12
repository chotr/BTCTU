"use client";

import { Button, Card, EmptyState } from "@/components/ui";
import type { CatalogItem } from "@/lib/types";

/** Bảng công việc danh mục cho phiên bản được chọn. */
export function CatalogTable({
  rows,
  allowed,
  onEdit,
  onDelete,
}: {
  rows: CatalogItem[];
  allowed: boolean;
  onEdit: (item: CatalogItem) => void;
  onDelete: (item: CatalogItem) => void;
}) {
  return (
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
              <tr key={c.id} className="shadow-[0_1px_0_#edf1f6] hover:bg-fill">
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
                <td className="p-3 whitespace-nowrap">{c.durationDays} ngày</td>
                <td className="max-w-56 p-3 text-xs text-ink-3">{c.sourceRef}</td>
                <td className="p-3">
                  {allowed && c.status === "DRAFT" && (
                    <div className="flex gap-1">
                      <Button onClick={() => onEdit(c)}>Sửa</Button>
                      <Button variant="ghost" onClick={() => onDelete(c)}>
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
  );
}
