import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { StoreProvider } from "@/components/store-provider";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bevietnam",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BTCTU · Quản lý nhiệm vụ & đánh giá",
  description:
    "Hệ thống quản lý nhiệm vụ, KPI, đánh giá và xếp loại cho Ban Tổ chức Tỉnh ủy.",
  icons: {
    icon: "/quoc-huy.png",
    shortcut: "/quoc-huy.png",
    apple: "/quoc-huy.png",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${beVietnam.variable} font-sans`}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
