# BTCTU — Hệ thống quản lý nhiệm vụ và đánh giá (KPI)

Repository cho dự án phần mềm phục vụ **Ban Tổ chức Tỉnh ủy (BTCTU)**: quản lý tổ chức, nhiệm vụ của các phòng, và tiến tới đánh giá mức độ hoàn thành nhiệm vụ (KPI) của từng phòng, từng cá nhân.

## Trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| Phân tích nguồn văn bản | QĐ01 đã phân tích; 05-HD/TU, 39-QĐ/TU: chờ tài liệu |
| Thiết kế hệ thống | Khung sơ bộ, tách rõ fact / inference / TBD |
| Code ứng dụng | Chưa bắt đầu |
| Hình thức sản phẩm (web app / desktop app) | Chưa chốt — xem ADR-0004 |

## Tài liệu

Toàn bộ tài liệu phân tích nghiệp vụ và thiết kế kiến trúc nằm trong [docs/](docs/README.md), hiện được phát triển trên nhánh `docs/architecture`:

- [docs/README.md](docs/README.md) — bản đồ điều hướng, đọc trước tiên
- [docs/00-overview.md](docs/00-overview.md) — tổng quan dự án
- [docs/01-source-analysis/](docs/01-source-analysis/README.md) — phân tích văn bản nguồn (QĐ01…)
- [docs/02-business-domain/](docs/02-business-domain/organization-model.md) — miền nghiệp vụ
- [docs/03-architecture/](docs/03-architecture/architecture-overview.md) — kiến trúc hệ thống
- [docs/04-adr/](docs/04-adr/README.md) — hồ sơ quyết định kiến trúc (ADR)
- [docs/05-assumptions-and-unknowns.md](docs/05-assumptions-and-unknowns.md) — giả định & câu hỏi mở
- [docs/06-implementation-plan.md](docs/06-implementation-plan.md) — kế hoạch triển khai
- [docs/07-demo-and-presentation.md](docs/07-demo-and-presentation.md) — kế hoạch demo/bảo vệ

## Nhánh

| Nhánh | Mục đích |
|---|---|
| `main` | Trang chủ repo; sẽ nhận code ứng dụng về sau |
| `docs/architecture` | Phát triển tài liệu phân tích nghiệp vụ & kiến trúc |

