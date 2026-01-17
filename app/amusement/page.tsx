// app/amusement/page.tsx
import type { Metadata } from "next";
import AmusementClient from "./AmusementClient";

const TITLE = "Amusement | CanCana World";
const DESC =
  "CanCana Worldのアミューズメント。ゲームタイトル一覧（左：画像／右：説明＋操作）から遊びに行けます。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/amusement" },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: "/amusement",
    images: [{ url: "/og.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export default function AmusementPage() {
  return <AmusementClient />;
}
