import type { SourcePackage, TryoutDefinition } from "@/types";

export const driveFolderSummary = {
  folderKisiKisi: {
    themedPackages: 21,
    supplementalFolders: 1,
    visualReferenceFolders: 1,
    standaloneAudioFound: 0,
  },
  folderLatihan: {
    topLevelEntries: 12,
    latsolShortcuts: 32,
    shortcutContentReadableThroughConnector: false,
  },
  officialFormat: {
    sections: 4,
    approximateQuestions: 50,
    durationMinutes: 60,
    listeningMaxPlays: 2,
  },
};

export const sourcePackages: SourcePackage[] = [
  { id:"seki", title:"JFT SEKI", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"SEKI.pdf", files:["SEKI.pdf","SOAL SEKI (VERSI JAWABAN).xlsx"], estimatedItems:48, sectionsDetected:4, verification:"verified", tryoutEligible:true, notes:"Empat sesi terbaca konsisten; pasangan PDF + workbook jawaban." },
  { id:"koohii", title:"JFT KOOHII", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"KOOHII.pdf", files:["KOOHII.pdf","SOAL KOOHII (VERSI JAWABAN).xlsx"], estimatedItems:48, sectionsDetected:4, verification:"verified", tryoutEligible:true, notes:"Empat sesi konsisten dan mendekati struktur resmi." },
  { id:"kyuukei", title:"JFT KYUUKEI", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"KYUUKEI.pdf", files:["KYUUKEI.pdf","SOAL KYUUKEI (VERSI JAWABAN).xlsx"], estimatedItems:48, sectionsDetected:4, verification:"verified", tryoutEligible:true, notes:"Empat sesi konsisten dan mendekati struktur resmi." },
  { id:"kazarimasu", title:"JFT KAZARIMASU", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"KAZARIMASU.pdf", files:["KAZARIMASU.pdf","SOAL KAZARIMASU (VERSI JAWABAN).xlsx"], estimatedItems:50, sectionsDetected:4, verification:"verified", tryoutEligible:true, notes:"Empat sesi terbaca; total mendekati ±50." },
  { id:"genkan", title:"JFT GENKAN", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"GENKAN.pdf", files:["GENKAN.pdf","SOAL GENKAN (VERSI JAWABAN).xlsx"], estimatedItems:52, sectionsDetected:4, verification:"reconstructed", tryoutEligible:false, notes:"Ada item ekstra/rekonstruksi; dipertahankan sebagai bank latihan." },
  { id:"nigemasu", title:"JFT NIGEMASU", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"JFT NIGEMASU.pdf", files:["JFT NIGEMASU.pdf"], sectionsDetected:4, verification:"partial", tryoutEligible:false, notes:"Isi file berjudul SOAL SARADA dan berupa rekonstruksi; mismatch provenance." },
  { id:"kutsushita", title:"JFT KUTSUSHITA", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"くつした(Kutsu Shita).pdf", files:["くつした(Kutsu Shita).pdf","SOAL KUTSU SHITA 7 SEPTEMBER(VERSI JAWABAN).xlsx","●KUTSUSHITA NEW.xlsx"], estimatedItems:46, sectionsDetected:4, verification:"partial", tryoutEligible:false, notes:"Paket mendekati lengkap tetapi beberapa item tidak tampak." },
  { id:"okaasan", title:"JFT OKAASAN", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"OKAASAN NEW.pdf", files:["JFT OKAASAN.pdf","OKAASAN NEW.pdf"], estimatedItems:48, sectionsDetected:4, verification:"verified", tryoutEligible:true, notes:"Versi NEW dipilih sebagai canonical; versi lama berisi item rekonstruksi tambahan." },
  { id:"kouen", title:"JFT KOUEN", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"KOUEN NEW.pdf", files:["JFT KOUEN.pdf","JFT KOUEN UPDATE.pdf","KOUEN NEW.pdf"], estimatedItems:50, sectionsDetected:4, verification:"reconstructed", tryoutEligible:false, notes:"Versi NEW paling lengkap, tetapi distribusi item tidak seimbang; perlu verifikasi visual." },
  { id:"kagi", title:"JFT KAGI", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"KAGI NEW.pdf", files:["JFT KAGI.pdf","かぎ apdate.pdf","KAGI NEW.pdf","ã--ã--.pdf"], estimatedItems:49, sectionsDetected:4, verification:"reconstructed", tryoutEligible:false, notes:"Mendekati lengkap tetapi berbentuk rekonstruksi/catatan." },
  { id:"jitensya", title:"JFT JITENSYA", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"JITENSA FIX.pdf", files:["JITENSA FIX.pdf"], estimatedItems:47, sectionsDetected:4, verification:"partial", tryoutEligible:false, notes:"Satu/lebih item tampak hilang." },
  { id:"ichigo", title:"JFT ICHIGO", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"いちご(Ichigo).pdf", files:["いちご(Ichigo).pdf"], sectionsDetected:4, verification:"partial", tryoutEligible:false, notes:"Dokumen sendiri menandai nomor terlewat/lupa." },
  { id:"chichi", title:"JFT CHICHI", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"父ちち FIX.pdf", files:["父ちち FIX.pdf"], estimatedItems:47, sectionsDetected:4, verification:"partial", tryoutEligible:false, notes:"Distribusi sesi tidak merata; cocok bank latihan." },
  { id:"basu", title:"JFT BASU", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"BASU NEW.pdf", files:["JFT BASU.pdf","BASU NEW.pdf"], estimatedItems:53, sectionsDetected:4, verification:"reconstructed", tryoutEligible:false, notes:"Terlihat ada item ekstra; dipisah dari tryout canonical." },
  { id:"kudamono", title:"JFT KUDAMONO", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"●KUDAMONO NEW.pdf", files:["KUDAMONO FIX.pdf","Kudamono (update).docx","●KUDAMONO NEW.pdf"], estimatedItems:49, sectionsDetected:4, verification:"reconstructed", tryoutEligible:false, notes:"Mendekati lengkap tetapi masih berbentuk rekonstruksi; perlu cross-check visual." },
  { id:"kuroi", title:"JFT KUROI", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"BAJU KUROI FIX.pdf", files:["BAJU KUROI FIX.pdf"], estimatedItems:48, sectionsDetected:4, verification:"verified", tryoutEligible:true, notes:"Empat sesi dengan distribusi sekitar 12 per bagian." },
  { id:"okimasu", title:"JFT OKIMASSU", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"●OKIMASU NEW.pdf", files:["●OKIMASU NEW.pdf"], estimatedItems:46, sectionsDetected:4, verification:"partial", tryoutEligible:false, notes:"PDF image-only telah diverifikasi visual: 25 soal pilihan ganda + catatan Chokai/Dokkai; sekitar 46 item/sub-item, masih parsial." },
  { id:"panda", title:"JFT PANDA", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"パンダ(Panda).pdf", files:["パンダ(Panda).pdf"], sectionsDetected:4, verification:"partial", tryoutEligible:false, notes:"Dokumen menyebut nomor terloncat dan soal/gambar yang terlupa." },
  { id:"saifu", title:"JFT SAIFU", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"SAIFU.pdf", files:["SAIFU.pdf"], estimatedItems:45, sectionsDetected:4, verification:"partial", tryoutEligible:false, notes:"Kisi-kisi rekonstruksi yang belum lengkap." },
  { id:"sora", title:"JFT SORA", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"●SORA NEW.pdf", files:["●SORA NEW.pdf"], sectionsDetected:4, verification:"partial", tryoutEligible:false, notes:"Sesi 3 dan 4 memiliki banyak nomor kosong." },
  { id:"toire", title:"JFT TOIRE", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"TOIRE NEW.pdf", files:["JFT TOIRE FIX.pdf","TOIRE NEW.pdf"], estimatedItems:52, sectionsDetected:4, verification:"reconstructed", tryoutEligible:false, notes:"Mendekati lengkap tetapi berisi item ekstra/catatan rekonstruksi." },
  { id:"latsol-tambahan", title:"Latsol Tambahan JFT Wajib Hafal", sourceType:"google_drive", folderGroup:"kisi-kisi", canonicalFile:"Latsol Tambahan JFT WAJIB HAFAL.PDF", files:["Latsol Tambahan JFT WAJIB HAFAL.PDF"], estimatedItems:26, sectionsDetected:0, verification:"verified", tryoutEligible:false, notes:"Quiz campuran Google Forms; cocok Latihan Soal." }
];

