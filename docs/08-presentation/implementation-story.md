# Implementation story — presenting the solution

## Thesis

The strongest part of this system is not the number of screens. It is the ability to turn fragmented regulations into a traceable system **without converting assumptions into rules**.

## 10-slide outline

1. **Problem**
   - internal task/KPI/evaluation system for BTCTU;
   - source material is fragmented across organization, evaluation, data and security documents.

2. **Method**
   - FACT / INFERENCE / TBD;
   - source register + traceability matrix.

3. **Organization**
   - QĐ01 → four departments, functions/responsibilities, assignment responsibility.

4. **Work → KPI**
   - 05-HD + Excel + QĐ308;
   - work/product catalog → actual task → result → A/B/C/D → 30/70.

5. **Why the source was not coded blindly**
   - show the 05-HD worked-example arithmetic inconsistency;
   - explain source issue → gate → versioned rule + test.

6. **Evaluation/classification**
   - QĐ39: score bands + mandatory conditions + authority;
   - score is not the final decision.

7. **Architecture**
   - web modular monolith;
   - domain/module/ERD;
   - source-traceable versions.

8. **Security/data**
   - QĐ342 + NĐ85/63/165/278;
   - contextual permission, audit, development seed data, no state-secret content.

9. **Integration**
   - QĐ308/607/348/HD07;
   - authoritative SOR + mock adapter now, approved LGSP connector later.

10. **Acceptance flow + limitations**
   - end-to-end flow;
   - clearly list unresolved non-manager formula, monthly aggregation, production approval/data scope.

## Five key design decisions

1. **Web modular monolith, not microservices**
   - internal small-user system; centralized updates; low operational burden.

2. **Version rules/catalogs**
   - regulation/catalog changes must not rewrite historical scores.

3. **Classification is a decision pipeline**
   - threshold + conditions + authority; not `if score >= 90`.

4. **External personnel data remains authoritative elsewhere**
   - connector/mapping rather than duplicate source of truth.

5. **Development environment excludes real protected data**
   - security/compliance is evidenced through design and controls, not by risking sensitive data.

## Common review questions

### “Why not just average the employee scores for a department?”

Because the assignment and regulations treat collective/tập thể as an evaluation subject. The department has its own functions/tasks/products. No reviewed source says department score equals employee average.

### “Why not automate 100%?”

Because classification still includes competent-authority decision and mandatory conditions. QĐ342 also requires human accountability; AI cannot be the sole basis for personnel decisions.

### “A formula error was found in the source. What happens?”

Record it narrowly as a **worked-example arithmetic inconsistency**. Do not
claim that the official formula is wrong, do not silently choose a result;
request clarification, version the approved rule and lock it with tests.

### “Why no real integration?”

The connector requires approved purpose/scope, credentials/network, security level and data classification. A mock adapter proves architecture without violating those gates.

### “What is still unknown?”

Show `known-unknowns.md`. Knowing what is not justified is part of the engineering quality.
