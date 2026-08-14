import type { BookChapter, BookResource, StudyLevel } from "@/types";

const SOURCE_ROOT = "https://drive.google.com/drive/folders/1mdmEpMVpp2swbKMvDMi2ywBlIOKS00ic";
const IRODORI_DRIVE = "https://drive.google.com/drive/folders/1jtL8cojxMB0KshmzwAAOmERfuf5Wbud_";

const topicLexicon: Record<string, string[]> = {
  "Starting to Speak Japanese": ["おはようございます","こんにちは","すみません","わかります","もういちど","ゆっくり"],
  "About Myself": ["名前","国","仕事","会社","住みます","日本語"],
  "My Favorite Foods": ["うどん","ご飯","肉","魚","飲み物","注文"],
  "Homes and Workplaces": ["部屋","台所","会社","会議室","机","いす"],
  "Daily Life": ["朝","昼","夜","休憩","時間","仕事"],
  "What I Like to Do": ["趣味","映画","音楽","スポーツ","一緒に","週末"],
  "Walking around Town": ["駅","バス","空港","道","右","左"],
  "At Stores": ["店","値段","円","ください","サイズ","電池"],
  "Holidays": ["休み","映画","温泉","旅行","行きます","楽しい"],
  "My Current Self": ["仕事","働きます","趣味","好き","得意","住みます"],
  "Seasons and Weather": ["春","夏","秋","冬","雨","寒い"],
  "My Town": ["町","便利","にぎやか","郵便局","公園","近い"],
  "Going Out Together": ["約束","遅れます","道に迷います","一緒に","行きます","会います"],
  "Studying Japanese": ["日本語","漢字","読み方","教室","勉強","練習"],
  "Delicious Dishes": ["料理","弁当","肉","野菜","作ります","おいしい"],
  "Communication at Work": ["会議","仕事","休み","終わります","コピー","お願いします"],
  "Healthy Life": ["熱","のど","薬","病院","休みます","健康"],
  "Personal Relationships": ["家族","友達","プレゼント","兄","姉","お祝い"],
  "People around Me": ["先週","来ました","人","まじめ","親切","同僚"],
  "At a Restaurant": ["アレルギー","しょうゆ","注文","食べられません","そのまま","店員"],
  "Let's Go on a Trip": ["予約","旅行","ホテル","早い","観光","写真"],
  "Local Events": ["祭り","会場","雨","屋台","参加","案内"],
  "Annual Events and Manners": ["成人の日","結婚式","服","お祝い","マナー","着ます"],
  "Shopping Wisely": ["ポイントカード","掃除機","軽い","安い","買います","サービス"],
  "Various Services": ["資料","展示","美容院","切ります","受付","予約"],
  "Nature and Environment": ["電気","地震","ごみ","環境","消します","避難"],
  "My Life": ["将来","会社","日本語","前より","できる","夢"],
  "Things you like and things you like doing": ["好き","ドラマ","フットサル","趣味","いちばん","スポーツ"],
  "Where will you live?": ["引っ越し","部屋","エアコン","家賃","住みます","壊れます"],
  "Daily meals": ["自炊","レストラン","料理","毎日","食事","店"],
  "Meeting people": ["友達","隣","座ります","話します","仲良く","人"],
  "Japanese and me": ["日本語","勉強","きっかけ","練習","話します","覚えます"],
  "What do you do in situations like this?": ["メール","救急車","困ります","電話","安全","相談"],
  "Relationships with others": ["結婚","友達","悩み","おめでとう","相談","関係"],
  "Joys of traveling": ["旅行","桜島","写真","観光","景色","行きたい"],
  "Working in Japan": ["仕事","説明","ホール","働きます","面接","会社"],
  "Bahasa Jepang": ["先生","学生","教室","本","聞きます","話します"],
  "Diriku": ["名前","仕事","家族","国","言葉","ペット"],
  "Makanan": ["ご飯","魚","肉","飲み物","料理","店"],
  "Rumah": ["家","部屋","家具","電気製品","近く","広い"],
  "Kehidupan Keseharian": ["朝","昼","夜","時間","仕事","活動"],
  "Hari Libur": ["趣味","イベント","文化","休み","旅行","楽しい"],
  "Kota": ["乗り物","交通","建物","場所","駅","便利"],
  "Belanja": ["買い物","プレゼント","色","サイズ","値段","店"],
  "Perjalanan": ["旅行","ホテル","電車","写真","予約","観光"],
};

