import {
  CLASSIFICATIONS,
  EVALUATION_STATUSES,
  ROLES,
  TASK_STATUSES,
  type Classification,
  type EvaluationStatus,
  type Role,
} from "@btctu/shared";
import {
  ApiError,
  apiRequest,
  getDevelopmentIdentity,
  setDevelopmentIdentity,
} from "./http-client";
import { runtimeConfig } from "./runtime-config";
import {
  getState,
  pushToast,
  setState,
  upsertEvaluation,
  upsertTask,
  type AppState,
} from "./store";
import type {
  AuditEvent,
  CatalogItem,
  Department,
  Evaluation,
  EvaluationPeriod,
  Person,
  PositionRef,
  Task,
  TaskResult,
} from "./types";

type ApiActor = {
  id: string;
  name: string;
  role: Role;
  departmentId: string | null;
};

type ApiDepartment = {
  id: string;
  code: string;
  name: string;
  shortName: string;
};

type ApiPerson = {
  id: string;
  name: string;
  title: string;
  role: Role;
  departmentId: string;
  positionRefId: string;
};

type ApiCatalogItem = {
  id: string;
  version: string;
  title: string;
  departmentId: string;
  standardScore: number;
  coefficient: number;
  durationDays: number;
  sourceRef: string;
};

type ApiTaskResult = {
  quantity: number;
  product: string;
  qualityLevel: "A" | "B" | "C";
  note: string;
  submittedAt: string | null;
};

type ApiTask = {
  id: string;
  title: string;
  description: string;
  catalogItemId: string;
  departmentId: string;
  assigneeId: string;
  assignerId: string;
  dueAt: string;
  status: (typeof TASK_STATUSES)[number];
  progress: number;
  result: ApiTaskResult | null;
};

type ApiEvaluation = {
  id: string;
  periodId: string;
  subjectId: string;
  departmentId: string;
  status: EvaluationStatus;
  score: number;
  classification: Classification;
  blockerCount: number;
  selfComment: string | null;
  reviewComment: string | null;
  decisionNote: string | null;
};

type ApiPeriod = {
  id: string;
  label: string;
  lockedAt: string | null;
};

type ApiAuditEvent = {
  id: string;
  requestId: string;
  actorId: string;
  action: string;
  resource: string;
  outcome: "SUCCESS" | "DENIED" | "FAILED";
  detail: string;
  at: string;
};

type ApiReportSummary = {
  period: ApiPeriod;
};

type ApiOrganization = {
  departments: ApiDepartment[];
  people: ApiPerson[];
};

const roleValues = new Set<string>(Object.values(ROLES));
const taskStatuses = new Set<string>(TASK_STATUSES);
const evaluationStatuses = new Set<string>(EVALUATION_STATUSES);
const classifications = new Set<string>(CLASSIFICATIONS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isApiActor(value: unknown): value is ApiActor {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isString(value.role) &&
    roleValues.has(value.role) &&
    (value.departmentId === null || isString(value.departmentId))
  );
}

function isApiDepartment(value: unknown): value is ApiDepartment {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.code) &&
    isString(value.name) &&
    isString(value.shortName)
  );
}

function isApiPerson(value: unknown): value is ApiPerson {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isString(value.title) &&
    isString(value.role) &&
    roleValues.has(value.role) &&
    isString(value.departmentId) &&
    isString(value.positionRefId)
  );
}

function isApiOrganization(value: unknown): value is ApiOrganization {
  return (
    isRecord(value) &&
    Array.isArray(value.departments) &&
    value.departments.every(isApiDepartment) &&
    Array.isArray(value.people) &&
    value.people.every(isApiPerson)
  );
}

function isApiCatalogItem(value: unknown): value is ApiCatalogItem {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.version) &&
    isString(value.title) &&
    isString(value.departmentId) &&
    typeof value.standardScore === "number" &&
    typeof value.coefficient === "number" &&
    typeof value.durationDays === "number" &&
    isString(value.sourceRef)
  );
}

