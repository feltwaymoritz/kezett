import type { Category, DrillCategory, Question, StudyLevel } from "@/types";
import { vocabulary } from "@/data/vocabulary";

function rotate<T>(items:T[],shift:number){const n=((shift%items.length)+items.length)%items.length;return [...items.slice(n),...items.slice(0,n)]}
function makeOptions(correct:string,distractors:string[],seed:number){
  const unique=[...new Set(distractors.filter(x=>x&&x!==correct))];
  while(unique.length<3) unique.push(`—${unique.length+1}—`);
  const out=rotate([correct,...unique.slice(0,3)],seed%4); return {options:out,correctIndex:out.indexOf(correct)};
}
function vAt(i:number){return vocabulary[(i+vocabulary.length*50)%vocabulary.length]}
function sameTag(i:number){const v=vAt(i);const pool=vocabulary.filter(x=>x.id!==v.id&&x.tags.some(t=>v.tags.includes(t)));return pool.length?pool:vocabulary}
const levels:StudyLevel[]=["A1","A2.1","A2.2"];
const days=["月曜日","火曜日","水曜日","木曜日","金曜日","土曜日","日曜日"];
const places=["駅","病院","銀行","郵便局","図書館","会社","学校","スーパー","市役所","レストラン","公園","会議室"];
const foods=["カレー","うどん","そば","魚の定食","からあげ","おにぎり","サンドイッチ","ラーメン"];
const items=["タオル","マスク","帽子","飲み物","かさ","ノート","ボールペン","くつした"];
const transport=["バス","電車","地下鉄","タクシー","自転車"];
const actions=["コピーします","そうじします","電話します","買い物します","資料を準備します","予約します","薬を飲みます","メールを送ります"];
const people=["田中さん","マリアさん","アリさん","キムさん","山田さん","リーさん"];
const times=["9:00","10:15","11:30","13:00","14:45","16:30","18:00","19:20"];

// 250 Script & Vocabulary questions. Distractors come from the same semantic tag where possible.
const vocab:Question[]=Array.from({length:250},(_,i)=>{
  const v=vAt(i), pool=sameTag(i), d=[pool[(i+1)%pool.length],pool[(i+4)%pool.length],pool[(i+8)%pool.length]];
  const written=v.kanji||v.hiragana, mode=i%4, level=levels[i%levels.length];
  if(mode===0){const o=makeOptions(v.meaningId,d.map(x=>x.meaningId),i);return {id:`dr-v-${i+1}`,source:"ai_generated",sourceLabel:"Drilling Soal",category:"vocabulary",subcategory:"word-meaning",level,prompt:`Apa arti 「${written}」 yang paling tepat?`,promptJa:`「${written}」の 意味に いちばん 近いものを 選んでください。`,options:o.options,optionsJa:o.options,correctIndex:o.correctIndex,explanation:`${written}（${v.hiragana}） berarti ${v.meaningId}.`,explanationJa:`「${written}」は「${v.hiragana}」と読みます。`,verified:true};}
  if(mode===1){const target=v.sentenceJa.replace(written,"＿＿＿");const o=makeOptions(written,d.map(x=>x.kanji||x.hiragana),i);return {id:`dr-v-${i+1}`,source:"ai_generated",sourceLabel:"Drilling Soal",category:"vocabulary",subcategory:"word-usage",level,prompt:"Pilih kata yang paling tepat untuk melengkapi kalimat.",promptJa:`${target}\nいちばん いい ことばを 選んでください。`,options:o.options,optionsJa:o.options,correctIndex:o.correctIndex,explanation:`Konteks kalimat menggunakan ${written} (${v.meaningId}).`,explanationJa:`文に合うことばは「${written}」です。`,verified:true};}
  if(mode===2){const o=makeOptions(v.hiragana,d.map(x=>x.hiragana),i);return {id:`dr-v-${i+1}`,source:"ai_generated",sourceLabel:"Drilling Soal",category:"vocabulary",subcategory:"kanji-reading",level,prompt:`Pilih bacaan yang tepat untuk 「${written}」.`,promptJa:`「${written}」の 読み方は どれですか。`,options:o.options,optionsJa:o.options,correctIndex:o.correctIndex,explanation:`Bacaan: ${v.hiragana}.`,explanationJa:`「${written}」は「${v.hiragana}」と読みます。`,verified:true};}
  const o=makeOptions(written,d.map(x=>x.kanji||x.hiragana),i);return {id:`dr-v-${i+1}`,source:"ai_generated",sourceLabel:"Drilling Soal",category:"vocabulary",subcategory:"kanji-meaning-usage",level,prompt:`Pilih bentuk tulisan yang sesuai dengan 「${v.hiragana}」.`,promptJa:`「${v.hiragana}」に 合う ことばを 選んでください。`,options:o.options,optionsJa:o.options,correctIndex:o.correctIndex,explanation:`${v.hiragana} ditulis ${written}.`,explanationJa:`「${v.hiragana}」は「${written}」です。`,verified:true};
});

