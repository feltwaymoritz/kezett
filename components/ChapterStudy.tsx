"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Circle,
  ExternalLink,
  GraduationCap,
  Headphones,
  Languages,
  Lightbulb,
  ListChecks,
  MessageCircle,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";

import type {
  BookChapter,
  BookResource,
  Locale,
} from "@/types";

import { vocabulary } from "@/data/vocabulary";
import { kanji } from "@/data/kanji";
import { markStudyActivity } from "@/lib/progress";

type V = {
  surface: string;
  reading: string;
  romaji: string;
  meaning: string;
  pos: string;
  exampleJa: string;
  exampleId: string;
};

type G = {
  pattern: string;
  functionId: string;
  formula: string;
  exampleJa: string;
  exampleId: string;
  noteId: string;
  response?: string;
};

type Line = {
  speaker: "A" | "B";
  ja: string;
  id: string;
};

const extras: Record<
  string,
  Omit<V, "surface">
> = {
  "先生": {
    reading: "せんせい",
    romaji: "sensei",
    meaning: "guru / pengajar",
    pos: "nomina",
    exampleJa: "先生に質問します。",
    exampleId: "Saya bertanya kepada guru.",
  },

  "学生": {
    reading: "がくせい",
    romaji: "gakusei",
    meaning: "pelajar / mahasiswa",
    pos: "nomina",
    exampleJa: "私は学生です。",
    exampleId: "Saya seorang pelajar.",
  },

  "聞きます": {
    reading: "ききます",
    romaji: "kikimasu",
    meaning: "mendengar / bertanya",
    pos: "verba",
    exampleJa: "先生の話を聞きます。",
    exampleId:
      "Saya mendengarkan penjelasan guru.",
  },

  "話します": {
    reading: "はなします",
    romaji: "hanashimasu",
    meaning: "berbicara",
    pos: "verba",
    exampleJa: "日本語で話します。",
    exampleId:
      "Saya berbicara dalam bahasa Jepang.",
  },

  "日本語": {
    reading: "にほんご",
    romaji: "nihongo",
    meaning: "bahasa Jepang",
    pos: "nomina",
    exampleJa: "日本語を勉強しています。",
    exampleId:
      "Saya sedang belajar bahasa Jepang.",
  },

  "住みます": {
    reading: "すみます",
    romaji: "sumimasu",
    meaning: "tinggal",
    pos: "verba",
    exampleJa: "東京に住んでいます。",
    exampleId: "Saya tinggal di Tokyo.",
  },

  "注文": {
    reading: "ちゅうもん",
    romaji: "chuumon",
    meaning: "pesanan / memesan",
    pos: "nomina",
    exampleJa: "料理を注文します。",
    exampleId: "Saya memesan makanan.",
  },

  "趣味": {
    reading: "しゅみ",
    romaji: "shumi",
    meaning: "hobi",
    pos: "nomina",
    exampleJa:
      "趣味は映画を見ることです。",
    exampleId:
      "Hobi saya adalah menonton film.",
  },

  "週末": {
    reading: "しゅうまつ",
    romaji: "shuumatsu",
    meaning: "akhir pekan",
    pos: "nomina",
    exampleJa:
      "週末に友達と会います。",
    exampleId:
      "Saya bertemu teman pada akhir pekan.",
  },

  "右": {
    reading: "みぎ",
    romaji: "migi",
    meaning: "kanan",
    pos: "nomina",
    exampleJa:
      "右に曲がってください。",
    exampleId: "Silakan belok kanan.",
  },

  "左": {
    reading: "ひだり",
    romaji: "hidari",
    meaning: "kiri",
    pos: "nomina",
    exampleJa:
      "銀行は左にあります。",
    exampleId: "Bank ada di sebelah kiri.",
  },

  "値段": {
    reading: "ねだん",
    romaji: "nedan",
    meaning: "harga",
    pos: "nomina",
    exampleJa: "値段を見てください。",
    exampleId: "Silakan lihat harganya.",
  },

  "サイズ": {
    reading: "サイズ",
    romaji: "saizu",
    meaning: "ukuran",
    pos: "nomina",
    exampleJa:
      "大きいサイズはありますか。",
    exampleId:
      "Apakah ada ukuran yang lebih besar?",
  },

  "働きます": {
    reading: "はたらきます",
    romaji: "hatarakimasu",
    meaning: "bekerja",
    pos: "verba",
    exampleJa:
      "レストランで働いています。",
    exampleId: "Saya bekerja di restoran.",
  },

  "好き": {
    reading: "すき",
    romaji: "suki",
    meaning: "suka",
    pos: "adjektiva-na",
    exampleJa:
      "日本の音楽が好きです。",
    exampleId: "Saya suka musik Jepang.",
  },

  "春": {
    reading: "はる",
    romaji: "haru",
    meaning: "musim semi",
    pos: "nomina",
    exampleJa: "春は暖かいです。",
    exampleId: "Musim semi hangat.",
  },

  "夏": {
    reading: "なつ",
    romaji: "natsu",
    meaning: "musim panas",
    pos: "nomina",
    exampleJa: "夏は暑いです。",
    exampleId: "Musim panas terasa panas.",
  },

  "秋": {
    reading: "あき",
    romaji: "aki",
    meaning: "musim gugur",
    pos: "nomina",
    exampleJa:
      "秋は果物がおいしいです。",
    exampleId:
      "Buah-buahan enak pada musim gugur.",
  },

  "冬": {
    reading: "ふゆ",
    romaji: "fuyu",
    meaning: "musim dingin",
    pos: "nomina",
    exampleJa: "冬は寒いです。",
    exampleId:
      "Musim dingin terasa dingin.",
  },

  "町": {
    reading: "まち",
    romaji: "machi",
    meaning: "kota / daerah",
    pos: "nomina",
    exampleJa: "この町は便利です。",
    exampleId: "Kota ini praktis.",
  },

  "約束": {
    reading: "やくそく",
    romaji: "yakusoku",
    meaning: "janji",
    pos: "nomina",
    exampleJa:
      "友達と約束があります。",
    exampleId:
      "Saya mempunyai janji dengan teman.",
  },

  "遅れます": {
    reading: "おくれます",
    romaji: "okuremasu",
    meaning: "terlambat",
    pos: "verba",
    exampleJa:
      "十分ぐらい遅れます。",
    exampleId:
      "Saya akan terlambat sekitar sepuluh menit.",
  },

  "漢字": {
    reading: "かんじ",
    romaji: "kanji",
    meaning: "kanji",
    pos: "nomina",
    exampleJa:
      "この漢字の読み方を教えてください。",
    exampleId:
      "Tolong beri tahu cara membaca kanji ini.",
  },

  "読み方": {
    reading: "よみかた",
    romaji: "yomikata",
    meaning: "cara membaca",
    pos: "nomina",
    exampleJa:
      "読み方がわかりません。",
    exampleId:
      "Saya tidak tahu cara membacanya.",
  },

  "勉強": {
    reading: "べんきょう",
    romaji: "benkyou",
    meaning: "belajar",
    pos: "nomina / verba",
    exampleJa:
      "毎日日本語を勉強します。",
    exampleId:
      "Saya belajar bahasa Jepang setiap hari.",
  },

  "練習": {
    reading: "れんしゅう",
    romaji: "renshuu",
    meaning: "latihan",
    pos: "nomina / verba",
    exampleJa:
      "会話を練習します。",
    exampleId:
      "Saya berlatih percakapan.",
  },

  "予約": {
    reading: "よやく",
    romaji: "yoyaku",
    meaning: "reservasi",
    pos: "nomina / verba",
    exampleJa:
      "ホテルを予約します。",
    exampleId: "Saya memesan hotel.",
  },

  "観光": {
    reading: "かんこう",
    romaji: "kankou",
    meaning: "wisata",
    pos: "nomina / verba",
    exampleJa: "京都を観光します。",
    exampleId: "Saya berwisata di Kyoto.",
  },

  "祭り": {
    reading: "まつり",
    romaji: "matsuri",
    meaning: "festival",
    pos: "nomina",
    exampleJa:
      "町の祭りに参加します。",
    exampleId:
      "Saya mengikuti festival kota.",
  },

  "会場": {
    reading: "かいじょう",
    romaji: "kaijou",
    meaning: "lokasi acara",
    pos: "nomina",
    exampleJa: "会場は公民館です。",
    exampleId:
      "Lokasi acara adalah balai warga.",
  },

  "参加": {
    reading: "さんか",
    romaji: "sanka",
    meaning: "berpartisipasi",
    pos: "nomina / verba",
    exampleJa:
      "イベントに参加します。",
    exampleId: "Saya mengikuti acara.",
  },

  "電気": {
    reading: "でんき",
    romaji: "denki",
    meaning: "listrik / lampu",
    pos: "nomina",
    exampleJa:
      "電気を消してください。",
    exampleId: "Tolong matikan lampu.",
  },

  "ごみ": {
    reading: "ごみ",
    romaji: "gomi",
    meaning: "sampah",
    pos: "nomina",
    exampleJa:
      "ごみを分けて捨てます。",
    exampleId: "Saya memilah sampah.",
  },

  "将来": {
    reading: "しょうらい",
    romaji: "shourai",
    meaning: "masa depan",
    pos: "nomina",
    exampleJa:
      "将来、日本で働きたいです。",
    exampleId:
      "Saya ingin bekerja di Jepang di masa depan.",
  },
};

