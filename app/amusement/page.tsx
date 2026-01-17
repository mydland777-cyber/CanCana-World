// app/amusement/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

const TITLE = "Amusement | CanCana World";
const DESC =
  "CanCana Worldのアミューズメント。軽い演出のあと「Play」からゲーム世界へ。";

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
  return (
    <main
      style={{
        padding: "40px 16px",
        maxWidth: 960,
        margin: "0 auto",
        minHeight: "calc(100vh - 120px)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <section
        style={{
          width: "100%",
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: 20,
          padding: 18,
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(1200px 500px at 20% 10%, rgba(255,255,255,0.08), transparent 60%)," +
            "radial-gradient(900px 400px at 80% 20%, rgba(255,255,255,0.06), transparent 55%)," +
            "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
        }}
      >
        {/* 演出（CSSのみ・超軽量） */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -40,
            background:
              "conic-gradient(from 180deg, rgba(255,255,255,0.00), rgba(255,255,255,0.08), rgba(255,255,255,0.00))",
            filter: "blur(18px)",
            opacity: 0.55,
            transform: "translateZ(0)",
            animation: "cancanaSpin 10s linear infinite",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.10), transparent 45%)," +
              "radial-gradient(circle at 70% 55%, rgba(255,255,255,0.08), transparent 50%)",
            opacity: 0.7,
            animation: "cancanaFloat 3.2s ease-in-out infinite",
          }}
        />

        <div style={{ position: "relative" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "6px 0 8px" }}>
            Amusement
          </h1>
          <p style={{ opacity: 0.86, margin: "0 0 14px", lineHeight: 1.65 }}>
            ここはゲーム入口。軽い演出のあと、別ドメインのゲーム世界に飛びます🎮✨
          </p>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <a
              href="https://game.cancanaworld.com"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 16px",
                borderRadius: 999,
                textDecoration: "none",
                fontWeight: 800,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.10)",
              }}
              aria-label="Play（game.cancanaworld.com へ）"
            >
              ▶ Play
            </a>

            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 14px",
                borderRadius: 999,
                textDecoration: "none",
                fontWeight: 700,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                opacity: 0.9,
              }}
            >
              Homeへ戻る
            </Link>

            {/* 既存ミニゲーム導線（残しておくと親切） */}
            <Link
              href="/amusement/thread"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 14px",
                borderRadius: 999,
                textDecoration: "none",
                fontWeight: 700,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                opacity: 0.9,
              }}
            >
              糸通しへ
            </Link>
          </div>

          <p style={{ marginTop: 14, opacity: 0.72, fontSize: 13 }}>
            ※「Play」で外部（game.cancanaworld.com）へ移動します。
          </p>
        </div>

        {/* keyframes（CSS-in-TS） */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes cancanaSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              @keyframes cancanaFloat { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
            `,
          }}
        />
      </section>
    </main>
  );
}
