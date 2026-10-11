"use client";

import { useCallback, useState } from "react";

/** Async busy/loading helper for form submits and guarded actions. */
export function useBusy() {
  const [busy, setBusy] = useState(false);
  const run = useCallback(
    async <T,>(fn: () => T | Promise<T>): Promise<T | undefined> => {
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
