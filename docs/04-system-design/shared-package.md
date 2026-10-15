# Gói contract dùng chung

Thư mục `packages/shared` (tên gói `@btctu/shared`) chứa những gì cả web và API
cùng phụ thuộc như một contract. Nó không chứa mô hình triển khai của bất kỳ phía
nào.

## Cấu trúc

```text
packages/shared/src
├── constants/   giá trị chạy được: ROLES, TASK_STATUSES, EVALUATION_STATUSES,
│                CLASSIFICATIONS, AUTHORIZATION_ACTIONS
├── domain/      kiểu suy ra từ constants: Role, TaskStatus, EvaluationStatus,
│                Classification, AuthorizationAction
├── api/         DTO của contract HTTP: AuthenticatedUser, LoginRequest,
│                LoginResponseData, ApiEnvelope, ProblemResponse,
│                ACCOUNT_STATUSES, ApiErrorCode
└── index.ts     gộp ba nhóm trên
```

Ba lối vào phụ: `@btctu/shared`, `@btctu/shared/constants`, `@btctu/shared/domain`,
`@btctu/shared/api`. Mỗi hằng chỉ được khai báo một lần trong `constants/`, kiểu
trong `domain/` suy ra từ chính hằng đó, nên không thể lệch nhau.

## Ranh giới

Tiêu chí: share khi hai ứng dụng cùng phụ thuộc vào **một contract**; không share
khi chỉ giống nhau tình cờ hoặc là chi tiết triển khai của một phía.

| Đưa vào shared                                         | Để nguyên tại chỗ                                  |
| ------------------------------------------------------ | -------------------------------------------------- |
| mã vai trò, trạng thái, xếp loại (có ý nghĩa contract) | schema Drizzle và mô hình bảng                     |
| DTO request/response của API                           | repository, service                                |
| mã lỗi public (problem+json)                           | middleware Express                                 |
| danh sách hành động uỷ quyền                           | quy tắc uỷ quyền (quyết định ai được làm gì)       |
|                                                        | cookie nội bộ, secret, cấu hình môi trường của API |
|                                                        | kiểu trình bày thuần React, nhãn tiếng Việt        |

Nhãn hiển thị ("Lãnh đạo Ban", "Đã nghiệm thu") không nằm trong shared: đó là văn
bản trình bày, không phải contract dữ liệu. Web giữ chúng ở
`apps/web/src/lib/types/`.

Uỷ quyền tách làm hai phần: `AuthorizationAction` được share vì hai bên phải gọi
cùng tên hành động; còn `AUTHORIZATION_RULES` chỉ nằm ở
`apps/api/src/middleware/authorization.ts`. Web dùng action để quyết định hiển thị,
API dùng để thực thi.

## Trạng thái nhiệm vụ: canonical và phần mở rộng của web

`TASK_STATUSES` trong shared là danh sách canonical, gồm đúng 5 giá trị mà API ghi
và đọc: ASSIGNED, IN_PROGRESS, SUBMITTED, RETURNED, ACCEPTED. Trạng thái còn chờ
nghiệp vụ xác nhận thì không đưa vào contract, để contract không mô tả những thứ
hệ thống chưa làm.

Web đang dùng thêm ba trạng thái cho giao diện và khai báo cục bộ ở
`apps/web/src/lib/types/task.ts`:

- `REVIEWED` — nhóm chờ thẩm định (`TASK_IN_REVIEW`);
- `LOCKED` — nhóm đã nghiệm thu/chốt (`TASK_DONE`);
- `CANCELLED` — bộ lọc báo cáo và luồng trả lại.

Kiểu phía web là `TaskStatus = ApiTaskStatus | WebOnlyTaskStatus`, nên khi API bổ
sung trạng thái thật thì chỉ cần bỏ nó khỏi phần mở rộng. Cần nghiệp vụ chốt hai
câu hỏi trước: nhiệm vụ có huỷ được không, và "đã thẩm định" là trạng thái của
nhiệm vụ hay chỉ là bước của hồ sơ đánh giá. [TBD]

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
- Hằng số đường dẫn API: chưa share, vì mới có một phía gọi.

## Mã lỗi

`API_ERROR_CODES` trong `@btctu/shared/api` là danh sách mã lỗi public, kiểu
`ApiErrorCode` suy ra từ đó. API nhận đúng kiểu này ở hàm dựng problem+json, nên
thêm một mã mới bắt buộc khai báo trong shared trước; API không thể phát ra mã chưa
được định nghĩa.

Frontend chưa rẽ nhánh theo mã, hiện chỉ đọc `detail` và `requestId`. Danh sách
này để sẵn cho lúc web chuyển sang xử lý theo mã lỗi.
