import { useSyncExternalStore } from "react";
import type {
  AuditEvent,
  CatalogItem,
  DemoUser,
  Department,
  Evaluation,
  EvaluationPeriod,
  Person,
  PositionRef,
  ResponsibilityRef,
  Task,
  ToastMsg,
} from "@/lib/types";
import {
  AUDIT,
  CATALOG,
  DEPARTMENTS,
  EVALUATIONS,
  PEOPLE,
  PERIODS,
  POSITIONS,
  RESPONSIBILITIES,
  TASKS,
  USERS,
} from "@/lib/mock/data";

export interface AppState {
  user: DemoUser | null;
  departments: Department[];
  people: Person[];
  positions: PositionRef[];
  responsibilities: ResponsibilityRef[];
  catalog: CatalogItem[];
  activeCatalogVersion: string;
  tasks: Task[];
  periods: EvaluationPeriod[];
  evaluations: Evaluation[];
  audit: AuditEvent[];
  toasts: ToastMsg[];
}

const SESSION_KEY = "btctu:session:v1";

function loadUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { userId?: string };
    return USERS.find((u) => u.id === parsed.userId) ?? null;
  } catch {
    return null;
  }
}

let state: AppState = {
  user: loadUser(),
  departments: DEPARTMENTS,
  people: PEOPLE,
  positions: POSITIONS,
  responsibilities: RESPONSIBILITIES,
  catalog: CATALOG,
  activeCatalogVersion: "v1.1",
  tasks: TASKS,
  periods: PERIODS,
  evaluations: EVALUATIONS,
  audit: AUDIT,
  toasts: [],
};

const listeners = new Set<() => void>();

export function setState(mutator: (s: AppState) => AppState): void {
  state = mutator(state);
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function getState(): AppState {
  return state;
}

export function useApp(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function setUser(user: DemoUser | null): void {
  setState((s) => ({ ...s, user }));
  if (typeof window === "undefined") return;
  try {
    if (user) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // localStorage có thể bị chặn; phiên demo vẫn hoạt động trong bộ nhớ.
  }
}

let toastSeq = 1;

export function pushToast(kind: ToastMsg["kind"], text: string): void {
  const id = toastSeq++;
  setState((s) => ({ ...s, toasts: [...s.toasts, { id, kind, text }] }));
  if (typeof window !== "undefined") {
    window.setTimeout(() => {
      setState((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3600);
  }
}

export function appendAudit(ev: Omit<AuditEvent, "id" | "at" | "requestId">): void {
  setState((s) => ({
    ...s,
    audit: [
      {
        ...ev,
        id: "a" + Date.now(),
        at: new Date().toISOString(),
        requestId: "req-" + Math.random().toString(16).slice(2, 8),
      },
      ...s.audit,
    ],
  }));
}

export function upsertTask(task: Task): void {
  setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === task.id ? task : t)) }));
}

export function addTask(task: Task): void {
  setState((s) => ({ ...s, tasks: [task, ...s.tasks] }));
}

export function upsertEvaluation(evaluation: Evaluation): void {
  setState((s) => ({
    ...s,
    evaluations: s.evaluations.map((e) => (e.id === evaluation.id ? evaluation : e)),
  }));
}

export function setPeriodLocked(periodId: string, lockedAt: string): void {
  setState((s) => ({
    ...s,
    periods: s.periods.map((p) =>
      p.id === periodId ? { ...p, status: "LOCKED" as const, lockedAt } : p,
    ),
  }));
}

