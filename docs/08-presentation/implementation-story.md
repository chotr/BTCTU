# Câu chuyện triển khai — trình bày giải pháp

## Luận điểm

Phần mạnh nhất của hệ thống này không phải số lượng màn hình. Đó là khả năng biến
các quy định phân mảnh thành một hệ thống truy vết được **mà không biến giả định
thành quy tắc**.

## Dàn ý 10 slide

1. **Bài toán**
   - hệ thống nhiệm vụ/KPI/đánh giá nội bộ cho BTCTU;
   - tài liệu nguồn phân mảnh trên nhiều văn bản tổ chức, đánh giá, dữ liệu và bảo mật.

2. **Phương pháp**
   - FACT / INFERENCE / TBD;
   - sổ đăng ký nguồn + ma trận truy vết.

3. **Tổ chức**
   - QĐ01 → bốn đơn vị, chức năng/trách nhiệm, trách nhiệm phân công.

4. **Công việc → KPI**
   - 05-HD + Excel + QĐ308;
   - danh mục công việc/sản phẩm → nhiệm vụ thực tế → kết quả → A/B/C/D → 30/70.

5. **Vì sao không code nguồn một cách mù quáng**
   - nêu sai khác số học trong ví dụ của 05-HD;
   - giải thích vấn đề nguồn → cổng → quy tắc theo phiên bản + kiểm thử.

6. **Đánh giá/xếp loại**
   - QĐ39: dải điểm + điều kiện bắt buộc + thẩm quyền;
   - điểm không phải quyết định cuối.

7. **Kiến trúc**
   - web modular monolith;
   - domain/module/ERD;
   - phiên bản truy vết được về nguồn.

8. **Bảo mật/dữ liệu**
   - QĐ342 + NĐ85/63/165/278;
   - phân quyền theo ngữ cảnh, audit, dữ liệu seed phát triển, không có nội dung bí mật nhà nước.

9. **Tích hợp**
   - QĐ308/607/348/HD07;
   - SOR chủ quản + mock adapter hiện tại, connector LGSP được phê duyệt về sau.

10. **Luồng nghiệm thu + hạn chế**
    - luồng đầu-cuối;
    - liệt kê rõ công thức không-lãnh-đạo chưa giải quyết, tổng hợp tháng, phê duyệt
      production/phạm vi dữ liệu.

## Năm quyết định thiết kế then chốt

1. **Web modular monolith, không phải microservices**
   - hệ thống nội bộ ít người dùng; cập nhật tập trung; gánh nặng vận hành thấp.

2. **Quy tắc/danh mục theo phiên bản**
   - thay đổi quy định/danh mục không được viết lại điểm lịch sử.

3. **Xếp loại là một pipeline quyết định**
   - ngưỡng + điều kiện + thẩm quyền; không phải `if score >= 90`.

4. **Dữ liệu nhân sự ngoài vẫn có thẩm quyền ở nơi khác**
   - connector/ánh xạ thay vì nhân bản nguồn sự thật.

5. **Môi trường phát triển loại trừ dữ liệu được bảo vệ thật**
   - bảo mật/tuân thủ được chứng minh qua thiết kế và kiểm soát, không bằng cách mạo
     hiểm dữ liệu nhạy cảm.

## Câu hỏi thường gặp khi rà soát

### “Vì sao không lấy trung bình điểm nhân viên cho một đơn vị?”

Vì đề bài và quy định coi tập thể là một đối tượng đánh giá. Đơn vị có chức
năng/nhiệm vụ/sản phẩm riêng. Không nguồn nào đã rà soát nói điểm đơn vị bằng trung
bình nhân viên.

### “Vì sao không tự động hóa 100%?”

Vì xếp loại vẫn bao gồm quyết định của cấp có thẩm quyền và điều kiện bắt buộc.
QĐ342 cũng yêu cầu trách nhiệm giải trình của con người; AI không thể là căn cứ duy
nhất cho quyết định nhân sự.

### “Phát hiện lỗi công thức trong nguồn. Chuyện gì xảy ra?”

Ghi nhận hẹp là **sai khác số học trong ví dụ**. Không tuyên bố công thức chính thức
là sai, không âm thầm chọn một kết quả; đề nghị làm rõ, đánh phiên bản quy tắc được
phê duyệt và khóa lại bằng kiểm thử.

### “Vì sao không tích hợp thật?”

Connector cần mục đích/phạm vi được phê duyệt, credentials/mạng, cấp độ bảo mật và
phân loại dữ liệu. Một mock adapter chứng minh kiến trúc mà không vi phạm các cổng đó.

### “Còn gì chưa biết?”

Đưa `known-unknowns.md`. Biết rõ điều gì chưa được biện minh là một phần của chất
lượng kỹ thuật.
