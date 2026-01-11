// app/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

// ✅ PrivacyページのSEO（ページ固有）
export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "CanCana Worldのプライバシーポリシー。取得する情報、利用目的、Cookie、アクセス解析、第三者提供、保存期間などについて。",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | CanCana World",
    description:
      "CanCana Worldのプライバシーポリシー。取得する情報、利用目的、Cookie、アクセス解析、第三者提供、保存期間などについて。",
    url: "/privacy",
    siteName: "CanCana World",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/logo.png", // 今はロゴでOK（後で /og.png でもOK）
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

export default function PrivacyPage() {
  const email = "support@cancanaworld.com";

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
      }}
    >
      {/* うっすら背景 */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 22%, rgba(255,255,255,0.08), rgba(0,0,0,0) 56%)",
          mixBlendMode: "screen",
          opacity: 0.22,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.75) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        className="card"
        style={{
          position: "relative",
          zIndex: 5,
          width: "100%",
          maxWidth: 860,
          borderRadius: 22,
          padding: "28px 22px",
          background: "rgba(0,0,0,0.74)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 30px 120px rgba(0,0,0,0.55)",
          backdropFilter: "blur(12px)",
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
          Privacy Policy
        </div>

        <div
          style={{
            fontSize: 13.5,
            lineHeight: 1.9,
            letterSpacing: "0.04em",
            opacity: 0.9,
            whiteSpace: "pre-wrap",
          }}
        >
          {`CanCana World（以下、「当サイト」）は、訪問者の個人情報の保護を重要な責務と考え、以下のとおりプライバシーポリシーを定めます。

1. 取得する情報
当サイトでは、以下の情報を取得する場合があります。
・お問い合わせ時に入力された情報（氏名/連絡先/本文等）
・ゲーム機能（将来実装含む）において入力される名前・イニシャル・スコア等
・アクセス解析ツール等により収集される閲覧情報（Cookie、IPアドレス、閲覧ページ、参照元、端末情報等）

2. 利用目的
取得した情報は、以下の目的のために利用します。
・お問い合わせへの対応
・当サイト運営およびコンテンツ改善
・ゲーム機能におけるランキング表示、利用状況の把握、不正防止
・利用状況の分析およびサービス向上

3. アクセス解析ツールについて
当サイトでは、サービス向上のために Google Analytics / Vercel Analytics 等を利用する場合があります。
これらのツールは Cookie 等を使用してトラフィックデータを収集することがあります。収集されるデータは匿名であり、個人を特定するものではありません。

4. Cookie（クッキー）等の利用
利用者はブラウザ設定により Cookie を無効にすることができます。
無効にした場合、一部機能が正しく動作しないことがあります。
※当サイトの一部機能（例：ゲームの進行状況・演出の回数管理等）に、ブラウザの保存領域（localStorage 等）を利用する場合があります。

【ひみつのヒント♡】
当サイトには、HOME画面タップ回数に応じて表示が変化する演出や、メッセージ入力ができる機能があります。
よかったら、ちょっとだけ試してみてね♡
（100回タップでメッセージ入力、1000回タップで・・・？）

5. 第三者提供について
当サイトは、本人の同意がある場合、または法令に基づく場合を除き、個人情報を第三者に開示・提供しません。

6. 外部リンクについて
当サイトには外部サイトへのリンク（YouTube / TikTok / X / Instagram 等）が含まれます。
リンク先サイトにおける個人情報の取扱いについて、当サイトは責任を負いかねます。

7. 保存期間
当サイトは、利用目的の達成に必要な範囲で情報を保持し、不要となった場合は適切な方法で削除または匿名化します。
（ゲームのランキング情報等は、企画・運用上の都合により一定期間表示・保存される場合があります。）

8. 安全管理措置
当サイトは、個人情報への不正アクセス、漏えい、改ざん等を防止するため、合理的な安全対策に努めます。

9. 未成年者の利用について
未成年者が当サイトを利用する場合は、保護者の同意を得たうえでご利用ください。

10. 本ポリシーの変更
法令の変更やサービス内容の変更等により、予告なく改定されることがあります。
改定後の内容は当サイト上に掲載した時点から効力を生じるものとします。

11. お問い合わせ
プライバシーポリシーに関するお問い合わせ：
${email}`}
        </div>

        {/* 下部ナビ */}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link href="/" className="miniLink">
            Home
          </Link>
          <Link href="/support" className="miniLink">
            Support
          </Link>
          <Link href="/contact" className="miniLink">
            Contact
          </Link>
        </div>
      </div>

      <style>{`
        .miniLink{
          font-size: 12px;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.78);
          text-decoration: none;
          padding: 8px 10px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          transition: transform 180ms ease, background 180ms ease;
        }
        .miniLink:hover{
          transform: translateY(-1px);
          background: rgba(255,255,255,0.09);
        }
        @media (max-width: 640px){
          .card{ padding: 22px 16px; border-radius: 18px; }
        }
      `}</style>
    </main>
  );
}
