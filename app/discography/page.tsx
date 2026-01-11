// app/discography/page.tsx
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import DiscographyClient from "./DiscographyClient";
import { cache } from "react";

export const runtime = "nodejs";            // ✅ fsを使うので固定
export const dynamic = "force-static";      // ✅ 可能なら静的化
export const revalidate = false;            // ✅ 更新しないなら

export type DiscItem = {
  id: string;
  cover: string; // publicパス
  info: string;
  buyUrl: string;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
const IS_PROD =
  process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production";

// ✅ DiscographyページのSEO（ページ固有）
export const metadata: Metadata = {
  title: "Discography",
  description:
    "CanCanaの作品一覧（Discography）。リリース情報、カバー、購入リンクをまとめています。",
  alternates: {
    canonical: "/discography",
  },
  openGraph: {
    title: "Discography | CanCana World",
    description:
      "CanCanaの作品一覧（Discography）。リリース情報、カバー、購入リンクをまとめています。",
    url: "/discography",
    siteName: "CanCana World",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "CanCana World",
      },
    ],
  },
  // ✅ 全体方針と合わせる（本番だけindex）
  robots: IS_PROD ? { index: true, follow: true } : { index: false, follow: false },
  metadataBase: new URL(SITE_URL),
};

const loadItems = cache((): DiscItem[] => {
  const publicBase = path.join(process.cwd(), "public", "discography");
  const contentBase = path.join(process.cwd(), "content", "discography");

  // id一覧は、基本は public（= coverがある側）から取る。無ければ content。
  const baseForIds = fs.existsSync(publicBase) ? publicBase : contentBase;
  if (!fs.existsSync(baseForIds)) return [];

  const ids = fs
    .readdirSync(baseForIds, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

  return ids
    .map((id) => {
      // ✅ info/buy は public優先 → なければ content
      const infoPublic = path.join(publicBase, id, "info.md");
      const infoContent = path.join(contentBase, id, "info.md");
      const infoPath = fs.existsSync(infoPublic) ? infoPublic : infoContent;

      const buyPublic = path.join(publicBase, id, "buy.url");
      const buyContent = path.join(contentBase, id, "buy.url");
      const buyPath = fs.existsSync(buyPublic) ? buyPublic : buyContent;

      const info = fs.existsSync(infoPath)
        ? fs.readFileSync(infoPath, "utf8").trim()
        : "";
      const buyUrl = fs.existsSync(buyPath)
        ? fs.readFileSync(buyPath, "utf8").trim()
        : "";

      // ✅ cover は publicのみ（jpg/png/webp対応）
      const coverWebp = path.join(publicBase, id, "cover.webp");
      const coverJpg = path.join(publicBase, id, "cover.jpg");
      const coverPng = path.join(publicBase, id, "cover.png");

      const cover = fs.existsSync(coverWebp)
        ? `/discography/${id}/cover.webp`
        : fs.existsSync(coverJpg)
        ? `/discography/${id}/cover.jpg`
        : fs.existsSync(coverPng)
        ? `/discography/${id}/cover.png`
        : "";

      return { id, cover, info, buyUrl };
    })
    // ✅ info と cover が揃ってるものだけ表示（未完成フォルダは自然に除外）
    .filter((x) => x.info.length > 0 && x.cover.length > 0);
});

export default function DiscographyPage() {
  const items = loadItems();
  return <DiscographyClient items={items} />;
}
