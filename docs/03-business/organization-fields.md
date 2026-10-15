# Kiểm kê trường dữ liệu tổ chức — theo QĐ01

Bản này để chuẩn bị cho ORG-001: liệt kê trường nào nguồn QĐ01 chứng minh được,
trường nào là diễn giải phần mềm, và trường nào còn TBD. Đây là bản đối chiếu nguồn,
không phải thiết kế bảng — không có tên cột, kiểu dữ liệu hay ràng buộc nào ở đây.

Nhãn theo quy ước ở [02-source-analysis/README.md](../02-source-analysis/README.md):
`[FACT]` nguồn xác nhận trực tiếp, `[INFERENCE]` diễn giải phần mềm, `[TBD]` cần
cấp có thẩm quyền.

## Nền FACT từ QĐ01

- [FACT] Bốn đơn vị trực thuộc Ban Tổ chức Tỉnh ủy: Phòng Tổ chức đảng, đảng viên;
  Phòng Tổ chức cán bộ; Phòng Bảo vệ chính trị nội bộ; Văn phòng. Nguồn: Điều 2–6.
- [FACT] Mỗi đơn vị được mô tả theo chức năng, nhiệm vụ và cơ cấu tổ chức. Nguồn:
  Điều 2–6.
- [FACT] Cơ cấu thành phần: ba phòng gồm Trưởng phòng, Phó Trưởng phòng, công chức;
  Phòng Bảo vệ chính trị nội bộ thêm cán bộ công an biệt phái; Văn phòng gồm Chánh
  Văn phòng, Phó Chánh Văn phòng, công chức, người lao động. Nguồn: Điều 2–6.
- [FACT] Trưởng phòng/Chánh Văn phòng phân công nhiệm vụ cho công chức, người lao
  động của phòng, gắn với vị trí việc làm. Nguồn: Điều 7.
- [FACT] Văn bản nhắc “vị trí việc làm” nhưng không cung cấp danh mục vị trí, và nói
  rõ phần thành phần không phải danh mục vị trí việc làm đầy đủ.

## Đơn vị

| Trường ứng viên     | Nghĩa                                   | Căn cứ                                                                                                          | Trạng thái                                                                  |
| ------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| tên đơn vị          | tên nguyên văn của bốn đơn vị           | QĐ01 Điều 2–6                                                                                                   | [FACT]                                                                      |
| cấp trên trực tiếp  | Ban Tổ chức Tỉnh ủy                     | QĐ01 sơ đồ tổ chức                                                                                              | [FACT]                                                                      |
| chức năng, nhiệm vụ | phần chức năng/nhiệm vụ của từng đơn vị | QĐ01 Điều 2–6                                                                                                   | [FACT] về nội dung; cách mô hình hóa là [INFERENCE]                         |
| thành phần          | loại vị trí thuộc đơn vị                | QĐ01 Điều 2–6                                                                                                   | [FACT] — nhưng thuộc nhóm vị trí bên dưới, không phải thuộc tính của đơn vị |
| mã đơn vị           | mã ngắn để tham chiếu                   | QĐ01 không có; Excel vận hành có tên sheet `04.Phong_TCCB`, `05.Van_phong`, `06.Phong_TCDDV`, `07.Phong_BVCTNB` | [TBD] — bản nháp vận hành, cần đối chiếu trước khi dùng làm mã              |
| nhãn hiển thị ngắn  | ví dụ “Tổ chức Đảng”, “Bảo vệ CTNB”     | không có trong nguồn                                                                                            | [INFERENCE] — chỉ để hiển thị                                               |

## Con người

QĐ01 không cung cấp trường nào về cá nhân; nó chỉ nêu loại thành phần. Vì vậy không
có trường nào của nhóm này là [FACT] từ QĐ01.

| Trường ứng viên                               | Nghĩa                          | Căn cứ                                                  | Trạng thái                                                             |
| --------------------------------------------- | ------------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| định danh người                               | khoá ổn định cho một cá nhân   | QĐ01 không có                                           | [TBD] — chờ master nhân sự chủ quản (Q-01)                             |
| họ tên, chức danh hiển thị                    | tên và chức danh của cá nhân   | QĐ01 chỉ cho loại chức danh, không cho cá nhân          | [TBD]                                                                  |
| nguồn nhân sự biệt phái                       | cán bộ công an biệt phái       | QĐ01 nêu trong cơ cấu của Phòng Bảo vệ chính trị nội bộ | [INFERENCE] nếu ghi thành thuộc tính của người; [TBD] cho hồ sơ thật   |
| vai trò `lanh_dao`/`truong_phong`/`cong_chuc` | phân loại vai trò cho uỷ quyền | thiết kế phần mềm, chưa phải ma trận được phê duyệt     | [INFERENCE] — xem [permissions.md](../04-system-design/permissions.md) |
| danh tính đăng nhập                           | gắn tài khoản với nhân sự      | QĐ01 không có                                           | [TBD] — bảng `users` hiện chưa gắn danh mục nhân sự                    |

## Quan hệ người – đơn vị – vị trí

