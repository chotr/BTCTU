import { ACCOUNT_ROLES, ACCOUNT_STATUSES } from "@btctu/shared";
import { z } from "zod";
import { AUTH_POLICY } from "@/modules/auth/auth.policy";

const emailSchema = z
  .string()
  .trim()
  .min(AUTH_POLICY.email.minLength)
  .max(AUTH_POLICY.email.maxLength)
  .email();

const passwordSchema = z
  .string()
  .min(AUTH_POLICY.password.minLength)
  .max(AUTH_POLICY.password.maxLength);

const directoryActorIdSchema = z.string().trim().min(1).max(255);

export const createManagedAccountSchema = z.object({
  email: emailSchema,
  directoryActorId: directoryActorIdSchema,
  initialPassword: passwordSchema,
});

export const updateManagedAccountSchema = z
  .object({
    email: emailSchema.optional(),
    directoryActorId: directoryActorIdSchema.optional(),
    status: z.enum(ACCOUNT_STATUSES).optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "Provide at least one field to update.",
  });

export const resetPasswordSchema = z.object({
  temporaryPassword: passwordSchema,
});

export const updateAccountRoleSchema = z.object({
  accountRole: z.enum(
    ACCOUNT_ROLES.filter((role) => role !== "ROOT") as [
      "USER",
      "ACCOUNT_ADMIN",
    ],
  ),
});
