# Đề bài và ranh giới triển khai

## Mục tiêu

Xây dựng hồ sơ phân tích và thiết kế cho bài test quản lý nhiệm vụ/KPI của Ban Tổ chức Tỉnh ủy, đủ rõ để:

- truy vết từ nguồn → business rule → domain → feature;
- demo một vertical slice end-to-end;
- giải thích được quyết định và giới hạn trước nhà tuyển dụng.

## In scope

`organization → position/employee → assignment → result/product/evidence → KPI → self evaluation → review → classification → approval → lock → audit → dashboard`

## Nguyên tắc bằng chứng

- `[FACT]`: nguồn nói trực tiếp; phải ghi văn bản và điều/phụ lục/trang khi xác định được.
- `[INFERENCE]`: cách hiểu hoặc lựa chọn thiết kế phần mềm.
- `[TBD]`: chưa đủ căn cứ; không được biến thành rule.
- Excel là operational/master-data draft, không phải văn bản quy phạm nếu không có tài liệu xác lập giá trị pháp lý.
- Không code feature trong phase tài liệu này.

## Definition of done

1. Mỗi nguồn có trang phân tích và trạng thái kiểm chứng.
2. Các diagram chính render được bằng Mermaid trên GitHub.
3. Mỗi feature MVP có `source basis` hoặc được ghi rõ `candidate design choice`.
4. Mọi rule KPI/classification chưa có bản gốc 05-HD/TU và 39-QĐ/TU đều bị khóa ở trạng thái TBD.

