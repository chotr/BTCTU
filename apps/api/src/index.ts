import dotenv from "dotenv";

// Allow an explicit path, otherwise use the current environment's file.
const envFile =
  process.env.ENV_FILE ?? `.env.${process.env.NODE_ENV || "local"}`;
dotenv.config({ path: envFile });

import { createApp } from "./app";
import { readEnv } from "./env";

const env = readEnv();
const app = createApp(env);

app.listen(env.port, () => {
  console.log(
    `btctu-api listening on http://localhost:${env.port} (${env.environment})`,
  );
});
