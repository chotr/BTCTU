# Tài liệu dự án BTCTU

Đây là cây tài liệu chuẩn của dự án bài kiểm tra năng lực.

## Thứ tự đọc đề xuất

| # | Nhóm | Bắt đầu tại | Nội dung trả lời |
|---|---|---|---|
| 00 | Tổng quan | [00-overview.md](00-overview.md) | Dự án là gì và còn điểm nào chưa được giải quyết? |
| 01 | Yêu cầu | [01-requirements/assignment.md](01-requirements/assignment.md) | Bài kiểm tra cần bàn giao những gì? |
| 02 | Phân tích nguồn | [02-source-analysis/README.md](02-source-analysis/README.md) | Từng nguồn thực sự quy định điều gì? |
| 02 | Đối soát audit | [02-source-analysis/audit-reconciliation.md](02-source-analysis/audit-reconciliation.md) | Claim stale nào đã sửa và còn TBD nào? |
| 03 | Nghiệp vụ | [03-business/domain-map.md](03-business/domain-map.md) | Tổ chức, nhiệm vụ, KPI và đánh giá liên hệ thế nào? |
| 03 | Truy vết | [03-business/traceability-matrix.md](03-business/traceability-matrix.md) | Nguồn nào làm căn cứ cho từng capability thiết kế? |
| 04 | Thiết kế hệ thống | [04-system-design/context.md](04-system-design/context.md) | C4, domain, ERD, phân quyền, audit, tích hợp và bảo mật |
| 05 | ADR | [05-adr/README.md](05-adr/README.md) | Vì sao các quyết định kiến trúc chính được lựa chọn? |
| 06 | Kế hoạch | [06-plan/implementation-plan.md](06-plan/implementation-plan.md) | Cần triển khai gì, bằng stack nào và theo thứ tự nào? |
| 07 | Demo | [07-demo/demo-plan.md](07-demo/demo-plan.md) | Trình diễn vertical slice như thế nào? |
| 08 | Bảo vệ | [08-presentation/defense-story.md](08-presentation/defense-story.md) | Trình bày dự án với hội đồng/người phỏng vấn như thế nào? |

## Nhãn căn cứ

- **FACT** — nguồn trực tiếp xác nhận nội dung.
- **INFERENCE** — diễn giải/đề xuất thiết kế phần mềm hoặc domain.
- **TBD** — cần làm rõ hoặc cần cấp có thẩm quyền quyết định.
- **SOURCE INCONSISTENCY** — nguồn có điểm không nhất quán hoặc nghi có lỗi.
- **SOURCE DIVERGENCE** — các nguồn mô tả khác tầng contract, version hoặc
  phạm vi; không được mặc định là tương đương/thay thế lẫn nhau.

Không nâng INFERENCE/TBD thành FACT.

## Kết quả chính từ nguồn

- **QĐ01:** tổ chức, trách nhiệm của phòng và trách nhiệm phân công.
- **05-HD/TU:** cấu trúc 30/70, danh mục công việc/sản phẩm, KPI A/B/C/D cho lãnh đạo và các bước đánh giá quý.
- **39-QĐ/TU:** ngưỡng điểm, điều kiện bắt buộc và thẩm quyền đánh giá.
- **QĐ342:** phân quyền theo ngữ cảnh, audit, bảo mật, kiến trúc chuẩn và giới hạn sử dụng AI.
- **QĐ308/607 + QĐ348/HD07:** dữ liệu chuẩn cùng contract/gate tích hợp thật.
- **NĐ85/63/165/278:** cấp độ HTTT, ranh giới bí mật nhà nước và quản trị dữ liệu.
- **Các file Excel:** dữ liệu seed/draft vận hành hữu ích, không mặc nhiên là rule chính thức.

## Vấn đề nguồn quan trọng nhất

Ví dụ KPI trong 05-HD/TU có sai khác số học giữa biểu thức và kết quả in.
Đây là **worked-example arithmetic inconsistency**, chưa chứng minh công thức
chính thức sai. Repo ghi nhận đúng phạm vi và **không âm thầm hard-code cách
sửa**.

Xem [02-source-analysis/hd05.md](02-source-analysis/hd05.md) và [03-business/known-unknowns.md](03-business/known-unknowns.md).

Chi tiết kế hoạch code:

- [Stack kỹ thuật](06-plan/technical-stack.md)
- [Kế hoạch milestone và ticket](06-plan/code-plan.md)

## Xử lý file nguồn

Các PDF/XLSX gốc không được commit mặc định vì quyền công bố có thể chưa rõ.
Xem [sources/README.md](sources/README.md).
