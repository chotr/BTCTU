# Sổ đăng ký known / unknown

## Đã biết từ các nguồn đã rà soát

| Khái niệm | Trạng thái | Căn cứ |
|---|---|---|
| Bốn đơn vị/chức năng/trách nhiệm | Đã biết | QĐ01 |
| Trưởng phòng/Chánh VP có trách nhiệm phân công việc gắn với vị trí cho thành viên | Đã biết | QĐ01 Điều 7.2 |
| Khái niệm danh mục công việc/sản phẩm | Đã biết | 05-HD Phụ lục 1 |
| Thành phần dữ liệu mã/tên nhiệm vụ cốt lõi | Đã biết | QĐ308 |
| Cấu trúc điểm 30 + 70 | Đã biết | 05-HD |
| KPI A/B/C/D cho lãnh đạo/quản lý | Đã biết | 05-HD Phụ lục 2 |
| Các bước tự đánh giá → thẩm định → quyết định cuối | Đã biết | 05-HD + QĐ39 |
| Bốn dải điểm xếp loại cơ bản | Đã biết | QĐ39 Điều 11 |
| Xếp loại cần điều kiện/yếu tố chặn ngoài điểm | Đã biết | QĐ39 |
| Phân quyền đa chiều + least privilege | Đã biết | QĐ342 Điều 16 |
| Audit mọi truy cập/cập nhật/phê duyệt/chia sẻ | Đã biết | QĐ342 |
| Từ điển canonical / SOR | Đã biết | QĐ308 |
| Contract OAuth 2.0 `client_credentials`/JWT cho API theo QĐ607 | Đã biết | QĐ607 |
| Tầng LGSP hỗ trợ OAuth 2.1/OIDC 2.0/SAML2/JWT Federation/mTLS | Đã biết | HD07 |
| Kết nối cần phê duyệt mục đích/phạm vi/bảo mật | Đã biết | QĐ348 + HD07 |
| Hệ thống kết nối hướng tới ATTT >= cấp 3 | Đã biết trong bối cảnh tích hợp | QĐ348/HD07 |
| Có tồn tại Excel danh mục công việc vận hành / phân công tổ chức | Đã biết | hai file XLSX được cung cấp |

## Mơ hồ / bất nhất nguồn

| ID | Vấn đề | Tác động |
|---|---|---|
| INC-01 | Ví dụ của 05-HD in `30 + 82,3%×70 = 80,3`, trong khi số học cho 87,61 | chặn kích hoạt quy tắc `OFFICIAL/ACTIVE`, không chặn triển khai engine KPI ứng viên |
| INC-02 | Công thức A/B/C/D rõ ràng của 05-HD hướng tới lãnh đạo/quản lý; đề bài bao quát mọi công chức | cần thiết kế/cấu hình công thức không-lãnh-đạo được phê duyệt |
| INC-03 | Danh mục Excel có điểm/công thức nhưng tài liệu được cung cấp tự nó không chứng minh phê duyệt/phiên bản hiệu lực | nhập dạng nháp/staging, không phải quy tắc chính thức |

## Phân kỳ nguồn

| ID | Nguồn | Phân kỳ | Cách xử lý |
|---|---|---|---|
| DIV-01 | QĐ607 vs HD07 | QĐ607 quy định OAuth 2.0 `client_credentials`; HD07 liệt kê OAuth 2.1/OIDC 2.0/SAML2/JWT Federation/mTLS ở tầng LGSP | Không gộp thành một quy tắc auth chung; production theo đúng contract endpoint/nền tảng được phê duyệt |

## Vẫn chưa biết / cần cấp có thẩm quyền

| ID | Câu hỏi | Chặn điều gì |
|---|---|---|
| Q-01 | Master JobPosition chính thức và phân công có hiệu lực? | master tổ chức/nhân sự có thẩm quyền |
| Q-02 | Phiên bản được phê duyệt của danh mục công việc / giá trị hệ số? | KPI chính thức |
| Q-03 | INC-01 được giải quyết thế nào? | kích hoạt quy tắc 70 điểm bị ảnh hưởng dưới `OFFICIAL/ACTIVE` |
| Q-04 | Công thức cho công chức không giữ chức vụ lãnh đạo? | KPI công chức |
| Q-05 | Cách tổng hợp tháng → quý → năm chính xác? | tự động hóa theo kỳ |
| Q-06 | Nhóm so sánh cho hạn mức Xuất sắc? | tự động hóa xếp loại cuối |
| Q-07 | Quy trình mở lại/khiếu nại/chỉnh sửa cục bộ sau quyết định? | thay đổi kết quả đã khóa |
| Q-08 | Phân loại dữ liệu sản xuất chính xác và phạm vi bí mật nhà nước? | cấp độ bảo mật/triển khai |
| Q-09 | Cấp độ HTTT được phê duyệt chính thức? | cổng production |
| Q-10 | Ứng dụng này có bắt buộc tích hợp LGSP/TCXDĐ thật không? | connector/triển khai |
| Q-11 | Tập API/dữ liệu con nào được phê duyệt? | tích hợp thật |
| Q-12 | Có được lưu file minh chứng, hay chỉ tham chiếu tới DMS được phê duyệt? | kiến trúc minh chứng |

## Quyết định thiết kế đã chốt

- Kiến trúc hiện tại: web + modular-monolith API.
- Chỉ dùng dữ liệu synthetic.
- Danh mục và quy tắc theo phiên bản/truy vết được về nguồn.
- Fake connector trước; tích hợp thật sau cổng phê duyệt/bảo mật.
- Đơn vị (Department) là một đối tượng đánh giá; không mặc định điểm đơn vị = trung bình điểm nhân viên.
