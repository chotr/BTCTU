import { NextResponse } from "next/server";

export function proxy() {
  const demoEnabled =
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_MOCK_ROUTES === "true";

  if (!demoEnabled) {
    return new NextResponse("Không tìm thấy trang.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/demo/:path*"],
};
