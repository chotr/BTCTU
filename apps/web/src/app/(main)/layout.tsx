"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import Shell from "@/components/shell";
import { useApp } from "@/lib/store";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, hydrated } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login");
    }
  }, [user, hydrated, router]);

  if (!hydrated || !user)
    return (
      <main className="p-8 text-sm text-ink-2" role="status">
        Đang mở không gian làm việc…
      </main>
    );

  return <Shell>{children}</Shell>;
}
