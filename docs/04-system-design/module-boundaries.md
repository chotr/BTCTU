# Module boundaries

| Module | Owns | Dependency |
|---|---|---|
| Organization | organization, department, person, membership, position ref | QĐ01 |
| Responsibility | responsibility, work catalog/version | QĐ01 + Excel |
| Task | task, assignment, result, product/evidence metadata | 05 + Excel |
| Evaluation | period, criteria, score, workflow, classification | 05 + 39 |
| IAM/Scope | identity link, role, grant, data scope | QĐ342 + local decision |
| Audit | audit event, access/export/override history | QĐ342/security |
| Reporting | read models/dashboard/export | Approved data only |
| Integration | connector, mapping, sync run/error | 348/308/607/07 |

Không cho module sửa bảng của module khác; trao đổi qua application service/domain event trong cùng modular monolith.

