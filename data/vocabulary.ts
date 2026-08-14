import type { VocabularyEntry } from "@/types";

type Seed = [string,string,string,string,string];
const seeds: Seed[] = [
["家","いえ","ie","rumah","home"],["会社","かいしゃ","kaisha","perusahaan","work"],["駅","えき","eki","stasiun","transport"],["病院","びょういん","byouin","rumah sakit","health"],["学校","がっこう","gakkou","sekolah","study"],["教室","きょうしつ","kyoushitsu","ruang kelas","study"],["図書館","としょかん","toshokan","perpustakaan","public"],["銀行","ぎんこう","ginkou","bank","public"],["郵便局","ゆうびんきょく","yuubinkyoku","kantor pos","public"],["空港","くうこう","kuukou","bandara","transport"],
["電車","でんしゃ","densha","kereta","transport"],["地下鉄","ちかてつ","chikatetsu","kereta bawah tanah","transport"],["バス","バス","basu","bus","transport"],["自転車","じてんしゃ","jitensha","sepeda","transport"],["車","くるま","kuruma","mobil","transport"],["道","みち","michi","jalan","transport"],["入口","いりぐち","iriguchi","pintu masuk","public"],["出口","でぐち","deguchi","pintu keluar","public"],["東口","ひがしぐち","higashiguchi","pintu timur","transport"],["西口","にしぐち","nishiguchi","pintu barat","transport"],
["店","みせ","mise","toko","shopping"],["スーパー","スーパー","suupaa","supermarket","shopping"],["コンビニ","コンビニ","konbini","minimarket","shopping"],["レストラン","レストラン","resutoran","restoran","food"],["喫茶店","きっさてん","kissaten","kedai kopi","food"],["食堂","しょくどう","shokudou","kantin","food"],["料理","りょうり","ryouri","masakan","food"],["ご飯","ごはん","gohan","nasi/makanan","food"],["魚","さかな","sakana","ikan","food"],["肉","にく","niku","daging","food"],
["牛肉","ぎゅうにく","gyuuniku","daging sapi","food"],["野菜","やさい","yasai","sayuran","food"],["果物","くだもの","kudamono","buah","food"],["水","みず","mizu","air","food"],["お茶","おちゃ","ocha","teh","food"],["コーヒー","コーヒー","koohii","kopi","food"],["パン","パン","pan","roti","food"],["卵","たまご","tamago","telur","food"],["薬","くすり","kusuri","obat","health"],["風邪","かぜ","kaze","flu/pilek","health"],
["熱","ねつ","netsu","demam","health"],["頭","あたま","atama","kepala","body"],["目","め","me","mata","body"],["耳","みみ","mimi","telinga","body"],["口","くち","kuchi","mulut","body"],["お腹","おなか","onaka","perut","body"],["元気","げんき","genki","sehat/bersemangat","health"],["大丈夫","だいじょうぶ","daijoubu","baik-baik saja","expression"],["休み","やすみ","yasumi","libur/istirahat","daily"],["休憩","きゅうけい","kyuukei","istirahat","work"],
["仕事","しごと","shigoto","pekerjaan","work"],["会議","かいぎ","kaigi","rapat","work"],["事務室","じむしつ","jimushitsu","ruang kantor","work"],["受付","うけつけ","uketsuke","resepsionis/loket","public"],["工場","こうじょう","koujou","pabrik","work"],["書類","しょるい","shorui","dokumen","work"],["紙","かみ","kami","kertas","work"],["写真","しゃしん","shashin","foto","daily"],["電話","でんわ","denwa","telepon","daily"],["メール","メール","meeru","email","daily"],
["名前","なまえ","namae","nama","daily"],["住所","じゅうしょ","juusho","alamat","daily"],["家族","かぞく","kazoku","keluarga","daily"],["母","はは","haha","ibu (sendiri)","family"],["お母さん","おかあさん","okaasan","ibu","family"],["父","ちち","chichi","ayah (sendiri)","family"],["友達","ともだち","tomodachi","teman","daily"],["男","おとこ","otoko","laki-laki","people"],["女","おんな","onna","perempuan","people"],["子ども","こども","kodomo","anak","people"],
["今日","きょう","kyou","hari ini","time"],["明日","あした","ashita","besok","time"],["昨日","きのう","kinou","kemarin","time"],["今週","こんしゅう","konshuu","minggu ini","time"],["来週","らいしゅう","raishuu","minggu depan","time"],["去年","きょねん","kyonen","tahun lalu","time"],["午前","ごぜん","gozen","pagi/a.m.","time"],["午後","ごご","gogo","siang-p.m.","time"],["時間","じかん","jikan","waktu/jam","time"],["分","ふん","fun","menit","time"],
["天気","てんき","tenki","cuaca","weather"],["雨","あめ","ame","hujan","weather"],["風","かぜ","kaze","angin","weather"],["台風","たいふう","taifuu","topan","disaster"],["地震","じしん","jishin","gempa","disaster"],["火事","かじ","kaji","kebakaran","disaster"],["安全","あんぜん","anzen","aman/keselamatan","disaster"],["危ない","あぶない","abunai","berbahaya","disaster"],["公園","こうえん","kouen","taman","public"],["動物園","どうぶつえん","doubutsuen","kebun binatang","leisure"],
["映画","えいが","eiga","film","leisure"],["音楽","おんがく","ongaku","musik","leisure"],["本","ほん","hon","buku","study"],["雑誌","ざっし","zasshi","majalah","study"],["旅行","りょこう","ryokou","perjalanan/wisata","leisure"],["買い物","かいもの","kaimono","belanja","shopping"],["財布","さいふ","saifu","dompet","daily"],["鍵","かぎ","kagi","kunci","daily"],["眼鏡","めがね","megane","kacamata","daily"],["傘","かさ","kasa","payung","daily"],
["服","ふく","fuku","pakaian","shopping"],["靴下","くつした","kutsushita","kaus kaki","shopping"],["帽子","ぼうし","boushi","topi","shopping"],["軽い","かるい","karui","ringan","adjective"],["重い","おもい","omoi","berat","adjective"],["広い","ひろい","hiroi","luas","adjective"],["狭い","せまい","semai","sempit","adjective"],["近い","ちかい","chikai","dekat","adjective"],["遠い","とおい","tooi","jauh","adjective"],["新しい","あたらしい","atarashii","baru","adjective"],
["古い","ふるい","furui","lama/tua","adjective"],["高い","たかい","takai","tinggi/mahal","adjective"],["安い","やすい","yasui","murah","adjective"],["忙しい","いそがしい","isogashii","sibuk","adjective"],["楽しい","たのしい","tanoshii","menyenangkan","adjective"],["難しい","むずかしい","muzukashii","sulit","adjective"],["簡単","かんたん","kantan","mudah/sederhana","adjective"],["有名","ゆうめい","yuumei","terkenal","adjective"],["静か","しずか","shizuka","tenang","adjective"],["便利","べんり","benri","praktis/nyaman","adjective"]
];

