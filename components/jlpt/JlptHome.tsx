"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Locale } from "@/types";
import { JLPT_EXAMS } from "@/data/jlpt/exams";
import {
  getHist,
  getToken,
  syncNow,
  type JlptAttempt,
} from "@/lib/jlpt/progress";
import {
  currentUser,
  loginWithCredential,
  logout,
  renderGoogleButton,
} from "@/lib/jlpt/auth";

const EXAM_TARGET_MS = new Date("2026-12-06T09:00:00+07:00").getTime();

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days} hari ${pad2(hours)} jam ${pad2(minutes)} mnt ${pad2(seconds)} dtk`;
}

export function JlptHome({ locale }: { locale: Locale }) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [hist, setHist] = useState<JlptAttempt[]>([]);
  const [user, setUser] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const googleRef = useRef<HTMLDivElement | null>(null);

  const refreshHist = useCallback(() => {
    setHist(getHist());
  }, []);

  const refreshUser = useCallback(() => {
    setUser(currentUser());
  }, []);

  // Countdown tick (1s).
  useEffect(() => {
    const update = () => setRemainingMs(EXAM_TARGET_MS - Date.now());
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial load: local history + user, then cloud sync when a token exists.
  useEffect(() => {
    refreshHist();
    refreshUser();
    if (getToken()) {
      void syncNow().then(() => {
        refreshHist();
        refreshUser();
      });
    }
  }, [refreshHist, refreshUser]);

  const handleCredential = useCallback(
    (credential: string) => {
      setBusy(true);
      setErr("");
      loginWithCredential(credential)
        .then((email) => {
          setUser(email);
          refreshHist();
        })
        .catch((e: unknown) => {
          setErr(e instanceof Error ? e.message : "Gagal masuk. Coba lagi.");
        })
        .finally(() => setBusy(false));
    },
    [refreshHist]
  );

  // Mount the Google Sign-In button while logged out.
  useEffect(() => {
    if (user) return;
    const el = googleRef.current;
    if (!el) return;
    let cancelled = false;
    void renderGoogleButton(
      el,
      (credential) => {
        if (!cancelled) handleCredential(credential);
      },
      (msg) => {
        if (!cancelled) setErr(msg);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [user, handleCredential]);

  const handleLogout = () => {
    logout();
    setUser(null);
    setErr("");
    refreshHist();
  };

  const sessions = hist.length;
  const avgPct = sessions
    ? Math.round(hist.reduce((sum, a) => sum + a.pct, 0) / sessions)
    : 0;
  const last = sessions ? hist[hist.length - 1] : null;
  const pastExam = remainingMs !== null && remainingMs <= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-black">JLPT N3</h1>
        <p className="mt-2 text-slate-500">
          Tryout asli 2010–2025, drill per kategori, dan pantau skor sampai
          hari-H. Semua soal lengkap dengan kunci &amp; pembahasan.
        </p>
      </header>

      {/* Countdown */}
      <section className="card p-6 text-center md:p-8">
        <div className="text-3xl font-black tabular-nums text-emerald-700 dark:text-emerald-300 md:text-4xl">
          {remainingMs === null
            ? "…"
            : pastExam
              ? "Hari ujian!"
              : formatCountdown(remainingMs)}
        </div>
        <p className="mt-3 text-sm text-slate-500">
          ⏳ Hitung mundur ujian JLPT N3 (perkiraan Minggu, 6 Des 2026)
        </p>
      </section>

      {/* Progres + akun */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="soft-card p-5">
          <h2 className="font-black">Progres</h2>
          {sessions === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Belum ada riwayat. Mulai tryout pertamamu!
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>
                Sesi dikerjakan:{" "}
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {sessions}
                </span>
              </li>
              <li>
                Rata-rata skor:{" "}
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {avgPct}%
                </span>
              </li>
              {last ? (
                <li>
                  Terakhir: {last.title} — {last.correct}/{last.total} (
                  {last.pct}%)
                </li>
              ) : null}
            </ul>
          )}
        </div>

        <div className="soft-card p-5">
          <h2 className="font-black">Akun &amp; Sinkronisasi</h2>
          {user ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold">👤 {user}</span>
              <button type="button" className="btn-ghost" onClick={handleLogout}>
                Keluar
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <div ref={googleRef} />
              {busy ? (
                <p className="text-sm text-slate-500">Memproses masuk…</p>
              ) : null}
              {err ? <p className="text-sm text-red-600 dark:text-red-400">{err}</p> : null}
              <p className="text-sm text-slate-500">
                Masuk dengan Google agar progres tersinkron antar perangkat.
                Tanpa login, progres tetap tersimpan lokal di browser ini.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stat / nav cards */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <div className="text-3xl font-black">{JLPT_EXAMS.length}</div>
          <p className="mt-2 text-sm text-slate-500">
            Tryout tersedia (30 asli + 1 generate)
          </p>
          <Link href={`/${locale}/jlpt/tryout`} className="btn-primary mt-4">
            Buka Perpustakaan →
          </Link>
        </div>

        <div className="card p-5">
          <div className="text-3xl font-black">101–102</div>
          <p className="mt-2 text-sm text-slate-500">
            Soal per tryout penuh:{" "}
            <span className="jp">文字・語彙</span> 35 •{" "}
            <span className="jp">文法・読解</span> 38–39 •{" "}
            <span className="jp">聴解</span> 27–28
          </p>
          <Link href={`/${locale}/jlpt/tryout/2024-12`} className="btn-primary mt-4">
            Tryout 2024.12 →
          </Link>
        </div>

        <div className="card p-5">
          <div className="text-3xl font-black">5.000</div>
          <p className="mt-2 text-sm text-slate-500">
            Soal drill per kategori (vocab/grammar/reading/listening + audio)
          </p>
          <Link href={`/${locale}/jlpt/drill`} className="btn-primary mt-4">
            Latihan Sekarang →
          </Link>
        </div>
      </section>

      {/* Riwayat */}
      <Link
        href={`/${locale}/jlpt/history`}
        className="card group flex items-center justify-between p-5 transition hover:-translate-y-0.5"
      >
        <div>
          <h2 className="font-black">Riwayat &amp; Progres</h2>
          <p className="mt-1 text-sm text-slate-500">
            Lihat semua sesi, skor per bagian, dan status sinkronisasi cloud.
          </p>
        </div>
        <span className="text-xl text-emerald-600 transition group-hover:translate-x-1">
          →
        </span>
      </Link>
    </div>
  );
}
