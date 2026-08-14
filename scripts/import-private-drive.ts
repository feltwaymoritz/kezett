/**
 * Private ingestion contract for Kezett.
 *
 * The downloadable project does NOT republish full third-party PDFs/workbooks.
 * Run ingestion in your own environment against files you are authorized to use.
 * The importer should:
 * 1. enumerate source packages/assets;
 * 2. hash files for deduplication;
 * 3. extract raw text/images into source_assets;
 * 4. normalize questions WITHOUT changing original wording;
 * 5. store corrections/explanations separately in metadata;
 * 6. mark incomplete/image-only files for manual review;
 * 7. only publish a Try Out after verification.
 */
export type ImportRecord = {
  packageSlug: string;
  fileName: string;
  driveFileId?: string;
  mimeType: string;
  rawText?: string;
  extractionStatus: "verified"|"reconstructed"|"partial"|"needs_visual_extraction"|"unreadable_shortcut";
};

export function normalizeSourceText(raw:string){
  return raw.replace(/\r\n/g,"\n").trim();
}

export function shouldPublishAsTryout(record:{sectionsDetected:number; itemCount:number; hasAnswerKey:boolean; hasUnresolvedImages:boolean}){
  return record.sectionsDetected===4 && record.itemCount>=46 && record.itemCount<=52 && record.hasAnswerKey && !record.hasUnresolvedImages;
}
