# BTCTU API

API Express.js cung cấp các tuyến cho nhiệm vụ, đánh giá, kỳ, nhật ký và báo cáo.

Phần đăng nhập đã lưu người dùng và phiên trong PostgreSQL. Các tuyến nghiệp vụ
khác hiện chia sẻ dữ liệu bộ nhớ (WorkspaceState) trong cùng phiên bản ứng dụng,
nhưng chưa được lưu bền vững vào cơ sở dữ liệu khi khởi động lại server.

## Chạy local

```bash
pnpm install --frozen-lockfile
cp apps/api/.env.example apps/api/.env
pnpm --filter @btctu/api dev
```

- API: `http://localhost:8787`
- OpenAPI: `http://localhost:8787/openapi.json`
- Health: `http://localhost:8787/health`

Môi trường cục bộ dùng header `x-dev-user-id` (ví dụ: `p-nguyen-thuong-hai`,
`p-tran-hai-trieu`, `p-nguyen-tran-thi`)
để chọn người dùng thử nghiệm. Header này không phải cơ chế xác thực cho môi
trường vận hành.

## Đăng nhập

API xác thực bằng email/mật khẩu, cấp access token (JWT) và refresh token lưu trong cookie `HttpOnly`:

| Method | Path                           | Mục đích                                               |
| ------ | ------------------------------ | ------------------------------------------------------ |
| POST   | `/api/v1/auth/login`           | đổi email/mật khẩu lấy token, đặt cả hai vào cookie    |
| POST   | `/api/v1/auth/refresh`         | xoay refresh token, cấp access token mới               |
| POST   | `/api/v1/auth/logout`          | thu hồi phiên và xoá cả hai cookie                     |
| GET    | `/api/v1/auth/session`         | tài khoản và phiên của phiên hiện tại                  |
| POST   | `/api/v1/auth/change-password` | đổi mật khẩu của chính tài khoản, sau đó đăng nhập lại |

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
- lỗi trả về theo problem+json (`type`, `title`, `status`, `detail`, `instance`, `requestId`) như các route khác; phần đầu của `type` theo `PROBLEM_TYPE_BASE`, mặc định là `${PUBLIC_BASE_URL}/problems`.

`db:seed` tạo 19 tài khoản mẫu cho danh bạ quản lý cùng `root@example.test`
và `iam-admin@example.test`, dùng mật khẩu chung `dev-only-changeme`. Đặt
`DEV_SEED_PASSWORD` để đổi mật khẩu trước khi chạy. Seed chỉ chạy ngoài
production và thay thế ba tài khoản mẫu cũ (`leader`, `head`, `staff`) nếu
chúng còn tồn tại. Khi đưa vào vận hành, `db:bootstrap-root` thay root mẫu bằng
root thật; seed từ chối chạy nếu root thật đã tồn tại.

Danh tính cho các route nghiệp vụ đi qua cổng `ActorResolver`. Tài khoản có
`directory_actor_id` được nối với actor trong danh mục nghiệp vụ; access cookie
được dùng ở mọi môi trường. Ngoài production, request không có cookie vẫn có thể
dùng `x-dev-user-id` để kiểm thử nhanh. Production không chấp nhận header này và
trả 403 `actor_not_provisioned` nếu tài khoản chưa được gán actor.

Mô tả chi tiết về cookie, mã lỗi và luồng đổi token:
[docs/04-system-design/auth-api.md](../../docs/04-system-design/auth-api.md).

## Endpoint chính

