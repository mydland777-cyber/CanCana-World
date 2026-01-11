"use client";

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

export default function ContactBackground({ images, count = 18 }: Props) {
  if (!images.length) return null;

  const seed = hashString(images.join("|") + "|contact");
  const rnd = mulberry32(seed);

  const tiles = Array.from({ length: Math.min(count, images.length * 3) }).map(
    (_, i) => {
      const src = images[i % images.length];

      const left = rnd() * 100;
      const top = rnd() * 100;
      const rot = (rnd() * 2 - 1) * 18; // -18〜18deg
      const scale = 0.9 + rnd() * 0.5; // 0.9〜1.4
      const w = 28 + rnd() * 26; // 28〜54 vw
      const opacity = 0.18 + rnd() * 0.18; // 0.18〜0.36

      return { src, left, top, rot, scale, w, opacity, key: i };
    }
  );

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
      {/* 敷き詰めレイヤー */}
      <div
        style={{
          position: "absolute",
          inset: "-10%",
          filter: "blur(25px) brightness(0.85) saturate(0.9)",
          transform: "translateZ(0)",
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

      {/* 霞＋周辺減光 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.72) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(255,255,255,0.06)",
          mixBlendMode: "screen",
          opacity: 0.18,
        }}
      />
    </div>
  );
}
