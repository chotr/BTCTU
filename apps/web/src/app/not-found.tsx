import Link from "next/link";
import { Card } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas p-6">
      <Card className="w-full max-w-lg p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">
          404
        </p>
        <h1 className="mt-2 text-xl font-semibold">Không tìm thấy nội dung</h1>
        <p className="mt-2 text-sm text-ink-2">
          Đường dẫn có thể đã thay đổi hoặc bạn không có quyền truy cập.
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex rounded-ctl bg-accent-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Về trang tổng quan
        </Link>
      </Card>
    </main>
  );
}
