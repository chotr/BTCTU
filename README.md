# BTCTU — Hệ thống quản lý nhiệm vụ & đánh giá

Ứng dụng nội bộ quản lý xuyên suốt quy trình **nhiệm vụ → KPI → đánh giá → xếp loại** cho Ban Tổ chức Tỉnh ủy.

## Trạng thái phiên bản

Phiên bản `1.0.0` sẵn sàng cho môi trường phát triển:

- Next.js 16 + React 19 cho giao diện;
- Express.js trên Node cho REST API;
- phân quyền theo vai trò, audit, snapshot, khóa/mở kỳ và xuất báo cáo;
- dữ liệu khởi tạo cục bộ được cô lập trong `apps/web/src/lib/mock/`;
- hợp đồng HTTP và cấu hình môi trường đã sẵn sàng để thay adapter cục bộ bằng API;
- các quy tắc nghiệp vụ chưa được phê duyệt vẫn có trạng thái kiểm soát rõ ràng.

Mock chỉ là nguồn dữ liệu tạm thời trong quá trình hoàn thiện API, không phải kiến trúc lưu trữ đích.

## Khởi chạy

Yêu cầu Node.js 22 và pnpm 10.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

- Web: `http://localhost:3000`
- API: `http://localhost:8787`
- OpenAPI: `http://localhost:8787/openapi.json`

Có thể chạy riêng từng phần:

```bash
pnpm dev:web
pnpm dev:api
```

Sao chép `apps/web/.env.example` thành `apps/web/.env.local` nếu cần thay cấu hình mặc định. Không commit `.env.local`, `.dev.vars` hoặc khóa bí mật.

## Kiểm tra trước khi bàn giao

```bash
pnpm check
```

Lệnh này chạy typecheck, unit/contract test và production build. E2E chạy riêng:

```bash
pnpm --filter @btctu/web test:e2e
```

## Cấu trúc

- `apps/web` — giao diện và application layer;
- `apps/api` — REST contract, validation, auth boundary và runtime Express/Node;
- `docs` — yêu cầu, phân tích nguồn, nghiệp vụ, kiến trúc, ADR và runbook nghiệm thu.

Đọc [docs/README.md](docs/README.md) để đi vào bộ tài liệu hoặc [apps/web/README.md](apps/web/README.md) để cấu hình môi trường phát triển.

## Nguyên tắc kỹ thuật

Mọi phát biểu quan trọng được phân loại:

- **FACT** — có nguồn trực tiếp;
- **INFERENCE** — thiết kế cần phê duyệt;
- **TBD** — chưa có quyết định;
- **SOURCE INCONSISTENCY** — nguồn có xung đột hoặc sai khác.

Ứng dụng không tự biến một giả định phân tích thành quy tắc đánh giá chính thức.
