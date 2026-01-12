"use client";

import { useEffect, useRef, useState } from "react";

const HOLD_MS = 10000;
const FADE_IN_MS = 3200;
const FADE_OUT_MS = 2000;
const SHARPEN_MS = 1200;
const PAGE_IN_MS = 1200;

// 直近回避
const AVOID_RECENT = 4;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HomeClient({ images }: { images: string[] }) {
  const [front, setFront] = useState(0);
  const [back, setBack] = useState(0);

  // 1→0 を切り替えるだけ
  const [mix, setMix] = useState(1);
  const [blurred, setBlurred] = useState(false);

  // ✅ 初回：画像プリロード完了後に“ふわっ”と出す
  const [pageVisible, setPageVisible] = useState(false);
  const [bgReady, setBgReady] = useState(false);

  const idxRef = useRef(0);

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

  useEffect(() => {
    if (!images.length) return;

    const len = images.length;

    // 初回は“黒”から
    setPageVisible(false);
    setBgReady(false);

    // キュー初期化
    buildNewOrder(len);
    recentRef.current = [];

    // 初回ランダム
    const start = pickNextIndex(len, -1);
    idxRef.current = start;
    pushRecent(start, len);

    // ✅ 先に1枚目をプリロードしてから表示開始（パッを消す）
    const img = new Image();
    img.src = images[start];

    const onOk = () => {
      setFront(start);
      setBack(start);
      setMix(1);

      // 初回：ボケ→くっきり
      setBlurred(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setBlurred(false)));

      setBgReady(true);
      // ふわっと入場（CSSトランジションが確実に走るように少し待つ）
      window.setTimeout(() => setPageVisible(true), 30);
    };

    img.onload = onOk;
    img.onerror = onOk;

    const interval = window.setInterval(() => {
      const next = pickNextIndex(len, idxRef.current);

      // 次を裏に仕込む
      setBack(next);

      // OUT
      setMix(0);

      // OUT完了後にfront確定→IN
      window.setTimeout(() => {
        setFront(next);
        idxRef.current = next;
        pushRecent(next, len);

        setBlurred(true);

        requestAnimationFrame(() => {
          setMix(1);
          requestAnimationFrame(() => requestAnimationFrame(() => setBlurred(false)));
        });
      }, FADE_OUT_MS);
    }, HOLD_MS);

    return () => {
      window.clearInterval(interval);
      img.onload = null;
      img.onerror = null;
    };
  }, [images]);

  const frontSrc = images[front] ?? "";
  const backSrc = images[back] ?? "";

  const meltMask = {
    WebkitMaskImage:
      "radial-gradient(closest-side, rgba(0,0,0,1) 42%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0) 100%)",
    maskImage:
      "radial-gradient(closest-side, rgba(0,0,0,1) 42%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0) 100%)",
  };

  const opacityTransition =
    mix >= 1 ? `opacity ${FADE_IN_MS}ms ease-out` : `opacity ${FADE_OUT_MS}ms ease-in`;

  return (
    <main
      style={{
        position: "relative",
        width: "100vw",
        height: "100svh",
        overflow: "hidden",
        background: "#000",
        opacity: pageVisible ? 1 : 0,
        transition: `opacity ${PAGE_IN_MS}ms ease`,
      }}
    >
      {/* 背景（同じ画像を拡大してボケ） */}
      {bgReady && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: "scale(1.25) translateZ(0)",
            filter: "blur(20px) brightness(0.5)",
            willChange: "opacity, transform, filter",
          }}
        >
          <img
            src={backSrc}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <img
            src={frontSrc}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: mix,
              transition: opacityTransition,
              willChange: "opacity",
            }}
          />
        </div>
      )}

      {/* ベール */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.33)" }} />

      {/* 手前（2枚だけ） */}
      {bgReady && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <img
            src={backSrc}
            alt=""
            style={{
              position: "absolute",
              maxWidth: "98vw",
              maxHeight: "98svh",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              opacity: 1 - mix,
              transition: `opacity ${FADE_OUT_MS}ms ease-in`,
              filter: "blur(10px)",
              transform: "translateZ(0)",
              willChange: "opacity, filter",
              ...meltMask,
            }}
          />

          <img
            src={frontSrc}
            alt=""
            style={{
              position: "absolute",
              maxWidth: "98vw",
              maxHeight: "98svh",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              opacity: mix,
              transition: `${opacityTransition}, filter ${SHARPEN_MS}ms ease-out`,
              filter: blurred ? "blur(10px)" : "blur(0px)",
              transform: "translateZ(0)",
              willChange: "opacity, filter",
              ...meltMask,
            }}
          />
        </div>
      )}

      <style>{`
        @media (prefers-reduced-motion: reduce){
          main{ transition:none !important; }
          img{ transition:none !important; }
        }
      `}</style>
    </main>
  );
}
