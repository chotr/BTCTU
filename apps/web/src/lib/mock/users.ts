import type { AppUser } from "@/lib/types";

export const USERS: AppUser[] = [
  {
    id: "u-leader",
    name: "Trần Minh Hòa",
    role: "lanh_dao",
    title: "Lãnh đạo Ban",
    departmentId: null,
    departmentName: null,
  },
  {
    id: "u-head",
    name: "Nguyễn Thị Lan",
    role: "truong_phong",
    title: "Trưởng phòng",
    departmentId: "d2",
    departmentName: "Phòng Tổ chức cán bộ",
  },
  {
    id: "u-staff",
    name: "Phạm Văn Đức",
    role: "cong_chuc",
    title: "Công chức",
    departmentId: "d2",
    departmentName: "Phòng Tổ chức cán bộ",
  },
];