function vocabInfo(word: string): V {
  const found = vocabulary.find(
    (item) =>
      item.kanji === word ||
      item.hiragana === word
  );

  if (found) {
    return {
      surface: word,
      reading: found.hiragana,
      romaji: found.romaji,
      meaning: found.meaningId,
      pos: found.tags[0] || "kosakata",
      exampleJa: found.sentenceJa,
      exampleId: found.sentenceId,
    };
  }

  if (extras[word]) {
    return {
      surface: word,
      ...extras[word],
    };
  }

  return {
    surface: word,
    reading: word,
    romaji: "—",
    meaning: "kosakata inti bab",
    pos: "kosakata",
    exampleJa:
      `「${word}」を使って文を作ります。`,
    exampleId:
      `Gunakan ${word} dalam kalimat sesuai konteks bab.`,
  };
}

function grammarInfo(
  pattern: string
): G {
  const p = pattern.replace(
    /／/g,
    " / "
  );

  if (/てもいい/.test(p)) {
    return {
      pattern,
      functionId:
        "Meminta atau memberi izin.",
      formula:
        "Vて + もいいですか",
      exampleJa:
        "ここに座ってもいいですか。",
      exampleId:
        "Bolehkah saya duduk di sini?",
      response:
        "はい、いいですよ。／すみません、ちょっと…。",
      noteId:
        "Gunakan bentuk て sebelum もいいですか.",
    };
  }

  if (
    /てはいけません|ちゃだめ|禁止/.test(p)
  ) {
    return {
      pattern,
      functionId:
        "Menyatakan larangan.",
      formula:
        "Vて + はいけません",
      exampleJa:
        "ここで写真を撮ってはいけません。",
      exampleId:
        "Dilarang mengambil foto di sini.",
      noteId:
        "～ちゃだめ lebih santai; ～てはいけません lebih formal.",
    };
  }

  if (/ないでください/.test(p)) {
    return {
      pattern,
      functionId:
        "Meminta agar seseorang tidak melakukan sesuatu.",
      formula:
        "Vない + でください",
      exampleJa:
        "ここに荷物を置かないでください。",
      exampleId:
        "Tolong jangan menaruh barang di sini.",
      noteId:
        "Gunakan bentuk ない: 入る → 入らないでください.",
    };
  }

  if (
    /なければなりません|なくちゃ|ないといけ/.test(p)
  ) {
    return {
      pattern,
      functionId:
        "Menyatakan kewajiban.",
      formula:
        "Vない → Vなければなりません",
      exampleJa:
        "明日までに書類を出さなければなりません。",
      exampleId:
        "Dokumen harus diserahkan paling lambat besok.",
      noteId:
        "～なくちゃ adalah bentuk percakapan yang lebih santai.",
    };
  }

  if (/たほうがいい/.test(p)) {
    return {
      pattern,
      functionId:
        "Memberi saran.",
      formula:
        "Vた + ほうがいいです",
      exampleJa:
        "熱がありますから、今日は休んだほうがいいです。",
      exampleId:
        "Karena demam, sebaiknya istirahat hari ini.",
      noteId:
        "Untuk saran negatif gunakan Vない + ほうがいいです.",
    };
  }

  if (/たことがあります/.test(p)) {
    return {
      pattern,
      functionId:
        "Menyatakan pengalaman pernah.",
      formula:
        "Vた + ことがあります",
      exampleJa:
        "京都へ行ったことがあります。",
      exampleId:
        "Saya pernah pergi ke Kyoto.",
      noteId:
        "Gunakan untuk pengalaman, bukan kejadian dengan waktu spesifik seperti 昨日.",
    };
  }

  if (/つもり/.test(p)) {
    return {
      pattern,
      functionId:
        "Menyatakan rencana / niat.",
      formula:
        "V辞書形 / Vない + つもりです",
      exampleJa:
        "来年、日本で働くつもりです。",
      exampleId:
        "Saya berencana bekerja di Jepang tahun depan.",
      noteId:
        "つもり lebih kuat sebagai niat daripada sekadar ～たいです.",
    };
  }

  if (/ようになりました/.test(p)) {
    return {
      pattern,
      functionId:
        "Menyatakan perubahan kemampuan atau kebiasaan.",
      formula:
        "V辞書形 / Vない + ようになりました",
      exampleJa:
        "日本語が少しわかるようになりました。",
      exampleId:
        "Saya mulai sedikit memahami bahasa Jepang.",
      noteId:
        "Fokus pada perubahan dari keadaan sebelumnya.",
    };
  }

  if (/ようにしています/.test(p)) {
    return {
      pattern,
      functionId:
        "Menyatakan usaha atau kebiasaan yang dijaga.",
      formula:
        "V辞書形 / Vない + ようにしています",
      exampleJa:
        "毎日、日本語を話すようにしています。",
      exampleId:
        "Saya berusaha berbicara bahasa Jepang setiap hari.",
      noteId:
        "Berbeda dari ～ようになりました yang menyatakan hasil perubahan.",
    };
  }

  if (/ながら/.test(p)) {
    return {
      pattern,
      functionId:
        "Melakukan dua kegiatan bersamaan.",
      formula:
        "Vます-stem + ながら",
      exampleJa:
        "音楽を聞きながら料理します。",
      exampleId:
        "Saya memasak sambil mendengarkan musik.",
      noteId:
        "Subjek kedua tindakan biasanya sama.",
    };
  }

  if (/そうです/.test(p)) {
    return {
      pattern,
      functionId:
        "Menyatakan kesan 'kelihatannya' atau informasi yang didengar, tergantung bentuk.",
      formula:
        "Vます-stem / Aい→Aそう / Aな→Aそう + です",
      exampleJa:
        "この料理はおいしそうです。",
      exampleId:
        "Masakan ini kelihatannya enak.",
      noteId:
        "Bedakan そうです 'kelihatannya' dengan そうです 'katanya' dari konteks.",
    };
  }

  if (/ています/.test(p)) {
    return {
      pattern,
      functionId:
        "Menyatakan kegiatan berlangsung, keadaan hasil, atau kebiasaan.",
      formula:
        "Vて + います",
      exampleJa:
        "今、会社で働いています。",
      exampleId:
        "Sekarang saya bekerja di perusahaan.",
      noteId:
        "Arti tepatnya bergantung jenis verba dan konteks.",
    };
  }

  if (/てもらえませんか/.test(p)) {
    return {
      pattern,
      functionId:
        "Meminta bantuan secara sopan.",
      formula:
        "Vて + もらえませんか",
      exampleJa:
        "読み方を教えてもらえませんか。",
      exampleId:
        "Bersediakah memberi tahu cara membacanya?",
      noteId:
        "Lebih halus daripada ～てください.",
    };
  }

  if (/てください/.test(p)) {
    return {
      pattern,
      functionId:
        "Membuat permintaan / instruksi.",
      formula:
        "Vて + ください",
      exampleJa:
        "ここに名前を書いてください。",
      exampleId:
        "Tolong tulis nama di sini.",
      noteId:
        "Perhatikan bentuk て dari verba.",
    };
  }

  if (/方/.test(p)) {
    return {
      pattern,
      functionId:
        "Menjelaskan atau menanyakan cara.",
      formula:
        "Vます-stem + 方（かた）",
      exampleJa:
        "この機械の使い方を教えてください。",
      exampleId:
        "Tolong ajari cara menggunakan mesin ini.",
      noteId:
        "ます dihilangkan: 使います → 使い方.",
    };
  }

  if (
    /があります|います/.test(p)
  ) {
    return {
      pattern,
      functionId:
        "Menyatakan keberadaan.",
      formula:
        "Nがあります（benda）／Nがいます（makhluk hidup）",
      exampleJa:
        "駅の前にコンビニがあります。",
      exampleId:
        "Ada minimarket di depan stasiun.",
      noteId:
        "あります untuk benda; います untuk orang/hewan.",
    };
  }

  if (/が好き/.test(p)) {
    return {
      pattern,
      functionId:
        "Menyatakan kesukaan.",
      formula:
        "Nが好きです",
      exampleJa:
        "日本の音楽が好きです。",
      exampleId:
        "Saya suka musik Jepang.",
      noteId:
        "Objek kesukaan biasanya ditandai が.",
    };
  }

  if (/たい/.test(p)) {
    return {
      pattern,
      functionId:
        "Menyatakan keinginan.",
      formula:
        "Vます-stem + たいです",
      exampleJa:
        "休みに京都へ行きたいです。",
      exampleId:
        "Saat libur saya ingin pergi ke Kyoto.",
      noteId:
        "Biasanya dipakai untuk keinginan pembicara.",
    };
  }

  if (
    /ましょう|ませんか/.test(p)
  ) {
    return {
      pattern,
      functionId:
        "Mengajak atau mengusulkan kegiatan bersama.",
      formula:
        "Vます-stem + ましょう／Vませんか",
      exampleJa:
        "一緒に昼ご飯を食べませんか。",
      exampleId:
        "Mau makan siang bersama?",
      response:
        "はい、いいですね。／すみません、今日はちょっと…。",
      noteId:
        "～ませんか terdengar lebih sebagai ajakan.",
    };
  }

  if (/ので/.test(p)) {
    return {
      pattern,
      functionId:
        "Menyampaikan alasan dengan nuansa halus.",
      formula:
        "普通形 + ので（N/Aな + なので）",
      exampleJa:
        "道に迷ったので、少し遅れます。",
      exampleId:
        "Karena tersesat, saya akan sedikit terlambat.",
      noteId:
        "ので sering lebih halus daripada から.",
    };
  }

  if (/たら/.test(p)) {
    return {
      pattern,
      functionId:
        "Menyatakan kondisi kalau/jika.",
      formula:
        "Vた + ら",
      exampleJa:
        "雨が降ったら、イベントは中止です。",
      exampleId:
        "Kalau hujan, acara dibatalkan.",
      noteId:
        "Klausa utama terjadi setelah kondisi terpenuhi.",
    };
  }

  if (/とき/.test(p)) {
    return {
      pattern,
      functionId:
        "Menyatakan waktu 'ketika'.",
      formula:
        "V普通形 / A / Nの + とき",
      exampleJa:
        "地震のとき、エレベーターを使わないでください。",
      exampleId:
        "Saat gempa, jangan gunakan lift.",
      noteId:
        "Bentuk sebelum とき memengaruhi hubungan waktu.",
    };
  }

  if (
    /より|ほうが|いちばん/.test(p)
  ) {
    return {
      pattern,
      functionId:
        "Membandingkan.",
      formula:
        "AよりBのほうが～／Nの中で～がいちばん～",
      exampleJa:
        "バスより電車のほうが速いです。",
      exampleId:
        "Kereta lebih cepat daripada bus.",
      noteId:
        "Dalam AよりBのほうが, B memiliki sifat lebih kuat.",
    };
  }

  if (/と思います/.test(p)) {
    return {
      pattern,
      functionId:
        "Menyampaikan pendapat atau dugaan.",
      formula:
        "普通形 + と思います",
      exampleJa:
        "この方法がいいと思います。",
      exampleId:
        "Saya pikir cara ini bagus.",
      noteId:
        "Sebelum と思います gunakan bentuk biasa.",
    };
  }

  if (/です|ます/.test(p)) {
    return {
      pattern,
      functionId:
        "Kalimat sopan dasar untuk identitas, keadaan, dan kegiatan.",
      formula:
        "N/Aな + です／Vます",
      exampleJa:
        "私は会社員です。毎日九時から働きます。",
      exampleId:
        "Saya pegawai perusahaan. Saya bekerja mulai pukul sembilan.",
      noteId:
        "Ini adalah dasar sebelum pola yang lebih kompleks.",
    };
  }

  return {
    pattern,
    functionId:
      "Pola utama bab untuk komunikasi sesuai konteks.",
    formula: pattern,
    exampleJa:
      "この文型を使って、短い会話を作ります。",
    exampleId:
      "Gunakan pola ini dalam percakapan pendek.",
    noteId:
      "Latih fungsi dan konteks, bukan hanya menghafal rumus.",
  };
}

