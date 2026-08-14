# Kezett — Node.js / Next.js

Kezett adalah aplikasi belajar pribadi untuk persiapan JFT-Basic. Project ini menggunakan **Next.js + TypeScript + Tailwind CSS + Framer Motion** dan dijalankan dengan Node.js.

## Revisi v3 Node

- **21 Try Out JFT** dalam satu menu.
  - Paket berstatus `Verified` tetap diberi badge hijau.
  - Paket partial/reconstruction dinormalisasi sebagai `Reconstructed` dan tetap diberi badge amber.
  - Nama file PDF/XLSX tidak ditampilkan di kartu Try Out.
  - 50 soal / 60 menit / 4 bagian per simulasi.
  - Vocabulary, Conversation/Expression, Listening, Reading.
  - Section lock, flag/ragu, Previous/Next, timer, auto-submit, auto-scoring.
  - Listening bergerak maju dan audio maksimal 2 kali.
  - Di dalam runner terdapat switch **Sumber / 日本語**. Default adalah 日本語.

- **Latihan Soal diganti menjadi Drilling Soal**.
  - Total **1.000 soal baru bergaya JFT**.
  - 250 Huruf & Kosakata.
  - 250 Percakapan & Ungkapan.
  - 250 Listening.
  - 250 Reading.
  - Mode Campuran 4 Tes.
  - Pilihan sesi 10 / 20 / 50 soal.
  - Feedback benar/salah dan pembahasan setelah menjawab.
  - Konten drilling tidak ditampilkan dengan label “AI Generated”.

- **Learning Streak**.
  - Menjawab Try Out, Drilling, atau Listening mencatat aktivitas hari itu.
  - Current streak dan best streak ditampilkan di Dashboard/Statistik.
  - Progress disimpan di browser (`localStorage`) pada mode lokal.

- Bilingual UI Bahasa Indonesia / 日本語.
- Dark/light mode.
- Vocabulary Master, Kanji Master, Listening Training, Statistik, Settings.
- PWA shell tetap tersedia.
- Struktur Supabase tetap disediakan untuk pengembangan persistence/sync di tahap selanjutnya.

## Penting tentang bank soal

1. Paket Try Out mempertahankan metadata status sumber dari hasil inventarisasi Drive (`Verified` / `Reconstructed`).
2. Bank Drilling 1.000 soal adalah **soal baru** yang mengikuti bentuk tugas, level dasar, dan konteks JFT-Basic. Bank tersebut bukan salinan soal resmi atau past exam.
3. Mode `Sumber / 日本語` pada runner sudah disiapkan pada struktur data. Untuk item sumber yang wording-nya tersedia dalam catatan Indonesia, `Sumber` menampilkan wording sumber-style; `日本語` menampilkan versi Jepang yang dinormalisasi.

## Menjalankan di Windows

Install Node.js terlebih dahulu, lalu buka Command Prompt/Terminal di folder project:

```bash
npm install
npm run dev
```

Buka:

```text
http://localhost:3000
```

Aplikasi otomatis masuk ke `/id`.

Supabase belum wajib untuk penggunaan lokal.

## Build production

```bash
npm run build
npm run start
```

Project ini adalah project Node.js/Next.js. **Jangan drag source folder langsung ke Cloudflare Pages Direct Upload** seperti file HTML statis. Untuk deployment online, gunakan pipeline build/deployment Next.js yang sesuai.