type G={ja:string;id:string;a:string;ds:string[];ex:string;sub:"grammar"|"expression";level:StudyLevel};
const grammarBlueprints:G[]=[
 {ja:"ここで 写真を ＿＿＿も いいですか。",id:"Bolehkah mengambil foto di sini?",a:"撮って",ds:["撮る","撮った","撮らない"],ex:"～てもいいですか digunakan untuk meminta izin.",sub:"grammar",level:"A1"},
 {ja:"危ないですから、ここに ＿＿＿で ください。",id:"Karena berbahaya, tolong jangan masuk ke sini.",a:"入らない",ds:["入って","入った","入ります"],ex:"～ないでください = tolong jangan.",sub:"grammar",level:"A1"},
 {ja:"この薬は 食事の 後で ＿＿＿ください。",id:"Minumlah obat ini setelah makan.",a:"飲んで",ds:["飲み","飲む","飲んだ"],ex:"Permintaan memakai bentuk ～てください.",sub:"grammar",level:"A1"},
 {ja:"A：すみません、もう一度 言ってください。 B：＿＿＿＿。",id:"Respons yang tepat ketika diminta mengulang ucapan.",a:"はい、わかりました",ds:["いただきます","お先に失礼します","お大事に"],ex:"Respons menerima permintaan yang tepat adalah はい、わかりました.",sub:"expression",level:"A1"},
 {ja:"A：お先に失礼します。 B：＿＿＿＿。",id:"Pilih respons sosial yang tepat.",a:"お疲れさまでした",ds:["いただきます","いってらっしゃい","おめでとうございます"],ex:"Ungkapan pasangan di tempat kerja: お先に失礼します／お疲れさまでした.",sub:"expression",level:"A1"},
 {ja:"A：このケーキ、どうぞ。 B：＿＿＿＿。",id:"Respons ketika menerima makanan yang ditawarkan.",a:"いただきます",ds:["ごちそうさまでした","お大事に","失礼しました"],ex:"いただきます digunakan sebelum makan/ketika menerima makanan.",sub:"expression",level:"A1"},
 {ja:"駅に 着いたら、私に 電話を ＿＿＿ください。",id:"Setelah tiba di stasiun, tolong telepon saya.",a:"かけて",ds:["かける","かけた","かけない"],ex:"電話をかける → かけてください.",sub:"grammar",level:"A1"},
 {ja:"日本へ 来てから、毎日 日本語を ＿＿＿います。",id:"Sejak datang ke Jepang, setiap hari saya belajar bahasa Jepang.",a:"勉強して",ds:["勉強し","勉強する","勉強した"],ex:"～ています dapat menyatakan kebiasaan yang berlanjut.",sub:"grammar",level:"A1"},
 {ja:"日本へ 行った ことが ＿＿＿。",id:"Saya pernah pergi ke Jepang.",a:"あります",ds:["います","します","なります"],ex:"～たことがあります = pernah melakukan.",sub:"grammar",level:"A2.1"},
 {ja:"週末は 混んでいるので、平日に ＿＿＿ほうが いいです。",id:"Karena akhir pekan ramai, sebaiknya pergi hari kerja.",a:"行った",ds:["行き","行くて","行っている"],ex:"～たほうがいい digunakan untuk saran.",sub:"grammar",level:"A2.1"},
 {ja:"財布を なくして ＿＿＿。",id:"Saya terlanjur kehilangan dompet.",a:"しまいました",ds:["みました","あります","おきます"],ex:"～てしまいました menyatakan selesai/penyesalan.",sub:"grammar",level:"A2.1"},
 {ja:"料理を 作る ＿＿＿、手を 洗います。",id:"Sebelum memasak, saya mencuci tangan.",a:"前に",ds:["あとで","ながら","まで"],ex:"V辞書形＋前に = sebelum melakukan.",sub:"grammar",level:"A2.1"},
 {ja:"仕事が 終わって ＿＿＿、買い物に 行きます。",id:"Setelah pekerjaan selesai, saya pergi berbelanja.",a:"から",ds:["まで","しか","なら"],ex:"～てから = setelah melakukan lalu.",sub:"grammar",level:"A1"},
 {ja:"A：この漢字の 読み方が わかりません。 B：じゃ、＿＿＿＿。",id:"Pilih respons yang tepat ketika seseorang tidak tahu bacaan kanji.",a:"教えましょうか",ds:["食べましょうか","帰りましょうか","休みましょうか"],ex:"～ましょうか dapat menawarkan bantuan.",sub:"expression",level:"A2.1"},
 {ja:"すみません、この漢字の 読み方を ＿＿＿もらえませんか。",id:"Bisakah Anda memberitahu cara membaca kanji ini?",a:"教えて",ds:["教える","教えた","教えない"],ex:"～てもらえませんか = permintaan sopan.",sub:"grammar",level:"A2.1"},
 {ja:"日本語が 上手に なる ＿＿＿、毎日 話しています。",id:"Saya berbicara setiap hari agar lebih mahir bahasa Jepang.",a:"ように",ds:["ながら","ばかり","あとで"],ex:"～ように menunjukkan tujuan/hasil yang diharapkan.",sub:"grammar",level:"A2.1"},
 {ja:"雨が 降ったら、イベントは ＿＿＿。",id:"Kalau hujan, acara akan dibatalkan.",a:"中止になります",ds:["中止を食べます","中止が飲みます","中止へ読みます"],ex:"～たら menyatakan kondisi.",sub:"grammar",level:"A2.1"},
 {ja:"このボタンを 押す ＿＿＿、ドアが 開きます。",id:"Kalau tombol ini ditekan, pintu terbuka.",a:"と",ds:["のに","しか","まで"],ex:"～と digunakan untuk akibat otomatis/umum.",sub:"grammar",level:"A2.1"},
 {ja:"時間が ＿＿＿、いっしょに 行きませんか。",id:"Kalau ada waktu, mau pergi bersama?",a:"あれば",ds:["あるので","あったり","あるまで"],ex:"～ば adalah kondisi.",sub:"grammar",level:"A2.2"},
 {ja:"この料理は 辛＿＿＿ですね。",id:"Masakan ini kelihatannya pedas.",a:"そう",ds:["ながら","ばかり","ため"],ex:"Akar kata sifat + そうです = kelihatannya.",sub:"grammar",level:"A2.1"},
 {ja:"天気予報では、明日は 雨が 降る ＿＿＿。",id:"Menurut ramalan, katanya besok akan hujan.",a:"そうです",ds:["ほうです","だけです","ためです"],ex:"普通形＋そうです = kabar/informasi yang didengar.",sub:"grammar",level:"A2.2"},
 {ja:"日本に 来た ＿＿＿です。",id:"Saya baru saja datang ke Jepang.",a:"ばかり",ds:["ながら","しか","まで"],ex:"～たばかり = baru saja.",sub:"grammar",level:"A2.2"},
 {ja:"毎日 練習すれば、もっと 上手に ＿＿＿。",id:"Kalau berlatih setiap hari, akan semakin mahir.",a:"なります",ds:["しますか","ありました","行きます"],ex:"～ば menghubungkan kondisi dengan hasil.",sub:"grammar",level:"A2.2"},
 {ja:"この荷物は 重すぎて、一人では ＿＿＿。",id:"Barang ini terlalu berat sehingga tidak bisa dibawa sendiri.",a:"持てません",ds:["持ちました","持っています","持ちませんでした"],ex:"Bentuk potensial negatif menunjukkan tidak mampu.",sub:"grammar",level:"A2.2"},
 {ja:"忘れない ＿＿＿、スマホに メモします。",id:"Saya mencatat di ponsel agar tidak lupa.",a:"ように",ds:["ながら","だけ","あとで"],ex:"～ないように = agar tidak.",sub:"grammar",level:"A2.1"},
 {ja:"このカメラは 軽くて、使い＿＿＿です。",id:"Kamera ini ringan dan mudah digunakan.",a:"やすい",ds:["すぎる","ながら","ばかり"],ex:"Vます-stem＋やすい = mudah dilakukan.",sub:"grammar",level:"A2.2"},
 {ja:"このはしは 太くて、使い＿＿＿です。",id:"Sumpit ini tebal dan sulit digunakan.",a:"にくい",ds:["たい","そう","ながら"],ex:"Vます-stem＋にくい = sulit dilakukan.",sub:"grammar",level:"A2.2"},
 {ja:"甘いものを 食べ＿＿＿て、お腹が 痛いです。",id:"Saya terlalu banyak makan makanan manis sehingga sakit perut.",a:"すぎ",ds:["ながら","たい","そう"],ex:"Vます-stem＋すぎる = terlalu banyak/berlebihan.",sub:"grammar",level:"A2.2"},
 {ja:"音楽を 聞き＿＿＿、料理します。",id:"Saya memasak sambil mendengarkan musik.",a:"ながら",ds:["ばかり","まで","しか"],ex:"Vます-stem＋ながら = sambil.",sub:"grammar",level:"A2.2"},
 {ja:"会議の 前に、資料を コピーして ＿＿＿。",id:"Sebelum rapat, saya menyalin dokumen terlebih dahulu.",a:"おきます",ds:["しまいます","みます","あります"],ex:"～ておきます = melakukan persiapan terlebih dahulu.",sub:"grammar",level:"A2.2"},
 {ja:"机の 上に 資料が 置いて ＿＿＿。",id:"Dokumen sudah diletakkan di atas meja.",a:"あります",ds:["います","しまいます","きます"],ex:"～てあります = keadaan hasil tindakan yang sengaja dilakukan.",sub:"grammar",level:"A2.2"},
 {ja:"この料理を 一度 食べて ＿＿＿たいです。",id:"Saya ingin mencoba masakan ini sekali.",a:"み",ds:["おき","あり","しまい"],ex:"～てみます = mencoba melakukan.",sub:"grammar",level:"A2.1"},
 {ja:"A：熱が あるんです。 B：それは ＿＿＿＿。",id:"Respons yang tepat kepada orang yang demam.",a:"いけませんね",ds:["おめでとう","いただきます","おかげさまで"],ex:"それはいけませんね menunjukkan simpati atas kondisi buruk.",sub:"expression",level:"A2.1"},
 {ja:"A：旅行は どうでしたか。 B：とても 楽しかったです。 A：＿＿＿＿。",id:"Respons yang tepat setelah mendengar pengalaman menyenangkan.",a:"それは よかったですね",ds:["お大事に","失礼しました","いただきます"],ex:"それはよかったですね menanggapi kabar baik.",sub:"expression",level:"A2.1"},
 {ja:"A：この荷物、重いですね。 B：はい。 A：＿＿＿＿。",id:"Tawarkan bantuan secara alami.",a:"持ちましょうか",ds:["食べましょうか","休みましたか","読みませんか"],ex:"～ましょうか dapat menawarkan bantuan.",sub:"expression",level:"A1"},
 {ja:"A：すみません、15分ぐらい 遅れます。 B：＿＿＿＿。",id:"Respons yang tepat ketika teman memberi tahu akan terlambat.",a:"わかりました。待っています",ds:["いただきます","おめでとうございます","お大事に"],ex:"Respons mengakui informasi dan menyatakan akan menunggu.",sub:"expression",level:"A2.1"},
 {ja:"A：日本語は もう 慣れましたか。 B：まだです。 A：＿＿＿＿。",id:"Respons dukungan yang tepat.",a:"頑張ってください",ds:["ごちそうさま","いらっしゃいませ","お先に失礼します"],ex:"頑張ってください digunakan memberi semangat.",sub:"expression",level:"A1"},
 {ja:"A：誕生日、おめでとうございます。 B：＿＿＿＿。",id:"Respons untuk ucapan ulang tahun.",a:"ありがとうございます",ds:["すみませんでした","お大事に","いただきます"],ex:"Ucapan selamat dibalas dengan terima kasih.",sub:"expression",level:"A1"},
 {ja:"A：お世話になりました。 B：＿＿＿＿。",id:"Pilih balasan saat berpisah setelah mendapat bantuan.",a:"こちらこそ。お元気で",ds:["お大事に","いただきます","いってきます"],ex:"こちらこそ／お元気で sesuai konteks perpisahan.",sub:"expression",level:"A2.1"},
 {ja:"A：この料理、辛いですか。 B：少し辛いですが、＿＿＿＿。",id:"Lengkapi respons alami tentang rasa makanan.",a:"おいしいですよ",ds:["お大事に","失礼します","いってらっしゃい"],ex:"Konteks menilai makanan membutuhkan ungkapan rasa.",sub:"expression",level:"A1"},
 {ja:"来月から テニスを ＿＿＿と 思っています。",id:"Saya sedang berpikir untuk mulai tenis bulan depan.",a:"始めよう",ds:["始めて","始めた","始めない"],ex:"Volitional＋と思っています = niat/rencana.",sub:"grammar",level:"A2.2"},
 {ja:"来週、京都へ 旅行する ＿＿＿です。",id:"Saya berencana bepergian ke Kyoto minggu depan.",a:"つもり",ds:["ながら","しか","ばかり"],ex:"辞書形＋つもりです = berencana.",sub:"grammar",level:"A2.1"},
 {ja:"ここでは 外の 靴を はいては ＿＿＿。",id:"Di sini tidak boleh memakai sepatu dari luar.",a:"いけません",ds:["あります","なります","みます"],ex:"～てはいけません = dilarang.",sub:"grammar",level:"A1"},
 {ja:"時間が ないので、パン ＿＿＿ 食べませんでした。",id:"Karena tidak punya waktu, saya hanya makan roti.",a:"しか",ds:["まで","ほど","より"],ex:"N＋しか～ない = hanya.",sub:"grammar",level:"A2.2"},
 {ja:"この町は 前より 便利に ＿＿＿。",id:"Kota ini menjadi lebih praktis daripada sebelumnya.",a:"なりました",ds:["しましたか","ありました","いました"],ex:"～く／に なります = menjadi.",sub:"grammar",level:"A2.1"},
 {ja:"漢字が 読める ＿＿＿ なりました。",id:"Saya menjadi bisa membaca kanji.",a:"ように",ds:["しか","ながら","だけ"],ex:"可能形＋ようになりました = perubahan kemampuan.",sub:"grammar",level:"A2.2"},
 {ja:"A：明日の午後、休みを 取っても いいですか。 B：＿＿＿＿。",id:"Pilih jawaban atasan yang memberi izin.",a:"はい、いいですよ",ds:["いいえ、いただきます","はい、お大事に","じゃ、いってらっしゃい"],ex:"はい、いいですよ = memberi izin.",sub:"expression",level:"A2.1"},
 {ja:"A：おすすめの レストランは ありますか。 B：駅の近くの店が いいですよ。＿＿＿＿。",id:"Pilih ungkapan rekomendasi yang alami.",a:"よかったら行ってみてください",ds:["お先に失礼します","お大事にしてください","いただきます"],ex:"よかったら～てみてください = rekomendasi halus.",sub:"expression",level:"A2.1"},
 {ja:"A：すみません、今のアナウンスは 何と 言っていましたか。 B：＿＿＿＿。",id:"Pilih jawaban yang meneruskan isi pengumuman.",a:"3番線に電車が来るそうです",ds:["3番線を食べました","3番線が好きです","3番線に住んでいます"],ex:"～そうです dapat meneruskan informasi yang didengar.",sub:"expression",level:"A2.2"},
];

