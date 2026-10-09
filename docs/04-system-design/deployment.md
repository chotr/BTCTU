# Deployment architecture — prototype and production target

## Decision [INFERENCE]

Prototype/demo: **internal web application, modular monolith**.

Reasons:

- small/internal user base;
- centralized update/deployment;
- multi-user review/approval fits browser access;
- much less operational overhead than desktop distribution or microservices.

This is an architecture decision for the test, not a rule in the regulations.

## Prototype

```mermaid
flowchart LR
  B["Browser on demo machine"] --> W["Next.js Web/App API"]
  W --> DB["PostgreSQL / local dev DB"]
  W --> OBJ["Synthetic evidence store"]
```

No real LGSP, no real personnel data, no state-secret content.

## Production target [subject to approval]

```mermaid
flowchart LR
  U["Authorized internal clients"] --> RP["Internal reverse proxy / TLS"]
  RP --> APP["BTCTU web application"]
  APP --> DB["Relational DB"]
  APP --> OBJ["Approved evidence/DMS boundary"]
  APP --> AUD["Central audit/monitoring"]
  APP --> CONN["Controlled connector zone"]
  CONN -. approved route .-> LGSP["LGSP / TCXDĐ"]
  DB --> DR["Backup / DR"]
```

## Production gates

- formal HTTT level assessment/approval;
- approved network/hardware location;
- data inventory + classification;
- access/role matrix;
- backup/DR targets;
- state-secret handling decision;
- approved integration purpose/scope/credentials;
- security testing.

Until those gates are resolved, the production diagram is a **target architecture**, not an assertion that deployment is legally approved.
