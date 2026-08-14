# Kezett — Source Analysis

Analysis date: 2026-08-10 (Asia/Jakarta)

## 1. Primary Drive inventory

Primary folder contains **21 themed JFT package folders**, plus:
- 1 supplemental practice folder (`Latsol Tambahan April-juli`)
- 1 visual-reference folder (`FILE GAMBARAN SOAL JFT`)

The 21 themed packages are: SEKI, KOOHII, KYUUKEI, KAZARIMASU, GENKAN, NIGEMASU, KUTSUSHITA, OKAASAN, KOUEN, KAGI, JITENSYA, ICHIGO, CHICHI, BASU, KUDAMONO, KUROI, OKIMASSU, PANDA, SAIFU, SORA, and TOIRE.

Important: a folder/package is **not automatically a Try Out**. Several folders contain old/new/fix/update versions, incomplete post-test reconstructions, extra remembered items, missing question numbers, or image-only files.

## 2. Second Drive inventory

The second folder exposes 12 top-level entries, including Irodori A1/A2, vocabulary, grammar/pattern, and kanji references. Its `Latsol` folder exposes 32 items such as Himawari practice, 5 Preparation volumes, 4 Simulation sets, 9 Basic-level sets, one Intermediate set, and several workbook/document copies.

Most items in this second folder are Google Drive **shortcuts**. The connected Drive API could enumerate their names but returned HTTP 403 when attempting to read the shortcut targets. Therefore their *existence and filenames* are inventoried, but their contents are not claimed as analyzed.

## 3. Pattern found in readable source packages

The source material consistently maps to four JFT sections:
1. Huruf dan Kosakata / Script & Vocabulary
2. Percakapan dan Ungkapan / Conversation & Expression
3. Pendengaran / Listening
4. Pemahaman Bacaan / Reading

Recurring item patterns:
- picture-to-word / word meaning
- kanji reading and meaning
- vocabulary use in a short sentence
- grammar completion in a dialogue
- socially appropriate expressions
- everyday-life listening: station, shop, hospital, company, event, transport, weather/disaster, directions
- reading of messages, notices, pamphlets, schedules, maps, menus, opening hours, medicine instructions, workplace rules
- information search (time, date, price, floor, platform, quantity, location)

No standalone original audio file was found in the readable primary folder inventory. Listening materials are mostly reconstructed dialogues/notes. Kezett therefore stores audio provenance explicitly: `original`, `tts_generated`, or `none`.

## 4. Initial Try Out decision

**6 source packages are published as initial verified/canonical Try Out blueprints:**
1. SEKI — approx. 48 items
2. KOOHII — approx. 48 items
3. KYUUKEI — approx. 48 items
4. KAZARIMASU — approx. 50 items
5. OKAASAN NEW — approx. 48 items
6. KUROI FIX — approx. 48 items

This is deliberately conservative. Other packages remain in the practice bank until visual/answer-key verification is complete. Examples:
- GENKAN/BASU/TOIRE: item totals appear to contain extras or reconstruction overlap.
- KUTSUSHITA/JITENSYA/SAIFU: appear short/incomplete.
- ICHIGO/PANDA/SORA: documents explicitly show forgotten or skipped items.
- NIGEMASU: file/folder provenance mismatch (`SOAL SARADA` inside `JFT NIGEMASU.pdf`).
- OKIMASU: image-only PDF; visual inspection found 25 multiple-choice items plus Chokai/Dokkai notes (about 46 effective items/sub-items), still partial rather than a complete canonical mock.
- KOUEN/KAGI/KUDAMONO: near-complete but still marked reconstructed pending cross-check.

The system can promote a package later without changing code; set `tryout_eligible=true` after verification.

## 5. Official JFT-Basic constraints incorporated

Current official structure (August 2026):
- computer-based test (CBT)
- 4 sections listed above
- approximately 50 questions
- 60 minutes total
- approximately 12 questions per section
- within Vocabulary, Conversation/Expression, and Reading: review is possible while still in the same section
- after moving to the next section: previous section cannot be reopened
- Listening: previous/next review navigation is restricted; audio can be played at most twice in the actual CBT
- official total score uses statistical equating and is **not** a raw percentage-correct conversion
- score range 10–250; from August 2026 official result levels are A1 (145–174), A2.1 (175–199), A2.2/A2 (200–250)

Kezett displays raw practice accuracy and category mastery separately, and does not pretend to reproduce the official equating formula.

## 6. Previous Exam policy

The Japan Foundation states that past test questions are not published. Accordingly, the `Previous Exam` source class in Kezett is reserved for lawful **official/public sample materials** and explicitly public historical-style references. It must not relabel leaked/reconstructed content as official previous-exam questions.

## 7. Data-provenance rules

Every imported question stores:
- source type
- source package
- source file/asset
- original order
- verification status
- whether wording is original/unmodified
- audio origin
- extraction status
- optional content hash for deduplication

Corrections, explanations, and AI enhancements should be stored separately from the original wording.
