# Known / unknown register

## Known from reviewed sources

| Concept | Status | Evidence |
|---|---|---|
| Four departments/functions/responsibilities | Known | QĐ01 |
| Heads/Chánh VP responsible for assigning member work linked to position | Known | QĐ01 Điều 7.2 |
| Work/product catalog concept | Known | 05-HD Phụ lục 1 |
| Core task code/name data elements | Known | QĐ308 |
| Score structure 30 + 70 | Known | 05-HD |
| A/B/C/D KPI for leaders/managers | Known | 05-HD Phụ lục 2 |
| Self → appraisal → final decision stages | Known | 05-HD + QĐ39 |
| Four basic classification score bands | Known | QĐ39 Điều 11 |
| Classification needs non-score conditions/blockers | Known | QĐ39 |
| Multi-dimensional permission + least privilege | Known | QĐ342 Điều 16 |
| Audit every access/update/approval/share | Known | QĐ342 |
| Canonical dictionary / SOR | Known | QĐ308 |
| OAuth2/JWT integration contract | Known | QĐ607 |
| Connection requires purpose/scope/security approval | Known | QĐ348 + HD07 |
| Connected systems target ATTT >= level 3 | Known in integration context | QĐ348/HD07 |
| Operational work catalog / org assignment Excel exists | Known | two supplied XLSX files |

## Source ambiguities / inconsistencies

| ID | Issue | Impact |
|---|---|---|
| INC-01 | 05-HD worked example prints `30 + 82.3%×70 = 80.3`, while arithmetic gives 87.61 | scoring rule must be confirmed before official implementation |
| INC-02 | 05-HD explicit A/B/C/D formula targets leaders/managers; test covers all staff | non-manager formula/config needs approved design |
| INC-03 | Excel catalog has scores/formulas but supplied material does not by itself prove approval/effective version | import as draft/staging, not official rule |

## Still unknown / needs authority

| ID | Question | Blocks |
|---|---|---|
| Q-01 | Official JobPosition master and effective assignments? | authoritative org/person master |
| Q-02 | Approved version of work catalog / coefficient values? | official KPI |
| Q-03 | How is INC-01 resolved? | official 70-point calculation |
| Q-04 | Formula for non-manager staff? | staff KPI |
| Q-05 | Exact monthly → quarterly → annual aggregation? | period automation |
| Q-06 | Comparison group for excellent-rating quota? | final classification automation |
| Q-07 | Local reopen/appeal/correction workflow after decision? | locked-result changes |
| Q-08 | Exact production data classification and state-secret scope? | security level/deployment |
| Q-09 | Formal approved HTTT level? | production gate |
| Q-10 | Is real LGSP/TCXDĐ integration required for this app? | connector/deployment |
| Q-11 | What API/data subset is approved? | real integration |
| Q-12 | Can evidence files be stored, or only referenced to an approved DMS? | evidence architecture |

## Resolved design decisions

- Prototype: web modular monolith.
- Synthetic data only.
- Versioned/source-traceable catalog and rules.
- Fake connector first; real integration behind approval/security gate.
- Department is an evaluation subject; do not assume department score = average employee score.