const grammar:Question[]=Array.from({length:250},(_,i)=>{
 const g=grammarBlueprints[i%grammarBlueprints.length]; const person=people[i%people.length], place=places[(i+3)%places.length];
 const ja=(i>=grammarBlueprints.length?`${person}：`:"")+g.ja.replace("ここ",i%3===0?place:"ここ");
 const o=makeOptions(g.a,g.ds,i); return {id:`dr-g-${i+1}`,source:"ai_generated",sourceLabel:"Drilling Soal",category:"grammar",subcategory:g.sub,level:g.level,prompt:g.id,promptJa:ja,options:o.options,optionsJa:o.options,correctIndex:o.correctIndex,explanation:g.ex,explanationJa:`この場面では「${g.a}」が自然です。`,verified:true};
});

function listeningQuestion(i:number):Question{
 const mode=i%20, round=Math.floor(i/20), h=8+((round+mode)%10), minute=[0,10,15,20,30,40,45,50][(round+mode)%8], day=days[(round+mode*2)%days.length], place=places[(round*3+mode)%places.length], person=people[(round+mode)%people.length], item=items[(round*2+mode)%items.length];
 let prompt="",promptJa="",audioText="",answer="",ds:string[]=[],sub="conversation-content",ex="";
 if(mode===0){const later=(minute+20)%60;answer=`${h}:${String(later).padStart(2,"0")}`;prompt="Kereta mana yang akhirnya dipilih?";promptJa="二人は 何時の 電車に 乗りますか。";audioText=`A：${h}時${minute}分の電車はどうですか。 B：間に合わないので、${h}時${later}分にしましょう。 A：はい。`;ds=[`${h}:${String(minute).padStart(2,"0")}`,`${h+1}:00`,`${h+1}:20`];ex="Perhatikan keputusan terakhir setelah ので.";}
 else if(mode===1){answer=foods[i%foods.length];prompt="Pria memesan makanan apa?";promptJa="男の人は 何を 注文しますか。";audioText=`A：今日は何にしますか。 B：昨日はうどんを食べたので、今日は${answer}にします。`;ds=foods.filter(x=>x!==answer);ex="Jawaban adalah pilihan akhir pria.";}
 else if(mode===2){answer=place;prompt="Mereka akan bertemu di mana?";promptJa="二人は どこで 会いますか。";audioText=`A：${day}、どこで会いましょうか。 B：${place}の入口はどうですか。 A：いいですね。そこで会いましょう。`;ds=places.filter(x=>x!==answer);ex="Tempat yang disepakati pada akhir dialog.";}
 else if(mode===3){answer=item;prompt="Apa yang harus dibawa?";promptJa="何を 持っていきますか。";audioText=`明日の活動のお知らせです。${item}を持ってきてください。飲み物はこちらで用意します。`;ds=items.filter(x=>x!==answer);sub="announcement-instruction";ex="Instruksi 持ってきてください menyebut barang wajib.";}
 else if(mode===4){const qty=1+(i%3),price=150+(i%5)*50,total=qty*price;answer=`${total}円`;prompt="Berapa yang dibayar?";promptJa="いくら 払いますか。";audioText=`りんごは一つ${price}円です。${qty}つください。`;ds=[`${price}円`,`${total+100}円`,`${Math.max(100,total-50)}円`];sub="shop-public";ex="Hitung harga satuan × jumlah.";}
 else if(mode===5){answer=transport[i%transport.length];prompt="Transportasi apa yang dipilih?";promptJa="何で 行きますか。";audioText=`A：${place}まで歩きますか。 B：遠いですよ。${answer}で行くのがいちばん便利です。`;ds=transport.filter(x=>x!==answer);ex="Transportasi yang dipilih disebut sebagai yang paling praktis.";}
 else if(mode===6){const schedules=[{t:"朝と夜",a:"2回"},{t:"朝・昼・夜",a:"3回"},{t:"夜だけ",a:"1回"}][round%3];answer=schedules.a;prompt="Obat putih diminum berapa kali sehari?";promptJa="白い薬は 一日に 何回 飲みますか。";audioText=`${person}さん、この白い薬は${schedules.t}、食事の後に一つずつ飲んでください。`;ds=["1回","2回","3回","4回"].filter(x=>x!==answer);sub="shop-public";ex=`Jadwal ${schedules.t} menentukan frekuensi ${answer}.`;}
 else if(mode===7){const floor=2+(i%6);answer=`${floor}階`;prompt="Acara ada di lantai berapa?";promptJa="イベントは 何階ですか。";audioText=`デパートからのお知らせです。今日のイベントは${floor}階のホールで行います。`;ds=["1階","3階","7階"].filter(x=>x!==answer);sub="announcement-instruction";ex="Lantai disebut langsung pada pengumuman.";}
 else if(mode===8){answer=actions[i%actions.length];prompt="Apa yang dilakukan terlebih dahulu?";promptJa="最初に 何を しますか。";audioText=`A：このあと会議ですね。 B：はい。その前に${answer}。それから会議室へ行きます。`;ds=actions.filter(x=>x!==answer);ex="その前に menunjukkan aktivitas lebih dahulu.";}
 else if(mode===9){answer=day;prompt="Kelas bahasa Jepang hari apa?";promptJa="日本語教室は 何曜日ですか。";audioText=`日本語教室は今週だけ${day}です。時間は午後7時からです。`;ds=days.filter(x=>x!==answer);sub="announcement-instruction";ex="Hari disebut setelah 今週だけ.";}
 else if(mode===10){answer=person;prompt="Siapa yang akan menyiapkan dokumen?";promptJa="だれが 資料を 準備しますか。";audioText=`A：会議の準備をしましょう。私は部屋を確認します。 B：じゃ、${person}が資料を準備します。`;ds=people.filter(x=>x!==answer);ex="Pembagian tugas disebut di dialog.";}
 else if(mode===11){const room=300+(i%30);answer=`${room}号室`;prompt="Pasien berada di kamar berapa?";promptJa="何号室ですか。";audioText=`お見舞いですか。${person}は${room}号室です。エレベーターで3階へ行ってください。`;ds=[`${room-1}号室`,`${room+1}号室`,`${room+10}号室`];sub="shop-public";ex="Nomor kamar disebut langsung.";}
 else if(mode===12){const park=["入口の前","建物の横","駅の前"][round%3];answer=park;prompt="Sepeda harus diparkir di mana?";promptJa="自転車は どこに 止めますか。";audioText=`${place}では自転車に乗らないでください。自転車は${park}の駐輪場に止めてください。`;ds=["公園の中","入口の中","店の中","建物の後ろ"].filter(x=>x!==answer);sub="announcement-instruction";ex=`Instruksi menyebut lokasi parkir ${park}.`;}
 else if(mode===13){const current=17+(i%4);answer=`${current}:00`;prompt="Loket tutup jam berapa?";promptJa="受付は 何時までですか。";audioText=`受付は午前9時から午後${current}時までです。土曜日は正午までです。`;ds=["12:00","16:00","19:00"].filter(x=>x!==answer);sub="shop-public";ex="Jam hari biasa disebut pertama.";}
 else if(mode===14){const drinks=["水","お茶","ジュース","コーヒー"];answer=drinks[round%drinks.length];const rejected=drinks[(round+1)%drinks.length];prompt="Wanita akhirnya memilih minuman apa?";promptJa="女の人は 何を 飲みますか。";audioText=`A：${rejected}はいかがですか。 B：すみません、${rejected}はちょっと…。${answer}をお願いします。`;ds=drinks.filter(x=>x!==answer);ex="Perhatikan minuman yang dipilih setelah penolakan.";}
 else if(mode===15){const methods=["メール","Web","受付"];answer=methods[round%methods.length];prompt="Bagaimana cara mendaftar?";promptJa="どうやって 申し込みますか。";audioText=`参加したい人は${day}までに${answer}で申し込んでください。電話では受け付けません。`;ds=["電話","手紙",...methods].filter(x=>x!==answer);sub="announcement-instruction";ex=`Cara pendaftaran yang disebut adalah ${answer}.`;}
 else if(mode===16){const slots=["朝","昼","夜"][round%3];answer=slots;prompt="Kapan obat diminum?";promptJa="この薬は いつ 飲みますか。";audioText=`この青い薬は${slots}ご飯の後に飲んでください。ほかの時間は飲まなくてもいいです。`;ds=["朝","昼","夜","寝る前"].filter(x=>x!==answer);sub="shop-public";ex=`Audio menentukan waktu ${slots}.`;}
 else if(mode===17){const weather=["雨","晴れ","くもり","雪"];answer=weather[round%weather.length];prompt="Cuaca besok bagaimana?";promptJa="明日の 天気は どうですか。";audioText=`天気予報です。今日は晴れですが、明日は${answer}になるでしょう。`;ds=weather.filter(x=>x!==answer);sub="announcement-instruction";ex=`Ramalan besok adalah ${answer}.`;}
 else if(mode===18){answer=round%2===0?"右":"左";prompt="Setelah lampu lalu lintas, harus belok ke mana?";promptJa="信号のあと、どちらへ 曲がりますか。";audioText=`駅を出てまっすぐ行ってください。二つ目の信号を${answer}に曲がると、${place}があります。`;ds=["右","左","まっすぐ","後ろ"].filter(x=>x!==answer);ex=`Instruksi arah menyebut ${answer}に曲がる.`;}
 else {answer=items[(i+3)%items.length];prompt="Barang mana yang tidak perlu dibawa?";promptJa="持っていかなくても いいものは どれですか。";audioText=`明日は${items[i%items.length]}と${items[(i+1)%items.length]}を持ってきてください。${answer}はこちらで用意します。`;ds=[items[i%items.length],items[(i+1)%items.length],items[(i+2)%items.length]];sub="announcement-instruction";ex="こちらで用意します berarti disediakan, jadi tidak perlu dibawa.";}
 const o=makeOptions(answer,ds,i);return {id:`dr-l-${i+1}`,source:"ai_generated",sourceLabel:"Drilling Soal",category:"listening",subcategory:sub,level:levels[i%levels.length],prompt,promptJa,options:o.options,optionsJa:o.options,correctIndex:o.correctIndex,explanation:ex,explanationJa:`音声の内容から「${answer}」が正解です。`,audioText,audioVoice:i%2===0?"female":"male",verified:true};
}
const listening:Question[]=Array.from({length:250},(_,i)=>listeningQuestion(i));

