"use client";

import { Plus } from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { api, perm } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Avatar, Badge, Button, Card, EmptyState, Field, Input, Modal, SectionHeader, Select, TaskStatusBadge } from "@/components/ui";
import type { CatalogItem, Department, TaskStatus } from "@/lib/types";

const statusOptions: { value: TaskStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ASSIGNED", label: "Đã giao" },
  { value: "IN_PROGRESS", label: "Đang thực hiện" },
  { value: "SUBMITTED", label: "Chờ nghiệm thu" },
  { value: "RETURNED", label: "Yêu cầu chỉnh sửa" },
  { value: "REVIEWED", label: "Đã thẩm định" },
  { value: "ACCEPTED", label: "Đã nghiệm thu" },
  { value: "LOCKED", label: "Đã khóa kỳ" },
];

export default function TasksPage() {
  const { tasks, departments, people, catalog, user } = useApp();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TaskStatus | "ALL">("ALL");
  const [dept, setDept] = useState("ALL");
  const [openCreate, setOpenCreate] = useState(false);

  const visibleDepts = user?.role === "truong_phong" ? departments.filter((d) => d.id === user.departmentId) : departments;

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (status !== "ALL" && t.status !== status) return false;
      if (dept !== "ALL" && t.departmentId !== dept) return false;
      if (q.trim()) {
        const hay = (t.title + " " + t.id + " " + (people.find((p) => p.id === t.assigneeId)?.name ?? "")).toLowerCase();
        if (!hay.includes(q.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [tasks, status, dept, q, people]);

  const publishedCatalog = catalog.filter((c) => c.status === "PUBLISHED");

  return (
    <div>
      <SectionHeader
        title="Công việc"
        hint="Nhiệm vụ phát sinh từ danh mục công việc, phân công gắn vị trí việc làm (QĐ01 Điều 7)"
        actions={
          perm.canAssign(user) ? (
            <Button variant="primary" icon={<Plus size={14} weight="bold" />} onClick={() => setOpenCreate(true)}>
              Tạo nhiệm vụ
            </Button>
          ) : undefined
        }
      />

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input className="w-64" placeholder="Tìm theo tên, mã, người thực hiện…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select className="w-44" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus | "ALL")}>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Select className="w-56" value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="ALL">Tất cả phòng</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
          <span className="ml-auto text-[11px] text-ink-3">{filtered.length} kết quả</span>
        </div>
      </Card>

      <Card className="mt-3 overflow-x-auto">
        {filtered.length === 0 ? (
          <EmptyState title="Không có nhiệm vụ khớp bộ lọc" hint="Thử đổi trạng thái, phòng hoặc từ khóa tìm kiếm." />
        ) : (
          <table className="w-full min-w-[860px] text-[13px]">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-ink-3">
                <th className="px-3 py-2.5">Mã</th>
                <th className="px-3 py-2.5">Nhiệm vụ</th>
                <th className="px-3 py-2.5">Phòng</th>
                <th className="px-3 py-2.5">Người thực hiện</th>
                <th className="px-3 py-2.5">Hạn</th>
                <th className="px-3 py-2.5">Tiến độ</th>
                <th className="px-3 py-2.5">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const assignee = people.find((p) => p.id === t.assigneeId);
                const deptRow = departments.find((d) => d.id === t.departmentId);
                const overdue = new Date(t.dueAt).getTime() < Date.now() && !["ACCEPTED", "LOCKED"].includes(t.status);
                return (
                  <tr key={t.id}>
                    <td className="px-3 py-2.5 font-medium text-accent-600">
                      <Link href={"/tasks/" + t.id} className="hover:underline">
                        {t.id}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">
                      <Link href={"/tasks/" + t.id} className="font-medium hover:underline">
                        {t.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-ink-2">{deptRow?.shortName ?? deptRow?.name}</td>
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-2">
                        <Avatar name={assignee?.name ?? "?"} size="sm" />
                        {assignee?.name}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-ink-2">
                      {fmtDate(t.dueAt)}
                      {overdue ? <Badge tone="danger">Quá hạn</Badge> : null}
                    </td>
                    <td className="px-3 py-2.5 text-ink-2">{t.progress}%</td>
                    <td className="px-3 py-2.5">
                      <TaskStatusBadge status={t.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <CreateTaskModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        catalogItems={publishedCatalog}
        departments={visibleDepts}
      />
    </div>
  );
}

function CreateTaskModal({
  open,
  onClose,
  catalogItems,
  departments,
}: {
  open: boolean;
  onClose: () => void;
  catalogItems: CatalogItem[];
  departments: Department[];
}) {
  const { people } = useApp();
  const [catalogItemId, setCatalogItemId] = useState("");
  const [deptId, setDeptId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("2026-09-30");

  const members = people.filter((p) => p.departmentId === deptId);

  async function submit() {
    const ok = await api.createTask({
      catalogItemId,
      assigneeId,
      title,
      description,
      dueAt: dueAt + "T00:00:00+07:00",
    });
    if (ok) {
      setTitle("");
      setDescription("");
      onClose();
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo và phân công nhiệm vụ"
      footer={
        <>
          <Button onClick={onClose}>Hủy</Button>
          <Button variant="primary" disabled={!catalogItemId || !assigneeId || !title.trim()} onClick={submit}>
            Tạo & phân công
          </Button>
        </>
      }
    >
      <Field label="Công việc trong danh mục">
        <Select value={catalogItemId} onChange={(e) => setCatalogItemId(e.target.value)}>
          <option value="">Chọn công việc…</option>
          {catalogItems.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Tên nhiệm vụ">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên nhiệm vụ phát sinh thực tế" />
      </Field>
      <Field label="Mô tả" hint="Không bắt buộc">
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả ngắn" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phòng">
          <Select value={deptId} onChange={(e) => { setDeptId(e.target.value); setAssigneeId(""); }}>
            <option value="">Chọn phòng…</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Người thực hiện">
          <Select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">Chọn người…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} · {m.title}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Hạn hoàn thành">
        <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
      </Field>
    </Modal>
  );
}
