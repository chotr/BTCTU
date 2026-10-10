# BTCTU API

Hono REST API chạy trên Cloudflare Workers. Đây là backend mock-first để nối dần với UI; dữ liệu hiện được khởi tạo lại theo từng request bằng fixture tổng hợp, chưa phải nguồn dữ liệu chính thức.

## Chạy local

```bash
pnpm install
pnpm --filter @btctu/api types
pnpm --filter @btctu/api dev
```

Mặc định API chạy tại `http://localhost:8787`.

## Endpoint chính

| Method | Path | Mục đích |
|---|---|---|
| GET | `/health` | health/readiness cơ bản |
| GET | `/openapi.json` | REST contract hiện tại |
| GET | `/api/v1/organizations` | phòng, người, vị trí |
| GET | `/api/v1/catalog` | catalog công việc versioned |
| GET/POST | `/api/v1/tasks` | danh sách/tạo nhiệm vụ |
| GET | `/api/v1/tasks/:id` | chi tiết nhiệm vụ |
| POST | `/api/v1/tasks/:id/result` | lưu/nộp kết quả |
| POST | `/api/v1/tasks/:id/accept` | nghiệm thu |
| POST | `/api/v1/tasks/:id/return` | trả lại chỉnh sửa |
| GET/POST | `/api/v1/evaluations` | danh sách/tự đánh giá/thẩm định/quyết định |
| POST | `/api/v1/periods/:id/lock` | khóa kỳ demo |
| GET | `/api/v1/audit` | audit events |
| GET | `/api/v1/reports/summary` | dashboard/report summary |

## Identity local

Local dùng `x-demo-user-id` (`u-leader`, `u-head`, `u-staff`) để mô phỏng actor. Đây chỉ là adapter phát triển; production phải đặt API sau Cloudflare Access và xác minh Access JWT trước khi map actor/quyền.

## Ranh giới mock

- Không dùng module-level mutable request state.
- Mỗi request tạo state demo mới để test route độc lập và không vô tình giả lập persistence.
- D1/Drizzle, R2, Queue và Access sẽ được nối ở milestone foundation sau khi resource/approval được cấp.
- Quyền trong source là candidate design phục vụ demo, không phải quy định nhân sự.
