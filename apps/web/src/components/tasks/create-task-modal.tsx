"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { useBusy } from "@/components/use-busy";
import { Button, Field, Input, Modal, Select } from "@/components/ui";

export function CreateTask({
  open,
  onClose,
  catalog,
  people,
}: {
  open: boolean;
  onClose: () => void;
  catalog: ReturnType<typeof useApp>["catalog"];
  people: ReturnType<typeof useApp>["people"];
}) {
  const { periods } = useApp();
  const [cat, setCat] = useState("");
  const [person, setPerson] = useState("");
  const [period, setPeriod] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState("");
  const [quantity, setQuantity] = useState("1");
  const { busy, run } = useBusy();
  async function save(event: React.FormEvent) {
    event.preventDefault();
    await run(async () => {
      if (
        await api.createTask({
          catalogItemId: cat,
          assigneeId: person,
          periodId: period,
          title,
          description,
          dueAt: due,
          plannedQuantity: Number(quantity),
        })
      ) {
        onClose();
        setTitle("");
        setDescription("");
      }
    });
  }
  return (
    <Modal open={open} title="Giao nhiệm vụ mới" onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        <Field label="Danh mục đã công bố">
          <Select
            required
            className="w-full"
            value={cat}
            onChange={(e) => {
              setCat(e.target.value);
              setTitle(
                catalog.find((c) => c.id === e.target.value)?.name ?? "",
              );
            }}
          >
            <option value="">Chọn công việc</option>
            {catalog.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} · {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tên nhiệm vụ">
          <Input
            className="w-full"
            required
            maxLength={250}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Yêu cầu / mô tả">
          <textarea
            className="control min-h-24 w-full py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Field label="Người thực hiện">
          <Select
            required
            className="w-full"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
          >
            <option value="">Chọn nhân sự trong phạm vi</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.title}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Kỳ nghiệp vụ">
            <Select
              className="w-full"
              required
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="">Chọn kỳ đang mở</option>
              {periods
                .filter((p) => p.status === "ACTIVE")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </Select>
          </Field>
          <Field label="Hạn hoàn thành">
            <Input
              type="date"
              required
              className="w-full"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
          </Field>
        </div>
        <Field
          label="Số lượng kế hoạch"
          hint="Được giữ cùng snapshot danh mục để giải thích KPI."
        >
          <Input
            type="number"
            required
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? "Đang lưu…" : "Tạo và giao việc"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
