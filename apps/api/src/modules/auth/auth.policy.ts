export const AUTH_POLICY = {
  email: {
    minLength: 3,
    maxLength: 255,
  },
  password: {
    minLength: 8,
    maxLength: 200,
  },
} as const;
