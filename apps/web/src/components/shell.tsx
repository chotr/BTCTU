"use client";

import {
  Buildings,
  CaretDown,
  ChartBar,
  CheckCircle,
  ClipboardText,
  FileText,
  House,
  Kanban,
  ListMagnifyingGlass,
  SignOut,
  Swap,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { Avatar, Badge } from "@/components/ui";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const mainNav: NavItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: <House size={17} weight="regular" /> },
  { href: "/tasks", label: "Công việc", icon: <Kanban size={17} weight="regular" /> },
  { href: "/catalog", label: "Danh mục công việc", icon: <ClipboardText size={17} weight="regular" /> },
  { href: "/organization", label: "Tổ chức & nhân sự", icon: <Buildings size={17} weight="regular" /> },
];

const evalNav: NavItem[] = [
  { href: "/evaluation", label: "Kỳ đánh giá", icon: <ChartBar size={17} weight="regular" /> },
  { href: "/approvals", label: "Xử lý & phê duyệt", icon: <CheckCircle size={17} weight="regular" /> },
];

const controlNav: NavItem[] = [
  { href: "/reports", label: "Báo cáo", icon: <FileText size={17} weight="regular" /> },
  { href: "/audit", label: "Nhật ký hoạt động", icon: <ListMagnifyingGlass size={17} weight="regular" /> },
];

const titles: Record<string, string> = {
  "/dashboard": "Tổng quan",
  "/tasks": "Công việc",
  "/catalog": "Danh mục công việc",
  "/organization": "Tổ chức & nhân sự",
  "/evaluation": "Kỳ đánh giá",
  "/approvals": "Xử lý & phê duyệt",
  "/reports": "Báo cáo",
  "/audit": "Nhật ký hoạt động",
};

function pageTitle(pathname: string): string {
  for (const [path, label] of Object.entries(titles)) {
    if (pathname === path || pathname.startsWith(path + "/")) return label;
  }
  return "BTCTU";
}

function NavLink({ item, active, count }: { item: NavItem; active: boolean; count?: number }) {
  return (
    <a
      href={item.href}
      className={
        active
          ? "flex items-center gap-2.5 rounded-ctl bg-accent-50 px-2.5 py-2 text-[13px] font-semibold text-accent-600"
          : "flex items-center gap-2.5 rounded-ctl px-2.5 py-2 text-[13px] text-ink-2 transition-colors hover:bg-fill hover:text-ink"
      }
    >
      <span className={active ? "text-accent-600" : "text-ink-3"}>{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {count ? <Badge tone="warn">{count}</Badge> : null}
    </a>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const { evaluations, user } = useApp();
  const pending =
    user?.role === "lanh_dao"
      ? evaluations.filter((e) => e.status === "REVIEWED").length
      : user?.role === "truong_phong"
        ? evaluations.filter((e) => e.status === "SUBMITTED" && e.departmentId === user.departmentId).length
        : 0;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col bg-surface shadow-card">
      <div className="flex h-14 items-center gap-2.5 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-card bg-accent-600 text-[12px] font-bold text-white">
          BT
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13px] font-semibold">Ban Tổ chức Tỉnh ủy</p>
          <p className="truncate text-[11px] text-ink-3">Nhiệm vụ & đánh giá</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-3">Nghiệp vụ</p>
        <div className="flex flex-col gap-0.5">
          {mainNav.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href || pathname.startsWith(item.href + "/")} />
          ))}
        </div>

        <p className="mt-4 px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-3">Đánh giá</p>
        <div className="flex flex-col gap-0.5">
          {evalNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href || pathname.startsWith(item.href + "/")}
              count={item.href === "/approvals" ? pending : undefined}
            />
          ))}
        </div>

        <p className="mt-4 px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-3">Kiểm soát</p>
        <div className="flex flex-col gap-0.5">
          {controlNav.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href || pathname.startsWith(item.href + "/")} />
          ))}
        </div>
      </nav>

      <div className="px-4 py-3">
        <p className="text-[11px] leading-relaxed text-ink-3">
          Bản demo · dữ liệu minh họa · chưa nối API
        </p>
      </div>
    </aside>
  );
}

function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, periods } = useApp();
  const activePeriod = periods.find((p) => p.status === "ACTIVE");

  async function switchUser() {
    await api.logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-surface/95 px-6 shadow-card backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-[15px] font-semibold">{pageTitle(pathname)}</h1>
        {activePeriod ? (
          <span className="rounded-pill bg-accent-50 px-2 py-0.5 text-[11px] font-semibold text-accent-600">
            {activePeriod.name}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            <span className="hidden rounded-pill bg-fill-2 px-2 py-0.5 text-[11px] font-medium text-ink-2 sm:inline-flex">
              {user.role === "lanh_dao" ? "Lãnh đạo Ban" : user.role === "truong_phong" ? "Trưởng phòng" : "Công chức"}
            </span>
            <div className="group relative">
              <button type="button" className="flex items-center gap-2 rounded-ctl px-1.5 py-1 transition-colors hover:bg-fill">
                <Avatar name={user.name} size="sm" />
                <span className="text-[13px] font-medium">{user.name}</span>
                <CaretDown size={12} weight="bold" className="text-ink-3" />
              </button>
              <div className="invisible absolute right-0 top-full z-40 w-48 pt-1 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="rounded-card bg-surface p-1 shadow-pop">
                  <button type="button" onClick={switchUser} className="flex w-full items-center gap-2 rounded-ctl px-2.5 py-1.5 text-left text-[12px] text-ink-2 transition-colors hover:bg-fill">
                    <Swap size={14} /> Đổi tài khoản demo
                  </button>
                  <button type="button" onClick={switchUser} className="flex w-full items-center gap-2 rounded-ctl px-2.5 py-1.5 text-left text-[12px] text-ink-2 transition-colors hover:bg-fill">
                    <SignOut size={14} /> Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}

function ToastHost() {
  const { toasts } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex items-center gap-2 rounded-card bg-ink px-3 py-2 text-[12px] font-medium text-white shadow-pop">
          {t.kind === "success" ? <CheckCircle size={15} weight="fill" className="text-emerald-300" /> : null}
          {t.kind === "error" ? <XCircle size={15} weight="fill" className="text-red-300" /> : null}
          {t.kind === "info" ? <WarningCircle size={15} weight="fill" className="text-amber-300" /> : null}
          {t.text}
        </div>
      ))}
    </div>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <Sidebar />
      <div className="pl-56">
        <Topbar />
        <main className="mx-auto max-w-[1240px] px-6 py-6">{children}</main>
      </div>
      <ToastHost />
    </div>
  );
}