function isApiTaskResult(value: unknown): value is ApiTaskResult {
  return (
    isRecord(value) &&
    typeof value.quantity === "number" &&
    isString(value.product) &&
    (value.qualityLevel === "A" ||
      value.qualityLevel === "B" ||
      value.qualityLevel === "C") &&
    isString(value.note) &&
    isNullableString(value.submittedAt)
  );
}

function isApiTask(value: unknown): value is ApiTask {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.title) &&
    isString(value.description) &&
    isString(value.catalogItemId) &&
    isString(value.departmentId) &&
    isString(value.assigneeId) &&
    isString(value.assignerId) &&
    isString(value.dueAt) &&
    isString(value.status) &&
    taskStatuses.has(value.status) &&
    typeof value.progress === "number" &&
    (value.result === null || isApiTaskResult(value.result))
  );
}

function isApiEvaluation(value: unknown): value is ApiEvaluation {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.periodId) &&
    isString(value.subjectId) &&
    isString(value.departmentId) &&
    isString(value.status) &&
    evaluationStatuses.has(value.status) &&
    typeof value.score === "number" &&
    isString(value.classification) &&
    classifications.has(value.classification) &&
    typeof value.blockerCount === "number" &&
    isNullableString(value.selfComment) &&
    isNullableString(value.reviewComment) &&
    isNullableString(value.decisionNote)
  );
}

function isApiPeriod(value: unknown): value is ApiPeriod {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.label) &&
    isNullableString(value.lockedAt)
  );
}

function isApiReportSummary(value: unknown): value is ApiReportSummary {
  return isRecord(value) && isApiPeriod(value.period);
}

function isApiAuditEvent(value: unknown): value is ApiAuditEvent {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.requestId) &&
    isString(value.actorId) &&
    isString(value.action) &&
    isString(value.resource) &&
    (value.outcome === "SUCCESS" ||
      value.outcome === "DENIED" ||
      value.outcome === "FAILED") &&
    isString(value.detail) &&
    isString(value.at)
  );
}

function checked<T>(
  value: unknown,
  predicate: (candidate: unknown) => candidate is T,
  label: string,
): T {
  if (!predicate(value)) {
    throw new Error(`Dữ liệu ${label} từ API không đúng định dạng.`);
  }
  return value;
}

function checkedList<T>(
  value: unknown,
  predicate: (candidate: unknown) => candidate is T,
  label: string,
): T[] {
  if (!Array.isArray(value) || !value.every(predicate)) {
    throw new Error(`Dữ liệu ${label} từ API không đúng định dạng.`);
  }
  return value;
}

function qualityFromApi(value: ApiTaskResult["qualityLevel"]): string {
  return {
    A: "Đáp ứng tốt",
    B: "Đáp ứng",
    C: "Cần hoàn thiện",
  }[value];
}

function qualityToApi(value: string): ApiTaskResult["qualityLevel"] {
  if (value === "Đáp ứng tốt") return "A";
  if (value === "Đáp ứng") return "B";
  return "C";
}

export function mapApiCatalogItem(
  item: ApiCatalogItem,
  publishedVersion: string,
): CatalogItem {
  const complexity =
    item.coefficient >= 1.1
      ? "Cao"
      : item.coefficient < 0.9
        ? "Thấp"
        : "Trung bình";
  return {
    id: item.id,
    version: item.version,
    code: item.id.toUpperCase(),
    name: item.title,
    product: item.title,
    unit: "sản phẩm",
    complexity,
    standardScore: item.standardScore,
    coefficient: item.coefficient,
    durationDays: item.durationDays,
    sourceRef: item.sourceRef,
    status: item.version === publishedVersion ? "PUBLISHED" : "DRAFT",
  };
}

function mapApiDepartment(
  item: ApiDepartment,
  people: ApiPerson[],
): Department {
  return {
    ...item,
    functionText: "API chưa cung cấp mô tả chức năng.",
    headId:
      people.find(
        (person) =>
          person.departmentId === item.id && person.role === ROLES.truongPhong,
      )?.id ?? "",
    responsibilityIds: [],
  };
}

