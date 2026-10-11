"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { useApp } from "@/lib/store";
import { scopedData } from "@/lib/exports";
import { useBusy } from "@/components/use-busy";
import {
  evaluationActions,
  evaluationLabel,
  evaluationTotal,
} from "@/lib/evaluation";
import { EVAL_STATUS_LABELS } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  ClassificationBadge,
  EmptyState,
  EvalStatusBadge,
  Field,
  Input,
  Modal,
  SectionHeader,
  Select,
} from "@/components/ui";
export default function EvaluationPage() {
  const state = useApp();
  const scoped = scopedData(state);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [period, setPeriod] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [subjectType, setSubjectType] = useState<"PERSON" | "DEPARTMENT">(
    "PERSON",
  );
  const [subject, setSubject] = useState("");
  const [newPeriod, setNewPeriod] = useState("");
  const [leader, setLeader] = useState(false);
  const { busy, run } = useBusy();
  const rows = scoped.evaluations.filter(
    (e) =>
      (period === "ALL" || e.periodId === period) &&
      (status === "ALL" || e.status === status) &&
      (type === "ALL" || e.subjectType === type) &&
      (evaluationLabel(e, state) + e.id)
        .toLocaleLowerCase("vi")
        .includes(q.toLocaleLowerCase("vi")),
  );
  async function create(e: React.FormEvent) {
    e.preventDefault();
    await run(async () => {
      const id = await evaluationActions.createEvaluation({
        periodId: newPeriod,
        subjectType,
        subjectId: subject,
        isLeader: leader,
      });
      if (id) {
        setOpen(false);
        router.push(`/evaluation/${id}`);
      }
    });
  }
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Hồ sơ đánh giá"
        hint="Điểm tính là đầu vào; xếp loại còn phụ thuộc điều kiện và quyết định có thẩm quyền."
        actions={
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setOpen(true)}
          >
            Tạo hồ sơ
          </Button>
        }
      />
      <Card className="flex flex-wrap items-center gap-2 p-3">
        <Input
          aria-label="Tìm hồ sơ đánh giá"
          placeholder="Tên đối tượng hoặc mã hồ sơ…"
          className="w-full sm:w-72"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select
          aria-label="Kỳ đánh giá"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="ALL">Mọi kỳ</option>
          {state.periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Loại đối tượng"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="ALL">Cá nhân & tập thể</option>
          <option value="PERSON">Cá nhân</option>
          <option value="DEPARTMENT">Tập thể phòng</option>
        </Select>
        <Select
          aria-label="Trạng thái hồ sơ"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">Mọi trạng thái</option>
          {Object.entries(EVAL_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <Badge>{rows.length} hồ sơ</Badge>
      </Card>
      <Card className="overflow-x-auto">
        {rows.length ? (
          <table className="w-full min-w-[850px] text-[13px]">
            <thead className="bg-fill text-left text-xs text-ink-3">
              <tr>
                {[
                  "Đối tượng",
                  "Kỳ",
                  "Điểm ứng viên",
                  "Trạng thái",
                  "Quyết định",
                ].map((h) => (
                  <th key={h} className="p-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr
                  key={e.id}
                  className="shadow-[0_1px_0_#edf1f6] hover:bg-fill"
                >
                  <td className="p-3">
                    <Link
                      className="font-semibold text-accent-700 hover:underline"
                      href={`/evaluation/${e.id}`}
                    >
                      {evaluationLabel(e, state)}
                    </Link>
                    <p className="mt-1 text-xs text-ink-3">
                      {e.subjectType === "PERSON" ? "Cá nhân" : "Tập thể phòng"}{" "}
                      ·{" "}
                      {
                        state.departments.find((d) => d.id === e.departmentId)
                          ?.shortName
                      }
                    </p>
                  </td>
                  <td className="p-3">
                    {state.periods.find((p) => p.id === e.periodId)?.name}
                  </td>
                  <td className="p-3 tabular-nums">
                    {e.calculationRuns?.length
                      ? evaluationTotal(e).toFixed(2)
                      : e.status === "DRAFT"
                        ? "Chưa tính lại"
                        : `${evaluationTotal(e).toFixed(2)} · mẫu`}
                    <p className="mt-1 text-xs text-ink-3">
                      {e.isLeader ? "ABCD" : "ABC · thiết kế ứng viên"}
                    </p>
                  </td>
                  <td className="p-3">
                    <EvalStatusBadge status={e.status} />
                  </td>
                  <td className="p-3">
                    {e.decision ? (
                      <ClassificationBadge value={e.decision.classification} />
                    ) : (
                      <span className="text-ink-3">Chưa quyết định</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title="Chưa có hồ sơ phù hợp"
            hint="Tạo hồ sơ trong kỳ đang mở hoặc thay đổi bộ lọc."
          />
        )}
      </Card>
      <p className="text-xs text-ink-3">
        Các trạng thái, vai trò demo và công thức chuyển nhiệm vụ thành chỉ số
        là thiết kế ứng viên. Không đại diện kết quả đánh giá chính thức.
      </p>
      <Modal
        open={open}
        title="Tạo hồ sơ đánh giá"
        onClose={() => setOpen(false)}
      >
        <form onSubmit={create} className="space-y-3">
          <Field label="Kỳ đang mở">
            <Select
              required
              className="w-full"
              value={newPeriod}
              onChange={(e) => setNewPeriod(e.target.value)}
            >
              <option value="">Chọn kỳ</option>
              {state.periods
                .filter((p) => p.status === "ACTIVE")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </Select>
          </Field>
          <Field label="Loại đối tượng">
            <Select
              className="w-full"
              value={subjectType}
              onChange={(e) => {
                setSubjectType(e.target.value as typeof subjectType);
                setSubject("");
              }}
            >
              <option value="PERSON">Cá nhân</option>
              {state.user?.role !== "cong_chuc" && (
                <option value="DEPARTMENT">Tập thể phòng</option>
              )}
            </Select>
          </Field>
          <Field label="Đối tượng được đánh giá">
            <Select
              required
              className="w-full"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="">Chọn đối tượng</option>
              {(subjectType === "PERSON"
                ? scoped.people
                : scoped.departments
              ).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          {subjectType === "PERSON" && (
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={leader}
                onChange={(e) => setLeader(e.target.checked)}
              />
              Sử dụng mô hình lãnh đạo, quản lý (ABCD)
            </label>
          )}
          <p className="text-xs text-ink-3">
            Tập thể có hồ sơ riêng và đầu vào nhiệm vụ của phòng; không lấy
            trung bình điểm cá nhân để xếp loại tập thể.
          </p>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary" disabled={busy}>
              Tạo hồ sơ
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
