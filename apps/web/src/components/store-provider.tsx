"use client";
import { useEffect, useState, type ReactNode } from "react";
import { hydrateStore } from "@/lib/store";
import { runtimeConfig } from "@/lib/runtime-config";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [configurationError, setConfigurationError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (runtimeConfig.dataSource === "api") {
      setConfigurationError(
        "Nguồn API đã được chọn nhưng adapter đồng bộ chưa được kích hoạt. Hãy hoàn tất adapter API trước khi dùng cấu hình này.",
      );
      return;
    }
    hydrateStore();
  }, []);

  if (configurationError) {
    return (
      <main className="grid min-h-dvh place-items-center bg-canvas p-6">
        <div
          role="alert"
          className="w-full max-w-xl rounded-card bg-surface p-6 shadow-card"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-danger">
            Cấu hình chưa hoàn tất
          </p>
          <h1 className="mt-2 text-xl font-semibold">
            Không thể khởi tạo nguồn dữ liệu
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {configurationError}
          </p>
        </div>
      </main>
    );
  }

  return children;
}
