"use client";

import Link from "next/link";
import PhaserBackdrop from "./PhaserBackdrop";

type GameItem = {
  id: string;
  title: string;
  desc: string;
  controls: string;
  thumb?: string; // TODO: publicにWebPを置く（例: /amusement/thumbs/xxx.webp）
  href?: string;
  comingSoon?: boolean;
  tag?: string;
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

function emitFocus(
  detail: Partial<{
    x: number;
    y: number;
    ring: number;
    mode: "idle" | "hover" | "coming";
  }>
) {
  window.dispatchEvent(new CustomEvent("cancana-amuse-focus", { detail }));
}

export default function AmusementClient() {
    return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(0deg, rgba(0,0,0,0.55), rgba(0,0,0,0.55))," +
          "url(/amusement/bg.webp)",
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(1200px 700px at 50% 20%, rgba(0,0,0,0.10), rgba(0,0,0,0.75))",
          pointerEvents: "none",
        }}
      />

      <main
        style={{
          position: "relative",
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
              "radial-gradient(1200px 500px at 20% 10%, rgba(255,255,255,0.10), transparent 60%)," +
              "radial-gradient(900px 400px at 80% 20%, rgba(255,255,255,0.08), transparent 55%)," +
              "linear-gradient(180deg, rgba(0,0,0,0.42), rgba(0,0,0,0.28))",
          }}
          onMouseLeave={() => emitFocus({ mode: "idle", ring: 0 })}
        >
          {/* Phaser背景（背面） */}
          <PhaserBackdrop />

          <ul
            style={{
              position: "relative",
              zIndex: 1,
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
                onMouseEnter={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const x = (r.left + r.width * 0.25) / window.innerWidth;
                  const y = (r.top + r.height * 0.5) / window.innerHeight;
                  emitFocus({
                    x,
                    y,
                    ring: 1,
                    mode: it.comingSoon ? "coming" : "hover",
                  });
                }}
                onMouseMove={(e) => {
                  emitFocus({
                    x: e.clientX / window.innerWidth,
                    y: e.clientY / window.innerHeight,
                    ring: 1,
                    mode: it.comingSoon ? "coming" : "hover",
                  });
                }}
                onFocus={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const x = (r.left + r.width * 0.25) / window.innerWidth;
                  const y = (r.top + r.height * 0.5) / window.innerHeight;
                  emitFocus({
                    x,
                    y,
                    ring: 1,
                    mode: it.comingSoon ? "coming" : "hover",
                  });
                }}
                onBlur={() => emitFocus({ mode: "idle", ring: 0 })}
              >
                <div
                  className="amuse_row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px 1fr",
                    gap: 14,
                  }}
                >
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
              </li>
            ))}
          </ul>

          <style
            dangerouslySetInnerHTML={{
              __html: `
                @media (max-width: 640px){
                  .amuse_row{ grid-template-columns: 1fr !important; }
                }
              `,
            }}
          />
        </section>
      </main>
    </div>
  );
}
