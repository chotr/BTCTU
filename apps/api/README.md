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

## Đăng nhập

API xác thực bằng email/mật khẩu, cấp access token (JWT) và refresh token lưu trong cookie `HttpOnly`:

| Method | Path | Mục đích |
|---|---|---|
| POST | `/api/v1/auth/login` | đổi email/mật khẩu lấy token, đặt cả hai vào cookie |
| POST | `/api/v1/auth/refresh` | xoay refresh token, cấp access token mới |
| POST | `/api/v1/auth/logout` | thu hồi phiên và xoá cả hai cookie |
| GET | `/api/v1/auth/session` | tài khoản và phiên của phiên hiện tại |

```bash
curl -i -c cookies.txt -X POST http://localhost:8787/api/v1/auth/login \
  -H "content-type: application/json" \
  -d '{"email":"staff@btctu.local","password":"dev-only-changeme"}'

curl -b cookies.txt http://localhost:8787/api/v1/auth/session
```

- access token và refresh token đều là cookie `HttpOnly` + `SameSite=Strict`, nên JavaScript không đọc được token nào; body của login/refresh chỉ trả tài khoản;
- access token dùng cho mọi route `/api/v1` (path `/api/v1`), hết hạn theo `JWT_ACCESS_TTL_SECONDS` (mặc định 900 giây);
- refresh token chỉ gửi tới các endpoint auth (path `/api/v1/auth`), cơ sở dữ liệu giữ hash SHA-256;
- refresh xoay token tại chỗ trên cùng một phiên; hai tab refresh cùng lúc thì request thua nhận 409 `refresh_in_progress` để thử lại, còn token cũ quay lại sau `AUTH_REFRESH_ROTATION_GRACE_SECONDS` (mặc định 30 giây) bị coi là rò rỉ và cả họ phiên bị thu hồi (401 `refresh_token_reuse`);
- mỗi request có token đều kiểm phiên trong `sessions`, nên đăng xuất hoặc thu hồi phiên có hiệu lực ngay với access token;
- `POST /login` bị giới hạn theo `AUTH_LOGIN_MAX_ATTEMPTS` lần sai trong `AUTH_LOGIN_WINDOW_SECONDS` giây cho mỗi cặp email/IP (mặc định 10 lần trong 60 giây), vượt hạn mức trả về 429;
- request thay đổi trạng thái có `Origin` ngoài `CORS_ORIGINS` bị từ chối với `origin_not_allowed`;
- cờ `Secure`/`SameSite` của cookie suy ra từ `ENVIRONMENT`, ghi đè bằng `AUTH_COOKIE_SECURE` và `AUTH_COOKIE_SAME_SITE`; `SameSite=None` đòi `Secure`;
- lỗi trả về theo problem+json (`type`, `title`, `status`, `detail`, `instance`, `requestId`) như các route khác.

Tài khoản phát triển (chạy `pnpm --filter @btctu/api db:migrate` trước, rồi `pnpm --filter @btctu/api db:seed`) dùng email `leader@btctu.local`, `head@btctu.local`, `staff@btctu.local`. Mật khẩu mặc định là `dev-only-changeme`; đặt `DEV_SEED_PASSWORD` để đổi.

Danh tính cho các route nghiệp vụ đi qua cổng `ActorResolver`. Ở môi trường khác `production`, resolver đọc danh mục trong bộ nhớ và request **bắt buộc** gửi `x-dev-user-id`; thiếu header trả 401 `unknown_actor`. Ở production, danh tính chỉ đến từ access token, và vì bảng `users` chưa gắn với danh mục nhân sự (mốc P2) nên những route đó trả 403 `actor_not_provisioned`.

Hợp đồng đầy đủ, gồm cookie, mã lỗi và luồng xoay token: [docs/04-system-design/auth-api.md](../../docs/04-system-design/auth-api.md).

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
