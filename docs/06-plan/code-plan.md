# Code plan

## Milestone 0 — Architecture spike

Mục tiêu: chứng minh stack trước khi code nghiệp vụ.

- tạo pnpm workspace với `apps/web`, `apps/api`, `packages/*`;
- dựng Next.js page gọi `/health` của Hono Worker;
- thiết lập Wrangler environments và generated binding types;
- thử Cloudflare Access JWT verification;
- migration D1 đầu tiên, private R2 binding và Queue producer/consumer;
- CI lint/typecheck/test/build;
- ghi kết quả compatibility/deployment vào ADR.

**Exit:** preview deploy chạy end-to-end bằng dữ liệu giả; không có business feature.

## Milestone 1 — Cross-cutting foundation

- request/correlation ID và structured error;
- actor/identity mapping;
- authorization policy interface;
- audit event envelope;
- clock/ID abstractions;
- source reference + version/effective-date primitives;
- test builders và synthetic fixtures.

**Exit:** một protected mutation có validation, permission, DB write và audit test.

## Milestone 2 — Organization vertical slice

Backend:

- organization, department, person, membership, position reference;
- responsibility/source reference;
- list/detail/create/update cho master data được phép;
- history/effective dates.

Frontend:

- organization tree;
- department/member pages;
- source badge FACT/INFERENCE/TBD;
- permission-aware actions.

**Nguồn:** QĐ01.
**Exit:** trace được dữ liệu khởi tạo về Điều 2–7; chưa có Task taxonomy giả.

## Milestone 3 — Work catalog và assignment

- Excel offline importer → staging JSON → validation report;
- work catalog version/draft/publish;
- task + assignment + assignee/assigner;
- inbox/outbox;
- audit reassign/cancel;
- optimistic concurrency.

**Nguồn:** QĐ01 Điều 7.2 + 05-HD/TU Phụ lục 1 + Excel vận hành/draft.

**Rule:** không cần chờ Excel được xác nhận chính thức mới code importer/catalog.
Excel được import vào staging/DRAFT; chỉ version đã được review/phê duyệt mới
được publish với trạng thái chính thức.

**Exit:** kiểm thử phân công bằng catalog chờ phê duyệt và hiển thị rõ trạng thái/version.

## Milestone 4 — Result/product/evidence

- result draft/submit;
- product metadata;
- private R2 upload/download flow cho dữ liệu synthetic;
- checksum/classification/status;
- return-for-correction;
- file permission tests.

**Nguồn:** 05-HD/TU đã xác nhận mô hình công việc/sản phẩm/kết quả ở mức nghiệp vụ.

**TBD/gate production:** nội dung evidence thật có được lưu trong app hay chỉ giữ
reference đến DMS/kho tài liệu được phê duyệt.

**Exit:** form kết quả/sản phẩm chạy bằng dữ liệu kiểm thử (synthetic), không chứa tài liệu bí mật nhà nước.

## Milestone 5 — KPI calculation

- evaluation period;
- `ScoringRuleVersion` / criterion/formula version;
- calculation input snapshot;
- deterministic calculation run;
- explanation breakdown;
- manual override with reason/audit.

**Nguồn đã xác nhận:** 05-HD/TU cung cấp cấu trúc 30 + 70 và A/B/C/D cho
lãnh đạo/quản lý.

**Không block implementation:** INC-01 (worked-example arithmetic inconsistency)
không chặn triển khai engine. Nó chỉ chặn việc publish/activate rule bị ảnh hưởng
dưới trạng thái `OFFICIAL/ACTIVE`.

**TBD:** công thức chính thức cho người không giữ chức vụ lãnh đạo/quản lý,
rounding và một số trường hợp biên.

**Exit:** golden test cho từng candidate/approved formula và boundary/rounding case.

## Milestone 6 — Evaluation/classification workflow

- self evaluation;
- reviewer queue/comment/return;
- classification rule;
- competent approval;
- period lock/reopen policy;
- transition/audit timeline.

**Nguồn:** 05-HD/TU + QĐ39/TU đã xác nhận các stage khái niệm,
ngưỡng xếp loại và điều kiện bổ sung.

**TBD:** mapping chính xác thẩm quyền/nhóm so sánh/quota trong BTCTU và
quy trình reopen nội bộ.

**Exit:** transition table tests + permission tests + concurrency test.

## Milestone 7 — Dashboard/report

- department/personal progress;
- KPI/classification aggregates;
- overdue/missing-evidence indicators nếu nguồn cho phép;
- CSV/PDF export policy;
- background report generation qua Queue;
- data-scope tests để chống leakage.

**Exit:** dashboard số liệu khớp truy vấn reconciliation.

## Milestone 8 — Integration contract

- canonical mapping registry theo QĐ308;
- contract/profile theo QĐ607;
- fake adapter + contract tests;
- test riêng QĐ607 OAuth 2.0 `client_credentials`/JWT behavior;
- giữ boundary riêng cho profile LGSP được phê duyệt theo HD07;
- sync run, checkpoint, error/dead-letter, reconciliation;
- request ID, purpose, field allowlist và audit.

**Đã biết từ source:** API contract QĐ607, 401/403 behavior, TLS/logging constraints,
và HD07 integration requirements.

**Chưa biết:** endpoint production, API subset được cấp, credentials, network route,
certificate/profile cụ thể.

Không bật endpoint thật nếu thiếu approval/network/credential/security gate.

## Milestone 9 — Hardening

- threat model, rate limits, WAF/Access policies;
- backup/restore drill và DR runbook;
- dependency/SAST/secret scans;
- load test các query/dashboard;
- audit export/monitoring/alerts;
- ATTT/legal checklist và deployment approval.

## Thứ tự ticket cho sprint đầu

1. `ARCH-001` — workspace, TypeScript strict, lint/test/build.
2. `CF-001` — Hono Worker `/health`, Wrangler environments.
3. `WEB-001` — Next.js shell, navigation và generated API client.
4. `DB-001` — Drizzle + D1 migrations + repository smoke test.
5. `AUTH-001` — Access JWT verifier + local test adapter.
6. `SEC-001` — authorization middleware + deny-by-default tests.
7. `AUD-001` — audit envelope + request ID.
8. `ORG-001` — organization/department schema và APIs.
9. `ORG-002` — person/membership/position-reference schema và APIs.
10. `ORG-003` — organization UI + source trace.
11. `CI-001` — preview deploy + Playwright smoke.

Sprint đầu dừng ở Organization. Task/KPI không được kéo vào trước foundation;
nhưng implementation không bị chặn chỉ vì rule/catalog chính thức chưa được
activate — dùng `DRAFT/CANDIDATE` và source trace rõ ràng.
