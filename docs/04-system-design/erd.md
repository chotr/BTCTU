# Mô hình dữ liệu logic (ERD)

> Tên thực thể dưới đây là **thiết kế phần mềm**. Sự tồn tại của chúng truy vết
> được về khái niệm trong nguồn, nhưng bản thân cấu trúc bảng không do văn bản quy
> phạm quy định.

```mermaid
erDiagram
  ORGANIZATION ||--o{ DEPARTMENT : co
  DEPARTMENT ||--o{ MEMBERSHIP : co
  PERSON ||--o{ MEMBERSHIP : tham_gia
  POSITION_REFERENCE ||--o{ MEMBERSHIP : phan_loai
  DEPARTMENT ||--o{ RESPONSIBILITY : so_huu

  RESPONSIBILITY ||--o{ WORK_CATALOG_ITEM : truy_vet
  WORK_CATALOG_VERSION ||--o{ WORK_CATALOG_ITEM : chua
  WORK_CATALOG_ITEM ||--o{ TASK : khoi_tao
  TASK ||--o{ ASSIGNMENT : duoc_giao
  PERSON ||--o{ ASSIGNMENT : nhan
  ASSIGNMENT ||--o| TASK_RESULT : tao_ra
  TASK_RESULT ||--o{ EVIDENCE_REF : ho_tro
  TASK_RESULT ||--o{ METRIC_SNAPSHOT : do_luong

  EVALUATION_PERIOD ||--o{ EVALUATION : chua
  PERSON ||--o{ EVALUATION : doi_tuong_ca_nhan
  DEPARTMENT ||--o{ EVALUATION : doi_tuong_don_vi
  EVALUATION ||--o{ CALCULATION_RUN : tinh
  CALCULATION_RUN ||--o{ SCORE_COMPONENT : gom
  EVALUATION ||--o{ ASSESSMENT_ACTION : quy_trinh
  EVALUATION ||--o| CLASSIFICATION_DECISION : chot
  CLASSIFICATION_RULE_VERSION ||--o{ CLASSIFICATION_DECISION : chi_phoi_boi

  PERSON ||--o{ AUDIT_EVENT : hanh_dong
  EVALUATION ||--o{ AUDIT_EVENT : truy_vet
```

## Ánh xạ nguồn → thực thể

| Thực thể                                   | Vì sao tồn tại                                                      |
| ------------------------------------------ | ------------------------------------------------------------------- |
| Organization / Department / Responsibility | QĐ01                                                                |
| Person / Membership / PositionReference    | QĐ01 có nhắc tổ chức/thành viên/vị trí; master chủ quản vẫn TBD     |
| WorkCatalogVersion / Item                  | 05-HD PL1 + danh mục công việc vận hành                             |
| Task / Assignment / Result                 | phân công theo QĐ01 + khái niệm nhiệm vụ/sản phẩm/kết quả của 05-HD |
| MetricSnapshot                             | đo lường A/B/C/D của 05-HD                                          |
| EvaluationPeriod / Evaluation              | đề bài + 05-HD/QĐ39                                                 |
| CalculationRun / ScoreComponent            | phép tính 30/70 phải tái lập được/theo phiên bản                    |
| ClassificationRuleVersion / Decision       | ngưỡng + điều kiện của QĐ39                                         |
| AssessmentAction                           | các bước của QĐ39/05                                                |
| AuditEvent                                 | yêu cầu truy vết của QĐ342                                          |

Mốc ORG-001 hiện thực bốn thực thể đầu thành bảng `departments`, `people`,
`positions` và `position_assignments` (migration `0005_org_core.sql`); phần tên
trường và căn cứ từng trường nằm ở
[organization-fields.md](../03-business/organization-fields.md).

## Quy tắc mô hình hóa quan trọng

- `Evaluation.subjectType` là `PERSON` hoặc `DEPARTMENT`; chỉ đúng một tham chiếu đối tượng được áp dụng.
- Đánh giá đã phê duyệt giữ đúng các phiên bản danh mục/quy tắc/đầu vào đã dùng.
- Tính lại sẽ thêm một `CalculationRun` mới; không viết lại lịch sử.
- Dữ liệu nhân sự/tổ chức từ ngoài giữ định danh/ánh xạ hệ thống nguồn.
- `EvidenceRef` chỉ là metadata/tham chiếu; không chứa nội dung tài liệu bí mật thật.
- Xóa/lưu giữ theo chính sách; “soft delete vĩnh viễn” không phải chính sách vòng đời.

## Chưa có thẩm quyền chính thức

- master PositionReference chính xác;
- công thức KPI cho người không giữ chức vụ lãnh đạo;
- aggregation theo tháng;
- thời hạn lưu giữ minh chứng;
- phân loại dữ liệu sản xuất.
