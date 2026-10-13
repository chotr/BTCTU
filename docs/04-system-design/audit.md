# Thiết kế audit

## Ràng buộc FACT

QĐ342 yêu cầu truy vết/ghi log cho truy cập, khai thác, cập nhật, phê duyệt, chia
sẻ và xử lý dữ liệu, kèm khả năng kiểm tra, giám sát và truy vết nguồn gốc. Thay
đổi dữ liệu quan trọng phải có ghi log được bảo vệ.

QĐ308/QĐ348/HD07 cũng làm cho việc truy vết nguồn/phạm vi/giao dịch trở nên quan
trọng với tích hợp.

## Phạm vi sự kiện đề xuất [INFERENCE]

Ghi log tối thiểu:

- xác thực/MFA/truy cập đặc quyền thất bại;
- đọc bản ghi nhạy cảm;
- tạo/cập nhật/xóa/lưu trữ;
- phân công/phân công lại;
- nộp/nghiệm thu/trả lại kết quả nhiệm vụ;
- nộp/thẩm định/trả lại/quyết định cuối của đánh giá;
- tính điểm và điều chỉnh thủ công;
- khóa/mở lại;
- xuất/in;
- thay đổi quyền/cấp quyền;
- yêu cầu/trạng thái connector;
- sinh dự thảo có hỗ trợ AI, nếu được bật.

## Schema sự kiện đề xuất

```text
AuditEvent
- eventId
- occurredAtUtc
- actorId / actorRoles
- action
- resourceType / resourceId
- subjectId
- organization/data scope
- purpose
- classification
- workflowState
- outcome
- reason
- request/correlationId
- rule/catalog/version references
- safe before/after diff hoặc hash
- thông tin IP/thiết bị nguồn khi được phép
```

## Quy tắc bảo mật

- không ghi log secrets/token/nội dung file;
- giảm thiểu payload nhạy cảm trong log;
- lưu trữ append-only/chống sửa đổi;
- quyền đọc audit bị giới hạn;
- thời gian/correlation ID tập trung;
- giám sát bảo mật có thể tiêu thụ luồng/read model audit.

## TBD

Thời hạn lưu giữ, legal hold, người được phép đọc audit chính xác và mọi yêu cầu
chữ ký số/WORM cho môi trường sản xuất.
