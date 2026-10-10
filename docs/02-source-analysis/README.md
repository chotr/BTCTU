# Source analysis — source register

## Rule

Every source analysis separates:

- **FACT** — explicitly supported by the source;
- **INFERENCE** — software/domain interpretation;
- **TBD** — unresolved or requiring authority;
- **SOURCE INCONSISTENCY** — source text itself conflicts/contains an error.

## Source register

| ID | Source/file | Role in project | Status |
|---|---|---|---|
| SRC-01 | [01-QĐ/BTCTU](qd01.md) | organization, functions, responsibilities, assignment responsibility | Reviewed |
| SRC-02 | [05-HD/TU](hd05.md) | work/product catalog, KPI, quarterly evaluation | Reviewed; one arithmetic inconsistency recorded |
| SRC-03 | [39-QĐ/TU](qd39.md) | classification, conditions, authority, workflow | Reviewed |
| SRC-04 | [342-QĐ/BTCTW](qd342.md) | architecture, identity, access, audit, data/security, AI | Reviewed |
| SRC-05 | [348-QĐ/BTCTW + 1638-CV/TU](qd348.md) | connection/sharing, local rollout context | Reviewed |
| SRC-06 | [607-QĐ/BTCTW](qd607.md) | shared data + API contract | Reviewed |
| SRC-07 | [308-QĐ/VPTW](qd308.md) | shared data dictionary / canonical terms / SOR | Reviewed |
| SRC-08 | [07-HD/VPTW](hd07.md) | LGSP integration/security/API lifecycle | Reviewed |
| SRC-09 | [NĐ85/2016](nd85.md) | HTTT security-level criteria | Reviewed |
| SRC-10 | [NĐ63/2026 + PL](nd63.md) | state-secret document handling | Reviewed |
| SRC-11 | [NĐ165/2025](nd165.md) | data governance/access/encryption/lifecycle | Reviewed |
| SRC-12 | [NĐ278/2025](nd278.md) | mandatory data-sharing governance | Reviewed |
| SRC-13 | [NQ11/TU](nq11.md) | strategic/digital-transformation context | Reviewed |
| SRC-14 | [Operational Excel files](excel-operational-data.md) | organization/task catalog seed/draft data | Inspected; not treated as law |
| SRC-15 | [Recruitment/project context](project-context.md) | test/recruitment context | Triaged |
| CROSS | [Security regulations summary](security-regulations.md) | cross-source security conclusions | Reviewed |

## Source authority rule

Files provided with the assignment/workspace are the analysis basis. Do not substitute a search-engine summary or an unrelated web copy for the supplied source.

Original PDFs/XLSX are **not committed to this public repository by default** because their redistribution permission must be confirmed. The repo stores derived analysis and source identities/page references.

## Most important unresolved source issue

05-HD/TU worked example:

```text
30 + 82.3% × 70
```

is printed as `80.3`, while arithmetic yields `87.61`.

See [hd05.md](hd05.md). This remains a business clarification gate before claiming an official scoring implementation.
