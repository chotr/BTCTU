# Mức sẵn sàng phát triển

## Mục tiêu

Bản 1.0 cung cấp môi trường dev có thể chạy, kiểm thử và tiếp tục tích hợp API mà không phải viết lại giao diện.

## Khởi chạy

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Kiểm tra trước khi merge:

```bash
pnpm check
pnpm --filter @btctu/web test:e2e
```

## Cấu hình

1. Sao chép `apps/web/.env.example` thành `apps/web/.env.local`.
2. Giữ `NEXT_PUBLIC_DATA_SOURCE=local` trong lúc API chưa hoàn chỉnh.
3. Chạy API local tại `http://localhost:8787`.
4. Khi adapter API hoàn tất, chuyển `NEXT_PUBLIC_DATA_SOURCE=api`.
5. Secret local đặt trong `apps/api/.dev.vars`, không commit.

## Contract thay mock bằng API

| Miền           | Nguồn local hiện tại                     | API đích                                   |
| -------------- | ---------------------------------------- | ------------------------------------------ |
| Phiên/tác nhân | `mock/users.ts`                          | `GET /api/v1/me`                           |
| Tổ chức        | `mock/organization.ts`                   | `GET /api/v1/organizations`                |
| Danh mục       | `mock/catalog.ts`                        | `GET /api/v1/catalog`                      |
| Nhiệm vụ       | `mock/tasks.ts`                          | `/api/v1/tasks`                            |
| Kỳ/đánh giá    | `mock/periods.ts`, `mock/evaluations.ts` | `/api/v1/periods`, `/api/v1/evaluations`   |
| Audit/report   | `mock/audit.ts`, selector cục bộ         | `/api/v1/audit`, `/api/v1/reports/summary` |

Nguyên tắc chuyển đổi:

- schema API là nguồn kiểu dữ liệu;
- response được validate trước khi đưa vào state;
- mutation cập nhật cache sau response thành công;
- lỗi dùng problem details và request ID;
- không fallback im lặng từ API sang mock ở production;
- mock chỉ được kích hoạt bằng cấu hình development/test.

## Định nghĩa hoàn thành cho adapter API

- mọi use case trên UI gọi API tương ứng;
- không còn business mutation chỉ tồn tại trong localStorage;
- đăng nhập production không hiển thị bộ chọn actor;
- API có persistence giữa các request;
- permission test ở API phủ allow/deny và self-review;
- E2E chạy trên staging với dữ liệu seed độc lập;
- build production từ chối cấu hình nguồn dữ liệu local.

## Cổng vận hành

Xem [deployment.md](../04-system-design/deployment.md) cho ATTT, identity, database, storage, observability, backup/DR và integration gate.
