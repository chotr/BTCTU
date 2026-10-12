import { departmentActions } from "./departments";
import { peopleActions } from "./people";
import { referenceActions } from "./references";
import { catalogActions } from "./catalog";

export { previewCatalogCsv, catalogCsvTemplate } from "./csv";
export type { ImportRow } from "./shared";

/** Composed master-data command surface (org, references and catalog). */
export const masterActions = {
  ...departmentActions,
  ...peopleActions,
  ...referenceActions,
  ...catalogActions,
};
