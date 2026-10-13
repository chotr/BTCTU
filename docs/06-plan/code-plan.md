# Kế hoạch code

## Mốc 0 — Spike kiến trúc

Mục tiêu: chứng minh stack trước khi code nghiệp vụ.

- tạo pnpm workspace với `apps/web`, `apps/api`, `packages/*`;
- dựng trang Next.js gọi `/health` của API Express;
- thiết lập biến môi trường và kiểu cấu hình;
- thử xác thực access token (JWT);
- migration DB quan hệ đầu tiên, lưu trữ tệp riêng và luồng job nền;
- CI lint/typecheck/test/build;
- ghi kết quả compatibility/deployment vào ADR.

**Exit:** preview deploy chạy đầu-cuối bằng dữ liệu giả; không có tính năng nghiệp vụ.

## Mốc 1 — Nền tảng xuyên suốt

- request/correlation ID và structured error;
- ánh xạ actor/identity;
- interface policy uỷ quyền;
- envelope sự kiện audit;
- abstraction clock/ID;
- primitive tham chiếu nguồn + version/effective-date;
- test builder và fixture synthetic.

**Exit:** một protected mutation có validation, permission, ghi DB và kiểm thử audit.

## Mốc 2 — Vertical slice tổ chức

Backend:

- tổ chức, đơn vị, nhân sự, membership, tham chiếu vị trí;
- tham chiếu trách nhiệm/nguồn;
- list/detail/create/update cho master data được phép;
- history/effective dates.

Frontend:

- organization tree;
- trang đơn vị/thành viên;
- badge nguồn FACT/INFERENCE/TBD;
- hành động theo quyền.

**Nguồn:** QĐ01.  
**Exit:** truy vết được dữ liệu khởi tạo về Điều 2–7; chưa có Task taxonomy giả.

## Mốc 3 — Danh mục công việc và phân công

- bộ nhập liệu Excel offline → staging JSON → validation report;
- version/draft/publish danh mục công việc;
- task + assignment + assignee/assigner;
- inbox/outbox;
- audit phân công lại/hủy;
- optimistic concurrency.

**Nguồn:** QĐ01 Điều 7.2 + 05-HD/TU Phụ lục 1 + Excel vận hành/draft.

**Rule:** không cần chờ Excel được xác nhận chính thức mới code importer/catalog.
Excel được import vào staging/DRAFT; chỉ version đã được review/phê duyệt mới
được publish với trạng thái chính thức.

**Exit:** kiểm thử phân công bằng catalog chờ phê duyệt và hiển thị rõ trạng thái/version.

## Mốc 4 — Kết quả/sản phẩm/minh chứng

- draft/submit kết quả;
- metadata sản phẩm;
- luồng upload/download lưu trữ tệp riêng cho dữ liệu synthetic;
- checksum/phân loại/trạng thái;
- trả lại để chỉnh sửa;
- kiểm thử quyền với file.

**Nguồn:** 05-HD/TU đã xác nhận mô hình công việc/sản phẩm/kết quả ở mức nghiệp vụ.

**TBD/gate production:** nội dung minh chứng thật có được lưu trong app hay chỉ giữ
tham chiếu đến DMS/kho tài liệu được phê duyệt.

**Exit:** form kết quả/sản phẩm chạy bằng dữ liệu kiểm thử (synthetic), không chứa tài liệu bí mật nhà nước.

## Mốc 5 — Tính KPI

- kỳ đánh giá;
- `ScoringRuleVersion` / phiên bản tiêu chí/công thức;
- snapshot đầu vào tính;
- lần tính tất định;
- phân rã giải thích;
- điều chỉnh thủ công kèm lý do/audit.

**Nguồn đã xác nhận:** 05-HD/TU cung cấp cấu trúc 30 + 70 và A/B/C/D cho
lãnh đạo/quản lý.

**Không block implementation:** INC-01 (sai khác số học trong ví dụ)
không chặn triển khai engine. Nó chỉ chặn việc publish/activate rule bị ảnh hưởng
dưới trạng thái `OFFICIAL/ACTIVE`.

