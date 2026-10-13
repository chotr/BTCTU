# BTCTU Web

Giao diện quản lý nhiệm vụ, KPI, đánh giá và xếp loại.

## Nguồn dữ liệu

Application layer đi qua `src/lib/api.ts`. Trong giai đoạn chờ API hoàn chỉnh, adapter cục bộ dùng dữ liệu khởi tạo tại `src/lib/mock/` và lưu trạng thái phiên trong `localStorage`.

Ranh giới chuyển đổi đã được chuẩn bị:

- `src/lib/runtime-config.ts` quản lý môi trường và URL API;
- `src/lib/http-client.ts` chuẩn hóa timeout, lỗi và request ID;
- component không đọc trực tiếp endpoint;
- mock không được xem là nguồn dữ liệu chính thức hoặc cơ chế lưu trữ production.

Khi API sẵn sàng, chuyển `NEXT_PUBLIC_DATA_SOURCE=api` và thay implementation trong application layer; không đưa logic gọi HTTP vào component.

## Chạy local

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

Ứng dụng chạy tại `http://localhost:3000`.

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Biến môi trường

| Biến | Dev mặc định | Mục đích |
|---|---|---|
| `NEXT_PUBLIC_DATA_SOURCE` | `local` | `local` trong giai đoạn chờ API; `api` khi adapter API hoàn tất |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8787` | URL gốc của REST API |
| `NEXT_PUBLIC_APP_ENV` | `development` | `development`, `staging` hoặc `production` |

Không đặt secret vào biến `NEXT_PUBLIC_*`; các biến này được gửi tới trình duyệt.

## Điều kiện đưa lên production

- cấu hình `NEXT_PUBLIC_DATA_SOURCE=api`;
- xác thực qua IdP/access token đã được phê duyệt;
- API thực thi phân quyền phía server;
- dữ liệu được lưu bằng kho bền vững và có migration/backup;
- hoàn tất thẩm định ATTT, CORS, CSP, giám sát và runbook khôi phục;
- phê duyệt các quy tắc nghiệp vụ còn trạng thái `CANDIDATE`/TBD.
