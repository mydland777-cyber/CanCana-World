"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SupportBackground from "./SupportBackground";

type Props = {
  images: string[];
  tiktokUrl: string;
  paypalUrl: string;
};

const PAGE_IN_MS = 700; // 背景のフェード
const CARD_DELAY = 220; // カードの遅れ
const CARD_IN_MS = 650; // カードのフェード

export default function SupportPageClient({ images, tiktokUrl, paypalUrl }: Props) {
  const [pageVisible, setPageVisible] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);

  useEffect(() => {
    setPageVisible(false);
    setCardVisible(false);

    const t1 = window.setTimeout(() => setPageVisible(true), 20);
    const t2 = window.setTimeout(() => setCardVisible(true), 20 + CARD_DELAY);

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
        position: "relative",
        overflow: "hidden",
        background: "#000",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,

        opacity: pageVisible ? 1 : 0,
        transition: `opacity ${PAGE_IN_MS}ms ease`,
      }}
    >
      {/* 背景：Home画像を散りばめてぼかす */}
      <SupportBackground images={images} count={18} />

      {/* カード：透過なし黒ベタ＋二段フェード */}
      <div
        className="supportCard"
        style={{
          position: "relative",
          zIndex: 5,
          width: "100%",
          maxWidth: 720,
          borderRadius: 22,
          padding: "28px 22px",
          background: "#0a0a0a", // 透過なし（黒ベタ）
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 30px 120px rgba(0,0,0,0.55)",

          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? "translateY(0px)" : "translateY(10px)",
          filter: cardVisible ? "blur(0px)" : "blur(2px)",
          transition: `opacity ${CARD_IN_MS}ms ease, transform ${CARD_IN_MS}ms cubic-bezier(0.22,1,0.36,1), filter ${CARD_IN_MS}ms ease`,
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
          ♡ Support
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
          ☆{" "}
          <strong>
            <em>TikTok Live Support</em>
          </strong>
          <br />
          TikTok Liveのコインチャージが行えます。
          <br />
          通常アプリから購入するより
          <br />
          約25％ほどお得にご利用いただけます。
          <br />
          <br />
          ☆{" "}
          <strong>
            <em>PayPal Support</em>
          </strong>
          <br />
          ここでいただいたサポートは、
          <br />
          ライブ活動・音源制作・グッズ制作など
          <br />
          CanCanaの創作活動に大切に使わせていただきます。
          <br />
          <br />
          あなたの応援が、次の作品につながっています。
          <br />
          いつも本当にありがとうございます。
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <SupportButton href={tiktokUrl} label="TikTok Live Support" />
          <SupportButton href={paypalUrl} label="PayPal Support" />
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 12,
            lineHeight: 1.7,
            opacity: 0.7,
          }}
        >
          ※ ご支援は返金対象外となります。
          <br />
          応援の気持ちとして、無理のない範囲でご理解いただけますと幸いです。
          <br />
          内容をご理解のうえ、ご自身の判断でお願いいたします。
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

        {/* ★Privacy Policy（カード内で統一感） */}
        <div style={{ marginTop: 14 }}>
          <Link href="/privacy" className="policyLink" aria-label="Privacy Policy">
            Privacy Policy
          </Link>
        </div>
      </div>

      <style>{`
        /* ボタン発光（控えめで上品） */
        .supportBtn{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          padding:14px 14px;
          border-radius:16px;
          text-decoration:none;
          color:rgba(255,255,255,0.92);
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.12);
          letter-spacing:0.06em;
          font-size:14px;
          transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease, border-color 220ms ease;
          will-change: transform, box-shadow;
        }
        .supportBtn:hover{
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.18),
            0 8px 30px rgba(255,255,255,0.12);
          transform: translateY(-1px);
        }
        .supportBtn:active{
          transform: translateY(0px);
        }

        /* Privacy Policy（カード内の薄いボタン） */
        .policyLink{
          font-size: 12px;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.72);
          text-decoration: none;
          padding: 8px 10px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          display: inline-block;
          transition: background 200ms ease, border-color 200ms ease, box-shadow 220ms ease, transform 220ms ease;
        }
        .policyLink:hover{
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.14);
          box-shadow: 0 0 22px rgba(255,255,255,0.10);
          transform: translateY(-1px);
        }
        .policyLink:active{
          transform: translateY(0px);
        }

        @media (max-width: 640px){
          .supportCard{ padding: 22px 16px; border-radius: 18px; }
        }
        @media (prefers-reduced-motion: reduce){
          main{ transition:none !important; }
          .supportCard{ transition:none !important; }
          .supportBtn{ transition:none !important; }
          .policyLink{ transition:none !important; }
        }
      `}</style>
    </main>
  );
}

function SupportButton({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="supportBtn">
      <span>{label}</span>
      <span style={{ opacity: 0.7, fontSize: 13 }}>↗</span>
    </a>
  );
}
