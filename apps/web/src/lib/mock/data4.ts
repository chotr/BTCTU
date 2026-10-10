import type { AuditEvent } from "@/lib/types";

export const AUDIT: AuditEvent[] = [
  { id: "a01", at: "2026-09-30T17:40:00+07:00", actorId: "u-leader", action: "Xem báo cáo tổng hợp", resource: "Báo cáo quý III", detail: "Đọc dashboard toàn Ban", outcome: "OK", requestId: "req-9f2c1a" },
  { id: "a02", at: "2026-09-30T16:10:00+07:00", actorId: "u-staff", action: "Xem dữ liệu nhạy cảm", resource: "Hồ sơ BVCTNB", detail: "Truy cập ngoài phạm vi được giao", outcome: "DENIED", requestId: "req-77b4d2" },
  { id: "a03", at: "2026-09-26T08:30:00+07:00", actorId: "u-leader", action: "Quyết định xếp loại", resource: "EV-Q3-HOA", detail: "Hoàn thành xuất sắc nhiệm vụ", outcome: "OK", requestId: "req-3a8e91" },
  { id: "a04", at: "2026-09-26T10:20:00+07:00", actorId: "u-head", action: "Nộp tự đánh giá", resource: "EV-Q3-LAN", detail: "Đề xuất: Hoàn thành tốt nhiệm vụ", outcome: "OK", requestId: "req-c5d001" },
  { id: "a05", at: "2026-09-25T10:00:00+07:00", actorId: "p1head", action: "Thẩm định, đề xuất", resource: "EV-Q3-HOA", detail: "Đề xuất Xuất sắc", outcome: "OK", requestId: "req-2b6f77" },
  { id: "a06", at: "2026-09-18T16:40:00+07:00", actorId: "u-staff", action: "Nộp kết quả", resource: "NV-Q3-002", detail: "Báo cáo quý III chờ nghiệm thu", outcome: "OK", requestId: "req-41cd90" },
  { id: "a07", at: "2026-09-16T10:00:00+07:00", actorId: "p4chief", action: "Phân công nhiệm vụ", resource: "NV-Q3-006", detail: "Gắn vị trí việc làm: Công chức", outcome: "OK", requestId: "req-e0a112" },
  { id: "a08", at: "2026-09-15T08:45:00+07:00", actorId: "p1head", action: "Yêu cầu chỉnh sửa", resource: "NV-Q3-005", detail: "Bổ sung mốc thời gian theo 39-QĐ/TU", outcome: "OK", requestId: "req-5f93bb" },
  { id: "a09", at: "2026-09-10T18:00:00+07:00", actorId: "u-leader", action: "Khóa kỳ quý III", resource: "Kỳ đánh giá p3", detail: "Khóa kỳ (minh họa)", outcome: "OK", requestId: "req-08c44d" },
  { id: "a10", at: "2026-07-02T08:10:00+07:00", actorId: "u-head", action: "Phân công nhiệm vụ", resource: "NV-Q3-001", detail: "Gắn vị trí việc làm: Công chức (QĐ01 Điều 7)", outcome: "OK", requestId: "req-99aa02" },
];

