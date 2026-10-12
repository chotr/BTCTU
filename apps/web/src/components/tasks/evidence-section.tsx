"use client";

import { useState } from "react";
import { Paperclip } from "@phosphor-icons/react";
import { taskActions } from "@/lib/tasks";
import { fmtDate } from "@/lib/format";
import { Badge, Button, Card, Field } from "@/components/ui";
import type { Task } from "@/lib/types";

/** Thẻ "Minh chứng": tham chiếu minh chứng tổng hợp chỉ gồm metadata. */
export function EvidenceSection({
  task,
  owner,
  editable,
}: {
  task: Task;
  owner: boolean;
  editable: boolean;
}) {
  const [synthetic, setSynthetic] = useState(false);
  return (
    <Card className="p-5">
      <h2 className="mb-2 text-sm font-semibold">Minh chứng</h2>
      <p className="mb-3 text-xs leading-relaxed text-ink-3">
        Hệ thống hiện chỉ lưu tên và metadata, không đọc hoặc tải nội dung tệp.
        Không đưa tài liệu Hạn chế hoặc bí mật nhà nước vào kho metadata.
      </p>
      {task.evidence.length ? (
        <ul className="space-y-2">
          {task.evidence.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center gap-2 rounded-ctl bg-fill p-3 text-xs"
            >
              <Paperclip size={17} />
              <span className="min-w-0 flex-1 break-all">
                {e.name}
                <span className="mt-1 block text-ink-3">
                  {e.size} · {fmtDate(e.uploadedAt)} · chỉ metadata
                </span>
              </span>
              <Badge>{e.classification}</Badge>
              {owner && editable && (
                <Button
                  variant="ghost"
                  onClick={() => taskActions.removeEvidence(task.id, e.id)}
                >
                  Gỡ
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-3 text-xs text-ink-3">Chưa có minh chứng.</p>
      )}
      {owner && editable && (
        <div className="mt-4 space-y-3">
          <label className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={synthetic}
              onChange={(e) => setSynthetic(e.target.checked)}
            />
            Tôi xác nhận tệp được chọn phù hợp phạm vi xử lý, không chứa thông
            tin Hạn chế hoặc bí mật nhà nước.
          </label>
          <Field label="Chọn tệp mẫu (tối đa 20 MB)">
            <input
              type="file"
              disabled={!synthetic}
              className="w-full text-xs file:mr-3 file:rounded-ctl file:bg-fill-2 file:px-3 file:py-2"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file)
                  await taskActions.addEvidence(task.id, {
                    name: file.name,
                    sizeBytes: file.size,
                    kind: file.type || "FILE",
                    classification: "Nội bộ",
                    synthetic,
                  });
                e.target.value = "";
              }}
            />
          </Field>
        </div>
      )}
    </Card>
  );
}
