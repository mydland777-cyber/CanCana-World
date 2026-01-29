// app/HomeInteractive.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from "react";
import HomeClient from "./HomeClient";
import HeartsLayer from "./components/HeartsLayer";

const TAP_GOAL = 1000;
const SECRET_SHOW_MS = 12000;
const SKULL_RATE = 0.7;

// ===== 連続タップ判定 =====
// HeartsLayer と同じ基準に合わせる（必要ならここだけ調整）
const TAP_STREAK_RESET_MS = 400;

// ===== Message（共有＋24h＋禁止ワード）=====
const MSG_MILESTONES = [100, 300, 500, 800] as const;

const MSG_MAX_LEN = 80;
const MSG_TTL_MS = 24 * 60 * 60 * 1000;
const MSG_FETCH_MS = 15000;

const MSG_IN_MS = 520;
const MSG_HOLD_MS = 3500;
const MSG_OUT_MS = 520;
const MSG_CYCLE_MS = MSG_IN_MS + MSG_HOLD_MS + MSG_OUT_MS;

// === コメントウォール ===
const WALL_MAX_VISIBLE = 1000;
const WALL_CHAR_BUDGET_PC = 150000;
const WALL_CHAR_BUDGET_MOBILE = 90000;

const WALL_MIN_CHARS_PER_MSG = 6;
const WALL_MAX_CHARS_PER_MSG_PC = 280;
const WALL_MAX_CHARS_PER_MSG_MOBILE = 240;

const WALL_FONT_PC = 12;
const WALL_FONT_MOBILE = 11;
const WALL_LINE_HEIGHT = 1.35;
const WALL_LETTER_SPACING = "0.02em";
const WALL_MAX_WIDTH_PC = "min(360px, 34vw)";
const WALL_MAX_WIDTH_MOBILE = "min(320px, 50vw)";

const MSG_COLORS = [
  "#9ce2e2",
  "#ffd1dc",
  "#ffb86c",
  "#fff3a3",
  "#b8ffdf",
  "#7ee3ff",
  "#a9b8ff",
  "#d6a8ff",
  "#ff9bb3",
  "#99d899",
] as const;

const BANNED_WORDS = [
  "死ね",
  "しね",
  "あほ",
  "阿保",
  "キモイ",
  "きしょい",
  "中国",
  "チャイナ",
  "ばか",
  "バカ",
  "馬鹿",
  "spam",
  "URL",
  "http",
  "https",
  "@",
  "可愛くない",
  "嫌い",
  "ブス",
  "ぶさいく",
  "ブサイク",
  "ぶす",
  "逝って",
  "化粧濃い",
  "下手",
  "大したことない",
  "やめろ",
  "引退",
  "ばばあ",
  "ババア",
  "年増",
] as const;

// ===== Logo =====
const LOGO_SRC = "/logo.png";
const LOGO_ONCE_KEY = "cancana_logo_once_session_v3";
const LOGO_BG = "#000";

// ✅ PC（今まで通り）
const LOGO_IN_MS_PC = 800;
const LOGO_HOLD_MS_PC = 1200;
const LOGO_OUT_MS_PC = 800;

// ✅ スマホだけゆっくり
const LOGO_IN_MS_MOBILE = 1000;
const LOGO_HOLD_MS_MOBILE = 1600;
const LOGO_OUT_MS_MOBILE = 1200;

// ✅ Homeの「ふわっと」(ロゴ後/初回じゃない時も)
const HOME_FADE_MS = 520;

// ✅ Profile modal ふわっと
const PROFILE_IN_MS = 260;
const PROFILE_OUT_MS = 240;

// ===== Profile =====
const PROFILE_NAME = `CanCana（キャンカナ）
役者名：星空　奏（ほしぞら　かな）`;

const PROFILE_TEXT = `
アーティスト、俳優。 
福岡出身、大阪育ち。 
持ち前の表現力を活かし、俳優業を経て、アーティストとして活動中。
音楽活動では、透明感のある歌声と繊細な表現力で、多くのファンを魅了している。 
また、ライブパフォーマンスにも定評があり、観客を引き込む力を持つ。
役者業では、俳優としての表現力に定評があり、
細やかな心の動きからダイナミックな転換まで自在に演じ分ける。
声色・視線・呼吸の“間”で空気を変え、役を生きた存在として立ち上げる演技が魅力。
現在は、TikTokライバーとしても活動し、ライブ配信を通じてファンとの交流を深めている。

☆基本情報

●血液型 A型 
●誕生日 ７月３日 
●身長 151 cm 
●趣味 人間観察、ゲーム、スポーツ観戦、ヨガ・美容、海外放浪
●特技 テニス、短距離走、ファッションコーディネート、殺陣

☆役者経歴

●しにもの調査団 消えたアイドル 夏見役 
●朗読劇 「紅い空をあおぐ」 主演 
●映画 「その人知らず」 木下サクラ役 
●事務所舞台多数 
●東京MX ドラマ 「妖ばなし」文車妖妃編 沙奈役 
●映画 「明日への君へ」 出演手話映画 
●「Pこの空」 松永エリ役 
●モナコ国際映画祭出展作品 「TOKYO24」 出演 
●KARAのギュリ、山本裕典、風見しんご 主演作品「Revive by TOKYO24」 出演

☆アーティスト経歴

●「メグリメグル」でインディーズデビュー 
●野外フェス 「ONE+NATION」 出演 
●ビバラポップ！さいたまスーパーアリーナにてオープニングアクト 出演 
●ラジオ 川崎FM パーソナリティ 
●「Revive by TOKYO」挿入歌にオリジナル曲「ポラリス」が決定 
●Project DIVA XR Festival バーチャル 出演 
●宗像フェス出演 
●東南アジア最大バーチャルフェスC3AFA 出演 
●SHOWROOMトップライバー入り 
●TOKYO FM『SHOWROOM主義』出演
●ゲーム 「Call of Duty」 チャリティー大会公式アンバサダー 
●TOKYO MX『とびだせ！スマホの中の人』出演（MC：武井壮／須田亜香里）  
●BIGO LIVE 音楽部門Award日本１位 受賞
●BIGO LIVE 東アジア音楽部門Award３位 受賞
●バラエティ番組 「ニューヨークの勝手に占っちゃいました」 出演
`.trim();