export const allTryouts: TryoutDefinition[] = sourcePackages
  .filter((p) => p.sectionsDetected === 4 && p.id !== "latsol-tambahan")
  .map((p, index) => ({
    id: `to-${index + 1}-${p.id}`,
    title: `Try Out ${index + 1} · ${p.title.replace("JFT ", "")}`,
    packageId: p.id,
    durationMinutes: 60,
    itemCount: 50,
    status: p.verification === "verified" ? "verified" as const : "reconstructed" as const,
    sourceLabel: "Original Material",
    description: p.verification === "verified"
      ? "Paket dengan struktur sumber yang relatif lengkap dan telah diverifikasi pada tahap inventarisasi."
      : "Paket rekonstruksi/parsial yang dinormalisasi menjadi simulasi 50 soal sambil mempertahankan status sumbernya.",
  }));

// Backward-compatible alias for older components/imports.
export const verifiedTryouts = allTryouts.filter((t) => t.status === "verified");

export const secondFolderInventory = [
  "perubahan KK Full.pdf", "pola kalimat .pdf", "Kanji A1 Marugoto.pdf", "Kanji JFT 613.pdf",
  "IRODORI A1", "IRODORI A2(1)", "IRODORI A2(2)", "KOTOBA IRODORI A1 BAB 1-18.pdf",
  "KOTOBA IRODORI A2 BAG 1.pdf", "KOTOBA IRODORI A2 BAGIAN 1.pdf", "KANJI A2.pdf", "Latsol/"
];

