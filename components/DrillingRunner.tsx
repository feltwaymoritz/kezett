"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Headphones, Play, RotateCcw, XCircle } from "lucide-react";
import type { Category, DrillCategory, Locale } from "@/types";
import { questionsForDrill } from "@/data/drillingBank";
import { markStudyActivity, recordAttempt } from "@/lib/progress";

function speak(text:string){if(typeof window==="undefined"||!("speechSynthesis" in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="ja-JP";u.rate=.92;const vs=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith("ja"));if(vs.length)u.voice=vs[0];speechSynthesis.speak(u)}
const categoryName=(c:DrillCategory,id:boolean)=>({mixed:id?"Campuran 4 Tes":"4分野ミックス",vocabulary:id?"Huruf & Kosakata":"文字・語彙",grammar:id?"Percakapan & Ungkapan":"会話・表現",listening:"Listening",reading:"Reading"}[c]);

export function DrillingRunner({locale,category,count}:{locale:Locale;category:DrillCategory;count:number}){
  const id=locale==="id";
  const seed=useMemo(()=>Math.floor(Date.now()/1000),[]);
  const qs=useMemo(()=>questionsForDrill(category,count,seed),[category,count,seed]);
  const [idx,setIdx]=useState(0); const [answers,setAnswers]=useState<Record<string,number>>({}); const [done,setDone]=useState(false); const [plays,setPlays]=useState<Record<string,number>>({});
  const q=qs[idx]; const selected=answers[q?.id]; const answered=selected!==undefined;
  const correct=qs.filter(x=>answers[x.id]===x.correctIndex).length;
  const finish=()=>{
    const pct=Math.round(correct/qs.length*100);
    const catScores:Partial<Record<Category,number>>={};
    for(const cat of ["vocabulary","grammar","listening","reading"] as Category[]){const group=qs.filter(x=>x.category===cat);if(group.length){catScores[cat]=Math.round(group.filter(x=>answers[x.id]===x.correctIndex).length/group.length*100)}}
    recordAttempt({type:"drill",category,correct,total:qs.length,pct,categoryScores:catScores}); setDone(true);
  };
  if(done){const pct=Math.round(correct/qs.length*100);return <div className="mx-auto max-w-3xl space-y-5"><div className="card p-8 text-center"><div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald-50 text-3xl font-black text-emerald-700 dark:bg-emerald-950/40">{pct}%</div><h1 className="mt-4 text-3xl font-black">{id?"Drilling selesai":"ドリル完了"}</h1><p className="mt-2 text-slate-500">{correct}/{qs.length} {id?"jawaban benar":"正解"}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button className="btn-primary" onClick={()=>location.reload()}><RotateCcw size={17}/>{id?"Ulang dengan soal lain":"別の問題で再挑戦"}</button><Link className="btn-ghost border border-slate-200 dark:border-slate-700" href={`/${locale}/drilling`}>{id?"Pilih kategori":"カテゴリ選択"}</Link></div></div></div>}
  return <div className="mx-auto max-w-4xl space-y-4">
    <div className="soft-card flex items-center justify-between gap-4 p-4"><div><div className="text-xs font-bold uppercase tracking-wider text-emerald-600">{id?"Drilling Soal":"問題ドリル"}</div><div className="font-black">{categoryName(category,id)}</div></div><div className="text-right"><div className="text-xs text-slate-500">{id?"Soal":"問題"}</div><div className="font-black">{idx+1}/{qs.length}</div></div></div>
    <div className="card p-5 md:p-8">
      <div className="mb-5 flex items-center justify-between"><div className="flex flex-wrap gap-2"><span className="badge border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{q.category}</span>{q.subcategory&&<span className="badge border-slate-200 dark:border-slate-700">{q.subcategory}</span>}{q.level&&<span className="badge border-slate-200 dark:border-slate-700">{q.level}</span>}</div>{q.category==="listening"&&<button className="btn-ghost border border-slate-200 dark:border-slate-700" disabled={(plays[q.id]||0)>=2} onClick={()=>{const n=(plays[q.id]||0)+1;setPlays({...plays,[q.id]:n});speak(q.audioText||q.promptJa||q.prompt)}}><Play size={17}/>{id?"Putar audio":"音声再生"} {plays[q.id]||0}/2</button>}</div>
      <h1 className="jp text-xl font-bold leading-relaxed md:text-2xl">{q.promptJa||q.prompt}</h1>
      <div className="mt-6 grid gap-3">{(q.optionsJa||q.options).map((o,i)=>{const good=answered&&i===q.correctIndex;const wrong=answered&&i===selected&&i!==q.correctIndex;return <button key={`${o}-${i}`} disabled={answered} onClick={()=>{setAnswers({...answers,[q.id]:i});markStudyActivity()}} className={`rounded-2xl border p-4 text-left transition ${good?"border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30":wrong?"border-rose-500 bg-rose-50 dark:bg-rose-950/30":"border-slate-200 hover:border-slate-400 dark:border-slate-700"}`}><span className="mr-3 font-black text-slate-400">{String.fromCharCode(65+i)}</span><span className="jp">{o}</span></button>})}</div>
      {answered&&<div className={`mt-6 rounded-2xl p-4 ${selected===q.correctIndex?"bg-emerald-50 dark:bg-emerald-950/30":"bg-rose-50 dark:bg-rose-950/30"}`}><div className="flex items-center gap-2 font-black">{selected===q.correctIndex?<CheckCircle2 className="text-emerald-600"/>:<XCircle className="text-rose-600"/>}{selected===q.correctIndex?(id?"Benar":"正解"):(id?"Belum tepat":"不正解")}</div><p className="jp mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{id?q.explanation:(q.explanationJa||q.explanation)}</p>{q.category==="listening"&&<div className="mt-3 border-t border-current/10 pt-3"><div className="text-xs font-black uppercase tracking-wide opacity-50">Transcript</div><p className="jp mt-2 text-sm">{q.audioText}</p></div>}</div>}
      <div className="mt-7 flex justify-end">{idx===qs.length-1?<button disabled={!answered} onClick={finish} className="btn-primary disabled:opacity-40">{id?"Selesai":"完了"}</button>:<button disabled={!answered} onClick={()=>setIdx(idx+1)} className="btn-primary disabled:opacity-40">{id?"Soal berikutnya":"次の問題"} →</button>}</div>
    </div>
  </div>
}
