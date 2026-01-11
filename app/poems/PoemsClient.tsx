"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { chalkJP } from "./poemsFont";
import type { PoemItem } from "./page";

// 表示テンポ
const HOLD_MS = 15000;
const TEXT_OUT_MS = 1000;
const BG_FADE_MS = 2600;
const TEXT_IN_DELAY = 120;

// ランダム制御（「できるだけ避ける」個数）
// ★おすすめ：5〜8くらい（“ランダム感”が残りやすい）
const AVOID_RECENT = 7;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PoemsClient({ items }: { items: PoemItem[] }) {
  const [front, setFront] = useState(0);
  const [back, setBack] = useState(0);
  const [showFront, setShowFront] = useState(true);

  const [textIndex, setTextIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);

  const switchingRef = useRef(false);

  // ★スマホ判定（幅 767px 以下をスマホ扱い）
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // タイマー（自動）管理
  const autoTimerRef = useRef<number | null>(null);
  const clearAuto = () => {
    if (autoTimerRef.current) window.clearTimeout(autoTimerRef.current);
    autoTimerRef.current = null;
  };
  const scheduleAuto = () => {
    clearAuto();
    if (items.length <= 1) return;
    autoTimerRef.current = window.setTimeout(() => {
      stepNext("auto");
    }, HOLD_MS);
  };

  // ランダム順キュー
  const orderRef = useRef<number[]>([]);
  const posRef = useRef(0);
  const recentRef = useRef<number[]>([]);

  // ✅ 直近回避の上限は「作品数」に合わせて安全に丸める
  // - len<=1 : 0
  // - len==2 : 0（候補が1つしか残らないので、直近回避は意味が薄い）
  // - len>=3 : AVOID_RECENT を最大 len-2 まで
  const effectiveRecentCap = (len: number) => {
    if (len <= 2) return 0;
    return Math.min(AVOID_RECENT, len - 2);
  };

  const pushRecent = (x: number, len: number) => {
    const cap = effectiveRecentCap(len);
    if (cap <= 0) {
      recentRef.current = [];
      return;
    }
    recentRef.current = [x, ...recentRef.current.filter((v) => v !== x)].slice(0, cap);
  };

  const buildNewOrder = (len: number) => {
    orderRef.current = shuffle([...Array(len)].map((_, i) => i));
    posRef.current = 0;
  };

  // ✅ ここが改良点：
  // 1) 直前（currentIdx）と同じは「絶対に出さない」
  // 2) その上で recent を「できるだけ避ける」
  const pickNextIndex = (len: number, currentIdx: number) => {
    if (len <= 1) return 0;

    // できるだけ recent を避けつつ、最低でも currentIdx だけは避ける
    for (let attempt = 0; attempt < len * 4; attempt++) {
      if (posRef.current >= orderRef.current.length) buildNewOrder(len);
      const cand = orderRef.current[posRef.current++];

      if (cand !== currentIdx && !recentRef.current.includes(cand)) return cand;
    }

    // recent が厳しい場合：recent外＆current外を探す
    for (let i = 0; i < len; i++) {
      if (i !== currentIdx && !recentRef.current.includes(i)) return i;
    }

    // さらに救済：とにかく current 以外を返す（これで連続は絶対に起きない）
    for (let i = 0; i < len; i++) {
      if (i !== currentIdx) return i;
    }

    return 0;
  };

  // 初期化（初回フェード）
  useEffect(() => {
    if (!items.length) return;

    switchingRef.current = false;
    clearAuto();

    buildNewOrder(items.length);
    recentRef.current = [];

    const first = pickNextIndex(items.length, -1);
    pushRecent(first, items.length);

    setFront(first);
    setBack(first);
    setShowFront(true);
    setTextIndex(first);

    setPageVisible(false);
    setTextVisible(false);

    const t1 = window.setTimeout(() => setPageVisible(true), 30);
    const t2 = window.setTimeout(() => setTextVisible(true), 520);
    const t3 = window.setTimeout(() => scheduleAuto(), 650);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      clearAuto();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // 切替本体（auto/click共通）
  const stepNext = (reason: "auto" | "click") => {
    if (items.length <= 1) return;
    if (switchingRef.current) return;

    switchingRef.current = true;
    clearAuto();

    const len = items.length;

    // ✅ 直前と同じを絶対に避ける（＋できるだけ直近回避）
    const next = pickNextIndex(len, textIndex);

    // 文字アウト
    setTextVisible(false);

    window.setTimeout(() => {
      // 背景クロスフェード開始
      setBack(next);
      setShowFront(false);

      window.setTimeout(() => {
        // 背景確定
        setFront(next);
        setShowFront(true);

        // テキスト差し替え
        setTextIndex(next);
        pushRecent(next, len);

        window.setTimeout(() => {
          // 文字イン
          setTextVisible(true);
          switchingRef.current = false;

          // 自動再開
          scheduleAuto();
        }, TEXT_IN_DELAY);
      }, BG_FADE_MS);
    }, TEXT_OUT_MS);
  };

  // アンマウント時にタイマー掃除
  useEffect(() => {
    return () => clearAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = items[textIndex];

  // ★スマホ/PCで別テーブル（長文ほど小さく）
  const fontSize = useMemo(() => {
    const len = current?.text?.length ?? 0;

    if (isMobile) {
      if (len > 1000) return 13;
      if (len > 800) return 14;
      if (len > 600) return 15;
      if (len > 420) return 16;
      return 17;
    } else {
      if (len > 1000) return 18;
      if (len > 800) return 19;
      if (len > 600) return 20;
      if (len > 420) return 21;
      return 22;
    }
  }, [current?.text, isMobile]);

  // ★行間もスマホ/PCで別テーブル：左がスマホ行間、右がPC行間
  const lineHeight = useMemo(() => {
    return isMobile ? 1.6 : 2.15;
  }, [isMobile]);

  const bgImgStyle = {
    position: "absolute" as const,
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  };

  return (
    <main
      className={chalkJP.className}
      onClick={() => stepNext("click")}
      style={{
        position: "relative",
        width: "100vw",
        height: "100svh",
        overflow: "hidden",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        opacity: pageVisible ? 1 : 0,
        transition: "opacity 1200ms ease",
        cursor: items.length > 1 ? "pointer" : "default",
        userSelect: "none",
      }}
      title={items.length > 1 ? "Click to next" : undefined}
    >
      {items.length === 0 ? (
        <div style={{ color: "#fff", opacity: 0.7 }}>
          poems がありません（photo.jpg と text.md を確認）
        </div>
      ) : (
        <>
          {/* 背景 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              filter: "brightness(0.9) contrast(0.95) saturate(0.92)",
              opacity: 1,
              transform: "translateZ(0)",
            }}
          >
            <img src={items[back].image} alt="" style={bgImgStyle} />
            <img
              src={items[front].image}
              alt=""
              style={{
                ...bgImgStyle,
                opacity: showFront ? 1 : 0,
                transition: `opacity ${BG_FADE_MS}ms ease`,
              }}
            />

            {/* ぼかし */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                opacity: 0.08,
              }}
            >
              <img
                src={items[back].image}
                alt=""
                style={{
                  ...bgImgStyle,
                  filter: "blur(16px)",
                  transform: "scale(1.06)",
                }}
              />
              <img
                src={items[front].image}
                alt=""
                style={{
                  ...bgImgStyle,
                  filter: "blur(16px)",
                  transform: "scale(1.06)",
                  opacity: showFront ? 1 : 0,
                  transition: `opacity ${BG_FADE_MS}ms ease`,
                }}
              />
            </div>
          </div>

          {/* 黒ベール */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "rgba(0,0,0,0.22)",
            }}
          />

          {/* 霞 */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "rgba(255,255,255,0.07)",
              mixBlendMode: "screen",
              opacity: 0.18,
            }}
          />

          {/* 周辺減光 */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(circle at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.62) 100%)",
            }}
          />

          {/* 詩 */}
          <div
            style={{
              position: "relative",
              zIndex: 5,
              maxWidth: 760,
              width: "100%",
              textAlign: "center",
              whiteSpace: "pre-wrap",
              fontSize,
              lineHeight,
              letterSpacing: "0.05em",
              color: "#f6f6f6",
              textShadow: "0 1px 2px rgba(0,0,0,0.75)",
              padding: "24px 12px",
              pointerEvents: "none",

              opacity: textVisible ? 1 : 0,
              transform: textVisible ? "translateY(0px)" : "translateY(18px)",
              filter: textVisible ? "blur(0px)" : "blur(2px)",
              transition: `opacity ${textVisible ? 1600 : TEXT_OUT_MS}ms ease,
                           transform ${textVisible ? 1600 : TEXT_OUT_MS}ms cubic-bezier(0.22,1,0.36,1),
                           filter ${textVisible ? 1600 : TEXT_OUT_MS}ms ease`,
            }}
          >
            {current.text}
          </div>

          <style>{`
            @media (prefers-reduced-motion: reduce){
              main{ transition:none !important; }
              div[style*="transition"]{ transition:none !important; }
            }
          `}</style>
        </>
      )}
    </main>
  );
}
