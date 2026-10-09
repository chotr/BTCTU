# ADR-008 — Real integration stays behind an approval gate

**Status:** Accepted for MVP.

## Context

QĐ607 now provides an API contract pattern (OAuth2 client credentials/JWT/scoped APIs), while QĐ348 and HD07 require approved purpose/scope, test→production process, network/security conditions and ATTT controls.

Having a known API shape does **not** mean this app is authorized to call Production.

## Decision

MVP implements:

- integration port;
- fake adapter with synthetic data;
- canonical mapping registry;
- contract tests for token/error/scope behavior;
- request/correlation ID and audit.

Real connector remains disabled until:

- exact API/data subset approved;
- purpose/scope approved;
- network/certificate/credential provisioned;
- data classification and security review passed.

## Consequence

The prototype proves architecture without exposing real personnel/protected data or falsely claiming production connectivity.
