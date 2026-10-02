"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/types";
import { JLPT_EXAMS } from "@/data/jlpt/exams";
import { attemptsForLabel, type JlptAttempt } from "@/lib/jlpt/progress";

export function JlptLibrary({ locale }: { locale: Locale }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "original" | "generated">("");
  const [attempts, setAttempts] = useState<Record<string, JlptAttempt[]>>({});

  useEffect(() => {
    const map: Record<string, JlptAttempt[]> = {};
    for (const e of JLPT_EXAMS) {
      map[e.id] = attemptsForLabel(e.label);
    }
    setAttempts(map);
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = JLPT_EXAMS.filter((e) => {
    if (typeFilter && e.type !== typeFilter) return false;
    if (!q) return true;
    return e.label.toLowerCase().includes(q) || e.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Perpustakaan Tryout JLPT</h1>
        <p className="mt-2 max-w-3xl text-slate-500">
          31 tryout: 30 soal asli JLPT N3 (2010.07–2025.12) + 1 tryout generate. Tiga sesi
          berurutan persis ujian asli: <span className="jp">文字・語彙</span> 30 menit,{" "}
          <span className="jp">文法・読解</span> 70 menit, <span className="jp">聴解</span> 40
          menit.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari tryout… (mis. 2024 atau 2024年12月)"
          className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-900 sm:flex-1"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "" | "original" | "generated")}
          className="rounded-xl border px-3 py-2 bg-white dark:bg-slate-900"
        >
          <option value="">Semua</option>
          <option value="original">Asli</option>
          <option value="generated">Generated</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="soft-card p-5 text-sm text-slate-500">Tidak ada tryout yang cocok.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => {
            const att = attempts[e.id] ?? [];
            const best = att.length ? Math.max(...att.map((a) => a.pct)) : 0;
            const original = e.type === "original";
            return (
              <div className="card p-5" key={e.id}>
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`badge ${
                      original
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300"
                    }`}
                  >
                    {original ? "✓ Soal Asli" : "✦ Generate"}
                  </span>
                  <span className="text-xs text-slate-400">{e.counts.total} soal</span>
                </div>
                <h2 className="jp mt-4 text-xl font-black">{e.label}</h2>
                <div className="mt-3 space-y-1 text-sm text-slate-500">
                  <p className="jp">
                    {e.counts.vocab} 語彙 • {e.counts.grammarReading} 文法・読解 •{" "}
                    {e.counts.listening} 聴解
                  </p>
                  <p>⏱ 30+70+40 menit</p>
                </div>
                {att.length > 0 && (
                  <p className="mt-3 text-sm font-semibold text-amber-600">
                    🏆 Terbaik {best}% • {att.length}× dikerjakan
                  </p>
                )}
                <Link
                  href={`/${locale}/jlpt/tryout/${e.id}`}
                  className="btn-primary mt-4 w-full"
                >
                  {att.length ? "↻ Kerjakan Ulang" : "Mulai Tryout →"}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
