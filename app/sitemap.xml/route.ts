// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").replace(
  /\/$/,
  ""
);

function xmlEscape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(req: Request) {
  // ✅ ローカル/プレビューは出さない（公開前の事故防止）
  const url = new URL(req.url);
  const host = url.host || "";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const isVercelPreview =
    host.includes("vercel.app") || process.env.VERCEL_ENV === "preview";

  if (isLocal || isVercelPreview) {
    return new NextResponse("", { status: 404 });
  }

  const now = new Date().toISOString();
  const routes = ["/", "/poems", "/discography", "/support", "/contact", "/privacy"];

  const urls = routes
    .map((p) => {
      const loc = `${SITE_URL}${p}`;
      const changefreq = p === "/" ? "weekly" : "monthly";
      const priority = p === "/" ? "1.0" : "0.6";

      return `
  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