function domain(
  topic: string
) {
  const t =
    topic.toLowerCase();

  if (
    /food|dish|meal|restaurant|makanan|料理|食/.test(
      t
    )
  )
    return "food";

  if (
    /health|healthy|病|健康/.test(t)
  )
    return "health";

  if (
    /work|company|会社|仕事/.test(t)
  )
    return "work";

  if (
    /study|japanese|bahasa jepang|教室|日本語/.test(
      t
    )
  )
    return "study";

  if (
    /town|transport|trip|travel|kota|perjalanan|駅|交通/.test(
      t
    )
  )
    return "transport";

  if (
    /shop|shopping|belanja|store|買/.test(
      t
    )
  )
    return "shopping";

  if (
    /home|house|rumah|部屋/.test(t)
  )
    return "home";

  if (
    /family|relationship|people|diriku|myself|家族/.test(
      t
    )
  )
    return "family";

  if (
    /season|weather|nature|environment|天気|alam/.test(
      t
    )
  )
    return "weather";

  if (
    /holiday|event|hobby|like|leisure|libur|映画|趣味/.test(
      t
    )
  )
    return "leisure";

  return "general";
}

function dialogue(
  chapter: BookChapter,
  vocab: V[]
): Line[] {
  const d =
    domain(chapter.topic);

  const a =
    vocab[0]?.surface ||
    "日本語";

  const b =
    vocab[1]?.surface ||
    "時間";

  const map: Record<
    string,
    Line[]
  > = {
    study: [
      {
        speaker: "A",
        ja:
          `すみません、「${a}」の読み方がわかりません。`,
        id:
          `Permisi, saya tidak tahu cara membaca “${a}”.`,
      },
      {
        speaker: "B",
        ja:
          "いいですよ。いっしょに確認しましょう。",
        id:
          "Baik, mari kita periksa bersama.",
      },
      {
        speaker: "A",
        ja:
          `それから、${b}についても質問してもいいですか。`,
        id:
          `Setelah itu, boleh saya bertanya tentang ${b}?`,
      },
      {
        speaker: "B",
        ja:
          "はい、もちろんです。",
        id:
          "Ya, tentu.",
      },
    ],

    food: [
      {
        speaker: "A",
        ja:
          `すみません、${a}はありますか。`,
        id:
          `Permisi, apakah ada ${a}?`,
      },
      {
        speaker: "B",
        ja:
          `はい。${b}もおすすめです。`,
        id:
          `Ada. ${b} juga direkomendasikan.`,
      },
      {
        speaker: "A",
        ja:
          "じゃ、それを一つお願いします。",
        id:
          "Kalau begitu, saya pesan satu.",
      },
      {
        speaker: "B",
        ja:
          "はい、かしこまりました。",
        id:
          "Baik.",
      },
    ],

    transport: [
      {
        speaker: "A",
        ja:
          `${a}へ行きたいんですが、どう行けばいいですか。`,
        id:
          `Saya ingin pergi ke ${a}, bagaimana caranya?`,
      },
      {
        speaker: "B",
        ja:
          `この道をまっすぐ行って、${b}のところで右に曲がってください。`,
        id:
          `Jalan lurus lalu belok kanan di ${b}.`,
      },
      {
        speaker: "A",
        ja:
          "歩いて何分ぐらいですか。",
        id:
          "Sekitar berapa menit berjalan kaki?",
      },
      {
        speaker: "B",
        ja:
          "十分ぐらいです。",
        id:
          "Sekitar sepuluh menit.",
      },
    ],

    work: [
      {
        speaker: "A",
        ja:
          `${a}はもう終わりましたか。`,
        id:
          `Apakah ${a} sudah selesai?`,
      },
      {
        speaker: "B",
        ja:
          `まだです。先に${b}を確認しています。`,
        id:
          `Belum. Saya mengecek ${b} terlebih dahulu.`,
      },
      {
        speaker: "A",
        ja:
          "終わったら教えてください。",
        id:
          "Tolong beri tahu kalau sudah selesai.",
      },
      {
        speaker: "B",
        ja:
          "はい、わかりました。",
        id:
          "Baik.",
      },
    ],

    health: [
      {
        speaker: "A",
        ja: "どうしましたか。",
        id: "Ada keluhan apa?",
      },
      {
        speaker: "B",
        ja:
          `${a}が痛くて、少し熱もあります。`,
        id:
          `${a} saya sakit dan sedikit demam.`,
      },
      {
        speaker: "A",
        ja:
          `${b}を飲んで、今日は休んだほうがいいですよ。`,
        id:
          `Minumlah ${b} dan sebaiknya istirahat.`,
      },
      {
        speaker: "B",
        ja:
          "はい、そうします。",
        id:
          "Baik.",
      },
    ],

    general: [
      {
        speaker: "A",
        ja:
          `${a}について教えてください。`,
        id:
          `Tolong jelaskan tentang ${a}.`,
      },
      {
        speaker: "B",
        ja:
          `はい。まず${b}を確認しましょう。`,
        id:
          `Baik. Pertama periksa ${b}.`,
      },
      {
        speaker: "A",
        ja:
          "わかりました。",
        id:
          "Baik.",
      },
      {
        speaker: "B",
        ja:
          "わからないことがあったら、聞いてください。",
        id:
          "Kalau ada yang tidak dipahami, silakan bertanya.",
      },
    ],
  };

  return (
    map[d] ||
    map.general
  );
}

