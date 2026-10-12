# Ma trận truy vết — nguồn → quy tắc → thiết kế → triển khai

Bảng này là bằng chứng nhanh nhất cho người rà soát/kiểm toán rằng hệ thống không
dựa trên quy tắc bịa đặt.

| Nguồn | Dữ kiện nguồn | Tác động nghiệp vụ | Thiết kế/triển khai |
|---|---|---|---|
| QĐ01 Điều 2–7 | 4 đơn vị; chức năng/trách nhiệm; trưởng phòng giao việc gắn với vị trí | bối cảnh tổ chức + phân công | Organization, Department, Membership, Responsibility, Assignment |
| 05-HD mục IV | 30 điểm chung + 70 kết quả công việc | đánh giá hai thành phần | GeneralCriteriaSnapshot + WorkPerformanceSnapshot |
| 05-HD PL1 | danh mục công việc/sản phẩm chuẩn, điểm/hệ số/độ phức tạp/thời gian | danh mục trước khi có thực thể nhiệm vụ | WorkCatalogVersion / WorkCatalogItem |
| 05-HD PL2 | KPI A/B/C/D cho lãnh đạo | các trục hiệu suất đo lường được | MetricSnapshot + CalculationRun |
| 05-HD PL2 | sai khác số học trong ví dụ | không thể hard-code mù quáng | SourceIssue INC-01 + kiểm thử đơn vị + cổng phê duyệt |
| QĐ39 Điều 11 | ngưỡng + điều kiện bổ sung | điểm ≠ xếp loại cuối | EligibilityCheck / ClassificationRuleVersion |
| QĐ39 Điều 12 | tự đánh giá → thẩm định → quyết định có thẩm quyền | quy trình theo bước | Luồng đánh giá |
| QĐ342 Điều 16 | vai trò/nhiệm vụ/phạm vi/phân loại/thời gian; least privilege; audit | uỷ quyền theo ngữ cảnh | PolicyDecision + AuditEvent |
| QĐ342 Điều 23 | AI chỉ hỗ trợ, con người quyết định, không dùng AI công khai chưa phê duyệt cho dữ liệu được bảo vệ | ranh giới soạn thảo báo cáo | tính năng AI tùy chọn, phê duyệt bởi con người |
| QĐ308 | từ điển dữ liệu canonical + MaNhiemVu/TenNhiemVu + SOR | ánh xạ canonical | DataDictionaryMapping |
| QĐ607 | API theo scope OAuth 2.0 `client_credentials`/JWT | contract connector cụ thể | Adapter tích hợp |
| HD07 + QĐ607 | Cách diễn đạt phiên bản/profile xác thực khác nhau giữa tầng LGSP và API cụ thể | không coi các cơ chế là thay thế lẫn nhau | Profile auth theo endpoint được phê duyệt + SourceDivergence DIV-01 |
| QĐ348/HD07 | mục đích/phạm vi được phê duyệt, test→prod, >= cấp 3 cho hệ thống kết nối | cổng tích hợp/bảo mật | connector bị chặn cho tới khi phê duyệt |
| NĐ85 | tiêu chí cấp độ HTTT chính thức | không thể tự chứng nhận cấp độ | cổng tuân thủ production |
| NĐ63 | xử lý tài liệu bí mật nhà nước điện tử nghiêm ngặt | nội dung bí mật nằm ngoài hệ thống | ranh giới tham chiếu minh chứng |
| NĐ165 | lịch sử truy cập, mã hóa, vòng đời | quản trị dữ liệu | audit/mã hóa/lưu giữ |
| NĐ278 | quản trị chia sẻ dữ liệu | tích hợp vừa tổ chức vừa kỹ thuật | quản trị connector |
| Excel danh mục công việc | mã/sản phẩm/điểm/công thức nháp thực tế | ứng viên seed/danh mục thực tế | nhập staging + phê duyệt bởi người phụ trách |
| Excel cây phân công | bối cảnh tổ chức/phân công nháp thực tế | seed phát triển thực tế | staging/ánh xạ được phê duyệt |
| NQ11 | mục tiêu chuyển đổi số chiến lược | bối cảnh dự án/OKR | trình bày chiến lược / dashboard chiến lược tương lai |

## Quy tắc

Một tính năng chỉ được đánh dấu **source-derived** khi có một hàng như trên trỏ tới
đúng mục/trang nguồn thực. Nếu không, đánh dấu `[INFERENCE]` hoặc `[TBD]`.
