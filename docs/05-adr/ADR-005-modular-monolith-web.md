# ADR-005 — Web frontend + modular-monolith backend

**Status:** Accepted.

## Decision

Use a responsive web application with **two deployable units**:

1. `apps/web` — Next.js frontend;
2. `apps/api` — Hono backend deployed as one modular-monolith application.

The backend keeps clear module boundaries such as Organization, Task, Evaluation,
Classification, IAM/Policy and Audit, but those backend modules are not deployed
as separate microservices.

The system uses a relational data model and background jobs/outbox where needed.

## Reason

This system benefits more from an end-to-end vertical slice, traceability
and simple operations than from microservice complexity.

Separating web and API gives:

- an explicit API contract;
- independent frontend/backend delivery;
- easier future integration with other clients/systems.

Keeping the backend as one modular monolith gives:

- low deployment/operational overhead;
- transactional consistency for task/evaluation flows;
- clear module ownership without premature service extraction.

## Production boundary

This ADR decides the **application structure**, not the final production hosting
platform.

Production hosting/network/database/object-storage choices remain subject to
security-level assessment, data classification, state-secret scope, infrastructure
approval and integration requirements.

## Consequences

- do not describe the whole system as “one deployable unit”;
- the Hono backend is the modular monolith;
- enforce module boundaries to avoid a big-ball-of-mud backend;
- extract a module into a separate service only when an actual scaling,
  ownership or integration requirement justifies it.