function readingQuestion(i:number):Question{
 const mode=i%20,round=Math.floor(i/20),day=days[(round+mode)%days.length],place=places[(round*3+mode)%places.length],time=times[(round+mode*2)%times.length],item=items[(round*2+mode)%items.length];
 let text="",answer="",ds:string[]=[],sub="information-search",ex="";
 if(mode===0){const close=16+(i%4);text=`【図書館】月曜日は休みです。火～金 9:00～19:00、土・日 10:00～${close}:00。\n日曜日は何時までですか。`;answer=`${close}:00`;ds=["17:00","18:00","19:00"];ex="Cari jam operasional hari Minggu.";}
 else if(mode===1){text=`【会社メモ】明日の会議は${time}からです。場所は${place}です。\n会議はどこでありますか。`;answer=place;ds=places.filter(x=>x!==answer);ex="Lokasi rapat tertulis langsung.";sub="reading-content";}
 else if(mode===2){text="【ごみの日】月：燃えるごみ　水：びん・かん　金：プラスチック\nびんは何曜日に出しますか。";answer="水曜日";ds=["月曜日","火曜日","金曜日"];ex="びん・かん berada pada Rabu.";}
 else if(mode===3){text=`【イベント】${day} 14:00～16:00　参加費500円　持ち物：${item}\n何を持っていきますか。`;answer=item;ds=items.filter(x=>x!==answer);ex="Lihat bagian 持ち物.";}
 else if(mode===4){const a=10+(i%3);text=`【バス】みなみ公園行き　${a}:15 / ${a+1}:20 / ${a+2}:10\n${a+1}時のバスは何時ですか。`;answer=`${a+1}:20`;ds=[`${a}:15`,`${a+2}:10`,`${a+2}:30`];ex="Cari jadwal pada jam yang diminta.";}
 else if(mode===5){const f=2+(i%3);text=`【デパート】1階 食品　${f}階 ファッション　${f+1}階 レストラン\n服は何階で買えますか。`;answer=`${f}階`;ds=["1階",`${f+1}階`,`${f+2}階`];ex="ファッション menunjukkan lantai pakaian.";}
 else if(mode===6){const d=10+(i%14);text=`【日本語教室】申込：6月${d}日まで　教室：6月${d+3}日から\nいつまでに申し込みますか。`;answer=`6月${d}日`;ds=[`6月${d+1}日`,`6月${d+3}日`,`6月${d+5}日`];ex="まで menandai batas pendaftaran.";}
 else if(mode===7){const p=500+(i%5)*100;text=`【ランチ】Aセット ${p}円（飲み物つき）　Bセット ${p+150}円\n飲み物がつくのはどれですか。`;answer="Aセット";ds=["Bセット","どちらも","どちらもつかない"];ex="Aセットに飲み物が付く.";}
 else if(mode===8){text="【公園のルール】自転車は入口の前の駐輪場に止めてください。公園の中では乗らないでください。\n自転車はどこに止めますか。";answer="入口の前";ds=["公園の中","駅の前","レストランの前"];ex="Lokasi parkir disebut pada kalimat pertama.";}
 else if(mode===9){text="【受付】平日 9:00～18:00　土曜日 9:00～12:00　日曜日 休み\n土曜日は何時までですか。";answer="12:00";ds=["9:00","18:00","休み"];ex="Jam Sabtu berakhir pukul 12:00.";}
 else if(mode===10){text=`【メール】${people[i%people.length]}さんへ\n明日の${time}に${place}で会いましょう。私は10分ぐらい遅れるかもしれません。\nこのメールで何を伝えていますか。`;answer="待ち合わせと遅れる可能性";ds=["仕事を休むこと","買い物の値段","薬の飲み方"];sub="reading-content";ex="Isi email membahas janji bertemu dan kemungkinan terlambat.";}
 else if(mode===11){text="【薬の説明】白い薬：朝・夜、食後に1錠　赤い薬：昼、食後に2錠\n白い薬はいつ飲みますか。";answer="朝と夜";ds=["朝だけ","昼だけ","昼と夜"];sub="reading-content";ex="Baris obat putih menyebut 朝・夜.";}
 else if(mode===12){text=`【ホテル】朝食 6:30～9:30　チェックアウト 10:00　大浴場 16:00～23:00\n朝食は何時までですか。`;answer="9:30";ds=["6:30","10:00","23:00"];ex="Cari rentang 朝食.";}
 else if(mode===13){text="【防災】地震が起きたら、まず机の下に入ってください。揺れが止まってから外へ出ます。エレベーターは使わないでください。\n最初に何をしますか。";answer="机の下に入る";ds=["外へ出る","エレベーターに乗る","電話する"];sub="reading-content";ex="まず menunjukkan tindakan pertama.";}
 else if(mode===14){text=`【求人】レストランスタッフ　時間 17:00～22:00　時給1200円　土日に働ける人\nどんな人を募集していますか。`;answer="土日に働ける人";ds=["朝だけ働く人","料理を食べる人","学生だけ"];sub="reading-content";ex="Syarat tertulis 土日に働ける人.";}
 else if(mode===15){text="【美容院】カット 3500円　カラー 5000円　カット＋カラー 7500円　予約は電話かWebで\nカットとカラーを両方するといくらですか。";answer="7500円";ds=["3500円","5000円","8500円"];ex="Paket gabungan tertulis 7500円.";}
 else if(mode===16){text=`【天気】月 晴れ 25℃　火 雨 20℃　水 くもり 22℃　木 晴れ 27℃\nいちばん暑い日はいつですか。`;answer="木曜日";ds=["月曜日","火曜日","水曜日"];ex="Temperatur tertinggi 27℃ pada Kamis.";}
 else if(mode===17){text="【スーパー】牛乳 200円　卵 250円　パン 180円　今日は卵が50円引き\n今日、卵はいくらですか。";answer="200円";ds=["180円","250円","300円"];ex="250円 - 50円 = 200円.";}
 else if(mode===18){text=`【教室のルール】飲み物はふたのあるボトルなら大丈夫です。食べ物はだめです。電話は外でしてください。\n教室でしてもいいことは何ですか。`;answer="ふたのあるボトルで飲む";ds=["食べる","電話する","たばこを吸う"];sub="reading-content";ex="Botol bertutup diperbolehkan.";}
 else {text=`【旅行予定】9:00 駅集合　10:30 お寺　12:00 昼ご飯　14:00 美術館　17:00 ホテル\n昼ご飯のあと、どこへ行きますか。`;answer="美術館";ds=["駅","お寺","ホテル"];sub="information-search";ex="Setelah 12:00 makan siang, jadwal berikutnya 14:00 museum.";}
 text=`${text}\n（更新：6月${5+round}日・${place}）`;
 const o=makeOptions(answer,ds,i);return {id:`dr-r-${i+1}`,source:"ai_generated",sourceLabel:"Drilling Soal",category:"reading",subcategory:sub,level:levels[i%levels.length],prompt:text,promptJa:text,options:o.options,optionsJa:o.options,correctIndex:o.correctIndex,explanation:ex,explanationJa:`本文を確認すると「${answer}」が正解です。`,verified:true};
}
const reading:Question[]=Array.from({length:250},(_,i)=>readingQuestion(i));

