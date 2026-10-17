"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { useApp } from "@/lib/store";
import {
  canDecide,
  canReviewEvaluation,
  canViewEvaluation,
} from "@/lib/policy";
import { EVAL_EDITABLE, EVAL_FINAL, inGroup } from "@/lib/domain/workflow";
import {
  canCalculateEvaluation,
  canSelfEvaluate,
  evaluationLabel,
} from "@/lib/api";
import { evaluationTasks } from "@/lib/domain/periods";
import { isApiWorkspace } from "@/lib/workspace-runtime";
import type { Evaluation } from "@/lib/types";
import { appPath } from "@/lib/workspace-runtime";
import {
  Callout,
  Card,
  EmptyState,
  EvalStatusBadge,
  SectionHeader,
} from "@/components/ui";
import {
  StatusPipeline,
  OverviewTab,
  WorkflowTab,
  SnapshotsTab,
} from "@/components/evaluation";

export default function EvaluationDetail() {
  const { id } = useParams<{ id: string }>();
  const state = useApp();
  const ev = state.evaluations.find((e) => e.id === id);
  if (!ev || !canViewEvaluation(state.user, ev))
    return (
      <Card>
        <EmptyState
          title="Không thể mở hồ sơ"
          hint="Hồ sơ không tồn tại hoặc ngoài phạm vi của bạn."
          action={<Link href={appPath("/evaluation")}>Về danh sách</Link>}
        />
      </Card>
    );
  return <Workspace key={ev.id} ev={ev} />;
}

const TABS = [
  ["overview", "Tính điểm & điều kiện"],
  ["workflow", "Tự đánh giá / xử lý"],
  ["snapshots", "Lần tính & lịch sử"],
] as const;

function Workspace({ ev }: { ev: Evaluation }) {
  const state = useApp();
  const { user } = state;
  const period = state.periods.find((p) => p.id === ev.periodId);
  const locked = period?.status !== "ACTIVE" || inGroup(EVAL_FINAL, ev.status);
  const self = canSelfEvaluate(user, ev);
  const canCalc =
    !isApiWorkspace() &&
    !locked &&
    inGroup(EVAL_EDITABLE, ev.status) &&
    canCalculateEvaluation(user, ev) &&
    (ev.status === "DRAFT" ||
      (!self && canReviewEvaluation(user, ev.departmentId)));
  const reviewer = canReviewEvaluation(user, ev.departmentId) && !self;
  const canDecideUser = canDecide(user);
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("overview");
  const tasks = period ? evaluationTasks(state.tasks, ev, period) : [];
  return (
    <div className="space-y-4">
      <Link
        href={appPath("/evaluation")}
        className="inline-flex items-center gap-1 text-xs text-accent-700"
      >
        <ArrowLeft size={14} />
        Hồ sơ đánh giá
      </Link>
      <SectionHeader
        title={evaluationLabel(ev, state)}
        hint={`${ev.subjectType === "DEPARTMENT" ? "Tập thể phòng" : "Cá nhân"} · ${period?.name} · ${ev.id}`}
        actions={<EvalStatusBadge status={ev.status} />}
      />
      <StatusPipeline status={ev.status} />
      <Callout
        title={
          locked
            ? "Hồ sơ chỉ đọc — bảo toàn kết quả"
            : "Quy chế và phương pháp tính điểm"
        }
        tone={locked ? "neutral" : "accent"}
      >
        Áp dụng khung đánh giá 30/70 và tiêu chuẩn nhóm chức danh theo hướng dẫn
        05-HD/TU. Điểm số các trục được tổng hợp tự động từ kết quả thực hiện
        nhiệm vụ trong kỳ.
      </Callout>
      <div
        role="tablist"
        aria-label="Nội dung hồ sơ"
        className="flex flex-wrap gap-1"
      >
        {TABS.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-ctl px-4 py-2 text-[13px] font-medium ${tab === id ? "bg-surface text-accent-700 shadow-card" : "text-ink-2 hover:bg-fill"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "overview" && (
        <OverviewTab
          ev={ev}
          tasks={tasks}
          canCalc={canCalc}
          canOverride={canDecideUser}
        />
      )}
      {tab === "workflow" && (
        <WorkflowTab
          ev={ev}
          locked={locked}
          self={self}
          reviewer={reviewer}
          canDecideUser={canDecideUser}
        />
      )}
      {tab === "snapshots" && <SnapshotsTab ev={ev} state={state} />}
    </div>
  );
}
