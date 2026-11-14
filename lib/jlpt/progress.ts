// JLPT progress store: attempt history (jlpt_hist) + drill seen-set (jlpt_seen),
// with optional cloud sync to the JLPT API when a Google session token exists.
// Ported from the standalone app (merge/dedupe semantics preserved).

import type { SectionResult } from "./scoring";
import type { JlptSection } from "./api";

export const JLPT_API = "https://jlpt-n3-api.vercel.app";

export interface JlptAttempt {
  id: string;
  ts: number;
  date: string;
  title: string;
  correct: number;
  total: number;
  pct: number;
  sections: SectionResult[];
  /**
   * Full per-question record. Present only for tryouts finished after the
   * history-detail fix (2026-11-14); older attempts carry the summary only
   * and the detail view says so instead of inventing answers.
   */
  detail?: JlptAttemptDetail;
}

/** One answered question inside a saved attempt (compact keys). */
export interface JlptAttemptAnswer {
  /** Question id, e.g. V12 / G38 / L5-7 */
  id: string;
  /** Section key */
  s: "vocab" | "bunpo" | "listening";
  /** Mondai number, e.g. 3 */
  m: number;
  /** User's answer (1-based); absent when unanswered */
  a?: number;
  /** Correct answer (1-based), when known */
  k?: number;
  /** Seconds spent on this question (per-question timer) */
  t?: number;
}

/** Full per-question record of a finished tryout. */
export interface JlptAttemptDetail {
  /** Exam id, e.g. "2013-07" — needed to reload questions/keys for review */
  examId: string;
  /** Seconds per section (sum of per-question times) */
  sectionSecs: Partial<Record<"vocab" | "bunpo" | "listening", number>>;
  /** All questions in exam order */
  perQ: JlptAttemptAnswer[];
}

function parseMondai(mondai: string): number {
  const n = parseInt((mondai || "").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Build the full per-question record at finish time, from the runner's
 * sections + answers + per-question times. ~5 KB per attempt, so the
 * 300-attempt history cap stays well inside localStorage limits.
 */
export function buildAttemptDetail(
  examId: string,
  sections: JlptSection[],
  answers: Record<string, number>,
  qTimes: Record<string, number>
): JlptAttemptDetail {
  const sectionSecs: JlptAttemptDetail["sectionSecs"] = {};
  const perQ: JlptAttemptAnswer[] = [];
  for (const sec of sections) {
    let secs = 0;
    for (const q of sec.qs) {
      const t = qTimes[q.id];
      if (typeof t === "number" && t > 0) secs += t;
      perQ.push({
        id: q.id,
        s: sec.key,
        m: parseMondai(q.mondai),
        ...(answers[q.id] !== undefined ? { a: answers[q.id] } : {}),
        ...(q.key !== undefined ? { k: q.key } : {}),
        ...(typeof t === "number" ? { t } : {}),
      });
    }
    sectionSecs[sec.key] = secs;
  }
  return { examId, sectionSecs, perQ };
}

const HIST_KEY = "jlpt_hist";
const SEEN_KEY = "jlpt_seen";

export function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("jlpt_token") || "";
}

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ---------------- History ----------------

export function getHist(): JlptAttempt[] {
  if (typeof window === "undefined") return [];
  return safeParse<JlptAttempt[]>(localStorage.getItem(HIST_KEY), []);
}

export function saveHist(h: JlptAttempt[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HIST_KEY, JSON.stringify(h.slice(-300)));
}

/** Append one finished attempt; returns the stored entry. */
export function recordJlptAttempt(entry: {
  title: string;
  correct: number;
  total: number;
  pct: number;
  sections: SectionResult[];
  detail?: JlptAttemptDetail;
}): JlptAttempt {
  const nowS = Date.now();
  const item: JlptAttempt = {
    ...entry,
    id: "h" + nowS.toString(36) + Math.floor(Math.random() * 1e4).toString(36),
    ts: nowS,
    date: new Date(nowS).toLocaleString("id-ID"),
  };
  const h = getHist();
  h.push(item);
  saveHist(h);
  pushProgress();
  return item;
}

export function clearHist() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HIST_KEY);
  pushProgress();
}

/** Attempts whose title starts with the given exam label (standalone libAtt semantics). */
export function attemptsForLabel(label: string): JlptAttempt[] {
  return getHist().filter((x) => x.title && x.title.indexOf(label) === 0);
}

