# Traceability matrix — source → rule → design → implementation

This table is the quickest evidence for an interviewer that the system is not based on invented rules.

| Source | Source fact | Business impact | Design/implementation |
|---|---|---|---|
| QĐ01 Điều 2–7 | 4 departments; functions/responsibilities; head assigns work linked to position | organization + assignment context | Organization, Department, Membership, Responsibility, Assignment |
| 05-HD mục IV | 30 points general + 70 work result | two-component evaluation | GeneralCriteriaSnapshot + WorkPerformanceSnapshot |
| 05-HD PL1 | standard work/product catalog, point/coefficient/complexity/time | catalog before task instance | WorkCatalogVersion / WorkCatalogItem |
| 05-HD PL2 | A/B/C/D KPI for leaders | measurable performance axes | MetricSnapshot + CalculationRun |
| 05-HD PL2 | arithmetic inconsistency in worked example | cannot blindly hard-code | SourceIssue INC-01 + unit test + approval gate |
| QĐ39 Điều 11 | thresholds + additional conditions | score ≠ final classification | EligibilityCheck / ClassificationRuleVersion |
| QĐ39 Điều 12 | self → appraisal → competent decision | staged workflow | Evaluation workflow |
| QĐ342 Điều 16 | role/task/scope/classification/time; least privilege; audit | contextual authorization | PolicyDecision + AuditEvent |
| QĐ342 Điều 23 | AI support only, human decision, no unapproved public AI for protected data | report drafting boundary | AI feature optional, human approval |
| QĐ308 | canonical data dictionary + MaNhiemVu/TenNhiemVu + SOR | canonical mapping | DataDictionaryMapping |
| QĐ607 | OAuth 2.0 `client_credentials`/JWT scoped APIs | concrete connector contract | Integration adapter |
| HD07 + QĐ607 | Different authentication version/profile wording at LGSP vs concrete API layer | do not treat mechanisms as interchangeable | Approved-endpoint auth profile + SourceDivergence DIV-01 |
| QĐ348/HD07 | approved purpose/scope, test→prod, >= level 3 for connected systems | integration/security gate | connector disabled in MVP |
| NĐ85 | formal HTTT level criteria | cannot self-certify level | production compliance gate |
| NĐ63 | strict state-secret e-document handling | keep secret content out of MVP | evidence reference boundary |
| NĐ165 | access history, encryption, lifecycle | data governance | audit/encryption/retention |
| NĐ278 | data sharing governance | integration is organizational + technical | connector governance |
| Excel work catalog | actual draft codes/products/points/formulas | realistic seed/catalog candidate | staging import + steward approval |
| Excel assignment tree | actual draft org/assignment context | realistic demo seed | staging/synthetic mapping |
| NQ11 | strategic digital-transformation targets | project/OKR context | defense story / future strategic dashboard |

## Rule

A feature can be marked **source-derived** only when a row like this can point to an actual source section/page. Otherwise mark it `[INFERENCE]` or `[TBD]`.
