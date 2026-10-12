export type OrgTab =
  | "departments"
  | "people"
  | "positions"
  | "responsibilities";

export const ORG_TABS: OrgTab[] = [
  "departments",
  "people",
  "positions",
  "responsibilities",
];

export const ORG_TAB_LABELS: Record<OrgTab, string> = {
  departments: "Đơn vị",
  people: "Nhân sự",
  positions: "Vị trí việc làm",
  responsibilities: "Trách nhiệm",
};

export const ORG_TAB_FIELDS: Record<OrgTab, [string, string][]> = {
  departments: [
    ["code", "Mã đơn vị"],
    ["name", "Tên đơn vị"],
    ["shortName", "Tên ngắn"],
    ["functionText", "Chức năng / nhiệm vụ"],
    ["headId", "Người đứng đầu"],
  ],
  people: [
    ["name", "Họ tên"],
    ["title", "Chức danh"],
    ["departmentId", "Đơn vị"],
    ["positionRefId", "Vị trí việc làm"],
  ],
  positions: [
    ["title", "Tên vị trí"],
    ["scope", "Nguồn / phạm vi tham chiếu"],
  ],
  responsibilities: [
    ["name", "Trách nhiệm"],
    ["departmentId", "Đơn vị"],
    ["sourceRef", "Nguồn / điều khoản"],
  ],
};
