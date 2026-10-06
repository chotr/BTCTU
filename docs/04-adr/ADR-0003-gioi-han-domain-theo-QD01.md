# ADR-0003 — Giới hạn domain model theo QĐ01

- **Trạng thái**: Accepted
- **Ngày**: 2026-10-06

## Bối cảnh

QĐ01 mới cung cấp: tổ chức, chức năng, nhiệm vụ, cơ cấu thành phần, và một quy tắc phân công. QĐ01 **không** cung cấp: task model, danh mục vị trí việc làm, công thức KPI, workflow đánh giá.

## Quyết định

Chỉ mô hình hóa các tầng có căn cứ: `Organization → Department → Function/Responsibility → Employee` và một `Assignment` skeleton. Mọi thứ khác (JobPosition master, Task, KPI, Evaluation, Approval, Classification) để placeholder, chờ 05-HD/TU và 39-QĐ/TU.

## Hệ quả

- Tránh phát minh nghiệp vụ; không tốn công dựng mô hình sai.
- Khi có tài liệu mới, mô hình mở rộng theo đúng vết nguồn.
- Đánh đổi: giai đoạn đầu sản phẩm mỏng; phải nói rõ với người xem đây là ranh giới có chủ đích.

## Mối liên hệ

- 05-assumptions-and-unknowns.md, 06-implementation-plan.md

