# Bối cảnh hệ thống và container

## Bối cảnh [INFERENCE dựa trên vai trò trong nguồn]

```mermaid
flowchart LR
  STAFF["Công chức / thành viên"]
  HEAD["Trưởng phòng / Chánh VP"]
  AUTH["Cấp có thẩm quyền"]
  APP["Hệ thống nhiệm vụ & đánh giá BTCTU"]
  IDP["Nhà cung cấp định danh\nProduction TBD"]
  TCXDD["HTTT TCXDĐ / LGSP\nTích hợp được phê duyệt trong tương lai"]
  DMS["Kho minh chứng/DMS được phê duyệt\nTương lai/TBD"]

  STAFF -->|"kết quả nhiệm vụ / tự đánh giá"| APP
  HEAD -->|"phân công / thẩm định trong phạm vi được uỷ quyền"| APP
  AUTH -->|"quyết định cuối / báo cáo"| APP
  APP -. "xác thực / MFA" .-> IDP
  APP -. "dữ liệu canonical theo scope" .-> TCXDD
  APP -. "tham chiếu minh chứng được uỷ quyền" .-> DMS
```

## Container ứng dụng [đề xuất]

```mermaid
flowchart LR
  U["Người dùng nội bộ được phép"]
  WEB["Web UI\nNext.js"]
  API["Ứng dụng\nModular monolith"]
  WORKER["Worker\nbáo cáo/job/outbox"]
  DB[("CSDL quan hệ\ndữ liệu giao dịch + snapshot")]
  AUD[("Kho audit/read model")]
  EVID["Ranh giới minh chứng\nphát triển: metadata; production: DMS/kho được phê duyệt"]
  CONN["Adapter tích hợp\nmock adapter chờ API được phê duyệt"]

  U -->|"HTTPS"| WEB
  WEB --> API
  API --> DB
  API --> AUD
  API --> EVID
  API --> CONN
  API --> WORKER
```

## Ghi chú ranh giới

- “Trưởng phòng” không tự động đồng nghĩa người phê duyệt cuối; thẩm quyền được xác
  định theo quy tắc nguồn.
- Tài liệu bí mật nhà nước nằm ngoài ranh giới ứng dụng.
- Tích hợp ngoài thật bị tắt cho tới khi đạt các cổng production.
- Việc tách container là thiết kế kỹ thuật; QĐ342 cung cấp ràng buộc kiến trúc/bảo
  mật, không phải các thành phần triển khai chính xác này.
