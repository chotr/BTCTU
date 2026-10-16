"use client";

import { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { useBusy } from "@/components/use-busy";
import { api, evaluationTotal } from "@/lib/api";
import { classificationEligibility } from "@/lib/domain/classification";
import { EVAL_IN_REVIEW, inGroup } from "@/lib/domain/workflow";
import {
  Button,
  Callout,
  Card,
  ClassificationBadge,
  EmptyState,
  Field,
  Select,
} from "@/components/ui";
import {
  CLASS_LABELS,
  type Classification,
  type Evaluation,
} from "@/lib/types";

/** Tab "Tự đánh giá / xử lý": dòng thời gian ý kiến và thao tác theo từng bước. */
export function WorkflowTab({
  ev,
  locked,
  self,
  reviewer,
  canDecideUser,
}: {
  ev: Evaluation;
  locked: boolean;
  self: boolean;
  reviewer: boolean;
  canDecideUser: boolean;
}) {
  const [comment, setComment] = useState("");
  const [proposed, setProposed] = useState<Classification>(
    ev.review?.proposed ?? ev.self?.proposed ?? "TOT",
  );
  const { busy, run: execute } = useBusy();
  const eligibility = classificationEligibility(
    evaluationTotal(ev),
    ev.conditions,
    proposed,
    ev.quotaApplicability,
    ev.quotaConfirmed,
  );
  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold">Ý kiến theo từng bước</h2>
        {[
          ["Tự đánh giá", ev.self?.comment, ev.self?.proposed],
          ["Thẩm định / đề xuất", ev.review?.comment, ev.review?.proposed],
          ["Quyết định", ev.decision?.note, ev.decision?.classification],
        ].map(([label, note, cls]) => (
          <div key={label} className="mb-4 rounded-ctl bg-fill p-4">
            <p className="text-xs font-semibold">{label}</p>
            <p className="my-2 whitespace-pre-wrap text-[13px] text-ink-2">
              {note || "Chưa có ý kiến"}
            </p>
            {cls && <ClassificationBadge value={cls as Classification} />}
          </div>
        ))}
      </Card>
      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold">Thao tác hồ sơ</h2>
        {locked ? (
          <EmptyState
            title="Đã hoàn tất / khóa"
            hint="Mở lại kỳ trong Quản lý kỳ nếu cần điều chỉnh có kiểm soát."
          />
        ) : (self && ev.status === "DRAFT") ||
          (reviewer && inGroup(EVAL_IN_REVIEW, ev.status)) ? (
          <div className="space-y-4">
            <Field label="Mức đề xuất / quyết định">
              <Select
                className="w-full"
                value={proposed}
                onChange={(e) => setProposed(e.target.value as Classification)}
              >
                {Object.entries(CLASS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Nhận xét / căn cứ / lý do trả lại">
              <textarea
                className="control min-h-32 w-full py-2"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Field>
            {eligibility.length > 0 && (
              <Callout title="Cảnh báo trước khi quyết định" tone="warn">
                {eligibility.join(" ")}
              </Callout>
            )}
            <div className="flex flex-wrap gap-2">
              {self && ev.status === "DRAFT" && (
                <Button
                  disabled={busy || !comment.trim()}
                  variant="primary"
                  onClick={() =>
                    execute(() =>
                      api.selfEvaluate(ev.id, {
                        comment,
                        proposed,
                      }),
                    )
                  }
                >
                  Nộp tự đánh giá
                </Button>
              )}
              {reviewer && ev.status === "SUBMITTED" && (
                <Button
                  disabled={busy || !comment.trim()}
                  variant="primary"
                  onClick={() =>
                    execute(() =>
                      api.reviewEvaluation(ev.id, {
                        comment,
                        proposed,
                        action: "propose",
                      }),
                    )
                  }
                >
                  Thẩm định và trình
                </Button>
              )}
              {reviewer &&
                (ev.status === "SUBMITTED" ||
                  (ev.status === "REVIEWED" && canDecideUser)) && (
                  <Button
                    disabled={busy || !comment.trim()}
                    onClick={() =>
                      execute(() =>
                        api.reviewEvaluation(ev.id, {
                          comment,
                          proposed,
                          action: "return",
                        }),
                      )
                    }
                  >
                    Trả lại hồ sơ
                  </Button>
                )}
              {canDecideUser && ev.status === "REVIEWED" && (
                <Button
                  variant="primary"
                  icon={<CheckCircle size={16} />}
                  disabled={busy || !comment.trim() || eligibility.length > 0}
                  onClick={() =>
                    execute(() =>
                      api.decideEvaluation(ev.id, {
                        classification: proposed,
                        note: comment,
                      }),
                    )
                  }
                >
                  Quyết định xếp loại
                </Button>
              )}
            </div>
            <p className="text-xs text-ink-3">
              Quyền ở đây tuân theo ma trận cấu hình. Thẩm quyền pháp lý phải
              được phê duyệt trước khi áp dụng chính thức.
            </p>
          </div>
        ) : (
          <EmptyState
            title="Đang chờ bước tiếp theo"
            hint="Đổi sang đúng tài khoản để tự đánh giá, thẩm định hoặc quyết định. Không tự thẩm định hồ sơ của mình."
          />
        )}
      </Card>
    </div>
  );
}
