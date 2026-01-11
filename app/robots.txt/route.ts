// app/robots.txt/route.ts
import { NextResponse } from "next/server";

export function GET(req: Request) {
  const url = new URL(req.url);
  const host = url.host || ""; // localhost:3000 / www.cancanaworld.com など

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? url.origin).replace(/\/$/, "");
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const isVercelPreview =
    host.includes("vercel.app") || process.env.VERCEL_ENV === "preview";

  // ✅ ローカル/プレビューはクロール禁止
  if (isLocal || isVercelPreview) {
    const txt = `User-Agent: *
Disallow: /
`;
    return new NextResponse(txt, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  // ✅ 本番は allow + sitemap
  const txt = `User-Agent: *
Allow: /

Host: ${siteUrl.replace(/^https?:\/\//, "")}
Sitemap: ${siteUrl}/sitemap.xml
`;

  return new NextResponse(txt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
