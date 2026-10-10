# ADR-008 — Real integration stays behind an approval gate

**Status:** Accepted for MVP.

## Context

QĐ607 provides a concrete OAuth 2.0 `client_credentials`/JWT/scoped-API
contract. HD07 lists a broader set of supported LGSP mechanisms/profiles
(OAuth 2.1, OIDC 2.0, SAML2, JWT Federation and mTLS), while QĐ348 and HD07
also require approved purpose/scope, test→production process, network/security
conditions and ATTT controls.

These sources describe different contract layers. Their authentication wording
must not be flattened into one interchangeable generic “OAuth2” mechanism.

Having a known API shape does **not** mean this app is authorized to call Production.

## Decision

MVP implements:

- integration port;
- fake adapter with synthetic data;
- canonical mapping registry;
- contract tests for token/error/scope behavior;
- request/correlation ID and audit.

The production adapter selects the exact authentication version/profile from
the approved endpoint/platform contract.

Real connector remains disabled until:

- exact API/data subset approved;
- purpose/scope approved;
- network/certificate/credential provisioned;
- data classification and security review passed.

## Consequence

The prototype proves architecture without exposing real personnel/protected data or falsely claiming production connectivity.
