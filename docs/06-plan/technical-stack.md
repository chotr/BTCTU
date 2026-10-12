# Stack kỹ thuật

## Quyết định hiện tại

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| Web | Next.js 16, React 19, TypeScript strict | App Router, client-heavy dashboard |
| UI | Tailwind CSS 4, component nội bộ | design tokens và accessibility |
| API | Hono trên Cloudflare Workers | REST `/api/v1`, Zod validation |
| Contract | OpenAPI 3.1 | client tương lai sinh từ contract |
| Database đích | D1 + Drizzle hoặc PostgreSQL qua Hyperdrive | chọn theo cổng hạ tầng |
| Tệp | R2 private hoặc DMS được phê duyệt | metadata tách khỏi nội dung |
| Async | Queue/Workflow | import, report, notification, retry |
| AuthN | Cloudflare Access + IdP | API xác minh JWT |
| AuthZ | RBAC + organization/data scope + context | server là nguồn quyết định |
| Quan sát | Workers Logs/Traces + structured log | request/correlation ID |
| Test | Vitest, Workers pool, Playwright | unit, contract, E2E |
| Deploy | Wrangler theo environment | không deploy Worker root |

## Ranh giới application

- component không gọi endpoint trực tiếp;
- `src/lib/api.ts` là façade use case;
- `src/lib/http-client.ts` xử lý HTTP, timeout và lỗi;
- `src/lib/mock/` là adapter dữ liệu phát triển tạm thời;
- khi API hoàn chỉnh, thay adapter trong application layer và giữ component.

## Quy tắc backend

- middleware: request ID → identity → authorization → validation → handler → audit/metrics;
- không lưu request state ở module scope;
- mọi promise phải được await/return/waitUntil;
- bindings được sinh kiểu bằng `wrangler types`;
- secret dùng `.dev.vars` local và `wrangler secret put` remote;
- mutation quan trọng dùng optimistic concurrency/idempotency;
- side effect cần độ bền đi qua outbox/Queue/Workflow.

## Quy tắc dữ liệu

- database là nguồn thật duy nhất cho permission, workflow, điểm và audit;
- danh mục/quy tắc có version và ngày hiệu lực;
- quyết định giữ snapshot của input, rule version và actor;
- tệp nhạy cảm không đi qua localStorage;
- mock không được deploy như persistence production.
