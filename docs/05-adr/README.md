# Architecture Decision Records

| ADR                                             | Status           | Decision                                                             |
| ----------------------------------------------- | ---------------- | -------------------------------------------------------------------- |
| [ADR-005](ADR-005-modular-monolith-web.md)      | Accepted         | Internal web UI + modular monolith                                   |
| [ADR-006](ADR-006-versioned-rules.md)           | Accepted         | Rules/master data versioned and source-traceable                     |
| [ADR-007](ADR-007-permission-scope.md)          | Accepted         | Permission = action/resource + organizational/data scope + context   |
| [ADR-008](ADR-008-integration-gate.md)          | Accepted         | Fake connector first; real integration behind approval/security gate |
| [ADR-009](ADR-009-source-inconsistency-gate.md) | Accepted         | Unresolved source inconsistency blocks official rule publication     |
| [ADR-010](ADR-010-hono-rest-openapi.md)         | Accepted         | Hono REST/OpenAPI on Cloudflare Workers                              |

These ADRs record **engineering decisions for this system**; they do not by themselves constitute approval to deploy to production.
