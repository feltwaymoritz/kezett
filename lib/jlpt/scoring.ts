// JLPT scaled-score helpers (estimates — official JLPT scaling is equated per session).
// Ported from the standalone app: scaled = round(correct / total * 60) per section,
// total = sum of the section scores. Full N3 (3 sections): max /180, pass mark
// every section >= 19 and total >= 95. Exams without a listening section have
// fewer sections, so the max total and the pass threshold scale with the
// section count (95/180 ≈ 53% of the max).

export function scaledScore(correct: number, total: number): number {
  if (!total) return 0;
  return Math.round((correct / total) * 60);
}

export interface SectionResult {
  name: string;
  correct: number;
  total: number;
  scaled: number;
}

export function withScaled(
  sections: { name: string; correct: number; total: number }[]
): SectionResult[] {
  return sections.map((s) => ({ ...s, scaled: scaledScore(s.correct, s.total) }));
}

export function totalScaled(sections: SectionResult[]): number {
  return sections.reduce((a, s) => a + s.scaled, 0);
}

/** Max scaled total for this exam: 60 per section present (3 sections → 180). */
export function maxScaledTotal(sections: SectionResult[]): number {
  return sections.length * 60;
}

/** Pass threshold for the total, proportional to the official 95/180. */
export function passThresholdTotal(sections: SectionResult[]): number {
  return Math.round((maxScaledTotal(sections) * 95) / 180);
}

/**
 * N3 pass estimate: each section >= 19 and total >= the threshold for the
 * sections present (95 for a full 3-section exam, 63 for a 2-section exam).
 */
export function isPassEstimate(sections: SectionResult[]): boolean {
  return (
    sections.length > 0 &&
    sections.every((s) => s.scaled >= 19) &&
    totalScaled(sections) >= passThresholdTotal(sections)
  );
}
