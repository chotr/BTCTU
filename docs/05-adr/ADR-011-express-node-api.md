# ADR-011 — REST API Express.js trên Node

**Trạng thái:** Accepted.

## Bối cảnh

ADR-010 chọn Hono trên Cloudflare Workers. Trong quá trình phát triển, đội dự án cần
một runtime Node thống nhất cho phát triển, CI và kiểm thử cục bộ, đồng thời không
khóa hạ tầng production vào một nền tảng cụ thể khi hạ tầng chưa được phê duyệt.

## Quyết định

API là một ứng dụng **Express.js chạy trên Node** (đơn vị triển khai `apps/api`):

- contract REST `/api/v1` mô tả bằng OpenAPI, request/response validate bằng Zod;
- `createApp(env)` tách phần dựng app (kiểm thử qua supertest, không cần mở cổng)
  khỏi entry `src/index.ts` (`listen`);
- cấu hình đọc từ biến môi trường qua `src/env.ts` (`PORT`, `ENVIRONMENT`, `CORS_ORIGIN`).

## Lý do

- Express phổ biến, ổn định, nhiều middleware/tài liệu.
- Cùng runtime Node với công cụ dev/test (Vitest, tsx) → vòng lặp phát triển đơn giản.
- Không khóa vào Cloudflare; hạ tầng production là quyết định riêng theo cổng phê duyệt.

## Phương án bị loại

- Hono trên Cloudflare Workers (ADR-010): đã bị thay thế.
- NestJS: nặng hơn nhu cầu hiện tại.
- Next.js Route Handlers: ghép lifecycle frontend/backend không cần thiết.

## Hệ quả

- ADR-010 bị thay thế.
- Một số lựa chọn hạ tầng Cloudflare (D1/R2/Queue/Access/Workers observability)
  không còn là mặc định; thay bằng DB quan hệ + kho tài liệu + job nền + IdP/access
  token được phê duyệt.
- Vẫn phải quản lý API versioning; OpenAPI vẫn là contract máy đọc được.
- Ranh giới module backend và policy phía server không đổi.
