"use client";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { initializeDataSource } from "@/lib/data-source";
import { hydrateStore } from "@/lib/store";
import { LoadingScreen } from "@/components/ui";
import {
  setWorkspaceMode,
  type WorkspaceMode,
} from "@/lib/workspace-runtime";

let initialization: {
  mode: WorkspaceMode;
  promise: Promise<void>;
} | null = null;

function initializeOnce(mode: WorkspaceMode): Promise<void> {
  if (!initialization || initialization.mode !== mode) {
    const promise = initializeDataSource(mode, () => hydrateStore(true)).catch(
      (error) => {
        initialization = null;
        throw error;
      },
    );
    initialization = { mode, promise };
  }
  return initialization.promise;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mode: WorkspaceMode = pathname.startsWith("/demo") ? "mock" : "api";
  const [error, setError] = useState<string | null>(null);
  const [readyMode, setReadyMode] = useState<WorkspaceMode | null>(null);

  useEffect(() => {
    let active = true;
    setWorkspaceMode(mode);
    setError(null);
    void initializeOnce(mode)
      .then(() => {
        if (active) setReadyMode(mode);
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
  }, [mode]);

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

  if (readyMode !== mode) {
    return <LoadingScreen />;
  }

  return children;
}