const topicGrammar: Record<string, string[]> = {
  "Starting to Speak Japanese": ["～です","～ですか","もう一度お願いします"],
  "About Myself": ["～から来ました","～に住んでいます","～です"],
  "My Favorite Foods": ["～が好きです","～をください","～はどうですか"],
  "Homes and Workplaces": ["～があります／います","～はどこですか","～の中／前／後ろ"],
  "Daily Life": ["～時から～時まで","～ます","～てください"],
  "What I Like to Do": ["～が好きです","～ませんか","～たいです"],
  "Walking around Town": ["～に行きます","～を曲がります","～で行きます"],
  "At Stores": ["～がほしいです","いくらですか","～をください"],
  "Holidays": ["～ました","～たいです","～に行きます"],
  "My Current Self": ["～ています","～が好きです","～ことです"],
  "Seasons and Weather": ["～くなります","～でした","～ので"],
  "My Town": ["～くて／～で","～方を教えてください","～にあります"],
  "Going Out Together": ["～ので","～たことがあります","～ましょう"],
  "Studying Japanese": ["～てもらえませんか","～たいんですが","～方"],
  "Delicious Dishes": ["～を持っていきます","～そうです","～て食べます"],
  "Communication at Work": ["～そうです","～てもいいですか","～てください"],
  "Healthy Life": ["～んです","～ないようにします","～たほうがいいです"],
  "Personal Relationships": ["～てもらいました","～ませんか","～と思います"],
  "People around Me": ["～たばかりです","～そうな人","～ています"],
  "At a Restaurant": ["～ので","～ないでください","～てもいいですか"],
  "Let's Go on a Trip": ["～たほうがいいです","～てよかったです","～つもりです"],
  "Local Events": ["～たら","～場所を知っていますか","～があります"],
  "Annual Events and Manners": ["～とき","～たほうがいいです","～なければなりません"],
  "Shopping Wisely": ["～てしまいました","～やすいです","～ほうがいいです"],
  "Various Services": ["～てあります","～てもらえますか","～方"],
  "Nature and Environment": ["～たまま","～ても","～ないでください"],
  "My Life": ["～ようになりました","～ようと思います","～つもりです"],
  "Things you like and things you like doing": ["～って何ですか","～のが好きです","いちばん～"],
  "Where will you live?": ["～みたいです","～そうです","～んですが"],
  "Daily meals": ["～なら","～ています","～ことが多いです"],
  "Meeting people": ["～といいです","～てもいいですか","～ように"],
  "Japanese and me": ["～きっかけです","～ようにしています","～ながら"],
  "What do you do in situations like this?": ["～たらどうしますか","～なければなりません","～てください"],
  "Relationships with others": ["～そうです","～について","～たらいいです"],
  "Joys of traveling": ["～たいです","～ことができました","～てよかったです"],
  "Working in Japan": ["～について説明します","～させていただければ","～ことになっています"],
};

const defaultGrammar = ["～です／ます","助詞 は・が・を・に・で","～てください"];
const defaultVocab = ["日本語","仕事","生活","時間","場所","人"];

function lessonExamples(topic: string, grammar: string[]): { ja: string; id: string }[] {
  const vocab = topicLexicon[topic] || defaultVocab;
  const a = vocab[0], b = vocab[1];
  return [
    { ja: `${a}について 日本語で 話します。`, id: `Berlatih berbicara dalam bahasa Jepang tentang ${topic}.` },
    { ja: `${b}は どこですか。`, id: `Gunakan kosakata tema untuk bertanya dan menjawab informasi sederhana.` },
    { ja: `毎日 少しずつ 練習するようにしています。`, id: `Biasakan memakai pola yang dipelajari dalam konteks sehari-hari.` },
  ].slice(0, Math.max(2, Math.min(3, grammar.length)));
}

