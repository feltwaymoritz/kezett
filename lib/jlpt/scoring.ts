// JLPT scaled-score helpers (estimates — official JLPT scaling is equated per session).
// Ported from the standalone app: scaled = round(correct / total * 60) per section,
// total = sum of the three section scores (/180). N3 pass mark: every section >= 19
// and total >= 95.

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

/** N3 pass estimate: each section >= 19 and total >= 95. */
export function isPassEstimate(sections: SectionResult[]): boolean {
  return (
    sections.length > 0 &&
    sections.every((s) => s.scaled >= 19) &&
    totalScaled(sections) >= 95
  );
}
