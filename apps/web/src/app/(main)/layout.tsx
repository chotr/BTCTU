"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import Shell from "@/components/shell";
import { useApp } from "@/lib/store";
import { LoadingScreen } from "@/components/ui";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, hydrated } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login");
    }
  }, [user, hydrated, router]);

  if (!hydrated || !user) return <LoadingScreen />;

  return <Shell>{children}</Shell>;
}
