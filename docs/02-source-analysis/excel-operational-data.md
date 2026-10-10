# SRC-13..15 — NQ11 và dữ liệu vận hành dạng Excel

## A. NQ 11-NQ/TU — chiến lược, không phải scoring spec

### Source identity

- **File:** `11-NQ-TU_dadongdau.pdf`
- **Số hiệu:** 11-NQ/TU
- **Ngày:** 10/9/2026
- **Cơ quan:** Ban Chấp hành Đảng bộ tỉnh Đắk Lắk
- Chủ đề: nâng cao năng lực lãnh đạo, sức chiến đấu của tổ chức đảng và chất lượng đội ngũ đảng viên trong giai đoạn mới.

### FACT

Nghị quyết đưa mục tiêu/chỉ tiêu giai đoạn 2026–2030 và yêu cầu chuyển đổi số như số hóa/cập nhật hồ sơ, kết nối cơ sở dữ liệu, sử dụng ứng dụng số và số hóa quy trình nghiệp vụ.

### Design impact

- Có thể dùng làm **strategic objective / OKR context**.
- Không dùng NQ11 để tự sinh công thức chấm KPI cá nhân nếu tài liệu không quy định.

---

## B. Excel cây phân công nhiệm vụ

### Source

`Cay_so_do_phan_cong_nhiem_vu_Ban_To_chuc_Tinh_uy (3).xlsx`

### FACT từ workbook

Workbook có các sheet:

- `00.Huong_dan`
- `08.Cay_nhin_ngang`
- `01.Cay_so_do_Ban`
- `02.Danh_sach_toan_Ban`
- `03.Lanh_dao_Ban`
- `04.Phong_TCCB`
- `05.Van_phong`
- `06.Phong_TCDDV`
- `07.Phong_BVCTNB`

Dữ liệu thể hiện cây tổ chức/phân công từ lãnh đạo Ban xuống phòng/chuyên viên, người quản lý trực tiếp, lĩnh vực phụ trách và có các cột/nội dung KPI/OKR đề xuất.

### Classification

**Operational/master-data draft**, không mặc định là quy định pháp lý. Tên người, phân công và KPI đề xuất cần được đối chiếu văn bản/phê duyệt hiện hành trước khi publish vào master data.

---

## C. Excel danh mục công việc

### Source

`Danh mục công việc của BTCTU 27.9.2026.xlsx`

### FACT từ workbook

Sheet `BTCTU 21.7` có các cột/nhóm dữ liệu như:

- mã nhiệm vụ/công việc;
- tên công việc;
- tên sản phẩm;
- phân nhóm/mức độ phức tạp;
- thời gian tối đa hoàn thành;
- điểm chấm;
- hệ số quy đổi;
- diễn giải.

Các nhóm lớn trong workbook:

- A — VTVL lãnh đạo/quản lý cấp phòng;
- B — VTVL chuyên môn dùng chung;
- C — VTVL chuyên môn/nghiệp vụ;
- D — công việc khác.

Workbook có công thức hệ số quy đổi dựa trên điểm chuẩn tham chiếu.

### Quan hệ với 05-HD/TU

Cấu trúc workbook **phù hợp về hình thức** với Phụ lục 1 của 05-HD/TU: sản phẩm/công việc, độ phức tạp, thời gian, điểm/hệ số.

Tuy nhiên:

> Không suy ra rằng mọi điểm/hệ số trong workbook đã được phê duyệt chính thức chỉ vì cấu trúc phù hợp với hướng dẫn.

## INFERENCE / import design

```text
Raw workbook (immutable)
        ↓
Import staging
        ↓ validate/normalize
Review + source reconciliation
        ↓
WorkCatalogVersion: DRAFT
        ↓ approve/publish
WorkCatalogVersion: ACTIVE
```

Giữ lịch sử version; Task cũ trỏ đúng catalog version đã dùng.

## TBD

- Chủ thể/cấp có thẩm quyền phê duyệt hai workbook.
- Ngày hiệu lực và version chính thức.
- Công thức hệ số/điểm nào được giữ nguyên sau khi xử lý mâu thuẫn nguồn 05-HD.
