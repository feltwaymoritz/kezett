import type { Category, StoredAttempt } from "@/types";

const ACTIVITY_KEY = "kezett-study-days";
const ATTEMPT_KEY = "kezett-attempts";
const SCORE_KEY = "kezett-category-scores";

function localDay(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function safeParse<T>(value: string | null, fallback: T): T {
  try { return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}

export function markStudyActivity() {
  if (typeof window === "undefined") return;
  const days = new Set(safeParse<string[]>(localStorage.getItem(ACTIVITY_KEY), []));
  days.add(localDay());
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify([...days].sort()));
}

export function getStreak() {
  if (typeof window === "undefined") return { current: 0, best: 0, activeDays: [] as string[] };
  const activeDays = safeParse<string[]>(localStorage.getItem(ACTIVITY_KEY), []).sort();
  const set = new Set(activeDays);
  let current = 0;
  const cursor = new Date();
  // If there was no activity today, allow streak display to continue from yesterday.
  if (!set.has(localDay(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(localDay(cursor))) { current++; cursor.setDate(cursor.getDate() - 1); }

  let best = 0, run = 0, previous: Date | null = null;
  for (const day of activeDays) {
    const d = new Date(`${day}T12:00:00`);
    if (!previous) run = 1;
    else {
      const diff = Math.round((d.getTime() - previous.getTime()) / 86400000);
      run = diff === 1 ? run + 1 : 1;
    }
    previous = d;
    best = Math.max(best, run);
  }
  return { current, best, activeDays };
}

export function getAttempts(): StoredAttempt[] {
  if (typeof window === "undefined") return [];
  return safeParse<StoredAttempt[]>(localStorage.getItem(ATTEMPT_KEY), []);
}

export function recordAttempt(attempt: Omit<StoredAttempt, "id" | "date">) {
  if (typeof window === "undefined") return;
  markStudyActivity();
  const attempts = getAttempts();
  const item: StoredAttempt = { ...attempt, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, date: new Date().toISOString() };
  attempts.unshift(item);
  localStorage.setItem(ATTEMPT_KEY, JSON.stringify(attempts.slice(0, 150)));
  if (attempt.categoryScores) updateCategoryScores(attempt.categoryScores);
}

export function getCategoryScores(): Record<Category, number> {
  if (typeof window === "undefined") return { vocabulary: 0, grammar: 0, listening: 0, reading: 0 };
  return { vocabulary: 0, grammar: 0, listening: 0, reading: 0, ...safeParse(localStorage.getItem(SCORE_KEY), {}) };
}

export function updateCategoryScores(next: Partial<Record<Category, number>>) {
  if (typeof window === "undefined") return;
  const current = getCategoryScores();
  for (const key of Object.keys(next) as Category[]) {
    const value = next[key];
    if (value === undefined) continue;
    current[key] = current[key] > 0 ? Math.round(current[key] * 0.6 + value * 0.4) : value;
  }
  localStorage.setItem(SCORE_KEY, JSON.stringify(current));
}
