// app/amusement/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

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

type GameItem = {
  id: string;
  title: string;
  desc: string;
  controls: string;
  thumb?: string; // TODO: publicにWebPを置く（例: /amusement/thumbs/xxx.webp）
  href?: string; // 外部 or 内部
  comingSoon?: boolean;
  tag?: string; // 例: "Unity" / "Phaser" / "Coming Soon"
};

const ITEMS: GameItem[] = [
  {
    id: "portal",
    title: "Game Portal",
    desc: "Unityゲームの入口。別ドメインのゲーム世界へ飛びます。",
    controls: "操作：ゲーム内で案内します。",
    thumb: "/amusement/thumbs/portal.webp",
    href: "https://game.cancanaworld.com",
    tag: "Unity",
  },
  {
    id: "coming-1",
    title: "Coming Soon",
    desc: "準備中…ちょいちょい増えていく予定。",
    controls: "操作：—",
    thumb: "/amusement/thumbs/coming_01.webp",
    comingSoon: true,
    tag: "Coming Soon",
  },
  {
    id: "coming-2",
    title: "Coming Soon",
    desc: "次のタイトルを制作中です。",
    controls: "操作：—",
    thumb: "/amusement/thumbs/coming_02.webp",
    comingSoon: true,
    tag: "Coming Soon",
  },
];

export default function AmusementPage() {
  return (
    <main
      style={{
        padding: "32px 16px",
        maxWidth: 980,
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "6px 0 8px" }}>
          Amusement
        </h1>
        <p style={{ opacity: 0.86, margin: 0, lineHeight: 1.65 }}>
          ゲーム置き場。左にイメージ、右に説明と操作。気になるやつからどうぞ🎮✨
        </p>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 14px",
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

          <span style={{ fontSize: 13, opacity: 0.65 }}>
            ※ Playは外部（game.cancanaworld.com）へ移動します
          </span>
        </div>
      </header>

      <section
        style={{
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: 20,
          padding: 16,
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(1200px 500px at 20% 10%, rgba(255,255,255,0.08), transparent 60%)," +
            "radial-gradient(900px 400px at 80% 20%, rgba(255,255,255,0.06), transparent 55%)," +
            "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
        }}
      >
        {/* 演出（いまはCSSのみ。次の手でここにPhaser背景レイヤーを差し込める設計にしてる） */}
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
            pointerEvents: "none",
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
            pointerEvents: "none",
          }}
        />

        <ul
          style={{
            position: "relative",
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: 12,
          }}
        >
          {ITEMS.map((it) => (
            <li
              key={it.id}
              style={{
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 18,
                background: "rgba(255,255,255,0.03)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px 1fr",
                  gap: 14,
                }}
              >
                {/* 左：画像 */}
                <div
                  style={{
                    minHeight: 140,
                    background:
                      it.thumb
                        ? `url(${it.thumb}) center / cover no-repeat`
                        : "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
                    position: "relative",
                  }}
                >
                  {/* うっすらオーバーレイ */}
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(90deg, rgba(0,0,0,0.20), rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.00))",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                {/* 右：説明＋操作 */}
                <div style={{ padding: "14px 14px 14px 0" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 18 }}>
                      {it.title}
                    </div>

                    {it.tag && (
                      <span
                        style={{
                          fontSize: 12,
                          padding: "4px 10px",
                          borderRadius: 999,
                          border: "1px solid rgba(255,255,255,0.18)",
                          background: "rgba(255,255,255,0.05)",
                          opacity: 0.9,
                        }}
                      >
                        {it.tag}
                      </span>
                    )}
                  </div>

                  <div style={{ opacity: 0.86, lineHeight: 1.6 }}>
                    {it.desc}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      opacity: 0.72,
                      lineHeight: 1.6,
                    }}
                  >
                    {it.controls}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginTop: 12,
                    }}
                  >
                    {it.comingSoon ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "10px 14px",
                          borderRadius: 999,
                          fontWeight: 800,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "rgba(255,255,255,0.03)",
                          opacity: 0.55,
                          userSelect: "none",
                        }}
                      >
                        Coming Soon
                      </span>
                    ) : (
                      <a
                        href={it.href ?? "https://game.cancanaworld.com"}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "10px 14px",
                          borderRadius: 999,
                          textDecoration: "none",
                          fontWeight: 900,
                          border: "1px solid rgba(255,255,255,0.22)",
                          background: "rgba(255,255,255,0.10)",
                        }}
                        aria-label={`${it.title} をPlay`}
                      >
                        ▶ Play
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* スマホで崩れないように */}
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                    @media (max-width: 640px){
                      li[key="${it.id}"]{}
                    }
                  `,
                }}
              />
            </li>
          ))}
        </ul>

        {/* keyframes */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes cancanaSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              @keyframes cancanaFloat { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }

              @media (max-width: 640px){
                .amuse_row{ grid-template-columns: 1fr !important; }
              }
            `,
          }}
        />
      </section>
    </main>
  );
}