function reading(
  chapter: BookChapter,
  vocab: V[]
) {
  const d =
    domain(chapter.topic);

  const a =
    vocab[0]?.surface ||
    "日本語";

  const b =
    vocab[1]?.surface ||
    "時間";

  if (d === "transport") {
    return {
      title:
        "駅からのお知らせ",
      text:
        `土曜日は駅前で工事があります。午前9時から午後3時まで、東口は使えません。${a}へ行く人は西口を使ってください。${b}の近くに案内の人がいます。`,
      q:
        "土曜日、使えないのはどこですか。",
      ans: "東口",
    };
  }

  if (d === "food") {
    return {
      title:
        "レストランのお知らせ",
      text:
        `今日のランチは11時30分からです。${a}を注文した人には、${b}が一つ付きます。アレルギーがある人は注文する前に店員に言ってください。`,
      q:
        "アレルギーがある人は、いつ店員に言いますか。",
      ans:
        "注文する前",
    };
  }

  if (d === "work") {
    return {
      title:
        "会社のメモ",
      text:
        `明日の会議は10時から会議室Bで行います。${a}と${b}を持ってきてください。会議室Aではありません。`,
      q:
        "会議はどこでありますか。",
      ans:
        "会議室B",
    };
  }

  return {
    title:
      "この課の案内",
    text:
      `今週は「${chapter.topic}」について勉強します。まず${a}と${b}を確認します。そのあと、短い会話を聞いて、ペアで練習します。最後に生活場面の短い文章を読みます。`,
    q:
      "最初に何を確認しますか。",
    ans:
      `${a}と${b}`,
  };
}

