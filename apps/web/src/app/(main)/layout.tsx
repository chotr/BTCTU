"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import Shell from "@/components/shell";
import { useApp } from "@/lib/store";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return <Shell>{children}</Shell>;
}

