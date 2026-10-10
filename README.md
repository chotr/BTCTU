# BTCTU — Task & KPI Evaluation System

Competency-test project for analyzing and prototyping an internal **task → KPI → evaluation → classification** workflow for Ban Tổ chức Tỉnh ủy.

## Current status

| Area | Status |
|---|---|
| Core source analysis | Reviewed: QĐ01, 05-HD, QĐ39, QĐ342, QĐ348, QĐ308, QĐ607, HD07, NĐ85/63/165/278, NQ11 and two Excel files |
| Business/domain design | Ready for MVP implementation, with explicit TBD gates |
| System architecture | Web modular monolith candidate; C4/ERD/permissions/audit/security/integration documented |
| App code | Next.js UI + Hono/Cloudflare Worker mock-first API |
| Production approval | Not claimed; security/data/integration gates remain |

## Start here

Read [docs/README.md](docs/README.md).

## Run the local prototype

```bash
pnpm install
pnpm --filter @btctu/api dev      # http://localhost:8787
pnpm --filter @btctu/web dev      # http://localhost:3000
```

The API source is in [apps/api](apps/api/README.md). It currently uses synthetic, request-scoped fixtures so the UI can be connected before D1/Drizzle, R2, Cloudflare Access and Queues are provisioned.

Key documents:

- [Source register](docs/02-source-analysis/README.md)
- [Traceability matrix](docs/03-business/traceability-matrix.md)
- [Known/unknown register](docs/03-business/known-unknowns.md)
- [System context](docs/04-system-design/context.md)
- [ERD](docs/04-system-design/erd.md)
- [Security architecture](docs/04-system-design/security-architecture.md)
- [Implementation plan](docs/06-plan/implementation-plan.md)
- [Demo plan](docs/07-demo/demo-plan.md)
- [Defense story](docs/08-presentation/defense-story.md)

## Engineering rule

Every important statement is treated as one of:

- **FACT** — directly sourced;
- **INFERENCE** — candidate design;
- **TBD** — unresolved;
- **SOURCE INCONSISTENCY** — source conflict/defect.

The project intentionally refuses to convert an analyst guess into an “official” personnel-evaluation rule.

## Branch

Documentation/design work is on `docs/architecture`.