function culture(
  topic: string
) {
  const d =
    domain(topic);

  const notes: Record<
    string,
    string
  > = {
    study:
      "Saat belum memahami instruksi, ungkapan すみません・もう一度お願いします・ゆっくりお願いします sangat berguna. Meminta klarifikasi adalah bagian dari kemampuan komunikasi.",

    food:
      "Di restoran, sampaikan alergi atau makanan yang tidak dapat dimakan sebelum memesan. Fokus pada ungkapan praktis seperti ～は食べられません dan ～なしでお願いします.",

    transport:
      "Informasi transportasi sering berupa waktu, nomor peron, pintu keluar, arah, dan tindakan berikutnya. Latih pencarian kata kunci, bukan menerjemahkan semua kata.",

    work:
      "Situasi kerja banyak memakai permintaan, izin, konfirmasi, laporan status, serta ungkapan bahwa sesuatu belum selesai. Kesopanan dan kejelasan sama pentingnya.",

    health:
      "Saat menjelaskan kondisi kesehatan, sampaikan bagian tubuh, gejala, sejak kapan, dan tingkat keparahan secara sederhana.",

    shopping:
      "Saat belanja, kata kunci ukuran, harga, warna, jumlah, dan ketersediaan biasanya paling penting.",

    general:
      "Untuk kehidupan sehari-hari dan JFT, prioritaskan siapa, kapan, di mana, berapa, dan tindakan berikutnya sebelum menerjemahkan detail.",
  };

  return (
    notes[d] ||
    notes.general
  );
}

const progressKey = (
  book: string,
  chapter: string
) =>
  `kezett-chapter-progress:${book}:${chapter}`;

const vocabularyKey = (
  book: string,
  chapter: string
) =>
  `kezett-chapter-vocab:${book}:${chapter}`;

