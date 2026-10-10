"use client";

import { ArrowRight, ShieldCheck } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { USERS } from "@/lib/mock/data";
import { useApp } from "@/lib/store";
import { Avatar, Card } from "@/components/ui";

const roleLabel: Record<string, string> = {
  lanh_dao: "Lãnh đạo Ban",
  truong_phong: "Trưởng phòng",
  cong_chuc: "Công chức",
};

export default function LoginPage() {
  const router = useRouter();
  const { user } = useApp();
  const [busy, setBusy] = useState<string | null>(null);

  async function choose(userId: string) {
    setBusy(userId);
    await api.login(userId);
    router.replace("/dashboard");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-card bg-accent-600 text-[15px] font-bold text-white shadow-raise">
            BT
          </div>
          <div>
            <p className="text-[15px] font-semibold leading-tight">Ban Tổ chức Tỉnh ủy</p>
            <p className="text-[12px] text-ink-3">Quản lý nhiệm vụ & đánh giá</p>
          </div>
        </div>

        <Card className="p-5">
          <h1 className="text-[16px] font-semibold">Đăng nhập bản demo</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
            Chọn một tài khoản mẫu để xem giao diện và quyền thay đổi theo vai trò.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {USERS.map((u) => {
              const active = user?.id === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  disabled={busy !== null}
                  onClick={() => choose(u.id)}
                  className="group flex items-center gap-3 rounded-card bg-fill p-3 text-left transition-colors hover:bg-accent-50 active:translate-y-px disabled:pointer-events-none"
                >
                  <Avatar name={u.name} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">{u.name}</span>
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
        </Card>

        <div className="mt-4 flex items-start gap-2 px-1 text-[12px] leading-relaxed text-ink-3">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" />
          <span>
            Dữ liệu minh họa, không kết nối hệ thống thật. Xác thực thật (Cloudflare Access + MFA)
            nằm ngoài phạm vi bản UI mock.
          </span>
        </div>
      </div>
    </main>
  );
}

