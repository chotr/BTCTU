# ADR-010 — Hono REST API trên Cloudflare Workers

**Status:** Accepted for prototype.

## Decision

Tách API thành Hono Worker, contract REST `/api/v1` mô tả bằng OpenAPI; request/response được validate bằng Zod. Next.js dùng generated client.

## Rationale

- Hono phù hợp Workers và ít runtime overhead.
- API độc lập giúp mobile/integration/client khác dùng lại.
- OpenAPI dễ review, mock, contract-test và trình bày hơn contract TypeScript-only.

## Rejected

- Next.js Route Handlers: ghép lifecycle frontend/backend không cần thiết.
- tRPC: type-safe tốt nhưng kém trung lập cho integration ngoài TypeScript.
- NestJS/Express: không tối ưu cho Workers/MVP này.
- GraphQL: không có nhu cầu đủ mạnh.

## Consequence

Phải quản lý API versioning và generated client; đổi lại boundary rõ và có tài liệu máy đọc được.

