# Yêu cầu và ranh giới bàn giao

## Phát biểu bài toán

Hệ thống phải:

1. xây dựng tiêu chí KPI/OKR định lượng cho cá nhân và đơn vị theo tháng/quý/năm;
2. xây dựng phần mềm cho công chức/đơn vị/vị trí, nhiệm vụ/KPI, theo dõi kết quả, chấm điểm/xếp loại tự động, tổng hợp, phân quyền/phê duyệt, lịch sử, tìm kiếm/báo cáo/xuất, dashboard và dự thảo báo cáo/quyết định;
3. xác định cấp độ bảo đảm an toàn thông tin của hệ thống, kèm căn cứ pháp lý/thực tiễn, và đề xuất kiểm soát an ninh/an toàn thông tin/dữ liệu/bí mật nhà nước.

Có thể bổ sung các chức năng hữu ích khác nếu phục vụ quy trình nghiệp vụ.

## Mục tiêu dự án

Xây dựng một **hệ thống triển khai có thể truy vết** và hồ sơ kỹ thuật truy vết được:

```text
nguồn
→ dữ kiện/quy tắc nghiệp vụ
→ mô hình domain
→ quyết định kiến trúc
→ tính năng/kiểm thử/nghiệm thu
```

## Quy trình đầu-cuối

`tổ chức → nhân sự/vị trí → danh mục công việc → phân công → kết quả/sản phẩm/minh chứng → KPI → tự đánh giá → thẩm định → xếp loại → quyết định cuối → khóa → audit → dashboard/báo cáo`

## Quy ước căn cứ

- `[FACT]`: nguồn nói trực tiếp.
- `[INFERENCE]`: diễn giải thiết kế, cần phê duyệt.
- `[TBD]`: thiếu căn cứ/cần cấp thẩm quyền.
- `[SOURCE-INCONSISTENCY]`: bản thân nguồn mâu thuẫn hoặc có vẻ sai số học.

## Quy tắc bàn giao

- Excel là bản nháp vận hành/dữ liệu chủ, trừ khi chứng minh được đã phê duyệt/có hiệu lực.
- Một yêu cầu pháp lý/ATTT không được coi là “đã triển khai” chỉ vì một sơ đồ có nhắc tới.
- Phát triển dùng dữ liệu seed có kiểm soát.
- Dữ liệu thật được bảo vệ/tích hợp LGSP nằm ngoài phạm vi cho tới khi được phê duyệt.
- Đơn vị/tập thể và cá nhân là hai đối tượng đánh giá riêng.
- Sai khác nguồn và công thức KPI cho người không giữ chức vụ lãnh đạo phải tiếp tục là hạn chế hiển thị cho tới khi được giải quyết.

## Định nghĩa hoàn thành cho giai đoạn thiết kế

1. Các file nguồn cốt lõi đã được rà soát và đăng ký.
2. Có ma trận truy vết nguồn→quy tắc→thiết kế.
3. Có sơ đồ nghiệp vụ/domain/C4/ERD/bảo mật/tích hợp.
4. Sổ đăng ký known/unknown/source inconsistency còn hiệu lực.
5. Kế hoạch triển khai có các cổng phụ thuộc.
6. Câu chuyện nghiệm thu phân biệt rõ năng lực đã triển khai, đã thiết kế và TBD.
