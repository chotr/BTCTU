"use client";

import { Modal } from "@/components/ui";
import type { AppState } from "@/lib/store";

type MembershipHistory = {
  departmentId: string;
  positionRefId: string;
  at: string;
  reason: string;
};

/** Modal lịch sử thành viên của một nhân sự. */
export function HistoryModal({
  personId,
  state,
  onClose,
}: {
  personId: string | null;
  state: AppState;
  onClose: () => void;
}) {
  const history =
    (
      state.people.find((p) => p.id === personId) as
        { membershipHistory?: MembershipHistory[] } | undefined
    )?.membershipHistory ?? [];
  return (
    <Modal
      open={personId !== null}
      title="Lịch sử vị trí / đơn vị"
      onClose={onClose}
    >
      {history.map((h, i) => (
        <div key={i} className="bg-fill p-3 text-xs">
          <p>
            {state.departments.find((d) => d.id === h.departmentId)?.name} ·{" "}
            {state.positions.find((p) => p.id === h.positionRefId)?.title}
          </p>
          <p className="mt-1 text-ink-3">
            {h.at} · {h.reason}
          </p>
        </div>
      ))}
      <p className="text-xs text-ink-3">
        Bản chụp vị trí lúc giao việc nằm trong từng nhiệm vụ. Nếu chưa có thay
        đổi, dữ liệu hiện tại là mốc mẫu ban đầu.
      </p>
    </Modal>
  );
}
