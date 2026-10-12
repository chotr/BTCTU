"use client";

import { Button, Card, Field, Select } from "@/components/ui";
import { PROFILES, type ProfileKey } from "@/lib/integration";
import type { IntegrationState } from "@/lib/store";

/** Thẻ "Ánh xạ từ điển dữ liệu" cho ánh xạ chuẩn tắc đề xuất. */
export function MappingCard({
  profile,
  mappings,
  onTargetChange,
  onSave,
}: {
  profile: ProfileKey;
  mappings: IntegrationState["mappings"];
  onTargetChange: (index: number, target: string) => void;
  onSave: () => void;
}) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-sm font-semibold">Ánh xạ từ điển dữ liệu</h2>
      <div className="space-y-4">
        {mappings.map((m, i) => (
          <Field key={m.field} label={m.field} hint={m.source}>
            <Select
              className="w-full"
              value={m.target}
              onChange={(e) => onTargetChange(i, e.target.value)}
            >
              {PROFILES[profile].fields.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </Select>
          </Field>
        ))}
        <Button onClick={onSave}>Lưu ánh xạ</Button>
        <p className="text-xs leading-relaxed text-ink-3">
          Không đồng bộ vào danh sách nhân sự nội bộ một cách tự động. Kết quả là
          nhật ký đối soát giả, không thay đổi master data.
        </p>
      </div>
    </Card>
  );
}
