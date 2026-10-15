# BTCTU — Quản lý nhiệm vụ và đánh giá

Đây là mã nguồn đang phát triển cho ứng dụng nội bộ của Ban Tổ chức Tỉnh ủy.
Ứng dụng hướng tới việc theo dõi nhiệm vụ, kết quả thực hiện, KPI và hồ sơ đánh
giá trên cùng một quy trình.

## Hiện trạng

Repo hiện là **bản thử nghiệm phục vụ phát triển**, chưa phải bản triển khai chính
thức.

| Phần việc | Đã có | Chưa hoàn tất |
| --- | --- | --- |
| Giao diện | Các màn hình và luồng nghiệp vụ chính | Chưa đọc/ghi dữ liệu qua API |
| API | Express, OpenAPI, kiểm tra dữ liệu đầu vào, đăng nhập và phân quyền | Nhiều tuyến nghiệp vụ vẫn dùng dữ liệu tạo lại theo từng yêu cầu |
| Cơ sở dữ liệu | Lược đồ tổ chức, người dùng, phiên đăng nhập và nhật ký | Chưa thay toàn bộ dữ liệu tạm bằng kho dữ liệu thật |
| Kiểm thử | Kiểm thử đơn vị, kiểm thử API và một số kịch bản trình duyệt | Chưa có kiểm thử xuyên suốt với web, API và PostgreSQL thật |
| Vận hành | Có mẫu cấu hình cho môi trường phát triển | Chưa hoàn tất tích hợp định danh, sao lưu, giám sát và thẩm định an toàn thông tin |

Giao diện hiện dùng dữ liệu mẫu trong `apps/web/src/lib/mock/` và lưu trạng thái
trên trình duyệt. Chọn `NEXT_PUBLIC_DATA_SOURCE=api` sẽ chủ động dừng khởi tạo vì
phần kết nối giao diện với API chưa được viết xong.

## Chạy trên máy phát triển

Yêu cầu Node.js 22, pnpm 10 và PostgreSQL nếu chạy phần đăng nhập có lưu dữ liệu.

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

- Giao diện: `http://localhost:3000`
- API: `http://localhost:8787`
- Mô tả OpenAPI: `http://localhost:8787/openapi.json`

Có thể chạy riêng từng ứng dụng:

```powershell
pnpm dev:web
pnpm dev:api
```

Xem [hướng dẫn giao diện](apps/web/README.md) và
[hướng dẫn API](apps/api/README.md) để biết cấu hình chi tiết.

## Kiểm tra thay đổi

```powershell
pnpm check
pnpm --filter @btctu/web test:e2e
```

`pnpm check` chạy kiểm tra kiểu dữ liệu, kiểm thử tự động và đóng gói giao diện.
Kiểm thử trình duyệt được chạy riêng vì cần Playwright và môi trường trình duyệt.

## Cấu trúc repo

- `apps/web` — giao diện Next.js và dữ liệu mẫu dùng khi phát triển;
- `apps/api` — API Express, xác thực, phân quyền và các lược đồ PostgreSQL;
- `packages/shared` — kiểu dữ liệu và hằng số dùng chung;
- `docs` — ghi chép yêu cầu, căn cứ nghiệp vụ, quyết định kỹ thuật và việc còn mở.

Tài liệu trong `docs` là hồ sơ làm việc của nhóm. Nội dung có nhãn `INFERENCE`
hoặc `TBD` chưa phải quy định nghiệp vụ đã được phê duyệt.

## Việc ưu tiên tiếp theo

1. Nối giao diện với các tuyến API hiện có.
2. Chuyển nhiệm vụ, đánh giá, danh mục và tổ chức từ dữ liệu tạm sang PostgreSQL.
3. Gắn tài khoản đăng nhập với hồ sơ nhân sự và phạm vi đơn vị.
4. Chạy kiểm thử xuyên suốt trên một môi trường tích hợp.
5. Chốt các công thức và trường dữ liệu còn thiếu căn cứ trước khi dùng dữ liệu thật.
