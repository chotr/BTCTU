"use client";

import { Export, ListMagnifyingGlass } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { fmtDateTime } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Avatar, Badge, Button, Card, EmptyState, Input, SectionHeader, Select } from "@/components/ui";

export default function AuditPage() {
  const { audit, people } = useApp();
  const [q, setQ] = useState("");
  const [outcome, setOutcome] = useState<"ALL" | "OK" | "DENIED">("ALL");

  const filtered = useMemo(() => {
    return audit.filter((a) => {
      if (outcome !== "ALL" && a.outcome !== outcome) return false;
      if (q.trim()) {
        const hay = (a.action + " " + a.resource + " " + a.detail + " " + (people.find((p) => p.id === a.actorId)?.name ?? "")).toLowerCase();
        if (!hay.includes(q.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [audit, q, outcome, people]);

  return (
    <div>
      <SectionHeader
        title="Nhật ký hoạt động"
        hint="Ghi vết mọi truy cập, cập nhật, phê duyệt — yêu cầu kiểm toán từ QĐ342"
        actions={
          <Button variant="secondary" icon={<Export size={14} weight="bold" />} onClick={() => api.exportReport("Nhật ký hoạt động")}>
            Xuất nhật ký
          </Button>
        }
      />

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input className="w-72" placeholder="Tìm theo hành động, đối tượng, người thực hiện…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select className="w-40" value={outcome} onChange={(e) => setOutcome(e.target.value as "ALL" | "OK" | "DENIED")}>
            <option value="ALL">Mọi kết quả</option>
            <option value="OK">Thành công</option>
            <option value="DENIED">Bị từ chối</option>
          </Select>
          <span className="ml-auto text-[11px] text-ink-3">{filtered.length} sự kiện</span>
        </div>
      </Card>

      <Card className="mt-3 overflow-x-auto">
        {filtered.length === 0 ? (
          <EmptyState icon={<ListMagnifyingGlass size={16} />} title="Không có sự kiện khớp bộ lọc" />
        ) : (
          <table className="w-full min-w-[900px] text-[13px]">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-ink-3">
                <th className="px-3 py-2.5">Thời gian</th>
                <th className="px-3 py-2.5">Người thực hiện</th>
                <th className="px-3 py-2.5">Hành động</th>
                <th className="px-3 py-2.5">Đối tượng</th>
                <th className="px-3 py-2.5">Chi tiết</th>
                <th className="px-3 py-2.5">Kết quả</th>
                <th className="px-3 py-2.5">Request ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const actor = people.find((p) => p.id === a.actorId);
                return (
                  <tr key={a.id} className={a.outcome === "DENIED" ? "bg-danger-50/60" : "transition-colors hover:bg-fill"}>
                    <td className="whitespace-nowrap px-3 py-2.5 text-ink-2">{fmtDateTime(a.at)}</td>
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-2">
                        <Avatar name={actor?.name ?? "?"} size="sm" />
                        {actor?.name ?? "?"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-medium">{a.action}</td>
                    <td className="px-3 py-2.5 text-ink-2">{a.resource}</td>
                    <td className="max-w-[260px] px-3 py-2.5 text-[12px] text-ink-3">{a.detail}</td>
                    <td className="px-3 py-2.5">
                      {a.outcome === "OK" ? <Badge tone="ok">Thành công</Badge> : <Badge tone="danger">Từ chối</Badge>}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-ink-3">{a.requestId}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

