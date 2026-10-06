# 04 — Hồ sơ quyết định kiến trúc (ADR)

Mỗi quyết định kiến trúc quan trọng được ghi thành một ADR ngắn: bối cảnh, quyết định, hệ quả. Trạng thái theo chuẩn thông dụng:

| Trạng thái | Ý nghĩa |
|---|---|
| Proposed | Đang đề xuất, chưa áp dụng |
| Accepted | Đã chấp nhận, đang áp dụng |
| Rejected | Đã bác bỏ |
| Superseded | Bị ADR khác thay thế |

## Danh mục

| Số | Tiêu đề | Trạng thái |
|---|---|---|
| [ADR-0001](ADR-0001-docs-as-code-va-quy-uoc-danh-dau.md) | Docs-as-code trên GitHub, Markdown + Mermaid | Accepted |
| [ADR-0002](ADR-0002-fact-inference-tbd.md) | Quy ước Fact / Inference / TBD cho mọi tài liệu phân tích | Accepted |
| [ADR-0003](ADR-0003-gioi-han-domain-theo-QD01.md) | Giới hạn domain model theo QĐ01; không mô hình Task/KPI trước khi có 05-HD/TU, 39-QĐ/TU | Accepted |
| [ADR-0004](ADR-0004-hinh-thuc-san-pham-web-hay-desktop.md) | Hình thức sản phẩm: web app hay desktop app | Proposed |

## Cách tạo ADR mới

1. Copy [ADR-template.md](ADR-template.md), đặt tên `ADR-NNNN-ten-ngan-gon.md`.
2. Điền đầy đủ 6 mục, chọn trạng thái.
3. Thêm một dòng vào bảng Danh mục ở trên.

