# Gói hợp đồng dùng chung

Thư mục `packages/shared` (tên gói `@btctu/shared`) chứa những gì cả web và API
cùng phụ thuộc như một hợp đồng. Nó không chứa mô hình triển khai của bất kỳ phía
nào.

## Cấu trúc

```text
packages/shared/src
├── constants/   giá trị chạy được: ROLES, TASK_STATUSES, EVALUATION_STATUSES,
│                CLASSIFICATIONS, AUTHORIZATION_ACTIONS
├── domain/      kiểu suy ra từ constants: Role, TaskStatus, EvaluationStatus,
│                Classification, AuthorizationAction
├── api/         DTO của hợp đồng HTTP: AuthenticatedUser, LoginRequest,
│                LoginResponse, ApiEnvelope, ProblemResponse, ACCOUNT_STATUSES
└── index.ts     gộp ba nhóm trên
```

Ba lối vào phụ: `@btctu/shared`, `@btctu/shared/constants`, `@btctu/shared/domain`,
`@btctu/shared/api`. Mỗi hằng chỉ được khai báo một lần trong `constants/`, kiểu
trong `domain/` suy ra từ chính hằng đó, nên không thể lệch nhau.

## Ranh giới

Tiêu chí: share khi hai ứng dụng cùng phụ thuộc vào **một hợp đồng**; không share
khi chỉ giống nhau tình cờ hoặc là chi tiết triển khai của một phía.

| Đưa vào shared | Để nguyên tại chỗ |
|---|---|
| mã vai trò, trạng thái, xếp loại (có ý nghĩa hợp đồng) | schema Drizzle và mô hình bảng |
| DTO request/response của API | repository, service |
| mã lỗi public (problem+json) | middleware Express |
| danh sách hành động uỷ quyền | quy tắc uỷ quyền (quyết định ai được làm gì) |
| | cookie nội bộ, secret, cấu hình môi trường của API |
| | kiểu trình bày thuần React, nhãn tiếng Việt |

Nhãn hiển thị ("Lãnh đạo Ban", "Đã nghiệm thu") không nằm trong shared: đó là văn
bản trình bày, không phải hợp đồng dữ liệu. Web giữ chúng ở
`apps/web/src/lib/types/`.

Uỷ quyền tách làm hai phần: `AuthorizationAction` được share vì hai bên phải gọi
cùng tên hành động; còn `AUTHORIZATION_RULES` chỉ nằm ở
`apps/api/src/middleware/authorization.ts`. Web dùng action để quyết định hiển thị,
API dùng để thực thi.

## Chênh lệch trạng thái nhiệm vụ

Đây là ví dụ gói dùng chung làm lộ ra vấn đề ngay khi gộp:

- `TASK_STATUSES` trong shared có 8 giá trị: ASSIGNED, IN_PROGRESS, SUBMITTED,
  RETURNED, REVIEWED, ACCEPTED, LOCKED, CANCELLED;
- API hiện chỉ ghi và đọc 5 giá trị đầu;
- web đã dùng REVIEWED (nhóm chờ thẩm định), LOCKED (nhóm đã nghiệm thu) và
  CANCELLED (bộ lọc báo cáo, luồng trả lại).

Danh sách 8 giá trị được ghi vào hợp đồng để hai bên cùng nhìn một chỗ, nhưng API
chưa có luồng tương ứng cho ba trạng thái cuối. Cần nghiệp vụ xác nhận danh sách
cuối (nhiệm vụ có huỷ được không, "đã thẩm định" là trạng thái nhiệm vụ hay chỉ là
bước của hồ sơ đánh giá) trước khi API triển khai. [TBD]

## Cách dùng

Cả hai ứng dụng khai báo phụ thuộc `"@btctu/shared": "workspace:*"` và import trực
tiếp:

```ts
import { ROLES } from "@btctu/shared";
import type { Classification, TaskStatus } from "@btctu/shared";
```

Gói phát hành ở dạng mã TypeScript, không có bước build riêng: web khai báo
`transpilePackages: ["@btctu/shared"]` trong `next.config.ts`, API chạy bằng tsx nên
biên dịch tại chỗ. Kiểm tra kiểu của gói: `pnpm --filter @btctu/shared typecheck`.

Trong môi trường phát triển hiện tại, `node_modules/@btctu/shared` của hai app là
junction trỏ về `packages/shared` để không phải cài lại. Lần `pnpm install` kế tiếp
sẽ thay junction bằng liên kết chuẩn của workspace.

## Chưa chuyển

- DTO nhiệm vụ và đánh giá: hai bên đang khác shape (web có `evidence`, `history`,
  snapshot; API chỉ có trường lõi), nên chỉ share phần trạng thái và xếp loại.
  Muốn share DTO thì phải thu hẹp mô hình web hoặc mở rộng mô hình API trước. [TBD]
- Hằng số đường dẫn API và mã lỗi dạng hằng: mới share kiểu `ProblemResponse`, chưa
  share danh sách mã lỗi. [TBD]
