"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { Locale } from "@/types";
import {
  loadDrillBank,
  type DrillCategory,
  type DrillItem,
} from "@/lib/jlpt/api";
import { withScaled } from "@/lib/jlpt/scoring";
import { getSeen, markSeen, recordJlptAttempt } from "@/lib/jlpt/progress";
import { recordAttempt } from "@/lib/progress";

// ---------------------------------------------------------------------------
// Shared style fragments (Kezett design system: slate + emerald)
// ---------------------------------------------------------------------------

const OPT_BASE = "w-full rounded-2xl border p-4 text-left transition";
const OPT_IDLE =
  "border-slate-200 hover:border-slate-400 dark:border-slate-700";
const OPT_CORRECT =
  "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
const OPT_WRONG = "border-red-400 bg-red-50 dark:bg-red-950/30";
const OPT_DIM = "border-slate-200 dark:border-slate-700 opacity-70";

const LABEL_CHIP =
  "rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-black text-white dark:bg-slate-100 dark:text-slate-900";

const CAT_LABELS: Record<string, string> = {
  vocab: "文字・語彙 (Moji/Goi)",
  grammar: "文法 (Bunpō)",
  reading: "読解 (Dokkai)",
  listening: "聴解 (Chōkai)",
  mix: "Campuran",
};

/** mm:ss — minutes may exceed 59 for long sessions. */
function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
    s % 60,
  ).padStart(2, "0")}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Sub-components (same file)
// ---------------------------------------------------------------------------

function PassageBlock({ text }: { text: string }) {
  return (
    <div
      className="soft-card jp whitespace-pre-wrap p-5 leading-loose"
      // Inline style: .soft-card's unlayered border must not override the accent.
      style={{ borderLeft: "4px solid #fbbf24" }}
    >
      {text}
    </div>
  );
}