function todayKeyMidnight() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dayKey6am() {
  const d = new Date();
  const x = new Date(d);
  if (x.getHours() < 6) x.setDate(x.getDate() - 1);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function msUntilNext6am() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(6, 0, 0, 0);
  if (now.getTime() >= next.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

function msgDayStartMs(dayKey: string) {
  // dayKey: "YYYY-MM-DD" をローカル時刻の 06:00 にする
  const [y, m, d] = dayKey.split("-").map((n) => Number(n));
  const dt = new Date();
  dt.setFullYear(y, (m ?? 1) - 1, d ?? 1);
  dt.setHours(6, 0, 0, 0);
  return dt.getTime();
}
function msgDayRangeMs(dayKey: string) {
  const start = msgDayStartMs(dayKey);
  const end = start + 24 * 60 * 60 * 1000;
  return { start, end };
}
function withinMsgDay(ts: number, dayKey: string) {
  const { start, end } = msgDayRangeMs(dayKey);
  return ts >= start && ts < end;
}

function pickOne<T>(list: readonly T[] | T[]) {
  return list[Math.floor(Math.random() * list.length)];
}

async function playSE(src: string, volume = 0.9) {
  try {
    const a = new Audio(src);
    a.volume = volume;
    a.currentTime = 0;
    await a.play();
  } catch {}
}

type StoredMsg = { id: string; text: string; ts: number };
type Slot = { x: number; y: number };
type MsgView = { key: string; text: string; x: number; y: number; s: number; color: string };

function normalizeBannedWords(list: readonly string[]) {
  return list.map((s) => (s ?? "").trim()).filter((s) => s.length > 0);
}
function containsBanned(text: string, banned: string[]): string | null {
  const t = text.toLowerCase();
  for (const w of banned) {
    const ww = w.toLowerCase();
    if (!ww) continue;
    if (t.includes(ww)) return w;
  }
  return null;
}
function shuffleInPlace<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
function clipForBudget(text: string, maxChars: number) {
  const t = text ?? "";
  if (t.length <= maxChars) return t;
  if (maxChars <= 1) return "…";
  return t.slice(0, Math.max(1, maxChars - 1)) + "…";
}

// ✅ 後半（被ってOK側）用：従来スロット
function makeRandomSlots(count: number, isMobile: boolean): Slot[] {
  const minX = 6;
  const maxX = 94;
  const minY = 10;
  const maxY = 90;

  let minDist: number;
  if (count <= (isMobile ? 40 : 70)) minDist = isMobile ? 5.2 : 4.6;
  else if (count <= (isMobile ? 120 : 200)) minDist = isMobile ? 3.4 : 3.0;
  else if (count <= (isMobile ? 250 : 450)) minDist = isMobile ? 2.2 : 1.9;
  else if (count <= (isMobile ? 450 : 800)) minDist = isMobile ? 1.2 : 1.0;
  else minDist = 0.2;

  const minDist2 = minDist * minDist;

  const slots: Slot[] = [];
  const tries = Math.max(1200, count * 50);
  const skipCollision = minDist <= 0.25;

  for (let t = 0; t < tries && slots.length < count; t++) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);

    const avoidTopRight = x > 72 && y < 18;
    const avoidBottomLeft = x < 32 && y > 74;
    if (avoidTopRight || avoidBottomLeft) continue;

    if (!skipCollision) {
      let ok = true;
      for (let i = 0; i < slots.length; i++) {
        const dx = x - slots[i].x;
        const dy = y - slots[i].y;
        if (dx * dx + dy * dy < minDist2) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
    }

    slots.push({ x, y });
  }

  while (slots.length < count) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    const avoidTopRight = x > 72 && y < 18;
    const avoidBottomLeft = x < 32 && y > 74;
    if (avoidTopRight || avoidBottomLeft) continue;
    slots.push({ x, y });
  }

  return slots;
}

// ===============================
// ✅ 追加：前半（被らない努力）用：矩形推定 + 衝突回避
// ===============================
type Rect = { x: number; y: number; w: number; h: number };

function rectHit(a: Rect, b: Rect, gap = 10) {
  return !(
    a.x + a.w + gap < b.x ||
    b.x + b.w + gap < a.x ||
    a.y + a.h + gap < b.y ||
    b.y + b.h + gap < a.y
  );
}

// maxWidth（min(...)）を px に近似
function maxWidthPx(isMobile: boolean, vw: number) {
  const v = Math.max(320, vw || 0);
  return isMobile ? Math.min(320, v * 0.5) : Math.min(360, v * 0.34);
}

// 文字箱サイズを安全側に推定（被り防止優先）
function estimateBoxPx(text: string, isMobile: boolean, vw: number) {
  const fontSize = isMobile ? WALL_FONT_MOBILE : WALL_FONT_PC;
  const mw = maxWidthPx(isMobile, vw);

  const charW = fontSize * 1.18; // 少し強めに見積もる（安全側）
  const linesByNewline = Math.max(1, (text.split("\n").length || 1));
  const plainLen = Math.max(1, text.length);
  const estTextW = plainLen * charW;

  const linesByWrap = Math.max(1, Math.ceil(estTextW / mw));
  const lines = Math.max(linesByNewline, linesByWrap);

  const w = Math.min(mw, Math.max(42, Math.min(mw, estTextW)));
  const h = Math.max(18, lines * fontSize * WALL_LINE_HEIGHT);

  const pad = 26; // 影/ブレ分
  return { w: w + pad, h: h + pad };
}

