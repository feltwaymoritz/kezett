import Link from "next/link";
import { Clock3, LockKeyhole, ShieldCheck } from "lucide-react";
import type { Locale } from "@/types";
import { allTryouts, sourcePackages } from "@/data/sourceInventory";

export function TryoutList({locale}:{locale:Locale}){
  const id=locale==="id";
  return <div className="space-y-6">
    <div><h1 className="text-3xl font-black">{id?"Try Out JFT Simulation":"JFT 模擬試験"}</h1><p className="mt-2 max-w-3xl text-slate-500">{id?"Seluruh 21 paket bertema digabung di sini. Status Verified dan Reconstructed tetap ditampilkan agar kualitas sumber tidak tersamarkan.":"21セットをまとめて表示。Verified / Reconstructed を残し、資料の状態が分かるようにしています。"}</p></div>
    <div className="soft-card flex gap-3 p-4 text-sm"><ShieldCheck className="shrink-0 text-emerald-600"/><p>{id?`${allTryouts.length} Try Out · masing-masing dinormalisasi menjadi 50 soal / 60 menit / 4 bagian dengan distribusi tipe tugas JFT (word meaning/usage, kanji, grammar/expression, tiga tipe listening, dan dua tipe reading). Soal tampil dalam bahasa Jepang secara default; saat mengerjakan kamu dapat beralih antara Sumber dan 日本語.`:`${allTryouts.length}模試・各50問 / 60分 / 4セクション。JFTの設問タイプ別に配分。問題は日本語表示が初期設定で、試験中にSumber / 日本語を切替できます。`}</p></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{allTryouts.map(t=>{const p=sourcePackages.find(x=>x.id===t.packageId)!;const verified=t.status==="verified";return <div className="card p-5" key={t.id}>
      <div className="flex items-start justify-between gap-3"><span className={`badge ${verified?"border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300":"border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"}`}>{verified?"✓ Verified":"↻ Reconstructed"}</span><span className="text-xs text-slate-400">{t.itemCount} Q</span></div>
      <h2 className="mt-4 text-xl font-black">{t.title}</h2>
      <div className="mt-3 flex gap-4 text-sm text-slate-500"><span className="flex items-center gap-1"><Clock3 size={15}/>60 min</span><span>4 {id?"bagian":"セクション"}</span></div>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{t.description}</p>
      <Link href={`/${locale}/tryout/${t.id}`} className="btn-primary mt-5 w-full">{id?"Mulai Try Out":"模試を開始"}</Link>
    </div>})}</div>
    <div className="soft-card p-5"><div className="flex items-center gap-2"><LockKeyhole size={18}/><h3 className="font-black">{id?"Aturan runner":"ランナーのルール"}</h3></div><p className="mt-2 text-sm text-slate-500">{id?"Vocabulary, Conversation/Expression, dan Reading dapat ditinjau selama masih di bagian yang sama. Setelah berpindah bagian tidak bisa kembali. Listening bergerak maju dan audio maksimal dua kali.":"文字・語彙、会話・表現、読解は同一セクション内で見直し可能。次セクションへ進むと戻れません。聴解は前進のみ・音声は最大2回。"}</p></div>
  </div>
}
