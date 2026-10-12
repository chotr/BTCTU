# Hồ sơ quyết định kiến trúc (ADR)

| ADR                                              | Trạng thái | Quyết định                                                            |
| ------------------------------------------------ | ---------- | --------------------------------------------------------------------- |
| [ADR-005](ADR-005-modular-monolith-web.md)       | Accepted   | UI web nội bộ + modular monolith                                      |
| [ADR-006](ADR-006-versioned-rules.md)            | Accepted   | Quy tắc/dữ liệu chủ theo phiên bản và truy vết được về nguồn          |
| [ADR-007](ADR-007-permission-scope.md)           | Accepted   | Quyền = hành động/tài nguyên + phạm vi tổ chức/dữ liệu + ngữ cảnh     |
| [ADR-008](ADR-008-integration-gate.md)           | Accepted   | Fake connector trước; tích hợp thật sau cổng phê duyệt/bảo mật        |
| [ADR-009](ADR-009-source-inconsistency-gate.md)  | Accepted   | Bất nhất nguồn chưa giải quyết chặn công bố quy tắc chính thức        |
| [ADR-010](ADR-010-hono-rest-openapi.md)          | Superseded | Hono REST/OpenAPI trên Cloudflare Workers (đã thay bởi ADR-011)       |
| [ADR-011](ADR-011-express-node-api.md)           | Accepted   | REST API Express.js trên Node                                         |

Các ADR này ghi lại **quyết định kỹ thuật cho hệ thống này**; bản thân chúng không
cấu thành phê duyệt để triển khai lên production.
