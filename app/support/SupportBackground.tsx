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
  if (!images?.length) return null;

  const seed = useMemo(() => hashString(images.join("|") + "|support"), [images]);
  const tiles = useMemo(() => {
    const rnd = mulberry32(seed);
    return Array.from({ length: Math.min(count, images.length * 3) }).map((_, i) => {
      const src = images[i % images.length];

      const left = rnd() * 100;
      const top = rnd() * 100;
      const rot = (rnd() * 2 - 1) * 18;
      const scale = 0.9 + rnd() * 0.5;
      const w = 28 + rnd() * 26;
      const opacity = 0.18 + rnd() * 0.18;

      return { src, left, top, rot, scale, w, opacity, key: i };
    });
  }, [seed, images, count]);

  // ★ここが「後ろのぼかし」
  const BLUR_PX = 24;
  const BRIGHT = 0.85;
  const SAT = 0.9;

  // ✅ まずは少数だけ先に出す（初回の体感を速くする）
  const FAST_TILES = 8;

  const fastTiles = useMemo(() => tiles.slice(0, Math.min(FAST_TILES, tiles.length)), [tiles]);
  const slowTiles = useMemo(() => tiles.slice(Math.min(FAST_TILES, tiles.length)), [tiles]);

  const fastSrcList = useMemo(() => {
    const s = new Set<string>();
    for (const t of fastTiles) s.add(t.src);
    return Array.from(s);
  }, [fastTiles]);

  const slowSrcList = useMemo(() => {
    const s = new Set<string>();
    for (const t of slowTiles) s.add(t.src);
    return Array.from(s);
  }, [slowTiles]);

  const [fastReady, setFastReady] = useState(false);
  const [slowReady, setSlowReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFastReady(false);
    setSlowReady(false);

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

    // ① 少数だけ先に読む → 出す
    Promise.all(fastSrcList.map(preloadOne)).then(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          setFastReady(true);
        });
      });

      // ② 余力で残りを読む → 追加分をふわっと足す
      const kick = () => {
        Promise.all(slowSrcList.map(preloadOne)).then(() => {
          if (cancelled) return;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (cancelled) return;
              setSlowReady(true);
            });
          });
        });
      };

      // idleがあれば使う（なければ少し遅らせる）
      // @ts-ignore
      if (typeof requestIdleCallback === "function") {
        // @ts-ignore
        requestIdleCallback(kick, { timeout: 1200 });
      } else {
        window.setTimeout(kick, 450);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [fastSrcList.join("|"), slowSrcList.join("|")]);

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
      {/* 先に出すレイヤー（少数） */}
      <div
        style={{
          position: "absolute",
          inset: "-10%",
          filter: `blur(${BLUR_PX}px) brightness(${BRIGHT}) saturate(${SAT})`,
          transform: "translateZ(0)",
          opacity: fastReady ? 1 : 0,
          transition: "opacity 700ms ease",
          willChange: "opacity",
        }}
      >
        {fastTiles.map((t, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={t.key}
            src={t.src}
            alt=""
            // ✅ 最初の数枚だけ優先（解像度はそのまま）
            fetchPriority={idx < 2 ? "high" : "auto"}
            loading={idx < 2 ? "eager" : "lazy"}
            decoding="async"
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

      {/* 後から足すレイヤー（残り全部） */}
      {slowTiles.length > 0 && (
        <div
          style={{
            position: "absolute",
            inset: "-10%",
            filter: `blur(${BLUR_PX}px) brightness(${BRIGHT}) saturate(${SAT})`,
            transform: "translateZ(0)",
            opacity: slowReady ? 1 : 0,
            transition: "opacity 900ms ease",
            willChange: "opacity",
          }}
        >
          {slowTiles.map((t) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={t.key}
              src={t.src}
              alt=""
              loading="lazy"
              decoding="async"
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
      )}

      {/* 周辺減光 */}
      <div
        style={{
          position: "
