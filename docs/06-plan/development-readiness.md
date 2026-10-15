# Tình trạng phát triển

Tài liệu này ghi lại những gì đang chạy được và các bước còn thiếu để có một môi
trường tích hợp. Nó không phải biên bản nghiệm thu.

## Có thể chạy hiện nay

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Kiểm tra trước khi ghép thay đổi:

```powershell
pnpm check
pnpm --filter @btctu/web test:e2e
```

Giao diện phải giữ `NEXT_PUBLIC_DATA_SOURCE=local`. Giá trị `api` hiện chỉ là chốt
an toàn: ứng dụng sẽ báo lỗi vì phần kết nối chưa hoàn thành.

## Khoảng cách giữa giao diện và API

| Nhóm chức năng | Giao diện hiện dùng | Tuyến API đã định nghĩa | Việc còn làm |
| --- | --- | --- | --- |
| Người dùng | `mock/users.ts` | `GET /api/v1/me` | Dùng phiên đăng nhập API và ánh xạ người dùng |
| Tổ chức | `mock/organization.ts` | `GET /api/v1/organizations` | Đọc dữ liệu thật và bổ sung thao tác ghi |
| Danh mục | `mock/catalog.ts` | `GET /api/v1/catalog` | Nối đọc/ghi và quản lý phiên bản |
| Nhiệm vụ | `mock/tasks.ts` | `/api/v1/tasks` | Nối toàn bộ thao tác, xử lý xung đột |
| Kỳ và đánh giá | `mock/periods.ts`, `mock/evaluations.ts` | `/api/v1/periods`, `/api/v1/evaluations` | Lưu bền vững và nối quy trình |
| Nhật ký và báo cáo | `mock/audit.ts`, phép tổng hợp cục bộ | `/api/v1/audit`, `/api/v1/reports/summary` | Đọc từ API, phân trang và xuất dữ liệu |

## Thứ tự thực hiện

1. Hoàn thiện kho dữ liệu PostgreSQL cho tổ chức, nhiệm vụ, kỳ và đánh giá.
2. Gắn tài khoản đăng nhập với nhân sự, vai trò và phạm vi đơn vị.
3. Viết lớp gọi API cho giao diện, bắt đầu từ phiên đăng nhập và dữ liệu chỉ đọc.
4. Chuyển từng thao tác ghi khỏi `localStorage`; không tự động quay về dữ liệu mẫu
   khi API lỗi.
5. Bổ sung bộ dữ liệu kiểm thử riêng và chạy kiểm thử xuyên suốt.
6. Chỉ sau đó mới cho phép đóng gói môi trường kiểm thử với
   `NEXT_PUBLIC_DATA_SOURCE=api`.

## Tiêu chí hoàn thành kết nối API

- mọi thao tác nghiệp vụ trên giao diện đi qua API;
- tải lại trang vẫn giữ dữ liệu đã lưu;
- phản hồi API được kiểm tra cấu trúc trước khi sử dụng;
- giao diện không còn cho chọn tài khoản mẫu;
- kiểm thử quyền ở API bao phủ trường hợp được phép và bị từ chối;
- kiểm thử trình duyệt chạy với PostgreSQL được khởi tạo riêng;
- bản đóng gói ngoài môi trường phát triển không thể dùng dữ liệu cục bộ.

Các yêu cầu về định danh, sao lưu, giám sát và an toàn thông tin được theo dõi tại
[deployment.md](../04-system-design/deployment.md).
