# Security architecture

```mermaid
flowchart TB
  Z0["User/device zone"] --> WAF["TLS + gateway/WAF"]
  WAF --> IAM["SSO/MFA + policy enforcement"]
  IAM --> APP["Application zone"]
  APP --> DATA["Encrypted data zone"]
  APP --> FILE["Isolated evidence store"]
  APP --> INT["Controlled integration zone"]
  APP --> AUD["Append-only audit/SIEM"]
  BAK["Encrypted backup/DR"] --> DATA
```

Controls: least privilege, network segmentation, secrets manager, secure headers/session, validation/anti-malware for upload, encryption/key rotation, backup restore drills, vulnerability/dependency scanning, patching, incident runbook, synthetic demo data.

Gates:

1. Prototype: threat model + baseline controls.
2. Pilot: formal data inventory/classification and privacy/secrecy review.
3. Production: approved ATTT level dossier/plan; approved deployment/network/integration; tested DR and incident response.

