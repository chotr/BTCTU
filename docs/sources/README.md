# File nguồn gốc

Phân tích được thực hiện từ các file nguồn được cung cấp trong nội dung trao đổi/workspace.

## Chính sách kho công khai

Các PDF/XLSX gốc **không được tự động commit** tại đây.

Lý do:

- quyền phân phối lại/công bố có thể chưa rõ;
- một số workbook chứa tên/phân công vận hành;
- tài liệu về sau có thể chứa dữ liệu được bảo vệ hoặc nhạy cảm.

Do đó kho công khai lưu:

- định danh nguồn;
- tham chiếu trang/mục;
- phân tích phái sinh FACT/INFERENCE/TBD;
- không lưu nội dung file nguồn không cần thiết.

Nếu quyền công bố được xác nhận rõ ràng, file nguồn có thể được thêm kèm metadata
checksum/version.

## Danh mục nguồn đã rà soát

Xem [../02-source-analysis/README.md](../02-source-analysis/README.md).

Các file cốt lõi đã rà soát gồm:

- 01-QĐ/BTCTU;
- 05-HD/TU;
- 39-QĐ/TU;
- 342-QĐ/BTCTW;
- 348-QĐ/BTCTW + bộ triển khai 1638-CV/TU tại địa phương;
- 607-QĐ/BTCTW;
- 308-QĐ/VPTW;
- 07-HD/VPTW;
- NĐ85/2016;
- NĐ63/2026 + phụ lục;
- NĐ165/2025;
- NĐ278/2025;
- NQ11/TU;
- hai workbook Excel vận hành;
- đề bài gốc và các tài liệu bối cảnh dự án.

## Quy tắc toàn vẹn nguồn

Trước khi dùng cho production, sổ đăng ký nguồn nên lưu thêm:

- checksum tài liệu;
- phiên bản/ngày hiệu lực;
- quan hệ bị thay thế bởi;
- thời điểm phê duyệt/rà soát;
- chuyên viên/người rà soát.
