# Giao diện BTCTU

Ứng dụng Next.js cho các màn hình quản lý nhiệm vụ, KPI và đánh giá.

## Trạng thái nguồn dữ liệu

Giao diện hiện chạy với dữ liệu mẫu:

- dữ liệu ban đầu nằm trong `src/lib/mock/`;
- thay đổi trong phiên được lưu ở `localStorage`;
- các màn hình gọi qua `src/lib/api.ts`, nhưng tệp này hiện vẫn là lớp xử lý cục bộ;
- `src/lib/http-client.ts` mới chỉ cung cấp tiện ích gọi HTTP, chưa được nối vào
  các thao tác nghiệp vụ.

`NEXT_PUBLIC_DATA_SOURCE=api` **chưa kích hoạt một trình kết nối API**. Khi chọn
giá trị này, `StoreProvider` hiển thị lỗi cấu hình để tránh tạo cảm giác rằng dữ
liệu đã được lưu trên máy chủ.

## Chạy ứng dụng

Từ thư mục gốc của repo:

```powershell
pnpm install --frozen-lockfile
Copy-Item apps/web/.env.example apps/web/.env.local
pnpm dev:web
```

Giao diện chạy tại `http://localhost:3000`.

Các lệnh kiểm tra:

```powershell
pnpm --filter @btctu/web typecheck
pnpm --filter @btctu/web test
pnpm --filter @btctu/web build
pnpm --filter @btctu/web test:e2e
```

## Biến môi trường

| Biến | Giá trị mặc định | Ghi chú |
| --- | --- | --- |
| `NEXT_PUBLIC_DATA_SOURCE` | `local` | Giữ nguyên `local` cho đến khi hoàn thành kết nối API |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8787` | Địa chỉ API sẽ được dùng bởi trình kết nối |
| `NEXT_PUBLIC_APP_ENV` | `development` | `development`, `staging` hoặc `production` |

Không đặt mật khẩu hoặc khóa bí mật trong biến `NEXT_PUBLIC_*`, vì các giá trị
này được đưa xuống trình duyệt.

## Điều kiện để bỏ dữ liệu mẫu

- mỗi thao tác trên màn hình có tuyến API tương ứng;
- dữ liệu trả về từ API được kiểm tra trước khi đưa vào trạng thái giao diện;
- đăng nhập dùng phiên do API cấp, không dùng bộ chọn tài khoản mẫu;
- tải lại trang không làm mất thay đổi đã lưu;
- các lỗi API hiển thị được mã yêu cầu để đối chiếu nhật ký;
- kiểm thử trình duyệt chạy với API và cơ sở dữ liệu thật.

Chỉ đổi biến môi trường là chưa đủ; cần hoàn thành các mục trên trước khi dùng cấu
hình `api`.
