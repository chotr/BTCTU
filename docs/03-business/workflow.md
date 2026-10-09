# Workflow mục tiêu

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Submitted: self evaluation
  Submitted --> Reviewed: reviewer completes review
  Reviewed --> Approved: competent authority approves
  Approved --> Locked: close period
  Submitted --> Draft: return for correction
  Reviewed --> Submitted: return for correction
  Locked --> Approved: exceptional reopen [TBD authority]
```

Toàn bộ tên state/action là `[INFERENCE]` để thiết kế demo. QĐ39 phải xác nhận/đổi tên/loại bỏ từng transition. Phần có căn cứ sớm nhất là `organization → assignment` từ QĐ01; phần sau `result → evaluation → classification` bị khóa.