function buildNonOverlappingViewsWithSpill(args: {
  seq: number;
  chosen: StoredMsg[];
  perChars: number;
  isMobile: boolean;
  vw: number;
  vh: number;
}) {
  const { seq, chosen, perChars, isMobile, vw, vh } = args;

  const placed: Rect[] = [];
  const views: MsgView[] = [];
  const spill: StoredMsg[] = [];

  const gap = 18;

  // 元の雰囲気を崩さない範囲（%）
  const minX = 6;
  const maxX = 94;
  const minY = 10;
  const maxY = 90;

  const triesPer = chosen.length >= 350 ? 36 : chosen.length >= 200 ? 56 : 86;

  for (let i = 0; i < chosen.length; i++) {
    const m = chosen[i];
    const clipped = clipForBudget(m.text, perChars);

    const s = 0.96 + Math.random() * 0.10;
    const est = estimateBoxPx(clipped, isMobile, vw);

    const w = est.w * s;
    const h = est.h * s;

    let ok = false;
    let rect: Rect = { x: 0, y: 0, w, h };
    let outX = 50;
    let outY = 50;

    for (let t = 0; t < triesPer; t++) {
      const px = minX + Math.random() * (maxX - minX);
      const py = minY + Math.random() * (maxY - minY);

      const avoidTopRight = px > 72 && py < 18;
      const avoidBottomLeft = px < 32 && py > 74;
      if (avoidTopRight || avoidBottomLeft) continue;

      // center(%)->px -> rect(top-left)
      const cx = (px / 100) * vw;
      const cy = (py / 100) * vh;
      const x = clamp(cx - w / 2, 0, Math.max(0, vw - w));
      const y = clamp(cy - h / 2, 0, Math.max(0, vh - h));
      rect = { x, y, w, h };

      let collide = false;
      for (let k = 0; k < placed.length; k++) {
        if (rectHit(rect, placed[k], gap)) {
          collide = true;
          break;
        }
      }
      if (collide) continue;

      ok = true;
      placed.push(rect);

      outX = ((rect.x + rect.w / 2) / vw) * 100;
      outY = ((rect.y + rect.h / 2) / vh) * 100;
      break;
    }

    if (!ok) {
      spill.push(m);
      continue;
    }

    views.push({
      key: `msg_${seq}_${i}_${m.id}`,
      text: clipped,
      x: clamp(outX, 2, 98),
      y: clamp(outY, 2, 98),
      s,
      color: pickOne(MSG_COLORS),
    });
  }

  return { views, spill };
}

// ===== Supabase REST =====
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const USE_SUPABASE = Boolean(SB_URL && SB_KEY);