| Trường ứng viên             | Nghĩa                               | Căn cứ                                                                             | Trạng thái                                   |
| --------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------- |
| người                       | ai thuộc phòng                      | “công chức, người lao động của phòng”                                              | [FACT] về quan hệ; định danh người là [TBD]  |
| đơn vị                      | người đó thuộc phòng nào            | QĐ01 Điều 7                                                                        | [FACT]                                       |
| vị trí việc làm             | người đó giữ vị trí nào             | “gắn với vị trí việc làm”, Điều 7                                                  | [FACT] về quan hệ; danh mục vị trí là [TBD]  |
| khoảng thời gian            | giữ vị trí từ ngày nào tới ngày nào | QĐ01 không nêu                                                                     | [TBD]                                        |
| chuyên trách hay kiêm nhiệm | mức tham gia                        | QĐ01 không nêu                                                                     | [TBD]                                        |
| người quản lý trực tiếp     | ai phân công cho ai                 | QĐ01 nói trưởng phòng phân công; cây quản lý trực tiếp chỉ có trong Excel vận hành | [INFERENCE] với căn cứ SRC-14, cần đối chiếu |
| lĩnh vực phụ trách          | mảng công việc được giao            | chỉ có trong Excel vận hành                                                        | [TBD]                                        |

## Vị trí việc làm

| Trường ứng viên                | Nghĩa                                                                                                                     | Căn cứ                                                                   | Trạng thái                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| tên chức danh                  | Trưởng phòng, Phó Trưởng phòng, công chức, cán bộ công an biệt phái, Chánh Văn phòng, Phó Chánh Văn phòng, người lao động | QĐ01 Điều 2–6, phần cơ cấu thành phần                                    | [FACT] ở mức thành phần, không phải danh mục vị trí việc làm đầy đủ |
| đơn vị sở hữu chức danh        | Chánh Văn phòng thuộc Văn phòng, Trưởng phòng thuộc từng phòng                                                            | QĐ01 Điều 2–6                                                            | [FACT]                                                              |
| mã vị trí, ngạch/bậc, nhóm A–D | mã và phân nhóm vị trí                                                                                                    | QĐ01 không có; Excel danh mục công việc có nhóm A–D                      | [TBD] — Excel là bản nháp (INC-03)                                  |
| quan hệ báo cáo                | vị trí nào báo cáo vị trí nào                                                                                             | QĐ01 không nêu                                                           | [TBD]                                                               |
| cờ lãnh đạo/quản lý            | phục vụ công thức KPI                                                                                                     | QĐ01 không nêu; 05-HD và đề bài phân biệt lãnh đạo/quản lý với công chức | [INFERENCE] — căn cứ thuộc nguồn khác                               |

## Ngày hiệu lực

| Trường ứng viên              | Nghĩa                                     | Căn cứ                    | Trạng thái                  |
| ---------------------------- | ----------------------------------------- | ------------------------- | --------------------------- |
| số hiệu văn bản nguồn        | 01-QĐ/BTCTU                               | QĐ01 phần định danh nguồn | [FACT]                      |
| ngày ban hành văn bản nguồn  | 28/11/2025                                | QĐ01 phần định danh nguồn | [FACT]                      |
| hiệu lực của đơn vị          | một phòng tồn tại từ ngày nào             | QĐ01 không nêu            | [TBD]                       |
| hiệu lực của quan hệ nhân sự | người giữ vị trí từ ngày nào              | QĐ01 không nêu            | [TBD] — thuộc hồ sơ nhân sự |
| hiệu lực của vị trí          | vị trí được lập hoặc thay đổi từ ngày nào | QĐ01 không nêu            | [TBD]                       |

## Truy vết nguồn

| Trường ứng viên   | Nghĩa                                                | Căn cứ                                                                    | Trạng thái                                         |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------- |
| tham chiếu nguồn  | ví dụ “QĐ01, Điều 3”                                 | quy ước ở [traceability-matrix.md](traceability-matrix.md)                | [FACT] về giá trị; hình dạng trường là [INFERENCE] |
| phân loại căn cứ  | FACT / INFERENCE / TBD                               | quy ước ở [02-source-analysis/README.md](../02-source-analysis/README.md) | [FACT]                                             |
| định danh văn bản | 01-QĐ/BTCTU, Ban Tổ chức Tỉnh ủy Đắk Lắk, 28/11/2025 | QĐ01 phần định danh nguồn                                                 | [FACT]                                             |
| dấu vết nhập liệu | bản ghi nào đến từ Excel nháp, nhập lúc nào          | cần cho staging theo SRC-14                                               | [INFERENCE]                                        |

## QĐ01 không cung cấp

- mã đơn vị và mã nhân sự;
- danh mục vị trí việc làm đầy đủ;
- quan hệ báo cáo và uỷ quyền;
- ngày hiệu lực của đơn vị, vị trí và phân công;
- dữ liệu cá nhân: họ tên, định danh, danh tính đăng nhập, trình độ, thâm niên.

Các mục này nằm trong Q-01 của [known-unknowns.md](known-unknowns.md): master vị trí
việc làm và phân công có hiệu lực chưa có, và nó đang chặn master tổ chức/nhân sự có
thẩm quyền.

