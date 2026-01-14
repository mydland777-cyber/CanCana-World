// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script"; // 追加
import TransitionProvider from "./components/TransitionProvider";
import SiteMenu from "./components/SiteMenu";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
const IS_PROD =
  process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production";

// 追加（GA4測定ID）
const GA_ID = process.env.NEXT_PUBLIC_GA_ID; // 例: G-XXXXXXXXXX

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },

  description:
    "CanCana公式サイト。音楽・詩・ビジュアル・ゲームが交差する世界。アーティスト／役者としての活動に加え、TikTok LIVEでもライバーとして配信中。最新情報、作品、サポート、コンタクトはこちら。",

  // （任意だけど効く）サイト全体のキーワード
  keywords: [
    "CanCana",
    "星空奏",
    "ほしぞらかな",
    "TikTokライバー",
    "TikTok LIVE",
    "ライバー",
    "配信者",
    "ライブ配信",
    "アーティスト",
    "役者",
    "音楽",
    "詩",
    "ビジュアル",
    "ゲーム",
    "CanCana World",
  ],

  alternates: { canonical: "/" },

  openGraph: {
    title: "CanCana World",
    description:
      "音楽・詩・ビジュアル・ゲームが交差するCanCanaの世界。アーティスト／役者として活動しつつ、TikTok LIVEでもライバーとして配信中。",
    url: "/",
    siteName: "CanCana World",
    locale: "ja_JP",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "CanCana World" }],
  },

  twitter: {
    card: "summary_large_image",
    title: "CanCana World",
    description:
      "音楽・詩・ビジュアル・ゲームが交差するCanCanaの世界。TikTok LIVEでもライバーとして配信中。",
    images: ["/og.png"],
  },

  // ここが重要：本番だけ index 許可
  robots: IS_PROD
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 既存：サイト（WebSite）
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CanCana World",
    url: SITE_URL,
    inLanguage: "ja-JP",
    sameAs: [
      "https://www.youtube.com/@cancanaroom9621",
      "https://x.com/serika_tink?s=21&t=5aJnfsD7wVmjSuqioj2IYA",
      "https://www.tiktok.com/@cancana_hitomina",
      "https://www.instagram.com/cancana_4u?igsh=cDYyczluaHB3ODdp",
    ],
  };

  // 追加：人物（Person）＝TikTokライバーとしても明示
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "CanCana",
    alternateName: ["星空 奏", "ほしぞら かな"],
    description:
      "アーティスト／役者として活動しつつ、TikTok LIVEでもライバーとして配信中。",
    jobTitle: ["Artist", "Actor", "TikTok LIVE Streamer"],
    url: SITE_URL,
    sameAs: siteJsonLd.sameAs,
  };

  return (
    <html lang="ja">
      <head>
        {/* GA4（GA_IDがある時だけ） */}
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { anonymize_ip: true });
              `}
            </Script>
          </>
        ) : null}
      </head>

      <body>
        {/* 構造化データ（サイト） */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        {/* 構造化データ（人物） */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />

        <TransitionProvider>
          <SiteMenu />
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}