function makeChapter(number: number, title: string, topic: string, level: StudyLevel, mapping: BookChapter["sourceMapping"] = "topic-derived"): BookChapter {
  const vocabulary = (topicLexicon[topic] || defaultVocab).slice(0, 6);
  const grammar = (topicGrammar[topic] || defaultGrammar).slice(0, 4);
  return {
    id: `ch-${number}`,
    number,
    title,
    topic,
    level,
    canDo: [
      `Memahami kosakata inti tema ${topic}.`,
      `Memilih ungkapan yang sesuai untuk situasi ${topic.toLowerCase()}.`,
      `Menangkap informasi penting dari dialog, memo, atau pengumuman sederhana sesuai level ${level}.`,
    ],
    vocabulary,
    grammar,
    examples: lessonExamples(topic, grammar),
    sourceMapping: mapping,
  };
}

const starterLessons = [
  ["Good morning!","Starting to Speak Japanese"],["I'm sorry, I don't really understand.","Starting to Speak Japanese"],["Nice to meet you.","About Myself"],["I live in Tokyo.","About Myself"],["I like udon.","My Favorite Foods"],["I'd like a cheeseburger, please.","My Favorite Foods"],["There are four rooms.","Homes and Workplaces"],["Where is Yamada-san?","Homes and Workplaces"],["Lunch is from noon to 1 o'clock.","Daily Life"],["Please lend me the stapler.","Daily Life"],["What kind of manga do you like?","What I Like to Do"],["Do you want to go for a drink together?","What I Like to Do"],["Does this bus go to the airport?","Walking around Town"],["It's a big building, isn't it.","Walking around Town"],["I need some batteries.","At Stores"],["How much is this?","At Stores"],["I went to see a movie.","Holidays"],["I want to go to a hot spring.","Holidays"],
] as const;

const elementary1Lessons = [
  ["I work in a restaurant.","My Current Self"],["I like playing video games.","My Current Self"],["It gets very cold in winter.","Seasons and Weather"],["It rained heavily yesterday.","Seasons and Weather"],["It is very lively and convenient.","My Town"],["Please tell me how to get to the post office.","My Town"],["I will be a bit late because I got lost.","Going Out Together"],["Have you ever played baseball?","Going Out Together"],["Will you tell me how to read this?","Studying Japanese"],["I would like to take a Japanese-language class.","Studying Japanese"],["I will bring meat and vegetables.","Delicious Dishes"],["Your bento looks delicious.","Delicious Dishes"],["It will probably end in about ten minutes.","Communication at Work"],["May I take a day off?","Communication at Work"],["I have a fever, and my throat is sore.","Healthy Life"],["I try not to eat too much.","Healthy Life"],["This is a personal amulet my older brother gave me.","Personal Relationships"],["How about giving something as a gift?","Personal Relationships"],
] as const;

const elementary2Lessons = [
  ["I just came to Japan last week.","People around Me"],["He looks a serious person.","People around Me"],["I cannot eat it because of an allergy.","At a Restaurant"],["Please eat it without soy sauce.","At a Restaurant"],["You should make a reservation early.","Let's Go on a Trip"],["I am glad that I went to a lot of different places.","Let's Go on a Trip"],["If it rains, it will be held at the hall.","Local Events"],["Do you know where the food stands are?","Local Events"],["What do people do on Coming-of-Age Day?","Annual Events and Manners"],["What kind of clothes should I wear?","Annual Events and Manners"],["I forgot to bring my point card.","Shopping Wisely"],["This vacuum cleaner is light and easy to move around.","Shopping Wisely"],["They display a lot of materials.","Various Services"],["Will you cut my bangs a little shorter?","Various Services"],["The lights in the meeting room were left on.","Nature and Environment"],["Do not panic in case of an earthquake.","Nature and Environment"],["I can speak Japanese better than before.","My Life"],["I am thinking about starting my own company in the future.","My Life"],
] as const;

