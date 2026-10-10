import type {
  CatalogItem,
  DemoUser,
  Department,
  Person,
  PositionRef,
  ResponsibilityRef,
} from "@/lib/types";

/* Toàn bộ dữ liệu dưới đây là DỮ LIỆU MINH HỌA (synthetic).            */
/* Tên người, mã nhiệm vụ, điểm số đều được tạo để demo, không phải     */
/* dữ liệu thật của cơ quan. Các con số KPI lấy theo ví dụ của 05-HD/TU. */

export const USERS: DemoUser[] = [
  { id: "u-leader", name: "Trần Minh Hòa", role: "lanh_dao", title: "Lãnh đạo Ban", departmentId: null, departmentName: null },
  { id: "u-head", name: "Nguyễn Thị Lan", role: "truong_phong", title: "Trưởng phòng", departmentId: "d2", departmentName: "Phòng Tổ chức cán bộ" },
  { id: "u-staff", name: "Phạm Văn Đức", role: "cong_chuc", title: "Công chức", departmentId: "d2", departmentName: "Phòng Tổ chức cán bộ" },
];

export const DEPARTMENTS: Department[] = [
  {
    id: "d1",
    code: "TCĐ-ĐV",
    name: "Phòng Tổ chức đảng, đảng viên",
    functionText:
      "Tham mưu, giúp việc lãnh đạo Ban về công tác tổ chức đảng, công tác đảng viên và nghiệp vụ công tác đảng viên.",
    headId: "p1head",
    responsibilityIds: ["r1a", "r1b", "r1c"],
  },
  {
    id: "d2",
    code: "TCCB",
    name: "Phòng Tổ chức cán bộ",
    functionText:
      "Tham mưu, giúp việc lãnh đạo Ban về công tác tổ chức, cán bộ; công tác chính sách cán bộ (trừ các nhiệm vụ đã giao cho Văn phòng).",
    headId: "u-head",
    responsibilityIds: ["r2a", "r2b", "r2c"],
  },
  {
    id: "d3",
    code: "BVCTNB",
    name: "Phòng Bảo vệ chính trị nội bộ",
    functionText: "Tham mưu, giúp việc lãnh đạo Ban về công tác bảo vệ chính trị nội bộ.",
    headId: "p3head",
    responsibilityIds: ["r3a", "r3b", "r3c"],
  },
  {
    id: "d4",
    code: "VP",
    name: "Văn phòng",
    functionText:
      "Tham mưu, giúp việc lãnh đạo Ban trong công tác tổ chức, điều hành công việc nội bộ; đầu mối tổng hợp, văn thư lưu trữ và xử lý công việc hằng ngày.",
    headId: "p4chief",
    responsibilityIds: ["r4a", "r4b", "r4c"],
  },
];

export const POSITIONS: PositionRef[] = [
  { id: "pos-head", title: "Trưởng phòng", scope: "Cơ cấu theo QĐ01 Điều 3–6" },
  { id: "pos-deputy", title: "Phó Trưởng phòng", scope: "Cơ cấu theo QĐ01 Điều 3–6" },
  { id: "pos-staff", title: "Công chức", scope: "Cơ cấu theo QĐ01 Điều 3–6" },
  { id: "pos-chief-vp", title: "Chánh Văn phòng", scope: "Cơ cấu theo QĐ01 Điều 6" },
  { id: "pos-worker", title: "Người lao động", scope: "Cơ cấu theo QĐ01 Điều 6" },
  { id: "pos-police", title: "Cán bộ công an biệt phái", scope: "Cơ cấu theo QĐ01 Điều 5" },
];

