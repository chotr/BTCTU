# Audit design

Ghi sự kiện: login/MFA failure, read sensitive record, create/update/delete, assign/reassign, submit/review/approve/return, score calculation/override, lock/reopen, export/print, permission change, integration request/response status.

Trường tối thiểu: `eventId`, UTC timestamp, actor/subject, action, resource/type/id, organization/data scope, purpose, before/after hash or safe diff, correlation/request ID, source IP/device where permitted, outcome, reason, policy/rule version.

`[INFERENCE]` append-only store/WORM export, restricted audit viewers, clock sync, alerting. Không log secret/token/file body hoặc trường dữ liệu nhạy cảm không cần thiết.

`[TBD]` retention, legal hold, cơ quan được đọc audit và cơ chế ký/niêm phong log.

