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

Các route chính luôn dùng API. Không gian mô phỏng nằm dưới `/demo/*`, chỉ phục
vụ phát triển và không tự động thay thế khi API lỗi.

## Khoảng cách giữa giao diện và API

| Nhóm chức năng | Route chính hiện dùng | Tuyến API đã định nghĩa | Việc còn làm |
| --- | --- | --- | --- |
| Người dùng | Phiên cookie API | `GET /api/v1/me` | Ánh xạ tài khoản với hồ sơ nhân sự |
| Tổ chức | API adapter | `GET /api/v1/organizations` | Bổ sung thao tác ghi và persistence |
| Danh mục | API adapter | `GET /api/v1/catalog` | Nối quản lý phiên bản |
| Nhiệm vụ | API adapter | `/api/v1/tasks` | Bổ sung các thao tác còn thiếu |
| Kỳ và đánh giá | API adapter | `/api/v1/periods`, `/api/v1/evaluations` | Lưu bền vững và nối đủ quy trình |
| Nhật ký và báo cáo | API adapter | `/api/v1/audit`, `/api/v1/reports/summary` | Phân trang và xuất dữ liệu từ server |

## Thứ tự thực hiện

1. Hoàn thiện kho dữ liệu PostgreSQL cho tổ chức, nhiệm vụ, kỳ và đánh giá.
2. Gắn tài khoản đăng nhập với nhân sự, vai trò và phạm vi đơn vị.
3. Hoàn thiện DTO và runtime validation cho các response còn lại.
4. Bổ sung endpoint còn thiếu; route chính không tự động quay về dữ liệu mẫu khi
   API lỗi.
5. Bổ sung bộ dữ liệu kiểm thử riêng và chạy kiểm thử xuyên suốt.
6. Tắt `/demo/*` trong mọi bản đóng gói vận hành.

## Tiêu chí hoàn thành kết nối API

- mọi thao tác nghiệp vụ trên giao diện đi qua API;
- tải lại trang vẫn giữ dữ liệu đã lưu;
- phản hồi API được kiểm tra cấu trúc trước khi sử dụng;
- route chính không cho chọn tài khoản mẫu;
- kiểm thử quyền ở API bao phủ trường hợp được phép và bị từ chối;
- kiểm thử trình duyệt chạy với PostgreSQL được khởi tạo riêng;
- bản đóng gói ngoài môi trường phát triển không thể dùng dữ liệu cục bộ.

Các yêu cầu về định danh, sao lưu, giám sát và an toàn thông tin được theo dõi tại
[deployment.md](../04-system-design/deployment.md).
