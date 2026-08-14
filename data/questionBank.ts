/**
 * Compatibility layer. New practice content lives in drillingBank.ts.
 * User-facing UI never labels this content as "AI Generated"; it is presented as Drilling Soal.
 */
export { drillingQuestionBank as aiQuestionBank, drillingStats as aiQuestionStats, questionsForTryout as questionsForSimulation } from "@/data/drillingBank";
