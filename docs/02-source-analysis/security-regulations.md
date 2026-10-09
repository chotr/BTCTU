# SRC-09..12 — ATTT, bí mật nhà nước và dữ liệu

## FACT đã kiểm chứng

| Nguồn | FACT | Tác động trực tiếp |
|---|---|---|
| NĐ 85/2016/NĐ-CP | Hệ thống phải được xác định cấp độ và có hồ sơ/phương án ATTT theo cấp độ; các cấp 1–5 dựa trên loại thông tin và mức ảnh hưởng | Không tự tuyên bố cấp độ; lập hồ sơ xác định cấp độ trước production |
| NĐ 63/2026/NĐ-CP | Ban hành 28/02/2026, hiệu lực 01/03/2026, quy định chi tiết Luật Bảo vệ bí mật nhà nước | Cần quy trình phân loại, xử lý, truyền, lưu, tiêu hủy theo bản PDF/phụ lục |
| NĐ 165/2025/NĐ-CP | Ban hành 30/06/2025, hiệu lực 01/07/2025, quy định chi tiết và thi hành Luật Dữ liệu | Data governance/quality/sharing phải rà điều khoản áp dụng trước production |
| NĐ 278/2025/NĐ-CP | Ban hành và hiệu lực 22/10/2025; kết nối/chia sẻ dữ liệu bắt buộc giữa cơ quan hệ thống chính trị | Integration không chỉ là kỹ thuật; cần căn cứ, danh mục, đầu mối và trách nhiệm |

## INFERENCE / SECURITY BASELINE

- Deny-by-default RBAC + data scope; MFA cho privileged/sensitive access.
- TLS in transit, encryption at rest, managed secrets, backups/restore test.
- Append-only audit; correlation ID; log access, export, approval, lock/unlock và integration.
- Tách vùng dữ liệu BVCTNB/sức khỏe; không dùng dữ liệu thật trong demo; che/mã hóa trường nhạy cảm.
- Threat modeling, SAST/dependency scan, patching, incident runbook và least privilege.

Đây là baseline của ứng viên, không phải câu chữ của các nghị định.

## TBD / LEGAL GATES

- Cấp độ HTTT được phê duyệt; loại dữ liệu nào là bí mật nhà nước và độ mật; retention; hạ tầng/mạng được phép; chủ quản/đơn vị vận hành/chuyên trách ATTT.
- Cần rà toàn văn và phụ lục NĐ63, NĐ165, NĐ278 bằng legal/security review trước khi chuyển từ prototype sang production.

Nguồn: [NĐ85](https://vbpl.moj.gov.vn/bothongtin/Pages/vbpq-van-ban-goc.aspx?ItemID=112057), [NĐ63](https://vanban.chinhphu.vn/?docid=217093&pageid=27160), [NĐ165](https://vanban.chinhphu.vn/?docid=214331&pageid=27160), [NĐ278](https://vanban.chinhphu.vn/?docid=215682&pageid=27160).

