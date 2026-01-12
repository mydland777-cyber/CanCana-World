"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import HomeClient from "./HomeClient";
import HeartsLayer from "./components/HeartsLayer";

const TAP_GOAL = 1000; // Secret用
const SECRET_SHOW_MS = 12000;
const SKULL_RATE = 0.7;

// ===== Message�E��E有！E4h�E�禁止ワード！E====
const MESSAGE_GOAL = 100; // ☁E00タチE�Eごとにモーダルを�Eす（何回でも！E
const MSG_MAX_LEN = 30; // ☁E��稿は30斁E��まで�E�投稿上限�E�E
const MSG_TTL_MS = 24 * 60 * 60 * 1000; // 24時間
const MSG_FETCH_MS = 15000; // 共有メチE��ージ取得間隁E

// 表示チE��ポ：�EわっとIN/OUT長め、でも次はすぐ出る（征E��無し！E
const MSG_IN_MS = 520;
const MSG_HOLD_MS = 1500;
const MSG_OUT_MS = 520;
const MSG_CYCLE_MS = MSG_IN_MS + MSG_HOLD_MS + MSG_OUT_MS; // 2540ms

// === コメントウォール�E�限界挑戦�E�E==
// ☁E��時表示数�E�最大�E�メインノブ�E�毎日 最大1000件まで同時表示
const WALL_MAX_VISIBLE = 1000;

// 画面に出す総文字量�E�Ehar budget�E�E
// ※投稿上限30斁E��なので現状は実質ほぼ効かなぁE��、封E��長斁E��しても破綻しなぁE��ぁE��残す
const WALL_CHAR_BUDGET_PC = 150000;
const WALL_CHAR_BUDGET_MOBILE = 90000;

// 1件あたり最佁E最大の表示斁E��数�E�Eudgetから自動計算した上で、この篁E��に収める！E
const WALL_MIN_CHARS_PER_MSG = 6;
const WALL_MAX_CHARS_PER_MSG_PC = 280;
const WALL_MAX_CHARS_PER_MSG_MOBILE = 240;

// 斁E���E見え方�E�寁E��アチE�E�E�E
const WALL_FONT_PC = 12; // 11、E3
const WALL_FONT_MOBILE = 11; // 10、E2
const WALL_LINE_HEIGHT = 1.35; // 1.28、E.45
const WALL_LETTER_SPACING = "0.02em"; // 0、E.04em
const WALL_MAX_WIDTH_PC = "min(360px, 34vw)";
const WALL_MAX_WIDTH_MOBILE = "min(320px, 50vw)";

// 斁E��色�E�E0色くらぁE��E
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

// ☁E��止ワード（ここをソースで編雁E��て増やしてぁE���E�E
const BANNED_WORDS = ["死ね", "し�E", "あほ", "阿俁E, "キモイ", "きしめE��", "中国", "チャイチE, 
  "ばぁE, "バカ", "馬鹿", "spam", "URL", "http", "https", "@", "可愛くなぁE, "嫌い", 
  "ブス",  "ぶさいぁE,  "ブサイク", "ぶぁE, "逝って", "化粧濁E��", "下手", "大したことなぁE, "死ね", "めE��めE, "引退", "ばばぁE, "ババア", "年墁E] as const;

// ===== Logo =====
const LOGO_SRC = "/logo.png";
const LOGO_ONCE_KEY = "cancana_logo_once_session";
const LOGO_BG = "#000";

const LOGO_IN_MS = 700;
const LOGO_HOLD_MS = 1000;
const LOGO_OUT_MS = 1000;
const LOGO_TOTAL_MS = LOGO_IN_MS + LOGO_HOLD_MS + LOGO_OUT_MS;

// ===== Profile =====
const PROFILE_NAME = `CanCana�E�キャンカナ！E
役老E���E�星空　奏（ほしぞら　かな�E�`;

