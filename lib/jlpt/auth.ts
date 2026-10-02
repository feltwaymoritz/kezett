// Google Sign-In for the JLPT module (Google Identity Services).
// The credential is exchanged for a JLPT API session token; the API only
// accepts the owner's Google account. Ported from the standalone app.

import { JLPT_API, getToken, syncNow } from "./progress";

export const GOOGLE_CID =
  "973285752122-detob7idobr5pgv4i56rf7fspkpa56ob.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

let gsiPromise: Promise<void> | null = null;

/** Load the GIS client script once (dynamic injection, no extra deps). */
export function loadGsi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gsiPromise) return gsiPromise;
  gsiPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("GIS gagal dimuat"));
    document.head.appendChild(s);
  });
  return gsiPromise;
}

export function currentUser(): string | null {
  if (typeof window === "undefined") return null;
  if (!getToken()) return null;
  return localStorage.getItem("jlpt_user");
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("jlpt_token");
  localStorage.removeItem("jlpt_user");
}

/** Exchange a GIS credential for a session token, then pull cloud progress. */
export async function loginWithCredential(credential: string): Promise<string> {
  const r = await fetch(`${JLPT_API}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "google", idToken: credential }),
  });
  const d = await r.json().catch(() => ({}));
  if (!d.token) throw new Error(d.error || "Gagal masuk. Coba lagi.");
  localStorage.setItem("jlpt_token", d.token);
  localStorage.setItem("jlpt_user", d.email || "");
  await syncNow();
  return d.email || "";
}

/**
 * Render the official Google button into `el`. Retries briefly while the GIS
 * script loads (standalone openAuth behavior); calls onError if unavailable.
 */
export async function renderGoogleButton(
  el: HTMLElement,
  onCredential: (credential: string) => void,
  onError?: (msg: string) => void
) {
  try {
    await loadGsi();
  } catch {
    onError?.(
      "Google Sign-In gagal dimuat. Coba matikan adblock / periksa koneksi, atau lanjutkan tanpa login (mode lokal)."
    );
    return;
  }
  if (!window.google?.accounts?.id) {
    onError?.(
      "Google Sign-In gagal dimuat. Coba matikan adblock / periksa koneksi, atau lanjutkan tanpa login (mode lokal)."
    );
    return;
  }
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CID,
    callback: (resp: { credential?: string }) => {
      if (resp.credential) onCredential(resp.credential);
    },
    auto_select: false,
  });
  window.google.accounts.id.renderButton(el, {
    theme: "outline",
    size: "large",
    width: 280,
    text: "signin_with",
  });
}
