"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import TransitionLink from "./TransitionLink";

type Item =
  | { kind: "link"; href: string; label: string }
  | { kind: "poems"; href: string; label: string }
  | { kind: "external"; href: string; label: string }
  | { kind: "disabled"; label: string; note?: string };

export default function SiteMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items: Item[] = useMemo(
    () => [
      { kind: "link", href: "/", label: "Home" },
      { kind: "poems", href: "/poems", label: "Poems" },
      { kind: "link", href: "/discography", label: "Discography" },
      { kind: "link", href: "/support", label: "♡ Support" },
      { kind: "external", href: "https://cancanaworld.official.ec", label: "Store" },
      { kind: "disabled", label: "Amusement", note: "Coming soon" },
      { kind: "link", href: "/contact", label: "Contact" },
    ],
    []
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // 画面が大きくなったらメニュー閉じる
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 641) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ページ遷移したら閉じる（スマホ）
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ===== PC（横並び） ===== */}
      <nav className="menuRoot pc" aria-label="Site menu">
        <div className="menuBar">
          {items.map((it, idx) => (
            <MenuItem
              key={idx}
              item={it}
              active={it.kind === "link" || it.kind === "poems" ? isActive(it.href) : false}
            />
          ))}
        </div>
      </nav>

      {/* ===== SP（ハンバーガー） ===== */}
      <nav className="menuRoot sp" aria-label="Site menu (mobile)">
        <button
          className="hamburger"
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="hb" />
          <span className="hb" />
          <span className="hb" />
        </button>

        {open && (
          <div className="sheet" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
            <div className="panel" onClick={(e) => e.stopPropagation()}>
              <div className="panelTitle">Menu</div>

              <div className="panelList">
                {items.map((it, idx) => (
                  <MenuItem
                    key={idx}
                    item={it}
                    active={it.kind === "link" || it.kind === "poems" ? isActive(it.href) : false}
                    mobile
                    onAnyClick={() => setOpen(false)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        .menuRoot{
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 60;
          pointer-events: none;
        }
        .menuBar{
          pointer-events: auto;
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 8px 10px;
          border-radius: 999px;
          background: rgba(0,0,0,0.10);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.06);
        }

        /* ★Support/Buyと同じ「上品な発光＋浮き」アクションに統一 */
        .menuItem{
          text-decoration: none;
          color: rgba(255,255,255,0.85);
          font-size: 14px;
          letter-spacing: 0.08em;
          padding: 10px 12px;
          border-radius: 999px;
          font-weight: 400 !important;
          user-select: none;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 8px;

          /* ここだけ変更（仕様はそのまま） */
          transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease, border-color 220ms ease, color 200ms ease, opacity 200ms ease;
          will-change: transform, box-shadow;
        }
        .menuItem:hover{
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.18),
            0 8px 30px rgba(255,255,255,0.12);
          transform: translateY(-1px);
          color: rgba(255,255,255,0.98);
        }
        .menuItem:active{
          transform: translateY(0px);
        }

        .menuItem.active{
          color: rgba(255,170,200,0.95) !important;
        }
        .menuItem.disabled{
          opacity: 0.45;
          pointer-events: none;
          background: rgba(255,255,255,0.04);
        }
        .note{
          font-size: 12px;
          opacity: 0.6;
          letter-spacing: 0.06em;
        }

        .pc{ display: block; }
        .sp{ display: none; }

        @media (max-width: 640px){
          .pc{ display: none; }
          .sp{ display: block; }

          /* ★ハンバーガーも同じアクションに統一 */
          .hamburger{
            pointer-events: auto;
            width: 46px;
            height: 46px;
            border-radius: 999px;
            background: rgba(0,0,0,0.10);
            border: 1px solid rgba(255,255,255,0.06);
            backdrop-filter: blur(10px);
            display: grid;
            place-items: center;
            gap: 4px;
            padding: 10px;

            transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease, border-color 220ms ease;
            will-change: transform, box-shadow;
          }
          .hamburger:hover{
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.18);
            box-shadow:
              0 0 0 1px rgba(255,255,255,0.18),
              0 8px 30px rgba(255,255,255,0.12);
            transform: translateY(-1px);
          }
          .hamburger:active{
            transform: translateY(0px);
          }

          .hb{
            width: 18px;
            height: 2px;
            background: rgba(255,255,255,0.85);
            border-radius: 2px;
            display: block;
          }

          .sheet{
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.55);
            pointer-events: auto;
            display: flex;
            align-items: flex-start;
            justify-content: flex-end;
            padding: 14px;
          }
          .panel{
            width: min(320px, 92vw);
            border-radius: 18px;
            background: rgba(0,0,0,0.72);
            border: 1px solid rgba(255,255,255,0.10);
            backdrop-filter: blur(14px);
            box-shadow: 0 30px 120px rgba(0,0,0,0.55);
            padding: 14px;
          }
          .panelTitle{
            font-size: 14px;
            letter-spacing: 0.12em;
            opacity: 0.85;
            padding: 8px 8px 10px;
          }
          .panelList{
            display: grid;
            gap: 8px;
            padding: 4px;
          }

          .menuItem{
            width: 100%;
            justify-content: space-between;
            border-radius: 14px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            padding: 12px 12px;
          }
          .menuItem:hover{
            background: rgba(255,255,255,0.08);
          }
        }
      `}</style>
    </>
  );
}

function MenuItem({
  item,
  active,
  mobile,
  onAnyClick,
}: {
  item: Item;
  active?: boolean;
  mobile?: boolean;
  onAnyClick?: () => void;
}) {
  const cls = `menuItem ${active ? "active" : ""} ${
    item.kind === "disabled" ? "disabled" : ""
  }`;

  if (item.kind === "disabled") {
    return (
      <span className={cls} aria-disabled="true">
        <span>{item.label}</span>
        <span className="note">{item.note ?? "Coming soon"}</span>
      </span>
    );
  }

  if (item.kind === "external") {
    return (
      <a
        className={cls}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onAnyClick}
      >
        <span>{item.label}</span>
        {mobile ? <span className="note">↗</span> : null}
      </a>
    );
  }

  if (item.kind === "poems") {
    return (
      <TransitionLink href={item.href} className={cls}>
        <span>{item.label}</span>
        {mobile ? <span className="note">{active ? "Now" : ""}</span> : null}
      </TransitionLink>
    );
  }

  return (
    <Link href={item.href} className={cls} onClick={onAnyClick}>
      <span>{item.label}</span>
      {mobile ? <span className="note">{active ? "Now" : ""}</span> : null}
    </Link>
  );
}
