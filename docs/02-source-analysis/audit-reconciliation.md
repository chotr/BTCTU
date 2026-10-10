# Source audit reconciliation

This note records the reconciliation of the documentation snapshot against the
PDF/XLSX files supplied with the project conversation. It is an audit trail, not
a new source of business rules.

## Resolved stale findings

| Earlier stale claim | Reconciled result | Canonical analysis |
|---|---|---|
| 05-HD/TU was unavailable and KPI rules were wholly TBD | The supplied PDF was reviewed. The 30 + 70 structure, leader/manager A/B/C/D KPI and quarterly stages are FACT. | [05-HD/TU](hd05.md), [KPI model](../03-business/evaluation-kpi-model.md) |
| 39-QĐ/TU was unavailable and no classification rule was confirmed | The supplied PDF was reviewed. The 90/70/50 score bands are FACT, but mandatory conditions, blockers, authority and the excellent-rating cap must also be evaluated. | [39-QĐ/TU](qd39.md), [classification rules](../03-business/classification-rules.md) |
| QĐ607/API could not be checked | `A81-VBNB_2026-QĐ-0607-2026_dadongdau.pdf` was reviewed; shared-data/API scope and authentication constraints are recorded. | [QĐ607](qd607.md) |
| The two operational Excel files were unavailable | Both supplied workbooks were inspected. They inform organization/catalog import design but are not automatically legal or approved rule sources. | [Excel operational data](excel-operational-data.md) |
| NĐ63/165/278 had only metadata | The supplied texts were reviewed and their relevant document-security, data-governance and mandatory-sharing constraints were extracted. | [NĐ63](nd63.md), [NĐ165](nd165.md), [NĐ278](nd278.md), [security summary](security-regulations.md) |
| QĐ308 lacked task fields and SOR semantics | The analysis now records `MaNhiemVu`, `TenNhiemVu`, metadata principles and System of Record implications. | [QĐ308](qd308.md) |
| QĐ342 relied on external-web provenance | The canonical analysis cites the supplied PDF by article/page and does not use a web copy as a substitute. | [QĐ342](qd342.md) |
| Domain map and implementation plan were blocked on “missing 05/39” | Both sources are now present in the dependency model. Remaining gates are narrowed to explicit business clarifications. | [domain map](../03-business/domain-map.md), [implementation plan](../06-plan/implementation-plan.md) |
| Legacy and canonical documentation trees coexisted | The canonical tree is `00` through `08`; duplicate legacy trees/files were removed. | [documentation index](../README.md) |

## SOURCE INCONSISTENCY retained

The worked example in 05-HD/TU prints:

```text
30 + (82.3% × 70) = 80.3
```

The arithmetic result is `87.61`. The project does not silently choose either
number as an official rule. It records the discrepancy, keeps scoring rules
versioned and requires business confirmation before claiming an official
implementation.

## Remaining TBDs after reconciliation

- approved treatment of the 05-HD/TU arithmetic inconsistency;
- official scoring formula for staff who are not leaders/managers;
- exact BTCTU comparison group for the QĐ39 excellent-rating cap;
- authority/effective version of the two operational workbooks;
- production data classification, retention, state-secret boundary and formal
  information-system security-level approval;
- actual integration approval, endpoints, credentials, network route and
  permitted data subset;
- local reopen/correction workflow after an evaluation decision is published.

These items remain **TBD** because the supplied sources do not resolve the local
implementation decision or because competent-authority approval is required.