function mapApiPerson(item: ApiPerson): Person {
  return {
    id: item.id,
    name: item.name,
    title: item.title,
    departmentId: item.departmentId,
    positionRefId: item.positionRefId,
  };
}

function mapPositions(people: ApiPerson[]): PositionRef[] {
  return [
    ...new Map(
      people.map((person) => [
        person.positionRefId,
        {
          id: person.positionRefId,
          title: person.title,
          scope: "Danh mục do API cung cấp",
        },
      ]),
    ).values(),
  ];
}

export function mapApiPeriod(period: ApiPeriod): EvaluationPeriod {
  return {
    id: period.id,
    name: period.label,
    range: period.label,
    status: period.lockedAt ? "LOCKED" : "ACTIVE",
    lockedAt: period.lockedAt,
  };
}

type TaskContext = Pick<
  AppState,
  "catalog" | "departments" | "people" | "periods"
>;

export function mapApiTask(task: ApiTask, state: TaskContext): Task {
  const catalog = state.catalog.find((item) => item.id === task.catalogItemId);
  const person = state.people.find((item) => item.id === task.assigneeId);
  const department = state.departments.find(
    (item) => item.id === task.departmentId,
  );
  const period = state.periods[0];
  const result: TaskResult | null = task.result
    ? {
        quantity: task.result.quantity,
        unit: catalog?.unit ?? "sản phẩm",
        product: task.result.product,
        qualityLevel: qualityFromApi(task.result.qualityLevel),
        note: task.result.note,
        submittedAt: task.result.submittedAt ?? "",
      }
    : null;

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    catalogItemId: task.catalogItemId,
    departmentId: task.departmentId,
    assigneeId: task.assigneeId,
    assignerId: task.assignerId,
    positionRefId: person?.positionRefId ?? "",
    period: period?.name ?? "",
    periodId: period?.id,
    plannedQuantity: result?.quantity ?? 1,
    catalogSnapshot: catalog
      ? {
          id: catalog.id,
          version: catalog.version,
          code: catalog.code,
          name: catalog.name,
          product: catalog.product,
          unit: catalog.unit,
          standardScore: catalog.standardScore,
          coefficient: catalog.coefficient,
          durationDays: catalog.durationDays,
          sourceRef: catalog.sourceRef,
        }
      : undefined,
    assignmentSnapshot: {
      assigneeName: person?.name ?? task.assigneeId,
      positionTitle: person?.title ?? "",
      departmentName: department?.name ?? task.departmentId,
      assignedAt: "",
    },
    dueAt: task.dueAt,
    status: task.status,
    progress: task.progress,
    result,
    evidence: [],
    history: [],
    revision: 1,
  };
}

