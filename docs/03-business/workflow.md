# Evaluation workflow

## Source-derived stages

From 05-HD/TU + QĐ39:

```mermaid
flowchart LR
  PLAN["Define objectives/tasks/products"] --> SELF["Self evaluation / proposed rating"]
  SELF --> REVIEW["Review / appraisal / proposed rating"]
  REVIEW --> DECIDE["Competent authority decides"]
  DECIDE --> NOTICE["Notify + store result"]
```

These stages are **FACT at conceptual level**.

## Application state machine [INFERENCE]

The app may implement those stages with:

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Submitted: submit self evaluation
  Submitted --> Reviewed: reviewer completes appraisal
  Submitted --> Draft: return for correction
  Reviewed --> Approved: final authority decides
  Reviewed --> Submitted: return / request clarification
  Approved --> Locked: close period
  Locked --> Reopened: exceptional authorized reopen
  Reopened --> Submitted: resubmit
```

The English state names and exact transitions above are software design, not terminology copied from the regulations.

## Authority resolution

Do not hard-code:

```text
MANAGER -> approve all employees
```

Instead resolve:

```text
subject
+ organization / position
+ evaluation period
+ competent-authority relationship
+ data scope
→ reviewer / final authority
```

QĐ39 contains different competent authorities for different subject groups.

## Lock/reopen [INFERENCE]

After a final decision, snapshot/rule version/result should be locked. If correction is allowed:

- create reopen request;
- record reason and authority;
- keep previous decision/calculation;
- produce new reviewed/final version;
- full audit trail.

The existence/details of an internal reopen process remain TBD; this is the safest product behavior for preserving traceability.

## Monthly / quarterly / annual

- **Quarter:** formal source-backed workflow from 05-HD.
- **Year:** QĐ39 uses accumulated/periodic results as input to annual classification.
- **Month:** required by the assignment, but exact legal workflow/aggregation is not fully specified in the reviewed sources.

Candidate design: month = operational performance snapshot; quarter/year = formal evaluation periods with versioned rules.
