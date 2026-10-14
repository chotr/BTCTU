export const ROLES = {
  lanhDao: "lanh_dao",
  truongPhong: "truong_phong",
  congChuc: "cong_chuc",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface AppUser {
  id: string;
  name: string;
  role: Role;
  title: string;
  departmentId: string | null;
  departmentName: string | null;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  shortName: string;
  functionText: string;
  headId: string;
  responsibilityIds: string[];
}

export interface PositionRef {
  id: string;
  title: string;
  scope: string;
}

export interface Person {
  id: string;
  name: string;
  title: string;
  departmentId: string;
  positionRefId: string;
}

export interface ResponsibilityRef {
  id: string;
  departmentId: string;
  name: string;
  sourceRef: string;
}
