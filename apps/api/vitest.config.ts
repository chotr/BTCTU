import { defineConfig } from "vitest/config";

// Route tests use the Web API-compatible Node runtime so they remain runnable
// in local Windows sandboxes. Wrangler still validates and bundles the Worker.
export default defineConfig({
  test: {
    environment: "node",
  },
});
