"use client";
import {
  Buildings,
  CalendarDots,
  ChartBar,
  CheckCircle,
  ClipboardText,
  FileText,
  House,
  Kanban,
  List,
  ListMagnifyingGlass,
  SignOut,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import quocHuyImg from "../../public/quoc-huy.png";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { dismissToast, useApp } from "@/lib/store";
import { canViewAudit } from "@/lib/policy";
import { scopedData } from "@/lib/access";
import { environmentLabel } from "@/lib/runtime-config";
import { appPath, isApiWorkspace } from "@/lib/workspace-runtime";
import { Avatar, Badge, Button, Callout, Modal } from "./ui";
import { ROLES } from "@/lib/types";

const groups = [
  {
    label: "Công việc",
    items: [
      { href: "/dashboard", label: "Tổng quan", icon: House },
      { href: "/tasks", label: "Nhiệm vụ", icon: Kanban },
      { href: "/catalog", label: "Danh mục công việc", icon: ClipboardText },
      { href: "/organization", label: "Tổ chức & nhân sự", icon: Buildings },
    ],
  },
  {
    label: "Đánh giá",
    items: [
      { href: "/evaluation", label: "Hồ sơ đánh giá", icon: ChartBar },
      { href: "/approvals", label: "Xử lý & phê duyệt", icon: CheckCircle },
      { href: "/periods", label: "Quản lý kỳ", icon: CalendarDots },
    ],
  },
  {
    label: "Điều hành",
    items: [
      { href: "/reports", label: "Báo cáo", icon: FileText },
      { href: "/audit", label: "Nhật ký hoạt động", icon: ListMagnifyingGlass },
      { href: "/accounts", label: "Quản lý tài khoản", icon: UsersThree },
    ],
  },
];
function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const state = useApp();
  const { user, account } = state;
  const canManageAccounts =
    account?.accountRole === "ROOT" || account?.accountRole === "ACCOUNT_ADMIN";
  const pending = scopedData(state).evaluations.filter((e) =>
    user?.role === ROLES.lanhDao
      ? e.status === "REVIEWED"
      : e.status === "SUBMITTED" && e.subjectId !== user?.id,
  ).length;
  return (
    <nav
      aria-label="Điều hướng chính"
      className="flex-1 overflow-y-auto pt-2 lg:px-4 lg:pt-4"
    >
      {groups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => {
            if (item.href === "/accounts") return canManageAccounts;
            if (!user) return false;
            if (item.href === "/audit") return canViewAudit(user);
            if (item.href === "/approvals") return user.role !== ROLES.congChuc;
            return true;
          }),
        }))
        .filter((group) => group.items.length > 0)
        .map((group, i) => (
        <div className={`${i < groups.length - 1 ? "mb-5" : ""}`} key={group.label}>
          <p className="mb-1.5 px-2.5 text-[11px] font-semibold text-ink-3">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
                const href = appPath(item.href);
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={item.href}
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-10 items-center gap-2.5 rounded-ctl px-2.5 text-[13px] ${active ? "bg-accent-50 font-semibold text-accent-700" : "text-ink-2 hover:bg-fill"}`}
                  >
                    <item.icon size={18} />
                    <span className="flex-1">{item.label}</span>
                    {item.href === "/approvals" && pending > 0 && (
                      <Badge tone="warn">{pending}</Badge>
                    )}
                  </Link>
                );
              })}
          </div>
        </div>
      ))}
    </nav>
  );
}
function Brand() {
  return (
    <div className="flex h-12 shrink-0 items-center gap-3 lg:px-4 lg:pt-2">
      <Image
        src={quocHuyImg}
        alt="Quốc huy Việt Nam"
        className="h-9 w-auto shrink-0 object-contain drop-shadow-sm"
        priority
      />
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold leading-tight">
          Ban Tổ chức Tỉnh ủy
        </p>
        <p className="mt-0.5 truncate text-[11px] text-ink-3">
          Nhiệm vụ & đánh giá
        </p>
      </div>
    </div>
  );
}
export default function Shell({ children }: { children: ReactNode }) {
  const state = useApp();
  const { user, account, toasts, storageError } = state;
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const title =
    groups
      .flatMap((g) => g.items)
      .find((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
      ?.label ?? "BTCTU";
  async function logout() {
    await api.logout();
    router.replace(appPath("/login"));
  }
  return (
    <div className="min-h-dvh bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:p-3"
      >
        Đến nội dung chính
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-surface shadow-card lg:flex print:hidden">
        <Brand />
        <Navigation />
        <p className="px-5 pb-4 text-[11px] leading-relaxed text-ink-3">
          {environmentLabel()} ·{" "}
          {isApiWorkspace() ? "API dịch vụ" : "Dữ liệu mô phỏng"}
          <br />
          Phiên bản 1.0
        </p>
      </aside>
      <div className="min-w-0 lg:pl-60 print:pl-0">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 bg-surface px-4 shadow-card sm:px-6 print:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              aria-label="Mở điều hướng"
              aria-expanded={menu}
              onClick={() => setMenu(true)}
              className="p-2 lg:hidden"
            >
              <List size={22} />
            </button>
            <Image
              src={quocHuyImg}
              alt="Quốc huy Việt Nam"
              className="h-7 w-auto shrink-0 object-contain lg:hidden"
            />
            <span className="truncate text-sm font-semibold">{title}</span>
          </div>
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-ctl p-1.5 hover:bg-fill">
              <Avatar name={user?.name ?? account?.email ?? ""} />
              <span className="hidden text-[13px] font-medium sm:inline">
                {user?.name ?? account?.email}
              </span>
              <span className="text-xs text-ink-3">▾</span>
            </summary>
            <div className="absolute right-0 top-full mt-2 w-64 rounded-card bg-surface p-3 shadow-pop">
              <p className="text-[13px] font-semibold">{user?.name ?? account?.email}</p>
              <p className="mb-3 mt-1 text-xs text-ink-3">
                {user ? `${user.title} · ${user.departmentName ?? "Toàn Ban"}` : "Quản trị tài khoản"}
              </p>
              <Button
                onClick={logout}
                icon={<SignOut size={16} />}
                className="w-full"
              >
                Đổi tài khoản / đăng xuất
              </Button>
            </div>
          </details>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto min-w-0 max-w-[1440px] px-4 py-5 outline-none sm:px-6 sm:py-6 print:max-w-none print:p-0"
        >
          {storageError && (
            <div className="mb-4">
              <Callout tone="warn" title="Lưu dữ liệu trên trình duyệt">
                {storageError}
              </Callout>
            </div>
          )}
          {children}
        </main>
      </div>
      <Modal open={menu} title="Điều hướng" onClose={() => setMenu(false)}>
        <div className="border-b border-fill-2 pb-2">
          <Brand />
        </div>
        <Navigation onNavigate={() => setMenu(false)} />
      </Modal>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex max-w-[calc(100vw-2rem)] flex-col gap-2 print:hidden"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-card bg-ink px-4 py-3 text-[13px] text-white shadow-pop`}
          >
            <span>
              {t.kind === "error" ? "Không thực hiện được: " : ""}
              {t.text}
            </span>
            <button
              aria-label="Đóng thông báo"
              onClick={() => dismissToast(t.id)}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
