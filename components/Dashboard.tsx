"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  Flame,
  Headphones,
  Languages,
  Sparkles,
  Trophy,
  WholeWord,
} from "lucide-react";

import type { Locale } from "@/types";
import { allTryouts } from "@/data/sourceInventory";
import { drillingQuestionBank } from "@/data/drillingBank";
import { getStreak } from "@/lib/progress";
import { bookCount, chapterCount } from "@/data/bookLibrary";
import { ProgressRing } from "@/components/ProgressRing";

export function Dashboard({
  locale,
}: {
  locale: Locale;
}) {
  const id = locale === "id";

  const [streak, setStreak] = useState({
    current: 0,
    best: 0,
    activeDays: [] as string[],
  });

  useEffect(() => {
    try {
      setStreak(getStreak());
    } catch {
      setStreak({
        current: 0,
        best: 0,
        activeDays: [],
      });
    }
  }, []);

  const stats = [
    [
      id ? "Try Out JFT" : "JFT模試",
      allTryouts.length,
      Sparkles,
    ],
    [
      id ? "Drilling Soal" : "問題ドリル",
      drillingQuestionBank.length,
      BookOpenCheck,
    ],
    [
      id ? "Buku / Koleksi" : "教材",
      bookCount,
      BookOpenCheck,
    ],
    [
      id ? "Bab / Unit" : "章 / ユニット",
      chapterCount,
      Languages,
    ],
  ] as const;

  const cards = [
    [
      "tryout",
      Sparkles,
      id ? "21 Try Out JFT" : "21 JFT模試",
      id
        ? "Verified + Reconstructed · 60 menit · 4 bagian"
        : "Verified + Reconstructed・60分・4セクション",
    ],
    [
      "drilling",
      BookOpenCheck,
      id ? "Drilling Soal" : "問題ドリル",
      id
        ? "1.000 soal · pilih kategori · 10/20/50 soal"
        : "1,000問・カテゴリ選択・10/20/50問",
    ],
    [
      "library",
      BookOpenCheck,
      id ? "Belajar dari Buku" : "教材ライブラリー",
      id
        ? `${bookCount} koleksi · ${chapterCount} bab/unit · tes per bab`
        : `${bookCount}教材・${chapterCount}章・章テスト`,
    ],
    [
      "vocabulary",
      WholeWord,
      id ? "Vocabulary Master" : "語彙マスター",
      id
        ? "Flashcard, kuis, dan mode hafalan"
        : "フラッシュカード・クイズ",
    ],
    [
      "listening",
      Headphones,
      id ? "Listening Training" : "聴解トレーニング",
      id
        ? "Audio Jepang dan transkrip setelah menjawab"
        : "日本語音声・回答後のスクリプト",
    ],
  ] as const;

  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="card overflow-hidden p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_.65fr] lg:items-center">
          <div>
            <span className="badge border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
              JFT-Basic • Personal Learning OS
            </span>

            <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight md:text-5xl">
              {id
                ? "Persiapan JFT yang terstruktur, dengan Try Out, drilling, dan streak belajar."
                : "模試・ドリル・学習ストリークで構造化されたJFT対策。"}
            </h1>

            <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
              {id
                ? "Try Out menyimpan status sumber Verified/Reconstructed. Drilling mengikuti empat domain JFT. Library memetakan buku Drive menjadi belajar dan tes per bab tanpa menyalin isi buku penuh."
                : "模試はVerified/Reconstructedを保持。ドリルはJFT型4分野、Libraryは教材を章ごとの学習・テストに整理します。"}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/tryout`}
                className="btn-primary"
              >
                {id
                  ? "Mulai Try Out"
                  : "模試を始める"}

                <ArrowRight size={18} />
              </Link>

              <Link
                href={`/${locale}/drilling`}
                className="btn-ghost border border-slate-200 dark:border-slate-700"
              >
                {id
                  ? "Mulai Drilling"
                  : "ドリル開始"}
              </Link>
            </div>
          </div>

          <div className="mx-auto">
            <ProgressRing
              value={Math.min(
                100,
                55 + streak.current * 3
              )}
              label={
                id
                  ? "readiness"
                  : "準備度"
              }
            />

            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-black text-amber-600">
              <Flame size={19} />

              {streak.current}{" "}
              {id
                ? "hari streak"
                : "日ストリーク"}
            </div>

            <div className="mt-1 text-center text-xs text-slate-500">
              {id
                ? `Rekor: ${streak.best} hari`
                : `最高: ${streak.best}日`}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(
          ([label, value, Icon], index) => (
            <motion.div
              key={label}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.06,
              }}
              className="soft-card p-4 md:p-5"
            >
              <Icon className="mb-4 text-emerald-600" />

              <div className="text-2xl font-black">
                {value}
              </div>

              <div className="text-xs text-slate-500 md:text-sm">
                {label}
              </div>
            </motion.div>
          )
        )}
      </section>

      {/* Learning Space */}
      <section>
        <h2 className="mb-4 text-xl font-black">
          {id
            ? "Ruang belajar"
            : "学習スペース"}
        </h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {cards.map(
            ([
              slug,
              Icon,
              title,
              subtitle,
            ]) => (
              <Link
                href={`/${locale}/${slug}`}
                key={slug}
                className="card group p-5 transition hover:-translate-y-1"
              >
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Icon />
                </div>

                <h3 className="font-black">
                  {title}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {subtitle}
                </p>

                <ArrowRight
                  className="mt-5 transition group-hover:translate-x-1"
                  size={18}
                />
              </Link>
            )
          )}
        </div>
      </section>

      {/* Bottom Cards */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <Trophy className="text-amber-500" />

            <h3 className="font-black">
              {id
                ? "Target konsistensi"
                : "継続目標"}
            </h3>
          </div>

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {id
              ? "Satu jawaban pada Try Out, Drilling, atau Listening sudah dihitung sebagai aktivitas belajar hari itu. Pertahankan streak tanpa memaksa sesi yang terlalu panjang."
              : "模試・ドリル・聴解で1問回答するとその日の学習として記録。無理な長時間学習ではなく継続を優先。"}
          </p>
        </div>

        <div className="card p-5">
          <h3 className="font-black">
            {id
              ? "Rekomendasi hari ini"
              : "今日のおすすめ"}
          </h3>

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {id
              ? "Mulai dengan 20 soal Drilling pada kategori terlemah, lalu lanjutkan satu Try Out jika masih fokus."
              : "最弱カテゴリを20問ドリルし、集中力が残っていれば模試を1セット。"}
          </p>
        </div>
      </section>
    </div>
  );
}