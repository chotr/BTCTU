# ADR-008 — Tích hợp thật nằm sau cổng phê duyệt

**Trạng thái:** Accepted.

## Bối cảnh

QĐ607 cung cấp một contract API cụ thể: OAuth 2.0 `client_credentials`/JWT/theo
scope. HD07 liệt kê tập cơ chế/profile LGSP được hỗ trợ rộng hơn (OAuth 2.1,
OIDC 2.0, SAML2, JWT Federation và mTLS), trong khi QĐ348 và HD07 cũng yêu cầu
mục đích/phạm vi được phê duyệt, quy trình test→production, điều kiện mạng/bảo mật
và các kiểm soát ATTT.

Các nguồn này mô tả những tầng contract khác nhau. Cách diễn đạt xác thực của chúng
không được làm phẳng thành một cơ chế “OAuth2” chung có thể thay thế lẫn nhau.

Biết được hình dạng API **không** có nghĩa ứng dụng này được phép gọi Production.

## Quyết định

Giai đoạn 1 triển khai:

- port tích hợp;
- adapter giả với dữ liệu synthetic;
- sổ đăng ký ánh xạ canonical;
- contract test cho hành vi token/lỗi/scope;
- request/correlation ID và audit.

Adapter production chọn đúng phiên bản/profile xác thực từ contract endpoint/nền
tảng đã được phê duyệt.

Connector thật vẫn bị tắt cho tới khi:

- tập API/dữ liệu con chính xác được phê duyệt;
- mục đích/phạm vi được phê duyệt;
- mạng/chứng chỉ/credential được cấp;
- phân loại dữ liệu và rà soát bảo mật đã đạt.

## Hệ quả

Việc tích hợp ở môi trường phát triển chứng minh kiến trúc mà không lộ dữ liệu nhân
sự/dữ liệu được bảo vệ thật và không tuyên bố sai rằng đã kết nối production.
