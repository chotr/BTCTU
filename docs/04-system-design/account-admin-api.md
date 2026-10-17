# API quản trị tài khoản

Không có đăng ký công khai. Tài khoản được tạo từ nhân sự đã có trong danh mục
và được nối bằng `directory_actor_id`.

## Quyền tài khoản

| Quyền           | Phạm vi                                                  |
| --------------- | -------------------------------------------------------- |
| `ROOT`          | Một tài khoản khẩn cấp; cấp hoặc thu hồi `ACCOUNT_ADMIN` |
| `ACCOUNT_ADMIN` | Tạo, cập nhật, khóa và đặt lại mật khẩu tài khoản `USER` |
| `USER`          | Đăng nhập và dùng chức năng nghiệp vụ                    |

`ROOT` không được tạo qua HTTP. Khi triển khai, tạo một lần bằng
`pnpm --filter @btctu/api db:bootstrap-root` với `ROOT_BOOTSTRAP_EMAIL` và
`ROOT_BOOTSTRAP_PASSWORD`. Không dùng root cho thao tác thường ngày.

## Endpoint

Tất cả endpoint dưới đây cần access token và quyền `ROOT` hoặc `ACCOUNT_ADMIN`.

| Method  | Path                                     | Quyền bổ sung | Mục đích                                   |
| ------- | ---------------------------------------- | ------------- | ------------------------------------------ |
| `GET`   | `/api/v1/admin/users`                    |               | Danh sách tài khoản                        |
| `GET`   | `/api/v1/admin/users/:id`                |               | Chi tiết tài khoản được phép quản lý       |
| `GET`   | `/api/v1/admin/user-candidates`          |               | Nhân sự chưa có tài khoản                  |
| `POST`  | `/api/v1/admin/users`                    |               | Tạo `USER` từ nhân sự có sẵn               |
| `PATCH` | `/api/v1/admin/users/:id`                |               | Đổi email, nhân sự gắn kèm hoặc trạng thái |
| `POST`  | `/api/v1/admin/users/:id/reset-password` |               | Đặt mật khẩu tạm thời                      |
| `PUT`   | `/api/v1/admin/users/:id/account-role`   | `ROOT`        | Cấp hoặc thu hồi `ACCOUNT_ADMIN`           |

Tài khoản `ROOT` không thể sửa, khóa hoặc đổi quyền qua API. `ACCOUNT_ADMIN`
không thể quản lý root, tài khoản admin khác hoặc quyền của chính mình.

## Tạo tài khoản

```json
{
  "email": "nguyenvana@btctu.local",
  "directoryActorId": "u-nguyen-van-a",
  "initialPassword": "mật-khẩu-tạm"
}
```

`directoryActorId` phải có trong danh mục nhân sự và chưa được gắn với tài khoản
khác. Tài khoản mới có `mustChangePassword=true`; chỉ được dùng endpoint
`POST /api/v1/auth/change-password` cho đến khi đổi mật khẩu.

Không có xóa cứng. Dùng `PATCH` với `{ "status": "DISABLED" }` để khóa tài
khoản. Khóa tài khoản, thay email/nhân sự, đặt lại mật khẩu hoặc đổi quyền đều
thu hồi mọi phiên hiện có.

## Audit

Mọi thay đổi thành công được ghi ở `audit_events` với tài khoản thực hiện, phiên,
yêu cầu, tài khoản đích và một trong các action: `account.created`,
`account.updated`, `account.disabled`, `account.enabled`,
`account.password_reset`, `account.admin_granted`, `account.admin_revoked`.
