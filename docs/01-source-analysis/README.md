# 01 — Phân tích nguồn văn bản

Thư mục này lưu kết quả phân tích từng văn bản nghiệp vụ. Nguyên tắc: **mỗi văn bản một file**, **mỗi phát biểu một nhãn** `[FACT]` / `[INFERENCE]` / `[TBD]`.

## Sổ đăng ký nguồn

| ID nguồn | Văn bản | Vai trò dự kiến | Trạng thái | File phân tích |
|---|---|---|---|---|
| SRC-01 | 01-QĐ/BTCTU — Chức năng, nhiệm vụ và cơ cấu tổ chức các phòng thuộc BTCTU | Tổ chức, chức năng, nhiệm vụ, quy tắc phân công | ✅ Đã phân tích | [QD01-chuc-nang-nhiem-vu-co-cau-to-chuc.md](QD01-chuc-nang-nhiem-vu-co-cau-to-chuc.md) |
| SRC-02 | 05-HD/TU | Task, sản phẩm công việc, chiều chấm điểm, cách tính KPI (dự kiến) | ⏳ Chưa có tài liệu | — |
| SRC-03 | 39-QĐ/TU | Quy trình đánh giá, xếp loại, phê duyệt (dự kiến) | ⏳ Chưa có tài liệu | — |
| SRC-04 | Văn bản an ninh / BVCTNB | Phân quyền truy cập, bảo mật hồ sơ nhạy cảm | ⏳ Chưa xác định | — |
| SRC-05 | Văn bản CNTT / chuyển đổi số | Kiến trúc triển khai, hạ tầng | ⏳ Chưa xác định | — |

## Quy trình phân tích một văn bản

```text
1. Trích xuất     → câu/quy định gốc, kèm số điều khoản
2. Phân loại      → FACT (văn bản nói) / INFERENCE (ta suy ra) / TBD
3. Design impact  → khái niệm domain, module, bảng dữ liệu bị ảnh hưởng
4. Traceability   → văn bản → rule → domain → module → dữ liệu
5. Known/Unknown  → cập nhật bảng ở 05-assumptions-and-unknowns.md
```

## Việc cần làm tiếp

- Đưa file PDF gốc vào repo (đề xuất thư mục `docs/sources/`, kèm xác nhận quyền chia sẻ) `[TBD]`
- Xem hướng dẫn và quy ước đặt tên tại [docs/sources/README.md](../sources/README.md)
- Đối chiếu số điều khoản trích dẫn với toàn văn PDF trước khi coi là chính thức `[TBD]`
- Bổ sung phân tích SRC-02, SRC-03 ngay khi có tài liệu
