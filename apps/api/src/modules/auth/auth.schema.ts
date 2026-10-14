import { z } from "zod";

export const loginRequestSchema = z.object({
  email: z.string().trim().min(3).max(255).email(),
  password: z.string().min(8).max(200),
});

export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(1).max(512).optional(),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
