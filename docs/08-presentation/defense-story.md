# Defense story — từ văn bản đến hệ thống

## Thesis

Giá trị của bài làm không nằm ở số màn hình CRUD mà ở khả năng giữ traceability và biết dừng đúng chỗ khi nguồn chưa đủ.

## Deck 10 slide

1. Bài toán và rủi ro “biến suy luận thành quy định”.
2. Source register: cái gì có, cái gì thiếu.
3. QĐ01 → organization/responsibility/assignment.
4. 05/39/Excel → dependency đang khóa KPI/workflow.
5. 342/348/308/07 → identity, audit, data, integration.
6. NĐ85/63/165/278 → production gates.
7. Domain + ERD + versioned rules.
8. C4 modular monolith + security layers.
9. Demo vertical slice và audit.
10. Những gì chưa biết, cách xác minh, roadmap.

## Ba quyết định nên nhấn mạnh

- Không coi Excel là luật; import staging + steward + version.
- Không hard-code KPI/classification khi thiếu 05/39.
- Không over-engineer microservices; giữ boundary rõ trong modular monolith và connector future-state.

## Câu trả lời ngắn cho interviewer

**“Tại sao vẫn demo KPI khi chưa có rule?”**  
Demo engine bằng candidate rule có nhãn rõ; implementation chính thức bị chặn bởi source gate.

**“Sao không dùng dữ liệu/hệ thống thật?”**  
QĐ342/348/HD07 đặt yêu cầu phân quyền, mục đích, nền tảng, trace và bảo mật; bài test dùng synthetic data + fake adapter là lựa chọn an toàn.

**“Điểm khó nhất?”**  
Không phải vẽ ERD, mà là giữ versioned trace từ nguồn đến quyết định và lịch sử đã phê duyệt.

