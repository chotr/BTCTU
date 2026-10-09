# ADR-009 — Source inconsistencies block “official” rule publication

**Status:** Accepted.

## Context

05-HD/TU contains a worked example where the printed final arithmetic does not match the formula inputs.

Regulatory/business sources may also be clarified or superseded over time.

## Decision

A rule can be published as `OFFICIAL/ACTIVE` only when:

- source reference is recorded;
- arithmetic/interpretation is internally consistent;
- unresolved source issues are cleared or explicitly approved by competent business authority;
- unit tests encode the approved behavior;
- rule version/effective period are fixed.

Prototype may run a `CANDIDATE` rule for demonstration, but UI/report must label it.

## Consequence

The application never silently converts a suspected typo or analyst guess into an official personnel-evaluation rule.
