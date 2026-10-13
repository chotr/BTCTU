"use client";

import { useCallback, useState } from "react";

/** Tiện ích bận/tải bất đồng bộ cho việc gửi biểu mẫu và thao tác có kiểm soát. */
export function useBusy() {
  const [busy, setBusy] = useState(false);
  const run = useCallback(
    async <T>(fn: () => T | Promise<T>): Promise<T | undefined> => {
      setBusy(true);
      try {
        return await fn();
      } finally {
        setBusy(false);
      }
    },
    [],
  );
  return { busy, run };
}
