# ADR-005 — Giao diện web + backend modular monolith

**Trạng thái:** Accepted.

## Quyết định

Dùng một ứng dụng web responsive với **hai đơn vị triển khai**:

1. `apps/web` — frontend Next.js;
2. `apps/api` — backend Hono triển khai như một ứng dụng modular monolith.

Backend giữ ranh giới module rõ ràng như Organization, Task, Evaluation,
Classification, IAM/Policy và Audit, nhưng các module backend đó không được triển
khai như microservices riêng biệt.

Hệ thống dùng mô hình dữ liệu quan hệ và các background job/outbox khi cần.

## Lý do

Hệ thống này hưởng lợi từ một vertical slice đầu-cuối, khả năng truy vết và vận hành
đơn giản hơn là từ độ phức tạp của microservice.

Tách web và API mang lại:

- một contract API rõ ràng;
- bàn giao frontend/backend độc lập;
- dễ tích hợp với client/hệ thống khác về sau.

Giữ backend là một modular monolith mang lại:

- chi phí triển khai/vận hành thấp;
- nhất quán giao dịch cho luồng nhiệm vụ/đánh giá;
- quyền sở hữu module rõ ràng mà không tách service quá sớm.

## Ranh giới production

ADR này quyết định **cấu trúc ứng dụng**, không phải nền tảng hosting production
cuối cùng.

Lựa chọn hosting/mạng/cơ sở dữ liệu/object-storage cho production vẫn phụ thuộc vào
đánh giá cấp độ bảo mật, phân loại dữ liệu, phạm vi bí mật nhà nước, phê duyệt hạ
tầng và yêu cầu tích hợp.

## Hệ quả

- không mô tả toàn hệ thống là “một đơn vị triển khai”;
- backend Hono chính là modular monolith;
- thực thi ranh giới module để tránh backend rối như “big ball of mud”;
- chỉ tách một module thành service riêng khi có yêu cầu thực tế về scale, quyền sở
  hữu hoặc tích hợp biện minh cho việc đó.
