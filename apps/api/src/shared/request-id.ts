import { AUDIT_REQUEST_ID_MAX_LENGTH } from "@/db/schema/audit-events";

// Ký tự cho phép: chữ, số và bốn dấu phân cách thường dùng (UUID, traceparent,
// tên có tiền tố). Mọi thứ khác — khoảng trắng, ký tự điều khiển, dấu nháy,
// ngoặc nhọn, ký tự ngoài ASCII — đều bị loại.
const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]+$/;

// Trả về correlation id do client gửi chỉ khi nó an toàn để lưu vào cột audit và
// để trả lại nguyên văn trong header phản hồi: sau khi cắt khoảng trắng phải còn
// nội dung, không quá dài, và chỉ gồm ký tự trong bộ cho phép. Giá trị không đạt
// trả về undefined để middleware tự sinh UUID — cắt bớt hay sửa ký tự sẽ tạo ra
// một id không còn đối chiếu được với log của client.
export function validExternalRequestId(
  value: string | undefined,
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length > AUDIT_REQUEST_ID_MAX_LENGTH) {
    return undefined;
  }
  if (!SAFE_REQUEST_ID.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}
