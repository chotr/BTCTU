"use client";

import { useState } from "react";
import { useBusy } from "@/components/use-busy";
import { api } from "@/lib/api";
import { Button, Card, Field, Select } from "@/components/ui";
import type { Evaluation } from "@/lib/types";

/** Thẻ "Điều kiện xếp loại": danh mục điều kiện bắt buộc và hạn mức. */
export function ConditionsCard({
  ev,
  canCalc,
}: {
  ev: Evaluation;
  canCalc: boolean;
}) {
  const [checks, setChecks] = useState(ev.conditions);
  const [conditionReason, setConditionReason] = useState(
    ev.conditionReason ?? "",
  );
  const [quota, setQuota] = useState<
    NonNullable<Evaluation["quotaApplicability"]>
  >(ev.quotaApplicability ?? "UNKNOWN");
  const [quotaConfirmed, setQuotaConfirmed] = useState(
    ev.quotaConfirmed ?? false,
  );
  const { busy, run: execute } = useBusy();
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">Điều kiện xếp loại</h2>
      <p className="mt-2 text-xs leading-relaxed text-ink-3">
        QĐ39 Điều 11: dải 90 / 70 / 50 không đủ để tự xếp loại. Checklist bên
        dưới là các điều kiện tiêu chuẩn áp dụng cho từng nhóm đối tượng.
      </p>
      <div className="mt-4 space-y-4">
        {checks.map((c) => (
          <label key={c.id} className="flex items-start gap-3 text-[13px]">
            <input
              className="mt-1"
              type="checkbox"
              disabled={!canCalc}
              checked={c.passed}
              onChange={(e) =>
                setChecks((rows) =>
                  rows.map((r) =>
                    r.id === c.id ? { ...r, passed: e.target.checked } : r,
                  ),
                )
              }
            />
            <span>
              <span className="font-medium">{c.label}</span>
              {c.blocking && <span className="ml-1 text-danger-600">*</span>}
              <span className="mt-1 block text-xs leading-relaxed text-ink-3">
                {c.detail}
              </span>
            </span>
          </label>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        <Field label="Hạn mức / nhóm so sánh">
          <Select
            disabled={!canCalc}
            className="w-full"
            value={quota}
            onChange={(e) => setQuota(e.target.value as typeof quota)}
          >
            <option value="UNKNOWN">Chưa xác định</option>
            <option value="NOT_APPLICABLE">Không áp dụng (đã xác nhận)</option>
            <option value="APPLIES">Có áp dụng (theo cấu hình)</option>
          </Select>
        </Field>
        {quota === "APPLIES" && (
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              disabled={!canCalc}
              checked={quotaConfirmed}
              onChange={(e) => setQuotaConfirmed(e.target.checked)}
            />
            Đã đối chiếu hạn mức nhóm
          </label>
        )}
        <Field label="Căn cứ xác nhận điều kiện">
          <textarea
            disabled={!canCalc}
            className="control min-h-24 w-full py-2"
            value={conditionReason}
            onChange={(e) => setConditionReason(e.target.value)}
          />
        </Field>
        {canCalc && (
          <Button
            disabled={busy || !conditionReason.trim()}
            onClick={() =>
              execute(() =>
                api.updateConditions(
                  ev.id,
                  checks,
                  conditionReason,
                  quota,
                  quotaConfirmed,
                ),
              )
            }
          >
            Lưu xác nhận
          </Button>
        )}
      </div>
    </Card>
  );
}
