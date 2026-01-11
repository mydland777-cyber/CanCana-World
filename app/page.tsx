// app/page.tsx
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import HomeInteractive from "./HomeInteractive";

// ✅ Home（/）のSEO（ファイル上部）
export const metadata: Metadata = {
  title: "CanCana World",
  description:
    "CanCana公式サイト。音楽・詩・ビジュアル・ゲームが交差する世界。最新情報、作品、サポート、コンタクトはこちら。",
  alternates: {
    canonical: "/", // ✅ canonical を明示
  },
  openGraph: {
    title: "CanCana World",
    description: "音楽・詩・ビジュアル・ゲームが交差するCanCanaの世界。",
    url: "/", // ✅ layout側の metadataBase と合体して絶対URLになる
    siteName: "CanCana World",
    images: [
      {
        url: "/og.png", // ✅ いまはロゴでOK（後で /og.png にしても良い）
        width: 1200,
        height: 630,
        alt: "CanCana World",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
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

export default function HomePage() {
  // Home背景（public/home）
  const homeDir = path.join(process.cwd(), "public", "home");
  const images = listImagesInDir(homeDir, "/home");

  // Secret（おすすめ：フォルダ分け）
  const secretLuckyDir = path.join(process.cwd(), "public", "secret", "lucky");
  const secretSkullDir = path.join(process.cwd(), "public", "secret", "skull");

  const luckyFromFolders = listImagesInDir(secretLuckyDir, "/secret/lucky");
  const skullFromFolders = listImagesInDir(secretSkullDir, "/secret/skull");

  // 互換：public/secret に lucky_ / skull_ で置いてる人向け（保険）
  const secretRootDir = path.join(process.cwd(), "public", "secret");
  const luckyFromPrefix = listPrefixedInDir(secretRootDir, "/secret", "lucky_");
  const skullFromPrefix = listPrefixedInDir(secretRootDir, "/secret", "skull_");

  const luckyImages = [...luckyFromFolders, ...luckyFromPrefix];
  const skullImages = [...skullFromFolders, ...skullFromPrefix];

  return (
    <HomeInteractive
      images={images}
      luckyImages={luckyImages}
      skullImages={skullImages}
    />
  );
}
