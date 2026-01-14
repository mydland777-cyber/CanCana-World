// app/page.tsx
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import HomeInteractive from "./HomeInteractive";

export const metadata: Metadata = {
  title: "CanCana World",
  description:
    "CanCana公式サイト。音楽・詩・ビジュアル・ゲームが交差する世界。アーティスト／役者としての活動に加え、TikTok LIVEでもライバーとして配信中。最新情報、作品、サポート、コンタクトはこちら。",
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
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "CanCana World" }],
    locale: "ja_JP",
    type: "website",
  },
  robots: { index: true, follow: true },
};

function listImagesInDir(absDir: string, urlPrefix: string) {
  if (!fs.existsSync(absDir)) return [];
  return fs
    .readdirSync(absDir, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, "en"))
    .map((f) => `${urlPrefix}/${f}`);
}

function listPrefixedInDir(absDir: string, urlPrefix: string, prefix: string) {
  if (!fs.existsSync(absDir)) return [];
  return fs
    .readdirSync(absDir, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .filter((f) => f.startsWith(prefix))
    .sort((a, b) => a.localeCompare(b, "en"))
    .map((f) => `${urlPrefix}/${f}`);
}

export default function HomePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const logoParam = searchParams?.logo;
  const logo = Array.isArray(logoParam) ? logoParam[0] : logoParam;
  const dbg = logo === "1";

  const sha =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.VERCEL_GIT_COMMIT_REF ??
    "no-sha";

  const homeDir = path.join(process.cwd(), "public", "home");
  const images = listImagesInDir(homeDir, "/home");

  const secretLuckyDir = path.join(process.cwd(), "public", "secret", "lucky");
  const secretSkullDir = path.join(process.cwd(), "public", "secret", "skull");

  const luckyFromFolders = listImagesInDir(secretLuckyDir, "/secret/lucky");
  const skullFromFolders = listImagesInDir(secretSkullDir, "/secret/skull");

  const secretRootDir = path.join(process.cwd(), "public", "secret");
  const luckyFromPrefix = listPrefixedInDir(secretRootDir, "/secret", "lucky_");
  const skullFromPrefix = listPrefixedInDir(secretRootDir, "/secret", "skull_");

  const luckyImages = [...luckyFromFolders, ...luckyFromPrefix];
  const skullImages = [...skullFromFolders, ...skullFromPrefix];

  return (
    <>
      {dbg && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2147483647,
            background: "#ff0",
            color: "#000",
            padding: "10px 12px",
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: "0.06em",
            pointerEvents: "none",
          }}
        >
          SERVER DEBUG: logo=1 / sha={sha}
        </div>
      )}

      <HomeInteractive
        images={images}
        luckyImages={luckyImages}
        skullImages={skullImages}
      />
    </>
  );
}
