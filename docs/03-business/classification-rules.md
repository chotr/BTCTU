# Classification rules

## FACT — QĐ39

### Basic score bands

| Classification | Basic score |
|---|---:|
| Hoàn thành xuất sắc nhiệm vụ | >= 90 |
| Hoàn thành tốt nhiệm vụ | >= 70 and < 90 |
| Hoàn thành nhiệm vụ | >= 50 and < 70 |
| Không hoàn thành nhiệm vụ | < 50 or a blocking case applies |

Source: QĐ39, Điều 11.

## Score is not enough

Each class contains additional mandatory conditions. Examples include:

- completion ratio of assigned tasks;
- quality/timeliness;
- outstanding-result requirements for excellent rating;
- conditions tied to the performance of a unit/area/subordinates for leaders;
- violation/discipline cases;
- group-level quota/cap on the number of excellent ratings.

Therefore this is invalid:

```ts
if (score >= 90) return "EXCELLENT";
```

## Proposed decision pipeline [INFERENCE]

```mermaid
flowchart LR
  S["Calculated score"] --> B["Basic band"]
  B --> G["Mandatory condition checks"]
  G --> Q["Quota/group constraint"]
  Q --> P["Proposed classification"]
  P --> A["Competent authority decision"]
```

## Candidate rule representation

```text
ClassificationRuleVersion
- version/effective period
- sourceRef
- subjectType
- scoreBands[]
- mandatoryConditions[]
- blockers[]
- groupQuotaRule?
- roundingPolicy
- status
```

A small deterministic evaluator is enough for MVP. Do not build a generic DSL/rules engine unless the rule set proves it necessary.

## TBD

- exact comparison group for the excellent-rating cap inside BTCTU;
- precise mapping of each QĐ39 subject category to demo users;
- local procedure for appeal/reopen/correction after publication;
- official monthly-to-quarter/year aggregation rule for the test system.
