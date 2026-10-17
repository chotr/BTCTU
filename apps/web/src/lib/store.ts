import { useSyncExternalStore } from "react";
import { getWorkspaceMode } from "./workspace-runtime";
import type {
  AuditEvent,
  CatalogItem,
  AppUser,
  Department,
  Evaluation,
  EvaluationPeriod,
  Person,
  PositionRef,
  ResponsibilityRef,
  Task,
  ToastMsg,
} from "./types";
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
} from "@/demo/data";
import { resolveAppUser } from "./identity";

export type AccountSession = {
  id: string;
  email: string;
  accountRole: "USER" | "ACCOUNT_ADMIN" | "ROOT";
  mustChangePassword: boolean;
};

export interface SyncRun {
  id: string;
  at: string;
  profile: string;
  purpose: string;
  status: "SUCCESS" | "FAILED";
  records: number;
  checkpoint: string;
  correlationId: string;
  error: string | null;
  retryOf?: string;
}
export interface IntegrationState {
  mappings: { field: string; target: string; source: string }[];
  runs: SyncRun[];
  checkpoint: string;
}
export interface AppState {
  user: AppUser | null;
  account: AccountSession | null;
  passwordChangeRequired: boolean;
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
  integration: IntegrationState;
  hydrated: boolean;
  storageError: string | null;
}
export const STORAGE_KEY = "btctu:demo-workspace:v1";
const LEGACY_STORAGE_KEYS = ["btctu:workspace:v3", "btctu:mock:v2"] as const;
export function initialDemoState(): AppState {
  return structuredClone({
    user: null,
    account: null,
    passwordChangeRequired: false,
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
    hydrated: false,
    storageError: null,
    integration: {
      mappings: [
        {
          field: "person.id",
          target: "personnelCode",
          source: "QĐ607",
        },
        {
          field: "person.name",
          target: "fullName",
          source: "QĐ308",
        },
        {
          field: "department.code",
          target: "organizationCode",
          source: "QĐ308",
        },
      ],
      runs: [],
      checkpoint: "0",
    },
  });
}