const PROFILE_TEXT = `
アーチE��スト、俳優、E
福岡出身、大阪育ち、E
持ち前�E表現力を活かし、俳優業を経て、アーチE��ストとして活動中、E
音楽活動では、E���E感�Eある歌声と繊細な表現力で、多くのファンを魁E��E��てぁE��、E
また、ライブパフォーマンスにも定評があり、観客を引き込む力を持つ、E
役老E��では、俳優としての表現力に定評があり、E
細めE��な忁E�E動きからダイナミチE��な転換まで自在に演じ刁E��る、E
声色・視線�E呼吸の“間”で空気を変え、役を生きた存在として立ち上げる演技が魁E��、E

☁E��本惁E��

●血液垁EA垁E
●誕生日 �E�月�E�日 
●身長 151 cm 
●趣味 人間観察、ゲーム、スポ�EチE��戦、ヨガ・美容、海外放浪
●特技 チE��ス、短距離走、ファチE��ョンコーチE��ネ�Eト、殺陣

☁E��老E��歴

●しにも�E調査団 消えたアイドル 夏見役 
●朗読劁E「紁E��空をあおぐ、E主漁E
●�E台 「アリス�E�不思議の国の物語～、Eチェシャ猫役 
●映画 「その人知らず、E木下サクラ役 
●事務所舞台多数 
●東京MX ドラチE「妖�Eなし」文車妖妁E�� 沙奈役 
●映画 「�E日への君へ、E出演手話映画 
●「Pこ�E空、E松永エリ役 
●モナコ国際映画祭出展作品 「TOKYO24、E出漁E
●KARAのギュリ、山本裕�E、E��見しんご 主演作品「Revive by TOKYO24、E出漁E

☁E��ーチE��スト経歴

●「メグリメグル」でインチE��ーズチE��ュー 
●野外フェス 「ONE+NATION、E出漁E
●ビバラポップ！さぁE��まスーパ�EアリーナにてオープニングアクチE出漁E
●ラジオ 川崎FM パ�EソナリチE�� 
●「Revive by TOKYO」挿入歌にオリジナル曲「�Eラリス」が決宁E
●Project DIVA XR Festival バ�Eチャル 出漁E
●宗像フェス出漁E
●東南アジア最大バ�EチャルフェスC3AFA 出漁E
●SHOWROOMトップライバ�E入めE
●ゲーム 「Call of Duty、EチャリチE��ー大会�E式アンバサダー 
◁E朁EバラエチE��出漁E 
●BIGO LIVE 音楽部門Award日本�E�佁E受賁E
●BIGO LIVE 東アジア音楽部門Award�E�佁E受賁E
●バラエチE��番絁E「ニューヨークの勝手に占っちめE��ました、E出漁E
`.trim();

function todayKeyMidnight() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ✁E朁E時墁E���E�タチE�Eカウンタ用�E�E
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

type Particle = {
  id: number;
  x: number;
  y: number;
  s: number;
  r: number;
  dx: number;
  dy: number;
  t: number;
  o: number;
};

function makeParticles(seed = 0): Particle[] {
  const n = 42;
  const arr: Particle[] = [];
  for (let i = 0; i < n; i++) {
    const x = 50 + (Math.random() * 2 - 1) * 26;
    const y = 46 + (Math.random() * 2 - 1) * 20;

    const s = 0.7 + Math.random() * 1.8;
    const r = (Math.random() * 2 - 1) * 90;
    const dx = (Math.random() * 2 - 1) * (80 + Math.random() * 120);
    const dy = 120 + Math.random() * 220;
    const t = Math.floor(Math.random() * 220);
    const o = 0.45 + Math.random() * 0.45;

    arr.push({ id: seed * 1000 + i, x, y, s, r, dx, dy, t, o });
  }
  return arr;
}

// ===== Message types =====
type StoredMsg = {
  id: string;
  text: string;
  ts: number; // ms
};

type Slot = {
  x: number; // % 0..100
  y: number; // % 0..100
};

type MsgView = {
  key: string; // 毎サイクルで変える（アニメを毎回走らせる！E
  text: string;
  x: number; // %
  y: number; // %
  s: number; // scale
  color: string;
};

function within24h(ts: number) {
  return Date.now() - ts <= MSG_TTL_MS;
}

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

