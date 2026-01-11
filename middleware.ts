// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const IS_PROD =
  process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production";

export function middleware(_req: NextRequest) {
  const res = NextResponse.next();

  // ✅ 本番以外（ローカル/Preview）はクロール禁止
  if (!IS_PROD) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, nocache");
  }

  return res;
}

export const config = {
  matcher: "/:path*",
};
