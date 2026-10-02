"use client";

import { useCallback, useEffect, useState } from "react";

import type { Locale } from "@/types";
import {
  clearHist,
  getHist,
  getLastSyncAt,
  getToken,
  syncNow,
  type JlptAttempt,
} from "@/lib/jlpt/progress";
import { currentUser } from "@/lib/jlpt/auth";

const LOGGED_OUT_TEXT =
  "💾 Progress tersimpan lokal di browser ini. Masuk untuk sinkronisasi cloud antar perangkat.";

interface SectionAggregate {
  name: string;
  correct: number;
  total: number;
  pct: number;
}

function aggregateSections(hist: JlptAttempt[]): SectionAggregate[] {
  const map = new Map<string, { correct: number; total: number }>();
  for (const attempt of hist) {
    for (const section of attempt.sections ?? []) {
      const entry = map.get(section.name) ?? { correct: 0, total: 0 };
      entry.correct += section.correct;
      entry.total += section.total;
      map.set(section.name, entry);
    }
  }
  return [...map.entries()].map(([name, v]) => ({
    name,
    correct: v.correct,
    total: v.total,
    pct: v.total ? Math.round((v.correct / v.total) * 100) : 0,
  }));
}

export function JlptHistory({ locale }: { locale: Locale }) {
  // `locale` is part of the shared page props; the JLPT module UI is
  // Indonesian for both locales, so it is intentionally unused here.
  void locale;

  const [hist, setHist] = useState<JlptAttempt[]>([]);
  const [statusText, setStatusText] = useState<string>(LOGGED_OUT_TEXT);

  const refreshHist = useCallback(() => {
    setHist(getHist());
  }, []);

  useEffect(() => {
    refreshHist();
    if (!getToken()) {
      setStatusText(LOGGED_OUT_TEXT);
      return;
    }
    setStatusText("Menyinkronkan…");
    let cancelled = false;
    void syncNow().then((result) => {
      if (cancelled) return;
      if (result === "ok") {
        const lastSync = getLastSyncAt();
        setStatusText(
          `☁️ Tersinkron sebagai ${currentUser() ?? ""}${
            lastSync ? ` • terakhir ${lastSync}` : ""
          }`
        );
      } else if (result === "error") {
        setStatusText("⚠️ Gagal sinkron, mode lokal");
      } else {
        // "unauthorized" (session cleared by syncNow) or "no-token".
        setStatusText(LOGGED_OUT_TEXT);
      }
      refreshHist();
    });
    return () => {
      cancelled = true;
    };
  }, [refreshHist]);

  const handleClear = () => {
    if (typeof window !== "undefined" && !window.confirm("Hapus semua riwayat?")) {
      return;
    }
    clearHist();
    refreshHist();
  };

  const rows = [...hist].reverse(); // stored oldest → newest; show newest first
  const aggregates = aggregateSections(hist);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black">Riwayat &amp; Progres JLPT</h1>
        <p className="mt-2 text-sm text-slate-500">{statusText}</p>
      </header>

      {hist.length === 0 ? (
        <div className="soft-card p-6 text-center text-slate-500">
          Belum ada riwayat pengerjaan.
        </div>
      ) : (
        <>
          {aggregates.length > 0 ? (
            <section className="grid gap-4 md:grid-cols-3">
              {aggregates.map((section) => (
                <div key={section.name} className="card p-5">
                  <div className="jp text-sm font-semibold text-slate-500">
                    {section.name}
                  </div>
                  <div className="mt-2 text-3xl font-black">
                    {section.pct}%
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {section.correct}/{section.total} benar
                  </div>
                </div>
              ))}
            </section>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Total sesi: <span className="font-bold">{hist.length}</span>
            </p>
            <button
              type="button"
              onClick={handleClear}
              className="btn-ghost text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Hapus Riwayat
            </button>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                  <th className="px-4 py-3 font-semibold">Tanggal</th>
                  <th className="px-4 py-3 font-semibold">Sesi</th>
                  <th className="px-4 py-3 font-semibold">Skor</th>
                  <th className="px-4 py-3 font-semibold">%</th>
                  <th className="px-4 py-3 font-semibold">Skor Skala</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((attempt) => (
                  <tr
                    key={attempt.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {attempt.date}
                    </td>
                    <td className="px-4 py-3 font-semibold">{attempt.title}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {attempt.correct}/{attempt.total}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-bold text-emerald-700 dark:text-emerald-300">
                      {attempt.pct}%
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {(attempt.sections ?? []).length
                        ? attempt.sections
                            .map((s) => `${s.name} ${s.scaled}`)
                            .join(" • ")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
