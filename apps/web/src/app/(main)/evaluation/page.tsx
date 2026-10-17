"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { useApp } from "@/lib/store";
import { scopedData } from "@/lib/access";
import { evaluationLabel } from "@/lib/api";
import { isApiWorkspace } from "@/lib/workspace-runtime";
import { EVAL_STATUS_LABELS } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  Input,
  SectionHeader,
  Select,
} from "@/components/ui";
import {
  CreateEvaluationModal,
  EvaluationTable,
} from "@/components/evaluation";
import { appPath } from "@/lib/workspace-runtime";

export default function EvaluationPage() {
  const state = useApp();
  const scoped = scopedData(state);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [period, setPeriod] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [open, setOpen] = useState(false);
  const rows = scoped.evaluations.filter(
    (e) =>
      (period === "ALL" || e.periodId === period) &&
      (status === "ALL" || e.status === status) &&
      (type === "ALL" || e.subjectType === type) &&
      (evaluationLabel(e, state) + e.id)
        .toLocaleLowerCase("vi")
        .includes(q.toLocaleLowerCase("vi")),
  );
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Hồ sơ đánh giá"
        hint="Điểm tính là đầu vào; xếp loại còn phụ thuộc điều kiện và quyết định có thẩm quyền."
        actions={
          !isApiWorkspace() && (
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setOpen(true)}
            >
              Tạo hồ sơ
            </Button>
          )
        }
      />
      <Card className="flex flex-wrap items-center gap-2 p-3">
        <Input
          aria-label="Tìm hồ sơ đánh giá"
          placeholder="Tên đối tượng hoặc mã hồ sơ…"
          className="w-full sm:w-72"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select
          aria-label="Kỳ đánh giá"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="ALL">Mọi kỳ</option>
          {state.periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Loại đối tượng"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="ALL">Cá nhân & tập thể</option>
          <option value="PERSON">Cá nhân</option>
          <option value="DEPARTMENT">Tập thể phòng</option>
        </Select>
        <Select
          aria-label="Trạng thái hồ sơ"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">Mọi trạng thái</option>
          {Object.entries(EVAL_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <Badge>{rows.length} hồ sơ</Badge>
      </Card>
      <EvaluationTable rows={rows} state={state} />
      {!isApiWorkspace() && (
        <CreateEvaluationModal
          open={open}
          onClose={() => setOpen(false)}
          onCreated={(id) => router.push(appPath(`/evaluation/${id}`))}
          periods={state.periods}
          people={scoped.people}
          departments={scoped.departments}
          userRole={state.user?.role}
        />
      )}
    </div>
  );
}
