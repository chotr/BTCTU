import { getState } from "./store";
import { policy } from "./policy";
import { personName } from "./shared/names";
import { resolveAppUser } from "./identity";
import { taskPeriodLocked } from "./tasks";
import { RESULT_QUALITY } from "./domain/quality";
import {
  canCalculateEvaluation,
  canSelfEvaluate,
  evaluationLabel,
  evaluationTotal,
} from "./evaluation";
import {
  catalogCsvTemplate,
  previewCatalogCsv,
  type ImportRow,
} from "./master-data";
import {
  PROFILES,
  previewPayload,
  type ProfileKey,
} from "./integration";
import type { ReportKind } from "./exports";
import { apiModeActions } from "./api-adapter";
import { getWorkspaceMode } from "./workspace-runtime";
import { mockActions } from "@/demo/mock-actions";

/**
 * Điểm gọi thao tác duy nhất dành cho các màn hình.
 *
 * Route chính dùng API; namespace `/demo` chọn implementation mô phỏng. Màn
 * hình chỉ phụ thuộc contract này, không tự quyết định nguồn dữ liệu.
 */
export const perm = policy;

type AppApi = typeof mockActions;

export const api = new Proxy({} as AppApi, {
  get(_target, property) {
    const source = getWorkspaceMode() === "mock" ? mockActions : apiModeActions;
    return Reflect.get(source, property);
  },
});

export function personLabel(id: string): string {
  const state = getState();
  return personName(state, id) ?? resolveAppUser(state, id)?.name ?? id;
}

export {
  RESULT_QUALITY,
  taskPeriodLocked,
  canCalculateEvaluation,
  canSelfEvaluate,
  evaluationLabel,
  evaluationTotal,
  catalogCsvTemplate,
  previewCatalogCsv,
  PROFILES,
  previewPayload,
};
export type { ImportRow, ProfileKey, ReportKind };
