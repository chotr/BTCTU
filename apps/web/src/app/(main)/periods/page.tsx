"use client";
import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { canManage } from "@/lib/policy";
import { scopedData } from "@/lib/exports";
import { evaluationActions } from "@/lib/evaluation";
import { EVAL_FINAL, inGroup } from "@/lib/domain/workflow";
import { useBusy } from "@/components/use-busy";
import {
  Badge,
  Button,
  Callout,
  Card,
  Field,
  Input,
  Modal,
  SectionHeader,
  Select,
} from "@/components/ui";
export default function PeriodsPage() {
  const state = useApp();
  const scoped = scopedData(state);
  const [mode, setMode] = useState<"create" | "lock" | "reopen" | null>(null);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"MONTH" | "QUARTER" | "YEAR">("QUARTER");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const { busy, run } = useBusy();
  const allowed = canManage(state.user);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    await run(async () => {
      const ok =
        mode === "create"
          ? await evaluationActions.createPeriod({
              name,
              kind,
              startDate: start,
              endDate: end,
            })
          : mode === "lock"
            ? await evaluationActions.lockPeriod(id)
            : await evaluationActions.reopenPeriod(id, reason);
      if (ok) {
        setMode(null);
        setReason("");
      }
    });
  }
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Quản lý kỳ"
        hint="Theo dõi tiến trình, khóa dữ liệu và mở lại có kiểm soát."
        actions={
          allowed && (
            <Button variant="primary" onClick={() => setMode("create")}>
              Tạo kỳ
            </Button>
          )
        }
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {state.periods.map((p) => {
          const evs = scoped.evaluations.filter((e) => e.periodId === p.id);
          const done = evs.filter((e) =>
            inGroup(EVAL_FINAL, e.status),
          ).length;
          return (
            <Card key={p.id} className="p-5">
              <div className="flex justify-between gap-2">
                <h2 className="text-sm font-semibold">{p.name}</h2>
                <Badge tone={p.status === "LOCKED" ? "neutral" : "ok"}>
                  {p.status === "LOCKED" ? "Đã khóa" : "Đang mở"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-ink-3">{p.range}</p>
              <p className="my-4 text-[13px]">
                {done}/{evs.length} hồ sơ đã quyết định trong phạm vi bạn xem.
              </p>
              {p.reopenReason && (
                <p className="mb-4 text-xs text-ink-2">
                  Lý do mở lại gần nhất: {p.reopenReason}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/evaluation"
                  className="rounded-ctl bg-fill-2 px-3 py-2 text-xs font-medium"
                >
                  Xem hồ sơ
                </Link>
                {allowed && (
                  <Button
                    variant={p.status === "LOCKED" ? "secondary" : "primary"}
                    onClick={() => {
                      setId(p.id);
                      setMode(p.status === "LOCKED" ? "reopen" : "lock");
                    }}
                  >
                    {p.status === "LOCKED" ? "Mở lại kỳ" : "Khóa kỳ"}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      <Modal
        open={mode !== null}
        title={
          mode === "create"
            ? "Tạo kỳ đánh giá"
            : mode === "lock"
              ? "Khóa kỳ đánh giá"
              : "Mở lại kỳ đánh giá"
        }
        onClose={() => setMode(null)}
      >
        <form onSubmit={save} className="space-y-3">
          {mode === "create" ? (
            <>
              <Field label="Tên kỳ">
                <Input
                  required
                  className="w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="Loại kỳ">
                <Select
                  value={kind}
                  className="w-full"
                  onChange={(e) => setKind(e.target.value as typeof kind)}
                >
                  <option value="MONTH">Tháng · vận hành</option>
                  <option value="QUARTER">Quý</option>
                  <option value="YEAR">Năm</option>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Từ ngày">
                  <Input
                    required
                    className="w-full"
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </Field>
                <Field label="Đến ngày">
                  <Input
                    required
                    className="w-full"
                    type="date"
                    min={start}
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </Field>
              </div>
            </>
          ) : (
            <Callout
              title={
                state.periods.find((p) => p.id === id)?.name ?? "Kỳ đánh giá"
              }
              tone="warn"
            >
              {mode === "lock"
                ? "Chỉ khóa khi mọi hồ sơ đã có quyết định. Nhiệm vụ và hồ sơ trong kỳ sẽ chỉ đọc."
                : "Hồ sơ trở về nháp để qua lại các bước đánh giá. Quyết định và các lần tính trước được giữ lại, không ghi đè."}
            </Callout>
          )}
          {mode === "reopen" && (
            <Field label="Lý do mở lại">
              <textarea
                required
                minLength={5}
                className="control min-h-24 w-full py-2"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>
          )}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setMode(null)}>Hủy</Button>
            <Button type="submit" disabled={busy} variant="primary">
              Xác nhận
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
