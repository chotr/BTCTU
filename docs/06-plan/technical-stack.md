# Stack kỹ thuật

## Quyết định hiện tại

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| Web | Next.js 16, React 19, TypeScript strict | App Router, dashboard thiên về client |
| UI | Tailwind CSS 4, component nội bộ | design token và khả năng truy cập |
| API | Express.js trên Node | REST `/api/v1`, Zod validation |
| Contract | OpenAPI 3.1 | client tương lai sinh từ contract |
| Database đích | PostgreSQL hoặc DB quan hệ được phê duyệt | chọn theo cổng hạ tầng |
| Tệp | DMS/kho lưu trữ tệp được phê duyệt | metadata tách khỏi nội dung |
| Async | job nền / worker | nhập liệu, báo cáo, thông báo, retry |
| AuthN | IdP + access token (JWT) | API xác minh token |
| AuthZ | RBAC + organization/data scope + context | server là nguồn quyết định |
| Quan sát | structured log + trace | request/correlation ID |
| Test | Vitest, supertest, Playwright | unit, contract, E2E |
| Deploy | Node server sau reverse proxy | theo environment |

## Ranh giới application

- component không gọi endpoint trực tiếp;
- `src/lib/api.ts` là façade use case;
- `src/lib/http-client.ts` xử lý HTTP, timeout và lỗi;
- `src/lib/mock/` là adapter dữ liệu phát triển tạm thời;
- khi API hoàn chỉnh, thay adapter trong application layer và giữ component.

## Quy tắc backend

- middleware: request ID → định danh → uỷ quyền → kiểm tra → handler → audit/metric;
- không lưu request state ở module scope;
- mọi promise phải được await/return/waitUntil;
- cấu hình đọc từ biến môi trường (`src/env.ts`);
- secret dùng `.env` local (không commit) và secret manager khi triển khai;
- mutation quan trọng dùng optimistic concurrency/idempotency;
- side effect cần độ bền đi qua outbox/job nền.

## Quy tắc dữ liệu

- database là nguồn thật duy nhất cho permission, workflow, điểm và audit;
- danh mục/quy tắc có version và ngày hiệu lực;
- quyết định giữ snapshot của input, rule version và actor;
- tệp nhạy cảm không đi qua localStorage;
- mock không được deploy như persistence production.
