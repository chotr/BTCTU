# Runbook nghiệm thu

## Mục tiêu

Xác nhận luồng xuyên suốt, phân quyền, audit, snapshot và khả năng phục hồi trước khi kết nối nguồn dữ liệu thật.

## Chuẩn bị

- `pnpm check` thành công;
- web và API local đang chạy;
- trình duyệt sạch hoặc đã khôi phục không gian làm việc;
- không sử dụng dữ liệu nhân sự/tài liệu nhạy cảm thật;
- ghi lại request ID khi có lỗi.

## Luồng kiểm tra

1. Đăng nhập vai trò lãnh đạo, tạo kỳ đánh giá và kiểm tra phạm vi tổ chức.
2. Công bố phiên bản danh mục, tạo nhiệm vụ và giao cho công chức.
3. Đăng nhập người được giao, cập nhật tiến độ, metadata minh chứng và nộp kết quả.
4. Đăng nhập trưởng phòng, trả lại một lần, sau đó nghiệm thu.
5. Tạo hồ sơ đánh giá, tính KPI, xác nhận điều kiện và tự đánh giá.
6. Thẩm định bằng tài khoản khác chủ thể; xác nhận chặn tự thẩm định.
7. Lãnh đạo quyết định, khóa kỳ và xác nhận hồ sơ chỉ đọc.
8. Mở lại với lý do, kiểm tra snapshot/decision history và audit.
9. Xuất CSV/báo cáo, xác nhận dữ liệu nằm trong phạm vi quyền.
10. Kiểm tra tình huống timeout kết nối và retry giữ nguyên checkpoint khi lỗi.

## Tiêu chí đạt

- không có lỗi console/runtime;
- action trái quyền bị từ chối và có audit;
- reload giữ state local trong môi trường phát triển;
- khóa kỳ chặn mutation;
- snapshot không đổi khi danh mục/rule mới được tạo;
- báo cáo có nhãn dự thảo và căn cứ rà soát;
- responsive ở desktop và mobile;
- E2E tự động hoàn thành luồng chính.
