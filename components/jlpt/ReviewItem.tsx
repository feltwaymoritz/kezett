// Shared JLPT question-review rendering, used by both the runner's result
// screen and the history attempt-detail view — one source of truth so a
// past attempt reviews exactly like a fresh result.
"use client";

import type { JlptItem } from "@/lib/jlpt/api";

export const OPT_BASE = "w-full rounded-2xl border p-4 text-left transition";
export const OPT_CORRECT =
  "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
export const OPT_WRONG = "border-red-400 bg-red-50 dark:bg-red-950/30";
export const LABEL_CHIP =
  "rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-black text-white dark:bg-slate-100 dark:text-slate-900";

/** m:ss — for the listening audio elapsed display and per-question times. */
export function fmtElapsed(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Render question text with the booklet's underlined target word (vocab M1/M2/M4). */
export function UnderlinedText({
  text,
  underline,
}: {
  text: string;
  underline?: string;
}) {
  if (!underline) return <>{text}</>;
  const i = text.indexOf(underline);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <u className="underline decoration-emerald-600 decoration-2 underline-offset-4">
        {underline}
      </u>
      {text.slice(i + underline.length)}
    </>
  );
}

export function PassageBlock({ text }: { text: string }) {
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

export function ReviewItem({
  q,
  userAns,
  showPassage,
  timeSec,
}: {
  q: JlptItem;
  userAns?: number;
  showPassage: boolean;
  timeSec?: number;
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
        {timeSec !== undefined ? (
          <span className="text-sm tabular-nums text-slate-500">
            ⏱ {fmtElapsed(timeSec)}
          </span>
        ) : null}
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
        <p className="jp whitespace-pre-wrap leading-loose">
          <UnderlinedText text={q.text} underline={q.underline} />
        </p>
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
