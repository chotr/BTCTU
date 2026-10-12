export type Env = {
  environment: string;
  corsOrigin: string;
  port: number;
};

export function readEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return {
    environment: source.ENVIRONMENT ?? "local",
    corsOrigin: source.CORS_ORIGIN ?? "http://localhost:3000",
    port: Number(source.PORT ?? 8787),
  };
}
