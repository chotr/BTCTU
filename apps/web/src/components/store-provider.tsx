"use client";
import { useEffect, useState, type ReactNode } from "react";
import { initializeDataSource } from "@/lib/data-source";
import { hydrateStore } from "@/lib/store";
import { LoadingScreen } from "@/components/ui";

let initialization: Promise<void> | null = null;

function initializeOnce(): Promise<void> {
  if (!initialization) {
    initialization = initializeDataSource(hydrateStore).catch((error) => {
      initialization = null;
      throw error;
    });
  }
  return initialization;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void initializeOnce()
      .then(() => {
        if (active) setReady(true);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Không tải được dữ liệu.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <main className="grid min-h-dvh place-items-center bg-canvas p-6">
        <div
          role="alert"
          className="w-full max-w-xl rounded-card bg-surface p-6 shadow-card"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-danger">
            Lỗi kết nối
          </p>
          <h1 className="mt-2 text-xl font-semibold">Không tải được dữ liệu</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">{error}</p>
        </div>
      </main>
    );
  }

  if (!ready) {
    return <LoadingScreen />;
  }

  return children;
}
