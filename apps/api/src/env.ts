export type Env = {
  environment: string;
  corsOrigin: string;
  port: number;
  databaseUrl: string;
};

export function readEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const databaseUrl = source.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  return {
    environment: source.ENVIRONMENT ?? "local",
    corsOrigin: source.CORS_ORIGIN ?? "http://localhost:3000",
    port: Number(source.PORT ?? 8787),
    databaseUrl,
  };
}
