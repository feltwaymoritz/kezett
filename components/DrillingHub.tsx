"use client";
import Link from "next/link";
import { useState } from "react";
import { BookOpen, Headphones, Languages, Shuffle, WholeWord } from "lucide-react";
import type { DrillCategory, Locale } from "@/types";
import { drillingQuestionBank, drillingStats } from "@/data/drillingBank";

const categories: {key:DrillCategory; icon:any; id:string; ja:string; descId:string; descJa:string}[] = [
  {key:"mixed",icon:Shuffle,id:"Campuran 4 Tes",ja:"4分野ミックス",descId:"Soal acak dari empat bagian JFT.",descJa:"JFTの4分野からランダム出題。"},
  {key:"vocabulary",icon:WholeWord,id:"Huruf & Kosakata",ja:"文字・語彙",descId:"Kana, kanji dasar, bacaan, dan kosakata sehari-hari.",descJa:"かな・基本漢字・読み・生活語彙。"},
  {key:"grammar",icon:Languages,id:"Percakapan & Ungkapan",ja:"会話・表現",descId:"Pola kalimat, respons, izin, saran, dan ungkapan sosial.",descJa:"文型・応答・許可・助言・社会表現。"},
  {key:"listening",icon:Headphones,id:"Listening",ja:"聴解",descId:"Dialog dan pengumuman pendek dengan Japanese TTS.",descJa:"短い会話・アナウンスを日本語音声で練習。"},
  {key:"reading",icon:BookOpen,id:"Reading",ja:"読解",descId:"Pengumuman, jadwal, memo, aturan, dan informasi sederhana.",descJa:"お知らせ・予定・メモ・ルール・情報検索。"},
];

export function DrillingHub({locale}:{locale:Locale}) {
  const id = locale === "id";
  const [count,setCount] = useState(20);
  return <div className="space-y-6">
    <div>
      <div className="badge border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-300">1,000 JFT-style questions</div>
      <h1 className="mt-3 text-3xl font-black">{id?"Drilling Soal":"問題ドリル"}</h1>
      <p className="mt-2 max-w-3xl text-slate-500">{id?"Pilih bagian yang ingin dilatih. Soal baru dibuat mengikuti bentuk tugas JFT-Basic dan konteks kehidupan sehari-hari, tanpa mencampurnya dengan paket sumber Try Out.":"練習したい分野を選択。JFT-Basicのタスク形式と生活場面に合わせた新規問題です。模試のソース資料とは分離しています。"}</p>
    </div>

    <div className="soft-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div><div className="font-black">{id?"Jumlah soal per sesi":"1セッションの問題数"}</div><div className="text-sm text-slate-500">{id?"Pilih sesi pendek atau drilling intensif.":"短時間または集中ドリルを選択。"}</div></div>
      <div className="flex gap-2">{[10,20,50].map(n=><button key={n} onClick={()=>setCount(n)} className={`rounded-xl px-4 py-2 text-sm font-black ${count===n?"bg-slate-900 text-white dark:bg-white dark:text-slate-900":"border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"}`}>{n}</button>)}</div>
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {categories.map(({key,icon:Icon,...c})=>{
        const amount=key==="mixed"?drillingQuestionBank.length:drillingStats[key];
        return <Link href={`/${locale}/drilling/${key}?count=${count}`} key={key} className="card group p-5 transition hover:-translate-y-1 hover:border-emerald-300">
          <div className="flex items-start justify-between gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><Icon/></div><span className="badge border-slate-200 dark:border-slate-700">{amount} {id?"soal":"問"}</span></div>
          <h2 className="mt-5 text-xl font-black">{id?c.id:c.ja}</h2>
          <p className="mt-2 text-sm text-slate-500">{id?c.descId:c.descJa}</p>
          <div className="mt-5 text-sm font-black text-emerald-700 dark:text-emerald-300">{id?`Mulai ${count} soal →`:`${count}問を開始 →`}</div>
        </Link>;
      })}
    </div>
    <div className="soft-card p-4 text-xs text-slate-500">{id?"Catatan: 1.000 soal ini adalah bank drilling baru bergaya JFT, bukan soal ujian resmi dan bukan salinan soal tahun sebelumnya.":"注: 1,000問はJFT形式に合わせた新規ドリルで、公式本試験問題や過去問の複製ではありません。"}</div>
  </div>;
}
