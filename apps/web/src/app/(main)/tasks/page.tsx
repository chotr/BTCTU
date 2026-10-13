"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, MagnifyingGlass, Export } from "@phosphor-icons/react";
import { useApp } from "@/lib/store";
import { canAssign, canViewDepartment } from "@/lib/policy";
import { scopedData } from "@/lib/access";
import { api } from "@/lib/api";
import { personName } from "@/lib/shared/names";
import { TASK_STATUS_LABELS } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Progress,
  SectionHeader,
  Select,
  TaskStatusBadge,
} from "@/components/ui";
import { CreateTask } from "./create-task-modal";

export default function TasksPage() {
  const state = useApp();
  const { user, periods, catalog, activeCatalogVersion } = state;
  const scoped = scopedData(state);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [periodId, setPeriod] = useState("ALL");
  const [dept, setDept] = useState("ALL");
  const [mine, setMine] = useState(false);
  const [open, setOpen] = useState(false);
  const rows = scoped.tasks.filter(
    (t) =>
      (!mine || t.assigneeId === user?.id) &&
      (status === "ALL" || t.status === status) &&
      (dept === "ALL" || t.departmentId === dept) &&
      (periodId === "ALL" ||
        t.periodId === periodId ||
        t.period === periods.find((p) => p.id === periodId)?.name) &&
      (
        t.title +
        " " +
        t.id +
        " " +
        personName(state, t.assigneeId)
      )
        .toLocaleLowerCase("vi")
        .includes(query.toLocaleLowerCase("vi")),
  );
  return (
    <div>
      <SectionHeader
        title="Nhiệm vụ"
        hint="Giao việc, theo dõi sản phẩm và nghiệm thu trong một luồng."
        actions={
          <>
            <Button
              icon={<Export size={15} />}
              onClick={() => api.exportReport("tasks", periodId, dept)}
            >
              Xuất CSV
            </Button>
            {canAssign(user) && (
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => setOpen(true)}
              >
                Giao nhiệm vụ
              </Button>
            )}
          </>
        }
      />
      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <MagnifyingGlass size={18} className="text-ink-3" />
        <Input
          aria-label="Tìm nhiệm vụ"
          placeholder="Tên, mã, người thực hiện…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-64"
        />
        <Select
          aria-label="Trạng thái nhiệm vụ"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">Mọi trạng thái</option>
          {Object.entries(TASK_STATUS_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Kỳ nhiệm vụ"
          value={periodId}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="ALL">Mọi kỳ</option>
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Phòng thực hiện"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        >
          <option value="ALL">Phạm vi của tôi</option>
          {scoped.departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.shortName}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={mine}
            onChange={(e) => setMine(e.target.checked)}
          />
          Việc của tôi
        </label>
        <Badge>{rows.length} nhiệm vụ</Badge>
      </Card>
      <Card className="overflow-x-auto">
        {rows.length ? (
          <table className="w-full min-w-[820px] text-[13px]">
            <thead>
              <tr className="bg-fill text-left text-xs text-ink-3">
                {[
                  "Nhiệm vụ / sản phẩm",
                  "Người thực hiện",
                  "Hạn hoàn thành",
                  "Tiến độ",
                  "Trạng thái",
                ].map((h) => (
                  <th key={h} className="p-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr
                  key={t.id}
                  className="shadow-[0_1px_0_#edf1f6] hover:bg-fill"
                >
                  <td className="max-w-96 p-3">
                    <Link
                      href={`/tasks/${t.id}`}
                      className="font-semibold text-accent-700 hover:underline"
                    >
                      {t.title}
                    </Link>
                    <p className="mt-1 text-xs text-ink-3">
                      {t.id} · {t.period}
                    </p>
                  </td>
                  <td className="p-3">
                    {personName(state, t.assigneeId)}
                    <p className="mt-1 text-xs text-ink-3">
                      {
                        state.departments.find((d) => d.id === t.departmentId)
                          ?.shortName
                      }
                    </p>
                  </td>
                  <td className="p-3">{fmtDate(t.dueAt)}</td>
                  <td className="w-28 p-3">
                    <p className="mb-1 text-xs tabular-nums">{t.progress}%</p>
                    <Progress value={t.progress} />
                  </td>
                  <td className="p-3">
                    <TaskStatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title="Chưa có nhiệm vụ phù hợp"
            hint="Thử đổi bộ lọc hoặc giao nhiệm vụ từ danh mục đã công bố."
          />
        )}
      </Card>
      <CreateTask
        open={open}
        onClose={() => setOpen(false)}
        catalog={catalog.filter(
          (c) => c.status === "PUBLISHED" && c.version === activeCatalogVersion,
        )}
        people={state.people.filter((p) =>
          canViewDepartment(user, p.departmentId),
        )}
      />
    </div>
  );
}

