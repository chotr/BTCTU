# SRC-13..15 — NQ11 và hai Excel operational

## NQ 11-NQ/TU

`[TBD]` Số hiệu không đủ định danh nếu thiếu tỉnh, ngày và trích yếu. Chỉ đưa vào traceability nếu nội dung liên quan trực tiếp mục tiêu/chỉ tiêu/chuyển đổi số/đánh giá của dự án.

## Excel cây phân công nhiệm vụ

`[TBD]` Chưa có file. Khi nhận file, coi là operational/master-data draft:

- phân tích sheet/header/formula/merged cells/data validation;
- phát hiện node, parent, đơn vị, vị trí/người, hiệu lực, nguồn;
- không suy ra quyền pháp lý từ một ô “người phụ trách”;
- đối chiếu với QĐ01 và văn bản phân công có thẩm quyền.

## Excel danh mục công việc

`[TBD]` Chưa có file. Candidate mapping: `WorkCatalogItem`, `Responsibility`, `ExpectedProduct`, `Frequency`, `OwnerUnit`, `SourceRef`, `EffectiveFrom/To`, `Status`.

## Quy tắc import

1. Lưu file gốc bất biến + checksum.
2. Import staging, báo lỗi và duplicate; không ghi thẳng master.
3. Data steward xác nhận mapping và hiệu lực.
4. Publish version; assignment cũ giữ reference version.
5. Mọi cột không có định nghĩa được ghi UNKNOWN, không tự đặt nghĩa.