// ---------------- Drill seen-set ----------------

export function getSeen(): Set<string> {
  if (typeof window === "undefined") return new Set();
  return new Set(safeParse<string[]>(localStorage.getItem(SEEN_KEY), []));
}

export function saveSeen(s: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...s]));
  } catch {
    /* storage full / unavailable */
  }
}

export function markSeen(id: string) {
  if (!id) return;
  const s = getSeen();
  if (s.has(id)) return;
  s.add(id);
  saveSeen(s);
  pushProgress();
}

// ---------------- Cloud sync ----------------

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function parseHistDate(s?: string): number {
  try {
    const d = String(s || "").split(",")[0].trim().split("/");
    if (d.length === 3) return new Date(+d[2], +d[1] - 1, +d[0]).getTime();
  } catch {
    /* ignore */
  }
  return 0;
}

/** Union local + cloud history by id; legacy entries without an id get a synthetic one (sections included in the hash). */
export function mergeHist(
  localArr: JlptAttempt[],
  cloudArr: JlptAttempt[]
): JlptAttempt[] {
  const map = new Map<string, JlptAttempt>();
  const add = (x: JlptAttempt) => {
    if (!x) return;
    const id =
      x.id ||
      "x" +
        simpleHash(
          (x.date || "") +
            (x.title || "") +
            (x.correct || 0) +
            "/" +
            (x.total || 0) +
            JSON.stringify(x.sections || [])
        );
    map.set(id, { ...x, id, ts: x.ts || parseHistDate(x.date) || 0 });
  };
  (localArr || []).forEach(add);
  (cloudArr || []).forEach(add);
  return [...map.values()].sort((a, b) => (a.ts || 0) - (b.ts || 0)).slice(-300);
}

export function apiFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    ...((opts.headers as Record<string, string>) || {}),
    Authorization: `Bearer ${getToken()}`,
  };
  if (opts.body) headers["Content-Type"] = "application/json";
  return fetch(JLPT_API + path, { ...opts, headers });
}

export type SyncResult = "ok" | "no-token" | "unauthorized" | "error";

let lastSyncAt: string | null = null;
export function getLastSyncAt(): string | null {
  return lastSyncAt;
}

function clearSession() {
  localStorage.removeItem("jlpt_token");
  localStorage.removeItem("jlpt_user");
}

/** Pull cloud progress, merge with local (hist + seen), push back if local had more. */
export async function syncNow(): Promise<SyncResult> {
  if (!getToken()) return "no-token";
  try {
    const r = await apiFetch("/api/progress");
    if (r.status === 401) {
      clearSession();
      return "unauthorized";
    }
    if (!r.ok) return "error";
    const d = await r.json();
    const cloud: JlptAttempt[] = (d && d.hist) || [];
    const merged = mergeHist(getHist(), cloud);
    saveHist(merged);

    const cloudSeen: string[] = (d && d.seen) || [];
    const mergedSeen = getSeen();
    cloudSeen.forEach((id) => mergedSeen.add(id));
    saveSeen(mergedSeen);

    const lastId = merged.length ? merged[merged.length - 1].id : null;
    const cloudLast = cloud.length ? cloud[cloud.length - 1].id : null;
    if (
      merged.length !== cloud.length ||
      lastId !== cloudLast ||
      mergedSeen.size !== cloudSeen.length
    ) {
      await apiFetch("/api/progress", {
        method: "PUT",
        body: JSON.stringify({ hist: merged, settings: {}, seen: [...mergedSeen] }),
      });
    }
    lastSyncAt = new Date().toLocaleTimeString("id-ID");
    return "ok";
  } catch {
    return "error";
  }
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced upload of the full local progress document (standalone pushProgress). */
export function pushProgress() {
  if (typeof window === "undefined" || !getToken()) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    try {
      const r = await apiFetch("/api/progress", {
        method: "PUT",
        body: JSON.stringify({ hist: getHist(), settings: {}, seen: [...getSeen()] }),
      });
      if (r.status === 401) {
        clearSession();
        return;
      }
      if (r.ok) lastSyncAt = new Date().toLocaleTimeString("id-ID");
    } catch {
      /* offline — local copy is the source of truth until next sync */
    }
  }, 1200);
}
