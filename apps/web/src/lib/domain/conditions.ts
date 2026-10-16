import type { ConditionCheck } from "@/lib/types";

/** Danh mục điều kiện bắt buộc đề xuất theo QĐ39 Điều 11. */
export const initialConditions = (): ConditionCheck[] => [
  {
    id: "compliance",
    label: "Không có trường hợp vi phạm/kỷ luật làm chặn xếp loại",
    detail:
      "Cần người có trách nhiệm xác nhận dữ liệu giả; không suy ra từ điểm KPI.",
    passed: false,
    blocking: true,
  },
  {
    id: "mandatory",
    label: "Đủ điều kiện bắt buộc của nhóm đối tượng",
    detail:
      "Checklist theo QĐ39 Điều 11; thẩm quyền và điều kiện cụ thể còn chờ xác nhận.",
    passed: false,
    blocking: true,
  },
  {
    id: "outstanding",
    label: "Có kết quả nổi trội để xét Xuất sắc",
    detail:
      "Điều kiện cần xác nhận bằng nhận xét hoặc minh chứng, không tự suy ra từ điểm ≥90.",
    passed: false,
    blocking: false,
  },
];