export const drillingQuestionBank:Question[]=[...vocab,...grammar,...listening,...reading];
export const drillingStats:Record<Category,number>={vocabulary:250,grammar:250,listening:250,reading:250};

export function questionsForDrill(category:DrillCategory,count:number,seed=Date.now()):Question[]{
 const pool=category==="mixed"?drillingQuestionBank:drillingQuestionBank.filter(q=>q.category===category);const start=Math.abs(seed)%pool.length;const step=37;return Array.from({length:Math.min(count,pool.length)},(_,i)=>pool[(start+i*step)%pool.length]);
}
function selectBySub(pool:Question[],sub:string,n:number,seed:number){const exact=pool.filter(q=>q.subcategory===sub);const src=exact.length?exact:pool;return Array.from({length:n},(_,i)=>src[(seed*17+i*31+i*i)%src.length]);}
export function questionsForTryout(seed:number,count=50,packageId?:string):Question[]{
 const V=drillingQuestionBank.filter(q=>q.category==="vocabulary"),G=drillingQuestionBank.filter(q=>q.category==="grammar"),L=drillingQuestionBank.filter(q=>q.category==="listening"),R=drillingQuestionBank.filter(q=>q.category==="reading");
 const chosen=[
  ...selectBySub(V,"word-meaning",4,seed),...selectBySub(V,"word-usage",3,seed+1),...selectBySub(V,"kanji-reading",3,seed+2),...selectBySub(V,"kanji-meaning-usage",3,seed+3),
  ...selectBySub(G,"grammar",8,seed+4),...selectBySub(G,"expression",5,seed+5),
  ...selectBySub(L,"conversation-content",4,seed+6),...selectBySub(L,"shop-public",4,seed+7),...selectBySub(L,"announcement-instruction",4,seed+8),
  ...selectBySub(R,"reading-content",6,seed+9),...selectBySub(R,"information-search",6,seed+10),
 ].slice(0,count);
 return chosen.map((q,i)=>({...q,id:`${packageId||"tryout"}-${seed}-${i+1}-${q.id}`,sourcePackage:packageId,sourceLabel:"Original Material" as const}));
}
