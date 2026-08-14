let currentAudio: HTMLAudioElement | null =
  null;

function fallbackBrowserTTS(text: string) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    alert(
      "Audio tidak dapat diputar di perangkat ini."
    );

    return;
  }

  window.speechSynthesis.cancel();

  const speech =
    new SpeechSynthesisUtterance(text);

  speech.lang = "ja-JP";
  speech.rate = 0.92;
  speech.pitch = 1;
  speech.volume = 1;

  window.speechSynthesis.speak(speech);
}

export async function playJapaneseAudio(
  text: string,
  voice:
    | "male"
    | "female"
    | undefined = undefined
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  // Hentikan audio sebelumnya.
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  const voiceMode =
    voice === "male"
      ? "b"
      : "a";

  const params =
    new URLSearchParams({
      text,
      voice: voiceMode,
    });

  const audio = new Audio(
    `/api/tts?${params.toString()}`
  );

  currentAudio = audio;

  audio.preload = "auto";

  let fallbackStarted = false;

  const fallback = () => {
    if (fallbackStarted) return;

    fallbackStarted = true;

    console.warn(
      "Server audio gagal. Menggunakan browser TTS."
    );

    fallbackBrowserTTS(text);
  };

  audio.addEventListener(
    "error",
    fallback,
    {
      once: true,
    }
  );

  try {
    await audio.play();
  } catch (error) {
    console.error(
      "Audio playback error:",
      error
    );

    fallback();
  }
}

export function stopJapaneseAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;

    currentAudio = null;
  }

  if (
    typeof window !== "undefined" &&
    "speechSynthesis" in window
  ) {
    window.speechSynthesis.cancel();
  }
}