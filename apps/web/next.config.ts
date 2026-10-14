import type { NextConfig } from "next";

const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "local";
const appEnvironment = process.env.NEXT_PUBLIC_APP_ENV ?? "development";

if (appEnvironment !== "development" && dataSource !== "api") {
  throw new Error(
    `Cấu hình nguồn dữ liệu không hợp lệ: NEXT_PUBLIC_APP_ENV=${appEnvironment} yêu cầu ` +
      "NEXT_PUBLIC_DATA_SOURCE=api. Dữ liệu khởi tạo cục bộ chỉ dùng cho môi trường phát triển.",
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  transpilePackages: ["@btctu/shared"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
