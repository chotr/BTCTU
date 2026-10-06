# 07 — Kế hoạch demo và bảo vệ dự án

> Mục tiêu: nhà tuyển dụng thấy **chuỗi suy luận** chứ không chỉ thấy một app CRUD.

## 1. Câu chuyện bảo vệ (story arc)

```text
Văn bản → Phân tích → Business rule → Domain → Architecture → Database → Code → Demo
```

Mỗi bước đều có bằng chứng trong repo:

| Bước | Bằng chứng |
|---|---|
| Văn bản | 01-source-analysis/QD01… |
| Phân tích | fact/inference/TBD trong từng file |
| Business rule | quy tắc phân công, catalog |
| Domain | 02-business-domain |
| Architecture | 03-architecture + ADR |
| Database | 03-architecture/data-model.md |
| Code | (sau P5) |
| Demo | kịch bản dưới đây |

## 2. Deck 8–12 slide

1. Problem — Ban cần quản lý nhiệm vụ theo đúng quy định
2. Requirement — tóm tắt từ QĐ01
3. Cách tôi phân tích văn bản — quy trình 5 bước
4. Business domain — sơ đồ tổ chức + capability map
5. Core workflow — phân công gắn vị trí việc làm
6. Domain model — 3 tầng chốt + placeholder
7. System architecture — module boundary + context diagram
8. Security — phân vùng dữ liệu BVCTNB (định hướng)
9. Key technical decisions — ADR-0001..0004
10. Demo — kịch bản P5
11. Limitations / assumptions — bảng Known/Unknown
12. Future development — P6, P7

## 3. Kịch bản demo MVP (P5)

1. Đăng nhập vai Trưởng phòng → xem sơ đồ phòng, danh mục nhiệm vụ (từ catalog).
2. Trưởng phòng phân công một nhiệm vụ cho công chức, gắn vị trí việc làm (đúng rule QĐ01).
3. Công chức xem việc được giao.
4. Văn phòng xem báo cáo tổng hợp (định hướng từ vai trò đầu mối).
5. Nêu rõ: phần KPI/chấm điểm chưa có vì chưa có 05-HD/TU — đây là **quyết định có chủ đích**, không phải thiếu sót.

## 4. Điểm nhấn trả lời phỏng vấn

- "Tôi không bịa nghiệp vụ": chỉ ra bảng Known/Unknown và nhãn TBD.
- "Tôi có traceability": một business rule bất kỳ → chỉ về điều khoản QĐ01.
- "Tôi có ranh giới thiết kế": 3 module chốt từ QĐ01, phần còn lại chờ nguồn.
- "Tôi biết cái gì chưa biết": đọc thẳng mục Open questions.

## 5. Câu hỏi phỏng vấn dự kiến & hướng trả lời

| Câu hỏi | Hướng trả lời |
|---|---|
| Sao chưa có mô hình Task/KPI? | QĐ01 không định nghĩa; chờ 05-HD/TU, 39-QĐ/TU — tránh phát minh nghiệp vụ |
| Sao chọn Markdown thay vì Notion? | Version control + traceability; ADR-0001 |
| Dữ liệu BVCTNB xử lý sao? | Phân vùng riêng; chi tiết chờ văn bản an ninh |
| Web hay desktop? | Đang mở, có ADR-0004 với tiêu chí quyết |
| Làm sao đảm bảo đúng quy định? | Catalog + traceability + review theo văn bản |

## 6. Vật liệu cần chuẩn bị trước buổi bảo vệ

- Render sơ đồ Mermaid thành ảnh/Slide (nếu dùng Notion/Slides làm mặt trình bày).
- File PDF gốc QĐ01 (và các văn bản tiếp theo) đưa vào repo hoặc mang theo đối chiếu.
- Chuẩn bị 1–2 câu chuyện "tôi đã sửa một suy luận sai thành TBD" làm ví dụ về kỷ luật phân tích.

