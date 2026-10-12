"use client";

import { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { useBusy } from "@/components/use-busy";
import { RESULT_QUALITY, taskActions } from "@/lib/tasks";
import { TASK_IN_REVIEW, inGroup } from "@/lib/domain/workflow";
import { fmtDateTime } from "@/lib/format";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  SectionHeader,
  Select,
} from "@/components/ui";
import type { Task } from "@/lib/types";

/** Thẻ "Kết quả & sản phẩm": biểu mẫu nộp, kết quả đã ghi và thao tác thẩm định. */
export function ResultSection({
  task,
  unit,
  owner,
  editable,
  locked,
  reviewer,
  onAction,
}: {
  task: Task;
  unit?: string;
  owner: boolean;
  editable: boolean;
  locked: boolean;
  reviewer: boolean;
  onAction: (action: "return" | "accept") => void;
}) {
  const [quantity, setQuantity] = useState(
    String(task.result?.quantity ?? task.plannedQuantity ?? 1),
  );
  const [product, setProduct] = useState(
    task.result?.product ?? task.catalogSnapshot?.product ?? "",
  );
  const [quality, setQuality] = useState(
    task.result?.qualityLevel ?? "Đáp ứng",
  );
  const [note, setNote] = useState(task.result?.note ?? "");
  const [date, setDate] = useState(
    (task.result?.completedAt ?? new Date().toISOString()).slice(0, 10),
  );
  const { busy, run } = useBusy();
  async function save(submit: boolean) {
    await run(() =>
      taskActions.saveResult(
        task.id,
        {
          quantity: Number(quantity),
          product,
          qualityLevel: quality,
          note,
          completedAt: date,
        },
        submit,
        task.revision ?? 0,
      ),
    );
  }
  return (
    <Card className="p-5">
      <SectionHeader
        title="Kết quả & sản phẩm"
        hint={
          owner && editable
            ? "Lưu nháp trước khi nộp để nghiệm thu."
            : "Kết quả ghi nhận của người thực hiện."
        }
      />
      {owner && editable ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save(true);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Số lượng hoàn thành">
              <Input
                required
                type="number"
                min="0.01"
                step="0.01"
                className="w-full"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Field>
            <Field label="Ngày hoàn thành">
              <Input
                type="date"
                required
                className="w-full"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Sản phẩm / kết quả">
            <Input
              required
              className="w-full"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
          </Field>
          <Field label="Chất lượng tự ghi nhận">
            <Select
              className="w-full"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            >
              {RESULT_QUALITY.map((q) => (
                <option key={q}>{q}</option>
              ))}
            </Select>
          </Field>
          <Field label="Diễn giải kết quả">
            <textarea
              className="control min-h-24 w-full py-2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
          <div className="flex flex-wrap justify-end gap-2">
            <Button disabled={busy} onClick={() => void save(false)}>
              Lưu nháp
            </Button>
            <Button type="submit" disabled={busy} variant="primary">
              Nộp nghiệm thu
            </Button>
          </div>
        </form>
      ) : task.result ? (
        <div className="space-y-2 text-[13px]">
          <p className="font-semibold">{task.result.product}</p>
          <p>
            {task.result.quantity} {task.result.unit || unit} ·{" "}
            {task.result.qualityLevel}
          </p>
          <p className="whitespace-pre-wrap text-ink-2">{task.result.note}</p>
          <p className="text-xs text-ink-3">
            Ngày nộp:{" "}
            {task.result.submittedAt
              ? fmtDateTime(task.result.submittedAt)
              : "Bản nháp"}
          </p>
        </div>
      ) : (
        <EmptyState
          title="Chưa có kết quả"
          hint="Người thực hiện sẽ nhập sản phẩm và minh chứng tại đây."
        />
      )}
      {reviewer && !locked && inGroup(TASK_IN_REVIEW, task.status) && (
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button onClick={() => onAction("return")}>Yêu cầu chỉnh sửa</Button>
          <Button
            variant="primary"
            icon={<CheckCircle size={16} />}
            onClick={() => onAction("accept")}
          >
            Nghiệm thu
          </Button>
        </div>
      )}
    </Card>
  );
}
