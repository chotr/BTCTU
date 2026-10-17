import { z } from "zod";

const dueDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
  }, "Invalid due date.");

export const createTaskSchema = z.object({
  catalogItemId: z.string().min(1),
  assigneeId: z.string().min(1),
  periodId: z.string().min(1),
  plannedQuantity: z.number().positive(),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).default(""),
  dueAt: dueDateSchema,
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
