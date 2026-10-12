# Đối soát audit nguồn

Ghi chú này lưu lại việc đối soát bản chụp tài liệu với các file PDF/XLSX được
cung cấp cùng nội dung trao đổi của dự án. Đây là vết audit, không phải nguồn
quy tắc nghiệp vụ mới.

## Các phát hiện cũ đã giải quyết

| Claim cũ | Kết quả đối soát | Phân tích chuẩn |
|---|---|---|
| 05-HD/TU không có sẵn và quy tắc KPI hoàn toàn TBD | Đã rà soát PDF được cung cấp. Cấu trúc 30 + 70, KPI A/B/C/D cho lãnh đạo/quản lý và các bước quý là FACT. | [05-HD/TU](hd05.md), [Mô hình KPI](../03-business/evaluation-kpi-model.md) |
| 39-QĐ/TU không có sẵn và chưa xác nhận quy tắc xếp loại | Đã rà soát PDF được cung cấp. Dải điểm 90/70/50 là FACT, nhưng điều kiện bắt buộc, yếu tố chặn, thẩm quyền và hạn mức Xuất sắc cũng phải được đánh giá. | [39-QĐ/TU](qd39.md), [quy tắc xếp loại](../03-business/classification-rules.md) |
| Không kiểm tra được QĐ607/API | Đã rà soát `A81-VBNB_2026-QĐ-0607-2026_dadongdau.pdf`; phạm vi dữ liệu chia sẻ/API và ràng buộc xác thực đã được ghi nhận. | [QĐ607](qd607.md) |
| Hai file Excel vận hành không có sẵn | Đã kiểm tra cả hai workbook được cung cấp. Chúng định hướng thiết kế nhập tổ chức/danh mục nhưng không tự động là nguồn quy tắc pháp lý hay đã phê duyệt. | [Dữ liệu Excel vận hành](excel-operational-data.md) |
| NĐ63/165/278 chỉ có metadata | Đã rà soát các văn bản được cung cấp và trích xuất các ràng buộc liên quan về bảo mật tài liệu, quản trị dữ liệu và chia sẻ bắt buộc. | [NĐ63](nd63.md), [NĐ165](nd165.md), [NĐ278](nd278.md), [tổng hợp bảo mật](security-regulations.md) |
| QĐ308 thiếu trường nhiệm vụ và ngữ nghĩa SOR | Phân tích nay ghi nhận `MaNhiemVu`, `TenNhiemVu`, nguyên tắc metadata và hàm ý System of Record. | [QĐ308](qd308.md) |
| QĐ342 dựa vào xuất xứ từ web ngoài | Phân tích chuẩn trích dẫn PDF được cung cấp theo điều/trang và không dùng bản sao web thay thế. | [QĐ342](qd342.md) |
| Domain map và kế hoạch triển khai bị chặn vì “thiếu 05/39” | Cả hai nguồn nay đã có trong mô hình phụ thuộc. Các cổng còn lại thu hẹp về làm rõ nghiệp vụ cụ thể. | [domain map](../03-business/domain-map.md), [kế hoạch triển khai](../06-plan/implementation-plan.md) |
| Cây tài liệu cũ và chuẩn cùng tồn tại | Cây chuẩn là `00` đến `08`; các cây/file cũ trùng lặp đã được xóa. | [mục lục tài liệu](../README.md) |

## SOURCE INCONSISTENCY được giữ lại — sai khác số học trong ví dụ

Ví dụ trong 05-HD/TU in:

```text
30 + (82,3% × 70) = 80,3
```

Kết quả số học là `87,61`. Đây cụ thể là sai khác trong ví dụ, không phải bằng
chứng rằng công thức chính thức hay toàn bộ văn bản nguồn là sai. Dự án không âm
thầm chọn một trong hai con số làm quy tắc chính thức. Dự án ghi nhận sai khác,
giữ quy tắc chấm điểm theo phiên bản và yêu cầu xác nhận nghiệp vụ trước khi tuyên
bố triển khai chính thức.

## Các TBD còn lại sau đối soát

- cách xử lý sai khác số học trong ví dụ của 05-HD/TU đã được phê duyệt;
- công thức chấm điểm chính thức cho công chức không giữ chức vụ lãnh đạo/quản lý;
- nhóm so sánh chính xác trong BTCTU cho hạn mức Xuất sắc theo QĐ39;
- thẩm quyền/phiên bản có hiệu lực của hai workbook vận hành;
- phân loại dữ liệu sản xuất, thời hạn lưu giữ, ranh giới bí mật nhà nước và phê
  duyệt cấp độ bảo đảm an toàn HTTT chính thức;
- phê duyệt tích hợp thật, endpoint, credentials, tuyến mạng và tập dữ liệu được phép;
- quy trình mở lại/chỉnh sửa cục bộ sau khi quyết định đánh giá đã công bố.

Các mục này vẫn là **TBD** vì nguồn được cung cấp không giải quyết quyết định
triển khai cục bộ, hoặc vì cần cấp có thẩm quyền phê duyệt.
