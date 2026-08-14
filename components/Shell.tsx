"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  BookOpenCheck,
  ChartNoAxesColumnIncreasing,
  Flame,
  Headphones,
  Home,
  Languages,
  Menu,
  Moon,
  Settings,
  Sparkles,
  Sun,
  WholeWord,
  X,
} from "lucide-react";

import type { Locale } from "@/types";
import { getStreak } from "@/lib/progress";

const labels = {
  id: {
    dashboard: "Dashboard",
    tryout: "Try Out JFT",
    practice: "Drilling Soal",
    library: "Belajar dari Buku",
    vocab: "Vocabulary Master",
    kanji: "Kanji Master",
    listening: "Listening Training",
    stats: "Statistik Belajar",
    settings: "Settings",
  },
  ja: {
    dashboard: "ダッシュボード",
    tryout: "JFT 模擬試験",
    practice: "問題ドリル",
    library: "教材ライブラリー",
    vocab: "語彙マスター",
    kanji: "漢字マスター",
    listening: "聴解トレーニング",
    stats: "学習統計",
    settings: "設定",
  },
} as const;

const items = [
  ["", Home, "dashboard"],
  ["tryout", Sparkles, "tryout"],
  ["drilling", BookOpenCheck, "practice"],
  ["library", BookOpen, "library"],
  ["vocabulary", WholeWord, "vocab"],
  ["kanji", Languages, "kanji"],
  ["listening", Headphones, "listening"],
  ["statistik", ChartNoAxesColumnIncreasing, "stats"],
  ["settings", Settings, "settings"],
] as const;

export function Shell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();

  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem("kezett-theme");
    const isDark = savedTheme === "dark";

    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);

    try {
      setStreak(getStreak().current);
    } catch {
      setStreak(0);
    }
  }, [path]);

  const toggleTheme = () => {
    const nextDark = !dark;

    setDark(nextDark);
    localStorage.setItem(
      "kezett-theme",
      nextDark ? "dark" : "light"
    );

    document.documentElement.classList.toggle(
      "dark",
      nextDark
    );
  };

  const switchLocale = () => {
    const targetLocale = locale === "id" ? "ja" : "id";
    const parts = path.split("/");

    if (parts.length > 1) {
      parts[1] = targetLocale;
    }

    const newPath = parts.join("/") || `/${targetLocale}`;

    router.push(newPath);
  };

  const navigation = (
    <>
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 font-black text-white">
          K
        </div>

        <div>
          <div className="font-black tracking-tight">
            KEZETT
          </div>

          <div className="text-xs text-slate-500">
            JFT Study OS
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {items.map(([slug, Icon, key]) => {
          const href = `/${locale}${
            slug ? `/${slug}` : ""
          }`;

          const active = slug
            ? path.startsWith(href)
            : path === href;

          return (
            <Link
              key={key}
              href={href}
              onClick={() => setOpen(false)}
              className={`
                flex items-center gap-3
                rounded-xl px-3 py-3
                text-sm font-semibold
                transition
                ${
                  active
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }
              `}
            >
              <Icon size={19} />

              <span>
                {labels[locale][key]}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 lg:block">
        {navigation}
      </aside>

      {/* Mobile Sidebar */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-950/50 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 26,
            }}
            onClick={(event) => event.stopPropagation()}
            className="h-full w-[86%] max-w-80 bg-white p-5 shadow-2xl dark:bg-slate-950"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mb-4 ml-auto block rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X size={21} />
            </button>

            {navigation}
          </motion.aside>
        </motion.div>
      )}

      {/* Main */}
      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-slate-50/85 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-[#07111f]/85 md:px-7">
          {/* Mobile Menu */}
          <button
            type="button"
            className="btn-ghost lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Motto */}
          <div className="hidden text-sm text-slate-500 sm:block">
            {locale === "id"
              ? "Belajar konsisten. Ukur progres. Fokus pada kelemahan."
              : "継続して学び、進歩を測り、弱点に集中する。"}
          </div>

          {/* Header Actions */}
          <div className="ml-auto flex items-center gap-1">
            {/* Streak */}
            <div className="mr-1 hidden items-center gap-1 rounded-xl bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 sm:flex">
              <Flame size={16} />
              <span>{streak}</span>
            </div>

            {/* Language */}
            <button
              type="button"
              className="btn-ghost"
              onClick={switchLocale}
              aria-label="Switch language"
            >
              <Languages size={18} />

              <span className="text-xs font-bold">
                {locale === "id"
                  ? "日本語"
                  : "ID"}
              </span>
            </button>

            {/* Theme */}
            <button
              type="button"
              className="btn-ghost"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {dark ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="mx-auto max-w-[1500px] p-4 md:p-7">
          {children}
        </div>
      </main>
    </div>
  );
}