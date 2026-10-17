"use client";

import { Eye, EyeSlash, ShieldCheck } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import quocHuyImg from "../../../public/quoc-huy.png";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { Button, Card, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { hydrated } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDev = process.env.NODE_ENV !== "production";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError(null);
    setBusy(true);
    try {
      const result = await api.loginWithCredentials(email.trim(), password);
      if (result.ok) {
        router.replace("/dashboard");
        return;
      }
      setError(result.message ?? "Không thể đăng nhập. Vui lòng thử lại.");
    } catch {
      setError("Không thể kết nối. Vui lòng thử lại sau.");
    }
    setBusy(false);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
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
          <h1 className="text-[16px] font-semibold">Đăng nhập</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
            Nhập thông tin tài khoản được cấp để vào không gian làm việc.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <Field label="Email">
              <Input
                type="email"
                autoComplete="email"
                placeholder="ten@btctu.local"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </Field>
            <Field label="Mật khẩu">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-9"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {error && (
              <p role="alert" className="text-[12px] text-danger">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={busy || !hydrated || !email.trim() || !password}
              className="w-full"
            >
              {busy ? "Đang đăng nhập…" : "Đăng nhập"}
            </Button>
          </form>

          {isDev && (
            <p className="mt-4 border-t border-fill-2 pt-3 text-center text-[12px] text-ink-3">
              <ShieldCheck
                size={14}
                className="mr-1 inline-block align-[-2px] text-amber-600"
              />
              Chế độ phát triển —{" "}
              <Link
                href="/demo/login"
                className="font-medium text-accent-600 hover:underline"
              >
                đăng nhập nhanh
              </Link>
            </p>
          )}
        </Card>
      </div>
    </main>
  );
}