const preIntermediateLessons = [
  ["What is futsal again?","Things you like and things you like doing"],["I like watching TV dramas the most.","Things you like and things you like doing"],["How are preparations for your move going?","Where will you live?"],["It seems like the air conditioner is broken...","Where will you live?"],["What kind of restaurant would be good?","Daily meals"],["I cook for myself every day.","Daily meals"],["I hope I can become friends with many people.","Meeting people"],["May I sit next to you?","Meeting people"],["What made you interested in studying Japanese?","Japanese and me"],["How do you study Japanese?","Japanese and me"],["This is a scam email.","What do you do in situations like this?"],["I need an ambulance.","What do you do in situations like this?"],["Congratulations on your marriage.","Relationships with others"],["I'm troubled about a friend.","Relationships with others"],["I want to see Sakurajima.","Joys of traveling"],["I was able to take lots of good photos.","Joys of traveling"],["I will explain the work of the floor staff.","Working in Japan"],["I would be happy if you would allow me to work there.","Working in Japan"],
] as const;

function fromLessonTuples(items: readonly (readonly [string,string])[], level: StudyLevel) {
  return items.map(([title,topic],i)=>makeChapter(i+1,title,topic,level,"direct"));
}

const marugotoTopics = [
  "Bahasa Jepang","Bahasa Jepang","Diriku","Diriku","Makanan","Makanan","Rumah","Rumah","Kehidupan Keseharian","Kehidupan Keseharian","Hari Libur","Hari Libur","Kota","Kota","Belanja","Belanja","Kehidupan Keseharian","Perjalanan"
];
const marugotoChapters = marugotoTopics.map((topic,i)=>makeChapter(i+1,`Lesson ${i+1} · ${topic}`,topic,"A2.1","direct"));

const minnaGrammar = [
  "～は～です／ではありません","これ・それ・あれ／この・その・あの","ここ・そこ・あそこ／どこ","～時～分・～から～まで","行きます・来ます・帰ります／へ・で","～を～ます／何をしますか","あげます・もらいます／に","形容詞 い・な／とても・あまり","好き・上手・わかります／が","あります・います／場所表現","数え方・助数詞・どのぐらい","比較 ～より／～のほうが／いちばん","～がほしいです／～たいです","て形・～てください","～てもいいです／～てはいけません","～ています（進行・状態）","～ないでください／～なければなりません","辞書形・～ことができます／趣味は～ことです","～たことがあります／～たり～たりします","普通形・～と思います／～と言います","連体修飾（名詞を説明する文）","～とき／～と","～たら／～ても","～んです／～てもらえませんか","～たらどうですか／理由説明",
  "可能形・～しか～ません","～ながら／～ています（習慣）","自動詞・他動詞／～ています","～てあります／～ておきます","意向形・～ようと思っています","～つもりです／～予定です","命令・禁止／～と書いてあります","～という意味です／～と言っていました","～たほうがいい／～でしょう","条件形 ～ば／～なら","～ように／～ようになりました","受身形","名詞化 ～のは／～のが／～のを","～ために／～のに","～そうです（様態）／～てきます","～そうです（伝聞）／～ようです","～ところです／～たばかりです","～はずです／～かもしれません","使役形","使役受身・お願い表現","敬語（尊敬語）","敬語（謙譲語）","～場合は／～のに","複合復習：条件・目的・伝聞","総合復習：生活場面での運用"
];
const minnaTopics = ["Perkenalan","Benda dan tempat","Lokasi","Waktu","Transportasi","Aktivitas sehari-hari","Memberi dan menerima","Sifat","Kesukaan dan kemampuan","Keberadaan","Jumlah","Perbandingan","Keinginan","Permintaan","Izin dan larangan","Kegiatan berlangsung","Kewajiban","Kemampuan","Pengalaman","Pendapat","Deskripsi orang/benda","Waktu dan kondisi","Pengandaian","Penjelasan","Saran"];
const minna2Topics = ["Kemampuan","Kegiatan bersamaan","Keadaan benda","Persiapan","Rencana","Jadwal","Instruksi","Makna dan laporan","Saran","Kondisi","Perubahan kemampuan","Pasif","Nominalisasi","Tujuan","Kesan","Informasi terdengar","Tahap kegiatan","Perkiraan","Kausatif","Permintaan formal","Honorifik","Humble speech","Situasi khusus","Integrasi pola","Review komprehensif"];

