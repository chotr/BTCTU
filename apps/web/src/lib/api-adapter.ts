import {
  CLASSIFICATIONS,
  EVALUATION_STATUSES,
  ROLES,
  TASK_STATUSES,
  type Classification,
  type CreateTaskInput,
  type EvaluationStatus,
  type Role,
} from "@btctu/shared";
import { ApiError, apiRequest } from "./http-client";
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
import { catalogCsvTemplate, previewCatalogCsv } from "./master-data";
import { PROFILES, previewPayload } from "./integration";
import { exportReport } from "./exports";
import type { AppUser } from "./types";

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
  periodId: string;
  plannedQuantity: number;
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
  selfEvaluatedAt: string | null;
  reviewComment: string | null;
  reviewerId: string | null;
  reviewedAt: string | null;
  decisionNote: string | null;
  decidedById: string | null;
  decidedAt: string | null;
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
    role: item.role,
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
  const period = task.periodId
    ? state.periods.find((p) => p.id === task.periodId)
    : undefined;
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
    periodId: task.periodId,
    plannedQuantity: task.plannedQuantity,
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
  };
}

export function mapApiEvaluation(
  evaluation: ApiEvaluation,
  state: Pick<AppState, "people">,
  previous?: Evaluation,
): Evaluation {
  const person = state.people.find((item) => item.id === evaluation.subjectId);
  const isLeader =
    person?.role === ROLES.truongPhong || person?.role === ROLES.lanhDao;
  const base: Evaluation =
    previous ??
    ({
      id: evaluation.id,
      periodId: evaluation.periodId,
      subjectId: evaluation.subjectId,
      subjectType: "PERSON",
      departmentId: evaluation.departmentId,
      status: evaluation.status,
      isLeader,
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
    } satisfies Evaluation);

  return {
    ...base,
    periodId: evaluation.periodId,
    subjectId: evaluation.subjectId,
    departmentId: evaluation.departmentId,
    status: evaluation.status,
    isLeader: base.isLeader,
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
          at: evaluation.selfEvaluatedAt,
        }
      : null,
    review: evaluation.reviewComment
      ? {
          comment: evaluation.reviewComment,
          proposed: evaluation.classification,
          reviewerId: evaluation.reviewerId ?? "",
          at: evaluation.reviewedAt ?? "",
        }
      : null,
    decision: evaluation.decisionNote
      ? {
          classification: evaluation.classification,
          decidedById: evaluation.decidedById ?? "",
          at: evaluation.decidedAt ?? "",
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

async function auditRequest(): Promise<ApiAuditEvent[]> {
  try {
    return (await apiRequest<ApiAuditEvent[]>("/api/v1/audit")).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) return [];
    throw error;
  }
}

export async function loadApiWorkspace(): Promise<void> {
  let actorResponse;
  try {
    actorResponse = await apiRequest<ApiActor>("/api/v1/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      setState((state) => ({
        ...state,
        user: null,
        departments: [],
        people: [],
        catalog: [],
        tasks: [],
        evaluations: [],
        periods: [],
        audit: [],
        hydrated: true,
        storageError: null,
      }));
      return;
    }
    throw error;
  }

  const [
    organizationResponse,
    catalogResponse,
    taskResponse,
    evaluationResponse,
    summaryResponse,
    auditData,
  ] = await Promise.all([
    apiRequest<ApiOrganization>("/api/v1/organizations"),
    apiRequest<ApiCatalogItem[]>("/api/v1/catalog"),
    apiRequest<ApiTask[]>("/api/v1/tasks"),
    apiRequest<ApiEvaluation[]>("/api/v1/evaluations"),
    apiRequest<ApiReportSummary>("/api/v1/reports/summary"),
    auditRequest(),
  ]);

  const actor = actorResponse.data;
  const organization = organizationResponse.data;
  const catalogData = catalogResponse.data ?? [];
  const taskData = taskResponse.data ?? [];
  const evaluationData = evaluationResponse.data ?? [];
  const summary = summaryResponse.data;
  const audit = auditData ?? [];
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
  const evaluations = evaluationData.map((evaluation) =>
    mapApiEvaluation(evaluation, { people }),
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
    const response = await apiRequest<ApiTask>(path, init);
    const task = response.data;
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
    const response = await apiRequest<ApiEvaluation>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const evaluation = response.data;
    upsertEvaluation(
      mapApiEvaluation(
        evaluation,
        getState(),
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
  async loginWithCredentials(
    email: string,
    password: string,
  ): Promise<{ ok: boolean; message?: string }> {
    try {
      await apiRequest<{ user: { id: string }; expiresIn: number }>(
        "/api/v1/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) },
      );
      await loadApiWorkspace();
      if (!getState().user) {
        return {
          ok: false,
          message:
            "Tài khoản đã xác thực nhưng chưa được gán hồ sơ nhân sự để sử dụng hệ thống.",
        };
      }
      pushToast("success", "Đã đăng nhập");
      return { ok: true };
    } catch (error) {
      setState((state) => ({ ...state, user: null, hydrated: true }));
      if (error instanceof ApiError) {
        if (error.status === 401) {
          return { ok: false, message: "Email hoặc mật khẩu không đúng." };
        }
        if (error.status === 403) {
          return {
            ok: false,
            message:
              "Tài khoản chưa được cấp quyền sử dụng hoặc chưa gắn với hồ sơ nhân sự.",
          };
        }
      }
      pushToast("error", errorText("Đăng nhập", error));
      return {
        ok: false,
        message: "Không thể kết nối tới hệ thống. Vui lòng thử lại sau.",
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await apiRequest("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // Server có thể đã xóa phiên — tiếp tục xóa trạng thái cục bộ.
    }
    setState((state) => ({
      ...state,
      user: null,
      departments: [],
      people: [],
      catalog: [],
      tasks: [],
      evaluations: [],
      periods: [],
      audit: [],
      hydrated: true,
    }));
  },

  async createTask(input: CreateTaskInput): Promise<boolean> {
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
      const response = await apiRequest<ApiPeriod>(
        `/api/v1/periods/${encodeURIComponent(id)}/lock`,
        { method: "POST" },
      );
      const period = response.data;
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
  exportReport,
  catalogTemplate: catalogCsvTemplate,
  previewCatalogCsv,
  profiles: PROFILES,
  previewPayload,
  accounts: (): AppUser[] => [],
  login: async (): Promise<boolean> => unsupported(),
  deniedAccess: async (resource: string): Promise<void> => {
    pushToast("error", `Không có quyền truy cập: ${resource}`);
  },
};
