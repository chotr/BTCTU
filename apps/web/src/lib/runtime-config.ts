export type DataSourceMode = "local" | "api";
export type AppEnvironment = "development" | "staging" | "production";

function dataSource(value: string | undefined): DataSourceMode {
  return value === "api" ? "api" : "local";
}

function appEnvironment(value: string | undefined): AppEnvironment {
  if (value === "production" || value === "staging") return value;
  return "development";
}

export const runtimeConfig = Object.freeze({
  dataSource: dataSource(process.env.NEXT_PUBLIC_DATA_SOURCE),
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ??
    "http://localhost:8787",
  environment: appEnvironment(process.env.NEXT_PUBLIC_APP_ENV),
});

export const isApiMode = runtimeConfig.dataSource === "api";

export function runtimeLabel(): string {
  const environment = {
    development: "Phát triển",
    staging: "Kiểm thử",
    production: "Chính thức",
  }[runtimeConfig.environment];

  const source =
    runtimeConfig.dataSource === "api" ? "API dịch vụ" : "Dữ liệu cục bộ";
  return `${environment} · ${source}`;
}
