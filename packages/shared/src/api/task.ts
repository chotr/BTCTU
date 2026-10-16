export type CreateTaskInput = {
  catalogItemId: string;
  assigneeId: string;
  periodId?: string;
  plannedQuantity?: number;
  title: string;
  description?: string;
  dueAt: string;
};

