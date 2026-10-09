# Audit design

## FACT constraints

QĐ342 requires trace/logging for access, exploitation, update, approval, sharing and data processing, with ability to inspect, monitor and trace origins. Important-data changes must have protected logging.

QĐ308/QĐ348/HD07 also make source/scope/transaction trace important for integration.

## Candidate event coverage [INFERENCE]

Log at minimum:

- authentication/MFA/failed privileged access;
- sensitive record read;
- create/update/delete/archive;
- assign/reassign;
- task result submit/accept/rework;
- evaluation submit/review/return/final decision;
- score calculation and manual override;
- lock/reopen;
- export/print;
- permission/grant change;
- connector request/status;
- AI-assisted draft generation, if enabled.

## Event schema candidate

```text
AuditEvent
- eventId
- occurredAtUtc
- actorId / actorRoles
- action
- resourceType / resourceId
- subjectId
- organization/data scope
- purpose
- classification
- workflowState
- outcome
- reason
- request/correlationId
- rule/catalog/version references
- safe before/after diff or hashes
- source IP/device info where permitted
```

## Security rules

- do not log secrets/tokens/file bodies;
- minimize sensitive payload in logs;
- append-only/tamper-evident storage;
- restricted audit-reader permission;
- centralized time/correlation IDs;
- security monitoring can consume audit stream/read model.

## TBD

Retention duration, legal hold, exact authorized audit readers and any digital-signature/WORM requirement for production.
