# SRC-09..12 — Tổng hợp quy định ATTT, bí mật nhà nước và dữ liệu

> File này là **cross-source summary**. Chi tiết từng nguồn nằm ở `nd85.md`, `nd63.md`, `nd165.md`, `nd278.md`.

## FACT tổng hợp

| Nguồn | FACT liên quan trực tiếp tới thiết kế |
|---|---|
| NĐ 85/2016/NĐ-CP | HTTT phải xác định cấp độ theo loại thông tin/chức năng/mức ảnh hưởng; cấp 2 và cấp 3 có tiêu chí khác nhau, trong đó hệ thống xử lý bí mật nhà nước thuộc tiêu chí cấp 3 |
| NĐ 63/2026/NĐ-CP + Phụ lục | Quy định xử lý văn bản/tài liệu điện tử bí mật nhà nước: xác định độ mật, sao/chụp, giao nhận, thu hồi, mang ra ngoài, hội họp và các mẫu/sổ liên quan |
| NĐ 165/2025/NĐ-CP | Quản trị dữ liệu gồm phân loại, truy cập/truy xuất, ghi nhận lịch sử, xác thực dữ liệu, mã hóa và vòng đời xóa/hủy |
| NĐ 278/2025/NĐ-CP | Kết nối/chia sẻ dữ liệu bắt buộc giữa cơ quan trong hệ thống chính trị phải đúng mục đích/phạm vi, có metadata/catalog, kiểm soát truy cập, giám sát và quản trị chất lượng |

## Kết luận cho prototype

### FACT + constraint

- Nếu hệ thống thực tế **xử lý bí mật nhà nước**, tiêu chí NĐ85 dẫn tới phạm vi cấp 3 và quy trình bảo vệ tài liệu thay đổi đáng kể.
- Nếu hệ thống kết nối LGSP theo QĐ348/HD07, các nguồn chuyên ngành còn yêu cầu hệ thống kết nối bảo đảm ATTT **tối thiểu cấp độ 3**.

### INFERENCE / candidate baseline

Prototype nên:

- dùng dữ liệu synthetic;
- không chứa nội dung tài liệu bí mật nhà nước;
- deny-by-default; RBAC + data scope + purpose;
- MFA cho privileged/sensitive access;
- mã hóa in transit / at rest;
- append-only/tamper-evident audit;
- backup/restore test;
- secure upload/reference thay vì biến app thành full DMS;
- threat model, SAST/dependency scan, vulnerability management và incident runbook.

### TBD / legal gate

**Không tuyên bố “hệ thống đã được xác định cấp độ 3”.** Cấp độ chính thức cần hồ sơ, phạm vi dữ liệu, chức năng, hạ tầng và phê duyệt của cấp có thẩm quyền.

Design target cho production-connected scenario có thể chuẩn bị control baseline cấp 3, nhưng đó là **engineering target**, không phải kết luận phê duyệt pháp lý.
