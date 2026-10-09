# Tài liệu dự án — Bản đồ điều hướng

Trang này là cổng vào toàn bộ hồ sơ phân tích và thiết kế của dự án. Mục tiêu kép:

1. **Làm việc nhóm**: mọi người tìm đúng tài liệu, hiểu trạng thái fact / inference / TBD của từng mục.
2. **Bảo vệ trước nhà tuyển dụng**: thể hiện chuỗi suy luận `văn bản → phân tích → business rule → domain → architecture → dữ liệu → code → demo` chứ không phải "đọc requirement rồi code CRUD".

## Thứ tự đọc

| # | Tài liệu | Câu hỏi nó trả lời |
|---|---|---|
| 00 | [00-overview.md](00-overview.md) | Dự án này là gì, đang ở đâu, giới hạn ở đâu? |
| 01 | [01-source-analysis/](01-source-analysis/README.md) | Văn bản nào đã phân tích, rút ra được gì? |
| 02 | [02-business-domain/](02-business-domain/organization-model.md) | Miền nghiệp vụ: tổ chức, năng lực, thuật ngữ? |
| 03 | [03-architecture/](03-architecture/architecture-overview.md) | Hệ thống được đề xuất kiến trúc thế nào? |
| 04 | [04-adr/](04-adr/README.md) | Những quyết định kiến trúc nào, vì sao? |
| 05 | [05-assumptions-and-unknowns.md](05-assumptions-and-unknowns.md) | Đang giả định gì, còn hỏi gì, chờ tài liệu nào? |
| 06 | [06-implementation-plan.md](06-implementation-plan.md) | Làm gì trước, làm gì sau, phụ thuộc gì? |
| 07 | [07-demo-and-presentation.md](07-demo-and-presentation.md) | Trình bày và demo dự án thế nào khi bảo vệ? |

## Quy ước đánh dấu (áp dụng toàn bộ repo)

Mọi phát biểu phân tích đều mang đúng một trong ba nhãn:

| Nhãn | Ý nghĩa | Ví dụ |
|---|---|---|
| `[FACT]` | Được văn bản nguồn (QĐ01…) xác nhận | "Ban có 4 phòng" |
| `[INFERENCE]` | Suy luận/thiết kế của nhóm từ fact, chưa có trong văn bản | "Cần module Assignment" |
| `[TBD]` | Chưa thể xác định, cần tài liệu hoặc quyết định sau | "Công thức KPI?" |

Quy tắc cứng:

- Không bao giờ ghi một suy luận dưới nhãn `[FACT]`.
- Khi văn bản "nhắc tới" nhưng không "định nghĩa" một khái niệm, ghi rõ điều đó (ví dụ: *vị trí việc làm*).
- Mọi dòng dữ liệu rút từ văn bản phải chỉ về nguồn (số hiệu văn bản; số điều khoản khi đã đối chiếu).

## Bộ hồ sơ hiện hành

| Nhóm | Nội dung |
|---|---|
| [01-requirements](01-requirements/assignment.md) | Đề bài, phạm vi và tiêu chí hoàn thành |
| [02-source-analysis](02-source-analysis/README.md) | Ma trận nguồn, phân tích từng văn bản theo FACT / INFERENCE / TBD |
| [03-business](03-business/domain-map.md) | Domain, traceability, task/product/KPI, workflow và known unknowns |
| [04-system-design](04-system-design/context.md) | C4, domain model, ERD, permissions, audit, integration và security |
| [05-adr](05-adr/README.md) | Các quyết định kiến trúc mới |
| [06-plan](06-plan/implementation-plan.md) | Kế hoạch vertical slice có dependency và source trace |
| [07-demo](07-demo/demo-plan.md) | Kịch bản demo end-to-end |
| [08-presentation](08-presentation/defense-story.md) | Câu chuyện bảo vệ dự án |

Các file cũ trong `01-source-analysis` đến `07-demo-and-presentation.md` được giữ làm lịch sử phân tích QĐ01; bộ đánh số ở trên là cấu trúc chính từ lần cập nhật này.

## Ranh giới quan trọng nhất của bộ tài liệu

> QĐ01 cung cấp **Organization + Functions + Responsibilities + cơ cấu thành phần + 1 quy tắc phân công**.
> QĐ01 **chưa** cung cấp Task model, danh mục vị trí việc làm, công thức KPI, hay workflow đánh giá.

Mọi thiết kế trong repo tôn trọng ranh giới này: phần nào chưa có căn cứ thì để placeholder, không bịa nghiệp vụ.
