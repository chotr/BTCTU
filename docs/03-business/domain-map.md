# Business domain map và traceability

```mermaid
flowchart LR
  S1["QĐ01"] --> O["Organization & responsibility"]
  S2["05-HD/TU\nTBD"] --> K["Task/Product/KPI rules"]
  S3["39-QĐ/TU\nTBD"] --> E["Evaluation & classification"]
  S4["342/348/308/07"] --> I["Identity, data & integration constraints"]
  S5["85/63/165/278"] --> SEC["Security & governance constraints"]
  O --> A["Assignment"]
  K --> A
  A --> R["Result / Product / Evidence"]
  R --> E
  E --> REP["Dashboard / Report"]
  I --> A
  SEC --> A
```

| Capability | Source basis | Status |
|---|---|---|
| Organization/department/responsibility | QĐ01 Điều 2–6 | Ready for implementation |
| Assignment linked to member/position | QĐ01 Điều 7.2 | Skeleton ready; task semantics TBD |
| Product/evidence/KPI | Expected from 05-HD/TU | Blocked |
| Evaluation/classification/approval | Expected from 39-QĐ/TU | Blocked |
| Identity, permission, audit, dashboard layers | QĐ342 Điều 6–7 | Architecture constraint |
| Data sharing | QĐ348, QĐ308, HD07 | Future integration boundary |
| Security level/secrecy/data governance | NĐ85/63/165/278 | Production gate |