/**
 * ☁E��サイクル「ランダム位置」を作る
 * - 少なぁE���E�minDistを効かせて“なるべく重ならなぁE��E
 * - 多い時：minDistを下げ、趁E��い時�E衝突判定をほぼ無効化して“溢れ”優允E
 */
function makeRandomSlots(count: number, isMobile: boolean): Slot[] {
  const minX = 6;
  const maxX = 94;
  const minY = 10;
  const maxY = 90;

  // 寁E��に応じて最小距離�E�E�E�を可変化
  // 少なぁE��き�E距離を確保、多いとき�E距離を詰める�E�重なってOK�E�E
  let minDist: number;
  if (count <= (isMobile ? 40 : 70)) minDist = isMobile ? 5.2 : 4.6;
  else if (count <= (isMobile ? 120 : 200)) minDist = isMobile ? 3.4 : 3.0;
  else if (count <= (isMobile ? 250 : 450)) minDist = isMobile ? 2.2 : 1.9;
  else if (count <= (isMobile ? 450 : 800)) minDist = isMobile ? 1.2 : 1.0;
  else minDist = 0.2; // ほぼ無効�E�E000近いとき�E溢れ優先！E

  const minDist2 = minDist * minDist;

  const slots: Slot[] = [];
  const tries = Math.max(1200, count * 50);

  // ほぼ無効レンジ�E�趁E��量）：衝突判定を省略して高速化
  const skipCollision = minDist <= 0.25;

  for (let t = 0; t < tries && slots.length < count; t++) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);

    // UI避け（上右メニュー / 下左Profile�E�E
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

  // 足りなければ、制紁E��捨ててでも埋め�Eる（“溢れ”優先！E
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

// ===== Supabase REST�E�ライブラリ不要E��E====
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const USE_SUPABASE = Boolean(SB_URL && SB_KEY);

