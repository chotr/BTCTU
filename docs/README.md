# Tài liệu dự án BTCTU

Bộ tài liệu chuẩn cho hệ thống quản lý nhiệm vụ, KPI, đánh giá và xếp loại.

## Thứ tự đọc

| #   | Nhóm                    | Bắt đầu tại                                                                              | Nội dung                                                |
| --- | ----------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 00  | Tổng quan               | [00-overview.md](00-overview.md)                                                         | Phạm vi, trạng thái và vấn đề còn mở                    |
| 01  | Yêu cầu                 | [01-requirements/assignment.md](01-requirements/assignment.md)                           | Yêu cầu và tiêu chí bàn giao                            |
| 02  | Phân tích nguồn         | [02-source-analysis/README.md](02-source-analysis/README.md)                             | Căn cứ và giới hạn của từng nguồn                       |
| 02  | Đối soát audit          | [02-source-analysis/audit-reconciliation.md](02-source-analysis/audit-reconciliation.md) | Claim đã sửa và TBD còn lại                             |
| 03  | Nghiệp vụ               | [03-business/domain-map.md](03-business/domain-map.md)                                   | Tổ chức, nhiệm vụ, KPI và đánh giá                      |
| 03  | Truy vết                | [03-business/traceability-matrix.md](03-business/traceability-matrix.md)                 | Nguồn cho từng capability                               |
| 04  | Thiết kế hệ thống       | [04-system-design/context.md](04-system-design/context.md)                               | C4, domain, ERD, quyền, audit, tích hợp, bảo mật        |
| 04  | contract API đăng nhập  | [04-system-design/auth-api.md](04-system-design/auth-api.md)                             | Bốn endpoint auth, cookie, mã lỗi, cấu hình             |
| 04  | Gói contract dùng chung | [04-system-design/shared-package.md](04-system-design/shared-package.md)                 | Ranh giới shared giữa web và API, chênh lệch trạng thái |
| 05  | ADR                     | [05-adr/README.md](05-adr/README.md)                                                     | Quyết định kiến trúc                                    |
| 06  | Triển khai              | [06-plan/development-readiness.md](06-plan/development-readiness.md)                     | Cách chạy và điều kiện chuyển môi trường                |
| 07  | Nghiệm thu              | [07-acceptance/acceptance-runbook.md](07-acceptance/acceptance-runbook.md)               | Kịch bản kiểm tra xuyên suốt                            |
| 08  | Trình bày               | [08-presentation/implementation-story.md](08-presentation/implementation-story.md)       | Cấu trúc trình bày giải pháp                            |

## Nhãn căn cứ

- **FACT** — nguồn trực tiếp xác nhận nội dung.
- **INFERENCE** — diễn giải hoặc đề xuất thiết kế cần phê duyệt.
- **TBD** — cần làm rõ hoặc cần cấp có thẩm quyền quyết định.
- **SOURCE INCONSISTENCY** — nguồn có điểm không nhất quán hoặc nghi có lỗi.
- **SOURCE DIVERGENCE** — các nguồn khác tầng contract, version hoặc phạm vi.

Không nâng INFERENCE/TBD thành FACT.

## Kết quả chính từ nguồn

- **QĐ01:** tổ chức, trách nhiệm của phòng và trách nhiệm phân công.
- **05-HD/TU:** cấu trúc 30/70, danh mục công việc/sản phẩm, KPI A/B/C/D cho lãnh đạo và các bước đánh giá quý.
- **39-QĐ/TU:** ngưỡng điểm, điều kiện bắt buộc và thẩm quyền đánh giá.
- **QĐ342:** phân quyền theo ngữ cảnh, audit, bảo mật, kiến trúc chuẩn và giới hạn sử dụng AI.
- **QĐ308/607 + QĐ348/HD07:** dữ liệu chuẩn và cổng tích hợp.
- **NĐ85/63/165/278:** cấp độ HTTT, ranh giới bí mật nhà nước và quản trị dữ liệu.
- **Các file Excel:** dữ liệu khởi tạo vận hành hữu ích, không mặc nhiên là rule chính thức.

Ví dụ KPI trong 05-HD/TU có sai khác số học giữa biểu thức và kết quả in. Hệ thống ghi nhận đúng phạm vi, không âm thầm sửa nguồn. Xem [02-source-analysis/hd05.md](02-source-analysis/hd05.md) và [03-business/known-unknowns.md](03-business/known-unknowns.md).
