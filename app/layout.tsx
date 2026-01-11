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

  description:
    "CanCana公式サイト。音楽・詩・ビジュアル・ゲームが交差する世界。最新情報、作品、サポート、コンタクトはこちら。",

  alternates: { canonical: "/" },

  openGraph: {
    title: "CanCana World",
    description: "音楽・詩・ビジュアル・ゲームが交差するCanCanaの世界。",
    url: "/",
    siteName: "CanCana World",
    locale: "ja_JP",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "CanCana World" }],
  },

  twitter: {
    card: "summary_large_image",
    title: "CanCana World",
    description: "音楽・詩・ビジュアル・ゲームが交差するCanCanaの世界。",
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
  const jsonLd = {
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <TransitionProvider>
          <SiteMenu />
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}
