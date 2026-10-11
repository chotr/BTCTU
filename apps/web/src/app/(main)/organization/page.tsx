"use client";
import { useState } from "react";
import { Plus, PencilSimple, Trash } from "@phosphor-icons/react";
import { useApp } from "@/lib/store";
import { canAssign, canManage, canViewDepartment } from "@/lib/policy";
import { masterActions } from "@/lib/master-data";
import { personName } from "@/lib/shared/names";
import {
  Badge,
  Button,
  Callout,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  SectionHeader,
  Select,
} from "@/components/ui";
type Tab = "departments" | "people" | "positions" | "responsibilities";
const labels: Record<Tab, string> = {
  departments: "Đơn vị",
  people: "Nhân sự",
  positions: "Vị trí việc làm",
  responsibilities: "Trách nhiệm",
};
const fields: Record<Tab, [string, string][]> = {
  departments: [
    ["code", "Mã đơn vị"],
    ["name", "Tên đơn vị"],
    ["shortName", "Tên ngắn"],
    ["functionText", "Chức năng / nhiệm vụ"],
    ["headId", "Người đứng đầu"],
  ],
  people: [
    ["name", "Họ tên"],
    ["title", "Chức danh"],
    ["departmentId", "Đơn vị"],
    ["positionRefId", "Vị trí việc làm"],
  ],
  positions: [
    ["title", "Tên vị trí"],
    ["scope", "Nguồn / phạm vi tham chiếu"],
  ],
  responsibilities: [
    ["name", "Trách nhiệm"],
    ["departmentId", "Đơn vị"],
    ["sourceRef", "Nguồn / điều khoản"],
  ],
};
export default function OrganizationPage() {
  const state = useApp();
  const { user } = state;
  const [tab, setTab] = useState<Tab>("departments");
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("ALL");
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [remove, setRemove] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<string | null>(null);
  const departments = state.departments.filter((d) =>
    canViewDepartment(user, d.id),
  );
  const allowed = tab === "people" ? canAssign(user) : canManage(user);
  const items = state[tab].filter((item) => {
    const r = item as unknown as Record<string, string>;
    const id = tab === "departments" ? r.id : r.departmentId;
    return (
      (!id || canViewDepartment(user, id)) &&
      (dept === "ALL" || !id || id === dept) &&
      JSON.stringify(item)
        .toLocaleLowerCase("vi")
        .includes(q.toLocaleLowerCase("vi"))
    );
  });
  function edit(item?: unknown, del = false) {
    setError("");
    setReason("");
    setRemove(del);
    setForm(
      item
        ? { ...(item as Record<string, string>) }
        : {
            id: "",
            departmentId: user?.departmentId ?? departments[0]?.id ?? "",
            headId: "",
            positionRefId: state.positions[0]?.id ?? "",
          },
    );
  }
  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    try {
      const id = form.id;
      if (remove) {
        if (tab === "departments") masterActions.removeDepartment(id, reason);
        if (tab === "people") masterActions.removePerson(id, reason);
        if (tab === "positions") masterActions.removePosition(id);
        if (tab === "responsibilities") masterActions.removeResponsibility(id);
      } else {
        if (tab === "departments")
          masterActions.saveDepartment(
            {
              id: id || undefined,
              code: form.code ?? "",
              name: form.name ?? "",
              shortName: form.shortName ?? "",
              functionText: form.functionText ?? "",
              headId: form.headId ?? "",
            },
            reason,
          );
        if (tab === "people")
          masterActions.savePerson(
            {
              id: id || undefined,
              name: form.name ?? "",
              title: form.title ?? "",
              departmentId: form.departmentId,
              positionRefId: form.positionRefId,
            },
            reason,
          );
        if (tab === "positions")
          masterActions.savePosition({
            id,
            title: form.title ?? "",
            scope: form.scope ?? "",
          });
        if (tab === "responsibilities")
          masterActions.saveResponsibility({
            id,
            name: form.name ?? "",
            departmentId: form.departmentId,
            sourceRef: form.sourceRef ?? "",
          });
      }
      setForm(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được dữ liệu.");
    }
  }
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Tổ chức & nhân sự"
        hint="Đơn vị → vị trí → nhân sự → trách nhiệm."
        actions={
          allowed && (
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => edit()}
            >
              Thêm {labels[tab].toLocaleLowerCase("vi")}
            </Button>
          )
        }
      />
      <Card className="p-3">
        <div
          className="flex flex-wrap gap-1"
          role="tablist"
          aria-label="Danh mục tổ chức"
        >
          {(Object.keys(labels) as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => {
                setTab(t);
                setQ("");
              }}
              className={`rounded-ctl px-4 py-2 text-[13px] font-medium ${tab === t ? "bg-accent-50 text-accent-700" : "text-ink-2 hover:bg-fill"}`}
            >
              {labels[t]}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            aria-label="Tìm tổ chức nhân sự"
            placeholder="Tìm theo tên, mã, chức danh…"
            className="w-full sm:w-80"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select
            aria-label="Lọc đơn vị"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          >
            <option value="ALL">Trong phạm vi truy cập</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.shortName}
              </option>
            ))}
          </Select>
          <Badge>{items.length} mục</Badge>
        </div>
      </Card>
      {tab === "departments" ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {items.map((item) => {
            const d = item as (typeof state.departments)[number];
            return (
              <Card key={d.id} className="p-5">
                <div className="flex justify-between gap-3">
                  <div>
                    <Badge>{d.code}</Badge>
                    <h2 className="mt-2 text-sm font-semibold">{d.name}</h2>
                  </div>
                  {allowed && (
                    <div className="flex gap-1">
                      <Button
                        aria-label={`Sửa ${d.name}`}
                        onClick={() => edit(d)}
                        icon={<PencilSimple size={15} />}
                      >
                        Sửa
                      </Button>
                      <Button
                        aria-label={`Xóa ${d.name}`}
                        variant="ghost"
                        onClick={() => edit(d, true)}
                        icon={<Trash size={15} />}
                      >
                        Xóa
                      </Button>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
                  {d.functionText}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 bg-fill p-3 text-xs">
                  <div>
                    <p className="text-ink-3">Người đứng đầu</p>
                    <p className="mt-1 font-semibold">
                      {personName(state, d.headId) ?? "Chưa phân công"}
                    </p>
                  </div>
                  <div>
                    <p className="text-ink-3">Nhân sự</p>
                    <p className="mt-1 font-semibold">
                      {
                        state.people.filter((p) => p.departmentId === d.id)
                          .length
                      }{" "}
                      người
                    </p>
                  </div>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-ink-2">
                  {state.responsibilities
                    .filter((r) => r.departmentId === d.id)
                    .map((r) => (
                      <li key={r.id}>
                        {r.name}
                        <span className="mt-0.5 block text-ink-3">
                          {r.sourceRef}
                        </span>
                      </li>
                    ))}
                </ul>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-x-auto">
          {items.length ? (
            <table className="w-full min-w-[640px] text-[13px]">
              <thead className="bg-fill text-left text-xs text-ink-3">
                <tr>
                  <th className="p-3">{labels[tab]}</th>
                  <th className="p-3">Thông tin / tham chiếu</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const r = item as unknown as Record<string, string>;
                  return (
                    <tr
                      key={r.id}
                      className="shadow-[0_1px_0_#edf1f6] hover:bg-fill"
                    >
                      <td className="p-3 font-semibold">
                        {r.name ?? r.title}
                        <p className="mt-1 text-xs font-normal text-ink-3">
                          {tab === "people"
                            ? r.title
                            : state.departments.find(
                                (d) => d.id === r.departmentId,
                              )?.name}
                        </p>
                      </td>
                      <td className="max-w-lg p-3 text-ink-2">
                        {tab === "people" ? (
                          <>
                            {
                              state.departments.find(
                                (d) => d.id === r.departmentId,
                              )?.shortName
                            }{" "}
                            ·{" "}
                            {
                              state.positions.find(
                                (p) => p.id === r.positionRefId,
                              )?.title
                            }
                          </>
                        ) : (
                          (r.scope ?? r.sourceRef)
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          {tab === "people" && (
                            <Button
                              variant="ghost"
                              onClick={() => setHistory(r.id)}
                            >
                              Lịch sử
                            </Button>
                          )}
                          {allowed && (
                            <>
                              <Button onClick={() => edit(item)}>Sửa</Button>
                              <Button
                                variant="ghost"
                                onClick={() => edit(item, true)}
                              >
                                Xóa
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <EmptyState title="Không có dữ liệu phù hợp" />
          )}
        </Card>
      )}
      <p className="text-xs leading-relaxed text-ink-3">
        QĐ01 là tham chiếu tổ chức/trách nhiệm; không tự suy ra quyền phần mềm.
        Cơ cấu và nhân sự minh họa có thể chỉnh sửa để chạy kịch bản demo.
      </p>
      <Modal
        open={form !== null}
        title={`${remove ? "Xóa" : form?.id ? "Cập nhật" : "Thêm"} ${labels[tab].toLocaleLowerCase("vi")}`}
        onClose={() => setForm(null)}
      >
        <form className="space-y-3" onSubmit={save}>
          {error && (
            <p
              role="alert"
              className="rounded-ctl bg-danger-50 p-3 text-xs text-danger-600"
            >
              {error}
            </p>
          )}
          {remove ? (
            <Callout title="Xác nhận xóa dữ liệu mô phỏng" tone="warn">
              {form?.name ?? form?.title}. Chỉ xóa mục chưa được hồ sơ nghiệp vụ
              tham chiếu; thao tác có nhật ký.
            </Callout>
          ) : (
            fields[tab].map(([key, label]) => (
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
                    {state.positions.map((p) => (
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
                    {state.people
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
            <Button onClick={() => setForm(null)}>Hủy</Button>
            <Button type="submit" variant={remove ? "danger" : "primary"}>
              {remove ? "Xác nhận xóa" : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        open={history !== null}
        title="Lịch sử vị trí / đơn vị"
        onClose={() => setHistory(null)}
      >
        {(
          (
            state.people.find((p) => p.id === history) as {
              membershipHistory?: {
                departmentId: string;
                positionRefId: string;
                at: string;
                reason: string;
              }[];
            }
          )?.membershipHistory ?? []
        ).map((h, i) => (
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
          Bản chụp vị trí lúc giao việc nằm trong từng nhiệm vụ. Nếu chưa có
          thay đổi, dữ liệu hiện tại là mốc mẫu ban đầu.
        </p>
      </Modal>
    </div>
  );
}
