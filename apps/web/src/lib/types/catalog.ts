export type CatalogStatus = "DRAFT" | "PUBLISHED";

export interface CatalogItem {
  id: string;
  version: string;
  code: string;
  name: string;
  product: string;
  unit: string;
  complexity: "Cao" | "Trung bình" | "Thấp";
  standardScore: number;
  coefficient: number;
  durationDays: number;
  sourceRef: string;
  status: CatalogStatus;
}
