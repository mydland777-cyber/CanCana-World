// app/not-found.tsx
import Link from "next/link";

export const metadata = {
  title: "404 | CanCana World",
  description: "ページが見つかりませんでした。トップや作品ページからお探しください。",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100svh",
        width: "100vw",
        background: "#000",
        color: "rgba(255,255,255,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 22,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 背景：薄い光＋ビネット */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 22%, rgba(255,255,255,0.10), rgba(0,0,0,0) 55%)",
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
            "radial-gradient(circle at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.78) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "min(860px, 94vw)",
          borderRadius: 22,
          padding: "26px 20px",
          background: "rgba(0,0,0,0.72)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 30px 120px rgba(0,0,0,0.55)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            letterSpacing: "0.14em",
            opacity: 0.9,
            fontSize: 14,
            marginBottom: 6,
          }}
        >
          Not Found
        </div>

        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.08em",
            lineHeight: 1.4,
            marginBottom: 10,
          }}
        >
          404
        </div>

        <div
          style={{
            fontSize: 13.5,
            lineHeight: 1.9,
            letterSpacing: "0.04em",
            opacity: 0.86,
            whiteSpace: "pre-wrap",
          }}
        >
          {`ページが見つかりませんでした。
URLが間違っているか、ページが移動・削除された可能性があります。`}
        </div>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link href="/" className="nfLink">
            Home
          </Link>
          <Link href="/poems" className="nfLink">
            Poems
          </Link>
          <Link href="/discography" className="nfLink">
            Discography
          </Link>
          <Link href="/support" className="nfLink">
            Support
          </Link>
          <Link href="/contact" className="nfLink">
            Contact
          </Link>
        </div>
      </div>

      <style>{`
        .nfLink{
          font-size: 12px;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.82);
          text-decoration: none;
          padding: 10px 12px;
          border-radius: 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          transition: transform 180ms ease, background 180ms ease;
        }
        .nfLink:hover{
          transform: translateY(-1px);
          background: rgba(255,255,255,0.10);
        }
      `}</style>
    </main>
  );
}
