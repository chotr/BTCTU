import { z } from "zod";

export const createTaskSchema = z.object({
  catalogItemId: z.string().min(1),
  assigneeId: z.string().min(1),
  periodId: z.string().min(1),
  plannedQuantity: z.number().positive(),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).default(""),
  dueAt: z.string().trim().min(8).max(32),
});

export const resultSchema = z.object({
  quantity: z.number().nonnegative(),
  product: z.string().trim().min(1).max(240),
  qualityLevel: z.enum(["A", "B", "C"]),
  note: z.string().trim().max(2000).default(""),
  submit: z.boolean().default(false),
});

export const returnSchema = z.object({
  note: z.string().trim().min(1).max(2000),
});
