# Task / product / evidence model

```mermaid
flowchart LR
  WC["WorkCatalogItem vN"] --> T["Task"]
  T --> AS["Assignment"]
  AS --> TR["TaskResult"]
  TR --> P["Product"]
  TR --> EV["Evidence metadata"]
  EV -. secure reference .-> OS["Object storage / DMS"]
```

- `[FACT]` QĐ01 chỉ xác nhận việc phân công nhiệm vụ gắn vị trí việc làm.
- `[INFERENCE]` Tách catalog, instance, assignment và result để trace/version; evidence lưu metadata + reference thay vì nhét file vào DB.
- `[TBD]` task types, trạng thái, sản phẩm bắt buộc, deadline, acceptance và evidence hợp lệ — chờ 05-HD/TU/Excel.

