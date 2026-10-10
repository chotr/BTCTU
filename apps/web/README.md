# BTCTU Web — bản UI mock-first

Web quản lý nhiệm vụ & đánh giá cho Ban Tổ chức Tỉnh ủy. Bản này **chưa nối API**:

- mọi dữ liệu nằm ở `src/lib/mock/` (dữ liệu minh họa, không dùng dữ liệu thật);
- lớp nghiệp vụ ở `src/lib/api.ts` mô phỏng hợp đồng API tương lai (mỗi hàm là một async operation);
- sau khi có backend Hono, thay phần gọi trong `api.ts` bằng `fetch`, giữ nguyên màn hình.

## Chạy

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # kiểm tra build production
```

Đăng nhập demo: chọn một trong 3 tài khoản mẫu ở màn hình đăng nhập để thấy UI đổi theo quyền.

## Ngôn ngữ thiết kế

- phẳng, nền `#F2F4F7`; card trắng tách bằng **bóng line mỏng**, không dùng border;
- bo góc rất nhẹ: card 6px, control 4px, badge pill;
- một accent xanh đậm duy nhất, chỉ thêm 3 màu ngữ nghĩa (ok/warn/danger);
- font Be Vietnam Pro (tải qua `next/font/google` — build cần mạng lần đầu).

## Ghi chú nghiệp vụ

- Các con số KPI trong màn hình đánh giá lấy từ ví dụ của 05-HD/TU, gồm cả mâu thuẫn số học **INC-01** (ghi rõ, không tự sửa nguồn).
- Công thức A/B/C/D áp dụng cho lãnh đạo/quản lý; công chức không giữ chức vụ dùng công thức ứng viên (INC-02), có gắn nhãn rõ ràng.
- Toàn bộ trạng thái và nhãn phần mềm là lựa chọn thiết kế của ứng viên, không phải từ ngữ văn bản quy phạm.

