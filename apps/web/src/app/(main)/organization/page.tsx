"use client";

import { Info } from "@phosphor-icons/react";
import { useApp } from "@/lib/store";
import { Avatar, Badge, Card, Chip, SectionHeader } from "@/components/ui";

export default function OrganizationPage() {
  const { departments, people, positions, responsibilities } = useApp();

  return (
    <div>
      <SectionHeader
        title="Tổ chức & nhân sự"
        hint="Bốn đơn vị theo QĐ01 Điều 3–6 · tên người là dữ liệu minh họa"
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          {departments.map((d) => {
            const members = people.filter((p) => p.departmentId === d.id);
            const head = people.find((p) => p.id === d.headId);
            const deptResponsibilities = responsibilities.filter((r) => r.departmentId === d.id);
            return (
              <Card key={d.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[14px] font-semibold">{d.name}</h2>
                      <Chip>{d.code}</Chip>
                    </div>
                    <p className="mt-1 max-w-[640px] text-[12px] leading-relaxed text-ink-2">{d.functionText}</p>
                  </div>
                  <Badge tone="neutral">Người đứng đầu: {head?.name}</Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {deptResponsibilities.map((r) => (
                    <Chip key={r.id} className="bg-accent-50 text-accent-700">
                      {r.name} · <span className="font-normal opacity-80">{r.sourceRef}</span>
                    </Chip>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center gap-2.5 rounded-card bg-fill px-3 py-2">
                      <Avatar name={m.name} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium">{m.name}</p>
                        <p className="truncate text-[11px] text-ink-3">{m.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h2 className="mb-3 text-[14px] font-semibold">Danh mục vị trí (cơ cấu)</h2>
            <div className="flex flex-col gap-2">
              {positions.map((p) => (
                <div key={p.id} className="rounded-card bg-fill px-3 py-2">
                  <p className="text-[13px] font-medium">{p.title}</p>
                  <p className="text-[11px] text-ink-3">{p.scope}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-ink-3">
              <Info size={14} className="mt-0.5 shrink-0" />
              <span>
                QĐ01 nêu cơ cấu thành phần nhưng chưa có danh mục vị trí việc làm chính thức — đây là TBD, hệ thống không tự
                bịa danh mục.
              </span>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="mb-2 text-[14px] font-semibold">Quy tắc phân công</h2>
            <p className="text-[12px] leading-relaxed text-ink-2">
              Chánh Văn phòng, Trưởng các phòng có trách nhiệm phân công nhiệm vụ cụ thể cho thành viên, gắn với vị trí việc
              làm của từng người.
            </p>
            <p className="mt-2 text-[11px] text-ink-3">QĐ01 · Điều 7.2 — trách nhiệm nghiệp vụ, không suy ra quyền phần mềm độc quyền.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

