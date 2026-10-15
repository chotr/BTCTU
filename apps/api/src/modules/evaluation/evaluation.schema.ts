import { CLASSIFICATIONS } from "@btctu/shared";
import { z } from "zod";

export const classificationSchema = z.enum(CLASSIFICATIONS);

export const selfEvaluationSchema = z.object({
  comment: z.string().trim().min(1).max(4000),
  proposed: classificationSchema,
});

export const reviewSchema = z.object({
  comment: z.string().trim().min(1).max(4000),
  proposed: classificationSchema,
  action: z.enum(["propose", "return"]),
});

export const decisionSchema = z.object({
  classification: classificationSchema,
  note: z.string().trim().min(1).max(4000),
});
