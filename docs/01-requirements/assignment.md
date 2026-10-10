# Assignment and delivery boundary

## Original problem

The competency test asks the candidate to:

1. build quantitative KPI/OKR criteria for individuals and departments by month/quarter/year;
2. build software for staff/department/position, tasks/KPI, result tracking, automatic scoring/classification, aggregation, permissions/approval, history, search/report/export, dashboard and draft reports/decisions;
3. determine the information-system security level with legal/practical basis and propose security/cybersecurity/data/state-secret controls.

The candidate may add appropriate useful/creative functions.

## Project goal

Build a **defensible prototype** and engineering dossier that can trace:

```text
source
→ business fact/rule
→ domain model
→ architecture decision
→ feature/test/demo
```

## MVP vertical slice

`organization → person/position → work catalog → assignment → result/product/evidenceRef → KPI → self evaluation → review → classification → final decision → lock → audit → dashboard/report`

## Evidence convention

- `[FACT]`: source says it directly.
- `[INFERENCE]`: candidate interpretation/design.
- `[TBD]`: insufficient basis/needs authority.
- `[SOURCE-INCONSISTENCY]`: source itself conflicts or appears arithmetically inconsistent.

## Delivery rules

- Excel is operational/master-data draft unless approval/effect is proven.
- A legal/security requirement is not “implemented” merely because a diagram mentions it.
- Prototype uses synthetic data.
- Real protected data/LGSP integration is out of MVP until approved.
- Department/tập thể and person/cá nhân are separate evaluation subjects.
- Source discrepancy and non-manager KPI formula must remain visible limitations until resolved.

## Definition of done for design phase

1. Core source files reviewed and registered.
2. Source→rule→design traceability matrix exists.
3. Business/domain/C4/ERD/security/integration diagrams exist.
4. Known/unknown/source inconsistency register is current.
5. Implementation plan has dependency gates.
6. Demo story clearly distinguishes implemented, designed, and TBD capabilities.
