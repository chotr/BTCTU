# BTCTU API

REST API **Express.js (Node)** cung cấp hợp đồng cho nhiệm vụ, đánh giá, kỳ, audit và báo cáo.

## Chạy local

```bash
pnpm install --frozen-lockfile
cp apps/api/.env.example apps/api/.env
pnpm --filter @btctu/api dev
```

- API: `http://localhost:8787`
- OpenAPI: `http://localhost:8787/openapi.json`
- Health: `http://localhost:8787/health`

Môi trường local dùng header `x-dev-user-id` (`u-leader`, `u-head`, `u-staff`) để chọn actor phát triển. Header này không được chấp nhận như cơ chế xác thực production.

## Endpoint chính

| Method | Path | Mục đích |
|---|---|---|
| GET | `/health` | liveness/readiness cơ bản |
| GET | `/openapi.json` | REST contract |
| GET | `/api/v1/me` | actor hiện tại |
| GET | `/api/v1/organizations` | đơn vị và nhân sự |
| GET | `/api/v1/catalog` | danh mục công việc có phiên bản |
| GET/POST | `/api/v1/tasks` | danh sách/tạo nhiệm vụ |
| GET | `/api/v1/tasks/:id` | chi tiết nhiệm vụ |
| POST | `/api/v1/tasks/:id/result` | lưu hoặc nộp kết quả |
| POST | `/api/v1/tasks/:id/accept` | nghiệm thu |
| POST | `/api/v1/tasks/:id/return` | trả lại chỉnh sửa |
| GET | `/api/v1/evaluations` | danh sách hồ sơ đánh giá |
| POST | `/api/v1/evaluations/:id/self` | tự đánh giá |
| POST | `/api/v1/evaluations/:id/review` | thẩm định |
| POST | `/api/v1/evaluations/:id/decision` | quyết định |
| POST | `/api/v1/periods/:id/lock` | khóa kỳ |
| GET | `/api/v1/audit` | nhật ký audit |
| GET | `/api/v1/reports/summary` | số liệu tổng hợp |

## Cấu trúc

- `src/app.ts` — factory `createApp(env)` dựng Express app (kiểm thử được qua supertest, không cần mở cổng).
- `src/index.ts` — entry khởi động server (`listen`).
- `src/env.ts` — đọc cấu hình từ biến môi trường (`PORT`, `ENVIRONMENT`, `CORS_ORIGIN`).
- `src/mock-state.ts` — dữ liệu theo từng request để contract test độc lập trong lúc chờ kho dữ liệu thật; chưa có persistence.
- `src/types.ts` — kiểu domain của API.

## Adapter dữ liệu tạm thời

`src/mock-state.ts` tạo dữ liệu theo từng request để contract test độc lập trong lúc chờ kho dữ liệu thật. Nó không cung cấp persistence.

Trước khi production:

- thay adapter bằng repository DB đã có migration và transaction;
- xác minh access token (chữ ký, issuer, audience) theo cơ chế được phê duyệt;
- không cho phép `x-dev-user-id`;
- dùng kho tài liệu (DMS) được phê duyệt cho minh chứng và job nền cho việc bất đồng bộ;
- cấu hình origin thật, rate limiting, backup, retention và audit bất biến.
