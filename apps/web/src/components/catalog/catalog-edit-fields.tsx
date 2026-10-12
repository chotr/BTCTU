"use client";

import { Field, Input, Select } from "@/components/ui";
import type { CatalogItem } from "@/lib/types";

/** Các trường công việc danh mục nháp (mã, tên, sản phẩm, chỉ số). */
export function CatalogEditFields({
  item,
  setItem,
}: {
  item: CatalogItem;
  setItem: (item: CatalogItem) => void;
}) {
  return (
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
            onChange={(e) => setItem({ ...item, [key]: e.target.value })}
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
            onChange={(e) => setItem({ ...item, [key]: Number(e.target.value) })}
          />
        </Field>
      ))}
    </div>
  );
}