async function sbFetchMessages24h(): Promise<StoredMsg[]> {
  const since = new Date(Date.now() - MSG_TTL_MS).toISOString();
  const url =
    `${SB_URL}/rest/v1/home_messages?` +
    `select=id,text,created_at&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=1000`;

  const res = await fetch(url, {
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Supabase select failed: ${res.status}`);
  const rows = (await res.json()) as Array<{ id: string; text: string; created_at: string }>;
  return rows.map((r) => ({
    id: r.id,
    text: r.text,
    ts: new Date(r.created_at).getTime(),
  }));
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

export default function HomeInteractive({
  images,
  luckyImages = [],
  skullImages = [],
}: {
  images: string[];
  luckyImages?: string[];
  skullImages?: string[];
}) {
  const [homeReady, setHomeReady] = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  
  const forceLogo = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("logo") === "1";
// Profile
  const [profileOpen, setProfileOpen] = useState(false);

  // Secret
  const [secretSrc, setSecretSrc] = useState<string | null>(null);
  const [secretVisible, setSecretVisible] = useState(false);

  const [sparkle, setSparkle] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleKeyRef = useRef(0);

  const hidingRef = useRef<number | null>(null);
  const sparkleRef = useRef<number | null>(null);
  const particlesRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);

  // Message
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

  // ☁E��E��表示�E�キュー�E�＝�E平性維持E
  const msgQueueRef = useRef<StoredMsg[]>([]);
  const msgQueueIdxRef = useRef(0);

  // Mobile detect
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Secret keys�E�E時！E
  const day0 = useMemo(() => todayKeyMidnight(), []);
  const tapKey = `cancana_taps_${day0}`;
  const doneKey = `cancana_secret_done_${day0}`;

  // Message taps�E�E時！E
  const msgTapKey = `cancana_msg_taps_${msgDay}`;

  // local fallback messages�E�E4h�E�E
  const localMsgKey = `cancana_msgs_24h`;

  // 禁止ワード（ソース固定！E
  const bannedWords = useMemo(() => normalizeBannedWords(BANNED_WORDS), []);

  // ☁E��クロールバ�E対策：Home表示中は html/body を完�Eに固宁E
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
    };
  }, []);

  // 6時跨ぎ（タチE�Eカウンタのキーだけ更新�E�E
  useEffect(() => {
    if (msgResetRef.current) window.clearTimeout(msgResetRef.current);
    msgResetRef.current = window.setTimeout(() => setMsgDay(dayKey6am()), msUntilNext6am());
    return () => {
      if (msgResetRef.current) window.clearTimeout(msgResetRef.current);
      msgResetRef.current = null;
    };
  }, [msgDay]);

  const refreshMessages = async () => {
    try {
      if (USE_SUPABASE) {
        const list = await sbFetchMessages24h();
        setMsgList(list.filter((m) => within24h(m.ts)));
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
        const pruned = parsed.filter((m) => within24h(m.ts)).slice(0, 1000);
        setMsgList(pruned);
        localStorage.setItem(localMsgKey, JSON.stringify(pruned));
      }
    } catch {
      // ignore
    }
  };

  // 初回�E�定期取征E
  useEffect(() => {
    refreshMessages();
    if (msgFetchRef.current) window.clearInterval(msgFetchRef.current);
    msgFetchRef.current = window.setInterval(() => refreshMessages(), MSG_FETCH_MS);

    return () => {
      if (msgFetchRef.current) window.clearInterval(msgFetchRef.current);
      msgFetchRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ☁E��示�E�頁E���E��E平�E�＋位置ランダム�E�毎回�E�＋char budget�E�趁E��ラリ
  useEffect(() => {
    if (msgCycleRef.current) window.clearInterval(msgCycleRef.current);
    msgCycleRef.current = null;

    const base = msgList.filter((m) => within24h(m.ts));
    if (base.length === 0) {
      setMsgViews([]);
      return;
    }

    // キュー更新�E��E容が変わったら再構築！E
    const baseIds = base.map((x) => x.id).join("|");
    const qIds = msgQueueRef.current.map((x) => x.id).join("|");
    if (baseIds !== qIds) {
      const q = shuffleInPlace([...base]);
      msgQueueRef.current = q;
      msgQueueIdxRef.current = 0;
    }

    // ☁E��時表示数�E�最大1000�E�少なぁE��は少なぁE�Eだけ＝重ならなぁE��先！E
    const takeFixed = Math.min(WALL_MAX_VISIBLE, base.length);

    const tick = () => {
      msgSeqRef.current += 1;
      const seq = msgSeqRef.current;

      const q = msgQueueRef.current.length ? msgQueueRef.current : base;
      const take = takeFixed;

      // 頁E��に take 件�E��E平性�E�E
      const chosen: StoredMsg[] = [];
      for (let i = 0; i < take; i++) {
        const idx = (msgQueueIdxRef.current + i) % q.length;
        chosen.push(q[idx]);
      }
      msgQueueIdxRef.current = (msgQueueIdxRef.current + take) % q.length;

      // 一周したら�EシャチE��ル�E�偏り軽減！E
      if (msgQueueIdxRef.current === 0 && q.length > 1) {
        const qq = [...q];
        shuffleInPlace(qq);
        msgQueueRef.current = qq;
      }

      // char budget�E�画面総量で制御�E�E
      const totalBudget = isMobile ? WALL_CHAR_BUDGET_MOBILE : WALL_CHAR_BUDGET_PC;
      const perAuto = Math.floor(totalBudget / take);
      const perMax = isMobile ? WALL_MAX_CHARS_PER_MSG_MOBILE : WALL_MAX_CHARS_PER_MSG_PC;
      const per = clamp(perAuto, WALL_MIN_CHARS_PER_MSG, perMax);

      // ☁E��回ランダム位置生�E�E�E�E�E
      const slots = makeRandomSlots(take, isMobile);

      const views: MsgView[] = [];
      for (let i = 0; i < take; i++) {
        const slot = slots[i];
        const m = chosen[i];

        const clipped = clipForBudget(m.text, per);

        views.push({
          key: `msg_${seq}_${i}_${m.id}`,
          text: clipped,
          x: slot.x,
          y: slot.y,
          s: 0.96 + Math.random() * 0.10,
          color: pickOne(MSG_COLORS),
        });
      }

      setMsgViews(views);
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
      if (sparkleRef.current) window.clearTimeout(sparkleRef.current);
      if (particlesRef.current) window.clearTimeout(particlesRef.current);
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];

      if (msgCycleRef.current) window.clearInterval(msgCycleRef.current);
      if (msgFetchRef.current) window.clearInterval(msgFetchRef.current);
      if (msgResetRef.current) window.clearTimeout(msgResetRef.current);
    };
  }, []);

  // Logo once
  useEffect(() => {
    let already = false;
    try {
      already = sessionStorage.getItem(LOGO_ONCE_KEY) === "1";
    } catch {}

    if (already) {
      setHomeReady(true);
      return;
    }

    try {
      sessionStorage.setItem(LOGO_ONCE_KEY, "1");
    } catch {}

    setShowLogo(true);
    setHomeReady(false);

    const t = window.setTimeout(() => {
      setShowLogo(false);
      setHomeReady(true);
    }, LOGO_TOTAL_MS);

    timersRef.current.push(t);
  }, []);

  const meltMask = {
    WebkitMaskImage:
      "radial-gradient(closest-side, rgba(0,0,0,1) 55%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0) 100%)",
    maskImage:
      "radial-gradient(closest-side, rgba(0,0,0,1) 55%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0) 100%)",
  };

  const triggerSecret = async () => {
    if (localStorage.getItem(doneKey) === "1") return;

    const isSkull = Math.random() < SKULL_RATE;
    const picked = isSkull
      ? pickOne(skullImages) ?? "/secret/skull_01.jpg"
      : pickOne(luckyImages) ?? "/secret/lucky_01.jpg";

    localStorage.setItem(doneKey, "1");

    if (isSkull) {
      playSE("/se/skull.mp3", 0.85);
      setSparkle(false);
      setParticles([]);
    } else {
      playSE("/se/lucky.mp3", 0.95);
      setSparkle(true);
      particleKeyRef.current += 1;
      setParticles(makeParticles(particleKeyRef.current));

      if (sparkleRef.current) window.clearTimeout(sparkleRef.current);
      sparkleRef.current = window.setTimeout(() => setSparkle(false), 900);

      if (particlesRef.current) window.clearTimeout(particlesRef.current);
      particlesRef.current = window.setTimeout(() => setParticles([]), 1400);
    }

    setSecretSrc(picked);
    setSecretVisible(true);

    if (hidingRef.current) window.clearTimeout(hidingRef.current);
    hidingRef.current = window.setTimeout(() => {
      setSecretVisible(false);
      window.setTimeout(() => setSecretSrc(null), 450);
    }, SECRET_SHOW_MS);
  };

  // Tap: Secret + Message modal (tap-only)
  const onTap = () => {
    // Secret
    const n = Number(localStorage.getItem(tapKey) ?? "0") + 1;
    localStorage.setItem(tapKey, String(n));
    if (n >= TAP_GOAL) {
      localStorage.setItem(tapKey, "0");
      triggerSecret();
    }

    // Message: every 30 taps -> open modal
    const m = Number(localStorage.getItem(msgTapKey) ?? "0") + 1;
    localStorage.setItem(msgTapKey, String(m));
    if (m >= MESSAGE_GOAL && m % MESSAGE_GOAL === 0) {
      setMsgOpen(true);
      setValidationError("");
    }
  };

  // validation
  useEffect(() => {
    const t = msgText.trim();
    if (!t) {
      setValidationError("");
      return;
    }
    if (t.length > MSG_MAX_LEN) {
      setValidationError(`※${MSG_MAX_LEN}斁E��までです`);
      return;
    }
    const hit = containsBanned(t, bannedWords);
    if (hit) setValidationError("※入力禁止ワードが含まれてぁE��ぁE);
    else setValidationError("");
  }, [msgText, bannedWords]);

  const postMessage = async () => {
    const raw = msgText.trim().replace(/\s+/g, " ");
    if (!raw) return;

    const clipped = raw.slice(0, MSG_MAX_LEN);

    const hit = containsBanned(clipped, bannedWords);
    if (hit) {
      setValidationError("※入力禁止ワードが含まれてぁE��ぁE);
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
        const next = [item, ...msgList].filter((m) => within24h(m.ts)).slice(0, 1000);
        setMsgList(next);
        localStorage.setItem(localMsgKey, JSON.stringify(next));
      }

      await refreshMessages();

      setMsgText("");
      setMsgOpen(false);
      setValidationError("");
    } catch {
      setValidationError("送信に失敗しました。時間をおいて再度お試しください、E);
    }
  };

  const blockTap = showLogo || !homeReady;
  const uiBlocking = profileOpen || msgOpen;

  // Logoキーフレーム用%
  const pInEnd = Math.round((LOGO_IN_MS / LOGO_TOTAL_MS) * 100);
  const pHoldEnd = Math.round(((LOGO_IN_MS + LOGO_HOLD_MS) / LOGO_TOTAL_MS) * 100);

  const showProfileButton = homeReady && !showLogo && !secretSrc;

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100svh",
        overflow: "hidden", // ☁E��クロールバ�E根絶�E�横も含む�E�E
        touchAction: "manipulation",
      }}
    >
{/* HI DEBUG (TEMP) */}
{typeof window !== "undefined" && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 2147483647,
      background: "#ff00ff",
      color: "#fff",
      padding: "8px 10px",
      fontSize: 14,
      fontWeight: 900,
      letterSpacing: "0.06em",
      pointerEvents: "none",
    }}
  >
    HI DEBUG search={window.location.search}
  </div>
)}
      {homeReady && <HomeClient images={images} />}

      {/* Messages overlay�E�Eixed + %座標で“確実にランダム配置”！E*/}
      {msgViews.length > 0 && !showLogo && homeReady && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 25,
            pointerEvents: "none",
          }}
        >
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
                  animation: `msgText ${MSG_CYCLE_MS}ms ease-in-out forwards, msgGlowStrong ${MSG_CYCLE_MS}ms ease-in-out forwards`,
                  willChange: "opacity, transform, filter, text-shadow",
                  whiteSpace: "pre-wrap",
                  maxWidth: isMobile ? WALL_MAX_WIDTH_MOBILE : WALL_MAX_WIDTH_PC,
                  filter: "saturate(1.03)",
                }}
              >
                {m.text}
              </div>
            </div>
          ))}

          <style>{`
            @keyframes msgText{
              0%   { opacity: 0; transform: translateY(6px) scale(0.99); filter: blur(1.6px); }
              18%  { opacity: 1; transform: translateY(0px) scale(1.0); filter: blur(0px); }
              82%  { opacity: 1; transform: translateY(0px) scale(1.0); filter: blur(0px); }
              100% { opacity: 0; transform: translateY(-2px) scale(1.01); filter: blur(1.6px); }
            }

            /* ☁E��E��ラリ�E�text-shadow強化＋brightness。スパ�Eクル無しで軽ぁE*/
            @keyframes msgGlowStrong{
              0%{
                text-shadow:
                  0 1px 2px rgba(0,0,0,0.78),
                  0 18px 40px rgba(0,0,0,0.45);
                filter: brightness(1) saturate(1.03);
              }
              8%{
                text-shadow:
                  0 0 10px rgba(255,255,255,0.75),
                  0 0 22px rgba(255,255,255,0.55),
                  0 0 44px rgba(255,255,255,0.32),
                  0 1px 2px rgba(0,0,0,0.78),
                  0 18px 40px rgba(0,0,0,0.45);
                filter: brightness(1.45) contrast(1.06) saturate(1.12);
              }
              18%{
                text-shadow:
                  0 0 8px rgba(255,255,255,0.55),
                  0 0 18px rgba(255,255,255,0.38),
                  0 0 34px rgba(255,255,255,0.22),
                  0 1px 2px rgba(0,0,0,0.78),
                  0 18px 40px rgba(0,0,0,0.45);
                filter: brightness(1.25) contrast(1.04) saturate(1.10);
              }
              34%{
                text-shadow:
                  0 0 6px rgba(255,255,255,0.30),
                  0 0 14px rgba(255,255,255,0.18),
                  0 1px 2px rgba(0,0,0,0.78),
                  0 18px 40px rgba(0,0,0,0.45);
                filter: brightness(1.08) saturate(1.05);
              }
              48%{
                text-shadow:
                  0 1px 2px rgba(0,0,0,0.78),
                  0 18px 40px rgba(0,0,0,0.45);
                filter: brightness(1) saturate(1.03);
              }
              100%{
                text-shadow:
                  0 1px 2px rgba(0,0,0,0.78),
                  0 18px 40px rgba(0,0,0,0.45);
                filter: brightness(1) saturate(1.03);
              }
            }

            /* ☁E�Eタン Hover/Active 統一�E�Elose / Post / Profile Close�E�E*/
            .cancanaBtn{
              transition: transform 140ms ease, background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease, filter 140ms ease;
              -webkit-tap-highlight-color: transparent;
              user-select: none;
            }
            .cancanaBtn:not(:disabled):hover{
              transform: translateY(-1px);
              background-color: rgba(255,255,255,0.12) !important;
              border-color: rgba(255,255,255,0.24) !important;
              box-shadow: 0 10px 30px rgba(0,0,0,0.35);
              filter: brightness(1.06);
            }
            .cancanaBtn:not(:disabled):active{
              transform: translateY(0px) scale(0.99);
              background-color: rgba(255,255,255,0.10) !important;
              border-color: rgba(255,255,255,0.20) !important;
              box-shadow: 0 6px 18px rgba(0,0,0,0.28);
              filter: brightness(1.02);
            }
            .cancanaBtn:focus-visible{
              outline: none;
              box-shadow: 0 0 0 3px rgba(255,255,255,0.20), 0 10px 30px rgba(0,0,0,0.35);
            }
            .cancanaBtn:disabled{
              opacity: 0.55;
            }
          `}</style>
        </div>
      )}

      {/* Hearts */}
      <HeartsLayer enabled={!blockTap && !uiBlocking} onTap={blockTap || uiBlocking ? () => {} : onTap} />

      {/* Profile button */}
      {showProfileButton && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setProfileOpen(true)}
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

      {/* Message modal�E�タチE�Eした時�Eみ�E�E*/}
      {msgOpen && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 95,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.62)",
            padding: 18,
          }}
        >
          <div
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              width: "min(620px, 94vw)",
              borderRadius: 18,
              background: "rgba(0,0,0,0.86)",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: 16,
              boxShadow: "0 30px 120px rgba(0,0,0,0.65)",
              color: "rgba(255,255,255,0.92)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ letterSpacing: "0.12em", opacity: 0.9, fontSize: 13 }}>Message</div>
              <button
                type="button"
                className="cancanaBtn"
                onClick={() => {
                  setMsgOpen(false);
                  setValidationError("");
                }}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(255,255,255,0.85)",
                  borderRadius: 12,
                  padding: "8px 10px",
                  letterSpacing: "0.08em",
                }}
              >
                Close
              </button>
            </div>

            <div style={{ marginTop: 10, opacity: 0.78, fontSize: 12.5, lineHeight: 1.7 }}>
              みんなのメチE��ージを書ぁE��ね♡�E�EMSG_MAX_LEN}斁E��まで�E�E
            </div>

            <textarea
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder="メチE��ージは24時間以冁E��消えるよ♡"
              rows={4}
              style={{
                marginTop: 12,
                width: "100%",
                resize: "none",
                borderRadius: 14,
                padding: "12px 12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.92)",
                outline: "none",
                lineHeight: 1.7,
                letterSpacing: "0.04em",
              }}
              onPointerDown={(e) => e.stopPropagation()}
            />

            {validationError && (
              <div style={{ marginTop: 10, color: "#ff4d4d", fontSize: 12.5, letterSpacing: "0.04em" }}>
                {validationError}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
              <button
                type="button"
                className="cancanaBtn"
                onClick={postMessage}
                disabled={Boolean(validationError) || msgText.trim().length === 0}
                style={{
                  padding: "10px 12px",
                  borderRadius: 14,
                  background:
                    Boolean(validationError) || msgText.trim().length === 0
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color:
                    Boolean(validationError) || msgText.trim().length === 0
                      ? "rgba(255,255,255,0.45)"
                      : "rgba(255,255,255,0.95)",
                  letterSpacing: "0.08em",
                  cursor:
                    Boolean(validationError) || msgText.trim().length === 0 ? "not-allowed" : "pointer",
                }}
              >
                Post
              </button>
            </div>

            <div style={{ marginTop: 12, opacity: 0.55, fontSize: 11, lineHeight: 1.5 }}>
              {USE_SUPABASE ? "共有モード（�E員に表示�E�E : "ローカルモード（この端末のみ�E�E}
            </div>
            <div style={{ marginTop: 10, opacity: 0.55, fontSize: 11, lineHeight: 1.5 }}>
              禁止ワード�Eソース冁E�E <code>BANNED_WORDS</code> を編雁E��てください、E
            </div>
          </div>
        </div>
      )}

      {/* Profile modal */}
      {profileOpen && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.58)",
            padding: 18,
          }}
        >
          <div
            style={{
              width: "min(760px, 94vw)",
              maxHeight: "82svh",
              overflow: "auto",
              borderRadius: 18,
              background: "rgba(0,0,0,0.86)",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: 18,
              color: "rgba(255,255,255,0.92)",
              lineHeight: 1.9,
              boxShadow: "0 30px 120px rgba(0,0,0,0.65)",

              // ✁E��マ�Eだけ文字を少し小さく（変な改行を減らす！E
              fontSize: isMobile ? 12.5 : 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ letterSpacing: "0.12em", opacity: 0.9 }}>Profile</div>
              <button
                type="button"
                className="cancanaBtn"
                onClick={() => setProfileOpen(false)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.9)",
                  borderRadius: 10,
                  padding: "6px 10px",
                  letterSpacing: "0.06em",
                }}
              >
                Close
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  // ✁E��マ�Eだけ名前ブロチE��を少し小さぁE
                  fontSize: isMobile ? 17 : 20,
                  lineHeight: 1.7,
                  letterSpacing: "0.06em",
                  opacity: 0.96,
                }}
              >
                {PROFILE_NAME}
              </div>

              <div style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{PROFILE_TEXT}</div>
            </div>
          </div>
        </div>
      )}

      {/* Logo overlay (DEBUG SIMPLE) */}
{(showLogo || forceLogo) && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 999999,
      background: "#fff",
      display: "grid",
      placeItems: "center",
      pointerEvents: "all",
    }}
  >
    <img
      src="/logo.png"
      alt="logo"
      style={{
        width: "min(70vw, 420px)",
        height: "auto",
        display: "block",
      }}
    />
  </div>
)}{/* Secret overlay */}
      {secretSrc && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.58)",
            opacity: secretVisible ? 1 : 0,
            transition: "opacity 420ms ease",
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at center, rgba(0,0,0,0) 38%, rgba(0,0,0,0.6) 100%)",
            }}
          />

          {sparkle && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.9), rgba(255,255,255,0) 55%)",
                mixBlendMode: "screen",
                animation: "spark 900ms ease-out forwards",
              }}
            />
          )}

          {particles.length > 0 && (
            <div style={{ position: "absolute", inset: 0 }}>
              {particles.map((p) => (
                <div
                  key={p.id}
                  style={{
                    position: "absolute",
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: 10,
                    height: 10,
                    opacity: p.o,
                    transform: `translate(-50%,-50%) rotate(${p.r}deg) scale(${p.s})`,
                    filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.4))",
                    animation: `pop 1350ms cubic-bezier(0.22,1,0.36,1) forwards`,
                    ["--dx" as any]: `${p.dx}px`,
                    ["--dy" as any]: `${p.dy}px`,
                    animationDelay: `${p.t}ms`,
                    mixBlendMode: "screen",
                  }}
                >
                  <div className="sparkStar" />
                </div>
              ))}
            </div>
          )}

          <img
            src={secretSrc}
            alt=""
            style={{
              maxWidth: "92vw",
              maxHeight: "92svh",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 30px 120px rgba(0,0,0,0.7))",
              transform: "translateZ(0)",
              ...meltMask,
            }}
          />
        </div>
      )}
    </div>
  );
}
