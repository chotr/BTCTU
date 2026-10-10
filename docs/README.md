# BTCTU project documentation

This is the canonical documentation tree for the competency-test project.

## Recommended reading order

| # | Area | Start here | Answers |
|---|---|---|---|
| 00 | Overview | [00-overview.md](00-overview.md) | What is the project and what is still unresolved? |
| 01 | Requirements | [01-requirements/assignment.md](01-requirements/assignment.md) | What must the test deliver? |
| 02 | Source analysis | [02-source-analysis/README.md](02-source-analysis/README.md) | What does each source actually say? |
| 02 | Audit reconciliation | [02-source-analysis/audit-reconciliation.md](02-source-analysis/audit-reconciliation.md) | Which stale claims were corrected, and which TBDs remain? |
| 03 | Business | [03-business/domain-map.md](03-business/domain-map.md) | How do organization, task, KPI and evaluation fit together? |
| 03 | Traceability | [03-business/traceability-matrix.md](03-business/traceability-matrix.md) | Which source justifies each design capability? |
| 04 | System design | [04-system-design/context.md](04-system-design/context.md) | C4/domain/ERD/permissions/audit/integration/security |
| 05 | ADR | [05-adr/README.md](05-adr/README.md) | Why were key architecture choices made? |
| 06 | Plan | [06-plan/implementation-plan.md](06-plan/implementation-plan.md) | What should be implemented, with which stack, and in what order? |
| 07 | Demo | [07-demo/demo-plan.md](07-demo/demo-plan.md) | How to demonstrate the vertical slice? |
| 08 | Defense | [08-presentation/defense-story.md](08-presentation/defense-story.md) | How to explain the project to interviewers? |

## Evidence labels

- **FACT** — source explicitly supports the statement.
- **INFERENCE** — candidate software/domain interpretation.
- **TBD** — needs clarification/authority.
- **SOURCE INCONSISTENCY** — source itself conflicts or contains a suspected defect.

Never promote INFERENCE/TBD to FACT.

## Core source findings

- **QĐ01:** organization, department responsibilities and assignment responsibility.
- **05-HD/TU:** 30/70 evaluation, work/product catalog, A/B/C/D KPI for leaders and quarterly stages.
- **39-QĐ/TU:** score bands + mandatory conditions + evaluation authority.
- **QĐ342:** contextual authorization, audit, security, canonical architecture and AI restrictions.
- **QĐ308/607 + QĐ348/HD07:** canonical data + real-integration contract/gates.
- **NĐ85/63/165/278:** information-system level, state-secret boundary and data governance.
- **Excel files:** useful operational seed/draft data, not automatically official rules.

## Most important source issue

05-HD/TU contains an arithmetic mismatch in its worked KPI example. The repo treats this as a formal source issue and **does not silently hard-code a correction**.

See [02-source-analysis/hd05.md](02-source-analysis/hd05.md) and [03-business/known-unknowns.md](03-business/known-unknowns.md).

Code planning details:

- [Technical stack](06-plan/technical-stack.md)
- [Milestone and ticket plan](06-plan/code-plan.md)

## Source-file handling

Original PDFs/XLSX are not committed by default because publication permission may be unclear. See [sources/README.md](sources/README.md).
