// app/support/page.tsx
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import SupportPageClient from "./SupportPageClient";

// ✅ 絶対URLのベース（今は https://example.com のままでOK）
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(
  /\/$/,
  ""
);
const PAGE_PATH = "/support";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const OG_IMAGE_URL = `${SITE_URL}/og.png`;

// ✅ SupportページのSEO（ページ固有）
export const metadata: Metadata = {
  // ✅ 相対URLを「常に」このベースで解決（最強安定）
  metadataBase: new URL(SITE_URL),

  title: "Support",
  description:
    "CanCanaの活動を応援するページ。TikTokコインやPayPalでのサポート方法はこちら。",

  // ✅ canonical 絶対URL
  alternates: {
    canonical: PAGE_URL,
  },

  openGraph: {
    title: "Support | CanCana World",
    description:
      "CanCanaの活動を応援するページ。TikTokコインやPayPalでのサポート方法はこちら。",
    // ✅ OGのurl 絶対URL
    url: PAGE_URL,
    siteName: "CanCana World",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        // ✅ OG画像も絶対URL（SNS/クローラ事故防止）
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "CanCana World",
      },
    ],
  },

  // ✅ Twitterも揃える（OGと同じ画像でOK）
  twitter: {
    card: "summary_large_image",
    title: "Support | CanCana World",
    description:
      "CanCanaの活動を応援するページ。TikTokコインやPayPalでのサポート方法はこちら。",
    images: [OG_IMAGE_URL],
  },

  robots: { index: false, follow: false, nocache: true },

};

function listAllImages(dir: string) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, "en"));
}

export default function SupportPage() {
  const tiktokUrl = "https://www.tiktok.com/coin";
  const paypalUrl =
    "https://www.paypal.com/paypalme/CanCanaWorld?country.x=JP&locale.x=ja_JP";

  // ✅ JSON-LD（構造化データ）
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Support | CanCana World",
    description:
      "CanCanaの活動を応援するページ。TikTokコインやPayPalでのサポート方法はこちら。",
    url: PAGE_URL,
    inLanguage: "ja-JP",
    isPartOf: {
      "@type": "WebSite",
      name: "CanCana World",
      url: SITE_URL,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: OG_IMAGE_URL,
      width: 1200,
      height: 630,
    },
    potentialAction: [
      { "@type": "DonateAction", target: paypalUrl },
      { "@type": "DonateAction", target: tiktokUrl },
    ],
  };

  // public/home から画像を拾う
  const dir = path.join(process.cwd(), "public", "home");
  const homeFiles = listAllImages(dir);
  const images = homeFiles.map((f) => `/home/${f}`);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SupportPageClient images={images} tiktokUrl={tiktokUrl} paypalUrl={paypalUrl} />
    </>
  );
}
