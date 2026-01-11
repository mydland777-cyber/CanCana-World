"use client";

import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Ctx = { go: (href: string) => void };

const TransitionContext = createContext<Ctx | null>(null);

export function useTransitionNav() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransitionNav must be used within TransitionProvider");
  return ctx;
}

// ★演出テンポ（ここだけ触ればOK）
const POEMS_PUSH_MS = 10;      // 白が見え始めてから遷移するまで
const POEMS_FLASH_MS = 1500;    // 白フラッシュ全体の長さ

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const pushTimer = useRef<number | null>(null);

  const clearTimers = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    if (pushTimer.current) window.clearTimeout(pushTimer.current);
    hideTimer.current = null;
    pushTimer.current = null;
  };

  const go = (href: string) => {
    if (href === pathname) return;

    const toPoems = href.startsWith("/poems");

    if (toPoems) {
      clearTimers();
      setVisible(true);

      // ★少し見せてから遷移
      pushTimer.current = window.setTimeout(() => {
        router.push(href);
      }, POEMS_PUSH_MS);

      // ★フラッシュ時間と同じで消す（ズレない）
      hideTimer.current = window.setTimeout(() => {
        setVisible(false);
      }, POEMS_FLASH_MS);

      return;
    }

    // それ以外は普通に
    router.push(href);
  };

  const value = useMemo(() => ({ go }), [pathname]);

  return (
    <TransitionContext.Provider value={value}>
      {children}

      {visible && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            pointerEvents: "none",
            background: "#fff",
            // ★強すぎない
            opacity: 0.45,
            // ★フラッシュ時間は変数に合わせる
            animation: `poemsFlash ${POEMS_FLASH_MS}ms ease-out forwards`,
          }}
        />
      )}

      <style>{`
        @keyframes poemsFlash{
          0%{ opacity: 0.0; }
          25%{ opacity: 0.45; }
          100%{ opacity: 0.0; }
        }
      `}</style>
    </TransitionContext.Provider>
  );
}
