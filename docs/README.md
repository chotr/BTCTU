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

## Trạng thái nguồn tài liệu

| Nguồn | Trạng thái phân tích | Ghi chú |
|---|---|---|
| 01-QĐ/BTCTU — Chức năng, nhiệm vụ và cơ cấu tổ chức | ✅ Đã phân tích | Nền tảng tổ chức + responsibility domain |
| 05-HD/TU | ⏳ Chưa có tài liệu | Dự kiến chốt Task, KPI, cách chấm điểm |
| 39-QĐ/TU | ⏳ Chưa có tài liệu | Dự kiến chốt quy trình đánh giá, xếp loại, phê duyệt |
| Văn bản an ninh / BVCTNB | ⏳ Chưa xác định | Cần cho thiết kế phân quyền, bảo mật |
| Văn bản CNTT / chuyển đổi số | ⏳ Chưa xác định | Cần cho kiến trúc triển khai |

## Ranh giới quan trọng nhất của bộ tài liệu

> QĐ01 cung cấp **Organization + Functions + Responsibilities + cơ cấu thành phần + 1 quy tắc phân công**.
> QĐ01 **chưa** cung cấp Task model, danh mục vị trí việc làm, công thức KPI, hay workflow đánh giá.

Mọi thiết kế trong repo tôn trọng ranh giới này: phần nào chưa có căn cứ thì để placeholder, không bịa nghiệp vụ.

