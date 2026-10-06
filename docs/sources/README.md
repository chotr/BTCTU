# docs/sources — File văn bản gốc

Nơi đặt file PDF/bản scan của các văn bản nghiệp vụ dùng cho phân tích.

## Cảnh báo trước khi commit

- Chỉ đưa file vào repo khi **được phép chia sẻ công khai**. Văn bản nội bộ của cơ quan cần xác nhận quyền công bố trước.
- Nếu không thể công khai: giữ file ngoài repo, ghi đường dẫn nội bộ vào bảng đăng ký dưới đây, và không commit nội dung.

## Quy ước đặt tên

```text
<số-hiệu>-<mô-tả-ngắn>.pdf
Ví dụ: 01-QD-BTCTU-chuc-nang-nhiem-vu-co-cau-to-chuc.pdf
```

## Bảng đăng ký file

| ID nguồn | Văn bản | File | Trạng thái |
|---|---|---|---|
| SRC-01 | 01-QĐ/BTCTU — Chức năng, nhiệm vụ và cơ cấu tổ chức | (chưa có) | ⏳ Chờ file |
| SRC-02 | 05-HD/TU | (chưa có) | ⏳ Chờ tài liệu |
| SRC-03 | 39-QĐ/TU | (chưa có) | ⏳ Chờ tài liệu |
| SRC-04 | Văn bản an ninh / BVCTNB | (chưa xác định) | ⏳ Chờ tài liệu |
| SRC-05 | Văn bản CNTT / chuyển đổi số | (chưa xác định) | ⏳ Chờ tài liệu |

## Sau khi đưa file vào repo

1. Đối chiếu các trích dẫn trong [QD01-chuc-nang-nhiem-vu-co-cau-to-chuc.md](../01-source-analysis/QD01-chuc-nang-nhiem-vu-co-cau-to-chuc.md) với toàn văn.
2. Điền số điều khoản vào các dòng `[TBD: đối chiếu]` và vào [responsibility-catalog.md](../02-business-domain/responsibility-catalog.md).
3. Chuyển nhãn các mục đã đối chiếu thành `[FACT]` và cập nhật [05-assumptions-and-unknowns.md](../05-assumptions-and-unknowns.md) (TBD-01, TBD-02).

