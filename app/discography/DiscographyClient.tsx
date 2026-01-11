"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { DiscItem } from "./page";

export default function DiscographyClient({ items }: { items: DiscItem[] }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const els = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    els.forEach((el, i) => el.style.setProperty("--d", `${Math.min(i * 80, 520)}ms`));

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  return (
    <main className="page">
      <div className="wrap" ref={rootRef}>
        <h1 className="title">Discography</h1>

        {items.length === 0 ? (
          <div className="empty">content/discography に作品がありません</div>
        ) : (
          <div className="list">
            {items.map((item, i) => {
              const reverse = i % 2 === 1;

              const lines = (item.info ?? "").split(/\r?\n/);
              const infoTitle = (lines[0] ?? "").trim();
              const infoBody = lines.slice(1).join("\n").replace(/^\n+/, "");

              const alt = infoTitle ? `${infoTitle} cover` : "Cover";

              return (
                <section key={item.id} className={`row reveal ${reverse ? "rev" : ""}`}>
                  <div className="coverCol">
                    <div className="coverBox">
                      <Image
                        src={item.cover}
                        alt={alt}
                        fill
                        className="coverImg"
                        // ここが重要：実際の表示サイズに合わせて配信サイズを最適化
                        sizes="(max-width: 820px) 78vw, (max-width: 1120px) 48vw, 420px"
                        // 最初の1枚だけ優先読み込み（やりすぎると逆に重くなる）
                        priority={i === 0}
                        quality={82}
                      />
                      <div className="coverGlow" aria-hidden />
                    </div>
                  </div>

                  <div className="textCol">
                    <div className="textBlock">
                      <div className="info">
                        {infoTitle && <div className="infoTitle">{infoTitle}</div>}
                        {infoBody && <div className="infoBody">{infoBody}</div>}
                      </div>

                      {item.buyUrl && (
                        <div className="btnRow">
                          <Link href={item.buyUrl} target="_blank" className="buyBtn">
                            Buy
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .page{
          min-height: 100svh;
          background:#000;
          color:#fff;
          padding: 68px 18px;
          position: relative;
          overflow:hidden;
        }
        .page::before{
          content:"";
          position:absolute; inset:0;
          pointer-events:none;
          background:
            radial-gradient(circle at center, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.00) 55%),
            rgba(255,255,255,0.02);
          mix-blend-mode: screen;
          opacity: 0.55;
        }
        .page::after{
          content:"";
          position:absolute; inset:0;
          pointer-events:none;
          background: radial-gradient(circle at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%);
        }

        .wrap{
          position:relative;
          max-width: 1120px;
          margin:0 auto;
          z-index:1;
        }
        .title{
          font-size: 18px;
          letter-spacing: 0.10em;
          opacity: 0.86;
          margin: 0 0 30px 0;
        }
        .empty{ opacity:0.7; }

        .list{
          display:flex;
          flex-direction:column;
          gap: 54px;
        }

        .row{
          display:grid;
          grid-template-columns: minmax(280px, 460px) 1fr;
          gap: 26px;
          align-items:center;

          /* ✅ 長い一覧で効く：画面外のレンダリングを遅らせる */
          content-visibility: auto;
          contain-intrinsic-size: 540px;
        }

        .row.rev .coverCol{ order: 2; display:flex; justify-content:flex-end; }
        .row.rev .textCol{ order: 1; }
        .coverCol{ display:flex; justify-content:flex-start; }

        .row.rev .textCol{
          display:flex;
          justify-content:flex-end;
        }
        .textBlock{
          width: 100%;
        }
        .row.rev .textBlock{
          margin-right: -50px;
          width: fit-content;
          max-width: 100%;
        }

        .row.rev .infoTitle,
        .row.rev .infoBody{
          text-align: left;
        }

        .coverBox{
          width: 420px;
          max-width: 48vw;
          aspect-ratio: 1 / 1;
          border-radius: 14px;
          overflow:hidden;
          background: rgba(255,255,255,0.06);
          position:relative;
          transform: translateZ(0);
        }

        /* next/image は fill で absolute になるので、width/heightは不要 */
        .coverImg{
          object-fit:cover;
          filter: contrast(0.98) saturate(0.92) brightness(1.02);
          transform: scale(1.01);
          transition: transform 900ms ease, filter 900ms ease;
        }

        .coverGlow{
          position:absolute; inset:0;
          background: radial-gradient(circle at 40% 35%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%);
          opacity:0.7;
          pointer-events:none;
        }
        .coverBox:hover .coverImg{
          transform: scale(1.04);
          filter: contrast(1.02) saturate(0.98) brightness(1.04);
        }

        .info{ opacity: 0.92; }

        .infoTitle{
          white-space: pre-wrap;
          font-size: 20px;
          line-height: 1.65;
          letter-spacing: 0.08em;
          opacity: 0.96;
          margin-bottom: 36px;
        }

        .infoBody{
          white-space: pre-wrap;
          line-height: 2.05;
          font-size: 16px;
          opacity: 0.92;
          font-variant-numeric: tabular-nums;
        }

        .btnRow{
          margin-top: 18px;
          display: flex;
          justify-content: flex-start;
        }

        /* ★Buy：Supportボタンと同じホバー/押下アクション（仕様は不変） */
        .buyBtn{
          display:inline-block;
          padding: 12px 18px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.38);
          color:#fff;
          text-decoration:none;
          letter-spacing: 0.10em;
          font-size: 12px;
          opacity: 0.92;
          background: rgba(255,255,255,0.04);

          transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease, border-color 220ms ease;
          will-change: transform, box-shadow;
        }
        .buyBtn:hover{
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.18),
            0 8px 30px rgba(255,255,255,0.12);
          transform: translateY(-1px);
          opacity: 1;
        }
        .buyBtn:active{
          transform: translateY(0px);
          opacity:0.96;
        }

        .reveal{
          opacity: 0;
          transform: translateY(22px);
          transition:
            opacity 1100ms ease,
            transform 1300ms cubic-bezier(0.22,1,0.36,1),
            filter 1100ms ease;
          transition-delay: var(--d, 0ms);
          filter: blur(2px);
        }
        .reveal.in{
          opacity: 1;
          transform: translateY(0px);
          filter: blur(0px);
        }

        @media (max-width: 820px){
          .page{ padding: 56px 14px; }
          .list{ gap: 42px; }
          .row{ grid-template-columns: 1fr; gap: 35px; }
          .row.rev .coverCol,
          .coverCol{ order: 1 !important; justify-content:center !important; }
          .row.rev .textCol,
          .textCol{ order: 2 !important; }

          .row.rev .textCol{ display:block; }
          .textBlock{ width: 100% !important; }

          .coverBox{ width: 78vw; max-width: 520px; border-radius: 16px; }

          .infoTitle{
            font-size: 18px;
            line-height: 1.6;
            text-align:left;
            margin-bottom: 20px;
          }
          .infoBody{ font-size: 15px; line-height: 2.0; text-align:left; }

          .btnRow{ justify-content: flex-start; }
        }

        @media (prefers-reduced-motion: reduce){
          .reveal, .buyBtn, .coverImg{
            transition: none !important;
          }
          .reveal{ opacity: 1 !important; transform: none !important; filter:none !important; }
        }
      `}</style>
    </main>
  );
}
