"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { useApp } from "@/lib/store";
import { canAssign, canManage, canViewDepartment } from "@/lib/policy";
import { api } from "@/lib/api";
import { isApiWorkspace } from "@/lib/workspace-runtime";
import {
  Badge,
  Button,
  Card,
  Input,
  SectionHeader,
  Select,
} from "@/components/ui";
import {
  DepartmentCards,
  HistoryModal,
  MasterDataModal,
  MasterTable,
  ORG_TABS,
  ORG_TAB_LABELS,
  type OrgTab,
} from "@/components/organization";

export default function OrganizationPage() {
  const state = useApp();
  const { user } = state;
  const [tab, setTab] = useState<OrgTab>("departments");
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
  const allowed =
    !isApiWorkspace() &&
    (tab === "people" ? canAssign(user) : canManage(user));
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
        if (tab === "departments") api.removeDepartment(id, reason);
        if (tab === "people") api.removePerson(id, reason);
        if (tab === "positions") api.removePosition(id);
        if (tab === "responsibilities") api.removeResponsibility(id);
      } else {
        if (tab === "departments")
          api.saveDepartment(
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
          api.savePerson(
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
          api.savePosition({
            id,
            title: form.title ?? "",
            scope: form.scope ?? "",
          });
        if (tab === "responsibilities")
          api.saveResponsibility({
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
              Thêm {ORG_TAB_LABELS[tab].toLocaleLowerCase("vi")}
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
          {ORG_TABS.map((t) => (
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
              {ORG_TAB_LABELS[t]}
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
          <Badge className="rounded-sm px-2 py-0.5 ">{items.length} mục</Badge>
        </div>
      </Card>
      {tab === "departments" ? (
        <DepartmentCards
          items={items as typeof state.departments}
          state={state}
          allowed={allowed}
          onEdit={edit}
        />
      ) : (
        <MasterTable
          tab={tab}
          items={items}
          state={state}
          allowed={allowed}
          onEdit={edit}
          onHistory={setHistory}
        />
      )}
      <MasterDataModal
        tab={tab}
        form={form}
        setForm={setForm}
        remove={remove}
        reason={reason}
        setReason={setReason}
        error={error}
        departments={departments}
        positions={state.positions}
        people={state.people}
        onSubmit={save}
        onClose={() => setForm(null)}
      />
      <HistoryModal
        personId={history}
        state={state}
        onClose={() => setHistory(null)}
      />
    </div>
  );
}
