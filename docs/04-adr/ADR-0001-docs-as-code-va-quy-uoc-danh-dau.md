# ADR-0001 — Docs-as-code trên GitHub (Markdown + Mermaid)

- **Trạng thái**: Accepted
- **Ngày**: 2026-10-06
- **Người đề xuất**: nhóm dự án

## Bối cảnh

Cần một nơi chứa hồ sơ phân tích nghiệp vụ và thiết kế kiến trúc, phục vụ làm việc nhóm và bảo vệ trước nhà tuyển dụng. Các lựa chọn: Notion/GitBook, FigJam/Miro, Draw.io, dbdiagram.io, hay giữ tài liệu ngay trong repo.

## Quyết định

Đặt toàn bộ tài liệu trong repo dưới `docs/`, dùng Markdown; sơ đồ dùng Mermaid nhúng trong Markdown (GitHub render trực tiếp). Branch riêng `docs/architecture` để phát triển tài liệu.

## Các phương án đã cân nhắc

| Phương án | Ưu | Nhược | Kết quả |
|---|---|---|---|
| Notion | Đẹp, chia sẻ dễ | Không version-control chặt, khó duy trì cạnh code | Chưa chọn; có thể dùng sau cho phần trình bày |
| FigJam/Miro/Draw.io | Sơ đồ trực quan | File rời, mất traceability với văn bản | Không dùng cho tài liệu nền |
| Docs trong repo | Version control, traceability, reviewer đọc ngay trên GitHub | Kém "đẹp" hơn Notion | **Chọn** |

## Hệ quả

- Mọi thay đổi tài liệu đi qua git (review được, khôi phục được).
- Sơ đồ là mã (Mermaid) nên sửa nhanh, không phụ thuộc tool.
- Nếu cần trình bày đẹp sau này, có thể xuất sang Notion/Slide từ chính các file này.

## Mối liên hệ

- ADR-0002 (quy ước đánh dấu)

