// app/amusement/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Amusement | CanCana World",
  description: "CanCana Worldのアミューズメント。ミニゲームを追加していくコーナー。",
  alternates: { canonical: "/amusement" },
  openGraph: {
    title: "Amusement | CanCana World",
    description: "CanCana Worldのアミューズメント。ミニゲームを追加していくコーナー。",
    url: "/amusement",
  },
  robots: { index: true, follow: true },
};

export default function AmusementPage() {
  return (
    <main style={{ padding: "24px 16px", maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Amusement
      </h1>
      <p style={{ opacity: 0.85, marginBottom: 20 }}>
        ミニゲーム置き場。今後どんどん追加していきます🎮
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        <Link
          href="/amusement/thread"
          style={{
            display: "block",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 16,
            padding: 14,
            textDecoration: "none",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            糸通し（Thread）
          </div>
          <div style={{ opacity: 0.85, fontSize: 14, lineHeight: 1.5 }}>
            長押しで上昇、離すと下降。針孔を通してスコアを稼ぐ🧵🪡
          </div>
        </Link>
      </div>
    </main>
  );
}
