import { z } from "zod";
import { AUTH_POLICY } from "./auth.policy";

export const loginRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(AUTH_POLICY.email.minLength)
    .max(AUTH_POLICY.email.maxLength)
    .email(),
  password: z
    .string()
    .min(AUTH_POLICY.password.minLength)
    .max(AUTH_POLICY.password.maxLength),
});

export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(1).max(512).optional(),
});

export const changePasswordRequestSchema = z.object({
  currentPassword: z
    .string()
    .min(AUTH_POLICY.password.minLength)
    .max(AUTH_POLICY.password.maxLength),
  newPassword: z
    .string()
    .min(AUTH_POLICY.password.minLength)
    .max(AUTH_POLICY.password.maxLength),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
