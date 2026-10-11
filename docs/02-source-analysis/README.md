# Source analysis — source register

## Rule

Every source analysis separates:

- **FACT** — explicitly supported by the source;
- **INFERENCE** — software/domain interpretation;
- **TBD** — unresolved or requiring authority;
- **SOURCE INCONSISTENCY** — source text itself conflicts/contains an error.
- **SOURCE DIVERGENCE** — sources describe different contract layers,
  versions or scopes that must not be treated as interchangeable.

## Source register

`Reviewed from supplied file` means the analysis used the PDF/XLSX supplied with the
project conversation. It does not mean that every operational decision needed for a
production rollout has been approved.

| ID | Source/file | Role in project | Evidence status |
|---|---|---|---|
| SRC-01 | [01-QĐ/BTCTU](qd01.md) | organization, functions, responsibilities, assignment responsibility | Reviewed from supplied PDF |
| SRC-02 | [05-HD/TU](hd05.md) | work/product catalog, KPI, quarterly evaluation | Reviewed from supplied PDF; one worked-example arithmetic inconsistency recorded |
| SRC-03 | [39-QĐ/TU](qd39.md) | classification, conditions, authority, workflow | Reviewed from supplied PDF |
| SRC-04 | [342-QĐ/BTCTW](qd342.md) | architecture, identity, access, audit, data/security, AI | Reviewed from supplied PDF |
| SRC-05 | [348-QĐ/BTCTW + 1638-CV/TU](qd348.md) | connection/sharing, local rollout context | Reviewed from supplied PDFs |
| SRC-06 | [607-QĐ/BTCTW](qd607.md) | shared data + API contract | Reviewed from `A81-VBNB_2026-QĐ-0607-2026_dadongdau.pdf` |
| SRC-07 | [308-QĐ/VPTW](qd308.md) | shared data dictionary, `MaNhiemVu`, `TenNhiemVu`, SOR | Reviewed from supplied PDF |
| SRC-08 | [07-HD/VPTW](hd07.md) | LGSP integration/security/API lifecycle | Reviewed from supplied PDF |
| SRC-09 | [NĐ85/2016](nd85.md) | HTTT security-level criteria | Reviewed from supplied PDF |
| SRC-10 | [NĐ63/2026 + PL](nd63.md) | state-secret document handling | Reviewed from supplied PDF and appendix |
| SRC-11 | [NĐ165/2025](nd165.md) | data governance/access/encryption/lifecycle | Reviewed from supplied PDF |
| SRC-12 | [NĐ278/2025](nd278.md) | mandatory data-sharing governance | Reviewed from supplied PDF |
| SRC-13 | [NQ11/TU](nq11.md) | strategic/digital-transformation context | Reviewed from supplied PDF |
| SRC-14 | [Operational Excel files](excel-operational-data.md) | organization/task catalog seed/draft data | Both supplied workbooks inspected; operational evidence, not legal authority |
| SRC-15 | [Recruitment/project context](project-context.md) | test/recruitment context | Triaged |
| CROSS | [Security regulations summary](security-regulations.md) | cross-source security conclusions | Reconciled from SRC-09..12 |

## Source authority rule

Files provided with the assignment/workspace are the analysis basis. Do not substitute a search-engine summary or an unrelated web copy for the supplied source.

Original PDFs/XLSX are **not committed to this public repository by default** because their redistribution permission must be confirmed. The repo stores derived analysis and source identities/page references.

The status above is therefore about **review provenance**, not redistribution. A
missing binary in Git must not be reported as “source unavailable” when the supplied
file was reviewed outside the repository.

The stale-claim-to-current-result audit trail is maintained in
[audit-reconciliation.md](audit-reconciliation.md).

## Most important unresolved source issue

05-HD/TU worked example:

```text
30 + 82.3% × 70
```

is printed as `80.3`, while arithmetic yields `87.61`. This is recorded narrowly
as a **worked-example arithmetic inconsistency**; it does not establish that the
official formula is wrong.

See [hd05.md](hd05.md). This remains a business clarification gate before claiming an official scoring implementation.
