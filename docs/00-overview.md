# 00 — Tổng quan dự án

## 1. Bài toán

Ban Tổ chức Tỉnh ủy (BTCTU) gồm 4 đơn vị với các chức năng, nhiệm vụ được quy định tại văn bản 01-QĐ/BTCTU `[FACT]`. Mỗi phòng có Trưởng phòng / Chánh Văn phòng chịu trách nhiệm phân công nhiệm vụ cụ thể cho thành viên, gắn với vị trí việc làm `[FACT]`. Cơ quan cần một hệ thống hỗ trợ:

- lưu trữ cơ cấu tổ chức và phạm vi nhiệm vụ của từng phòng;
- phân công công việc giữa lãnh đạo phòng và thành viên;
- theo dõi tiến độ, báo cáo, và về sau là đánh giá mức độ hoàn thành (KPI).

## 2. Mục tiêu

- Chuyển các quy định nghiệp vụ thành mô hình dữ liệu và hệ thống khớp thực tế cơ quan.
- Giữ vết nguồn gốc: mọi quy tắc trong hệ thống truy được về văn bản ban hành (traceability).
- Không phát minh nghiệp vụ: chưa có căn cứ thì đánh dấu `[TBD]`, không điền bừa.

## 3. Phạm vi hiện tại

Chỉ có **một nguồn đã được phân tích**: `01-QĐ/BTCTU — Chức năng, nhiệm vụ và cơ cấu tổ chức các phòng thuộc BTCTU` `[FACT]`.

Do đó phạm vi thiết kế hiện dừng ở tầng **tổ chức + trách nhiệm + phân công sơ khai**. Các phần KPI, chấm điểm, xếp loại, phê duyệt đang ở dạng placeholder, chờ 05-HD/TU và 39-QĐ/TU.

## 4. Ngoài phạm vi (hiện tại)

- Công thức / trọng số / thang điểm KPI — chưa có nguồn `[TBD]`
- Workflow submit → review → approve — chưa có nguồn `[TBD]`
- Danh mục vị trí việc làm — QĐ01 nhắc nhưng không liệt kê `[TBD]`
- Code ứng dụng — chưa bắt đầu; nhánh này chỉ chứa tài liệu

## 5. Cách sử dụng bộ tài liệu

1. Bắt đầu từ [docs/README.md](README.md) để nắm bản đồ.
2. Đọc [01-source-analysis](01-source-analysis/README.md) để thấy bằng chứng trích từ văn bản.
3. Đọc [02-business-domain](02-business-domain/organization-model.md) để thấy mô hình tổ chức/nghiệp vụ.
4. Đọc [03-architecture](03-architecture/architecture-overview.md) để thấy thiết kế hệ thống sơ bộ.
5. Đối chiếu [05-assumptions-and-unknowns.md](05-assumptions-and-unknowns.md) trước khi đặt câu hỏi.

## 6. Giá trị với nhà tuyển dụng

Bộ tài liệu chứng minh quy trình làm việc thực sự của ứng viên:

```text
Văn bản nghiệp vụ
   → Trích xuất fact
   → Tách fact / inference / TBD
   → Business rule
   → Domain model
   → Architecture
   → Data model
   → (sau này) Code & Demo
```

