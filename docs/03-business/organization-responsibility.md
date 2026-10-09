# Organization / responsibility model

```mermaid
flowchart TD
  BAN["Ban Tổ chức Tỉnh ủy"] --> D1["TCĐ, Đảng viên"]
  BAN --> D2["Tổ chức cán bộ"]
  BAN --> D3["BVCTNB"]
  BAN --> D4["Văn phòng"]
  D1 --> R1["Function / Responsibility"]
  D2 --> R2["Function / Responsibility"]
  D3 --> R3["Function / Responsibility"]
  D4 --> R4["Function / Responsibility"]
  D1 -. membership .-> P["Position reference → Person"]
  H["Trưởng phòng / Chánh VP"] -->|"QĐ01 Điều 7.2: phân công"| P
```

- `[FACT]` QĐ01 quy định bốn phòng, chức năng/nhiệm vụ/cơ cấu và trách nhiệm phân công.
- `[INFERENCE]` `Responsibility` là catalog có version/source; `Membership` tách người khỏi phòng để giữ lịch sử.
- `[TBD]` danh mục vị trí việc làm và delegation/ủy quyền.

