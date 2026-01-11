"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ContactBackground from "./ContactBackground";

export default function ContactPageClient({ images }: { images: string[] }) {
  const youtubeUrl = "https://www.youtube.com/@cancanaroom9621";
  const xUrl = "https://x.com/serika_tink?s=21&t=5aJnfsD7wVmjSuqioj2IYA";
  const tiktokUrl = "https://www.tiktok.com/@cancana_hitomina";
  const instagramUrl = "https://www.instagram.com/cancana_4u?igsh=cDYyczluaHB3ODdp";

  // ふわっと（二段）出す
  const [pageIn, setPageIn] = useState(false);
  const [cardIn, setCardIn] = useState(false);

  useEffect(() => {
    setPageIn(false);
    setCardIn(false);
    const t1 = window.setTimeout(() => setPageIn(true), 30);
    const t2 = window.setTimeout(() => setCardIn(true), 260);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100svh",
        width: "100vw",
        background: "#000",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
        overflow: "hidden",
        opacity: pageIn ? 1 : 0,
        transition: "opacity 800ms ease",
      }}
    >
      {/* ★背景：Supportと同じ */}
      <ContactBackground images={images} count={18} />

      {/* カード */}
      <div
        className="card"
        style={{
          position: "relative",
          zIndex: 5,
          width: "100%",
          maxWidth: 720,
          borderRadius: 22,
          padding: "28px 22px",
          background: "rgba(0,0,0,0.72)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(12px)",

          opacity: cardIn ? 1 : 0,
          transform: cardIn ? "translateY(0px)" : "translateY(10px)",
          filter: cardIn ? "blur(0px)" : "blur(2px)",
          transition:
            "opacity 900ms ease, transform 900ms cubic-bezier(0.22,1,0.36,1), filter 900ms ease",
        }}
      >
        <div
          style={{
            fontSize: 18,
            letterSpacing: "0.14em",
            opacity: 0.92,
            marginBottom: 14,
          }}
        >
          Contact
        </div>

        <div
          style={{
            lineHeight: 1.9,
            opacity: 0.92,
            fontSize: 14.5,
            letterSpacing: "0.04em",
            marginBottom: 18,
          }}
        >
          お仕事のご相談・ご連絡はこちらからお願いします。
          <br />
          各種番組、イベント出演・音楽制作・ライブ出演・コラボレーションなど、
          <br />
          内容を明記の上、ご連絡いただけますと幸いです。
          <br />
          <br />
          ※まずは各SNSのDMからお願いします。
        </div>

        {/* SNS（順番：TikTok, X, Insta, YouTube） */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 10,
          }}
        >
          <IconButton href={tiktokUrl} label="TikTok">
            <TikTokIcon />
          </IconButton>

          <IconButton href={xUrl} label="X">
            <XIcon />
          </IconButton>

          <IconButton href={instagramUrl} label="Instagram">
            <InstagramIcon />
          </IconButton>

          <IconButton href={youtubeUrl} label="YouTube">
            <YouTubeIcon />
          </IconButton>
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 12,
            lineHeight: 1.7,
            opacity: 0.7,
          }}
        >
          ※ 営業・勧誘目的のご連絡には返信できない場合があります。
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 11,
            opacity: 0.5,
            letterSpacing: "0.08em",
          }}
        >
          © CanCana World
        </div>

        {/* ★Privacy Policy（SNSと同じく hover をCSSで付ける） */}
        <div style={{ marginTop: 14 }}>
          <Link href="/privacy" className="miniBtn">
            Privacy Policy
          </Link>
        </div>
      </div>

      <style>{`
        .iconBtn{
          width: 62px;
          height: 62px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          text-decoration: none;
          color: rgba(255,255,255,0.92);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          transition: transform 180ms ease, background 180ms ease, box-shadow 220ms ease;
          box-shadow: 0 0 0 rgba(255,255,255,0);
        }
        .iconBtn:hover{
          transform: translateY(-1px);
          background: rgba(255,255,255,0.10);
          box-shadow: 0 0 26px rgba(255,255,255,0.18);
        }
        .iconBtn:active{
          transform: translateY(0px);
        }

        /* ✅ Privacy Policy：小さめボタン（SNSと同じ hover/active 体系） */
        .miniBtn{
          display:inline-block;
          font-size: 12px;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.72);
          text-decoration: none;
          padding: 8px 10px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          transition: transform 180ms ease, background 180ms ease, box-shadow 220ms ease, border-color 220ms ease, color 220ms ease;
          box-shadow: 0 0 0 rgba(255,255,255,0);
          user-select: none;
        }
        .miniBtn:hover{
          transform: translateY(-1px);
          background: rgba(255,255,255,0.10);
          border-color: rgba(255,255,255,0.22);
          color: rgba(255,255,255,0.90);
          box-shadow: 0 0 18px rgba(255,255,255,0.12);
        }
        .miniBtn:active{
          transform: translateY(0px);
        }

        @media (max-width: 640px){
          .iconBtn{ width: 56px; height: 56px; }
          .card{ padding: 22px 16px; border-radius: 18px; }
        }
      `}</style>
    </main>
  );
}

function IconButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="iconBtn"
    >
      {children}
    </a>
  );
}

/* ====== Icons ====== */
function YouTubeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23 12s0-3.3-.4-4.8c-.2-.9-1-1.7-1.9-1.9C19.2 5 12 5 12 5s-7.2 0-8.7.3c-.9.2-1.7 1-1.9 1.9C1 8.7 1 12 1 12s0 3.3.4 4.8c.2.9 1 1.7 1.9 1.9C4.8 19 12 19 12 19s7.2 0 8.7-.3c.9-.2 1.7-1 1.9-1.9.4-1.5.4-4.8.4-4.8zM10 15V9l6 3-6 3z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.8l-5.3-6.8L4.8 22H2l7.4-8.6L1 2h7l4.8 6.2L18.9 2zm-1.2 18h1.7L7.2 3.9H5.4L17.7 20z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.6 3c.8 2.1 2.4 3.8 4.4 4.6v3.2c-2 0-3.9-.6-5.4-1.7v7.3c0 3.6-2.9 6.6-6.6 6.6S2.4 20 2.4 16.4s2.9-6.6 6.6-6.6c.6 0 1.1.1 1.6.2v3.5c-.5-.2-1-.4-1.6-.4-1.8 0-3.3 1.5-3.3 3.3s1.5 3.3 3.3 3.3 3.3-1.5 3.3-3.3V1h3.3v2z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5zm0 2A1.5 1.5 0 1 0 13.5 12 1.5 1.5 0 0 0 12 10.5zM17.8 6.2a.8.8 0 1 1-.8.8.8.8 0 0 1 .8-.8z" />
    </svg>
  );
}