**TBD:** công thức chính thức cho người không giữ chức vụ lãnh đạo/quản lý,
làm tròn và một số trường hợp biên.

**Exit:** golden test cho từng công thức ứng viên/đã phê duyệt và các trường hợp biên/làm tròn.

## Mốc 6 — Quy trình đánh giá/xếp loại

- tự đánh giá;
- hàng đợi/nhận xét/trả lại của người thẩm định;
- quy tắc xếp loại;
- phê duyệt của cấp có thẩm quyền;
- chính sách khóa/mở lại kỳ;
- dòng thời gian chuyển đổi/audit.

**Nguồn:** 05-HD/TU + QĐ39/TU đã xác nhận các stage khái niệm,
ngưỡng xếp loại và điều kiện bổ sung.

**TBD:** mapping chính xác thẩm quyền/nhóm so sánh/hạn mức trong BTCTU và
quy trình mở lại nội bộ.

**Exit:** kiểm thử bảng chuyển đổi + kiểm thử quyền + kiểm thử concurrency.

## Mốc 7 — Dashboard/báo cáo

- tiến độ đơn vị/cá nhân;
- tổng hợp KPI/xếp loại;
- chỉ báo quá hạn/thiếu minh chứng nếu nguồn cho phép;
- chính sách xuất CSV/PDF;
- sinh báo cáo nền qua job nền;
- kiểm thử phạm vi dữ liệu để chống rò rỉ.

**Exit:** dashboard số liệu khớp truy vấn đối soát.

## Mốc 8 — Contract tích hợp

- sổ đăng ký ánh xạ canonical theo QĐ308;
- contract/profile theo QĐ607;
- fake adapter + contract tests;
- test riêng hành vi OAuth 2.0 `client_credentials`/JWT của QĐ607;
- giữ boundary riêng cho profile LGSP được phê duyệt theo HD07;
- lần đồng bộ, checkpoint, error/dead-letter, đối soát;
- request ID, mục đích, allowlist trường và audit.

**Đã biết từ source:** contract API QĐ607, hành vi 401/403, ràng buộc TLS/logging,
và yêu cầu tích hợp của HD07.

**Chưa biết:** endpoint production, tập API con được cấp, credentials, tuyến mạng,
chứng chỉ/profile cụ thể.

Không bật endpoint thật nếu thiếu phê duyệt/mạng/credential/cổng bảo mật.

## Mốc 9 — Tăng cường

- threat model, giới hạn tần suất, chính sách WAF/Access;
- diễn tập sao lưu/khôi phục và runbook DR;
- quét phụ thuộc/SAST/secret;
- load test các query/dashboard;
- xuất/giám sát/cảnh báo audit;
- checklist ATTT/pháp lý và phê duyệt triển khai.

## Thứ tự ticket cho sprint đầu

1. `ARCH-001` — workspace, TypeScript strict, lint/test/build.
2. `API-001` — Express `/health`, cấu hình môi trường.
3. `WEB-001` — vỏ Next.js, điều hướng và API client được sinh.
4. `DB-001` — Drizzle + migration DB quan hệ + smoke test repository.
5. `AUTH-001` — trình xác thực JWT Access + adapter kiểm thử cục bộ.
6. `SEC-001` — middleware uỷ quyền + kiểm thử deny-by-default.
7. `AUD-001` — envelope audit + request ID.
8. `ORG-001` — schema organization/department và API.
9. `ORG-002` — schema person/membership/position-reference và API.
10. `ORG-003` — UI tổ chức + truy vết nguồn.
11. `CI-001` — preview deploy + Playwright smoke.

Sprint đầu dừng ở Organization. Task/KPI không được kéo vào trước foundation;
nhưng implementation không bị chặn chỉ vì rule/catalog chính thức chưa được
activate — dùng `DRAFT/CANDIDATE` và truy vết nguồn rõ ràng.
