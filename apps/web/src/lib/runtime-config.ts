export type AppEnvironment = "development" | "staging" | "production";

function appEnvironment(value: string | undefined): AppEnvironment {
  if (value === "production" || value === "staging") return value;
  return "development";
}

export const runtimeConfig = Object.freeze({
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ??
    "http://localhost:8787",
  environment: appEnvironment(process.env.NEXT_PUBLIC_APP_ENV),
});

export function environmentLabel(): string {
  const environment = {
    development: "Phát triển",
    staging: "Kiểm thử",
    production: "Chính thức",
  }[runtimeConfig.environment];
  return environment;
}
