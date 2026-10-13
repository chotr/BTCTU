# ADR-009 — Bất nhất nguồn chặn công bố quy tắc “chính thức”

**Trạng thái:** Accepted.

## Bối cảnh

05-HD/TU có một ví dụ trong đó kết quả số học in ra không khớp với đầu vào công thức.

Các nguồn quy phạm/nghiệp vụ cũng có thể được làm rõ hoặc bị thay thế theo thời gian.

## Quyết định

Một quy tắc chỉ được công bố là `OFFICIAL/ACTIVE` khi:

- tham chiếu nguồn được ghi lại;
- số học/diễn giải nhất quán nội bộ;
- các vấn đề nguồn chưa giải quyết được làm rõ hoặc được cấp nghiệp vụ có thẩm
  quyền phê duyệt rõ ràng;
- kiểm thử đơn vị mã hóa hành vi đã được phê duyệt;
- phiên bản quy tắc/khoảng hiệu lực được cố định.

Quá trình phát triển có thể chạy một quy tắc `CANDIDATE` để kiểm chứng, nhưng UI/báo
cáo phải gắn nhãn cho nó.

## Hệ quả

Ứng dụng không bao giờ âm thầm biến một lỗi nghi in ấn hoặc phỏng đoán của chuyên
viên thành quy tắc đánh giá nhân sự chính thức.
