# Integration future-state

```mermaid
sequenceDiagram
  participant A as BTCTU App
  participant G as Connector/API Gateway
  participant X as Integration Platform
  participant S as Source System
  A->>G: Request (purpose, scope, X-Request-ID)
  G->>G: AuthZ + schema/version + rate limit
  G->>X: Signed/encrypted request
  X->>S: Fetch authoritative data
  S-->>X: Versioned response
  X-->>G: Response + trace
  G->>G: Validate/map/audit
  G-->>A: Minimal approved fields
```

MVP dùng fake adapter và contract tests. Production cần: đăng ký/duyệt kết nối, non-production test data, canonical mapping QĐ308/QĐ607, idempotency/retry/dead-letter, reconciliation, DC/DR, monitoring và incident handling theo HD07/QĐ348.

