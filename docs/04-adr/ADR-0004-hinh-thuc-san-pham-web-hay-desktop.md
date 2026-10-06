# ADR-0004 — Hình thức sản phẩm: web app hay desktop app

- **Trạng thái**: Proposed
- **Ngày**: 2026-10-06

## Bối cảnh

Chưa quyết định hệ thống sẽ là web app (dùng trình duyệt, dễ triển khai tập trung) hay desktop app (chạy nội bộ, làm việc offline). Cả hai đều có thể phục vụ quy trình phân công nhiệm vụ, nhưng khác nhau về triển khai, bảo mật và trải nghiệm.

## Quyết định

**Chưa chốt.** Giữ trạng thái Proposed cho tới khi có dữ kiện từ: văn bản CNTT/chuyển đổi số của cơ quan, điều kiện hạ tầng thực tế, và yêu cầu bảo mật đối với dữ liệu BVCTNB.

## Các phương án đã cân nhắc

| Phương án | Ưu | Nhược | Kết quả |
|---|---|---|---|
| Web app | Triển khai tập trung, cập nhật một nơi, dễ dùng đa thiết bị | Phụ thuộc hạ tầng máy chủ và mạng nội bộ | Đang xét |
| Desktop app | Dữ liệu nội bộ, có thể offline | Khó cập nhật, khó đồng bộ nhiều máy | Đang xét |

## Hệ quả

- Kiến trúc hệ thống (deployment, đồng bộ, bảo mật) chưa thể chốt cho tới khi ADR này được quyết.
- Việc cần làm: thu thập văn bản CNTT + khảo sát hạ tầng cơ quan.

## Mối liên hệ

- 05-assumptions-and-unknowns.md, 06-implementation-plan.md (decision gate)

