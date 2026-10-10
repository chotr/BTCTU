import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bevietnam",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BTCTU · Quản lý nhiệm vụ & đánh giá",
  description:
    "Bản demo web quản lý nhiệm vụ và đánh giá, xếp loại cho Ban Tổ chức Tỉnh ủy. Dữ liệu minh họa, không kết nối hệ thống thật.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${beVietnam.variable} font-sans`}>{children}</body>
    </html>
  );
}

