import { ROLES, type AppUser } from "@/lib/types";

export const USERS: AppUser[] = [
  {
    id: "u-leader",
    name: "Trần Minh Hòa",
    role: ROLES.lanhDao,
    title: "Lãnh đạo Ban",
    departmentId: null,
    departmentName: null,
  },
  {
    id: "u-head",
    name: "Nguyễn Thị Lan",
    role: ROLES.truongPhong,
    title: "Trưởng phòng",
    departmentId: "d2",
    departmentName: "Phòng Tổ chức cán bộ",
  },
  {
    id: "u-staff",
    name: "Phạm Văn Đức",
    role: ROLES.congChuc,
    title: "Công chức",
    departmentId: "d2",
    departmentName: "Phòng Tổ chức cán bộ",
  },
];
