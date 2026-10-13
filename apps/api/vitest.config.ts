import path from "node:path";
import { defineConfig } from "vitest/config";

// Route test chạy trên runtime Node (Express) trong sandbox cục bộ.
export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});

