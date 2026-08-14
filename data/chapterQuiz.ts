import type { BookChapter, Question, StudyLevel } from "@/types";

type Lex={w:string;r:string;m:string};
type Domain="general"|"study"|"work"|"food"|"health"|"transport"|"shopping"|"home"|"family"|"weather"|"leisure";
const lex:Record<Domain,Lex[]>={
 general:[{w:"時間",r:"じかん",m:"waktu"},{w:"場所",r:"ばしょ",m:"tempat"},{w:"友達",r:"ともだち",m:"teman"},{w:"予定",r:"よてい",m:"rencana"},{w:"便利",r:"べんり",m:"praktis"},{w:"大丈夫",r:"だいじょうぶ",m:"tidak apa-apa"}],
 study:[{w:"日本語",r:"にほんご",m:"bahasa Jepang"},{w:"漢字",r:"かんじ",m:"kanji"},{w:"教室",r:"きょうしつ",m:"ruang kelas"},{w:"先生",r:"せんせい",m:"guru"},{w:"練習",r:"れんしゅう",m:"latihan"},{w:"質問",r:"しつもん",m:"pertanyaan"}],
 work:[{w:"会社",r:"かいしゃ",m:"perusahaan"},{w:"仕事",r:"しごと",m:"pekerjaan"},{w:"会議",r:"かいぎ",m:"rapat"},{w:"資料",r:"しりょう",m:"dokumen/bahan"},{w:"受付",r:"うけつけ",m:"resepsionis/loket"},{w:"休憩",r:"きゅうけい",m:"istirahat"}],
 food:[{w:"料理",r:"りょうり",m:"masakan"},{w:"野菜",r:"やさい",m:"sayuran"},{w:"魚",r:"さかな",m:"ikan"},{w:"飲み物",r:"のみもの",m:"minuman"},{w:"注文",r:"ちゅうもん",m:"pesanan"},{w:"食堂",r:"しょくどう",m:"kantin"}],
 health:[{w:"病院",r:"びょういん",m:"rumah sakit"},{w:"薬",r:"くすり",m:"obat"},{w:"熱",r:"ねつ",m:"demam"},{w:"健康",r:"けんこう",m:"kesehatan"},{w:"休み",r:"やすみ",m:"istirahat/libur"},{w:"大丈夫",r:"だいじょうぶ",m:"baik-baik saja"}],
 transport:[{w:"駅",r:"えき",m:"stasiun"},{w:"電車",r:"でんしゃ",m:"kereta"},{w:"バス",r:"バス",m:"bus"},{w:"道",r:"みち",m:"jalan"},{w:"空港",r:"くうこう",m:"bandara"},{w:"入口",r:"いりぐち",m:"pintu masuk"}],
 shopping:[{w:"店",r:"みせ",m:"toko"},{w:"買い物",r:"かいもの",m:"belanja"},{w:"値段",r:"ねだん",m:"harga"},{w:"財布",r:"さいふ",m:"dompet"},{w:"服",r:"ふく",m:"pakaian"},{w:"安い",r:"やすい",m:"murah"}],
 home:[{w:"家",r:"いえ",m:"rumah"},{w:"部屋",r:"へや",m:"kamar"},{w:"机",r:"つくえ",m:"meja"},{w:"鍵",r:"かぎ",m:"kunci"},{w:"電気",r:"でんき",m:"listrik"},{w:"近い",r:"ちかい",m:"dekat"}],
 family:[{w:"家族",r:"かぞく",m:"keluarga"},{w:"母",r:"はは",m:"ibu"},{w:"父",r:"ちち",m:"ayah"},{w:"友達",r:"ともだち",m:"teman"},{w:"子ども",r:"こども",m:"anak"},{w:"名前",r:"なまえ",m:"nama"}],
 weather:[{w:"天気",r:"てんき",m:"cuaca"},{w:"雨",r:"あめ",m:"hujan"},{w:"風",r:"かぜ",m:"angin"},{w:"台風",r:"たいふう",m:"topan"},{w:"安全",r:"あんぜん",m:"aman"},{w:"公園",r:"こうえん",m:"taman"}],
 leisure:[{w:"旅行",r:"りょこう",m:"perjalanan"},{w:"映画",r:"えいが",m:"film"},{w:"音楽",r:"おんがく",m:"musik"},{w:"公園",r:"こうえん",m:"taman"},{w:"写真",r:"しゃしん",m:"foto"},{w:"楽しい",r:"たのしい",m:"menyenangkan"}],
};
const places=["駅","会社","病院","公園","スーパー","会議室","教室","レストラン"];
const times=["9:00","10:30","12:00","14:20","17:00","18:30"];
const days=["月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"];
function domainFor(topic:string):Domain{const t=topic.toLowerCase();if(/food|dish|meal|restaurant|makanan|料理|食/.test(t))return"food";if(/health|healthy|kesehatan|病|健康/.test(t))return"health";if(/work|company|pekerjaan|会社|仕事/.test(t))return"work";if(/study|japanese|bahasa jepang|教室|日本語/.test(t))return"study";if(/town|transport|trip|travel|kota|perjalanan|jalan|駅|交通/.test(t))return"transport";if(/shop|shopping|belanja|store|買/.test(t))return"shopping";if(/home|house|rumah|部屋/.test(t))return"home";if(/family|relationship|people|diriku|myself|家族/.test(t))return"family";if(/season|weather|nature|environment|cuaca|天気|alam/.test(t))return"weather";if(/holiday|event|hobby|like|leisure|libur|映画|趣味/.test(t))return"leisure";return"general"}
function rotate<T>(a:T[],n:number){return a.map((_,i)=>a[(i+n)%a.length])}
function opts(answer:string,pool:string[],seed:number){const d=[...new Set(pool.filter(x=>x!==answer))];while(d.length<3)d.push("わかりません");const a=rotate([answer,...d.slice(0,3)],seed%4);return{options:a,correctIndex:a.indexOf(answer)}}
function base(bookId:string,ch:BookChapter,i:number,category:Question["category"]){return{id:`cq-${bookId}-${ch.id}-${i+1}`,source:"ai_generated" as const,sourceLabel:"Chapter Test" as const,sourcePackage:bookId,category,level:ch.level,topic:ch.topic,verified:true}}
function grammarTask(pattern:string,domain:Domain,seed:number){
 const p=pattern, place=places[seed%places.length];
 if(/てもいい/.test(p))return{ja:`ここで 写真を ＿＿＿も いいですか。`,a:"撮って",ds:["撮る","撮った","撮らない"],ex:"～てもいいですか = meminta izin."};
 if(/ないで/.test(p))return{ja:`危ないですから、ここに ＿＿＿で ください。`,a:"入らない",ds:["入って","入った","入ります"],ex:"～ないでください = tolong jangan."};
 if(/ほうがいい/.test(p))return{ja:`熱が ありますから、今日は ＿＿＿ ほうが いいです。`,a:"休んだ",ds:["休みます","休んで","休まない"],ex:"～たほうがいい = saran."};
 if(/たこと/.test(p))return{ja:"日本へ 行った ことが ＿＿＿。",a:"あります",ds:["います","します","なります"],ex:"～たことがあります = pernah."};
 if(/つもり/.test(p))return{ja:"来週、京都へ 旅行する ＿＿＿です。",a:"つもり",ds:["ながら","しか","ばかり"],ex:"～つもりです = rencana."};
 if(/ように/.test(p))return{ja:"忘れない ＿＿＿、メモします。",a:"ように",ds:["ながら","ばかり","あとで"],ex:"～ないように = agar tidak."};
 if(/ながら/.test(p))return{ja:"音楽を 聞き＿＿＿、料理します。",a:"ながら",ds:["ばかり","まで","しか"],ex:"～ながら = sambil."};
 if(/そう/.test(p))return{ja:"この料理は おいし＿＿＿ですね。",a:"そう",ds:["ながら","まで","しか"],ex:"～そうです = kelihatannya."};
 if(/ています/.test(p))return{ja:"毎日 日本語を 勉強＿＿＿います。",a:"して",ds:["し","する","した"],ex:"～ています dapat menyatakan kebiasaan/proses."};
 if(/てください/.test(p))return{ja:"この薬を 食事の 後で ＿＿＿ください。",a:"飲んで",ds:["飲み","飲む","飲んだ"],ex:"～てください = permintaan."};
 if(/があります|います/.test(p))return{ja:`${place}の 近くに コンビニが ＿＿＿。`,a:"あります",ds:["います","します","なります"],ex:"Benda/tempat menggunakan あります."};
 if(/たい/.test(p))return{ja:"休みの日に 京都へ ＿＿＿です。",a:"行きたい",ds:["行って","行った","行かない"],ex:"～たいです = ingin melakukan."};
 if(/たら/.test(p))return{ja:"雨が ＿＿＿、イベントは 中止です。",a:"降ったら",ds:["降って","降るまで","降りながら"],ex:"～たら = kalau/jika."};
 if(/前に/.test(p))return{ja:"料理を 作る ＿＿＿、手を 洗います。",a:"前に",ds:["あとで","ながら","しか"],ex:"辞書形＋前に = sebelum."};
 if(/から/.test(p))return{ja:"仕事が 終わって ＿＿＿、買い物に 行きます。",a:"から",ds:["まで","しか","なら"],ex:"～てから = setelah."};
 return{ja:`${place}へ ＿＿＿。`,a:"行きます",ds:["食べます","読みます","飲みます"],ex:"Pilih predikat yang sesuai dengan tujuan tempat."};
}
export function chapterQuizQuestions(bookId:string,ch:BookChapter,count=20):Question[]{
 const domain=domainFor(ch.topic), words=lex[domain], patterns=ch.grammar.length?ch.grammar:["～です／ます"];
 const advanced=["A2.2","A2/B1","N4","N3"].includes(ch.level), intermediate=["A2.1"].includes(ch.level);
 return Array.from({length:count},(_,i)=>{
  const category=(['vocabulary','grammar','listening','reading'] as const)[i%4], b=base(bookId,ch,i,category), w=words[(i+ch.number)%words.length];
  if(category==="vocabulary"){
   if(i%8===0){const o=opts(w.r,words.map(x=>x.r),i);return{...b,subcategory:"kanji-reading",prompt:`Pilih bacaan 「${w.w}」.`,promptJa:`「${w.w}」の 読み方は どれですか。`,options:o.options,optionsJa:o.options,correctIndex:o.correctIndex,explanation:`${w.w} dibaca ${w.r}.`,explanationJa:`「${w.w}」は「${w.r}」と読みます。`};}
   const o=opts(w.m,words.map(x=>x.m),i);return{...b,subcategory:"word-meaning",prompt:`Apa arti 「${w.w}」?`,promptJa:`「${w.w}」の 意味に いちばん 近いものを 選んでください。`,options:o.options,optionsJa:o.options,correctIndex:o.correctIndex,explanation:`${w.w} (${w.r}) = ${w.m}.`,explanationJa:`「${w.w}」は「${w.r}」と読みます。`};
  }
  if(category==="grammar"){
   const g=grammarTask(patterns[i%patterns.length],domain,i+ch.number),o=opts(g.a,g.ds,i);return{...b,subcategory:i%8===1?"expression":"grammar",prompt:`Pola bab: ${patterns[i%patterns.length]}`,promptJa:g.ja,options:o.options,optionsJa:o.options,correctIndex:o.correctIndex,explanation:g.ex,explanationJa:`正解は「${g.a}」です。`};
  }
  if(category==="listening"){
   const place=places[(i+ch.number)%places.length],time=times[(i+ch.number)%times.length];
   if(i%8===2){const audio=advanced?`A：このあと${place}へ行く予定でしたね。 B：はい。でも、その前に${w.w}のことを確認しておいたほうがいいと思います。 A：そうですね。先に確認しましょう。`:`A：このあと${place}へ行きます。 B：その前に${w.w}のことを確認しましょう。 A：はい。`;const o=opts(w.w,words.map(x=>x.w),i);return{...b,subcategory:"conversation-content",prompt:"Apa yang akan diperiksa terlebih dahulu?",promptJa:"最初に 何を 確認しますか。",options:o.options,optionsJa:o.options,correctIndex:o.correctIndex,explanation:`Dialog menyebut ${w.w}.`,explanationJa:`音声では「${w.w}」と言っています。`,audioText:audio,audioVoice:i%2===0?"female":"male"};}
   const day=days[(i+ch.number)%days.length],audio=advanced?`この課の活動についてお知らせします。活動は${day}の${time}から、${place}で行います。受付は開始15分前からですので、時間に余裕をもって来てください。`:`この課の活動についてのお知らせです。活動は${day}の${time}から、${place}で行います。`;const o=opts(place,places,i);return{...b,subcategory:"announcement-instruction",prompt:"Kegiatan diadakan di mana?",promptJa:"活動は どこで ありますか。",options:o.options,optionsJa:o.options,correctIndex:o.correctIndex,explanation:`Lokasi yang disebut adalah ${place}.`,explanationJa:`場所は「${place}」です。`,audioText:audio,audioVoice:i%2===0?"female":"male"};
  }
  const place=places[(i+ch.number)%places.length],time=times[(i*2+ch.number)%times.length],day=days[(i+ch.number)%days.length];
  if(i%8===3){const text=advanced?`【この課のお知らせ】${day}の${time}から${place}で活動があります。参加する人は10分前に来てください。雨の場合も場所は変わりません。\n活動はどこでありますか。`:`【この課のお知らせ】${day}の${time}から${place}で活動があります。参加する人は10分前に来てください。\n活動はどこでありますか。`;const o=opts(place,places,i);return{...b,subcategory:"information-search",prompt:text,promptJa:text,options:o.options,optionsJa:o.options,correctIndex:o.correctIndex,explanation:`場所は ${place}.`,explanationJa:`本文の場所は「${place}」です。`};}
  const text=advanced?`【この課のメモ】${day}は${w.w}について勉強します。始まる時間は${time}です。前半は説明を聞き、後半はペアで練習します。\n何について勉強しますか。`:`【この課のメモ】${day}は${w.w}について勉強します。始まる時間は${time}です。\n何について勉強しますか。`;const o=opts(w.w,words.map(x=>x.w),i);return{...b,subcategory:"reading-content",prompt:text,promptJa:text,options:o.options,optionsJa:o.options,correctIndex:o.correctIndex,explanation:`Memo membahas ${w.w}.`,explanationJa:`本文では「${w.w}」について勉強します。`};
 });
}
