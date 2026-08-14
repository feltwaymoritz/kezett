export const runtime = "nodejs";

function cleanJapaneseText(text: string) {
  return text
    .replace(/\bA：/g, "")
    .replace(/\bB：/g, "")
    .trim()
    .slice(0, 3000);
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const rawText = url.searchParams.get("text") ?? "";
  const voiceMode = url.searchParams.get("voice") ?? "a";

  const text = cleanJapaneseText(rawText);

  if (!text) {
    return new Response("Text is required", {
      status: 400,
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(
      "TTS server belum dikonfigurasi.",
      {
        status: 503,
      }
    );
  }

  // Dua suara berbeda untuk variasi soal.
  const voice =
    voiceMode === "b"
      ? "cedar"
      : "marin";

  const response = await fetch(
    "https://api.openai.com/v1/audio/speech",
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        model: "gpt-4o-mini-tts",

        voice,

        input: text,

        response_format: "mp3",

        speed: 0.92,

        instructions:
          "Speak in natural Japanese. " +
          "Clear pronunciation suitable for a JFT-Basic A1-A2 learner. " +
          "Use a natural conversational pace. " +
          "Do not translate the Japanese text. " +
          "Do not add any extra words.",
      }),
    }
  );

  if (!response.ok) {
    console.error(
      "OpenAI TTS error:",
      response.status,
      await response.text()
    );

    return new Response(
      "Gagal membuat audio.",
      {
        status: 502,
      }
    );
  }

  const audio =
    await response.arrayBuffer();

  return new Response(audio, {
    status: 200,

    headers: {
      "Content-Type": "audio/mpeg",

      // Browser/CDN bisa menyimpan audio yang sama.
      "Cache-Control":
        "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}