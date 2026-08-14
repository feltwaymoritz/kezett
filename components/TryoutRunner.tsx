"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Flag,
  LockKeyhole,
  Play,
  Send,
} from "lucide-react";

import type {
  Category,
  Locale,
} from "@/types";

import {
  questionsForTryout,
} from "@/data/drillingBank";

import {
  allTryouts,
} from "@/data/sourceInventory";

import {
  markStudyActivity,
  recordAttempt,
} from "@/lib/progress";


const sectionOrder = [
  "vocabulary",
  "grammar",
  "listening",
  "reading",
] as const;


export function TryoutRunner({
  locale,
  id,
}: {
  locale: Locale;
  id: string;
}) {
  const router = useRouter();

  const def = allTryouts.find(
    (x) => x.id === id
  );

  const seed = Math.max(
    1,
    allTryouts.findIndex(
      (x) => x.id === id
    ) + 1
  );

  const qs = useMemo(
    () =>
      questionsForTryout(
        seed,
        50,
        def?.packageId
      ),
    [seed, def?.packageId]
  );


  const [idx, setIdx] =
    useState(0);

  const [
    answers,
    setAnswers,
  ] = useState<
    Record<string, number>
  >({});

  const [
    flags,
    setFlags,
  ] = useState<
    Record<string, boolean>
  >({});

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    secondsLeft,
    setSecondsLeft,
  ] = useState(3600);

  const [
    playCount,
    setPlayCount,
  ] = useState<
    Record<string, number>
  >({});

  const [
    questionMode,
    setQuestionMode,
  ] = useState<
    "source" | "ja"
  >("ja");

  const [
    audioError,
    setAudioError,
  ] = useState<
    string | null
  >(null);


  const idn =
    locale === "id";

  const recorded =
    useRef(false);

  const japaneseVoices =
    useRef<
      SpeechSynthesisVoice[]
    >([]);


  /*
   * ========================================
   * LOAD JAPANESE VOICES
   * ========================================
   */
  useEffect(() => {
    if (
      typeof window ===
        "undefined" ||
      !(
        "speechSynthesis" in
        window
      )
    ) {
      return;
    }

    const synth =
      window.speechSynthesis;


    const loadVoices = () => {
      const allVoices =
        synth.getVoices();

      const jaVoices =
        allVoices.filter(
          (voice) =>
            voice.lang
              .toLowerCase()
              .startsWith("ja")
        );

      japaneseVoices.current =
        jaVoices;

      console.log(
        "Kezett Japanese voices:",
        jaVoices.map(
          (voice) => ({
            name: voice.name,
            lang: voice.lang,
            local:
              voice.localService,
          })
        )
      );
    };


    /*
     * Coba langsung saat halaman
     * pertama kali dibuka.
     */
    loadVoices();


    /*
     * Beberapa browser HP
     * memberikan daftar voice
     * beberapa saat kemudian.
     */
    synth.addEventListener(
      "voiceschanged",
      loadVoices
    );


    return () => {
      synth.removeEventListener(
        "voiceschanged",
        loadVoices
      );
    };
  }, []);


  /*
   * ========================================
   * QUESTION LANGUAGE MODE
   * ========================================
   */
  useEffect(() => {
    const saved =
      localStorage.getItem(
        "kezett-question-mode"
      );

    if (
      saved === "source" ||
      saved === "ja"
    ) {
      setQuestionMode(
        saved
      );
    }
  }, []);


  /*
   * ========================================
   * RESET TRYOUT AUDIO STATE
   * ========================================
   *
   * Saat membuka Try Out lain,
   * semua hitungan audio kembali 0.
   */
  useEffect(() => {
    setPlayCount({});
    setAudioError(null);

    if (
      typeof window !==
        "undefined" &&
      "speechSynthesis" in
        window
    ) {
      window
        .speechSynthesis
        .cancel();
    }
  }, [id]);


  /*
   * ========================================
   * BFCache FIX
   * ========================================
   *
   * Beberapa browser mobile dapat
   * mengembalikan halaman beserta
   * state React lama ketika halaman
   * dipulihkan dari memory/cache.
   *
   * Kalau itu terjadi, counter audio
   * kita reset agar tidak tiba-tiba
   * muncul 2/2.
   */
  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }


    const handlePageShow = (
      event: PageTransitionEvent
    ) => {
      if (!event.persisted) {
        return;
      }


      setPlayCount({});
      setAudioError(null);


      if (
        "speechSynthesis" in
        window
      ) {
        window
          .speechSynthesis
          .cancel();
      }
    };


    window.addEventListener(
      "pageshow",
      handlePageShow
    );


    return () => {
      window.removeEventListener(
        "pageshow",
        handlePageShow
      );
    };
  }, []);


  /*
   * ========================================
   * CURRENT QUESTION
   * ========================================
   */
  const q =
    qs[idx];

  const currentSection =
    q.category;

  const sectionStart =
    qs.findIndex(
      (x) =>
        x.category ===
        currentSection
    );


  /*
   * ========================================
   * UNIQUE AUDIO KEY
   * ========================================
   *
   * INI FIX UTAMA BUG 2/2.
   *
   * Sebelumnya:
   *
   * playCount[q.id]
   *
   * Sekarang setiap audio dikunci
   * berdasarkan:
   *
   * tryout + nomor soal + id soal
   *
   * Jadi walaupun ada q.id yang
   * sama, counter tidak bercampur.
   */
  const playKey =
    `${id}-${idx}-${q.id}`;


  /*
   * ========================================
   * RESET AUDIO WHEN QUESTION CHANGES
   * ========================================
   */
  useEffect(() => {
    setAudioError(null);

    if (
      typeof window !==
        "undefined" &&
      "speechSynthesis" in
        window
    ) {
      window
        .speechSynthesis
        .cancel();
    }
  }, [idx]);


  /*
   * ========================================
   * JAPANESE SPEECH
   * ========================================
   */
  const speak = (
    text: string,
    voiceType?:
      | "male"
      | "female",
    onStarted?: () => void
  ) => {
    if (
      typeof window ===
        "undefined" ||
      !(
        "speechSynthesis" in
        window
      )
    ) {
      setAudioError(
        idn
          ? "Browser ini tidak mendukung audio Jepang."
          : "このブラウザは日本語音声に対応していません。"
      );

      return;
    }


    const synth =
      window.speechSynthesis;


    setAudioError(
      null
    );


    /*
     * Hentikan audio sebelumnya.
     */
    synth.cancel();


    /*
     * Membantu beberapa Android
     * jika speech engine sedang
     * berada dalam kondisi pause.
     */
    synth.resume();


    const utterance =
      new SpeechSynthesisUtterance(
        text
      );


    utterance.lang =
      "ja-JP";

    utterance.rate =
      0.92;

    utterance.pitch =
      1;

    utterance.volume =
      1;


    /*
     * Ambil Japanese voice yang
     * sudah dimuat sebelumnya.
     */
    let voices =
      japaneseVoices.current;


    /*
     * Kalau belum ada,
     * coba ambil lagi.
     */
    if (
      voices.length === 0
    ) {
      voices =
        synth
          .getVoices()
          .filter(
            (voice) =>
              voice.lang
                .toLowerCase()
                .startsWith(
                  "ja"
                )
          );


      japaneseVoices.current =
        voices;
    }


    /*
     * SpeechSynthesisVoice tidak
     * menyediakan gender resmi.
     *
     * Kalau tersedia lebih dari
     * satu Japanese voice,
     * voice kedua digunakan untuk
     * variasi "male".
     */
    if (
      voices.length > 0
    ) {
      if (
        voiceType ===
          "male" &&
        voices.length > 1
      ) {
        utterance.voice =
          voices[1];
      } else {
        utterance.voice =
          voices[0];
      }
    }


    /*
     * Counter audio BARU bertambah
     * setelah browser benar-benar
     * memulai audio.
     */
    utterance.onstart =
      () => {
        console.log(
          "Kezett audio started:",
          playKey
        );

        setAudioError(
          null
        );

        onStarted?.();
      };


    utterance.onend =
      () => {
        console.log(
          "Kezett audio finished:",
          playKey
        );
      };


    utterance.onerror =
      (event) => {
        console.error(
          "Kezett speech error:",
          event.error
        );


        /*
         * Cancel/interrupted normal
         * kalau user pindah soal.
         */
        if (
          event.error ===
            "interrupted" ||
          event.error ===
            "canceled"
        ) {
          return;
        }


        setAudioError(
          idn
            ? "Audio gagal diputar di perangkat ini. Tekan Play lagi atau coba gunakan browser terbaru."
            : "この端末では音声を再生できません。もう一度再生してください。"
        );
      };


    try {
      synth.speak(
        utterance
      );
    } catch (error) {
      console.error(
        "Kezett speech exception:",
        error
      );


      setAudioError(
        idn
          ? "Audio tidak dapat dijalankan di perangkat ini."
          : "この端末では音声を再生できません。"
      );
    }
  };


  /*
   * ========================================
   * SCORE
   * ========================================
   */
  const correct =
    qs.filter(
      (x) =>
        answers[x.id] ===
        x.correctIndex
    ).length;


  const pct =
    qs.length > 0
      ? Math.round(
          (
            correct /
            qs.length
          ) *
            100
        )
      : 0;


  /*
   * ========================================
   * TIMER
   * ========================================
   */
  useEffect(() => {
    if (submitted) {
      return;
    }


    const timer =
      window.setInterval(
        () =>
          setSecondsLeft(
            (seconds) => {
              if (
                seconds <= 1
              ) {
                window.clearInterval(
                  timer
                );

                setSubmitted(
                  true
                );

                return 0;
              }


              return (
                seconds - 1
              );
            }
          ),
        1000
      );


    return () =>
      window.clearInterval(
        timer
      );
  }, [submitted]);


  /*
   * ========================================
   * SAVE RESULT
   * ========================================
   */
  useEffect(() => {
    if (
      submitted &&
      def &&
      !recorded.current
    ) {
      recorded.current =
        true;


      const categoryScores =
        {} as Record<
          Category,
          number
        >;


      for (
        const cat of
        sectionOrder
      ) {
        const group =
          qs.filter(
            (x) =>
              x.category ===
              cat
          );


        const groupCorrect =
          group.filter(
            (x) =>
              answers[
                x.id
              ] ===
              x.correctIndex
          ).length;


        categoryScores[
          cat
        ] =
          group.length > 0
            ? Math.round(
                (
                  groupCorrect /
                  group.length
                ) *
                  100
              )
            : 0;
      }


      recordAttempt({
        type: "tryout",
        title: def.title,
        correct,
        total: qs.length,
        pct,
        categoryScores,
      });
    }
  }, [
    submitted,
    def,
    qs,
    answers,
    correct,
    pct,
  ]);


  /*
   * ========================================
   * INVALID TRYOUT
   * ========================================
   */
  if (!def) {
    return (
      <div className="card p-8">
        Try Out tidak ditemukan.
      </div>
    );
  }


  /*
   * ========================================
   * CLOCK
   * ========================================
   */
  const clock =
    `${String(
      Math.floor(
        secondsLeft / 60
      )
    ).padStart(
      2,
      "0"
    )}:${String(
      secondsLeft % 60
    ).padStart(
      2,
      "0"
    )}`;


  /*
   * ========================================
   * CATEGORY SCORE
   * ========================================
   */
  const categoryPct = (
    cat: string
  ) => {
    const group =
      qs.filter(
        (x) =>
          x.category ===
          cat
      );


    if (
      group.length === 0
    ) {
      return 0;
    }


    const categoryCorrect =
      group.filter(
        (x) =>
          answers[x.id] ===
          x.correctIndex
      ).length;


    return Math.round(
      (
        categoryCorrect /
        group.length
      ) *
        100
    );
  };


  /*
   * ========================================
   * RESULT PAGE
   * ========================================
   */
  if (submitted) {
    return (
      <div className="space-y-5">

        <div className="card p-7 text-center">

          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald-50 text-3xl font-black text-emerald-700 dark:bg-emerald-950/50">
            {pct}%
          </div>


          <h1 className="mt-4 text-3xl font-black">
            {idn
              ? "Simulasi selesai"
              : "模試完了"}
          </h1>


          <p className="mt-2 text-slate-500">
            {correct}/
            {qs.length}{" "}
            {idn
              ? "jawaban benar"
              : "正解"}
          </p>


          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-500">
            {idn
              ? "Nilai ini adalah practice accuracy, bukan konversi skor resmi JFT 10–250."
              : "これは練習正答率であり、JFT公式10–250点への換算ではありません。"}
          </p>

        </div>


        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

          {sectionOrder.map(
            (section) => (
              <div
                key={
                  section
                }
                className="soft-card p-4"
              >

                <div className="text-sm capitalize text-slate-500">
                  {section}
                </div>


                <div className="mt-1 text-2xl font-black">
                  {categoryPct(
                    section
                  )}
                  %
                </div>

              </div>
            )
          )}

        </div>


        <button
          className="btn-primary"
          onClick={() =>
            router.push(
              `/${locale}/statistik`
            )
          }
        >
          {idn
            ? "Lihat statistik"
            : "学習統計を見る"}
        </button>

      </div>
    );
  }


  /*
   * ========================================
   * NAVIGATION
   * ========================================
   */
  const canPrev =
    currentSection !==
      "listening" &&
    idx > sectionStart;


  const canNext =
    idx <
    qs.length - 1;


  const goNext = () => {
    if (!canNext) {
      return;
    }


    const next =
      qs[idx + 1];


    if (
      next.category !==
      currentSection
    ) {
      const ok =
        confirm(
          idn
            ? "Setelah pindah bagian, kamu tidak dapat kembali. Lanjutkan?"
            : "次のセクションへ進むと戻れません。続けますか？"
        );


      if (!ok) {
        return;
      }
    }


    /*
     * Stop suara sebelum
     * pindah pertanyaan.
     */
    if (
      typeof window !==
        "undefined" &&
      "speechSynthesis" in
        window
    ) {
      window
        .speechSynthesis
        .cancel();
    }


    setIdx(
      (current) =>
        current + 1
    );
  };


  /*
   * ========================================
   * QUESTION DISPLAY MODE
   * ========================================
   */
  const prompt =
    questionMode === "ja"
      ? q.promptJa ||
        q.prompt
      : q.prompt;


  const options =
    questionMode === "ja"
      ? q.optionsJa ||
        q.options
      : q.options;


  /*
   * ========================================
   * MAIN UI
   * ========================================
   */
  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="soft-card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">

        <div>

          <div className="flex flex-wrap items-center gap-2">

            <span
              className={`badge ${
                def.status ===
                "verified"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
              }`}
            >
              {def.status ===
              "verified"
                ? "✓ Verified"
                : "↻ Reconstructed"}
            </span>


            <span className="badge border-slate-200 dark:border-slate-700">
              {def.title}
            </span>

          </div>


          {/* SOURCE / JAPANESE */}
          <div className="mt-3 inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">

            <button
              onClick={() => {
                setQuestionMode(
                  "source"
                );

                localStorage.setItem(
                  "kezett-question-mode",
                  "source"
                );
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-black ${
                questionMode ===
                "source"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-500"
              }`}
            >
              Sumber
            </button>


            <button
              onClick={() => {
                setQuestionMode(
                  "ja"
                );

                localStorage.setItem(
                  "kezett-question-mode",
                  "ja"
                );
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-black ${
                questionMode ===
                "ja"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-500"
              }`}
            >
              日本語
            </button>

          </div>

        </div>


        {/* TIMER */}
        <div className="flex items-center gap-5 text-right">

          <div>

            <div className="text-xs text-slate-500">
              Time left
            </div>


            <div
              className={`font-mono text-lg font-black ${
                secondsLeft <
                300
                  ? "text-rose-600"
                  : ""
              }`}
            >
              {clock}
            </div>

          </div>


          <div>

            <div className="text-xs text-slate-500">
              Question
            </div>


            <div className="font-black">
              {idx + 1}/
              {qs.length}
            </div>

          </div>

        </div>

      </div>


      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">

        {/* QUESTION */}
        <div className="card p-5 md:p-7">

          <div className="mb-5 flex items-center justify-between">

            <div className="flex flex-wrap gap-2">

              <span className="badge border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                {currentSection}
              </span>


              {q.subcategory && (
                <span className="badge border-slate-200 dark:border-slate-700">
                  {q.subcategory}
                </span>
              )}


              {q.level && (
                <span className="badge border-slate-200 dark:border-slate-700">
                  {q.level}
                </span>
              )}

            </div>


            <button
              onClick={() =>
                setFlags(
                  (prev) => ({
                    ...prev,

                    [q.id]:
                      !prev[
                        q.id
                      ],
                  })
                )
              }
              className={`btn-ghost ${
                flags[q.id]
                  ? "text-amber-600"
                  : ""
              }`}
            >
              <Flag
                size={18}
              />

              {idn
                ? "Ragu"
                : "要確認"}
            </button>

          </div>


          {/* =====================================
              LISTENING AUDIO
              ===================================== */}
          {q.category ===
            "listening" && (
            <div className="mb-5">

              <button
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"

                disabled={
                  (
                    playCount[
                      playKey
                    ] || 0
                  ) >= 2
                }

                onClick={() => {
                  /*
                   * Safety check tambahan.
                   * Jangan jalankan lagi kalau
                   * sudah mencapai 2/2.
                   */
                  if (
                    (
                      playCount[
                        playKey
                      ] || 0
                    ) >= 2
                  ) {
                    return;
                  }


                  speak(
                    q.audioText ||
                      q.promptJa ||
                      q.prompt,

                    q.audioVoice,

                    () => {
                      /*
                       * Counter bertambah
                       * setelah audio mulai.
                       */
                      setPlayCount(
                        (
                          prev
                        ) => {
                          const current =
                            prev[
                              playKey
                            ] ||
                            0;


                          if (
                            current >=
                            2
                          ) {
                            return prev;
                          }


                          return {
                            ...prev,

                            [playKey]:
                              Math.min(
                                current +
                                  1,
                                2
                              ),
                          };
                        }
                      );
                    }
                  );
                }}
              >

                <Play
                  size={17}
                />


                {idn
                  ? "Putar audio Jepang"
                  : "音声を再生"}


                <span className="text-xs text-slate-400">
                  {playCount[
                    playKey
                  ] || 0}
                  /2
                </span>

              </button>


              {/* AUDIO ERROR */}
              {audioError && (
                <div className="mt-2 max-w-xl rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
                  {audioError}
                </div>
              )}

            </div>
          )}


          {/* QUESTION */}
          <h1 className="jp text-xl font-bold leading-relaxed md:text-2xl">
            {prompt}
          </h1>


          {/* OPTIONS */}
          <div className="mt-6 grid gap-3">

            {options.map(
              (
                option,
                optionIndex
              ) => (
                <button
                  key={`${option}-${optionIndex}`}

                  onClick={() => {
                    setAnswers(
                      (
                        prev
                      ) => ({
                        ...prev,

                        [q.id]:
                          optionIndex,
                      })
                    );


                    markStudyActivity();
                  }}

                  className={`rounded-2xl border p-4 text-left transition ${
                    answers[
                      q.id
                    ] ===
                    optionIndex
                      ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20 dark:bg-emerald-950/40"
                      : "border-slate-200 hover:border-slate-400 dark:border-slate-700"
                  }`}
                >

                  <span className="mr-3 font-black text-slate-400">
                    {String.fromCharCode(
                      65 +
                        optionIndex
                    )}
                  </span>


                  <span className="jp">
                    {option}
                  </span>

                </button>
              )
            )}

          </div>


          {/* PREVIOUS / NEXT */}
          <div className="mt-8 flex items-center justify-between">

            <button
              disabled={
                !canPrev
              }

              onClick={() => {
                if (
                  typeof window !==
                    "undefined" &&
                  "speechSynthesis" in
                    window
                ) {
                  window
                    .speechSynthesis
                    .cancel();
                }


                setIdx(
                  (current) =>
                    current - 1
                );
              }}

              className="btn-ghost disabled:cursor-not-allowed disabled:opacity-30"
            >
              ←{" "}
              {idn
                ? "Previous"
                : "前へ"}
            </button>


            {idx ===
            qs.length - 1 ? (

              <button
                onClick={() => {
                  if (
                    typeof window !==
                      "undefined" &&
                    "speechSynthesis" in
                      window
                  ) {
                    window
                      .speechSynthesis
                      .cancel();
                  }


                  setSubmitted(
                    true
                  );
                }}

                className="btn-primary"
              >

                <Send
                  size={17}
                />


                {idn
                  ? "Submit ujian"
                  : "提出"}

              </button>

            ) : (

              <button
                onClick={
                  goNext
                }
                className="btn-primary"
              >
                {idn
                  ? "Next"
                  : "次へ"}{" "}
                →
              </button>

            )}

          </div>


          {/* LISTENING LOCK INFO */}
          {currentSection ===
            "listening" && (

            <div className="mt-5 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">

              <LockKeyhole
                size={16}
              />


              {idn
                ? "Listening bergerak maju; soal sebelumnya terkunci setelah lanjut."
                : "聴解は前進のみ。次へ進むと前の問題はロックされます。"}

            </div>
          )}

        </div>


        {/* QUESTION NAVIGATOR */}
        <aside className="card h-fit p-4">

          <div className="mb-3 flex items-center justify-between">

            <h3 className="font-black">
              {idn
                ? "Nomor soal"
                : "問題番号"}
            </h3>


            <span className="text-xs text-slate-500">
              {
                Object.keys(
                  answers
                ).length
              }
              /{qs.length}
            </span>

          </div>


          <div className="grid grid-cols-5 gap-2">

            {qs.map(
              (
                question,
                questionIndex
              ) => {
                const disabled =
                  question.category !==
                  currentSection;


                return (
                  <button
                    /*
                     * Ditambah index supaya
                     * React key juga tetap unik
                     * kalau question.id duplikat.
                     */
                    key={`${question.id}-${questionIndex}`}

                    disabled={
                      disabled
                    }

                    onClick={() => {
                      if (
                        !disabled &&
                        currentSection !==
                          "listening"
                      ) {
                        if (
                          typeof window !==
                            "undefined" &&
                          "speechSynthesis" in
                            window
                        ) {
                          window
                            .speechSynthesis
                            .cancel();
                        }


                        setIdx(
                          questionIndex
                        );
                      }
                    }}

                    className={`relative aspect-square rounded-lg text-xs font-bold ${
                      questionIndex ===
                      idx
                        ? "bg-emerald-600 text-white"
                        : answers[
                            question.id
                          ] !==
                          undefined
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950"
                        : "bg-slate-100 dark:bg-slate-800"
                    } disabled:opacity-30`}
                  >

                    {questionIndex +
                      1}


                    {flags[
                      question.id
                    ] && (
                      <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    )}

                  </button>
                );
              }
            )}

          </div>

        </aside>

      </div>

    </div>
  );
}