export const latsolShortcutInventory = [
  "Latihan Soal JFT Conversation (Himawari Project)1.pdf",
  "Latihan Soal JFT Reading (Himawari Project).pdf",
  ...Array.from({length:5},(_,i)=>`PERSIAPAN JFT BASIC VOLUME ${i+1}.pdf`),
  "Set Soal A JFT Basic (Himawari Project).pdf",
  ...Array.from({length:4},(_,i)=>`SIMULASI JFT BASIC ${i+1}.pdf`),
  ...Array.from({length:9},(_,i)=>`SOAL JFT BASIC LEVEL DASAR ${i+1}.pdf`),
  "SOAL JFT BASIC LEVEL INTERMEDIATE 3.pdf",
  "SOAL JIMUSHITSU (VERSI JAWABAN).xlsx",
  "SOAL KUTSU SHITA 7 SEPTEMBER(VERSI JAWABAN).xlsx",
  "SOAL OKAASAN.docx",
  "Salinan SOAL JIMUSHITSU (VERSI JAWABAN).xlsx",
  "Salinan SOAL KUTSU SHITA 7 SEPTEMBER(VERSI JAWABAN).xlsx",
  "Salinan SOAL OKAASAN.docx",
  "Salinan SOAL SARADA (VERSI JAWABAN).xlsx",
  "Salinan SOAL SHATSU (VERSI JAWABAN).xlsx",
  "Salinan SOAL SOBA (VERSI JAWABAN).xlsx",
  "Salinan SOAL TANA (VERSI JAWABAN).xlsx"
];