function sentence([kanji, hiragana, _romaji, meaning, tag]: Seed) {
  const subject = kanji || hiragana;
  if (tag === "food") return [`${subject}を食べます。`, `Saya makan ${meaning}.`];
  if (tag === "transport") return [`${subject}で行きます。`, `Saya pergi dengan ${meaning}.`];
  if (["public","work","study","shopping"].includes(tag)) return [`${subject}へ行きます。`, `Saya pergi ke ${meaning}.`];
  if (tag === "time") return [`${subject}、日本語を勉強します。`, `${meaning}, saya belajar bahasa Jepang.`];
  if (tag === "weather" || tag === "disaster") return [`今日は${subject}について話します。`, `Hari ini membahas ${meaning}.`];
  if (tag === "adjective") return [`これは${hiragana}です。`, `Ini ${meaning}.`];
  return [`${subject}を覚えます。`, `Saya menghafal kata ${meaning}.`];
}

export const vocabulary: VocabularyEntry[] = seeds.map((seed, index) => {
  const [kanji, hiragana, romaji, meaningId, tag] = seed;
  const [sentenceJa, sentenceId] = sentence(seed);
  return { id:`v-${index+1}`, kanji, hiragana, romaji, meaningId, sentenceJa, sentenceId, tags:[tag,"jft-basic"] };
});