export function mapApiEvaluation(
  evaluation: ApiEvaluation,
  state: Pick<AppState, "people">,
  receivedAt = new Date().toISOString(),
  previous?: Evaluation,
): Evaluation {
  const person = state.people.find((item) => item.id === evaluation.subjectId);
  const base: Evaluation =
    previous ??
    ({
      id: evaluation.id,
      periodId: evaluation.periodId,
      subjectId: evaluation.subjectId,
      subjectType: "PERSON",
      departmentId: evaluation.departmentId,
      status: evaluation.status,
      isLeader:
        person?.title.toLocaleLowerCase("vi").includes("lãnh đạo") ?? false,
      generalScore: evaluation.score,
      generalMax: 100,
      axes: [],
      calc: {
        ruleVersion: "api",
        formulaText: "Điểm do API cung cấp",
        kpiText: "Điểm do API cung cấp",
        averageAxes: evaluation.score,
        textTotal: evaluation.score,
        arithmeticTotal: evaluation.score,
        note: null,
      },
      self: null,
      review: null,
      decision: null,
      conditions: [],
      history: [],
      revision: 1,
    } satisfies Evaluation);

  return {
    ...base,
    periodId: evaluation.periodId,
    subjectId: evaluation.subjectId,
    departmentId: evaluation.departmentId,
    status: evaluation.status,
    generalScore: evaluation.score,
    calc: {
      ...base.calc,
      textTotal: evaluation.score,
      arithmeticTotal: evaluation.score,
    },
    self: evaluation.selfComment
      ? {
          comment: evaluation.selfComment,
          proposed: evaluation.classification,
          at: base.self?.at ?? receivedAt,
        }
      : null,
    review: evaluation.reviewComment
      ? {
          comment: evaluation.reviewComment,
          proposed: evaluation.classification,
          reviewerId: base.review?.reviewerId ?? getState().user?.id ?? "",
          at: base.review?.at ?? receivedAt,
        }
      : null,
    decision: evaluation.decisionNote
      ? {
          classification: evaluation.classification,
          decidedById: base.decision?.decidedById ?? getState().user?.id ?? "",
          at: base.decision?.at ?? receivedAt,
          note: evaluation.decisionNote,
        }
      : null,
    conditions: [
      {
        id: "api-blockers",
        label: "Điều kiện chặn",
        detail:
          evaluation.blockerCount > 0
            ? `${evaluation.blockerCount} điều kiện chưa đạt`
            : "Không có điều kiện chặn",
        passed: evaluation.blockerCount === 0,
        blocking: true,
      },
    ],
  };
}

function mapApiAuditEvent(event: ApiAuditEvent): AuditEvent {
  return {
    ...event,
    outcome:
      event.outcome === "SUCCESS"
        ? "OK"
        : event.outcome === "FAILED"
          ? "FAILED"
          : "DENIED",
  };
}

function errorText(action: string, error: unknown): string {
  const requestId =
    error instanceof ApiError && error.requestId
      ? ` Mã yêu cầu: ${error.requestId}.`
      : "";
  return `${action} không thành công.${requestId}`;
}

async function auditRequest(): Promise<unknown[]> {
  try {
    return (await apiRequest<unknown[]>("/api/v1/audit")).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) return [];
    throw error;
  }
}

export async function loadApiWorkspace(): Promise<void> {
  if (runtimeConfig.environment !== "production" && !getDevelopmentIdentity()) {
    setState((state) => ({
      ...state,
      user: null,
      hydrated: true,
      storageError: null,
    }));
    return;
  }

  const [
    actorResponse,
    organizationResponse,
    catalogResponse,
    taskResponse,
    evaluationResponse,
    summaryResponse,
    auditData,
  ] = await Promise.all([
    apiRequest<unknown>("/api/v1/me"),
    apiRequest<unknown>("/api/v1/organizations"),
    apiRequest<unknown[]>("/api/v1/catalog"),
    apiRequest<unknown[]>("/api/v1/tasks"),
    apiRequest<unknown[]>("/api/v1/evaluations"),
    apiRequest<unknown>("/api/v1/reports/summary"),
    auditRequest(),
  ]);

  const actor = checked(actorResponse.data, isApiActor, "tài khoản");
  const organization = checked(
    organizationResponse.data,
    isApiOrganization,
    "tổ chức",
  );
  const catalogData = checkedList(
    catalogResponse.data,
    isApiCatalogItem,
    "danh mục",
  );
  const taskData = checkedList(taskResponse.data, isApiTask, "nhiệm vụ");
  const evaluationData = checkedList(
    evaluationResponse.data,
    isApiEvaluation,
    "đánh giá",
  );
  const summary = checked(
    summaryResponse.data,
    isApiReportSummary,
    "kỳ báo cáo",
  );
  const audit = checkedList(auditData, isApiAuditEvent, "nhật ký");
  const publishedVersion =
    typeof catalogResponse.meta?.publishedVersion === "string"
      ? catalogResponse.meta.publishedVersion
      : (catalogData[0]?.version ?? "");

  const people = organization.people.map(mapApiPerson);
  const departments = organization.departments.map((department) =>
    mapApiDepartment(department, organization.people),
  );
  const catalog = catalogData.map((item) =>
    mapApiCatalogItem(item, publishedVersion),
  );
  const periods = [mapApiPeriod(summary.period)];
  const taskContext = { catalog, departments, people, periods };
  const tasks = taskData.map((task) => mapApiTask(task, taskContext));
  const receivedAt = new Date().toISOString();
  const evaluations = evaluationData.map((evaluation) =>
    mapApiEvaluation(evaluation, { people }, receivedAt),
  );

  setState((state) => ({
    ...state,
    user: {
      ...actor,
      title:
        organization.people.find((person) => person.id === actor.id)?.title ??
        "",
      departmentName:
        departments.find((department) => department.id === actor.departmentId)
          ?.name ?? null,
    },
    departments,
    people,
    positions: mapPositions(organization.people),
    responsibilities: [],
    catalog,
    activeCatalogVersion: publishedVersion,
    tasks,
    periods,
    evaluations,
    audit: audit.map(mapApiAuditEvent),
    hydrated: true,
    storageError: null,
  }));
}

