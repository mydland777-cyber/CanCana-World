"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Heart = {
  id: number;
  x: number;
  y: number;
  size: number;
  rot: number;
  life: number;
  born: number;
  color: string;
  isGold: boolean;
};

type Sparkle = {
  id: number;
  x: number;
  y: number;
  size: number;
  rot: number;
  life: number;
  born: number;
  dx: number;
  dy: number;
  delay: number;
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function HeartsLayer({
  enabled = true,
  onTap,
}: {
  enabled?: boolean;
  onTap?: () => void;
}) {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const idRef = useRef(1);

  // --- 連続タップ判定 ---
  const streakRef = useRef(0);
  const resetTimerRef = useRef<number | null>(null);

  // ===== 調整パラメータ =====
  // 行40: 連続タップが途切れたとみなす時間（この時間タップが無いと通常に戻る）
  const STREAK_RESET_MS = 400;

  // 行44: 100回超えたら金モード
  const GOLD_THRESHOLD = 100;

  // 行47: 今のサイズ感の「基準」：ここを好みで微調整
  const BASE_SIZE = 56;

  // 行50: サイズのブレ幅（±%）
  const SIZE_JITTER = 0.22; // 0.22 = ±22%

  // 行53: 色パレット（通常時）
  const COLORS = useMemo(
    () => ["#ff5fa8", "#3ddc84", "#4aa3ff", "#ff4d4d", "#b26bff", "#ffd24a"],
    []
  );

  // 行59: 金色
  const GOLD = "#D4AF37";

  const spawnHeart = (clientX: number, clientY: number, isGold: boolean) => {
    if (!enabled) return;

    const born = performance.now();
    const id = idRef.current++;

    // 行68: サイズ（基準±ランダム）
    const size = BASE_SIZE * rand(1 - SIZE_JITTER, 1 + SIZE_JITTER);

    // 行71: 回転
    const rot = rand(-18, 18);

    // 行74: 寿命
    const life = rand(1100, 1600);

    // 行77: 色（通常はパレットから、金モードは金色）
    const color = isGold ? GOLD : pick(COLORS);

    setHearts((prev) => [
      ...prev.slice(-90),
      { id, x: clientX, y: clientY, size, rot, life, born, color, isGold },
    ]);
  };

  const spawnSparkles = (clientX: number, clientY: number) => {
    if (!enabled) return;

    const born = performance.now();
    const baseId = idRef.current;

    // 行94: 金モード時に飛ばすスパークル数
    const n = 6;

    const next: Sparkle[] = Array.from({ length: n }).map((_, i) => {
      const id = baseId + i + 1;
      const life = rand(520, 760);
      const size = rand(10, 18);
      const rot = rand(-18, 18);

      // 行104: 飛ぶ方向（px）
      const dx = rand(-46, 46);
      const dy = rand(-54, 22);

      // 行108: ばらけさせるための遅延
      const delay = rand(0, 90);

      return {
        id,
        x: clientX + rand(-6, 6),
        y: clientY + rand(-6, 6),
        size,
        rot,
        life,
        born,
        dx,
        dy,
        delay,
      };
    });

    idRef.current += n + 1;

    setSparkles((prev) => [...prev.slice(-120), ...next]);
  };

  const resetStreakLater = () => {
    if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => {
      streakRef.current = 0;
      resetTimerRef.current = null;
    }, STREAK_RESET_MS);
  };

  useEffect(() => {
    const t = window.setInterval(() => {
      const now = performance.now();
      setHearts((prev) => prev.filter((h) => now - h.born < h.life));
      setSparkles((prev) => prev.filter((s) => now - s.born < s.life + s.delay));
    }, 120);

    return () => {
      window.clearInterval(t);
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "manipulation",
      }}
      onPointerDown={(e) => {
        // 右クリック除外
        // @ts-ignore
        if (e.button === 2) return;

        // 行170: 連続タップの更新（ここで金モード判定）
        streakRef.current += 1;
        const isGold = streakRef.current >= GOLD_THRESHOLD;

        // 行174: ハート生成
        spawnHeart(e.clientX, e.clientY, isGold);

        // 行177: 金モードならスパークル生成
        if (isGold) spawnSparkles(e.clientX, e.clientY);

        // 行180: タップをやめたら戻す
        resetStreakLater();

        onTap?.();
      }}
      onPointerUp={() => {
        // 指を離したら「やめた」扱いに寄せたいので、リセット判定を走らせておく
        resetStreakLater();
      }}
      onPointerCancel={() => {
        resetStreakLater();
      }}
    >
      {/* スパークル（下から上に浮かぶハートより前面でOKなら後に置く） */}
      {sparkles.map((s) => (
        <span
          key={`s-${s.id}`}
          style={
            {
              position: "absolute",
              left: s.x,
              top: s.y,
              transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
              fontSize: s.size,
              lineHeight: 1,
              color: "#fff7cf",
              textShadow:
                "0 0 10px rgba(212,175,55,0.55), 0 8px 22px rgba(0,0,0,0.35)",
              animation: `sparkleBurst ${s.life}ms ease-out ${s.delay}ms forwards`,
              pointerEvents: "none",
              // CSS変数で飛ぶ方向を渡す
              ["--dx" as any]: `${s.dx}px`,
              ["--dy" as any]: `${s.dy}px`,
            } as React.CSSProperties
          }
          aria-hidden
        >
          ✦
        </span>
      ))}

      {hearts.map((h) => (
        <span
          key={h.id}
          style={{
            position: "absolute",
            left: h.x,
            top: h.y,
            transform: `translate(-50%, -50%) rotate(${h.rot}deg)`,
            fontSize: h.size,
            lineHeight: 1,
            color: h.color,
            textShadow: h.isGold
              ? "0 0 12px rgba(212,175,55,0.65), 0 14px 30px rgba(0,0,0,0.36)"
              : "0 10px 26px rgba(0,0,0,0.38)",
            filter: h.isGold
              ? "drop-shadow(0 0 12px rgba(212,175,55,0.35))"
              : "none",
            animation: h.isGold
              ? `heartFloat ${h.life}ms ease-out forwards, goldPulse 520ms ease-in-out infinite`
              : `heartFloat ${h.life}ms ease-out forwards`,
            pointerEvents: "none",
          }}
        >
          ♥
        </span>
      ))}

      <style>{`
        @keyframes heartFloat{
          0%   { opacity: 0; transform: translate(-50%,-35%) scale(0.92); filter: blur(0.6px); }
          18%  { opacity: 1; transform: translate(-50%,-50%) scale(1.05); filter: blur(0px); }
          100% { opacity: 0; transform: translate(-50%,-140%) scale(1.12); filter: blur(0.4px); }
        }

        @keyframes goldPulse{
          0%, 100% { filter: drop-shadow(0 0 10px rgba(212,175,55,0.25)); }
          50%      { filter: drop-shadow(0 0 16px rgba(212,175,55,0.48)); }
        }

        @keyframes sparkleBurst{
          0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.55); filter: blur(0.6px); }
          12%  { opacity: 1; transform: translate(-50%,-50%) scale(1.05); filter: blur(0px); }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.12);
            filter: blur(0.4px);
          }
        }
      `}</style>
    </div>
  );
}
