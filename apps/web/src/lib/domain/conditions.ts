import type { ConditionCheck } from "@/lib/types";

/** Candidate mandatory-condition checklist (QĐ39 Điều 11 mapping still TBD). */
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
      "Checklist ứng viên theo QĐ39 Điều 11; mapping thẩm quyền và điều kiện cụ thể còn TBD.",
    passed: false,
    blocking: true,
  },
  {
    id: "outstanding",
    label: "Có kết quả nổi trội để xét Xuất sắc",
    detail:
      "Điều kiện minh họa; xác nhận bằng nhận xét/minh chứng, không tự suy ra từ điểm ≥90.",
    passed: false,
    blocking: false,
  },
];
