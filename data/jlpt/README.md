# data/jlpt

Static index (`exams.ts`) for the JLPT N3 module inside Kezett.

The bulk JLPT assets in `public/jlpt/` (`data/`, `drill/`, `img/`, `script/`) are a
**snapshot of `~/workspace/jlpt-pilot/site/`** (the standalone JLPT app), copied at
prep time — 155 exam JSON files (31 exams x meta/vocab/gr/listening/answers),
the drill bank (manifest + 62 part files, 5.000 items), question images and
listening transcript page scans. They are served statically and fetched at
runtime by `lib/jlpt/api.ts`. To refresh them, re-copy from the jlpt-pilot site
and regenerate the counts in `exams.ts`.

Listening audio itself is NOT in this repo: it stays on the dedicated Vercel
audio hosts (see the host map in `exams.ts`).
