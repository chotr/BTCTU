# 03.3 — Mô hình dữ liệu (partial ERD)

> ERD hiện tại **cực kỳ nhỏ** vì chỉ có một nguồn. Bảng nào chưa có căn cứ thì để placeholder, không đoán trường.

```mermaid
erDiagram
    ORGANIZATION ||--o{ DEPARTMENT : has
    DEPARTMENT ||--o{ RESPONSIBILITY : defines
    DEPARTMENT ||--o{ EMPLOYEE : contains
    EMPLOYEE }o--o{ JOB_POSITION : holds
    ASSIGNMENT }o--|| DEPARTMENT : within
    ASSIGNMENT }o--|| EMPLOYEE : assigned_to
    ASSIGNMENT }o--o{ JOB_POSITION : tied_to

    ORGANIZATION {
        id PK
        name
    }
    DEPARTMENT {
        id PK
        organization_id FK
        name
        function
    }
    RESPONSIBILITY {
        id PK
        department_id FK
        name
        description
        source_reference
    }
    EMPLOYEE {
        id PK
        department_id FK
        organizational_title
    }
    JOB_POSITION {
        id PK
        name "TBD: chưa có danh mục"
    }
    ASSIGNMENT {
        id PK
        department_id FK
        assignee_id FK
        assigned_by FK
        job_position_id FK
    }
```

## Trường đã bị loại khỏi ASSIGNMENT (vì QĐ01 chưa định nghĩa)

```text
deadline        [TBD]
score           [TBD]
quality         [TBD]
status          [TBD]
evidence        [TBD]
KPI link        [TBD]
```

## Trường có thể nối về sau `[TBD]`

- `task_id` khi Task được 05-HD/TU định nghĩa
- `cycle` khi có quy định về chu kỳ công việc (QĐ01 chỉ nhắc các mốc tuần/tháng/quý/năm/… chứ không định nghĩa enum)

## Ghi chú về phân vùng dữ liệu `[INFERENCE]`

- Dữ liệu BVCTNB (hồ sơ BVCTNB, đơn thư) cần phân vùng truy cập riêng; chi tiết chờ văn bản an ninh `[TBD]`.
- Miền chính sách cán bộ nằm ở cả Phòng TCCB và Văn phòng → cần quy tắc chủ sở hữu dữ liệu rõ ràng `[TBD]`.

