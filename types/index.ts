export type Locale = "id" | "ja";
export type SourceType = "google_drive" | "previous_exam" | "ai_generated";
export type Category = "vocabulary" | "grammar" | "listening" | "reading";
export type DrillCategory = Category | "mixed";
export type VerificationStatus = "verified" | "reconstructed" | "partial" | "needs_visual_extraction" | "unreadable_shortcut";
export type StudyLevel = "A1" | "A2.1" | "A2.2" | "A2/B1" | "N5" | "N4" | "N3" | "mixed";

export interface SourcePackage {
  id: string;
  title: string;
  sourceType: SourceType;
  folderGroup: "kisi-kisi" | "latihan" | "official-public";
  canonicalFile?: string;
  files: string[];
  estimatedItems?: number;
  sectionsDetected?: number;
  verification: VerificationStatus;
  tryoutEligible: boolean;
  notes: string;
}

export interface Question {
  id: string;
  source: SourceType;
  sourceLabel: "Original Material" | "Previous Exam" | "AI Generated" | "Drilling Soal" | "Chapter Test";
  sourcePackage?: string;
  sourceFile?: string;
  category: Category;
  subcategory?: string;
  level?: StudyLevel;
  topic?: string;
  /** Source-style / Indonesian reconstruction wording. */
  prompt: string;
  /** Normalized Japanese version used by default in exam mode. */
  promptJa?: string;
  options: string[];
  optionsJa?: string[];
  correctIndex: number;
  explanation: string;
  explanationJa?: string;
  audioText?: string;
  audioVoice?: "male" | "female";
  verified: boolean;
  originalUnmodified?: boolean;
}

export interface TryoutDefinition {
  id: string;
  title: string;
  packageId: string;
  durationMinutes: number;
  itemCount: number;
  status: "verified" | "reconstructed";
  sourceLabel: string;
  description: string;
}

export interface VocabularyEntry {
  id: string;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaningId: string;
  sentenceJa: string;
  sentenceId: string;
  tags: string[];
}

export interface KanjiEntry {
  id: string;
  kanji: string;
  onyomi: string[];
  kunyomi: string[];
  meaningId: string;
  words: { word: string; reading: string; meaningId: string }[];
  sentenceJa: string;
  sentenceId: string;
}

export interface StoredAttempt {
  id: string;
  type: "tryout" | "drill" | "listening" | "chapter";
  date: string;
  category?: DrillCategory;
  title?: string;
  correct: number;
  total: number;
  pct: number;
  categoryScores?: Partial<Record<Category, number>>;
}

export interface BookChapter {
  id: string;
  number: number;
  title: string;
  titleJa?: string;
  topic: string;
  level: StudyLevel;
  canDo: string[];
  vocabulary: string[];
  grammar: string[];
  examples: { ja: string; id: string }[];
  sourceMapping: "direct" | "normalized" | "topic-derived";
}

export interface BookResource {
  id: string;
  title: string;
  series: string;
  level: StudyLevel;
  kind: "coursebook" | "vocabulary" | "grammar" | "kanji" | "workbook" | "collection";
  description: string;
  sourceUrl: string;
  secondaryUrls?: { label: string; url: string }[];
  chapters: BookChapter[];
  sourceFiles: string[];
  chapterMapping: "direct" | "normalized" | "collection";
  jftPriority: "core" | "support" | "outside";
}
