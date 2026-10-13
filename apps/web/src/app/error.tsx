"use client";

import { useEffect } from "react";
import { Button, Card } from "@/components/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center bg-canvas p-6">
      <Card className="w-full max-w-lg p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-danger">
          Không thể tải màn hình
        </p>
        <h1 className="mt-2 text-xl font-semibold">
          Đã xảy ra lỗi ngoài dự kiến
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Hãy thử tải lại phần nội dung này. Nếu lỗi tiếp diễn, cung cấp mã{" "}
          <span className="font-mono">{error.digest ?? "không xác định"}</span>{" "}
          cho bộ phận vận hành.
        </p>
        <Button className="mt-5" onClick={reset}>
          Thử lại
        </Button>
      </Card>
    </main>
  );
}
