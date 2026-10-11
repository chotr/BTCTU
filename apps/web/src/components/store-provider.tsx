"use client";
import { useEffect, type ReactNode } from "react";
import { hydrateStore } from "@/lib/store";
export function StoreProvider({ children }: { children: ReactNode }) {
  useEffect(() => hydrateStore(), []);
  return children;
}
