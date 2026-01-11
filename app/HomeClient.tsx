"use client";

import { useEffect, useRef, useState } from "react";

const HOLD_MS = 10000;
const FADE_IN_MS = 3200;
const FADE_OUT_MS = 2000;
const SHARPEN_MS = 1200;
const PAGE_IN_MS = 900;

// ★直近回避（“できるだけ”）
// 画像が多いなら 3〜5 くらいが自然。少ない場合は中で安全に丸めます。
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

  // 0→1 を切り替えるだけ（ちらつき少ない）
  const [mix, setMix] = useState(1); // 1=front表示 / 0=back表示
  const [blurred, setBlurred] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);

  const idxRef = useRef(0);

  // ===== ランダム順キュー（Poemsと同じ思想）=====
  const orderRef = useRef<number[]>([]);
  const posRef = useRef(0);
  const recentRef = useRef<number[]>([]);

  // ✅ 直近回避の上限を「画像枚数」に合わせて安全に丸める
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

  // ✅ 直前（currentIdx）と同じは「絶対に出さない」＋直近は“できるだけ”避ける
  const pickNextIndex = (len: number, currentIdx: number) => {
    if (len <= 1) return 0;

    for (let attempt = 0; attempt < len * 4; attempt++) {
      if (posRef.current >= orderRef.current.length) buildNewOrder(len);
      const cand = orderRef.current[posRef.current++];

      if (cand !== currentIdx && !recentRef.current.includes(cand)) return cand;
    }

    // recentが厳しい場合：recent外＆current外を探す
    for (let i = 0; i < len; i++) {
      if (i !== currentIdx && !recentRef.current.includes(i)) return i;
    }

    // 最終救済：とにかく current 以外（これで連続は絶対に起きない）
    for (let i = 0; i < len; i++) {
      if (i !== currentIdx) return i;
    }

    return 0;
  };

  useEffect(() => {
    if (!images.length) return;

    // 入場フェード
    setPageVisible(false);
    const p = window.setTimeout(() => setPageVisible(true), 30);

    const len = images.length;

    // ランダム順キュー初期化
    buildNewOrder(len);
    recentRef.current = [];

    // 初回ランダム（直前なしなので currentIdx=-1）
    const start = pickNextIndex(len, -1);
    idxRef.current = start;
    setFront(start);
    setBack(start);
    pushRecent(start, len);

    // 初回：ボケ→くっきり
    setMix(1);
    setBlurred(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setBlurred(false)));

    const interval = window.setInterval(() => {
      const next = pickNextIndex(len, idxRef.current);

      // 次を裏に仕込む
      setBack(next);

      // OUT（frontを0へ）
      setMix(0);

      // OUT完了後にfront確定→IN（mixを1へ）
      window.setTimeout(() => {
        setFront(next);
        idxRef.current = next;
        pushRecent(next, len);

        // 仕込み（ボケ→くっきり）
        setBlurred(true);

        // IN
        requestAnimationFrame(() => {
          setMix(1);
          requestAnimationFrame(() =>
            requestAnimationFrame(() => setBlurred(false))
          );
        });
      }, FADE_OUT_MS);
    }, HOLD_MS);

    return () => {
      window.clearTimeout(p);
      window.clearInterval(interval);
    };
  }, [images]);

  const frontSrc = images[front] ?? "";
  const backSrc = images[back] ?? "";

  // ★枠が出にくいマスク（角が立たない）
  const meltMask = {
    WebkitMaskImage:
      "radial-gradient(closest-side, rgba(0,0,0,1) 42%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0) 100%)",
    maskImage:
      "radial-gradient(closest-side, rgba(0,0,0,1) 42%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0) 100%)",
  };

  // mixでIN/OUTを分ける
  const opacityTransition =
    mix >= 1
      ? `opacity ${FADE_IN_MS}ms ease-out`
      : `opacity ${FADE_OUT_MS}ms ease-in`;

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
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: "scale(1.25) translateZ(0)",
          filter: "blur(20px) brightness(0.5)",
          willChange: "opacity, transform, filter",
        }}
      >
        {/* back */}
        <img
          src={backSrc}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* front */}
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

      {/* ベール */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.33)",
        }}
      />

      {/* 手前（2枚だけ） */}
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
        {/* back（薄く） */}
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

        {/* front（ボケ→くっきり＋IN/OUT） */}
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

      <style>{`
        @media (prefers-reduced-motion: reduce){
          main{ transition:none !important; }
          img{ transition:none !important; }
        }
      `}</style>
    </main>
  );
}