function DrillCard({
  item,
  selected,
  finished,
  onChoose,
}: {
  item: DrillItem;
  /** 1-based picked value, undefined while unanswered. */
  selected?: number;
  finished: boolean;
  onChoose: (item: DrillItem, value: number) => void;
}) {
  const answered = selected !== undefined;
  // Once the session is finished, reveal keys + explanations for review.
  const revealed = answered || finished;
  const isRight = answered && selected === item.answer;
  return (
    <article className="card p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={LABEL_CHIP}>{item.id}</span>
        <span className="badge border-slate-200 text-slate-500 dark:border-slate-700">
          {item.sub}
        </span>
        {answered && (
          <span
            className={`badge ${
              isRight
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
            }`}
          >
            {isRight ? "✅ Benar" : "❌ Salah"}
          </span>
        )}
      </div>

      {item.passage ? (
        <div className="mb-3">
          <PassageBlock text={item.passage} />
        </div>
      ) : null}

      {item.audio ? (
        <audio
          controls
          preload="none"
          src={item.audio}
          className="mb-3 w-full"
        />
      ) : null}

      <p className="jp whitespace-pre-wrap leading-loose">{item.question}</p>

      <div className="mt-4 grid gap-2">
        {item.options.map((opt, oi) => {
          const value = oi + 1; // answers are stored 1-based, matching item.answer
          const isAnswer = value === item.answer;
          const isPicked = selected === value;
          let cls: string = OPT_IDLE;
          if (revealed) {
            cls = isAnswer ? OPT_CORRECT : isPicked ? OPT_WRONG : OPT_DIM;
          }
          const chipCls =
            revealed && isAnswer
              ? "bg-emerald-600 text-white"
              : revealed && isPicked
                ? "bg-red-500 text-white"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800";
          return (
            <button
              key={oi}
              type="button"
              disabled={answered || finished}
              onClick={() => onChoose(item, value)}
              className={`${OPT_BASE} flex items-start ${cls}`}
            >
              <span
                className={`mr-3 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-black ${chipCls}`}
              >
                {value}
              </span>
              <span className="jp flex-1 leading-relaxed">{opt}</span>
              {revealed && isAnswer ? (
                <span className="ml-2 shrink-0 text-xs font-black text-emerald-600">
                  ✓
                </span>
              ) : null}
              {revealed && isPicked && !isAnswer ? (
                <span className="ml-2 shrink-0 text-xs font-black text-red-500">
                  ✗
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {revealed && item.explanation_id ? (
        <div className="soft-card mt-3 whitespace-pre-wrap p-4 text-sm leading-relaxed">
          <span className="font-black">Pembahasan: </span>
          {item.explanation_id}
        </div>
      ) : null}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Main runner
// ---------------------------------------------------------------------------

export function JlptDrillRunner({
  locale,
  category,
  count,
  timerOn,
  minutes,
}: {
  locale: Locale;
  category: string;
  count: number;
  timerOn: boolean;
  minutes: number;
}) {
  const catLabel = CAT_LABELS[category] ?? category;

  const [pool, setPool] = useState<DrillItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const [seconds, setSeconds] = useState(() => (timerOn ? minutes * 60 : 0));

  const poolRef = useRef<DrillItem[] | null>(null);
  const answersRef = useRef<Record<string, number>>({});
  const savedRef = useRef(false);
  const finishRef = useRef<() => void>(() => {});

  useEffect(() => {
    poolRef.current = pool;
    answersRef.current = answers;
  });

  // ---------------- Load bank + build the session pool ----------------
  // Unseen questions first (no-repeat), then previously seen ones.
  useEffect(() => {
    let alive = true;
    loadDrillBank()
      .then((bank) => {
        if (!alive) return;
        const all: DrillItem[] =
          category === "mix"
            ? [
                ...bank.vocab,
                ...bank.grammar,
                ...bank.reading,
                ...bank.listening,
              ]
            : (bank[category as DrillCategory] ?? []);
        const seen = getSeen();
        const fresh = shuffle(all.filter((it) => !seen.has(it.id)));
        const old = shuffle(all.filter((it) => seen.has(it.id)));
        const p = [...fresh, ...old].slice(
          0,
          Math.min(count, all.length),
        );
        setPool(p);
        setSeconds(timerOn ? minutes * 60 : 0);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setError(
          e instanceof Error ? e.message : "Gagal memuat bank soal latihan.",
        );
      });
    return () => {
      alive = false;
    };
  }, [category, count, timerOn, minutes]);

  // ---------------- Finish (manual or timer auto-finish) ----------------
  const finish = () => {
    const p = poolRef.current;
    if (!p || !p.length) return;
    const ans = answersRef.current;
    const correct = p.filter((it) => ans[it.id] === it.answer).length;
    const pct = p.length ? Math.round((correct / p.length) * 100) : 0;
    if (!savedRef.current) {
      savedRef.current = true;
      recordJlptAttempt({
        title: `Drill ${category} (drill)`,
        correct,
        total: p.length,
        pct,
        sections: withScaled([{ name: "Drill", correct, total: p.length }]),
      });
      recordAttempt({
        type: "drill",
        title: `JLPT Drill ${category}`,
        correct,
        total: p.length,
        pct,
      });
    }
    setFinished(true);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };

  useEffect(() => {
    finishRef.current = finish;
  });

  // ---------------- Timer ----------------
  useEffect(() => {
    if (!pool || finished) return;
    const t = window.setInterval(() => {
      setSeconds((prev) =>
        timerOn ? Math.max(0, prev - 1) : prev + 1,
      );
    }, 1000);
    return () => window.clearInterval(t);
  }, [pool, finished, timerOn]);

  // Countdown hit zero → auto-finish.
  useEffect(() => {
    if (timerOn && pool && pool.length > 0 && !finished && seconds <= 0) {
      finishRef.current();
    }
  }, [seconds, timerOn, pool, finished]);

  // ---------------- Answering (locked once set, instant feedback) ----------------
  const choose = (item: DrillItem, value: number) => {
    if (finished) return;
    if (answersRef.current[item.id] !== undefined) return;
    answersRef.current = { ...answersRef.current, [item.id]: value };
    setAnswers((prev) =>
      prev[item.id] !== undefined ? prev : { ...prev, [item.id]: value },
    );
    markSeen(item.id);
  };

  // ---------------- Early states ----------------
  if (error) {
    return (
      <div className="soft-card p-8 text-center">
        <p className="font-bold text-red-600">Gagal memuat bank soal.</p>
        <p className="mt-1 text-sm text-slate-500">{error}</p>
        <Link href={`/${locale}/jlpt/drill`} className="btn-primary mt-4">
          ← Kembali ke Latihan
        </Link>
      </div>
    );
  }

  if (pool === null) {
    return (
      <div className="soft-card p-8 text-center text-slate-500">
        Memuat bank soal…
      </div>
    );
  }

  if (pool.length === 0) {
    return (
      <div className="soft-card p-8 text-center">
        <p className="font-bold">
          Kategori ini belum tersedia di bank latihan.
        </p>
        <Link href={`/${locale}/jlpt/drill`} className="btn-primary mt-4">
          ← Kembali ke Latihan
        </Link>
      </div>
    );
  }

  const answeredCount = pool.filter(
    (it) => answers[it.id] !== undefined,
  ).length;
  const correctCount = pool.filter(
    (it) => answers[it.id] === it.answer,
  ).length;
  const pct = Math.round((correctCount / pool.length) * 100);
  const progress = (answeredCount / pool.length) * 100;
  const timerDanger = timerOn && seconds < 60;

  // ---------------- Render ----------------
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-black">Latihan — {catLabel}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Terjawab {answeredCount}/{pool.length}
              {timerOn ? "" : " • Timer mati (mode santai)"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-500">
                {timerOn ? "Sisa waktu" : "Waktu berjalan"}
              </div>
              <div
                className={`text-2xl font-black tabular-nums ${
                  timerDanger ? "text-red-600" : ""
                }`}
              >
                {fmtClock(seconds)}
              </div>
            </div>
            {!finished && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => finishRef.current()}
              >
                Selesai →
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Result summary (the answered list stays visible below) */}
      {finished && (
        <div className="card p-6 text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald-50 text-3xl font-black text-emerald-700 dark:bg-emerald-950/40">
            {pct}%
          </div>
          <h2 className="mt-4 text-2xl font-black">📊 Hasil Latihan</h2>
          <p className="mt-2 text-slate-500">
            {correctCount} dari {pool.length} soal benar — {catLabel}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href={`/${locale}/jlpt/drill`} className="btn-primary">
              Drill Lagi
            </Link>
            <Link
              href={`/${locale}/jlpt/history`}
              className="btn-ghost border border-slate-200 dark:border-slate-700"
            >
              Lihat Riwayat
            </Link>
          </div>
        </div>
      )}

      {/* Question list */}
      <div className="space-y-4">
        {pool.map((item) => (
          <DrillCard
            key={item.id}
            item={item}
            selected={answers[item.id]}
            finished={finished}
            onChoose={choose}
          />
        ))}
      </div>

      {!finished && (
        <div className="flex justify-end">
          <button
            type="button"
            className="btn-primary"
            onClick={() => finishRef.current()}
          >
            Selesai →
          </button>
        </div>
      )}
    </div>
  );
}
