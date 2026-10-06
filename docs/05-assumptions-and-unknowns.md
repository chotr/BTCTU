# 05 — Giả định và câu hỏi mở

## 1. Bảng Known / Unknown

| Khái niệm | Trạng thái | Nguồn |
|---|---|---|
| Department | ✅ Known | QĐ01 |
| Department responsibility | ✅ Known | QĐ01 |
| Trưởng phòng/Chánh VP phân công việc | ✅ Known | QĐ01 |
| "Vị trí việc làm" tồn tại | ✅ Known (được nhắc) | QĐ01 |
| Danh mục vị trí việc làm | ❓ Unknown | Không có trong QĐ01 |
| Task structure / states | ❓ Unknown | Không có trong QĐ01 |
| KPI formula | ❓ Unknown | Không có trong QĐ01 |
| Approval flow | ❓ Unknown | Không có trong QĐ01 |

## 2. Sổ giả định (Assumptions)

| Mã | Giả định | Cơ sở | Rủi ro nếu sai | Trạng thái |
|---|---|---|---|---|
| ASM-01 | Hệ thống sẽ phục vụ toàn Ban, bắt đầu từ việc số hóa tổ chức + phân công | Quy tắc phân công QĐ01 | Phạm vi thực tế khác | Chưa xác nhận |
| ASM-02 | 05-HD/TU định nghĩa Task/KPI; 39-QĐ/TU định nghĩa đánh giá/xếp loại | Kế hoạch phân tích ban đầu | Có thể có văn bản khác thay thế | Chưa xác nhận |
| ASM-03 | Dữ liệu BVCTNB cần phân vùng truy cập riêng | Tính nhạy cảm của hồ sơ BVCTNB trong QĐ01 | Mức độ phân quyền thực tế khác | Chưa xác nhận |
| ASM-04 | Văn phòng giữ vai trò tổng hợp, đôn đốc trong hệ thống báo cáo | Nhiệm vụ Văn phòng trong QĐ01 | Vai trò thực tế có thể khác | Chưa xác nhận |

## 3. Câu hỏi mở (Open questions)

| Mã | Câu hỏi | Chặn việc gì | Cần nguồn nào |
|---|---|---|---|
| Q-01 | Danh mục vị trí việc làm gồm những gì? | JobPosition master, gắn việc đúng vị trí | Văn bản về vị trí việc làm |
| Q-02 | Task được định nghĩa thế nào (loại, trạng thái, sản phẩm)? | Task Management | 05-HD/TU |
| Q-03 | KPI tính ra sao (công thức, trọng số, thang điểm)? | KPI Management | 05-HD/TU |
| Q-04 | Quy trình đánh giá, xếp loại, phê duyệt thế nào? | Evaluation & Approval | 39-QĐ/TU |
| Q-05 | Phân quyền dữ liệu BVCTNB thế nào? | Security & Access Control | Văn bản an ninh |
| Q-06 | Triển khai web hay desktop, on-premise hay thuê? | Deployment architecture | Văn bản CNTT + khảo sát |
| Q-07 | Có cần tích hợp hệ thống CNTT hiện có của Tỉnh ủy không? | Integration design | Văn bản CNTT |

## 4. Sổ TBD (đăng ký việc phải làm rõ)

| Mã | Mục | Hiện trạng | Nguồn dự kiến | Người chốt dự kiến |
|---|---|---|---|---|
| TBD-01 | Đối chiếu trích dẫn QĐ01 với toàn văn PDF | Chờ file PDF vào repo | File PDF gốc | Người phân tích |
| TBD-02 | Số điều khoản cho từng dòng responsibility catalog | Chưa điền | Toàn văn QĐ01 | Người phân tích |
| TBD-03 | Phân tích 05-HD/TU | Chưa có tài liệu | File văn bản | Người phân tích |
| TBD-04 | Phân tích 39-QĐ/TU | Chưa có tài liệu | File văn bản | Người phân tích |
| TBD-05 | Chốt hình thức sản phẩm (ADR-0004) | Proposed | Văn bản CNTT + thực tế | Lãnh đạo dự án |

## 5. Quy tắc vận hành

- Mỗi khi có văn bản mới: chạy lại quy trình ở [01-source-analysis](01-source-analysis/README.md), chuyển nhãn TBD → FACT cho đúng mục.
- Một câu hỏi mở nằm yên quá lâu và không chặn gì → hạ ưu tiên, ghi rõ lý do.
- Trước buổi bảo vệ, rà soát lại toàn bộ bảng này để trả lời được "cái gì anh chưa biết và anh sẽ làm gì để biết".

