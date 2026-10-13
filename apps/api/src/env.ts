export interface Env {
  port: number;
  environment: "development" | "test" | "production";
  corsOrigin: string;
  databaseUrl: string;
}