function makeMinna(start:number,end:number,level:StudyLevel){
  return Array.from({length:end-start+1},(_,idx)=>{
    const n=start+idx; const topic=(n<=25?minnaTopics[n-1]:minna2Topics[n-26]) || `Bab ${n}`;
    const ch=makeChapter(n,`Bab ${n} · ${topic}`,topic,level,"normalized");
    ch.grammar=[minnaGrammar[n-1] || defaultGrammar[0]];
    ch.vocabulary=(topicLexicon[topic]||defaultVocab).slice(0,6);
    ch.examples=[{ja:`この課では「${ch.grammar[0]}」を使って、生活の場面を練習します。`,id:`Bab ${n} berfokus pada penggunaan pola ${ch.grammar[0]} dalam konteks kehidupan sehari-hari.`},{ja:"例文を声に出して、自然な会話の流れを確認します。",id:"Baca contoh dengan suara keras dan periksa alur percakapan."}];
    return ch;
  });
}

function makeUnits(count:number,titlePrefix:string,level:StudyLevel,topics:string[],mapping:BookChapter["sourceMapping"]="normalized"){
  return Array.from({length:count},(_,i)=>makeChapter(i+1,`${titlePrefix} ${i+1}`,topics[i%topics.length],level,mapping));
}

const chapterTopicsN4=["Kosakata","Kanji","Tata bahasa","Percakapan","Reading","Listening","Informasi publik","Kesehatan","Transportasi","Pekerjaan"];