| Method   | Path                                     | Mục đích                        |
| -------- | ---------------------------------------- | ------------------------------- |
| GET      | `/health`                                | liveness/readiness cơ bản       |
| GET      | `/openapi.json`                          | danh mục endpoint phát triển    |
| GET      | `/api/v1/me`                             | actor hiện tại                  |
| GET      | `/api/v1/organizations`                  | đơn vị và nhân sự               |
| GET      | `/api/v1/catalog`                        | danh mục công việc có phiên bản |
| GET/POST | `/api/v1/tasks`                          | danh sách/tạo nhiệm vụ          |
| GET      | `/api/v1/tasks/:id`                      | chi tiết nhiệm vụ               |
| POST     | `/api/v1/tasks/:id/result`               | lưu hoặc nộp kết quả            |
| POST     | `/api/v1/tasks/:id/accept`               | nghiệm thu                      |
| POST     | `/api/v1/tasks/:id/return`               | trả lại chỉnh sửa               |
| GET      | `/api/v1/evaluations`                    | danh sách hồ sơ đánh giá        |
| POST     | `/api/v1/evaluations/:id/self`           | tự đánh giá                     |
| POST     | `/api/v1/evaluations/:id/review`         | thẩm định                       |
| POST     | `/api/v1/evaluations/:id/decision`       | quyết định                      |
| POST     | `/api/v1/periods/:id/lock`               | khóa kỳ                         |
| GET      | `/api/v1/audit`                          | nhật ký audit                   |
| GET      | `/api/v1/reports/summary`                | số liệu tổng hợp                |
| GET      | `/api/v1/admin/users`                    | tài khoản được phép quản trị    |
| GET      | `/api/v1/admin/user-candidates`          | nhân sự chưa có tài khoản       |
| POST     | `/api/v1/admin/users`                    | tạo tài khoản từ nhân sự        |
| PATCH    | `/api/v1/admin/users/:id`                | sửa hoặc khóa tài khoản         |
| POST     | `/api/v1/admin/users/:id/reset-password` | đặt mật khẩu tạm thời           |
| PUT      | `/api/v1/admin/users/:id/account-role`   | cấp/thu hồi admin, chỉ root     |

Không có đăng ký công khai hoặc xóa cứng tài khoản. Tài khoản mới phải được gắn
với nhân sự sẵn có và đổi mật khẩu ở lần sử dụng đầu tiên. Xem
[API quản trị tài khoản](../../docs/04-system-design/account-admin-api.md).

Tạo root một lần khi triển khai:

```bash
ROOT_BOOTSTRAP_EMAIL=root@btctu.local \
ROOT_BOOTSTRAP_PASSWORD='mật-khẩu-đủ-mạnh' \
pnpm --filter @btctu/api db:bootstrap-root
```

## Cấu trúc

- `src/app.ts` — điểm ghép nối: chọn adapter theo môi trường, lắp middleware chung rồi mount module. `createApp(env)` kiểm thử được qua supertest, không cần mở cổng.
- `src/index.ts` — entry khởi động server (`listen`).
- `src/env.ts` — đọc cấu hình từ biến môi trường (`PORT`, `ENVIRONMENT`, `CORS_ORIGINS`, `PROBLEM_TYPE_BASE`).
- `src/modules/*` — một thư mục cho mỗi module nghiệp vụ (organization, catalog, task, evaluation, audit, reporting, auth, identity); mỗi module tự khai báo router và schema của mình.
- `src/middleware/*` — request id và CORS, kiểm Origin, kiểm body, xử lý lỗi, xác thực và uỷ quyền.
- `src/contract/openapi.ts` — danh mục endpoint phục vụ ở `/openapi.json`; schema thực thi nằm cạnh route Zod.
- `src/shared/*` — khuôn lỗi problem+json và tiện ích dùng chung.
- `src/mock-state.ts` — trạng thái mẫu được khởi tạo khi ứng dụng khởi động; chưa có persistence.
- `src/types.ts` — kiểu domain của API.

Ánh xạ module sang mã nguồn: [docs/04-system-design/module-boundaries.md](../../docs/04-system-design/module-boundaries.md).

## Trạng thái dữ liệu tạm thời

`src/mock-state.ts` khởi tạo trạng thái làm việc mẫu (`createWorkspaceState`) khi ứng dụng khởi động. Trạng thái này tồn tại trong RAM của tiến trình, phục vụ thử nghiệm giao diện và kiểm thử hợp đồng, nhưng không đảm bảo tính bền vững (persistence) khi khởi động lại hoặc khi mở rộng nhiều instance.

Trước khi production:

- thay adapter bằng repository DB đã có migration và transaction;
- xác minh access token (chữ ký, issuer, audience) theo cơ chế được phê duyệt;
- không cho phép `x-dev-user-id`;
- dùng kho tài liệu (DMS) được phê duyệt cho minh chứng và job nền cho việc bất đồng bộ;
- cấu hình origin thật, rate limiting, backup, retention và audit bất biến.
