"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import type { Locale } from "@/types";
import {
  audioChunkUrl,
  getExamIndex,
  type JlptExamIndex,
} from "@/data/jlpt/exams";
import {
  buildSections,
  fetchExam,
  jlptAsset,
  type JlptItem,
  type JlptSection,
} from "@/lib/jlpt/api";
import {
  isPassEstimate,
  totalScaled,
  withScaled,
  type SectionResult,
} from "@/lib/jlpt/scoring";
import { recordJlptAttempt } from "@/lib/jlpt/progress";
import { recordAttempt } from "@/lib/progress";

// ---------------------------------------------------------------------------
// Shared style fragments (Kezett design system: slate + emerald)
// ---------------------------------------------------------------------------

const OPT_BASE =
  "w-full rounded-2xl border p-4 text-left transition";
const OPT_SELECTED =
  "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20 dark:bg-emerald-950/30";
const OPT_IDLE =
  "border-slate-200 hover:border-slate-400 dark:border-slate-700";
const OPT_CORRECT =
  "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
const OPT_WRONG = "border-red-400 bg-red-50 dark:bg-red-950/30";

const MONDAI_BADGE =
  "badge border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
const LABEL_CHIP =
  "rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-black text-white dark:bg-slate-100 dark:text-slate-900";

/** mm:ss — minutes may exceed 59 (e.g. the 70-minute section). */
function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
    s % 60,
  ).padStart(2, "0")}`;
}

/** m:ss — for the listening audio elapsed display. */
function fmtElapsed(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Sub-components (same file, per spec)
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

function ItemCard({
  q,
  showPassage,
  showInst,
  selected,
  flagged,
  onAnswer,
  onToggleFlag,
}: {
  q: JlptItem;
  showPassage: boolean;
  showInst: boolean;
  selected?: number;
  flagged: boolean;
  onAnswer: (id: string, value: number) => void;
  onToggleFlag: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {showInst && q.inst ? (
        <div className="jp px-1 text-sm font-bold leading-relaxed text-slate-500 dark:text-slate-400">
          {q.inst}
        </div>
      ) : null}
      {showPassage && q.passage ? <PassageBlock text={q.passage} /> : null}
      <article className="card scroll-mt-28 p-5" data-qcard={q.id}>
        <div className="mb-3 flex items-center gap-2">
          <span className={LABEL_CHIP}>{q.label}</span>
          <span className={MONDAI_BADGE}>{q.mondai}</span>
          <button
            type="button"
            onClick={() => onToggleFlag(q.id)}
            title={flagged ? "Hapus tanda ragu" : "Tandai ragu"}
            className={`ml-auto rounded-lg px-2 py-1 text-base transition ${
              flagged ? "" : "opacity-40 hover:opacity-100"
            }`}
          >
            {flagged ? "🚩" : "🏳"}
          </button>
        </div>
        {q.caption ? (
          <p className="mb-2 text-xs text-slate-400">{q.caption}</p>
        ) : null}
        {q.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={q.image}
            alt=""
            className="mb-3 w-full max-w-[540px] rounded-xl border"
          />
        ) : null}
        {q.text ? (
          <p className="jp whitespace-pre-wrap leading-loose">{q.text}</p>
        ) : null}
        <div className="mt-4 grid gap-2">
          {q.options.map((opt, oi) => {
            const value = oi + 1; // answers are stored 1-based, matching q.key
            const isSel = selected === value;
            return (
              <button
                key={oi}
                type="button"
                data-opt={oi}
                onClick={() => onAnswer(q.id, value)}
                className={`${OPT_BASE} flex items-start ${
                  isSel ? OPT_SELECTED : OPT_IDLE
                }`}
              >
                <span
                  className={`mr-3 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-black ${
                    isSel
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                  }`}
                >
                  {value}
                </span>
                <span className="jp flex-1 leading-relaxed">{opt}</span>
              </button>
            );
          })}
        </div>
      </article>
    </div>
  );
}

function ReviewItem({
  q,
  userAns,
  showPassage,
}: {
  q: JlptItem;
  userAns?: number;
  showPassage: boolean;
}) {
  const isCorrect = userAns !== undefined && userAns === q.key;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={LABEL_CHIP}>{q.label}</span>
        <span className="text-sm font-bold">{isCorrect ? "✅" : "❌"}</span>
        <span className="text-sm text-slate-500">
          kamu: {userAns ?? "—"} • kunci: {q.key ?? "—"}
        </span>
      </div>
      {showPassage && q.passage ? <PassageBlock text={q.passage} /> : null}
      {q.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={q.image}
          alt=""
          className="w-full max-w-[540px] rounded-xl border"
        />
      ) : null}
      {q.text ? (
        <p className="jp whitespace-pre-wrap leading-loose">{q.text}</p>
      ) : null}
      <div className="grid gap-2">
        {q.options.map((opt, oi) => {
          const value = oi + 1;
          const isKey = q.key === value;
          const isPicked = userAns === value;
          const cls = isKey
            ? OPT_CORRECT
            : isPicked
              ? OPT_WRONG
              : "border-slate-200 dark:border-slate-700 opacity-75";
          return (
            <div key={oi} className={`${OPT_BASE} flex items-start ${cls}`}>
              <span className="mr-3 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-black text-slate-500 dark:bg-slate-800">
                {value}
              </span>
              <span className="jp flex-1 leading-relaxed">{opt}</span>
              {isKey ? (
                <span className="ml-2 shrink-0 text-xs font-black text-emerald-600">
                  ✓ Kunci
                </span>
              ) : null}
              {isPicked && !isKey ? (
                <span className="ml-2 shrink-0 text-xs font-black text-red-500">
                  ✗ Pilihanmu
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      {q.expl ? (
        <div className="soft-card mt-3 whitespace-pre-wrap p-4 text-sm leading-relaxed">
          <span className="font-black">Pembahasan: </span>
          {q.expl}
        </div>
      ) : null}
    </div>
  );
}

function Palette({
  qs,
  answers,
  flags,
  currentId,
  onJump,
}: {
  qs: JlptItem[];
  answers: Record<string, number>;
  flags: Set<string>;
  currentId: string;
  onJump: (id: string) => void;
}) {
  const answeredCount = qs.filter((q) => answers[q.id] !== undefined).length;
  return (
    <div className="card p-4 lg:sticky lg:top-24">
      <div className="font-black">🗂 Navigasi</div>
      <div className="mb-3 mt-1 text-xs text-slate-500">
        Terjawab {answeredCount}/{qs.length}
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {qs.map((q) => {
          const short = q.label
            .replace("No.", "")
            .replace("問題", "")
            .replace("番", "");
          const isCurrent = q.id === currentId;
          const isAnswered = answers[q.id] !== undefined;
          const cls = isCurrent
            ? "bg-emerald-600 text-white"
            : isAnswered
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800";
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onJump(q.id)}
              className={`relative rounded-lg py-2 text-xs font-bold ${cls}`}
            >
              {short}
              {flags.has(q.id) ? (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        ditandai ragu
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main runner
// ---------------------------------------------------------------------------

type Phase = "exam" | "result" | "retry" | "retryResult";

interface ResultData {
  secResults: SectionResult[];
  totalC: number;
  totalQ: number;
  pct: number;
  totScaled: number;
  passed: boolean;
}

interface RetryResultData {
  correct: number;
  total: number;
  pct: number;
}

export function JlptRunner({ locale, id }: { locale: Locale; id: string }) {
  const examIdx: JlptExamIndex | undefined = useMemo(
    () => getExamIndex(id),
    [id],
  );

  const [sections, setSections] = useState<JlptSection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("exam");
  const [sectionIdx, setSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flags, setFlags] = useState<Set<string>>(new Set());
  // null = timer not armed yet (prevents a false auto-finish on the load commit)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [currentId, setCurrentId] = useState("");

  // Listening audio engine
  const [chunkIdx, setChunkIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsedDisplay, setElapsedDisplay] = useState(0);

  // Result / review / retry
  const [result, setResult] = useState<ResultData | null>(null);
  const [filter, setFilter] = useState<"all" | "wrong">("all");
  const [retryItems, setRetryItems] = useState<JlptItem[]>([]);
  const [retryAnswers, setRetryAnswers] = useState<Record<string, number>>({});
  const [retryFlags, setRetryFlags] = useState<Set<string>>(new Set());
  const [retryCurrentId, setRetryCurrentId] = useState("");
  const [retrySeconds, setRetrySeconds] = useState(0);
  const [retryResult, setRetryResult] = useState<RetryResultData | null>(null);

  // Refs (interval / audio / keyboard handlers must never see stale state)
  const sectionsRef = useRef<JlptSection[]>([]);
  const answersRef = useRef<Record<string, number>>({});
  const sectionIdxRef = useRef(0);
  const chunkIdxRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<HTMLAudioElement | null>(null);
  const lastElapsedRef = useRef(0);
  const savedRef = useRef(false);
  const retrySavedRef = useRef(false);

  useEffect(() => {
    sectionsRef.current = sections;
    answersRef.current = answers;
    sectionIdxRef.current = sectionIdx;
    chunkIdxRef.current = chunkIdx;
  });

  // ---------------- Data loading ----------------
  useEffect(() => {
    if (!examIdx) return;
    let alive = true;
    fetchExam(id)
      .then((data) => {
        if (!alive) return;
        const secs = buildSections(data, examIdx.timers);
        setSections(secs);
        setCurrentId(secs[0]?.qs[0]?.id ?? "");
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setError(
          e instanceof Error ? e.message : "Gagal memuat soal tryout ini.",
        );
      });
    return () => {
      alive = false;
    };
  }, [id, examIdx]);

  // ---------------- Answer / flag handlers ----------------
  const setAnswer = useCallback((qid: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
    setCurrentId(qid);
  }, []);

  const toggleFlag = useCallback((qid: string) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  }, []);

  const setRetryAnswer = useCallback((qid: string, value: number) => {
    setRetryAnswers((prev) => ({ ...prev, [qid]: value }));
    setRetryCurrentId(qid);
  }, []);

  const toggleRetryFlag = useCallback((qid: string) => {
    setRetryFlags((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  }, []);

  const jumpTo = useCallback((qid: string, retry: boolean) => {
    if (retry) setRetryCurrentId(qid);
    else setCurrentId(qid);
    document
      .querySelector(`[data-qcard="${qid}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // ---------------- Audio engine ----------------
  const pauseAudio = useCallback(() => {
    const a = audioRef.current;
    if (a && !a.paused) a.pause();
    setPlaying(false);
  }, []);

  const preloadChunk = useCallback(
    (n: number) => {
      if (!examIdx || n < 0 || n >= examIdx.audioChunks) return;
      if (typeof window === "undefined") return;
      if (!preloadRef.current) preloadRef.current = new Audio();
      preloadRef.current.preload = "auto";
      const url = audioChunkUrl(examIdx.id, n);
      if (preloadRef.current.src !== url) preloadRef.current.src = url;
    },
    [examIdx],
  );

  // Entering the listening section: reset to chunk 0, paused.
  useEffect(() => {
    if (phase !== "exam" || !examIdx) return;
    const sec = sections[sectionIdx];
    if (!sec || sec.key !== "listening") return;
    chunkIdxRef.current = 0;
    setChunkIdx(0);
    lastElapsedRef.current = 0;
    setElapsedDisplay(0);
    setPlaying(false);
    const a = audioRef.current;
    if (a) {
      a.src = audioChunkUrl(examIdx.id, 0);
      a.load();
    }
    preloadChunk(1);
  }, [phase, sectionIdx, sections, examIdx, preloadChunk]);

  // Pause audio on unmount.
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (preloadRef.current) {
        preloadRef.current.src = "";
        preloadRef.current = null;
      }
    };
  }, []);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a || !examIdx) return;
    if (a.paused) {
      if (!a.src) a.src = audioChunkUrl(examIdx.id, chunkIdxRef.current);
      void a.play().catch(() => {
        /* autoplay / network hiccup — user can press play again */
      });
    } else {
      a.pause();
    }
  }, [examIdx]);

  const handleEnded = useCallback(() => {
    if (!examIdx) {
      setPlaying(false);
      return;
    }
    const cur = chunkIdxRef.current;
    if (cur < examIdx.audioChunks - 1) {
      const next = cur + 1;
      chunkIdxRef.current = next;
      setChunkIdx(next);
      lastElapsedRef.current = next * 25;
      setElapsedDisplay(next * 25);
      const a = audioRef.current;
      if (a) {
        a.src = audioChunkUrl(examIdx.id, next);
        void a.play().catch(() => {});
      }
      preloadChunk(next + 1);
    } else {
      setPlaying(false);
    }
  }, [examIdx, preloadChunk]);

  const handleTimeUpdate = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    const el = chunkIdxRef.current * 25 + a.currentTime;
    // timeupdate fires ~4x/sec; only re-render when the displayed second flips.
    if (Math.floor(el) !== Math.floor(lastElapsedRef.current)) {
      lastElapsedRef.current = el;
      setElapsedDisplay(el);
    }
  }, []);

  // ---------------- Section flow ----------------
  const finishSection = useCallback(() => {
    const secs = sectionsRef.current;
    if (!secs.length) return;
    pauseAudio();
    const cur = sectionIdxRef.current;
    if (cur < secs.length - 1) {
      const nxt = cur + 1;
      setSectionIdx(nxt);
      setCurrentId(secs[nxt]?.qs[0]?.id ?? "");
      if (typeof window !== "undefined") window.scrollTo(0, 0);
      return;
    }
    const ans = answersRef.current;
    const secRaw = secs.map((s) => ({
      name: s.name,
      correct: s.qs.filter((q) => ans[q.id] === q.key).length,
      total: s.qs.length,
    }));
    const secResults = withScaled(secRaw);
    const totalC = secRaw.reduce((a, s) => a + s.correct, 0);
    const totalQ = secRaw.reduce((a, s) => a + s.total, 0);
    const pct = totalQ ? Math.round((totalC / totalQ) * 100) : 0;
    setResult({
      secResults,
      totalC,
      totalQ,
      pct,
      totScaled: totalScaled(secResults),
      passed: isPassEstimate(secResults),
    });
    setPhase("result");
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [pauseAudio]);

  const askFinish = useCallback(() => {
    const sec = sectionsRef.current[sectionIdxRef.current];
    if (!sec) return;
    const un = sec.qs.filter(
      (q) => answersRef.current[q.id] === undefined,
    ).length;
    if (un > 0) {
      const ok = window.confirm(
        `Masih ada ${un} soal belum dijawab. Selesai sesi ini?`,
      );
      if (!ok) return;
    }
    finishSection();
  }, [finishSection]);

  // ---------------- Timers ----------------
  // Arm/reset the countdown whenever the section changes.
  useEffect(() => {
    if (sections.length) {
      setSecondsLeft(sections[sectionIdx].min * 60);
    }
  }, [sectionIdx, sections]);

  useEffect(() => {
    if (phase !== "exam" || !sections.length) return;
    const t = window.setInterval(() => {
      setSecondsLeft((prev) =>
        prev === null ? prev : Math.max(0, prev - 1),
      );
    }, 1000);
    return () => window.clearInterval(t);
  }, [phase, sections.length]);

  // Countdown reached zero → finish the section automatically (no confirm).
  useEffect(() => {
    if (phase === "exam" && sections.length > 0 && secondsLeft === 0) {
      finishSection();
    }
  }, [secondsLeft, phase, sections.length, finishSection]);

  // Retry mode: count-up timer.
  useEffect(() => {
    if (phase !== "retry") return;
    const t = window.setInterval(
      () => setRetrySeconds((p) => p + 1),
      1000,
    );
    return () => window.clearInterval(t);
  }, [phase]);

  // ---------------- Keyboard answering (keys 1–4) ----------------
  useEffect(() => {
    if (phase !== "exam") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (target?.isContentEditable) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > 4) return;
      const cards = document.querySelectorAll<HTMLElement>("[data-qcard]");
      let card: HTMLElement | null = null;
      for (const c of Array.from(cards)) {
        const r = c.getBoundingClientRect();
        if (r.top > -200 && r.top < window.innerHeight * 0.6) {
          card = c;
          break;
        }
      }
      if (!card) return;
      const qid = card.dataset.qcard;
      if (!qid) return;
      const sec = sectionsRef.current[sectionIdxRef.current];
      const item = sec?.qs.find((q) => q.id === qid);
      if (!item || n > item.options.length) return;
      setAnswer(qid, n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, setAnswer]);

  // ---------------- Derived data ----------------
  const wrongItems = useMemo(
    () =>
      sections
        .flatMap((s) => s.qs)
        .filter((q) => answers[q.id] !== q.key),
    [sections, answers],
  );

  // ---------------- Save-once: main tryout result ----------------
  useEffect(() => {
    if (phase !== "result" || !result || !examIdx || savedRef.current) return;
    savedRef.current = true;
    recordJlptAttempt({
      title: `${examIdx.label} (tryout)`,
      correct: result.totalC,
      total: result.totalQ,
      pct: result.pct,
      sections: result.secResults,
    });
    recordAttempt({
      type: "tryout",
      title: `JLPT ${examIdx.label}`,
      correct: result.totalC,
      total: result.totalQ,
      pct: result.pct,
    });
  }, [phase, result, examIdx]);

  // ---------------- Retry-wrong flow ----------------
  const startRetry = useCallback(() => {
    if (!wrongItems.length) return;
    setRetryItems(wrongItems);
    setRetryAnswers({});
    setRetryFlags(new Set());
    setRetrySeconds(0);
    setRetryCurrentId(wrongItems[0]?.id ?? "");
    setRetryResult(null);
    setPhase("retry");
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [wrongItems]);

  const finishRetry = useCallback(() => {
    const correct = retryItems.filter(
      (q) => retryAnswers[q.id] === q.key,
    ).length;
    const total = retryItems.length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    setRetryResult({ correct, total, pct });
    setPhase("retryResult");
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [retryItems, retryAnswers]);

  // Save-once: retry result counts as a drill attempt.
  useEffect(() => {
    if (
      phase !== "retryResult" ||
      !retryResult ||
      !examIdx ||
      retrySavedRef.current
    )
      return;
    retrySavedRef.current = true;
    recordJlptAttempt({
      title: `${examIdx.label} (drill)`,
      correct: retryResult.correct,
      total: retryResult.total,
      pct: retryResult.pct,
      sections: withScaled([
        {
          name: "Drill",
          correct: retryResult.correct,
          total: retryResult.total,
        },
      ]),
    });
    recordAttempt({
      type: "drill",
      title: `JLPT ${examIdx.label} — Ulangi yang Salah`,
      correct: retryResult.correct,
      total: retryResult.total,
      pct: retryResult.pct,
    });
  }, [phase, retryResult, examIdx]);

  // ---------------- Early states ----------------
  if (!examIdx) {
    return (
      <div className="soft-card p-8 text-center">
        <p className="font-bold">Tryout tidak ditemukan.</p>
        <Link href={`/${locale}/jlpt/tryout`} className="btn-primary mt-4">
          ← Kembali ke Daftar Tryout
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="soft-card p-8 text-center">
        <p className="font-bold text-red-600">Gagal memuat soal.</p>
        <p className="mt-1 text-sm text-slate-500">{error}</p>
        <Link href={`/${locale}/jlpt/tryout`} className="btn-primary mt-4">
          ← Kembali ke Daftar Tryout
        </Link>
      </div>
    );
  }

  if (!sections.length) {
    return (
      <div className="soft-card p-8 text-center text-slate-500">
        Memuat soal…
      </div>
    );
  }

  const section = sections[sectionIdx];
  const answeredInSection = section.qs.filter(
    (q) => answers[q.id] !== undefined,
  ).length;
  const sectionProgress = section.qs.length
    ? (answeredInSection / section.qs.length) * 100
    : 0;
  const timerDanger = secondsLeft !== null && secondsLeft < 60;
  const audioPct = examIdx.audioSeconds
    ? Math.min(100, (elapsedDisplay / examIdx.audioSeconds) * 100)
    : 0;
  const retryAnswered = retryItems.filter(
    (q) => retryAnswers[q.id] !== undefined,
  ).length;

  // ---------------- Render ----------------
  return (
    <div className="space-y-4">
      {/* Hidden listening engine (kept mounted across phases) */}
      <audio
        ref={audioRef}
        className="hidden"
        preload="none"
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {phase === "exam" && (
        <>
          {/* Section header */}
          <div className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={LABEL_CHIP}>{examIdx.label}</span>
                  <span className="badge border-slate-200 text-slate-500 dark:border-slate-700">
                    JLPT N3
                  </span>
                </div>
                <h1 className="jp mt-2 text-xl font-black">{section.title}</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Sesi {sectionIdx + 1}/3 • {section.qs.length} soal
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Sisa waktu</div>
                <div
                  className={`text-3xl font-black tabular-nums ${
                    timerDanger ? "text-red-600" : ""
                  }`}
                >
                  {fmtClock(secondsLeft ?? section.min * 60)}
                </div>
                <button
                  type="button"
                  className="btn-primary mt-2"
                  onClick={askFinish}
                >
                  Selesai Sesi →
                </button>
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all"
                style={{ width: `${sectionProgress}%` }}
              />
            </div>
            <div className="mt-1.5 text-xs text-slate-500">
              Terjawab {answeredInSection}/{section.qs.length} soal di sesi ini
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
            <div className="min-w-0 space-y-4">
              {section.key === "listening" && (
                <div className="card sticky top-20 z-10 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="jp font-black">🎧 聴解 — Audio Ujian</div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Di ujian asli audio diputar sekali tanpa jeda.
                        問題3–5 pilihannya hanya terdengar dari audio.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold tabular-nums">
                        {fmtElapsed(elapsedDisplay)} /{" "}
                        {fmtElapsed(examIdx.audioSeconds)}
                      </span>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={togglePlay}
                      >
                        {playing ? "⏸ Jeda" : "▶ Putar"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all"
                      style={{ width: `${audioPct}%` }}
                    />
                  </div>
                  <div className="mt-1.5 text-[11px] text-slate-400">
                    Bagian {chunkIdx + 1} dari {examIdx.audioChunks} • tanpa
                    tombol seek — seperti ujian asli
                  </div>
                </div>
              )}

              {section.qs.map((q, i) => (
                <ItemCard
                  key={q.id}
                  q={q}
                  showPassage={
                    !!q.passage && q.passage !== section.qs[i - 1]?.passage
                  }
                  showInst={!!q.inst && q.inst !== section.qs[i - 1]?.inst}
                  selected={answers[q.id]}
                  flagged={flags.has(q.id)}
                  onAnswer={setAnswer}
                  onToggleFlag={toggleFlag}
                />
              ))}
            </div>

            <aside>
              <Palette
                qs={section.qs}
                answers={answers}
                flags={flags}
                currentId={currentId}
                onJump={(qid) => jumpTo(qid, false)}
              />
            </aside>
          </div>
        </>
      )}

      {phase === "result" && result && (
        <div className="space-y-5">
          <div className="card p-6">
            <h2 className="text-2xl font-black">📊 Hasil Kamu</h2>
            <p className="mt-1 text-sm text-slate-500">
              {examIdx.label} — JLPT N3 Tryout
            </p>
            <div className="mt-5 space-y-3">
              {result.secResults.map((s) => (
                <div
                  key={s.name}
                  className="soft-card flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <div className="jp font-black">{s.name}</div>
                    <div className="text-sm text-slate-500">
                      {s.correct}/{s.total} benar
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`badge ${
                        s.scaled >= 19
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}
                    >
                      {s.scaled >= 19
                        ? "✅ di atas batas 19"
                        : "⚠️ di bawah batas 19"}
                    </span>
                    <span className="text-2xl font-black tabular-nums">
                      {s.scaled}
                      <span className="text-sm text-slate-400">/60</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="font-bold">
                Total {result.totalC}/{result.totalQ} ({result.pct}%) •
                Estimasi total {result.totScaled}/180
              </div>
              <span
                className={`badge ${
                  result.passed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                }`}
              >
                {result.passed
                  ? "🎉 LULUS (estimasi)"
                  : "Belum lulus (estimasi)"}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Skor skala adalah estimasi kasar: lulus N3 ≥95 total &amp; tiap
              bagian ≥19.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/${locale}/jlpt/tryout`} className="btn-ghost">
                ← Daftar Tryout
              </Link>
              <Link href={`/${locale}/jlpt/history`} className="btn-ghost">
                Lihat Riwayat
              </Link>
            </div>
          </div>

          {/* Review controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={
                filter === "all"
                  ? "btn-primary"
                  : "btn-ghost border border-slate-200 dark:border-slate-700"
              }
            >
              Semua Soal
            </button>
            <button
              type="button"
              onClick={() => setFilter("wrong")}
              className={
                filter === "wrong"
                  ? "btn-primary"
                  : "btn-ghost border border-slate-200 dark:border-slate-700"
              }
            >
              Salah Saja ({wrongItems.length})
            </button>
            {wrongItems.length > 0 && (
              <button
                type="button"
                className="btn-primary ml-auto"
                onClick={startRetry}
              >
                ↻ Kerjakan Ulang yang Salah ({wrongItems.length})
              </button>
            )}
          </div>

          {/* Review per section */}
          {sections.map((sec) => {
            const items =
              filter === "wrong"
                ? sec.qs.filter((q) => answers[q.id] !== q.key)
                : sec.qs;
            if (!items.length) return null;
            return (
              <div key={sec.key} className="card p-5">
                <h3 className="jp mb-4 font-black">
                  {sec.name} — Review ({items.length})
                </h3>
                <div className="space-y-6">
                  {items.map((q, i) => (
                    <ReviewItem
                      key={q.id}
                      q={q}
                      userAns={answers[q.id]}
                      showPassage={
                        !!q.passage && q.passage !== items[i - 1]?.passage
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Listening transcript */}
          {examIdx.scriptPages > 0 && (
            <div className="card p-5">
              <h3 className="mb-3 font-black">🎧 Transkrip Listening</h3>
              <div>
                {Array.from(
                  { length: examIdx.scriptPages },
                  (_, i) => i + 1,
                ).map((n) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={n}
                    src={jlptAsset(
                      `script/${id}/ls-${String(n).padStart(2, "0")}.jpg`,
                    )}
                    alt={`Transkrip listening halaman ${n}`}
                    loading="lazy"
                    className="mb-2 w-full rounded-xl border"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "retry" && (
        <>
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">↻ Ulangi yang Salah</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {examIdx.label} • {retryItems.length} soal • Terjawab{" "}
                  {retryAnswered}/{retryItems.length}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-500">Waktu</div>
                  <div className="text-2xl font-black tabular-nums">
                    {fmtClock(retrySeconds)}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={finishRetry}
                >
                  Selesai →
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
            <div className="min-w-0 space-y-4">
              {retryItems.map((q, i) => (
                <ItemCard
                  key={q.id}
                  q={q}
                  showPassage={
                    !!q.passage && q.passage !== retryItems[i - 1]?.passage
                  }
                  showInst={
                    !!q.inst && q.inst !== retryItems[i - 1]?.inst
                  }
                  selected={retryAnswers[q.id]}
                  flagged={retryFlags.has(q.id)}
                  onAnswer={setRetryAnswer}
                  onToggleFlag={toggleRetryFlag}
                />
              ))}
            </div>
            <aside>
              <Palette
                qs={retryItems}
                answers={retryAnswers}
                flags={retryFlags}
                currentId={retryCurrentId}
                onJump={(qid) => jumpTo(qid, true)}
              />
            </aside>
          </div>
        </>
      )}

      {phase === "retryResult" && retryResult && (
        <div className="space-y-5">
          <div className="card p-6 text-center">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald-50 text-3xl font-black text-emerald-700 dark:bg-emerald-950/40">
              {retryResult.pct}%
            </div>
            <h2 className="mt-4 text-2xl font-black">
              Ulangi yang Salah — Selesai
            </h2>
            <p className="mt-2 text-slate-500">
              {retryResult.correct} dari {retryResult.total} soal benar kali
              ini.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setPhase("result")}
              >
                Kembali ke Hasil
              </button>
              <Link href={`/${locale}/jlpt/history`} className="btn-ghost">
                Lihat Riwayat
              </Link>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-4 font-black">
              Review Ulang ({retryItems.length})
            </h3>
            <div className="space-y-6">
              {retryItems.map((q, i) => (
                <ReviewItem
                  key={q.id}
                  q={q}
                  userAns={retryAnswers[q.id]}
                  showPassage={
                    !!q.passage && q.passage !== retryItems[i - 1]?.passage
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
