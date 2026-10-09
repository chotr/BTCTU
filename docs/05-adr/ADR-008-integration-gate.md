# ADR-008 — Integration behind an approval gate

**Status:** Accepted for MVP.

MVP triển khai port + fake adapter + contract test. Không gọi hệ thống thật, không dùng dữ liệu thật. Connector production chỉ được bật sau khi có QĐ607/API contract, phê duyệt phạm vi/mục đích, network/credential và security review.

