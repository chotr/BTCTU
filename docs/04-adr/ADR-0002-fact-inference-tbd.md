# ADR-0002 — Quy ước Fact / Inference / TBD

- **Trạng thái**: Accepted
- **Ngày**: 2026-10-06

## Bối cảnh

Phân tích văn bản nghiệp vụ dễ rơi vào việc trộn lẫn "văn bản nói gì" với "ta suy ra gì". Khi bảo vệ dự án, một suy luận được trình bày như sự thật là điểm trừ lớn.

## Quyết định

Mọi phát biểu phân tích phải mang một trong ba nhãn:

- `[FACT]`: được văn bản nguồn xác nhận.
- `[INFERENCE]`: suy luận/thiết kế của nhóm từ fact.
- `[TBD]`: chưa xác định, cần tài liệu/quyết định sau.

Kèm quy tắc: không ghi suy luận dưới nhãn FACT; phân biệt "văn bản nhắc tới" với "văn bản định nghĩa"; mọi fact phải chỉ về nguồn.

## Hệ quả

- Bộ tài liệu tự chứng minh tính kỷ luật phân tích.
- Khi có tài liệu mới, chỉ cần chuyển nhãn TBD → FACT cho đúng mục.
- Chi phí: người viết phải kỷ luật; nội dung có phần "khô" hơn.

## Mối liên hệ

- ADR-0001, ADR-0003

