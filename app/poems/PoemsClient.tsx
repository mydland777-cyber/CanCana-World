"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { chalkJP } from "./poemsFont";
import type { PoemItem } from "./page";

// 表示テンポ
const HOLD_MS = 15000;
const TEXT_OUT_MS = 1000;
const BG_FADE_MS = 2600;
const TEXT_IN_DELAY = 120;

// ランダム制御
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
  // ✅ 初期チラ見え防止：-1で開始
  const [front, setFront] = useState(-1);
  const [back, setBack] = useState(-1);
  const [showFront, setShowFront] = useState(true);

  const [textIndex, setTextIndex] = useState(-1);
  const [textVisible, setTextVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);

  // ✅ 初回背景だけ「プリロード完了→フェードイン」
  const [bgReady, setBgReady] = useState(false);

  const switchingRef = useRef(false);

  // スマホ判定
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // 入場直後の誤クリック防止
  const clickEnabledRef = useRef(false);
  const clickEnableTimerRef = useRef<number | null>(null);

  // タイマー（自動）
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

  // ✅ 画像プリロード（既に読んだものは再ロードしない）
  const loadedRef = useRef<Set<string>>(new Set());
  const preload = (src: string) => {
    if (!src) return Promise.resolve();
    if (loadedRef.current.has(src)) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const img = new Image();
      img.src = src;
      const done = () => {
        loadedRef.current.add(src);
        resolve();
      };
      img.onload = done;
      img.onerror = done;
      // cacheヒット
      // @ts-ignore
      if (img.complete) done();
    });
  };

  // ランダム順キュー
  const orderRef = useRef<number[]>([]);
  const posRef = useRef(0);
  const recentRef = useRef<number[]>([]);

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

  const pickNextIndex = (len: number, currentIdx: number) => {
    if (len <= 1) return 0;

    for (let attempt = 0; attempt < len * 4; attempt++) {
      if (posRef.current >= orderRef.current.length) buildNewOrder(len);
      const cand = orderRef.current[posRef.current++];
      if (cand !== currentIdx && !recentRef.current.includes(cand)) return cand;
    }

    for (let i = 0; i < len; i++) {
      if (i !== currentIdx && !recentRef.current.includes(i)) return i;
    }
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

    // クリック無効（入場直後）
    clickEnabledRef.current = false;
    if (clickEnableTimerRef.current) window.clearTimeout(clickEnableTimerRef.current);
    clickEnableTimerRef.current = window.setTimeout(() => {
      clickEnabledRef.current = true;
      clickEnableTimerRef.current = null;
    }, 650);

    buildNewOrder(items.length);
    recentRef.current = [];

    const first = pickNextIndex(items.length, -1);
    pushRecent(first, items.length);

    // いったん未表示へ
    setFront(-1);
    setBack(-1);
    setTextIndex(-1);
    setShowFront(true);
    setTextVisible(false);
    setPageVisible(false);
    setBgReady(false);

    const t1 = window.setTimeout(() => setPageVisible(true), 30);

    // ✅ 1枚目をプリロードしてから表示開始
    let cancelled = false;
    preload(items[first].image).then(() => {
      if (cancelled) return;

      setFront(first);
      setBack(first);
      setShowFront(true);
      setTextIndex(first);

      setBgReady(true);

      window.setTimeout(() => setTextVisible(true), 220);
      window.setTimeout(() => scheduleAuto(), 420);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      clearAuto();
      if (clickEnableTimerRef.current) window.clearTimeout(clickEnableTimerRef.current);
      clickEnableTimerRef.current = null;
      clickEnabledRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // 切替本体（auto/click共通）
  const stepNext = (reason: "auto" | "click") => {
    if (items.length <= 1) return;
    if (switchingRef.current) return;
    if (textIndex < 0) return;

    switchingRef.current = true;
    clearAuto();

    const len = items.length;
    const next = pickNextIndex(len, textIndex);

    // ✅ 次の画像を先に読み込む（“パッ”防止の核心）
    const p = preload(items[next].image);

    // 文字アウト開始
    setTextVisible(false);

    window.setTimeout(async () => {
      await p;

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
          scheduleAuto();
        }, TEXT_IN_DELAY);
      }, BG_FADE_MS);
    }, TEXT_OUT_MS);
  };

  // アンマウント掃除
  useEffect(() => {
    return () => {
      clearAuto();
      if (clickEnableTimerRef.current) window.clearTimeout(clickEnableTimerRef.current);
      clickEnableTimerRef.current = null;
      clickEnabledRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = textIndex >= 0 ? items[textIndex] : null;

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

  const ready = items.length > 0 && front >= 0 && back >= 0 && textIndex >= 0 && !!current;

  return (
    <main
      className={chalkJP.className}
      onClick={() => {
        if (!clickEnabledRef.current) return;
        stepNext("click");
      }}
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
        transition: "opacity 900ms ease",
        cursor: items.length > 1 ? "pointer" : "default",
        userSelect: "none",
      }}
      title={items.length > 1 ? "Click to next" : undefined}
    >
      {items.length === 0 ? (
        <div style={{ color: "#fff", opacity: 0.7 }}>
          poems がありません（photo.jpg と text.md を確認）
        </div>
      ) : !ready ? null : (
        <>
          {/* 背景（初回だけbgReadyでフェードイン） */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              filter: "brightness(0.9) contrast(0.95) saturate(0.92)",
              opacity: bgReady ? 1 : 0,
              transition: "opacity 900ms ease",
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
            {current!.text}
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
