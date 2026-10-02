"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/types";
import { loadDrillBank, type DrillBank, type DrillCategory } from "@/lib/jlpt/api";
import { getSeen } from "@/lib/jlpt/progress";

type DrillChoice = DrillCategory | "mix";

const CATEGORIES: { key: DrillChoice; label: string; jp: string }[] = [
  { key: "vocab", label: "Kosakata", jp: "文字・語彙 (Moji/Goi)" },
  { key: "grammar", label: "Tata Bahasa", jp: "文法 (Bunpō)" },
  { key: "reading", label: "Membaca", jp: "読解 (Dokkai)" },
  { key: "listening", label: "Mendengar", jp: "聴解 (Chōkai)" },
  { key: "mix", label: "Campuran", jp: "Campuran Semua" },
];

export function JlptDrillHub({ locale }: { locale: Locale }) {
  const [cat, setCat] = useState<DrillChoice>("vocab");
  const [count, setCount] = useState(20);
  const [timerOn, setTimerOn] = useState(true);
  const [minutes, setMinutes] = useState(20);
  const [bank, setBank] = useState<DrillBank | null>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSeen(getSeen());
    let cancelled = false;
    loadDrillBank()
      .then((b) => {
        if (cancelled) return;
        setBank(b);
        setSeen(getSeen());
      })
      .catch(() => {
        /* bank gagal dimuat — total tetap "…" */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalFor = (key: DrillChoice): number | null => {
    if (!bank) return null;
    if (key === "mix") {
      return (
        bank.vocab.length + bank.grammar.length + bank.reading.length + bank.listening.length
      );
    }
    return bank[key].length;
  };

  const total = totalFor(cat);
  const fresh = (() => {
    if (!bank || total === null) return null;
    const items =
      cat === "mix"
        ? [...bank.vocab, ...bank.grammar, ...bank.reading, ...bank.listening]
        : bank[cat];
    return items.filter((item) => !seen.has(item.id)).length;
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Drill / Latihan Soal JLPT</h1>
        <p className="mt-2 max-w-3xl text-slate-500">
          Bank latihan soal tersendiri (bukan dari soal tryout) — 5.000 soal per kategori, diacak
          tiap sesi. Soal yang sudah pernah dikerjakan tidak diprioritaskan lagi.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map((c) => {
          const t = totalFor(c.key);
          const selected = cat === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setCat(c.key)}
              className={`card p-5 text-left ${
                selected ? "ring-2 ring-emerald-500 border-emerald-500" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-black">{c.label}</h2>
                <span className="text-xs text-slate-400">
                  {t === null ? "…" : `${t} soal`}
                </span>
              </div>
              <p className="jp mt-2 text-sm text-slate-500">{c.jp}</p>
            </button>
          );
        })}
      </div>

      <div className="soft-card p-4 text-sm">
        {bank && total !== null && fresh !== null ? (
          <p>
            Soal baru belum dikerjakan: <span className="font-black">{fresh}</span> dari{" "}
            <span className="font-black">{total}</span>
          </p>
        ) : (
          <p className="text-slate-500">Memuat bank soal…</p>
        )}
      </div>

      <div className="soft-card flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-black">Jumlah soal</span>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="rounded-xl border px-3 py-2 bg-white dark:bg-slate-900"
          >
            {[10, 20, 30, 50].map((n) => (
              <option key={n} value={n}>
                {n} soal
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={timerOn}
            onChange={(e) => setTimerOn(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          Timer aktif
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-black">Durasi</span>
          <select
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            disabled={!timerOn}
            className="rounded-xl border px-3 py-2 bg-white dark:bg-slate-900 disabled:opacity-50"
          >
            {[10, 20, 30, 45].map((n) => (
              <option key={n} value={n}>
                {n} menit
              </option>
            ))}
          </select>
        </label>
      </div>

      <Link
        href={`/${locale}/jlpt/drill/${cat}?count=${count}&timer=${timerOn ? 1 : 0}&min=${minutes}`}
        className="btn-primary w-full sm:w-auto"
      >
        Mulai Drill →
      </Link>
    </div>
  );
}
