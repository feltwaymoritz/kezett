// Attempt-detail modal for JLPT history: re-opens a finished tryout's full
// review (per-question answers vs keys, per-question times, explanations)
// from the detail record saved at finish time. Attempts finished before the
// detail fix carry only a summary — the modal says so instead of inventing
// answers.
"use client";

import { useEffect, useMemo, useState } from "react";

import { buildSections, fetchExam, type JlptSection } from "@/lib/jlpt/api";
import { getExamIndex, JLPT_TIMERS } from "@/data/jlpt/exams";
import {
  isPassEstimate,
  maxScaledTotal,
  totalScaled,
} from "@/lib/jlpt/scoring";
import type { JlptAttempt } from "@/lib/jlpt/progress";
import { ReviewItem, fmtElapsed } from "./ReviewItem";

const SECTION_LABEL: Record<string, string> = {
  vocab: "文字・語彙",
  bunpo: "文法・読解",
  listening: "聴解",
};

export function AttemptDetail({
  attempt,
  onClose,
}: {
  attempt: JlptAttempt;
  onClose: () => void;
}) {
  const detail = attempt.detail;
  const [sections, setSections] = useState<JlptSection[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<"all" | "wrong">("all");

  useEffect(() => {
    if (!detail) return;
    let alive = true;
    const timers = getExamIndex(detail.examId)?.timers ?? JLPT_TIMERS;
    fetchExam(detail.examId)
      .then((data) => {
        if (!alive) return;
        setSections(buildSections(data, timers));
      })
      .catch(() => {
        if (!alive) return;
        setLoadError(true);
      });
    return () => {
      alive = false;
    };
  }, [detail]);

  const byId = useMemo(
    () => new Map((detail?.perQ ?? []).map((p) => [p.id, p])),
    [detail]
  );

  const wrongCount = useMemo(
    () => (detail?.perQ ?? []).filter((p) => p.a !== p.k).length,
    [detail]
  );

  const secs = attempt.sections ?? [];
  const passed = secs.length > 0 && isPassEstimate(secs);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detail ${attempt.title}`}
    >
      <div
        className="mx-auto my-6 max-w-3xl space-y-6 rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">{attempt.title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {attempt.date} • {attempt.correct}/{attempt.total} (
              {attempt.pct}%)
              {secs.length
                ? ` • Estimasi total ${totalScaled(secs)}/${maxScaledTotal(secs)}`
                : ""}
            </p>
            {secs.length > 0 ? (
              <p className="mt-1 text-sm text-slate-500">
                Skor skala:{" "}
                {secs.map((s) => `${s.name} ${s.scaled}`).join(" • ")}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {secs.length > 0 ? (
              <span
                className={`badge ${
                  passed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                }`}
              >
                {passed ? "🎉 LULUS (estimasi)" : "Belum lulus (estimasi)"}
              </span>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost rounded-xl border border-slate-200 px-3 py-1.5 dark:border-slate-700"
              aria-label="Tutup detail"
            >
              ✕
            </button>
          </div>
        </div>

        {!detail ? (
          <div className="soft-card p-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <p className="font-black">Detail per soal tidak tersedia.</p>
            <p className="mt-1">
              Sesi ini diselesaikan sebelum perbaikan riwayat (14 Nov 2026),
              jadi yang tersimpan hanya ringkasan skor di atas. Sesi yang
              diselesaikan sesudah perbaikan menyimpan jawaban tiap soal,
              kunci, dan waktu per soal — klik barisnya untuk melihat
              pembahasan lengkap.
            </p>
          </div>
        ) : !sections && !loadError ? (
          <div className="soft-card p-6 text-center text-slate-500">
            Memuat soal…
          </div>
        ) : loadError || !sections ? (
          <div className="space-y-4">
            <div className="soft-card p-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Soal tryout tidak bisa dimuat, tapi jawabanmu tersimpan — ini
              daftarnya:
            </div>
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                    <th className="px-4 py-3 font-semibold">Soal</th>
                    <th className="px-4 py-3 font-semibold">Seksi</th>
                    <th className="px-4 py-3 font-semibold">Kamu</th>
                    <th className="px-4 py-3 font-semibold">Kunci</th>
                    <th className="px-4 py-3 font-semibold">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.perQ.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                    >
                      <td className="px-4 py-2 font-semibold">
                        {p.id} • 問題{p.m}
                      </td>
                      <td className="px-4 py-2">
                        {SECTION_LABEL[p.s] ?? p.s}
                      </td>
                      <td
                        className={`px-4 py-2 font-bold ${
                          p.a === p.k
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {p.a ?? "—"}
                      </td>
                      <td className="px-4 py-2">{p.k ?? "—"}</td>
                      <td className="px-4 py-2 tabular-nums">
                        {p.t !== undefined ? fmtElapsed(p.t) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            {/* Per-question times — same presentation as the result screen */}
            <div className="card p-6">
              <h3 className="text-xl font-black">⏱ Waktu per Soal</h3>
              <p className="mt-1 text-sm text-slate-500">
                Dihitung dari jawaban sebelumnya sampai kamu klik jawaban soal
                ini. Soal yang paling lama = yang paling bikin mikir.
              </p>
              {(() => {
                const all = sections.flatMap((sec) =>
                  sec.qs.map((q) => {
                    const p = byId.get(q.id);
                    return {
                      sec: sec.name,
                      label: q.label,
                      time: p?.t ?? 0,
                      answered: p?.a !== undefined,
                      correct: p?.a === q.key,
                    };
                  })
                );
                const slowest = all
                  .filter((t) => t.answered)
                  .sort((a, b) => b.time - a.time)
                  .slice(0, 5);
                return (
                  <>
                    {slowest.length > 0 ? (
                      <div className="mt-4 space-y-1.5">
                        <div className="text-sm font-black">Paling lama:</div>
                        {slowest.map((t) => (
                          <div
                            key={`${t.sec}-${t.label}`}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span>
                              {t.label} • {t.sec}{" "}
                              {t.correct ? "✅" : "❌"}
                            </span>
                            <span className="font-black tabular-nums">
                              {fmtElapsed(t.time)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-4 space-y-3">
                      {sections.map((sec) => {
                        const timed = sec.qs.filter(
                          (q) => byId.get(q.id)?.a !== undefined
                        );
                        const avg = timed.length
                          ? Math.round(
                              timed.reduce(
                                (a, q) => a + (byId.get(q.id)?.t ?? 0),
                                0
                              ) / timed.length
                            )
                          : 0;
                        const secTotal = detail.sectionSecs[sec.key] ?? 0;
                        return (
                          <div key={sec.key}>
                            <div className="mb-1.5 flex items-baseline justify-between text-sm">
                              <span className="jp font-black">{sec.name}</span>
                              <span className="text-slate-500">
                                total {fmtElapsed(secTotal)} • rata-rata{" "}
                                {fmtElapsed(avg)}/soal
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {sec.qs.map((q) => {
                                const p = byId.get(q.id);
                                const cls =
                                  p?.a === undefined
                                    ? "bg-slate-100 text-slate-400 dark:bg-slate-800"
                                    : p.a === q.key
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                      : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
                                return (
                                  <span
                                    key={q.id}
                                    className={`rounded-lg px-2 py-1 text-xs font-bold tabular-nums ${cls}`}
                                  >
                                    {q.label} ·{" "}
                                    {p?.t !== undefined
                                      ? fmtElapsed(p.t)
                                      : "—"}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
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
                Salah Saja ({wrongCount})
              </button>
            </div>

            {/* Review per section */}
            {sections.map((sec) => {
              const items =
                filter === "wrong"
                  ? sec.qs.filter((q) => byId.get(q.id)?.a !== q.key)
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
                        userAns={byId.get(q.id)?.a}
                        timeSec={byId.get(q.id)?.t}
                        showPassage={
                          !!q.passage && q.passage !== items[i - 1]?.passage
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
