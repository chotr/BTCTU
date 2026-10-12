# BTCTU API

Hono REST API chạy trên Cloudflare Workers, cung cấp hợp đồng cho nhiệm vụ, đánh giá, kỳ, audit và báo cáo.

## Chạy local

```bash
pnpm install --frozen-lockfile
pnpm --filter @btctu/api types
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

## Adapter dữ liệu tạm thời

`src/mock-state.ts` tạo dữ liệu theo từng request để contract test độc lập trong lúc chờ kho dữ liệu thật. Nó không cung cấp persistence.

Trước khi production:

- thay adapter bằng repository D1/PostgreSQL đã có migration và transaction;
- xác minh chữ ký, issuer và audience của Cloudflare Access JWT;
- không cho phép `x-dev-user-id`;
- dùng R2/DMS được phê duyệt cho tài liệu, Queue/Workflow cho việc nền;
- cấu hình origin thật, rate limiting, backup, retention và audit bất biến.

## Deploy có chủ đích

Không có lệnh deploy mặc định để tránh đẩy nhầm Worker root.

```bash
pnpm --filter @btctu/api deploy:staging
pnpm --filter @btctu/api deploy:production
```

Thay origin `.invalid` trong `wrangler.jsonc` trước khi deploy. Secret được đặt bằng `wrangler secret put`, không ghi trong source hoặc config.
