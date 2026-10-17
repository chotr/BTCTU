"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import Shell from "@/components/shell";
import { useApp } from "@/lib/store";
import { LoadingScreen } from "@/components/ui";
import { appPath } from "@/lib/workspace-runtime";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, account, hydrated } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const canManageAccounts =
    account?.accountRole === "ROOT" || account?.accountRole === "ACCOUNT_ADMIN";

  useEffect(() => {
    if (hydrated && !user && !canManageAccounts) {
      router.replace(appPath("/login"));
    }
    if (hydrated && !user && canManageAccounts && pathname !== appPath("/accounts")) {
      router.replace(appPath("/accounts"));
    }
  }, [user, hydrated, canManageAccounts, pathname, router]);

  if (!hydrated || (!user && !canManageAccounts)) return <LoadingScreen />;

  return <Shell>{children}</Shell>;
}