export const bookLibrary: BookResource[] = [
  {id:"irodori-starter",title:"IRODORI Starter",series:"IRODORI",level:"A1",kind:"coursebook",description:"18 pelajaran kehidupan sehari-hari untuk level awal. Struktur pelajaran mengikuti sumber resmi IRODORI yang dirujuk dari Drive.",sourceUrl:IRODORI_DRIVE,secondaryUrls:[{label:"Official IRODORI",url:"https://www.irodori.jpf.go.jp/en/starter/pdf.html"}],chapters:fromLessonTuples(starterLessons,"A1"),sourceFiles:["IRODORI FILE LENGKAP .docx","Kotoba Irodori 1.pdf","Kotoba Irodori 2.pdf"],chapterMapping:"direct",jftPriority:"core"},
  {id:"irodori-elementary1",title:"IRODORI Elementary 1",series:"IRODORI",level:"A2.1",kind:"coursebook",description:"18 pelajaran A2 berorientasi Can-do dan situasi hidup di Jepang; sangat relevan dengan domain JFT-Basic.",sourceUrl:IRODORI_DRIVE,secondaryUrls:[{label:"Official IRODORI",url:"https://www.irodori.jpf.go.jp/en/elementary01/pdf.html"}],chapters:fromLessonTuples(elementary1Lessons,"A2.1"),sourceFiles:["IRODORI FILE LENGKAP .docx","Kotoba Irodori 1.pdf","Kotoba Irodori 2.pdf"],chapterMapping:"direct",jftPriority:"core"},
  {id:"irodori-elementary2",title:"IRODORI Elementary 2",series:"IRODORI",level:"A2.2",kind:"coursebook",description:"18 pelajaran A2 lanjutan: layanan, acara, perjalanan, lingkungan, dan kehidupan kerja.",sourceUrl:IRODORI_DRIVE,secondaryUrls:[{label:"Official IRODORI",url:"https://www.irodori.jpf.go.jp/en/elementary02/pdf.html"}],chapters:fromLessonTuples(elementary2Lessons,"A2.2"),sourceFiles:["IRODORI FILE LENGKAP .docx","Kotoba Irodori 1.pdf","Kotoba Irodori 2.pdf"],chapterMapping:"direct",jftPriority:"core"},
  {id:"irodori-preintermediate",title:"IRODORI Pre-Intermediate",series:"IRODORI",level:"A2/B1",kind:"coursebook",description:"18 pelajaran transisi A2/B1. Dipakai sebagai pengayaan; tidak otomatis masuk blueprint JFT A1–A2.",sourceUrl:IRODORI_DRIVE,secondaryUrls:[{label:"Official IRODORI",url:"https://www.irodori.jpf.go.jp/en/pre-intermediate/pdf.html"}],chapters:fromLessonTuples(preIntermediateLessons,"A2/B1"),sourceFiles:["IRODORI FILE LENGKAP .docx"],chapterMapping:"direct",jftPriority:"support"},
  {id:"marugoto",title:"Marugoto",series:"MARUGOTO",level:"A2.1",kind:"coursebook",description:"Daftar kosakata sekitar 1.000 kata yang dipetakan ke 9 topik dan 18 pelajaran Marugoto.",sourceUrl:"https://drive.google.com/file/d/1bIKSH-cU9cqRKp9VgRm8le6_JQ0KhEWp/view",chapters:marugotoChapters,sourceFiles:["Marugoto.pdf"],chapterMapping:"direct",jftPriority:"core"},
  {id:"minna1",title:"Minna no Nihongo Shokyuu I",series:"MINNA NO NIHONGO",level:"N5",kind:"coursebook",description:"Buku utama Jepang + terjemahan Indonesia. Bab 1–25 dinormalisasi ke jalur belajar bertahap.",sourceUrl:"https://drive.google.com/drive/folders/16E_bEGu6GA4So7FzEKRI2jZCxjgIu7Zj",chapters:makeMinna(1,25,"N5"),sourceFiles:["Mina no nihongo shokyuu 1 jepang.pdf","Mina no nihongo shokyuu 1 indonesia.pdf","Kotoba Minna no Nihongo Bab 1 - 50-1.pdf","perubahan_KK_Full.pdf","Link buku - choukai.docx"],chapterMapping:"normalized",jftPriority:"core"},
  {id:"minna2",title:"Minna no Nihongo Shokyuu II",series:"MINNA NO NIHONGO",level:"N4",kind:"coursebook",description:"Lanjutan Bab 26–50 dengan materi N4 dasar dan reading Topikku 25.",sourceUrl:"https://drive.google.com/drive/folders/1k2zPMXveL3WrZvDD_Vl_XayMPQB3GBpj",chapters:makeMinna(26,50,"N4"),sourceFiles:["Minna No Nihongo II インドネシア語 .pdf","Minna No Nihongo Shyokyuu II - Shyokyuu De Yomeru Topikku 25.pdf","Kotoba Minna no Nihongo Bab 1 - 50-1.pdf"],chapterMapping:"normalized",jftPriority:"core"},
  {id:"minna-new1",title:"Minna no Nihongo Edisi 2 · I",series:"MINNA NO NIHONGO VERSI BARU",level:"N5",kind:"coursebook",description:"Terjemahan dan keterangan tata bahasa edisi kedua untuk bagian pertama.",sourceUrl:"https://drive.google.com/drive/folders/1SdeP5pU5hKx7fa7Gp9lfY6lUVo_Xgv5i",chapters:makeMinna(1,25,"N5"),sourceFiles:["Minna no Nihongo I Edisi 2 - Terjemahan Keterangan Tata Bahasa Indonesia.pdf","perubahan_KK_Full (1).pdf","LISTENING.docx","Link lengkap.docx"],chapterMapping:"normalized",jftPriority:"core"},
  {id:"minna-new2",title:"Minna no Nihongo Edisi 2 · II",series:"MINNA NO NIHONGO VERSI BARU",level:"N4",kind:"coursebook",description:"Buku Jepang bagian kedua edisi baru; dipetakan ke Bab 26–50.",sourceUrl:"https://drive.google.com/drive/folders/1dgEvtrb7URTHltaPqQqIP8t2Kj03lPPI",chapters:makeMinna(26,50,"N4"),sourceFiles:["Minna no nihongo 2 jepang.pdf","LISTENING.docx","Link lengkap.docx"],chapterMapping:"normalized",jftPriority:"core"},
  {id:"minna-kotoba",title:"Kotoba Minna no Nihongo Bab 1–50",series:"MINNA NO NIHONGO",level:"mixed",kind:"vocabulary",description:"Kosakata Bab 1–50 sebagai pendamping Minna no Nihongo.",sourceUrl:"https://drive.google.com/file/d/1fcRxJkp51OGrOKnw508NQv13ZJAyE4Ib/view",chapters:[...makeMinna(1,25,"N5"),...makeMinna(26,50,"N4")],sourceFiles:["Kotoba Minna no Nihongo Bab 1 - 50-1.pdf"],chapterMapping:"direct",jftPriority:"core"},
  {id:"mondaishuu-shokyuu2",title:"Shokyuu II · Mondaishuu 2",series:"MONDAISHUU BOOK",level:"N4",kind:"workbook",description:"Workbook latihan Shokyuu II. Unit latihan dinormalisasi untuk sesi review dan tes bertahap.",sourceUrl:"https://drive.google.com/file/d/1z0tJxC6PrqCxah5HdQGjila99oVER-oQ/view",chapters:makeUnits(25,"Unit","N4",chapterTopicsN4),sourceFiles:["Shokyuu II - Mondaishuu 2.pdf"],chapterMapping:"normalized",jftPriority:"support"},
  {id:"mondai-n4",title:"Mondai N4",series:"MONDAISHUU BOOK",level:"N4",kind:"workbook",description:"Bank latihan N4 sebagai materi pengayaan grammar, reading, dan kanji.",sourceUrl:"https://drive.google.com/file/d/1qI25MRRULDdFQ7RAJQk0CnqPiciQVgVH/view",chapters:makeUnits(10,"Set","N4",chapterTopicsN4),sourceFiles:["Mondai N4.pdf"],chapterMapping:"normalized",jftPriority:"support"},
  {id:"koushiki-n4",title:"JLPT Koushiki Mondaishuu N4",series:"MONDAISHUU BOOK",level:"N4",kind:"workbook",description:"Referensi format JLPT N4. Disimpan sebagai pengayaan dan tidak dicampur ke format JFT.",sourceUrl:"https://drive.google.com/file/d/1Jckxh2EVtAlQPar8DMMD0G7NSP35Wt5G/view",chapters:makeUnits(8,"Section","N4",chapterTopicsN4),sourceFiles:["BOOK JLPT Koushiki Mondaishuu N4.pdf"],chapterMapping:"normalized",jftPriority:"outside"},
  {id:"kotoba-jft",title:"Kotoba JFT Collection",series:"KOTOBA JFT",level:"A2.2",kind:"vocabulary",description:"Koleksi kosakata JFT yang dikelompokkan menjadi ungkapan umum, kata benda, kata kerja, kata sifat, jidoushi/tadoushi, hyougen, sonkeigo, dan kosakata sederhana.",sourceUrl:"https://drive.google.com/drive/folders/11eeCrYpeXVfb_7LTd3yhMIjsdHZ1Eqoo",chapters:makeUnits(8,"Kotoba Set","A2.2",["Ungkapan Umum","Kata Benda","Kata Kerja","Kata Sifat","Jidoushi / Tadoushi","Hyougen","Sonkeigo","Simple · Hewan & Benda"]),sourceFiles:["UNGKAPAN UMUM","KATA BENDA","KATA KERJA","KATA SIFAT","JIDOUSHI/TADOUSHI","HYOUGEN","SONKEIGO","SIMPLE [ Hewan, Benda Dll ["],chapterMapping:"collection",jftPriority:"core"},
  {id:"jft-bunpou",title:"Pola Kalimat JFT",series:"BUNPOU JFT",level:"A2.2",kind:"grammar",description:"Kumpulan pola bentuk kamus, ない, た, て, ます, kondisi, izin, saran, pengalaman, dan ungkapan yang relevan untuk JFT.",sourceUrl:"https://drive.google.com/file/d/1VvgcJhoQB1PcKZLL7LjmVCcGFFYh1AJx/view",chapters:makeUnits(12,"Unit Bunpou","A2.2",["Kamus","Bentuk ない","Bentuk た","Bentuk て","Bentuk ます","Kondisi","Izin dan larangan","Saran","Pengalaman","Tujuan","Perubahan","Review"]),sourceFiles:["Pola Kalimat JFT-1.pdf","Penjelasan Semua Partikel.docx","bunpou wajib N4.pdf","BUNPOU MINNA I.pdf","BUNPOU MINNA 2.pdf"],chapterMapping:"collection",jftPriority:"core"},
  {id:"kanji-n5",title:"Kanji Flashcard N5",series:"KANJI JFT",level:"N5",kind:"kanji",description:"Flashcard kanji dasar N5 dari folder Kanji JFT.",sourceUrl:"https://drive.google.com/drive/folders/146-gMRxcQ33kBN9RyQnRZDkVtfcBQDGN",chapters:makeUnits(10,"Kanji Set","N5",["Angka","Waktu","Orang","Tempat","Sekolah","Kehidupan","Arah","Cuaca","Aktivitas","Review"]),sourceFiles:["KANJI flashcard N5 (Biasa).pdf","KANJI flashcard N5 (Print).pdf"],chapterMapping:"collection",jftPriority:"core"},
  {id:"kanji-n4",title:"Kanji N4 Collection",series:"KANJI JFT",level:"N4",kind:"kanji",description:"Flashcard dan daftar kanji N4 dari folder Kanji JFT.",sourceUrl:"https://drive.google.com/drive/folders/1eyMUeYlNOe8xnzrMqY_cQ9yWR57au6UZ",secondaryUrls:[{label:"List Kanji N4",url:"https://drive.google.com/drive/folders/1Ds36GQ1USBLixx5B-RH1HB3qvnbxEerO"}],chapters:makeUnits(12,"Kanji Set","N4",["Kehidupan","Pekerjaan","Transportasi","Kesehatan","Belanja","Layanan","Alam","Perasaan","Waktu","Tindakan","Informasi","Review"]),sourceFiles:["KANJI flashcard N4 (Biasa).pdf","KANJI flashcard N4 (Print).pdf","KANJI N4 (1).pdf","KANJI N4 (2).pdf"],chapterMapping:"collection",jftPriority:"core"},
  {id:"irodori-kotoba",title:"Kotoba IRODORI Collection",series:"IRODORI",level:"A2.2",kind:"vocabulary",description:"Dua PDF kosakata Irodori dari Drive; dipakai sebagai penguat Vocabulary Master dan tes bab.",sourceUrl:"https://drive.google.com/drive/folders/1KCpZSQrvHdvR_uyy5CHaM0IEHnUT2Et0",chapters:makeUnits(18,"Lesson Vocabulary","A2.2",elementary1Lessons.map(x=>x[1])),sourceFiles:["Kotoba Irodori 1.pdf","Kotoba Irodori 2.pdf"],chapterMapping:"collection",jftPriority:"core"},
  {id:"jlpt-n4-archive",title:"JLPT N4 Source Archive",series:"JLPT N4",level:"N4",kind:"collection",description:"Arsip folder soal N4 2010–2023 yang tersedia di Drive. Ditampilkan sebagai referensi sumber, tidak disalin ke bank JFT.",sourceUrl:"https://drive.google.com/drive/folders/170pEbfT2AMullIVDii-qMxMHxQlFhNuV",chapters:[],sourceFiles:["7-2010","12-2012","7-2013","12-2013","7-2014","7-2017","7-2018","7-2021","12-2021","12-2022","7-2023"],chapterMapping:"collection",jftPriority:"outside"},
  {id:"jlpt-n3-collection",title:"JLPT N3 Collection",series:"JLPT N3",level:"N3",kind:"collection",description:"Kumpulan Kanji, Bunpou, Kotoba, latihan, dan soal N3 dari Drive. Disediakan sebagai jalur lanjutan dan tidak memengaruhi JFT readiness.",sourceUrl:"https://drive.google.com/drive/folders/1SRrnX9PDDPBGWmOREppNbr-95cqXqcDa",chapters:[],sourceFiles:["KANJI N3","BUNPOU N3","KOTOBA N3","LATSOL N3 LINK","SOAL N3 LENGKAP PDF"],chapterMapping:"collection",jftPriority:"outside"},
];

export const librarySourceRoot = SOURCE_ROOT;
export const bookCount = bookLibrary.length;
export const chapterCount = bookLibrary.reduce((n,b)=>n+b.chapters.length,0);

export function getBook(bookId:string){return bookLibrary.find(b=>b.id===bookId)}
export function getChapter(bookId:string,chapterId:string){return getBook(bookId)?.chapters.find(c=>c.id===chapterId)}