## Đối chiếu với dữ liệu mẫu đang chạy

Dữ liệu mẫu trong `apps/api/src/mock-state.ts` và `apps/web/src/lib/mock/` có một
số trường chưa có căn cứ QĐ01. Giữ chúng cho bản phát triển là hợp lý, nhưng không
nên chuyển thẳng thành schema chính thức khi chưa có nguồn:

| Đang dùng                                       | Căn cứ thật                                                       |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| mã đơn vị `TCĐ-ĐV`, `TCCB`, `BVCTNB`, `VP`      | QĐ01 không có; Excel vận hành có tên viết tắt gần tương ứng       |
| nhãn ngắn “Tổ chức Đảng”, “Bảo vệ CTNB”         | nhãn hiển thị, [INFERENCE]                                        |
| vai trò `lanh_dao`, `truong_phong`, `cong_chuc` | thiết kế phần mềm, chưa được phê duyệt                            |
| “Lãnh đạo Ban” như một người trong danh mục     | QĐ01 không nêu cá nhân; Excel vận hành có sheet `03.Lanh_dao_Ban` |
| mã vị trí dạng `pos-head-tccb`                  | ví dụ mẫu, [INFERENCE]                                            |

## Việc cần chốt trước khi dựng schema

1. Master nhân sự và vị trí chủ quản là hệ thống nào, trao đổi qua API hay tệp, và
   định danh người lấy từ đâu (Q-01)?
2. Mã đơn vị lấy từ đâu và ai phê duyệt?
3. ORG-001 có lưu lịch sử phân công kèm ngày hiệu lực ngay không, hay để trống và bổ
   sung khi có hồ sơ nhân sự?
4. Cán bộ công an biệt phái là thuộc tính của người, của vị trí, hay của quan hệ?

## Quyết định đã chốt cho ORG-001

Bốn câu hỏi trên đã được chốt. Bản ghi này để mã nguồn và tài liệu không đi lệch
nhau:

| Câu hỏi                                                          | Kết luận                                                                                                                                   | Trạng thái                                     |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Master nhân sự/vị trí ở đâu, API hay tệp, định danh người từ đâu | Chưa xác định hệ thống chủ quản, giao thức đồng bộ hay mã cán bộ chuẩn. Dùng UUID nội bộ; không lấy họ tên hay email làm khoá nghiệp vụ    | [TBD]                                          |
| Mã đơn vị lấy từ đâu                                             | QĐ01 xác nhận tên, không xác nhận mã. Chuỗi ngắn trong Excel chỉ là bí danh hiển thị                                                       | tên = [FACT], mã = [TBD]                       |
| Có lưu lịch sử phân công và ngày hiệu lực ngay không             | Schema hỗ trợ ngay, nhưng để trống ngày khi nhập: workbook là ảnh chụp tại một thời điểm, không chứng minh ngày bắt đầu của từng phân công | schema = [INFERENCE], ngày cụ thể = [TBD]      |
| Cán bộ công an biệt phái thuộc đâu                               | Là loại quan hệ nhân sự trong cơ cấu, không phải thuộc tính của người hay của vị trí                                                       | [FACT] về quan hệ, ánh xạ vào DB = [INFERENCE] |

Đã dựng, migration `0005_org_core.sql`:

| Bảng                   | Trường                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `departments`          | `id`, `name` ([FACT]), `short_name` (bí danh vận hành), `official_code` ([TBD]), `created_at`                                              |
| `people`               | `id` (UUID nội bộ), `name`, `external_id` ([TBD]), `source_ref`, `created_at`                                                              |
| `positions`            | `id`, `title`, `external_id` ([TBD]), `created_at`                                                                                         |
| `position_assignments` | `id`, `person_id`, `position_id`, `department_id`, `assignment_type`, `valid_from`, `valid_to`, `source_ref`, `source_class`, `created_at` |

Ràng buộc đang áp dụng: `assignment_type` là enum Postgres hai giá trị
`STAFF`/`SECONDMENT` và không có giá trị mặc định, vì gán ngầm `STAFF` cho một
người biệt phái là ghi sai nguồn; `valid_from` và `valid_to` cho phép NULL; ba
tham chiếu trong `position_assignments` đều `ON DELETE RESTRICT`; không bảng nào
đặt ràng buộc duy nhất trên tên người hay tên chức danh.

Chưa nằm trong schema, để bổ sung khi cần:

- `slug` đọc được cho đơn vị: chưa endpoint nào cần, thêm sau là thay đổi cộng thêm;
- `source_snapshot_at`: workbook không nêu mốc thời gian của chính nó, nên cột đó
  sẽ chỉ chứa thời điểm nhập, trùng với `created_at`;
- thực thể cho Ban và quan hệ cấp trên của bốn phòng: danh sách chốt mới có bốn đơn vị;
- các cột `Cấp`, `Cấp quản lý trực tiếp`, `Lĩnh vực/nhiệm vụ phụ trách`, `KPI/OKR`,
  `Ghi chú` của workbook: chưa bảng nào nhận, nên giữ ở staging khi nhập.