async function updateTask(
  path: string,
  init: RequestInit,
  successMessage: string,
): Promise<boolean> {
  try {
    const response = await apiRequest<unknown>(path, init);
    const task = checked(response.data, isApiTask, "nhiệm vụ");
    upsertTask(mapApiTask(task, getState()));
    pushToast("success", successMessage);
    return true;
  } catch (error) {
    pushToast("error", errorText("Cập nhật nhiệm vụ", error));
    return false;
  }
}

async function updateEvaluation(
  path: string,
  body: unknown,
  successMessage: string,
): Promise<boolean> {
  try {
    const previous = getState().evaluations.find(
      (item) => item.id === path.split("/")[4],
    );
    const response = await apiRequest<unknown>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const evaluation = checked(response.data, isApiEvaluation, "đánh giá");
    upsertEvaluation(
      mapApiEvaluation(
        evaluation,
        getState(),
        new Date().toISOString(),
        previous,
      ),
    );
    pushToast("success", successMessage);
    return true;
  } catch (error) {
    pushToast("error", errorText("Cập nhật hồ sơ", error));
    return false;
  }
}

function unsupported(): false {
  pushToast("error", "API chưa hỗ trợ thao tác này.");
  return false;
}

function unsupportedMasterData(): never {
  throw new Error("API chưa hỗ trợ thao tác này.");
}

