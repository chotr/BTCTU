"use client";

import { useState } from "react";
import { useBusy } from "@/components/use-busy";
import { Button, Field, Modal, Select } from "@/components/ui";
import { evaluationActions } from "@/lib/evaluation";
import type { AppState } from "@/lib/store";
import type { Role } from "@/lib/types";

/** Modal tạo hồ sơ đánh giá cá nhân hoặc tập thể cho một kỳ đang mở. */
export function CreateEvaluationModal({
  open,
  onClose,
  onCreated,
  periods,
  people,
  departments,
  userRole,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
  periods: AppState["periods"];
  people: AppState["people"];
  departments: AppState["departments"];
  userRole: Role | undefined;
}) {
  const [subjectType, setSubjectType] = useState<"PERSON" | "DEPARTMENT">(
    "PERSON",
  );
  const [subject, setSubject] = useState("");
  const [newPeriod, setNewPeriod] = useState("");
  const [leader, setLeader] = useState(false);
  const { busy, run } = useBusy();
  async function create(e: React.FormEvent) {
    e.preventDefault();
    await run(async () => {
      const id = await evaluationActions.createEvaluation({
        periodId: newPeriod,
        subjectType,
        subjectId: subject,
        isLeader: leader,
      });
      if (id) {
        onClose();
        onCreated(id);
      }
    });
  }
  return (
    <Modal open={open} title="Tạo hồ sơ đánh giá" onClose={onClose}>
      <form onSubmit={create} className="space-y-3">
        <Field label="Kỳ đang mở">
          <Select
            required
            className="w-full"
            value={newPeriod}
            onChange={(e) => setNewPeriod(e.target.value)}
          >
            <option value="">Chọn kỳ</option>
            {periods
              .filter((p) => p.status === "ACTIVE")
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </Select>
        </Field>
        <Field label="Loại đối tượng">
          <Select
            className="w-full"
            value={subjectType}
            onChange={(e) => {
              setSubjectType(e.target.value as typeof subjectType);
              setSubject("");
            }}
          >
            <option value="PERSON">Cá nhân</option>
            {userRole !== "cong_chuc" && (
              <option value="DEPARTMENT">Tập thể phòng</option>
            )}
          </Select>
        </Field>
        <Field label="Đối tượng được đánh giá">
          <Select
            required
            className="w-full"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">Chọn đối tượng</option>
            {(subjectType === "PERSON" ? people : departments).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        {subjectType === "PERSON" && (
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={leader}
              onChange={(e) => setLeader(e.target.checked)}
            />
            Sử dụng mô hình lãnh đạo, quản lý (ABCD)
          </label>
        )}
        <p className="text-xs text-ink-3">
          Tập thể có hồ sơ riêng và đầu vào nhiệm vụ của phòng; không lấy trung
          bình điểm cá nhân để xếp loại tập thể.
        </p>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="primary" disabled={busy}>
            Tạo hồ sơ
          </Button>
        </div>
      </form>
    </Modal>
  );
}
