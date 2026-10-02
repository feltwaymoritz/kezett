// Runtime data access for the JLPT module.
// Exam JSON parts and the drill bank live as static files under /jlpt/
// (snapshot of the standalone jlpt-pilot site — see data/jlpt/README.md).

export interface JlptMeta {
  id: string;
  label: string;
  type: "original" | "generated";
  audioChunks: number;
  audioSeconds: number;
  scriptPages: number;
  listeningKey: Record<string, number[]>;
}

export interface VocabItem {
  instruction: string;
  mondai: number;
  no: number;
  note: string | null;
  options: string[];
  text: string;
}

export interface GrItem {
  no: number;
  mondai: number;
  part: "grammar" | "reading";
  passage: string | null;
  text: string;
  options: string[];
  note: string | null;
}

export interface ListeningQuestion {
  no: number;
  options: string[];
  optionsPrinted: boolean;
  note?: string;
  image?: string;
}

export interface ListeningMondai {
  instruction: string;
  mondai: number;
  questions: ListeningQuestion[];
}

export interface AnswerEntry {
  answer: number; // 1-based
  explanation_zh?: string;
}

export interface JlptExamData {
  meta: JlptMeta;
  vocab: VocabItem[];
  grammarReading: GrItem[];
  listening: ListeningMondai[];
  answers: {
    vocab: Record<string, AnswerEntry>;
    grammar_reading: Record<string, AnswerEntry>;
  };
}

/** One normalized question as used by the runner / review UI. */
export interface JlptItem {
  id: string;
  label: string;
  mondai: string;
  text: string;
  inst: string;
  options: string[];
  passage: string | null;
  image: string | null;
  caption: string;
  /** 1-based correct option, when known. */
  key?: number;
  expl?: string;
}

export interface JlptSection {
  key: "vocab" | "bunpo" | "listening";
  title: string;
  name: string; // short display name for results/history
  min: number;
  qs: JlptItem[];
}

const examCache = new Map<string, Promise<JlptExamData>>();

export function fetchExam(id: string): Promise<JlptExamData> {
  const hit = examCache.get(id);
  if (hit) return hit;
  const p = (async () => {
    const [meta, v, g, l, a] = await Promise.all(
      ["meta", "vocab", "gr", "listening", "answers"].map((part) =>
        fetch(`/jlpt/data/${id}-${part}.json`).then((r) => {
          if (!r.ok) throw new Error(`Gagal memuat ${id}-${part}.json`);
          return r.json();
        })
      )
    );
    return {
      meta,
      vocab: v.vocab,
      grammarReading: g.grammar_reading,
      listening: l.listening,
      answers: a,
    } as JlptExamData;
  })();
  examCache.set(id, p);
  return p;
}

/** Resolve a data-relative asset path ("img/...", "script/...") to its public URL. */
export function jlptAsset(ref: string): string {
  if (!ref) return ref;
  if (ref.startsWith("http") || ref.startsWith("/")) return ref;
  return `/jlpt/${ref}`;
}

function ansEntry(
  rec: Record<string, AnswerEntry> | undefined,
  key: string
): AnswerEntry | undefined {
  return rec ? rec[key] : undefined;
}

/**
 * Build the three tryout sections (vocab 30m / grammar+reading 70m / listening 40m)
 * from raw exam data — ported from the standalone app's buildSections().
 */
export function buildSections(
  data: JlptExamData,
  timers: [number, number, number]
): JlptSection[] {
  const vocab: JlptItem[] = data.vocab.map((x) => {
    const e = ansEntry(data.answers.vocab, `V${x.no}`);
    return {
      id: `V${x.no}`,
      label: `No.${x.no}`,
      mondai: `問題${x.mondai}`,
      text: x.text,
      inst: x.instruction || "",
      options: x.options,
      passage: null,
      image: null,
      caption: x.note || "",
      key: e?.answer,
      expl: e?.explanation_zh,
    };
  });

  const bunpo: JlptItem[] = data.grammarReading.map((x) => {
    const e = ansEntry(data.answers.grammar_reading, `G${x.no}`);
    return {
      id: `G${x.no}`,
      label: `No.${x.no}`,
      mondai: `問題${x.mondai}`,
      text: x.text,
      inst: "",
      options: x.options,
      passage: x.passage,
      image: null,
      caption: x.note || "",
      key: e?.answer,
      expl: e?.explanation_zh,
    };
  });

  const listening: JlptItem[] = [];
  for (const m of data.listening) {
    for (const q of m.questions) {
      const printed = q.optionsPrinted !== false;
      listening.push({
        id: `L${m.mondai}-${q.no}`,
        label: `問題${m.mondai}-${q.no}番`,
        mondai: `問題${m.mondai}`,
        // Audio-only questions (optionsPrinted:false) carry no options in the data;
        // the choices are heard from the audio, so render numeric choices.
        text: printed ? "" : "(Pilihan hanya terdengar dari audio — pilih nomornya)",
        inst: m.instruction || "",
        options: printed ? q.options : ["1", "2", "3", "4"],
        passage: null,
        image: q.image ? jlptAsset(q.image) : null,
        caption: q.note || "",
        key: (data.meta.listeningKey || {})[String(m.mondai)]?.[q.no - 1],
      });
    }
  }

  return [
    { key: "vocab", title: "言語知識（文字・語彙）", name: "文字・語彙", min: timers[0], qs: vocab },
    { key: "bunpo", title: "言語知識（文法）・読解", name: "文法・読解", min: timers[1], qs: bunpo },
    { key: "listening", title: "聴解", name: "聴解", min: timers[2], qs: listening },
  ];
}

// ---------------- Drill bank ----------------

export type DrillCategory = "vocab" | "grammar" | "reading" | "listening";

export interface DrillItem {
  id: string;
  category: DrillCategory;
  sub: string;
  question: string;
  options: string[];
  answer: number; // 1-based
  explanation_id: string;
  passage?: string;
  audio?: string;
  script?: string;
}

export type DrillBank = Record<DrillCategory, DrillItem[]>;

let drillPromise: Promise<DrillBank> | null = null;

export function loadDrillBank(): Promise<DrillBank> {
  if (drillPromise) return drillPromise;
  drillPromise = (async () => {
    const man: Record<string, string[]> = await fetch("/jlpt/drill/manifest.json").then(
      (r) => {
        if (!r.ok) throw new Error("Gagal memuat manifest drill");
        return r.json();
      }
    );
    const out = {} as DrillBank;
    for (const cat of Object.keys(man)) {
      const parts = await Promise.all(
        man[cat].map((p) =>
          fetch(`/jlpt/drill/${p}`).then((r) => {
            if (!r.ok) throw new Error(`Gagal memuat ${p}`);
            return r.json();
          })
        )
      );
      out[cat as DrillCategory] = parts.flat();
    }
    return out;
  })();
  return drillPromise;
}
