// app/poems/page.tsx
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import PoemsClient from "./PoemsClient";
import { cache } from "react";

export const runtime = "nodejs";            // ✅ fsを使うので固定
export const dynamic = "force-static";      // ✅ 可能なら静的化
export const revalidate = false;            // ✅ 更新しないなら

export type PoemItem = { id: string; text: string; image: string };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
const IS_PROD =
  process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production";

// ✅ PoemsページのSEO（ページ固有）
export const metadata: Metadata = {
  title: "Poems | CanCana World",
  description: "CanCanaの詩のギャラリー。言葉とビジュアルが交差する作品をまとめています。",
  alternates: { canonical: "/poems" },
  openGraph: {
    title: "Poems | CanCana World",
    description: "CanCanaの詩のギャラリー。言葉とビジュアルが交差する作品をまとめています。",
    url: "/poems",
    siteName: "CanCana World",
    locale: "ja_JP",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "CanCana World" }],
  },
  robots: IS_PROD ? { index: true, follow: true } : { index: false, follow: false },
  metadataBase: new URL(SITE_URL),
};

const loadItems = cache((): PoemItem[] => {
  // ✅ public/poems/{id}/text.md & photo.(jpg|png) を見る
  const base = path.join(process.cwd(), "public", "poems");
  if (!fs.existsSync(base)) return [];

  const ids = fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

  return ids
    .map((id) => {
      const textFsPath = path.join(base, id, "text.md");
      const text = fs.existsSync(textFsPath)
        ? fs.readFileSync(textFsPath, "utf8").trim()
        : "";

      const jpg = path.join(base, id, "photo.jpg");
      const png = path.join(base, id, "photo.png");

      const image = fs.existsSync(jpg)
        ? `/poems/${id}/photo.jpg`
        : fs.existsSync(png)
        ? `/poems/${id}/photo.png`
        : "";

      return { id, text, image };
    })
    .filter((x) => x.text.length > 0 && x.image.length > 0);
});

export default function PoemsPage() {
  const items = loadItems();
  return <PoemsClient items={items} />;
}
