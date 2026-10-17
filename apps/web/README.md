# Giao diện BTCTU

Ứng dụng Next.js cho các màn hình quản lý nhiệm vụ, KPI và đánh giá.

## Nguồn dữ liệu

Các route chính luôn tải dữ liệu từ API. Không còn biến môi trường đổi toàn bộ
ứng dụng sang dữ liệu cục bộ.

Trong môi trường phát triển, `/demo/login` mở không gian mô phỏng và lưu thay đổi
trong `localStorage`. Namespace `/demo/*` độc lập với phiên API. Production mặc
định trả 404 cho namespace này; chỉ bật tạm thời bằng `ENABLE_MOCK_ROUTES=true`.

Ở chế độ API, các thao tác tạo nhiệm vụ, lưu/nộp kết quả, nghiệm thu, trả lại,
tự đánh giá, thẩm định, quyết định và khóa kỳ gọi endpoint tương ứng. Những thao
tác chưa có endpoint sẽ báo chưa hỗ trợ và không sửa dữ liệu trên trình duyệt.

API nghiệp vụ hiện giữ dữ liệu trong RAM của tiến trình. Dữ liệu được chia sẻ
giữa các request của cùng instance nhưng mất khi khởi động lại và không đồng bộ
giữa nhiều instance.

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

| Biến                       | Giá trị mặc định        | Ghi chú                                      |
| -------------------------- | ----------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8787` | Địa chỉ API                                  |
| `NEXT_PUBLIC_APP_ENV`      | `development`           | `development`, `staging` hoặc `production`   |
| `ENABLE_MOCK_ROUTES`       | tắt ở production        | Cho phép `/demo/*`; không chứa dữ liệu bí mật |

Không đặt mật khẩu hoặc khóa bí mật trong biến `NEXT_PUBLIC_*`, vì các giá trị
này được đưa xuống trình duyệt.

## Phần còn thiếu trước khi vận hành

- bổ sung endpoint cho mọi thao tác trên màn hình;
- gắn tài khoản đăng nhập với hồ sơ nhân sự để route API cấp đúng phạm vi;
- tải lại trang không làm mất thay đổi đã lưu;
- các lỗi API hiển thị được mã yêu cầu để đối chiếu nhật ký;
- kiểm thử trình duyệt chạy với API và cơ sở dữ liệu thật.
