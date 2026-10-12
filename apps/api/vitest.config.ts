import { defineConfig } from "vitest/config";

// Test route dùng runtime Node tương thích Web API để vẫn chạy được
// trong sandbox Windows cục bộ. Wrangler vẫn kiểm tra và đóng gói Worker.
export default defineConfig({
  test: {
    environment: "node",
  },
});
