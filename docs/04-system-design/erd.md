# ERD mục tiêu (logical)

```mermaid
erDiagram
  ORGANIZATION ||--o{ DEPARTMENT : has
  DEPARTMENT ||--o{ MEMBERSHIP : has
  PERSON ||--o{ MEMBERSHIP : joins
  POSITION_REFERENCE ||--o{ MEMBERSHIP : classifies
  DEPARTMENT ||--o{ RESPONSIBILITY : owns
  RESPONSIBILITY ||--o{ WORK_CATALOG_ITEM : traces
  WORK_CATALOG_ITEM ||--o{ TASK : instantiates
  TASK ||--o{ ASSIGNMENT : assigned
  PERSON ||--o{ ASSIGNMENT : receives
  ASSIGNMENT ||--o| TASK_RESULT : produces
  TASK_RESULT ||--o{ EVIDENCE : supports
  EVALUATION_PERIOD ||--o{ EVALUATION : contains
  PERSON ||--o{ EVALUATION : subject
  EVALUATION ||--o{ SCORE_COMPONENT : comprises
  EVALUATION ||--o| CLASSIFICATION_DECISION : decides
  EVALUATION ||--o{ WORKFLOW_TRANSITION : records
  PERSON ||--o{ AUDIT_EVENT : acts
```

Mọi master/rule quan trọng có `source_ref`, `version`, `effective_from/to`, `status`. Entity nhạy cảm có `classification`, scope và audit; soft-delete không thay thế retention policy.

