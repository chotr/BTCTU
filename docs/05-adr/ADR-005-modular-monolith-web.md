# ADR-005 — Web modular monolith

**Status:** Accepted for prototype.

**Decision:** responsive web UI + modular monolith + relational database + worker/outbox. Giữ boundary module rõ nhưng deploy một unit.

**Reason:** bài test cần vertical slice và traceability hơn là chi phí microservice. Web phù hợp truy cập đa máy/quản trị tập trung; môi trường production vẫn TBD.

**Consequence:** nhanh demo/test; phải enforce module ownership để tránh “big ball of mud”.

