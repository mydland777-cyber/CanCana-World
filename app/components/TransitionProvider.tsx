"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Ctx = { go: (href: string) => void };

const TransitionContext = createContext<Ctx | null>(null);

export function useTransitionNav() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransitionNav must be used within TransitionProvider");
  return ctx;
}

// 演出テンポ
const POEMS_FLASH_MS = 1500;

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);

  // timers
  const hideTimer = useRef<number | null>(null);

  // 「次にPoemsへ入ったらフラッシュする」フラグ
  const pendingPoemsFlashRef = useRef(false);

  // 多重クリック/連打での「パパっと」防止（短いロック）
  const navLockRef = useRef(false);
  const unlockTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = null;

    if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = null;
  };

  const lockNavBriefly = () => {
    navLockRef.current = true;
    if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = window.setTimeout(() => {
      navLockRef.current = false;
      unlockTimerRef.current = null;
    }, 700);
  };

  const go = (href: string) => {
    if (!href) return;
    if (href === pathname) return;
    if (navLockRef.current) return;

    const toPoems = href.startsWith("/poems");

    clearTimers();
    setVisible(false);

    lockNavBriefly();

    if (toPoems) {
      // ✅ 先に遷移する。光は「Poemsに入ってから」出す。
      pendingPoemsFlashRef.current = true;
      router.push(href);
      return;
    }

    // Poems以外は普通に
    pendingPoemsFlashRef.current = false;
    router.push(href);
  };

  // ✅ ルートが変わった瞬間に制御（タイマー残り・誤表示を潰す）
  useEffect(() => {
    // Poems以外では絶対に光を描画しない
    if (!pathname.startsWith("/poems")) {
      pendingPoemsFlashRef.current = false;
      setVisible(false);
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      return;
    }

    // Poemsに入った瞬間だけフラッシュ
    if (pendingPoemsFlashRef.current) {
      pendingPoemsFlashRef.current = false;

      setVisible(true);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => {
        setVisible(false);
        hideTimer.current = null;
      }, POEMS_FLASH_MS);
    }
  }, [pathname]);

  // unmount cleanup
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  const value = useMemo(() => ({ go }), [pathname]);

  return (
    <TransitionContext.Provider value={value}>
      {children}

      {/* ✅ 光はPoems上でしか出さない */}
      {visible && pathname.startsWith("/poems") && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            pointerEvents: "none",
            background: "#fff",
            opacity: 0.45,
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
