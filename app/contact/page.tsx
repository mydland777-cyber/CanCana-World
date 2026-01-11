// app/contact/page.tsx
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

// ✅ ContactページのSEO（ページ固有）
export const metadata: Metadata = {
  title: "Contact",
  description: "CanCanaへのお問い合わせページ。お仕事のご依頼・ご連絡はこちらから。",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | CanCana World",
    description: "CanCanaへのお問い合わせページ。お仕事のご依頼・ご連絡はこちらから。",
    url: "/contact",
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
  robots: {
    index: true,
    follow: true,
  },
};

function listAllImages(dir: string) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, "en"));
}

export default function ContactPage() {
  const homeDir = path.join(process.cwd(), "public", "home");
  const homeFiles = listAllImages(homeDir);
  const images = homeFiles.map((f) => `/home/${f}`);

  // ✅ Contact用の構造化データ（問い合わせ導線）
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact | CanCana World",
    url: `${SITE_URL}/contact`,
    isPartOf: {
      "@type": "WebSite",
      name: "CanCana World",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactPageClient images={images} />
    </>
  );
}