function initialState(): AppState {
  if (getWorkspaceMode() === "mock") {
    return initialDemoState();
  }
  return {
    user: null,
    account: null,
    passwordChangeRequired: false,
    departments: [],
    people: [],
    positions: [],
    responsibilities: [],
    catalog: [],
    activeCatalogVersion: "",
    tasks: [],
    periods: [],
    evaluations: [],
    audit: [],
    toasts: [],
    hydrated: false,
    storageError: null,
    integration: {
      mappings: [],
      runs: [],
      checkpoint: "0",
    },
  };
}
const serverState = initialState();
let state = initialState();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
function persist(): void {
  if (
    getWorkspaceMode() !== "mock" ||
    typeof window === "undefined" ||
    !state.hydrated
  )
    return;
  try {
    const {
      toasts: _toasts,
      hydrated: _hydrated,
      storageError: _error,
      ...data
    } = state;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 3, data }),
    );
  } catch {
    state = {
      ...state,
      storageError:
        "Trình duyệt không lưu được dữ liệu. Phiên này chỉ tồn tại trong bộ nhớ; hãy xuất báo cáo trước khi đóng.",
    };
  }
}
function restore(raw: string): AppState {
  const parsed = JSON.parse(raw);
  if (
    ![2, 3].includes(parsed?.version) ||
    !parsed.data ||
    typeof parsed.data !== "object"
  )
    throw new Error("Invalid version");
  const d = parsed.data;
  for (const key of [
    "departments",
    "people",
    "positions",
    "responsibilities",
    "catalog",
    "tasks",
    "periods",
    "evaluations",
    "audit",
  ]) {
    if (
      !Array.isArray(d[key]) ||
      !d[key].every(
        (v: unknown) =>
          v &&
          typeof v === "object" &&
          typeof (v as { id?: unknown }).id === "string",
      )
    )
      throw new Error("Invalid collection");
  }
  if (
    !d.tasks.every(
      (t: Task) => Array.isArray(t.history) && Array.isArray(t.evidence),
    ) ||
    !d.evaluations.every(
      (e: Evaluation) =>
        e.calc &&
        Array.isArray(e.axes) &&
        Array.isArray(e.conditions) &&
        Array.isArray(e.history),
    )
  )
    throw new Error("Invalid workflow");
  const base = initialState();
  const restoredUser = resolveAppUser(
    { people: d.people, departments: d.departments },
    d.user?.id,
  );
  return {
    ...base,
    ...d,
    user: restoredUser,
    integration:
      d.integration &&
      Array.isArray(d.integration.runs) &&
      Array.isArray(d.integration.mappings)
        ? d.integration
        : base.integration,
    hydrated: true,
    storageError: null,
    toasts: [],
  };
}
let listening = false;
export function hydrateStore(force = false): void {
  if (typeof window === "undefined" || (state.hydrated && !force)) return;
  if (force) state = initialState();
  try {
    const legacyKey = LEGACY_STORAGE_KEYS.find((key) =>
      window.localStorage.getItem(key),
    );
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ??
      (legacyKey ? window.localStorage.getItem(legacyKey) : null);
    state = raw ? restore(raw) : { ...state, hydrated: true };
    if (raw && !window.localStorage.getItem(STORAGE_KEY)) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 3, data: state }),
      );
      for (const key of LEGACY_STORAGE_KEYS) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    state = {
      ...initialState(),
      hydrated: true,
      storageError:
        "Dữ liệu lưu không đọc được. Đang dùng dữ liệu khởi tạo trong bộ nhớ; hãy khôi phục không gian làm việc để lưu phiên mới.",
    };
  }
  if (!listening) {
    listening = true;
    window.addEventListener("storage", (event) => {
      if (
        getWorkspaceMode() !== "mock" ||
        event.key !== STORAGE_KEY ||
        !event.newValue
      )
        return;
      try {
        state = restore(event.newValue);
        emit();
      } catch {
        /* Giữ phiên hợp lệ hiện tại. */
      }
    });
  }
  emit();
}
export function setState(mutator: (s: AppState) => AppState): void {
  state = mutator(state);
  persist();
  emit();
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
  return useSyncExternalStore(subscribe, getState, () => serverState);
}
export function setUser(user: AppUser | null): void {
  setState((s) => ({ ...s, user }));
}
let toastSeq = 1;
export function pushToast(kind: ToastMsg["kind"], text: string): void {
  const id = toastSeq++;
  state = { ...state, toasts: [...state.toasts.slice(-3), { id, kind, text }] };
  emit();
  if (typeof window !== "undefined")
    window.setTimeout(() => dismissToast(id), 6500);
}
export function dismissToast(id: number): void {
  state = { ...state, toasts: state.toasts.filter((t) => t.id !== id) };
  emit();
}
export function appendAudit(
  ev: Omit<AuditEvent, "id" | "at" | "requestId">,
): void {
  setState((s) => ({
    ...s,
    audit: [
      {
        ...ev,
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        requestId: "req-" + crypto.randomUUID().slice(0, 8),
      },
      ...s.audit,
    ],
  }));
}
export function upsertTask(task: Task): void {
  setState((s) => ({
    ...s,
    tasks: s.tasks.some((t) => t.id === task.id)
      ? s.tasks.map((t) => (t.id === task.id ? task : t))
      : [task, ...s.tasks],
  }));
}
export function addTask(task: Task): void {
  upsertTask(task);
}
export function upsertEvaluation(evaluation: Evaluation): void {
  setState((s) => ({
    ...s,
    evaluations: s.evaluations.some((e) => e.id === evaluation.id)
      ? s.evaluations.map((e) => (e.id === evaluation.id ? evaluation : e))
      : [evaluation, ...s.evaluations],
  }));
}
export function setPeriodLocked(periodId: string, lockedAt: string): void {
  setState((s) => ({
    ...s,
    periods: s.periods.map((p) =>
      p.id === periodId ? { ...p, status: "LOCKED", lockedAt } : p,
    ),
  }));
}
export function resetWorkspace(): void {
  if (getWorkspaceMode() === "mock") {
    const user = state.user;
    setState(() => ({ ...initialDemoState(), user, hydrated: true }));
    appendAudit({
      actorId: user?.id ?? "system",
      action: "Khôi phục không gian làm việc",
      resource: "Không gian làm việc",
      detail: "Khôi phục dữ liệu khởi tạo; chỉ ảnh hưởng trình duyệt này.",
      outcome: "OK",
    });
    pushToast("success", "Đã khôi phục dữ liệu khởi tạo");
  }
}
