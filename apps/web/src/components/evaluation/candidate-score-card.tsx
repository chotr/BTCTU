"use client";

import { useState } from "react";
import { Calculator } from "@phosphor-icons/react";
import { useBusy } from "@/components/use-busy";
import { api, evaluationTotal } from "@/lib/api";
import { Button, Callout, Card, Field, Input, Progress } from "@/components/ui";
import type { Evaluation } from "@/lib/types";

/** Thẻ "Tính điểm đánh giá": phân tích điểm và lần tính tất định. */
export function CandidateScoreCard({
  ev,
  canCalc,
  canOverride,
}: {
  ev: Evaluation;
  canCalc: boolean;
  canOverride: boolean;
}) {
  const [general, setGeneral] = useState(String(ev.generalScore));
  const [leadership, setLeadership] = useState(
    String(ev.axes.find((a) => a.code === "D")?.value ?? ""),
  );
  const [override, setOverride] = useState("");
  const [calcReason, setCalcReason] = useState("");
  const { busy, run: execute } = useBusy();
  const run = ev.calculationRuns?.at(-1);
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-sm font-semibold">Tính điểm đánh giá</h2>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-ctl bg-accent-50 p-4">
          <p className="text-xs text-ink-2">Tổng điểm / 100</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-accent-700">
            {run ? evaluationTotal(ev).toFixed(2) : "—"}
          </p>
        </div>
        <div className="rounded-ctl bg-fill p-4">
          <p className="text-xs text-ink-2">Phiên bản tính</p>
          <p className="mt-2 break-words text-xs font-semibold">
            {run?.ruleVersion ?? "Chưa có lần tính mới"}
          </p>
        </div>
      </div>
      {ev.axes.map((a) => (
        <div key={a.code} className="mb-3">
          <div className="mb-1 flex justify-between gap-3 text-xs">
            <span>
              {a.code} · {a.label}
            </span>
            <span className="font-semibold tabular-nums">
              {a.value.toFixed(2)}%
            </span>
          </div>
          <Progress value={a.value} />
          <p className="mt-1 text-[11px] leading-relaxed text-ink-3">
            {a.detail}
          </p>
        </div>
      ))}
      {run?.missingInputs.length ? (
        <Callout tone="warn" title="Chưa đủ đầu vào">
          <ul className="list-inside list-disc">
            {run.missingInputs.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Callout>
      ) : null}
      {canCalc && (
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void execute(() =>
              api.calculateEvaluation(ev.id, {
                generalScore: Number(general),
                leadershipScore: ev.isLeader ? Number(leadership) : undefined,
                reason: calcReason,
                overrideTotal: override !== "" ? Number(override) : undefined,
              }),
            );
          }}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Điểm chung (0–30)">
              <Input
                required
                type="number"
                min="0"
                max="30"
                step="0.01"
                className="w-full"
                value={general}
                onChange={(e) => setGeneral(e.target.value)}
              />
            </Field>
            {ev.isLeader && (
              <Field label="D · Điều hành (0–100)">
                <Input
                  required
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full"
                  value={leadership}
                  onChange={(e) => setLeadership(e.target.value)}
                />
              </Field>
            )}
          </div>
          {canOverride && (
            <Field
              label="Điều chỉnh tổng điểm (tùy chọn)"
              hint="Chỉ tài khoản lãnh đạo; phải có lý do. Giữ nguyên cả điểm tính gốc và điểm điều chỉnh."
            >
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                className="w-full"
                value={override}
                onChange={(e) => setOverride(e.target.value)}
                placeholder="Để trống để dùng điểm tính"
              />
            </Field>
          )}
          <Field label="Giải trình / lý do">
            <Input
              required={override !== ""}
              className="w-full"
              value={calcReason}
              onChange={(e) => setCalcReason(e.target.value)}
            />
          </Field>
          <Button
            disabled={busy}
            variant="primary"
            type="submit"
            icon={<Calculator size={16} />}
          >
            Tính và lưu snapshot
          </Button>
        </form>
      )}
    </Card>
  );
}
