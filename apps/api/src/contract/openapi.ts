// Danh mục endpoint phát triển. Schema thực thi hiện nằm cạnh từng route Zod,
// nên tài liệu này không phải nguồn hợp đồng sinh mã.
export const openapi = {
  openapi: "3.1.0",
  info: {
    title: "BTCTU Development API",
    version: "0.1.0",
    description:
      "Development endpoint inventory. Request validation is implemented in route schemas.",
  },
  servers: [{ url: "http://localhost:8787", description: "Local server" }],
  security: [{ developmentIdentity: [] }],
  components: {
    securitySchemes: {
      developmentIdentity: {
        type: "apiKey",
        in: "header",
        name: "x-dev-user-id",
        description: "Local-development identity adapter",
      },
      accessJwt: {
        type: "http",
        scheme: "bearer",
        description:
          "Bearer header or the httpOnly cookie issued by /api/v1/auth/login",
      },
    },
  },
  paths: {
    "/api/v1/auth/login": {
      post: {
        security: [],
        responses: {
          "200": {
            description:
              "Account returned, both tokens set as httpOnly cookies",
          },
          "401": { description: "Invalid credentials" },
          "403": { description: "Account disabled" },
          "429": { description: "Too many failed attempts" },
        },
      },
    },
    "/api/v1/auth/refresh": {
      post: {
        security: [],
        responses: {
          "200": { description: "Tokens rotated inside the same session" },
          "401": {
            description: "Refresh token missing, invalid, expired or reused",
          },
          "409": {
            description: "A refresh with the same token is already in progress",
          },
        },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        security: [],
        responses: {
          "204": { description: "Session revoked and both cookies cleared" },
        },
      },
    },
    "/api/v1/auth/session": {
      get: {
        security: [{ accessJwt: [] }],
        responses: {
          "200": { description: "Authenticated account" },
          "401": { description: "Missing, invalid or expired access token" },
        },
      },
    },
    "/health": {
      get: {
        security: [],
        responses: { "200": { description: "Server is ready" } },
      },
    },
    "/api/v1/me": {
      get: { responses: { "200": { description: "Current actor" } } },
    },
    "/api/v1/organizations": {
      get: { responses: { "200": { description: "Departments and people" } } },
    },
    "/api/v1/catalog": {
      get: { responses: { "200": { description: "Versioned work catalog" } } },
    },
    "/api/v1/tasks": {
      get: { responses: { "200": { description: "Task list" } } },
      post: { responses: { "201": { description: "Task created" } } },
    },
    "/api/v1/tasks/{id}": {
      get: {
        responses: {
          "200": { description: "Task detail" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/v1/tasks/{id}/result": {
      post: { responses: { "200": { description: "Result saved" } } },
    },
    "/api/v1/tasks/{id}/accept": {
      post: { responses: { "200": { description: "Task accepted" } } },
    },
    "/api/v1/tasks/{id}/return": {
      post: { responses: { "200": { description: "Task returned" } } },
    },
    "/api/v1/evaluations": {
      get: { responses: { "200": { description: "Evaluation list" } } },
    },
    "/api/v1/evaluations/{id}": {
      get: { responses: { "200": { description: "Evaluation detail" } } },
    },
    "/api/v1/evaluations/{id}/self": {
      post: {
        responses: { "200": { description: "Self evaluation submitted" } },
      },
    },
    "/api/v1/evaluations/{id}/review": {
      post: { responses: { "200": { description: "Review saved" } } },
    },
    "/api/v1/evaluations/{id}/decision": {
      post: { responses: { "200": { description: "Decision saved" } } },
    },
    "/api/v1/periods/{id}/lock": {
      post: { responses: { "200": { description: "Period locked" } } },
    },
    "/api/v1/audit": {
      get: { responses: { "200": { description: "Audit events" } } },
    },
    "/api/v1/reports/summary": {
      get: { responses: { "200": { description: "Dashboard summary" } } },
    },
  },
} as const;
