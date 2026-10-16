"use client";

import { ArrowRight, ShieldCheck } from "@phosphor-icons/react";
import Image from "next/image";
import quocHuyImg from "../../../public/quoc-huy.png";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { Avatar, Button, Card, Field, Select } from "@/components/ui";

const roleLabel: Record<string, string> = {
  lanh_dao: "Lãnh đạo Ban",
  truong_phong: "Trưởng phòng",
  cong_chuc: "Công chức",
};

export default function LoginPage() {
  const router = useRouter();
  const { user, people, departments, hydrated } = useApp();
  const [personId, setPersonId] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function choose(userId: string) {
    setBusy(userId);
    const loggedIn = await api.login(userId);
    if (loggedIn) {
      router.replace("/dashboard");
      return;
    }
    setBusy(null);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex items-center gap-3.5">
          <Image
            src={quocHuyImg}
            alt="Quốc huy Việt Nam"
            className="h-12 w-auto shrink-0 object-contain drop-shadow-sm"
            priority
          />
          <div>
            <p className="text-[15px] font-semibold leading-tight">
              Ban Tổ chức Tỉnh ủy
            </p>
            <p className="mt-0.5 text-[12px] text-ink-3">
              Quản lý nhiệm vụ & đánh giá
            </p>
          </div>
        </div>

        <Card className="p-5">
          <h1 className="text-[16px] font-semibold">Chọn hồ sơ làm việc</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
            Chọn tài khoản được cấp để mở không gian làm việc theo đúng vai trò.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {api.accounts().map((u) => {
              const active = user?.id === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  disabled={busy !== null || !hydrated}
                  onClick={() => choose(u.id)}
                  className="group flex items-center gap-3 rounded-card bg-fill p-3 text-left transition-colors hover:bg-accent-50 active:translate-y-px disabled:pointer-events-none"
                >
                  <Avatar name={u.name} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">
                      {u.name}
                    </span>
                    <span className="block truncate text-[12px] text-ink-3">
                      {roleLabel[u.role]}
                      {u.departmentName ? ` · ${u.departmentName}` : ""}
                    </span>
                  </span>
                  {active ? (
                    <span className="rounded-pill bg-accent-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                      Hiện tại
                    </span>
                  ) : (
                    <ArrowRight
                      size={16}
                      weight="bold"
                      className="text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-600"
                    />
                  )}
                </button>
              );
            })}
          </div>
          <details className="mt-4 rounded-ctl bg-fill p-3">
            <summary className="cursor-pointer text-xs font-medium text-ink-2">
              Tài khoản nhân sự khác
            </summary>
            <div className="mt-3 space-y-3">
              <Field label="Nhân sự">
                <Select
                  className="w-full"
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                >
                  <option value="">Chọn nhân sự</option>
                  {people
                    .filter((p) => !api.accounts().some((u) => u.id === p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ·{" "}
                        {
                          departments.find((d) => d.id === p.departmentId)
                            ?.shortName
                        }
                      </option>
                    ))}
                </Select>
              </Field>
              <Button
                disabled={!personId || busy !== null || !hydrated}
                onClick={() => choose(personId)}
                className="w-full"
              >
                Vào tài khoản đã chọn
              </Button>
            </div>
          </details>
        </Card>
      </div>
    </main>
  );
}
