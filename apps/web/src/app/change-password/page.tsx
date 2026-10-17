"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { Button, Card, Field, Input } from "@/components/ui";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { hydrated, passwordChangeRequired } = useApp();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hydrated && !passwordChangeRequired) router.replace("/login");
  }, [hydrated, passwordChangeRequired, router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (newPassword !== confirmation) {
      setError("Mật khẩu xác nhận chưa khớp.");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await api.changePassword(currentPassword, newPassword);
    if (result.ok) {
      router.replace("/login");
      return;
    }
    setError(result.message ?? "Không thể đổi mật khẩu. Vui lòng thử lại.");
    setBusy(false);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-[380px] p-5">
        <h1 className="text-[16px] font-semibold">Đổi mật khẩu</h1>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
          Đây là lần đăng nhập đầu tiên. Hãy đặt mật khẩu riêng để tiếp tục.
        </p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <Field label="Mật khẩu tạm thời">
            <Input
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full"
            />
          </Field>
          <Field label="Mật khẩu mới">
            <Input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full"
            />
          </Field>
          <Field label="Xác nhận mật khẩu mới">
            <Input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="w-full"
            />
          </Field>
          {error ? <p role="alert" className="text-[12px] text-danger">{error}</p> : null}
          <Button type="submit" variant="primary" disabled={busy} className="w-full">
            {busy ? "Đang cập nhật…" : "Đổi mật khẩu"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
