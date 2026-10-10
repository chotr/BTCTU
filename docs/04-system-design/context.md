# System context and containers

## Context [INFERENCE based on source roles]

```mermaid
flowchart LR
  STAFF["Staff / member"]
  HEAD["Department head / Chánh VP"]
  AUTH["Competent authority"]
  APP["BTCTU Task & Evaluation System"]
  IDP["Identity Provider\nProduction TBD"]
  TCXDD["HTTT TCXDĐ / LGSP\nFuture approved integration"]
  DMS["Approved evidence/DMS\nFuture/TBD"]

  STAFF -->|"task result / self evaluation"| APP
  HEAD -->|"assignment / review in authorized scope"| APP
  AUTH -->|"final decision / reports"| APP
  APP -. "authentication / MFA" .-> IDP
  APP -. "scoped canonical data" .-> TCXDD
  APP -. "authorized evidence reference" .-> DMS
```

## Application containers [candidate]

```mermaid
flowchart LR
  U["Authorized internal user"]
  WEB["Web UI\nNext.js"]
  API["Application\nModular monolith"]
  WORKER["Worker\nreports/jobs/outbox"]
  DB[("Relational DB\ntransactional data + snapshots")]
  AUD[("Audit store/read model")]
  EVID["Evidence boundary\nsynthetic in demo; approved DMS/store later"]
  CONN["Integration adapter\nfake in MVP"]

  U -->|"HTTPS"| WEB
  WEB --> API
  API --> DB
  API --> AUD
  API --> EVID
  API --> CONN
  API --> WORKER
```

## Boundary notes

- “Head” does not automatically equal final approver; authority is resolved by source rules.
- Real state-secret documents are outside prototype scope.
- Real external integration is disabled until production gates are met.
- The container split is an engineering design; QĐ342 supplies architectural/security constraints, not these exact deployable components.
