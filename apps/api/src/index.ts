import { createApp } from "./app";
import { readEnv } from "./env";

const env = readEnv();
const app = createApp(env);

app.listen(env.port, () => {
  console.log(
    `btctu-api listening on http://localhost:${env.port} (${env.environment})`,
  );
});
