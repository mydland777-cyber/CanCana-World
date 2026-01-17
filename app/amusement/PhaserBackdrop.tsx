"use client";

import { useEffect, useRef } from "react";

type Focus = {
  x: number; // 0..1
  y: number; // 0..1
  ring: number; // 0..1
  mode: "idle" | "hover" | "coming";
};

export default function PhaserBackdrop() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    let destroyed = false;
    const host = hostRef.current;
    if (!host) return;

    (async () => {
      const Phaser = (await import("phaser")).default as any;
      if (destroyed) return;

      const focus: Focus = { x: 0.5, y: 0.45, ring: 0, mode: "idle" };

      class Scene extends Phaser.Scene {
        particles: any;
        starEmitter: any;

        noise: any;
        sealText: any;

        ringGfx: any;
        parallax = 0;

        create() {
          const w = this.scale.width;
          const h = this.scale.height;

          // 1) 粒子用の小さな点テクスチャを生成
          const key = "dot_tex";
          if (!this.textures.exists(key)) {
            const g = this.add.graphics();
            g.fillStyle(0xffffff, 1);
            g.fillCircle(4, 4, 3);
            g.generateTexture(key, 8, 8);
            g.destroy();
          }

          // 2) 星屑粒子（常時うっすら）
          this.particles = this.add.particles(0, 0, key);
          this.starEmitter = this.particles.createEmitter({
            x: { min: 0, max: w },
            y: { min: 0, max: h },
            lifespan: { min: 4500, max: 8000 },
            speed: { min: 6, max: 18 },
            angle: { min: 0, max: 360 },
            scale: { min: 0.25, max: 0.75 },
            alpha: { min: 0.04, max: 0.12 },
            quantity: 1,
            blendMode: "ADD",
          });

          // 3) Coming Soon 封印（必要時だけ薄く）
          this.noise = this.add.graphics().setAlpha(0);
          this.sealText = this.add
            .text(w * 0.5, h * 0.5, "SEALED", {
              fontFamily:
                "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
              fontSize: "28px",
              color: "rgba(255,255,255,0.35)",
              fontStyle: "italic",
            })
            .setOrigin(0.5)
            .setAlpha(0);

          // 4) リング（ホバー時）
          this.ringGfx = this.add.graphics();

          const onFocus = (e: Event) => {
            const ce = e as CustomEvent<Partial<Focus>>;
            const d = ce.detail ?? {};
            if (typeof d.x === "number") focus.x = d.x;
            if (typeof d.y === "number") focus.y = d.y;
            if (typeof d.ring === "number") focus.ring = d.ring;
            if (d.mode) focus.mode = d.mode;
          };
          window.addEventListener("cancana-amuse-focus", onFocus);

          cleanupRef.current = () => {
            window.removeEventListener("cancana-amuse-focus", onFocus);
          };
        }

        update(_: number, dtMs: number) {
          const dt = Math.min(0.05, dtMs / 1000);

          const w = this.scale.width;
          const h = this.scale.height;

          // パララックス（超微小）
          this.parallax += dt * 6;
          if (this.particles?.setPosition) {
            this.particles.setPosition(
              Math.sin(this.parallax * 0.02) * 10,
              Math.cos(this.parallax * 0.02) * 8
            );
          }

          const fx = focus.x * w;
          const fy = focus.y * h;

          // hover強度
          const hoverBoost = focus.mode === "hover" ? 1 : 0.45;

          // 粒子の透明度を少しだけ上げる（吸い寄せ“感”）
          const a = 0.05 + 0.08 * focus.ring * hoverBoost;
          if (this.starEmitter?.setAlpha) {
            this.starEmitter.setAlpha(Math.max(0.02, Math.min(0.18, a)));
          }

          // 粒子の「移動先」をゆるく中心寄せ（対応してる環境だけ）
          if (this.starEmitter?.moveTo) {
            this.starEmitter.moveTo(fx, fy, 6000);
          }

          // Coming Soon 封印：フェード
          const wantSeal = focus.mode === "coming" ? 1 : 0;
          const cur = this.noise?.alpha ?? 0;
          const next = cur + (wantSeal - cur) * (1 - Math.pow(0.001, dt));

          if (this.noise?.setAlpha) this.noise.setAlpha(next * 0.18);
          if (this.sealText?.setAlpha) this.sealText.setAlpha(next * 0.55);
          if (this.sealText?.setPosition) this.sealText.setPosition(fx, fy);

          // ノイズ点（薄く）
          if (this.noise?.clear) this.noise.clear();
          if (next > 0.001 && this.noise?.fillCircle) {
            const n = 80;
            for (let i = 0; i < n; i++) {
              const rx = fx + (Math.random() - 0.5) * 220;
              const ry = fy + (Math.random() - 0.5) * 110;
              const r = Math.random() * 2.2 + 0.6;
              this.noise.fillStyle(
                0xffffff,
                Math.random() * 0.06 + 0.02
              );
              this.noise.fillCircle(rx, ry, r);
            }
          }

          // リング（hover時だけ）
          const ring = focus.mode === "hover" ? focus.ring : 0;
          if (this.ringGfx?.clear) this.ringGfx.clear();
          if (ring > 0.001 && this.ringGfx?.strokeCircle) {
            const base = 26 + ring * 22;
            this.ringGfx.lineStyle(2, 0xffffff, 0.13 * hoverBoost);
            this.ringGfx.strokeCircle(fx, fy, base);
            this.ringGfx.lineStyle(1, 0xffffff, 0.10 * hoverBoost);
            this.ringGfx.strokeCircle(fx, fy, base + 10);
            if (this.ringGfx.setBlendMode) this.ringGfx.setBlendMode("ADD");
          }
        }
      }

      const game = new Phaser.Game({
        type: Phaser.WEBGL,
        parent: host,
        width: host.clientWidth,
        height: host.clientHeight,
        transparent: true,
        scene: [Scene],
        fps: { target: 60, forceSetTimeOut: true },
        render: { antialias: true, pixelArt: false },
        audio: { noAudio: true },
      });

      const ro = new ResizeObserver(() => {
        if (destroyed) return;
        const nw = host.clientWidth;
        const nh = host.clientHeight;
        if (nw <= 0 || nh <= 0) return;
        game.scale.resize(nw, nh);
      });
      ro.observe(host);

      const prevCleanup = cleanupRef.current;
      cleanupRef.current = () => {
        prevCleanup?.();
        ro.disconnect();
        try {
          game.destroy(true);
        } catch {}
      };
    })();

    return () => {
      destroyed = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