async function sbFetchMessagesByMsgDay(dayKey: string): Promise<StoredMsg[]> {
  const { start, end } = msgDayRangeMs(dayKey);
  const since = new Date(start).toISOString();
  const until = new Date(end).toISOString();

  const url =
    `${SB_URL}/rest/v1/home_messages?` +
    `select=id,text,created_at` +
    `&created_at=gte.${encodeURIComponent(since)}` +
    `&created_at=lt.${encodeURIComponent(until)}` +
    `&order=created_at.desc&limit=1000`;

  const res = await fetch(url, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Supabase select failed: ${res.status}`);
  const rows = (await res.json()) as Array<{ id: string; text: string; created_at: string }>;
  return rows.map((r) => ({ id: r.id, text: r.text, ts: new Date(r.created_at).getTime() }));
}

async function sbInsertMessage(text: string): Promise<void> {
  const url = `${SB_URL}/rest/v1/home_messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Supabase insert failed: ${res.status}`);
}

function stopAll(e: SyntheticEvent) {
  e.preventDefault();
  e.stopPropagation();
}

export default function HomeInteractive({
  images,
  luckyImages = [],
  skullImages = [],
}: {
  images: string[];
  luckyImages?: string[];
  skullImages?: string[];
}) {
  const [homeReady, setHomeReady] = useState(true);

  // ✅ 初回フレームでロゴを覆って「先にUIが見える」を抑える（ただし最終的にはlogoDecidedで確実に封じる）
  const [showLogo, setShowLogo] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const forceLogo = new URLSearchParams(window.location.search).get("logo") === "1";
      if (forceLogo) return true;
      const already = sessionStorage.getItem(LOGO_ONCE_KEY) === "1";
      return !already;
    } catch {
      return false;
    }
  });

  const [logoLoaded, setLogoLoaded] = useState(false);
  const logoBootedRef = useRef(false);

  // ✅ ロゴ判定が終わるまで“全面黒カバー”でUIの先出しを完全に封じる
  const [logoDecided, setLogoDecided] = useState(false);

  // ✅ Homeの「ふわっと」
  const [homeFade, setHomeFade] = useState(false);
  const homeFadeTimerRef = useRef<number | null>(null);

  // ✅ Profile ふわっと（open/close）
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileClosing, setProfileClosing] = useState(false);
  const profileCloseTimerRef = useRef<number | null>(null);

  const [secretSrc, setSecretSrc] = useState<string | null>(null);
  const [secretVisible, setSecretVisible] = useState(false);

  const hidingRef = useRef<number | null>(null);

  const [msgOpen, setMsgOpen] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [validationError, setValidationError] = useState("");

  const [msgDay, setMsgDay] = useState<string>(() => dayKey6am());
  const [msgList, setMsgList] = useState<StoredMsg[]>([]);
  const [msgViews, setMsgViews] = useState<MsgView[]>([]);
  const msgCycleRef = useRef<number | null>(null);
  const msgFetchRef = useRef<number | null>(null);
  const msgResetRef = useRef<number | null>(null);
  const msgSeqRef = useRef(0);

  const msgQueueRef = useRef<StoredMsg[]>([]);
  const msgQueueIdxRef = useRef(0);

  // ===== 連続タップ（メッセージ/シークレット用）=====
const tapStreakRef = useRef(0);
const tapResetTimerRef = useRef<number | null>(null);
const tapPausedRef = useRef(false);

const clearTapResetTimer = () => {
  if (tapResetTimerRef.current) window.clearTimeout(tapResetTimerRef.current);
  tapResetTimerRef.current = null;
};

const scheduleTapReset = () => {
  if (tapPausedRef.current) return;
  clearTapResetTimer();
  tapResetTimerRef.current = window.setTimeout(() => {
    tapStreakRef.current = 0;
    tapResetTimerRef.current = null;
  }, TAP_STREAK_RESET_MS);
};

const pauseTapStreak = () => {
  tapPausedRef.current = true;
  clearTapResetTimer();
};

const resumeTapStreak = () => {
  tapPausedRef.current = false;
  // ※モーダルを閉じた直後に少し猶予が欲しければ ms を増やせます
  clearTapResetTimer();
  tapResetTimerRef.current = window.setTimeout(() => {
    tapStreakRef.current = 0;
    tapResetTimerRef.current = null;
  }, TAP_STREAK_RESET_MS);
};

  // ✅ 初期値を matchMedia で即決（スマホロゴが“パッ”になるのを防ぐ）
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  const hideLogoTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // ✅ ロゴ時間（スマホだけゆっくり）
  const logoIn = isMobile ? LOGO_IN_MS_MOBILE : LOGO_IN_MS_PC;
  const logoHold = isMobile ? LOGO_HOLD_MS_MOBILE : LOGO_HOLD_MS_PC;
  const logoOut = isMobile ? LOGO_OUT_MS_MOBILE : LOGO_OUT_MS_PC;
  const logoTotal = logoIn + logoHold + logoOut;

  const logoPctIn = Math.round((logoIn / logoTotal) * 100);
  const logoPctHold = Math.round(((logoIn + logoHold) / logoTotal) * 100);

  const day0 = useMemo(() => todayKeyMidnight(), []);
  const tapKey = `cancana_taps_${day0}`;
  const doneKey = `cancana_secret_done_${day0}`;

  const localMsgKey = `cancana_msgs_${msgDay}`;

  const bannedWords = useMemo(() => normalizeBannedWords(BANNED_WORDS), []);

  const triggerHomeFade = () => {
    setHomeFade(true);
    if (homeFadeTimerRef.current) window.clearTimeout(homeFadeTimerRef.current);
    homeFadeTimerRef.current = window.setTimeout(() => {
      setHomeFade(false);
      homeFadeTimerRef.current = null;
    }, HOME_FADE_MS);
  };

  // ✅ Profile open/close helpers（ふわっと）
  const openProfile = () => {
    if (profileCloseTimerRef.current) window.clearTimeout(profileCloseTimerRef.current);
    profileCloseTimerRef.current = null;
    setProfileClosing(false);
    setProfileOpen(true);
  };
  const closeProfile = () => {
    if (!profileOpen) return;
    setProfileClosing(true);
    if (profileCloseTimerRef.current) window.clearTimeout(profileCloseTimerRef.current);
    profileCloseTimerRef.current = window.setTimeout(() => {
      setProfileOpen(false);
      setProfileClosing(false);
      profileCloseTimerRef.current = null;
    }, PROFILE_OUT_MS);
  };

  // スクロールバー抑止
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = (html.style as any).overscrollBehavior;
    const prevBodyOverscroll = (body.style as any).overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    (html.style as any).overscrollBehavior = "none";
    (body.style as any).overscrollBehavior = "none";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      (html.style as any).overscrollBehavior = prevHtmlOverscroll;
      (body.style as any).overscrollBehavior = prevBodyOverscroll;

      // ✅ Profile close timer cleanup
      if (profileCloseTimerRef.current) window.clearTimeout(profileCloseTimerRef.current);
      profileCloseTimerRef.current = null;
    };
  }, []);

  // 6時更新
  useEffect(() => {
    if (msgResetRef.current) window.clearTimeout(msgResetRef.current);
    msgResetRef.current = window.setTimeout(() => setMsgDay(dayKey6am()), msUntilNext6am());
    return () => {
      if (msgResetRef.current) window.clearTimeout(msgResetRef.current);
      msgResetRef.current = null;
    };
  }, [msgDay]);

  useEffect(() => {
  const sync = () => setMsgDay(dayKey6am());
  const onVis = () => {
    if (!document.hidden) sync();
  };
  window.addEventListener("focus", sync);
  document.addEventListener("visibilitychange", onVis);
  return () => {
    window.removeEventListener("focus", sync);
    document.removeEventListener("visibilitychange", onVis);
  };
}, []);

  const refreshMessages = async () => {
    try {
      if (USE_SUPABASE) {
        const list = await sbFetchMessagesByMsgDay(msgDay);
        setMsgList(list.filter((m) => withinMsgDay(m.ts, msgDay)));
    } else {

        const raw = localStorage.getItem(localMsgKey);
        const arr = raw ? (JSON.parse(raw) as unknown) : [];
        const parsed: StoredMsg[] = Array.isArray(arr)
          ? (arr
              .map((x: any) => ({
                id: String(x?.id ?? ""),
                text: String(x?.text ?? ""),
                ts: Number(x?.ts ?? 0),
              }))
              .filter((m) => m.id && m.text && Number.isFinite(m.ts)) as StoredMsg[])
          : [];
        const pruned = parsed.filter((m) => withinMsgDay(m.ts, msgDay)).slice(0, 1000);
        setMsgList(pruned);
        localStorage.setItem(localMsgKey, JSON.stringify(pruned));
      }
    } catch {}
  };

  useEffect(() => {
  refreshMessages();
  if (msgFetchRef.current) window.clearInterval(msgFetchRef.current);
  msgFetchRef.current = window.setInterval(() => refreshMessages(), MSG_FETCH_MS);
  return () => {
    if (msgFetchRef.current) window.clearInterval(msgFetchRef.current);
    msgFetchRef.current = null;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [msgDay]);

  // ✅ メッセージ表示（スマホ=最初300/PC=最初500は被らない努力）
  useEffect(() => {
    if (msgCycleRef.current) window.clearInterval(msgCycleRef.current);
    msgCycleRef.current = null;

    const base = msgList.filter((m) => withinMsgDay(m.ts, msgDay));
    if (base.length === 0) {
      setMsgViews([]);
      return;
    }

    const baseIds = base.map((x) => x.id).join("|");
    const qIds = msgQueueRef.current.map((x) => x.id).join("|");
    if (baseIds !== qIds) {
      const q = shuffleInPlace([...base]);
      msgQueueRef.current = q;
      msgQueueIdxRef.current = 0;
    }

    const takeFixed = Math.min(WALL_MAX_VISIBLE, base.length);

    const tick = () => {
      msgSeqRef.current += 1;
      const seq = msgSeqRef.current;

      const q = msgQueueRef.current.length ? msgQueueRef.current : base;
      const take = takeFixed;

      const chosen: StoredMsg[] = [];
      for (let i = 0; i < take; i++) {
        const idx = (msgQueueIdxRef.current + i) % q.length;
        chosen.push(q[idx]);
      }
      msgQueueIdxRef.current = (msgQueueIdxRef.current + take) % q.length;

      if (msgQueueIdxRef.current === 0 && q.length > 1) {
        const qq = [...q];
        shuffleInPlace(qq);
        msgQueueRef.current = qq;
      }

      const totalBudget = isMobile ? WALL_CHAR_BUDGET_MOBILE : WALL_CHAR_BUDGET_PC;
      const perAuto = Math.floor(totalBudget / Math.max(1, take));
      const perMax = isMobile ? WALL_MAX_CHARS_PER_MSG_MOBILE : WALL_MAX_CHARS_PER_MSG_PC;
      const per = clamp(perAuto, WALL_MIN_CHARS_PER_MSG, perMax);

      const vw = typeof window !== "undefined" ? Math.max(1, window.innerWidth || 1) : 1;
      const vh = typeof window !== "undefined" ? Math.max(1, window.innerHeight || 1) : 1;

      const hardLimit = isMobile ? 300 : 500;
      const hardChosen = chosen.slice(0, Math.min(take, hardLimit));

      // 前半：被らない努力（置けないものは spill）
      const { views: hardViews, spill } = buildNonOverlappingViewsWithSpill({
        seq,
        chosen: hardChosen,
        perChars: per,
        isMobile,
        vw,
        vh,
      });

      // 後半：被ってOK（spill + 残り）
      const softList = [...spill, ...chosen.slice(hardChosen.length)];
      const slots = makeRandomSlots(softList.length, isMobile);

      // ✅ 先に soft（下層）を作る
      const softViews: MsgView[] = [];
      for (let i = 0; i < softList.length; i++) {
        const slot = slots[i];
        const m = softList[i];
        const clipped = clipForBudget(m.text, per);

        softViews.push({
          key: `msg_${seq}_soft_${i}_${m.id}`,
          text: clipped,
          x: slot.x,
          y: slot.y,
          s: 0.96 + Math.random() * 0.10,
          color: pickOne(MSG_COLORS),
        });
      }

      // ✅ hard（上層）を後ろに足す＝上に表示される
      const hardViewsTop = hardViews.map((v, i) => ({
        ...v,
        key: `msg_${seq}_hard_${i}_${v.key}`,
      }));

      setMsgViews([...softViews, ...hardViewsTop]);
    };

    tick();
    msgCycleRef.current = window.setInterval(tick, MSG_CYCLE_MS);

    return () => {
      if (msgCycleRef.current) window.clearInterval(msgCycleRef.current);
      msgCycleRef.current = null;
    };
  }, [msgList, isMobile]);

  // cleanup
  useEffect(() => {
    return () => {
      if (hidingRef.current) window.clearTimeout(hidingRef.current);
      if (msgCycleRef.current) window.clearInterval(msgCycleRef.current);
      if (msgFetchRef.current) window.clearInterval(msgFetchRef.current);
      if (msgResetRef.current) window.clearTimeout(msgResetRef.current);

      if (homeFadeTimerRef.current) window.clearTimeout(homeFadeTimerRef.current);
      homeFadeTimerRef.current = null;

      if (hideLogoTimerRef.current) window.clearTimeout(hideLogoTimerRef.current);
      hideLogoTimerRef.current = null;

      if (profileCloseTimerRef.current) window.clearTimeout(profileCloseTimerRef.current);
      profileCloseTimerRef.current = null;

      if (tapResetTimerRef.current) window.clearTimeout(tapResetTimerRef.current);
      tapResetTimerRef.current = null;
    };
  }, []);

  // ✅ ロゴ制御（?logo=1 で強制表示）
  useEffect(() => {
    if (logoBootedRef.current) return;
    logoBootedRef.current = true;

    const forceLogo =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("logo") === "1";

    if (forceLogo) {
      try {
        sessionStorage.removeItem(LOGO_ONCE_KEY);
      } catch {}
    }

    let already = false;
    try {
      already = sessionStorage.getItem(LOGO_ONCE_KEY) === "1";
    } catch {}

    setHomeReady(true);

    // ✅ 既に見ていればロゴ無し＋ふわっとだけ
    if (already && !forceLogo) {
      setShowLogo(false);
      setLogoDecided(true); // ✅ 追加：判定完了
      triggerHomeFade();
      return;
    }

    // ✅ 初回（or 強制）はロゴを出す（Homeは常に裏で描画）
    setShowLogo(true);
    setLogoDecided(true); // ✅ 追加：判定完了（ロゴ出す）
    setLogoLoaded(false);

    const img = new Image();
    img.src = forceLogo ? `${LOGO_SRC}?v=${Date.now()}` : LOGO_SRC;

    const start = () => {
      setLogoLoaded(true);

      if (hideLogoTimerRef.current) window.clearTimeout(hideLogoTimerRef.current);
      hideLogoTimerRef.current = window.setTimeout(() => {
        setShowLogo(false);
        triggerHomeFade();
        try {
          sessionStorage.setItem(LOGO_ONCE_KEY, "1");
        } catch {}
        hideLogoTimerRef.current = null;
      }, logoTotal);
    };

    img.onload = start;
    img.onerror = start;
    // @ts-ignore
    if (img.complete) start();

    return () => {
      img.onload = null;
      img.onerror = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerSecret = async () => {
    if (localStorage.getItem(doneKey) === "1") return;

    const isSkull = Math.random() < SKULL_RATE;
    const picked = isSkull
      ? pickOne(skullImages) ?? "/secret/skull_01.jpg"
      : pickOne(luckyImages) ?? "/secret/lucky_01.jpg";

    localStorage.setItem(doneKey, "1");
    playSE(isSkull ? "/se/skull.mp3" : "/se/lucky.mp3", isSkull ? 0.85 : 0.95);

    setSecretSrc(picked);
    setSecretVisible(true);

    if (hidingRef.current) window.clearTimeout(hidingRef.current);
    hidingRef.current = window.setTimeout(() => {
      setSecretVisible(false);
      window.setTimeout(() => setSecretSrc(null), 450);
    }, SECRET_SHOW_MS);
  };

  const onTap = () => {
  // 連続タップ数を進める（一定時間空いたらリセットされる）
  tapStreakRef.current += 1;
  const streak = tapStreakRef.current;

  // 次のタップが来なければリセット
  scheduleTapReset();

  // 1000連続でシークレット（1日1回は doneKey で既存のまま）
  if (streak >= TAP_GOAL) {
    tapStreakRef.current = 0;
    clearTapResetTimer();
    triggerSecret();
    return;
  }

  // 100/300/500/800 連続でメッセージ
  if ((MSG_MILESTONES as readonly number[]).includes(streak)) {
    setMsgOpen(true);
    setValidationError("");

    // メッセージ入力中は「連続」を維持（モーダルで途切れないように一旦停止）
    pauseTapStreak();
  }
};

  useEffect(() => {
    const t = msgText.trim();
    if (!t) {
      setValidationError("");
      return;
    }
    if (t.length > MSG_MAX_LEN) {
      setValidationError(`※${MSG_MAX_LEN}文字までです`);
      return;
    }
    const hit = containsBanned(t, bannedWords);
    if (hit) setValidationError("※入力禁止ワードが含まれています");
    else setValidationError("");
  }, [msgText, bannedWords]);

  const postMessage = async () => {
    const raw = msgText.trim().replace(/\s+/g, " ");
    if (!raw) return;

    const clipped = raw.slice(0, MSG_MAX_LEN);

    const hit = containsBanned(clipped, bannedWords);
    if (hit) {
      setValidationError("※入力禁止ワードが含まれています");
      return;
    }

    try {
      if (USE_SUPABASE) {
        await sbInsertMessage(clipped);
      } else {
        const item: StoredMsg = {
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}_${Math.random()}`,
          text: clipped,
          ts: Date.now(),
        };
        const next = [item, ...msgList].filter((mm) => withinMsgDay(mm.ts, msgDay)).slice(0, 1000);
        setMsgList(next);
        localStorage.setItem(localMsgKey, JSON.stringify(next));
      }

      await refreshMessages();

      setMsgText("");
      setMsgOpen(false);
      setValidationError("");
      resumeTapStreak();
    } catch {
      setValidationError("送信に失敗しました。時間をおいて再度お試しください。");
    }
  };

  const blockTap = showLogo || !homeReady;
  const uiBlocking = profileOpen || profileClosing || msgOpen || secretVisible;

  // ✅ ロゴ判定が終わるまではProfileボタンも出さない（ロゴ前の先出し封じ）
  const showProfileButton = logoDecided && homeReady && !showLogo && !secretSrc;

  const nameLines = PROFILE_NAME.split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100svh",
        overflow: "hidden",
        touchAction: "manipulation",
      }}
    >
      {/* ✅ ロゴ判定が終わるまで全面黒（ハンバーガー等の先出し封じ） */}
      {!logoDecided && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2147483646,
            background: "#000",
            pointerEvents: "all",
          }}
        />
      )}

      {/* ✅ Homeは常に描画（黒フリーズ防止）。ロゴは上に被さるだけ */}
      <HomeClient images={images} />

      {/* ✅ Home ふわっと（ロゴ後/ロゴ無しでも） */}
      {homeFade && (
        <>
          <div
            aria-hidden
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              pointerEvents: "none",
              background: "#000",
              opacity: 1,
              animation: `homeFade ${HOME_FADE_MS}ms ease-out forwards`,
            }}
          />
          <style>{`
            @keyframes homeFade{
              0%{ opacity: 1; }
              100%{ opacity: 0; }
            }
          `}</style>
        </>
      )}

      {msgViews.length > 0 && !showLogo && homeReady && (
        <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 25, pointerEvents: "none" }}>
          {msgViews.map((m) => (
            <div
              key={m.key}
              style={{
                position: "absolute",
                left: `${m.x}%`,
                top: `${m.y}%`,
                transform: `translate3d(-50%, -50%, 0) scale(${m.s})`,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "relative",
                  color: m.color,
                  letterSpacing: WALL_LETTER_SPACING,
                  fontSize: isMobile ? WALL_FONT_MOBILE : WALL_FONT_PC,
                  lineHeight: WALL_LINE_HEIGHT,
                  textShadow: "0 1px 2px rgba(0,0,0,0.78), 0 18px 40px rgba(0,0,0,0.45)",
                  opacity: 0,
                  animation: `msgText ${MSG_CYCLE_MS}ms ease-in-out forwards`,
                  whiteSpace: "pre-wrap",
                  maxWidth: isMobile ? WALL_MAX_WIDTH_MOBILE : WALL_MAX_WIDTH_PC,
                }}
              >
                {m.text}
              </div>
            </div>
          ))}

          <style>{`
            @keyframes msgText{
              0%   { opacity: 0; transform: translateY(6px) scale(0.99); }
              18%  { opacity: 1; transform: translateY(0px) scale(1.0); }
              82%  { opacity: 1; transform: translateY(0px) scale(1.0); }
              100% { opacity: 0; transform: translateY(-2px) scale(1.01); }
            }

            .uiBtn{
              transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease, border-color 220ms ease, color 200ms ease, opacity 200ms ease;
              will-change: transform, box-shadow;
              -webkit-tap-highlight-color: transparent;
              user-select: none;
            }
            .uiBtn:hover{
              background: rgba(255,255,255,0.08) !important;
              border-color: rgba(255,255,255,0.18) !important;
              box-shadow:
                0 0 0 1px rgba(255,255,255,0.18),
                0 8px 30px rgba(255,255,255,0.12);
              transform: translateY(-1px);
              color: rgba(255,255,255,0.98) !important;
            }
            .uiBtn:active{
              transform: translateY(0px);
            }
            .uiBtn:focus-visible{
              outline: none;
              box-shadow:
                0 0 0 3px rgba(255,255,255,0.18),
                0 8px 30px rgba(255,255,255,0.12);
            }

            @keyframes profileBackdropIn{
              0%{ opacity: 0; }
              100%{ opacity: 1; }
            }
            @keyframes profileBackdropOut{
              0%{ opacity: 1; }
              100%{ opacity: 0; }
            }
            @keyframes profileCardIn{
              0%{ opacity: 0; transform: translateY(8px) scale(0.995); }
              100%{ opacity: 1; transform: translateY(0px) scale(1); }
            }
            @keyframes profileCardOut{
              0%{ opacity: 1; transform: translateY(0px) scale(1); }
              100%{ opacity: 0; transform: translateY(6px) scale(0.996); }
            }
          `}</style>
        </div>
      )}

      {/* uiBtn CSS（msgViewsが0でも効く） + profile animation keyframes */}
      {msgViews.length === 0 && (
        <style>{`
          .uiBtn{
            transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease, border-color 220ms ease, color 200ms ease, opacity 200ms ease;
            will-change: transform, box-shadow;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
          }
          .uiBtn:hover{
            background: rgba(255,255,255,0.08) !important;
            border-color: rgba(255,255,255,0.18) !important;
            box-shadow:
              0 0 0 1px rgba(255,255,255,0.18),
              0 8px 30px rgba(255,255,255,0.12);
            transform: translateY(-1px);
            color: rgba(255,255,255,0.98) !important;
          }
          .uiBtn:active{ transform: translateY(0px); }
          .uiBtn:focus-visible{
            outline: none;
            box-shadow:
              0 0 0 3px rgba(255,255,255,0.18),
              0 8px 30px rgba(255,255,255,0.12);
          }

          @keyframes profileBackdropIn{
            0%{ opacity: 0; }
            100%{ opacity: 1; }
          }
          @keyframes profileBackdropOut{
            0%{ opacity: 1; }
            100%{ opacity: 0; }
          }
          @keyframes profileCardIn{
            0%{ opacity: 0; transform: translateY(8px) scale(0.995); }
            100%{ opacity: 1; transform: translateY(0px) scale(1); }
          }
          @keyframes profileCardOut{
            0%{ opacity: 1; transform: translateY(0px) scale(1); }
            100%{ opacity: 0; transform: translateY(6px) scale(0.996); }
          }
        `}</style>
      )}

      <HeartsLayer enabled={!blockTap && !uiBlocking} onTap={blockTap || uiBlocking ? () => {} : onTap} />

      {showProfileButton && (
        <button
          type="button"
          className="uiBtn"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={openProfile}
          style={{
            position: "fixed",
            left: 14,
            bottom: "calc(14px + env(safe-area-inset-bottom))",
            zIndex: 80,
            pointerEvents: "auto",
            padding: "10px 14px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "rgba(255,255,255,0.92)",
            letterSpacing: "0.08em",
            fontSize: 13,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          Profile
        </button>
      )}

            {/* Logo overlay */}
      {showLogo && (
        <>
          <div
            className="logoOverlayAnim"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2147483647,
              background: LOGO_BG,
              display: "grid",
              placeItems: "center",
              pointerEvents: "all",
              animation:
                typeof window !== "undefined" &&
                new URLSearchParams(window.location.search).get("logo") === "1"
                  ? "none"
                  : `logoOverlay ${logoTotal}ms linear forwards`,
            }}
          >
            {/* ✅ ロゴ画像を描画する（これが消えてた） */}
            <img
              className="logoImgAnim"
              src={LOGO_SRC}
              alt="CanCana"
              draggable={false}
              style={{
                width: "min(72vw, 520px)",
                height: "auto",
                display: "block",
                opacity: logoLoaded ? 1 : 0, // ✅ 読み込み前のチラ見え/一瞬の崩れ防止
              }}
            />
          </div>

          <style>{`
            @keyframes logoOverlay{
              0%{opacity:1}
              100%{opacity:1}
            }

            @keyframes logoGaussian{
              0%{
                opacity: 0;
                filter: blur(400px);
                transform: scale(1.02);
              }
              ${logoPctIn}%{
                opacity: 1;
                filter: blur(0px);
                transform: scale(1);
              }
              ${logoPctHold}%{
                opacity: 1;
                filter: blur(0px);
                transform: scale(1);
              }
              100%{
                opacity: 0;
                filter: blur(500px);
                transform: scale(1.03);
              }
            }

            .logoImgAnim{
              animation:
                ${
                  typeof window !== "undefined" &&
                  new URLSearchParams(window.location.search).get("logo") === "1"
                    ? "none"
                    : `logoGaussian ${logoTotal}ms linear forwards`
                };
              will-change: opacity, filter, transform;
              user-select: none;
              -webkit-user-drag: none;
            }

            /* ✅ Reduce Motionでもロゴだけは動かす */
            @media (prefers-reduced-motion: reduce){
              *{ animation:none !important; }
              .logoOverlayAnim{ animation: logoOverlay ${logoTotal}ms linear forwards !important; }
              .logoImgAnim{ animation: logoGaussian ${logoTotal}ms linear forwards !important; }
            }
          `}</style>
        </>
      )}

      {/* Secret overlay */}
      {secretSrc && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            display: "grid",
            placeItems: "center",
            pointerEvents: secretVisible ? "all" : "none",
            background: "rgba(0,0,0,0.62)",
            opacity: secretVisible ? 1 : 0,
            transition: "opacity 380ms ease",
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div
            style={{
              width: "min(86vw, 720px)",
              maxHeight: "72svh",
              borderRadius: 18,
              overflow: "hidden",
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 30px 90px rgba(0,0,0,0.62)",
            }}
          >
            <img
              src={secretSrc}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        </div>
      )}

      {/* Message modal */}
      {msgOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onPointerDown={stopAll}
          onClick={stopAll}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 140,
            background: "rgba(0,0,0,0.62)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "grid",
            placeItems: "center",
            padding: 18,
          }}
        >
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(94vw, 640px)",
              maxHeight: "82svh",
              overflow: "auto",
              borderRadius: 18,
              background: "rgba(10,10,10,0.72)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
              padding: 16,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            <div style={{ fontSize: 14, letterSpacing: "0.10em", opacity: 0.9, lineHeight: 1.55 }}>
              みんなのオープンファンレター募集！😉
              <br />
              “ツタエタイコト・オモイデ”のメッセージを書いてね💗
              <br />
              <span style={{ fontSize: 12, opacity: 0.85 }}>
                ※みんなに見えるから、やさしさ多めで頼む〜💗✨
              </span>
            </div>

            <div style={{ marginTop: 10 }}>
              <textarea
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="80文字まで"
                rows={3}
                style={{
                  width: "100%",
                  resize: "none",
                  borderRadius: 14,
                  padding: "12px 12px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.92)",
                  outline: "none",
                  fontSize: 14,
                  lineHeight: 1.4,
                }}
              />
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>{validationError || " "}</div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="uiBtn"
                onClick={() => {
                  setMsgOpen(false);
                  setMsgText("");
                  setValidationError("");
                  resumeTapStreak();
                }} 
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.86)",
                  letterSpacing: "0.10em",
                  fontSize: 13,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="uiBtn"
                disabled={!msgText.trim() || Boolean(validationError)}
                onClick={postMessage}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "rgba(255,255,255,0.92)",
                  letterSpacing: "0.10em",
                  fontSize: 13,
                  opacity: !msgText.trim() || Boolean(validationError) ? 0.6 : 1,
                }}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile modal（ふわっと） */}
      {profileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onPointerDown={stopAll}
          onClick={stopAll}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 150,
            background: "rgba(0,0,0,0.62)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "grid",
            placeItems: "center",
            padding: 18,
            animation: profileClosing
              ? `profileBackdropOut ${PROFILE_OUT_MS}ms ease forwards`
              : `profileBackdropIn ${PROFILE_IN_MS}ms ease forwards`,
          }}
        >
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(94vw, 720px)",
              maxHeight: "86svh",
              overflow: "auto",
              borderRadius: 18,
              background: "rgba(10,10,10,0.72)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
              padding: 16,
              color: "rgba(255,255,255,0.92)",
              animation: profileClosing
                ? `profileCardOut ${PROFILE_OUT_MS}ms ease forwards`
                : `profileCardIn ${PROFILE_IN_MS}ms ease forwards`,
            }}
          >
            <div style={{ letterSpacing: "0.08em" }}>
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>
                {nameLines[0] ?? "CanCana"}
              </div>
              {nameLines[1] && (
                <div style={{ fontSize: 18, fontWeight: 650, lineHeight: 1.25, marginTop: 2, opacity: 0.92 }}>
                  {nameLines[1]}
                </div>
              )}
            </div>

            <div style={{ marginTop: 12, whiteSpace: "pre-line", fontSize: 13, lineHeight: 1.65, opacity: 0.92 }}>
              {PROFILE_TEXT}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <button
                type="button"
                className="uiBtn"
                onClick={closeProfile}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.86)",
                  letterSpacing: "0.10em",
                  fontSize: 13,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* uiBtn CSS（msgViewsが0でも効く） */}
      <style>{`
        .uiBtn{
          transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease, border-color 220ms ease, color 200ms ease, opacity 200ms ease;
          will-change: transform, box-shadow;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .uiBtn:hover{
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(255,255,255,0.18) !important;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.18),
            0 8px 30px rgba(255,255,255,0.12);
          transform: translateY(-1px);
          color: rgba(255,255,255,0.98) !important;
        }
        .uiBtn:active{
          transform: translateY(0px);
        }
        .uiBtn:focus-visible{
          outline: none;
          box-shadow:
            0 0 0 3px rgba(255,255,255,0.18),
            0 8px 30px rgba(255,255,255,0.12);
        }

        @keyframes profileBackdropIn{
          0%{ opacity: 0; }
          100%{ opacity: 1; }
        }
        @keyframes profileBackdropOut{
          0%{ opacity: 1; }
          100%{ opacity: 0; }
        }
        @keyframes profileCardIn{
          0%{ opacity: 0; transform: translateY(8px) scale(0.995); }
          100%{ opacity: 1; transform: translateY(0px) scale(1); }
        }
        @keyframes profileCardOut{
          0%{ opacity: 1; transform: translateY(0px) scale(1); }
          100%{ opacity: 0; transform: translateY(6px) scale(0.996); }
        }
      `}</style>
    </div>
  );
}
