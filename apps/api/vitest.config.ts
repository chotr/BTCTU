import { defineConfig } from "vitest/config";

// Route test chạy trên runtime Node (Express) trong sandbox cục bộ.
export default defineConfig({
  test: {
    environment: "node",
  },
});
