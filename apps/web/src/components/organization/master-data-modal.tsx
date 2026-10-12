"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button, Callout, Field, Input, Modal, Select } from "@/components/ui";
import type { AppState } from "@/lib/store";
import {
  ORG_TAB_FIELDS,
  ORG_TAB_LABELS,
  type OrgTab,
} from "./model";

/** Create / update / delete modal for the active organization tab. */
export function MasterDataModal({
  tab,
  form,
  setForm,
  remove,
  reason,
  setReason,
  error,
  departments,
  positions,
  people,
  onSubmit,
  onClose,
}: {
  tab: OrgTab;
  form: Record<string, string> | null;
  setForm: Dispatch<SetStateAction<Record<string, string> | null>>;
  remove: boolean;
  reason: string;
  setReason: (value: string) => void;
  error: string;
  departments: AppState["departments"];
  positions: AppState["positions"];
  people: AppState["people"];
  onSubmit: (event: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={form !== null}
      title={`${remove ? "Xóa" : form?.id ? "Cập nhật" : "Thêm"} ${ORG_TAB_LABELS[tab].toLocaleLowerCase("vi")}`}
      onClose={onClose}
    >
      <form className="space-y-3" onSubmit={onSubmit}>
        {error && (
          <p
            role="alert"
            className="rounded-ctl bg-danger-50 p-3 text-xs text-danger-600"
          >
            {error}
          </p>
        )}
        {remove ? (
          <Callout title="Xác nhận xóa dữ liệu" tone="warn">
            {form?.name ?? form?.title}. Chỉ xóa mục chưa được hồ sơ nghiệp vụ
            tham chiếu; thao tác có nhật ký.
          </Callout>
        ) : (
          ORG_TAB_FIELDS[tab].map(([key, label]) => (
            <Field key={key} label={label}>
              {key === "departmentId" ? (
                <Select
                  required
                  className="w-full"
                  value={form?.[key] ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f!, [key]: e.target.value }))
                  }
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              ) : key === "positionRefId" ? (
                <Select
                  required
                  className="w-full"
                  value={form?.[key] ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f!, [key]: e.target.value }))
                  }
                >
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </Select>
              ) : key === "headId" ? (
                <Select
                  className="w-full"
                  value={form?.[key] ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f!, [key]: e.target.value }))
                  }
                >
                  <option value="">Chưa phân công</option>
                  {people
                    .filter((p) => p.departmentId === form?.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </Select>
              ) : (
                <Input
                  className="w-full"
                  required
                  value={form?.[key] ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f!, [key]: e.target.value }))
                  }
                />
              )}
            </Field>
          ))
        )}
        {(tab === "people" || tab === "departments") && (
          <Field label="Lý do thay đổi">
            <Input
              required
              className="w-full"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
        )}
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant={remove ? "danger" : "primary"}>
            {remove ? "Xác nhận xóa" : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
