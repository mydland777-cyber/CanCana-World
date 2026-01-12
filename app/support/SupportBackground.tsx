"use client";

import { useEffect, useMemo, useState } from "react";

type Props = { images: string[]; count?: number };

// 文字列→安定したseed（簡易ハッシュ）
function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// seed付き乱数（0〜1）
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function SupportBackground({ images, count = 18 }: Props) {
  const safeImages = images ?? [];
  if (!safeImages.length) return null;

  const seed = useMemo(() => hashString(safeImages.join("|") + "|support"), [safeImages]);
  const tiles = useMemo(() => {
    const rnd = mulberry32(seed);

    return Array.from({ length: Math.min(count, safeImages.length * 3) }).map((_, i) => {
      const src = safeImages[i % safeImages.length];

      // 位置・回転・サイズを「無茶苦茶」に（でも安定）
      const left = rnd() * 100;
      const top = rnd() * 100;
      const rot = (rnd() * 2 - 1) * 18; // -18〜18deg
      const scale = 0.9 + rnd() * 0.5; // 0.9〜1.4
      const w = 28 + rnd() * 26; // 28〜54 vw
      const opacity = 0.18 + rnd() * 0.18; // 0.18〜0.36

      return { src, left, top, rot, scale, w, opacity, key: i };
    });
  }, [seed, safeImages, count]);

  // ★ここが「後ろのぼかし」
  const BLUR_PX = 24; // ← ここを 18 / 30 とかに変える
  const BRIGHT = 0.85; // 明るさ
  const SAT = 0.9; // 彩度

  const bgImgStyle = {
    position: "absolute" as const,
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  };

  // ✅ この背景で使う画像だけをプリロード（パラパラ対策）
  const srcList = useMemo(() => {
    const uniq = new Set<string>();
    for (const t of tiles) uniq.add(t.src);
    return Array.from(uniq);
  }, [tiles]);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    const preloadOne = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        const done = () => resolve();
        img.onload = done;
        img.onerror = done;
        // @ts-ignore
        if (img.complete) done();
      });

    Promise.all(srcList.map(preloadOne)).then(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          setReady(true);
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, [srcList.join("|")]);

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#000",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* 敷き詰めレイヤー（画像は全部読み込み完了後に一括でふわっと出す） */}
      <div
        style={{
          position: "absolute",
          inset: "-10%",
          filter: `blur(${BLUR_PX}px) brightness(${BRIGHT}) saturate(${SAT})`,
          transform: "translateZ(0)",
          opacity: ready ? 1 : 0,
          transition: "opacity 800ms ease",
          willChange: "opacity",
        }}
      >
        {tiles.map((t) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={t.key}
            src={t.src}
            alt=""
            style={{
              position: "absolute",
              left: `${t.left}%`,
              top: `${t.top}%`,
              width: `${t.w}vw`,
              height: "auto",
              transform: `translate(-50%,-50%) rotate(${t.rot}deg) scale(${t.scale})`,
              opacity: t.opacity,
              borderRadius: 18,
              boxShadow: "0 30px 120px rgba(0,0,0,0.35)",
            }}
          />
        ))}
      </div>

      {/* 周辺減光（これは固定でOK） */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.72) 100%)",
        }}
      />

      {/* ✅ 霞（screen）が“ぴかぴか”の犯人になりやすいので、ready後にふわっと出す */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(255,255,255,0.06)",
          mixBlendMode: "screen",
          opacity: ready ? 0.18 : 0,
          transition: "opacity 900ms ease",
        }}
      />

      <style>{`
        @media (prefers-reduced-motion: reduce){
          *{ transition:none !important; }
        }
      `}</style>
    </div>
  );
}
