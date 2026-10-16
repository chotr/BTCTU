# Giao diện BTCTU

Ứng dụng Next.js cho các màn hình quản lý nhiệm vụ, KPI và đánh giá.

## Nguồn dữ liệu

- `NEXT_PUBLIC_DATA_SOURCE=local`: dùng dữ liệu mẫu và lưu thay đổi trong
  `localStorage`.
- `NEXT_PUBLIC_DATA_SOURCE=api`: tải tổ chức, danh mục, nhiệm vụ, đánh giá, kỳ và
  nhật ký từ API.

Ở chế độ API, các thao tác tạo nhiệm vụ, lưu/nộp kết quả, nghiệm thu, trả lại,
tự đánh giá, thẩm định, quyết định và khóa kỳ gọi endpoint tương ứng. Những thao
tác chưa có endpoint sẽ báo chưa hỗ trợ và không sửa dữ liệu trên trình duyệt.

API nghiệp vụ hiện vẫn tạo lại dữ liệu theo từng request. Vì vậy response của
thao tác được cập nhật ngay lên màn hình, nhưng tải lại trang sẽ trở về dữ liệu
khởi tạo của API.

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

| Biến                       | Giá trị mặc định        | Ghi chú                                    |
| -------------------------- | ----------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_DATA_SOURCE`  | `local`                 | Chọn `api` để dùng API                     |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8787` | Địa chỉ API                                |
| `NEXT_PUBLIC_APP_ENV`      | `development`           | `development`, `staging` hoặc `production` |

Không đặt mật khẩu hoặc khóa bí mật trong biến `NEXT_PUBLIC_*`, vì các giá trị
này được đưa xuống trình duyệt.

## Phần còn thiếu trước khi vận hành

- bổ sung endpoint cho mọi thao tác trên màn hình;
- đăng nhập dùng phiên do API cấp, không dùng bộ chọn tài khoản mẫu;
- tải lại trang không làm mất thay đổi đã lưu;
- các lỗi API hiển thị được mã yêu cầu để đối chiếu nhật ký;
- kiểm thử trình duyệt chạy với API và cơ sở dữ liệu thật.
