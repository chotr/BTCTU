"use client";

import { Card, Progress } from "@/components/ui";
import { TASK_DONE, inGroup } from "@/lib/domain/workflow";
import type { AppState } from "@/lib/store";
import type { Role, Task } from "@/lib/types";

/** Personal / department completion progress card. */
export function DepartmentProgress({
  departments,
  tasks,
  role,
}: {
  departments: AppState["departments"];
  tasks: Task[];
  role: Role | undefined;
}) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-sm font-semibold">
        {role === "cong_chuc" ? "Tiến độ nhiệm vụ của tôi" : "Tiến độ theo phòng"}
      </h2>
      <div className="space-y-5">
        {departments.map((d) => {
          const dt = tasks.filter((t) => t.departmentId === d.id);
          const dd = dt.filter((t) => inGroup(TASK_DONE, t.status)).length;
          return (
            <div key={d.id}>
              <div className="mb-2 flex flex-wrap justify-between gap-2 text-xs">
                <span className="font-medium">{d.name}</span>
                <span className="text-ink-3">
                  {dd}/{dt.length} nghiệm thu
                </span>
              </div>
              <Progress value={dt.length ? (dd / dt.length) * 100 : 0} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
