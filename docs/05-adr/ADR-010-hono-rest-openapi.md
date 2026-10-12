# ADR-010 — Hono REST API trên Cloudflare Workers

**Trạng thái:** Superseded bởi [ADR-011](ADR-011-express-node-api.md).

> ADR này đã bị thay thế: API chuyển từ Hono trên Cloudflare Workers sang Express.js trên Node (xem ADR-011). Nội dung dưới đây được giữ làm vết lịch sử.

## Quyết định

Tách API thành Hono Worker, contract REST `/api/v1` mô tả bằng OpenAPI; request/response được validate bằng Zod. Next.js dùng generated client.

## Lý do

- Hono phù hợp Workers và ít runtime overhead.
- API độc lập giúp mobile/integration/client khác dùng lại.
- OpenAPI dễ review, mock, contract-test và trình bày hơn contract TypeScript-only.

## Phương án bị loại

- Next.js Route Handlers: ghép lifecycle frontend/backend không cần thiết.
- tRPC: type-safe tốt nhưng kém trung lập cho integration ngoài TypeScript.
- NestJS/Express: không tối ưu cho Workers và nhu cầu hiện tại.
- GraphQL: không có nhu cầu đủ mạnh.

## Hệ quả

Phải quản lý API versioning và generated client; đổi lại boundary rõ và có tài liệu máy đọc được.