export const PEOPLE: Person[] = [
  { id: "p1head", name: "Trần Văn Nam", title: "Trưởng phòng", departmentId: "d1", positionRefId: "pos-head" },
  { id: "p1staff", name: "Vũ Thị Hoa", title: "Công chức", departmentId: "d1", positionRefId: "pos-staff" },
  { id: "p1deputy", name: "Đinh Công Bình", title: "Phó Trưởng phòng", departmentId: "d1", positionRefId: "pos-deputy" },
  { id: "u-head", name: "Nguyễn Thị Lan", title: "Trưởng phòng", departmentId: "d2", positionRefId: "pos-head" },
  { id: "p2deputy", name: "Lê Quang Huy", title: "Phó Trưởng phòng", departmentId: "d2", positionRefId: "pos-deputy" },
  { id: "u-staff", name: "Phạm Văn Đức", title: "Công chức", departmentId: "d2", positionRefId: "pos-staff" },
  { id: "p2staff", name: "Ngô Thị Mai", title: "Công chức", departmentId: "d2", positionRefId: "pos-staff" },
  { id: "p3head", name: "Hoàng Đức Tâm", title: "Trưởng phòng", departmentId: "d3", positionRefId: "pos-head" },
  { id: "p3staff", name: "Lý Minh Châu", title: "Công chức", departmentId: "d3", positionRefId: "pos-staff" },
  { id: "p3police", name: "Trịnh Bảo Long", title: "Cán bộ công an biệt phái", departmentId: "d3", positionRefId: "pos-police" },
  { id: "p4chief", name: "Bùi Thu Hằng", title: "Chánh Văn phòng", departmentId: "d4", positionRefId: "pos-chief-vp" },
  { id: "p4staff", name: "Mai Anh Thư", title: "Công chức", departmentId: "d4", positionRefId: "pos-staff" },
  { id: "p4worker", name: "Phạm Thùy Dung", title: "Người lao động", departmentId: "d4", positionRefId: "pos-worker" },
];

export const RESPONSIBILITIES: ResponsibilityRef[] = [
  { id: "r1a", departmentId: "d1", name: "Quản lý hồ sơ và cơ sở dữ liệu đảng viên", sourceRef: "QĐ01 · Điều 3" },
  { id: "r1b", departmentId: "d1", name: "Đánh giá, xếp loại tổ chức đảng, đảng viên", sourceRef: "QĐ01 · Điều 3" },
  { id: "r1c", departmentId: "d1", name: "Hướng dẫn, thẩm định về tổ chức đảng, đảng viên", sourceRef: "QĐ01 · Điều 3" },
  { id: "r2a", departmentId: "d2", name: "Quản lý hồ sơ cán bộ diện Tỉnh ủy quản lý", sourceRef: "QĐ01 · Điều 4" },
  { id: "r2b", departmentId: "d2", name: "Thẩm định nhân sự quy hoạch, bổ nhiệm, điều động", sourceRef: "QĐ01 · Điều 4" },
  { id: "r2c", departmentId: "d2", name: "Đào tạo, bồi dưỡng và chính sách cán bộ", sourceRef: "QĐ01 · Điều 4" },
  { id: "r3a", departmentId: "d3", name: "Thẩm tra, xác minh vấn đề chính trị", sourceRef: "QĐ01 · Điều 5" },
  { id: "r3b", departmentId: "d3", name: "Quản lý hồ sơ BVCTNB", sourceRef: "QĐ01 · Điều 5" },
  { id: "r3c", departmentId: "d3", name: "Tiếp nhận, xử lý đơn thư liên quan chính trị", sourceRef: "QĐ01 · Điều 5" },
  { id: "r4a", departmentId: "d4", name: "Tổng hợp chương trình, kế hoạch công tác", sourceRef: "QĐ01 · Điều 6" },
  { id: "r4b", departmentId: "d4", name: "Chế độ thông tin, báo cáo định kỳ", sourceRef: "QĐ01 · Điều 6" },
  { id: "r4c", departmentId: "d4", name: "Công tác nhân sự nội bộ của Ban", sourceRef: "QĐ01 · Điều 6" },
];

