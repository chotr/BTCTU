# Phân tích nguồn — sổ đăng ký nguồn

## Quy tắc

Mỗi phân tích nguồn phải tách bạch:

- **FACT** — nguồn xác nhận trực tiếp;
- **INFERENCE** — diễn giải phần mềm/domain;
- **TBD** — chưa giải quyết hoặc cần cấp có thẩm quyền;
- **SOURCE INCONSISTENCY** — bản thân văn bản nguồn mâu thuẫn/có lỗi;
- **SOURCE DIVERGENCE** — các nguồn mô tả khác tầng contract, version hoặc
  phạm vi; không được mặc định là tương đương/thay thế lẫn nhau.

## Sổ đăng ký nguồn

`Đã rà soát từ file được cung cấp` nghĩa là phân tích dùng PDF/XLSX được cung cấp
cùng nội dung trao đổi của dự án. Không có nghĩa là mọi quyết định vận hành cần
thiết để triển khai chính thức đều đã được phê duyệt.

| ID | Nguồn/file | Vai trò trong dự án | Trạng thái căn cứ |
|---|---|---|---|
| SRC-01 | [01-QĐ/BTCTU](qd01.md) | tổ chức, chức năng, trách nhiệm, trách nhiệm phân công | Đã rà soát từ PDF được cung cấp |
| SRC-02 | [05-HD/TU](hd05.md) | danh mục công việc/sản phẩm, KPI, đánh giá quý | Đã rà soát từ PDF được cung cấp; ghi nhận một sai khác số học trong ví dụ |
| SRC-03 | [39-QĐ/TU](qd39.md) | xếp loại, điều kiện, thẩm quyền, quy trình | Đã rà soát từ PDF được cung cấp |
| SRC-04 | [342-QĐ/BTCTW](qd342.md) | kiến trúc, định danh, truy cập, audit, dữ liệu/bảo mật, AI | Đã rà soát từ PDF được cung cấp |
| SRC-05 | [348-QĐ/BTCTW + 1638-CV/TU](qd348.md) | kết nối/chia sẻ, bối cảnh triển khai tại địa phương | Đã rà soát từ các PDF được cung cấp |
| SRC-06 | [607-QĐ/BTCTW](qd607.md) | dữ liệu chia sẻ + contract API | Đã rà soát từ `A81-VBNB_2026-QĐ-0607-2026_dadongdau.pdf` |
| SRC-07 | [308-QĐ/VPTW](qd308.md) | từ điển dữ liệu dùng chung, `MaNhiemVu`, `TenNhiemVu`, SOR | Đã rà soát từ PDF được cung cấp |
| SRC-08 | [07-HD/VPTW](hd07.md) | tích hợp LGSP/bảo mật/vòng đời API | Đã rà soát từ PDF được cung cấp |
| SRC-09 | [NĐ85/2016](nd85.md) | tiêu chí cấp độ bảo đảm an toàn HTTT | Đã rà soát từ PDF được cung cấp |
| SRC-10 | [NĐ63/2026 + PL](nd63.md) | xử lý tài liệu bí mật nhà nước | Đã rà soát từ PDF được cung cấp và phụ lục |
| SRC-11 | [NĐ165/2025](nd165.md) | quản trị dữ liệu/truy cập/mã hóa/vòng đời | Đã rà soát từ PDF được cung cấp |
| SRC-12 | [NĐ278/2025](nd278.md) | quản trị chia sẻ dữ liệu bắt buộc | Đã rà soát từ PDF được cung cấp |
| SRC-13 | [NQ11/TU](nq11.md) | bối cảnh chiến lược/chuyển đổi số | Đã rà soát từ PDF được cung cấp |
| SRC-14 | [File Excel vận hành](excel-operational-data.md) | dữ liệu seed/nháp cho tổ chức/danh mục công việc | Đã kiểm tra cả hai workbook được cung cấp; bằng chứng vận hành, không phải thẩm quyền pháp lý |
| SRC-15 | [Bối cảnh dự án](project-context.md) | bối cảnh dự án và mục lục nguồn | Đã phân loại |
| CROSS | [Tổng hợp quy định bảo mật](security-regulations.md) | kết luận bảo mật liên-nguồn | Đã đối soát từ SRC-09..12 |

## Quy tắc thẩm quyền nguồn

Các file được cung cấp cùng bài kiểm tra/workspace là căn cứ phân tích. Không thay
nguồn được cung cấp bằng bản tóm tắt của công cụ tìm kiếm hay bản sao web không
liên quan.

Các PDF/XLSX gốc **không được commit vào kho công khai này theo mặc định** vì
quyền phân phối lại phải được xác nhận. Kho lưu giữ phân tích phái sinh cùng định
danh nguồn/tham chiếu trang.

Do đó trạng thái ở trên nói về **xuất xứ rà soát**, không phải quyền phân phối lại.
Thiếu file nhị phân trong Git không được báo là “nguồn không có” khi file được
cung cấp đã được rà soát ngoài kho.

Vết audit từ claim cũ tới kết quả hiện tại được duy trì trong
[audit-reconciliation.md](audit-reconciliation.md).

## Vấn đề nguồn chưa giải quyết quan trọng nhất

Ví dụ trong 05-HD/TU:

```text
30 + 82,3% × 70
```

được in là `80,3`, trong khi số học cho `87,61`. Điều này được ghi nhận hẹp là
**sai khác số học trong ví dụ**; nó không chứng minh công thức chính thức là sai.

Xem [hd05.md](hd05.md). Đây vẫn là cổng làm rõ nghiệp vụ trước khi tuyên bố một
triển khai chấm điểm chính thức.
