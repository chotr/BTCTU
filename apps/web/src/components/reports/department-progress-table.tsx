"use client";

import { Card } from "@/components/ui";
import {
  TASK_DONE,
  TASK_EDITABLE,
  TASK_IN_REVIEW,
  inGroup,
} from "@/lib/domain/workflow";
import type { AppState } from "@/lib/store";
import type { Task } from "@/lib/types";

/** Bảng tiến độ đơn vị (nhiệm vụ theo giai đoạn vòng đời). */
export function DepartmentProgressTable({
  departments,
  tasks,
  dept,
}: {
  departments: AppState["departments"];
  tasks: Task[];
  dept: string;
}) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-[13px]">
        <thead className="bg-fill text-left text-xs text-ink-3">
          <tr>
            {[
              "Phòng",
              "Tổng việc",
              "Đang làm / trả lại",
              "Chờ nghiệm thu",
              "Đã nghiệm thu",
            ].map((h) => (
              <th key={h} className="p-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {departments
            .filter((d) => dept === "ALL" || d.id === dept)
            .map((d) => {
              const ts = tasks.filter((t) => t.departmentId === d.id);
              return (
                <tr key={d.id} className="shadow-[0_1px_0_#edf1f6]">
                  <td className="p-3 font-medium">{d.shortName}</td>
                  <td className="p-3">{ts.length}</td>
                  <td className="p-3">
                    {ts.filter((t) => inGroup(TASK_EDITABLE, t.status)).length}
                  </td>
                  <td className="p-3">
                    {ts.filter((t) => inGroup(TASK_IN_REVIEW, t.status)).length}
                  </td>
                  <td className="p-3">
                    {ts.filter((t) => inGroup(TASK_DONE, t.status)).length}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </Card>
  );
}