export const CATALOG: CatalogItem[] = [
  { id: "c1", version: "v1.1", code: "NV-TCCB-01", name: "Rà soát, cập nhật hồ sơ cán bộ diện Tỉnh ủy quản lý", product: "Báo cáo kết quả rà soát hồ sơ", unit: "Báo cáo", complexity: "Cao", standardScore: 12, coefficient: 1.0, durationDays: 15, sourceRef: "05-HD/TU PL1 · Excel draft", status: "PUBLISHED" },
  { id: "c2", version: "v1.1", code: "NV-TCCB-02", name: "Thẩm định nhân sự phục vụ quy hoạch, bổ nhiệm", product: "Tờ trình thẩm định nhân sự", unit: "Tờ trình", complexity: "Cao", standardScore: 14, coefficient: 1.1, durationDays: 10, sourceRef: "05-HD/TU PL1 · Excel draft", status: "PUBLISHED" },
  { id: "c3", version: "v1.1", code: "NV-TCCB-03", name: "Báo cáo công tác tổ chức cán bộ định kỳ", product: "Báo cáo quý", unit: "Báo cáo", complexity: "Trung bình", standardScore: 8, coefficient: 0.9, durationDays: 7, sourceRef: "05-HD/TU PL1 · Excel draft", status: "PUBLISHED" },
  { id: "c4", version: "v1.1", code: "NV-TCDD-01", name: "Cập nhật, đồng bộ cơ sở dữ liệu đảng viên", product: "Dữ liệu đồng bộ + báo cáo đối soát", unit: "Báo cáo", complexity: "Trung bình", standardScore: 9, coefficient: 1.0, durationDays: 7, sourceRef: "05-HD/TU PL1 · Excel draft", status: "PUBLISHED" },
  { id: "c5", version: "v1.1", code: "NV-TCDD-02", name: "Hướng dẫn kiểm điểm, đánh giá, xếp loại hằng quý", product: "Văn bản hướng dẫn", unit: "Văn bản", complexity: "Trung bình", standardScore: 10, coefficient: 1.0, durationDays: 10, sourceRef: "05-HD/TU PL1 · Excel draft", status: "PUBLISHED" },
  { id: "c6", version: "v1.1", code: "NV-VP-01", name: "Tổng hợp chương trình công tác quý của Ban", product: "Chương trình công tác quý", unit: "Chương trình", complexity: "Trung bình", standardScore: 8, coefficient: 0.9, durationDays: 8, sourceRef: "05-HD/TU PL1 · Excel draft", status: "PUBLISHED" },
  { id: "c7", version: "v1.1", code: "NV-VP-02", name: "Tổng hợp chế độ thông tin, báo cáo định kỳ", product: "Báo cáo tổng hợp định kỳ", unit: "Báo cáo", complexity: "Thấp", standardScore: 6, coefficient: 0.8, durationDays: 5, sourceRef: "05-HD/TU PL1 · Excel draft", status: "PUBLISHED" },
  { id: "c8", version: "v1.1", code: "NV-BVCTNB-01", name: "Rà soát, cập nhật hồ sơ bảo vệ chính trị nội bộ", product: "Biên bản rà soát hồ sơ", unit: "Biên bản", complexity: "Cao", standardScore: 12, coefficient: 1.0, durationDays: 12, sourceRef: "05-HD/TU PL1 · Excel draft", status: "PUBLISHED" },
  { id: "c9", version: "v1.0", code: "NV-TCCB-01", name: "Rà soát, cập nhật hồ sơ cán bộ diện Tỉnh ủy quản lý", product: "Báo cáo kết quả rà soát hồ sơ", unit: "Báo cáo", complexity: "Cao", standardScore: 10, coefficient: 1.0, durationDays: 15, sourceRef: "05-HD/TU PL1 · Excel draft", status: "DRAFT" },
  { id: "c10", version: "v1.0", code: "NV-TCCB-03", name: "Báo cáo công tác tổ chức cán bộ định kỳ", product: "Báo cáo quý", unit: "Báo cáo", complexity: "Trung bình", standardScore: 7, coefficient: 0.9, durationDays: 7, sourceRef: "05-HD/TU PL1 · Excel draft", status: "DRAFT" },
  { id: "c11", version: "v1.0", code: "NV-TCDD-02", name: "Hướng dẫn kiểm điểm, đánh giá, xếp loại hằng quý", product: "Văn bản hướng dẫn", unit: "Văn bản", complexity: "Trung bình", standardScore: 9, coefficient: 1.0, durationDays: 10, sourceRef: "05-HD/TU PL1 · Excel draft", status: "DRAFT" },
];

