import { departmentActions } from "./departments";
import { peopleActions } from "./people";
import { referenceActions } from "./references";
import { catalogActions } from "./catalog";

export { previewCatalogCsv, catalogCsvTemplate } from "./csv";
export type { ImportRow } from "./shared";

/** Bề mặt lệnh dữ liệu chuẩn tổng hợp (tổ chức, tham chiếu và danh mục). */
export const masterActions = {
  ...departmentActions,
  ...peopleActions,
  ...referenceActions,
  ...catalogActions,
};