export function ChapterStudy({
  locale,
  book,
  chapter,
}: {
  locale: Locale;
  book: BookResource;
  chapter: BookChapter;
}) {
  const id =
    locale === "id";

  const [
    mastered,
    setMastered,
  ] =
    useState<string[]>([]);

  const [
    done,
    setDone,
  ] =
    useState<string[]>([]);

  const [
    listeningAnswer,
    setListeningAnswer,
  ] =
    useState<number | null>(
      null
    );

  const [
    showReadingAnswer,
    setShowReadingAnswer,
  ] =
    useState(false);

  const [
    answers,
    setAnswers,
  ] =
    useState<
      Record<string, number>
    >({});

  const vocab =
    useMemo(
      () =>
        chapter.vocabulary.map(
          vocabInfo
        ),
      [chapter.vocabulary]
    );

  const grammar =
    useMemo(
      () =>
        chapter.grammar.map(
          grammarInfo
        ),
      [chapter.grammar]
    );

  const chapterKanji =
    useMemo(() => {
      const chars =
        new Set(
          vocab.flatMap(
            (v) => [
              ...v.surface,
            ]
          )
        );

      return kanji
        .filter((k) =>
          chars.has(k.kanji)
        )
        .slice(0, 8);
    }, [vocab]);

  const conversation =
    useMemo(
      () =>
        dialogue(
          chapter,
          vocab
        ),
      [chapter, vocab]
    );

  const readingData =
    useMemo(
      () =>
        reading(
          chapter,
          vocab
        ),
      [chapter, vocab]
    );

  useEffect(() => {
    try {
      setMastered(
        JSON.parse(
          localStorage.getItem(
            vocabularyKey(
              book.id,
              chapter.id
            )
          ) || "[]"
        )
      );

      setDone(
        JSON.parse(
          localStorage.getItem(
            progressKey(
              book.id,
              chapter.id
            )
          ) || "[]"
        )
      );
    } catch {
      setMastered([]);
      setDone([]);
    }
  }, [
    book.id,
    chapter.id,
  ]);

  const markSection = (
    section: string
  ) => {
    setDone(
      (current) => {
        const next =
          current.includes(
            section
          )
            ? current.filter(
                (x) =>
                  x !== section
              )
            : [
                ...current,
                section,
              ];

        localStorage.setItem(
          progressKey(
            book.id,
            chapter.id
          ),
          JSON.stringify(next)
        );

        markStudyActivity();

        return next;
      }
    );
  };

  const toggleVocabulary = (
    word: string
  ) => {
    setMastered(
      (current) => {
        const next =
          current.includes(word)
            ? current.filter(
                (x) =>
                  x !== word
              )
            : [
                ...current,
                word,
              ];

        localStorage.setItem(
          vocabularyKey(
            book.id,
            chapter.id
          ),
          JSON.stringify(next)
        );

        markStudyActivity();

        return next;
      }
    );
  };

  const speak = (
    text: string
  ) => {
    if (
      typeof window ===
        "undefined" ||
      !(
        "speechSynthesis" in
        window
      )
    )
      return;

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.lang =
      "ja-JP";

    utterance.rate =
      0.9;

    const voice =
      window.speechSynthesis
        .getVoices()
        .find((v) =>
          v.lang
            .toLowerCase()
            .startsWith("ja")
        );

    if (voice)
      utterance.voice =
        voice;

    window.speechSynthesis.speak(
      utterance
    );

    markStudyActivity();
  };

  const listeningText =
    conversation
      .map(
        (x) =>
          `${x.speaker}：${x.ja}`
      )
      .join("。 ");

  const sections = [
    "overview",
    "vocab",
    "kanji",
    "grammar",
    "conversation",
    "listening",
    "reading",
    "culture",
    "practice",
    "summary",
  ];

  const progress =
    Math.round(
      (
        done.filter((x) =>
          sections.includes(x)
        ).length /
        sections.length
      ) *
        100
    );

  const exercises = [
    {
      id: "vocabulary",
      label: "Vocabulary",
      question:
        `Apa arti 「${vocab[0]?.surface || "日本語"}」?`,
      options: [
        vocab[0]?.meaning ||
          "bahasa Jepang",
        vocab[1]?.meaning ||
          "waktu",
        "stasiun",
        "libur",
      ],
      answer: 0,
      explanation:
        vocab[0]
          ? `${vocab[0].surface}（${vocab[0].reading}）= ${vocab[0].meaning}`
          : "Periksa kosakata inti.",
    },

    {
      id: "grammar",
      label: "Grammar",
      question:
        grammar[0]
          ?.functionId ||
        "Pilih pola utama bab.",
      options: [
        grammar[0]?.formula ||
          "～です／ます",
        "～しか",
        "～ばかり",
        "～ながら",
      ],
      answer: 0,
      explanation:
        grammar[0]?.noteId ||
        "Periksa pola bab.",
    },

    {
      id: "conversation",
      label: "Conversation",
      question:
        "Ungkapan mana yang digunakan untuk meminta lawan bicara mengulang?",
      options: [
        "もう一度お願いします。",
        "いただきます。",
        "お大事に。",
        "いってらっしゃい。",
      ],
      answer: 0,
      explanation:
        "もう一度お願いします digunakan untuk meminta lawan bicara mengulang.",
    },

    {
      id: "reading",
      label: "Reading",
      question:
        readingData.q,
      options: [
        readingData.ans,
        "午後8時",
        "日曜日",
        "わかりません",
      ],
      answer: 0,
      explanation:
        `Jawaban ada pada informasi inti: ${readingData.ans}`,
    },
  ];

  return (
    <div className="space-y-5">
      <Link
        href={`/${locale}/library/${book.id}`}
        className="btn-ghost"
      >
        <ArrowLeft
          size={17}
        />
        {book.title}
      </Link>

      <section className="card p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="badge border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                {id
                  ? `Bab ${chapter.number}`
                  : `Lesson ${chapter.number}`}
              </span>

              <span className="badge border-slate-200 dark:border-slate-700">
                {chapter.level}
              </span>

              <span className="badge border-slate-200 dark:border-slate-700">
                {chapter.sourceMapping}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black">
              {chapter.title}
            </h1>

            <p className="mt-2 text-slate-500">
              {chapter.topic}
            </p>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              {chapter.sourceMapping ===
              "direct"
                ? id
                  ? "Cakupan bab mengikuti topik/lesson yang dapat dipetakan langsung dari sumber. Penjelasan Kezett ditulis ulang untuk belajar, bukan salinan halaman buku."
                  : "出典のトピックに直接対応。Kezettの説明は学習用の再構成です。"
                : id
                  ? "Urutan bab dinormalisasi dari sumber agar cocok menjadi jalur belajar Kezett. Gunakan Buku sumber untuk melihat susunan asli."
                  : "出典をKezettの学習順に正規化しています。"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              target="_blank"
              rel="noreferrer"
              href={
                book.sourceUrl
              }
              className="btn-ghost border border-slate-200 dark:border-slate-700"
            >
              <ExternalLink
                size={17}
              />
              {id
                ? "Buku sumber"
                : "原典"}
            </a>

            <Link
              href={`/${locale}/library/${book.id}/${chapter.id}/quiz`}
              className="btn-primary"
            >
              <GraduationCap
                size={18}
              />
              {id
                ? "Tes Bab · 20 soal"
                : "章テスト・20問"}
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs font-bold text-slate-500">
            <span>
              {id
                ? "Progress belajar bab"
                : "学習進捗"}
            </span>

            <span>
              {progress}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width:
                  `${progress}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Box
          title={
            id
              ? "1. Tujuan Bab / Can-do"
              : "1. Can-do"
          }
          icon={
            <ListChecks />
          }
          done={done.includes(
            "overview"
          )}
          onDone={() =>
            markSection(
              "overview"
            )
          }
        >
          <div className="space-y-3">
            {chapter.canDo.map(
              (item, index) => (
                <div
                  key={item}
                  className="flex gap-3 text-sm"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-black text-emerald-700">
                    {index + 1}
                  </span>

                  <span>
                    {item}
                  </span>
                </div>
              )
            )}
          </div>
        </Box>

        <Box
          title={
            id
              ? "2. Materi Bab Lengkap"
              : "2. 章のポイント"
          }
          icon={
            <BookOpenCheck />
          }
        >
          <div className="space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            <p>
              {id
                ? `Bab ini berfokus pada tema “${chapter.topic}”. Targetnya bukan sekadar hafal kata, tetapi mampu memakai kosakata dan pola dalam situasi sesuai level ${chapter.level}.`
                : `「${chapter.topic}」を中心に、語彙だけでなく生活場面で使えることを目指します。`}
            </p>

            <p>
              {id
                ? "Mulai dengan mengenali siapa yang berbicara, tempat, dan tujuan percakapan. Setelah itu cari informasi kunci seperti waktu, jumlah, arah, izin, larangan, alasan, atau tindakan berikutnya."
                : "話者・場所・目的を確認し、時間・数量・方向・許可・禁止・理由・次の行動を拾います。"}
            </p>

            <p>
              {id
                ? "Untuk JFT, biasakan mengambil informasi inti tanpa menerjemahkan seluruh kalimat kata demi kata."
                : "JFTでは逐語訳より必要情報を取る練習を重視します。"}
            </p>
          </div>
        </Box>
      </section>

      <Box
        title={
          id
            ? "3. Kosakata Bab"
            : "3. 語彙"
        }
        icon={
          <Languages />
        }
        done={done.includes(
          "vocab"
        )}
        onDone={() =>
          markSection("vocab")
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {vocab.map((v) => {
            const learned =
              mastered.includes(
                v.surface
              );

            return (
              <div
                key={v.surface}
                className="soft-card p-4"
              >
                <div className="flex justify-between">
                  <div>
                    <div className="jp text-xl font-black">
                      {v.surface}
                    </div>

                    <div className="text-sm text-slate-500">
                      {v.reading}
                      {" · "}
                      {v.romaji}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      speak(
                        v.reading
                      )
                    }
                    className="btn-ghost p-2"
                  >
                    <Volume2
                      size={17}
                    />
                  </button>
                </div>

                <div className="mt-3 font-bold">
                  {v.meaning}
                </div>

                <div className="text-xs uppercase text-slate-400">
                  {v.pos}
                </div>

                <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <div className="jp text-sm font-bold">
                    {v.exampleJa}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {v.exampleId}
                  </div>
                </div>

                <button
                  onClick={() =>
                    toggleVocabulary(
                      v.surface
                    )
                  }
                  className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${
                    learned
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {learned ? (
                    <Check
                      size={16}
                    />
                  ) : (
                    <Circle
                      size={16}
                    />
                  )}

                  {learned
                    ? id
                      ? "Sudah hafal"
                      : "覚えた"
                    : id
                      ? "Tandai sudah hafal"
                      : "チェック"}
                </button>
              </div>
            );
          })}
        </div>
      </Box>

      <Box
        title={
          id
            ? "4. Kanji Bab"
            : "4. 漢字"
        }
        icon={
          <Languages />
        }
        done={done.includes(
          "kanji"
        )}
        onDone={() =>
          markSection("kanji")
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {chapterKanji.length ? (
            chapterKanji.map(
              (k) => (
                <div
                  key={k.kanji}
                  className="soft-card p-4"
                >
                  <div className="jp text-4xl font-black">
                    {k.kanji}
                  </div>

                  <div className="mt-2 font-bold">
                    {k.meaningId}
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    音:{" "}
                    {k.onyomi.join(
                      "・"
                    ) || "—"}
                  </div>

                  <div className="text-xs text-slate-500">
                    訓:{" "}
                    {k.kunyomi.join(
                      "・"
                    ) || "—"}
                  </div>

                  <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                    <div className="jp font-bold">
                      {
                        k.words[0]
                          ?.word
                      }
                    </div>

                    <div className="text-xs text-slate-500">
                      {
                        k.words[0]
                          ?.reading
                      }
                      {" · "}
                      {
                        k.words[0]
                          ?.meaningId
                      }
                    </div>
                  </div>
                </div>
              )
            )
          ) : (
            <p className="text-sm text-slate-500">
              {id
                ? "Belum ada kanji target yang cocok dengan database Kanji Master untuk bab ini."
                : "対象漢字はまだありません。"}
            </p>
          )}
        </div>
      </Box>

      <Box
        title={
          id
            ? "5. Grammar / Bunpou"
            : "5. 文法・文型"
        }
        icon={
          <BookOpenCheck />
        }
        done={done.includes(
          "grammar"
        )}
        onDone={() =>
          markSection("grammar")
        }
      >
        <div className="space-y-4">
          {grammar.map(
            (g, index) => (
              <div
                key={index}
                className="soft-card p-4 md:p-5"
              >
                <div className="jp text-lg font-black">
                  {g.pattern}
                </div>

                <div className="mt-3 grid gap-4 lg:grid-cols-2">
                  <div>
                    <b className="text-xs uppercase text-emerald-600">
                      {id
                        ? "Fungsi"
                        : "機能"}
                    </b>

                    <p className="mt-1 text-sm">
                      {
                        g.functionId
                      }
                    </p>

                    <b className="mt-3 block text-xs uppercase text-emerald-600">
                      {id
                        ? "Pola"
                        : "形"}
                    </b>

                    <div className="jp mt-1 rounded-xl bg-slate-50 p-3 text-sm font-bold dark:bg-slate-800">
                      {g.formula}
                    </div>

                    {g.response && (
                      <>
                        <b className="mt-3 block text-xs uppercase text-emerald-600">
                          {id
                            ? "Respons umum"
                            : "応答"}
                        </b>

                        <div className="jp mt-1 text-sm">
                          {
                            g.response
                          }
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <b className="text-xs uppercase text-emerald-600">
                      {id
                        ? "Contoh"
                        : "例"}
                    </b>

                    <div className="jp mt-1 font-bold">
                      {
                        g.exampleJa
                      }
                    </div>

                    <div className="text-sm text-slate-500">
                      {
                        g.exampleId
                      }
                    </div>

                    <div className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                      <Lightbulb
                        size={17}
                        className="shrink-0"
                      />

                      <span>
                        {g.noteId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </Box>

      <section className="grid gap-4 lg:grid-cols-2">
        <Box
          title={
            id
              ? "6. Percakapan / 会話"
              : "6. 会話"
          }
          icon={
            <MessageCircle />
          }
          done={done.includes(
            "conversation"
          )}
          onDone={() =>
            markSection(
              "conversation"
            )
          }
        >
          <div className="space-y-3">
            {conversation.map(
              (line, index) => (
                <div
                  key={index}
                  className="flex gap-3"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-black text-emerald-700">
                    {
                      line.speaker
                    }
                  </span>

                  <div>
                    <div className="jp font-bold leading-7">
                      {line.ja}
                    </div>

                    <div className="text-sm text-slate-500">
                      {line.id}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <button
            onClick={() =>
              speak(
                listeningText
              )
            }
            className="btn-ghost mt-4 border border-slate-200 dark:border-slate-700"
          >
            <Volume2
              size={17}
            />

            {id
              ? "Dengarkan percakapan"
              : "会話を聞く"}
          </button>
        </Box>

        <Box
          title={
            id
              ? "7. Listening"
              : "7. 聴解"
          }
          icon={
            <Headphones />
          }
          done={done.includes(
            "listening"
          )}
          onDone={() =>
            markSection(
              "listening"
            )
          }
        >
          <p className="text-sm text-slate-500">
            {id
              ? "Dengarkan dulu tanpa transkrip. Transkrip muncul setelah menjawab."
              : "先に音声を聞き、回答後にスクリプトを確認します。"}
          </p>

          <button
            onClick={() =>
              speak(
                listeningText
              )
            }
            className="btn-primary mt-4"
          >
            <Play
              size={17}
            />

            {id
              ? "Putar audio"
              : "音声を再生"}
          </button>

          <div className="mt-5 font-bold">
            {id
              ? "Kata penting apa yang muncul pertama?"
              : "最初の重要語はどれですか。"}
          </div>

          <div className="mt-3 grid gap-2">
            {[
              vocab[0]
                ?.surface ||
                "日本語",

              vocab[1]
                ?.surface ||
                "時間",

              "明日",
              "駅",
            ].map(
              (
                option,
                index
              ) => (
                <button
                  key={`${option}-${index}`}
                  onClick={() => {
                    setListeningAnswer(
                      index
                    );

                    markStudyActivity();
                  }}
                  className={`rounded-xl border p-3 text-left text-sm font-bold ${
                    listeningAnswer ===
                    index
                      ? index === 0
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-rose-400 bg-rose-50"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {String.fromCharCode(
                    65 +
                      index
                  )}
                  . {option}
                </button>
              )
            )}
          </div>

          {listeningAnswer !==
            null && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <b className="text-xs uppercase text-slate-400">
                Transcript
              </b>

              <div className="jp mt-2 text-sm leading-7">
                {
                  listeningText
                }
              </div>
            </div>
          )}
        </Box>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <Box
          title={
            id
              ? "8. Reading"
              : "8. 読解"
          }
          icon={
            <BookOpenCheck />
          }
          done={done.includes(
            "reading"
          )}
          onDone={() =>
            markSection(
              "reading"
            )
          }
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
            <b className="jp">
              【
              {
                readingData.title
              }
              】
            </b>

            <p className="jp mt-3 leading-8">
              {
                readingData.text
              }
            </p>
          </div>

          <div className="mt-4 font-bold">
            {
              readingData.q
            }
          </div>

          <button
            onClick={() => {
              setShowReadingAnswer(
                !showReadingAnswer
              );

              markStudyActivity();
            }}
            className="btn-ghost mt-3 border border-slate-200 dark:border-slate-700"
          >
            <RotateCcw
              size={17}
            />

            {showReadingAnswer
              ? id
                ? "Sembunyikan"
                : "隠す"
              : id
                ? "Cek jawaban"
                : "答えを見る"}
          </button>

          {showReadingAnswer && (
            <div className="mt-3 rounded-xl bg-emerald-50 p-3 font-bold text-emerald-700">
              {
                readingData.ans
              }
            </div>
          )}
        </Box>

        <Box
          title={
            id
              ? "9. Catatan Budaya / Situasi Jepang"
              : "9. 文化・生活メモ"
          }
          icon={
            <Lightbulb />
          }
          done={done.includes(
            "culture"
          )}
          onDone={() =>
            markSection(
              "culture"
            )
          }
        >
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
            {culture(
              chapter.topic
            )}
          </p>

          <div className="mt-4 rounded-xl bg-amber-50 p-4 text-xs leading-6 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            {id
              ? "Catatan ini adalah penjelasan kontekstual Kezett, bukan kutipan verbatim dari buku."
              : "Kezettの補足説明で、原典の逐語引用ではありません。"}
          </div>
        </Box>
      </section>

      <Box
        title={
          id
            ? "10. Latihan Bertahap"
            : "10. 段階練習"
        }
        icon={
          <Sparkles />
        }
        done={done.includes(
          "practice"
        )}
        onDone={() =>
          markSection(
            "practice"
          )
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {exercises.map(
            (exercise) => {
              const selected =
                answers[
                  exercise.id
                ];

              return (
                <div
                  key={
                    exercise.id
                  }
                  className="soft-card p-4"
                >
                  <b className="text-xs uppercase text-emerald-600">
                    {
                      exercise.label
                    }
                  </b>

                  <div className="mt-2 font-bold">
                    {
                      exercise.question
                    }
                  </div>

                  <div className="mt-3 space-y-2">
                    {exercise.options.map(
                      (
                        option,
                        index
                      ) => (
                        <button
                          key={`${option}-${index}`}
                          onClick={() => {
                            setAnswers(
                              (
                                current
                              ) => ({
                                ...current,
                                [exercise.id]:
                                  index,
                              })
                            );

                            markStudyActivity();
                          }}
                          className={`w-full rounded-xl border p-3 text-left text-sm ${
                            selected ===
                            index
                              ? index ===
                                exercise.answer
                                ? "border-emerald-400 bg-emerald-50"
                                : "border-rose-400 bg-rose-50"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {String.fromCharCode(
                            65 +
                              index
                          )}
                          .{" "}
                          {option}
                        </button>
                      )
                    )}
                  </div>

                  {selected !==
                    undefined && (
                    <div className="mt-3 text-sm text-slate-500">
                      {selected ===
                      exercise.answer
                        ? "✓ "
                        : "✕ "}

                      {
                        exercise.explanation
                      }
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </Box>

      <Box
        title={
          id
            ? "11. Ringkasan Bab"
            : "11. 章まとめ"
        }
        icon={
          <CheckCircle2 />
        }
        done={done.includes(
          "summary"
        )}
        onDone={() =>
          markSection(
            "summary"
          )
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            [
              id
                ? "Kosakata"
                : "語彙",

              `${mastered.length}/${vocab.length}`,
            ],

            [
              id
                ? "Kanji"
                : "漢字",

              String(
                chapterKanji.length
              ),
            ],

            [
              id
                ? "Pola grammar"
                : "文型",

              String(
                grammar.length
              ),
            ],

            [
              id
                ? "Percakapan"
                : "会話",

              "1",
            ],

            [
              id
                ? "Listening + Reading"
                : "聴解＋読解",

              "2",
            ],
          ].map(
            ([
              label,
              value,
            ]) => (
              <div
                key={label}
                className="soft-card p-4"
              >
                <div className="text-2xl font-black">
                  {value}
                </div>

                <div className="text-xs text-slate-500">
                  {label}
                </div>
              </div>
            )
          )}
        </div>
      </Box>

      <section className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-black">
            {id
              ? "12. Tes Bab"
              : "12. 章テスト"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {id
              ? "20 soal menyesuaikan kosakata, pola, konteks, dan level bab: vocabulary, grammar/ungkapan, listening, dan reading."
              : "語彙・文型・場面・レベルに合わせた20問。"}
          </p>
        </div>

        <Link
          href={`/${locale}/library/${book.id}/${chapter.id}/quiz`}
          className="btn-primary"
        >
          <GraduationCap
            size={18}
          />

          {id
            ? "Mulai Tes Bab"
            : "章テスト開始"}
        </Link>
      </section>
    </div>
  );
}

function Box({
  title,
  icon,
  done,
  onDone,
  children,
}: {
  title: string;
  icon: ReactNode;
  done?: boolean;
  onDone?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-emerald-600">
          {icon}

          <h2 className="text-lg font-black text-slate-950 dark:text-white">
            {title}
          </h2>
        </div>

        {onDone && (
          <button
            onClick={onDone}
            className="btn-ghost p-2"
          >
            {done ? (
              <CheckCircle2 className="text-emerald-600" />
            ) : (
              <Circle />
            )}
          </button>
        )}
      </div>

      <div className="mt-4">
        {children}
      </div>
    </section>
  );
}