export const apiModeActions = {
  async login(userId: string): Promise<boolean> {
    setDevelopmentIdentity(userId);
    try {
      await loadApiWorkspace();
      pushToast("success", "Đã mở phiên làm việc");
      return true;
    } catch (error) {
      setDevelopmentIdentity(null);
      setState((state) => ({ ...state, user: null, hydrated: true }));
      pushToast("error", errorText("Đăng nhập", error));
      return false;
    }
  },

  async logout(): Promise<void> {
    setDevelopmentIdentity(null);
    setState((state) => ({ ...state, user: null, hydrated: true }));
  },

  async createTask(input: {
    catalogItemId: string;
    assigneeId: string;
    title: string;
    description: string;
    dueAt: string;
  }): Promise<boolean> {
    return updateTask(
      "/api/v1/tasks",
      { method: "POST", body: JSON.stringify(input) },
      "Đã tạo nhiệm vụ",
    );
  },

  async saveResult(
    taskId: string,
    patch: Pick<TaskResult, "quantity" | "product" | "qualityLevel" | "note">,
    submit: boolean,
  ): Promise<boolean> {
    return updateTask(
      `/api/v1/tasks/${encodeURIComponent(taskId)}/result`,
      {
        method: "POST",
        body: JSON.stringify({
          quantity: patch.quantity,
          product: patch.product,
          qualityLevel: qualityToApi(patch.qualityLevel),
          note: patch.note,
          submit,
        }),
      },
      submit ? "Đã nộp kết quả" : "Đã lưu kết quả",
    );
  },

  async acceptTask(taskId: string): Promise<boolean> {
    return updateTask(
      `/api/v1/tasks/${encodeURIComponent(taskId)}/accept`,
      { method: "POST" },
      "Đã nghiệm thu nhiệm vụ",
    );
  },

  async returnTask(taskId: string, note: string): Promise<boolean> {
    return updateTask(
      `/api/v1/tasks/${encodeURIComponent(taskId)}/return`,
      { method: "POST", body: JSON.stringify({ note }) },
      "Đã trả lại nhiệm vụ",
    );
  },

  async selfEvaluate(
    id: string,
    input: { comment: string; proposed: Classification },
  ): Promise<boolean> {
    return updateEvaluation(
      `/api/v1/evaluations/${encodeURIComponent(id)}/self`,
      input,
      "Đã nộp tự đánh giá",
    );
  },

  async reviewEvaluation(
    id: string,
    input: {
      comment: string;
      proposed: Classification;
      action: "propose" | "return";
    },
  ): Promise<boolean> {
    return updateEvaluation(
      `/api/v1/evaluations/${encodeURIComponent(id)}/review`,
      input,
      input.action === "propose" ? "Đã gửi đề xuất" : "Đã trả lại hồ sơ",
    );
  },

  async decideEvaluation(
    id: string,
    input: { classification: Classification; note: string },
  ): Promise<boolean> {
    return updateEvaluation(
      `/api/v1/evaluations/${encodeURIComponent(id)}/decision`,
      input,
      "Đã lưu quyết định",
    );
  },

  async lockPeriod(id: string): Promise<boolean> {
    try {
      const response = await apiRequest<unknown>(
        `/api/v1/periods/${encodeURIComponent(id)}/lock`,
        { method: "POST" },
      );
      const period = checked(response.data, isApiPeriod, "kỳ đánh giá");
      const mapped = mapApiPeriod(period);
      setState((state) => ({
        ...state,
        periods: state.periods.map((item) =>
          item.id === mapped.id ? mapped : item,
        ),
        evaluations: state.evaluations.map((evaluation) =>
          evaluation.periodId === mapped.id && evaluation.status === "APPROVED"
            ? { ...evaluation, status: "LOCKED" }
            : evaluation,
        ),
      }));
      pushToast("success", "Đã khóa kỳ");
      return true;
    } catch (error) {
      pushToast("error", errorText("Khóa kỳ", error));
      return false;
    }
  },

  async resetWorkspace(): Promise<void> {
    try {
      await loadApiWorkspace();
      pushToast("success", "Đã tải lại dữ liệu từ API");
    } catch (error) {
      pushToast("error", errorText("Tải lại dữ liệu", error));
    }
  },

  updateProgress: async (): Promise<boolean> => unsupported(),
  addEvidence: async (): Promise<boolean> => unsupported(),
  removeEvidence: async (): Promise<boolean> => unsupported(),
  reassignTask: async (): Promise<boolean> => unsupported(),
  cancelTask: async (): Promise<boolean> => unsupported(),
  createEvaluation: async (): Promise<null> => {
    unsupported();
    return null;
  },
  calculateEvaluation: async (): Promise<boolean> => unsupported(),
  updateConditions: async (): Promise<boolean> => unsupported(),
  reopenPeriod: async (): Promise<boolean> => unsupported(),
  createPeriod: async (): Promise<boolean> => unsupported(),
  saveMappings: (): boolean => unsupported(),
  simulateSync: async (): Promise<boolean> => unsupported(),
  saveDepartment: unsupportedMasterData,
  removeDepartment: unsupportedMasterData,
  savePerson: unsupportedMasterData,
  removePerson: unsupportedMasterData,
  savePosition: unsupportedMasterData,
  removePosition: unsupportedMasterData,
  saveResponsibility: unsupportedMasterData,
  removeResponsibility: unsupportedMasterData,
  saveCatalog: unsupportedMasterData,
  removeCatalog: unsupportedMasterData,
  duplicateVersion: unsupportedMasterData,
  publishVersion: unsupportedMasterData,
  importCatalog: unsupportedMasterData,
};
