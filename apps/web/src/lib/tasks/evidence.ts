import { getState } from "@/lib/store";
import { canSubmitResult } from "@/lib/policy";
import { uid, now } from "@/lib/shared/ids";
import { deny } from "@/lib/shared/feedback";
import { editable, findMutable, update } from "./shared";

export const evidenceActions = {
  async addEvidence(
    taskId: string,
    input: {
      name: string;
      sizeBytes: number;
      kind: string;
      classification: "Nội bộ";
      synthetic: boolean;
    },
    expectedRevision?: number,
  ): Promise<boolean> {
    const action = "Thêm metadata minh chứng";
    const task = findMutable(taskId, action, expectedRevision);
    if (!task) return false;
    if (!canSubmitResult(getState().user, task.assigneeId) || !editable(task))
      return deny(
        action,
        taskId,
        "Chỉ người được giao được bổ sung minh chứng trước khi nộp kết quả.",
      );
    if (!input.synthetic || input.classification !== "Nội bộ")
      return deny(
        action,
        taskId,
        "Chỉ nhận metadata của tệp Nội bộ. Không đưa tài liệu Hạn chế hoặc bí mật nhà nước vào kho metadata.",
      );
    if (
      !input.name.trim() ||
      !Number.isFinite(input.sizeBytes) ||
      input.sizeBytes <= 0 ||
      input.sizeBytes > 20 * 1024 * 1024
    )
      return deny(
        action,
        taskId,
        "Chọn tệp có dung lượng lớn hơn 0 và không quá 20 MB.",
      );
    if (
      task.evidence.some(
        (e) => e.name === input.name && e.sizeBytes === input.sizeBytes,
      )
    )
      return deny(action, taskId, "Tệp này đã có trong danh sách minh chứng.");
    const evidence = {
      id: uid("MC"),
      name: input.name.trim(),
      kind: input.kind || "FILE",
      size:
        input.sizeBytes < 1024 * 1024
          ? `${Math.ceil(input.sizeBytes / 1024)} KB`
          : `${(input.sizeBytes / 1024 / 1024).toFixed(1)} MB`,
      sizeBytes: input.sizeBytes,
      classification: "Nội bộ" as const,
      uploadedAt: now(),
      uploadedBy: getState().user!.id,
      synthetic: true,
      storageMode: "METADATA_ONLY" as const,
    };
    return update(
      task,
      { evidence: [...task.evidence, evidence] },
      action,
      `${evidence.name}; chỉ metadata, không đọc hoặc lưu nội dung tệp.`,
      "Đã lưu metadata minh chứng. Nội dung tệp không được tải lên.",
    );
  },

  async removeEvidence(
    taskId: string,
    evidenceId: string,
    expectedRevision?: number,
  ): Promise<boolean> {
    const action = "Gỡ metadata minh chứng";
    const task = findMutable(taskId, action, expectedRevision);
    if (!task) return false;
    if (!canSubmitResult(getState().user, task.assigneeId) || !editable(task))
      return deny(
        action,
        taskId,
        "Không được gỡ minh chứng sau khi kết quả đã nộp.",
      );
    const evidence = task.evidence.find((e) => e.id === evidenceId);
    if (!evidence) return deny(action, taskId, "Không tìm thấy minh chứng.");
    return update(
      task,
      { evidence: task.evidence.filter((e) => e.id !== evidenceId) },
      action,
      evidence.name,
      "Đã gỡ metadata khỏi nhiệm vụ. Lịch sử thao tác vẫn được giữ lại.",
    );
  },
};
