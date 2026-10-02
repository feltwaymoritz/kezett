// Static index of the 31 JLPT N3 tryout exams (30 original + gen-01).
// Counts were computed from the exam JSON parts in public/jlpt/data at prep time.
// Per-exam content (questions/answers) is fetched at runtime by lib/jlpt/api.ts.

export interface JlptExamIndex {
  id: string;
  label: string;
  type: "original" | "generated";
  counts: { vocab: number; grammarReading: number; listening: number; total: number };
  /** Section timers in minutes: [vocab, grammar+reading, listening] (official JLPT N3). */
  timers: [number, number, number];
  audioSeconds: number;
  audioChunks: number;
  scriptPages: number;
}

export const JLPT_TIMERS: [number, number, number] = [30, 70, 40];

export const JLPT_EXAMS: JlptExamIndex[] = [
  { id: "2024-12", label: "2024年12月", type: "original", counts: { vocab: 35, grammarReading: 38, listening: 28, total: 101 }, timers: JLPT_TIMERS, audioSeconds: 2197, audioChunks: 88, scriptPages: 11 },
  { id: "2025-12", label: "2025年12月", type: "original", counts: { vocab: 35, grammarReading: 38, listening: 28, total: 101 }, timers: JLPT_TIMERS, audioSeconds: 2233, audioChunks: 90, scriptPages: 10 },
  { id: "2025-07", label: "2025年7月", type: "original", counts: { vocab: 35, grammarReading: 38, listening: 28, total: 101 }, timers: JLPT_TIMERS, audioSeconds: 2685, audioChunks: 108, scriptPages: 11 },
  { id: "2024-07", label: "2024年7月", type: "original", counts: { vocab: 35, grammarReading: 38, listening: 28, total: 101 }, timers: JLPT_TIMERS, audioSeconds: 2601, audioChunks: 105, scriptPages: 5 },
  { id: "2023-12", label: "2023年12月", type: "original", counts: { vocab: 35, grammarReading: 38, listening: 28, total: 101 }, timers: JLPT_TIMERS, audioSeconds: 2524, audioChunks: 101, scriptPages: 5 },
  { id: "2023-07", label: "2023年7月", type: "original", counts: { vocab: 35, grammarReading: 38, listening: 28, total: 101 }, timers: JLPT_TIMERS, audioSeconds: 1822, audioChunks: 73, scriptPages: 5 },
  { id: "2022-12", label: "2022年12月", type: "original", counts: { vocab: 35, grammarReading: 38, listening: 28, total: 101 }, timers: JLPT_TIMERS, audioSeconds: 2191, audioChunks: 88, scriptPages: 5 },
  { id: "2022-07", label: "2022年7月", type: "original", counts: { vocab: 34, grammarReading: 38, listening: 28, total: 100 }, timers: JLPT_TIMERS, audioSeconds: 2432, audioChunks: 98, scriptPages: 5 },
  { id: "2021-12", label: "2021年12月", type: "original", counts: { vocab: 35, grammarReading: 38, listening: 28, total: 101 }, timers: JLPT_TIMERS, audioSeconds: 2613, audioChunks: 105, scriptPages: 11 },
  { id: "2021-07", label: "2021年7月", type: "original", counts: { vocab: 35, grammarReading: 38, listening: 28, total: 101 }, timers: JLPT_TIMERS, audioSeconds: 2242, audioChunks: 90, scriptPages: 11 },
  { id: "2020-12", label: "2020年12月", type: "original", counts: { vocab: 35, grammarReading: 38, listening: 28, total: 101 }, timers: JLPT_TIMERS, audioSeconds: 2336, audioChunks: 94, scriptPages: 5 },
  { id: "2019-12", label: "2019年12月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2294, audioChunks: 92, scriptPages: 5 },
  { id: "2019-07", label: "2019年7月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2273, audioChunks: 91, scriptPages: 5 },
  { id: "2018-12", label: "2018年12月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2428, audioChunks: 98, scriptPages: 5 },
  { id: "2018-07", label: "2018年7月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2328, audioChunks: 94, scriptPages: 5 },
  { id: "2017-12", label: "2017年12月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2358, audioChunks: 95, scriptPages: 5 },
  { id: "2017-07", label: "2017年7月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2377, audioChunks: 96, scriptPages: 5 },
  { id: "2016-12", label: "2016年12月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2162, audioChunks: 87, scriptPages: 5 },
  { id: "2016-07", label: "2016年7月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2413, audioChunks: 97, scriptPages: 5 },
  { id: "2015-12", label: "2015年12月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2276, audioChunks: 92, scriptPages: 5 },
  { id: "2015-07", label: "2015年7月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2268, audioChunks: 91, scriptPages: 5 },
  { id: "2014-12", label: "2014年12月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2289, audioChunks: 92, scriptPages: 5 },
  { id: "2014-07", label: "2014年7月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2351, audioChunks: 95, scriptPages: 5 },
  { id: "2013-12", label: "2013年12月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2339, audioChunks: 94, scriptPages: 5 },
  { id: "2013-07", label: "2013年7月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2262, audioChunks: 91, scriptPages: 5 },
  { id: "2012-12", label: "2012年12月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2866, audioChunks: 115, scriptPages: 5 },
  { id: "2012-07", label: "2012年7月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2364, audioChunks: 95, scriptPages: 5 },
  { id: "2011-12", label: "2011年12月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 27, total: 101 }, timers: JLPT_TIMERS, audioSeconds: 2132, audioChunks: 86, scriptPages: 4 },
  { id: "2011-07", label: "2011年7月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 27, total: 101 }, timers: JLPT_TIMERS, audioSeconds: 2186, audioChunks: 88, scriptPages: 5 },
  { id: "2010-07", label: "2010年7月", type: "original", counts: { vocab: 35, grammarReading: 39, listening: 28, total: 102 }, timers: JLPT_TIMERS, audioSeconds: 2624, audioChunks: 105, scriptPages: 5 },
  { id: "gen-01", label: "Generate #01", type: "generated", counts: { vocab: 35, grammarReading: 38, listening: 28, total: 101 }, timers: JLPT_TIMERS, audioSeconds: 1076, audioChunks: 44, scriptPages: 9 },
];

export function getExamIndex(id: string): JlptExamIndex | undefined {
  return JLPT_EXAMS.find((e) => e.id === id);
}

// --- Audio hosting map (copied from jlpt-pilot/site/index.html setupAudio()) ---
// Listening audio is split into 25-second MP3 chunks hosted on separate Vercel projects.
const AUDIO_HOST = "https://jlpt-n3-audio.vercel.app";
const AUDIO2_HOST = "https://jlpt-n3-audio2.vercel.app";
const AUDIO3_HOST = "https://jlpt-n3-audio3.vercel.app";
const AUDIO4_HOST = "https://jlpt-n3-audio4.vercel.app";

const AH: Record<string, 1> = { "2018-07": 1, "2018-12": 1, "2019-07": 1, "2019-12": 1, "2020-12": 1, "2021-07": 1, "2021-12": 1, "2022-07": 1, "2022-12": 1, "2023-07": 1, "2023-12": 1 };
const AH3: Record<string, 1> = { "2017-07": 1, "2017-12": 1, "2015-12": 1, "2016-12": 1, "2016-07": 1, "2014-12": 1, "2012-07": 1, "2013-07": 1, "2015-07": 1, "2014-07": 1, "2013-12": 1, "2012-12": 1 };
const AH4: Record<string, 1> = { "2011-07": 1, "2011-12": 1, "2010-07": 1, "gen-01": 1 };

export function audioHostFor(examId: string): string {
  if (AH4[examId]) return AUDIO4_HOST;
  if (AH3[examId]) return AUDIO3_HOST;
  if (AH[examId]) return AUDIO_HOST;
  return AUDIO2_HOST;
}

/** URL of one 25-second listening chunk, e.g. .../audio/2024-12/chunks/chunk_007.mp3 */
export function audioChunkUrl(examId: string, idx: number): string {
  return `${audioHostFor(examId)}/audio/${examId}/chunks/chunk_${String(idx).padStart(3, "0")}.mp3`;
}
