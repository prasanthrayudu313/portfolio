// Talks to the Cloudflare Worker. If VITE_API_BASE is not set the site simply uses its built-in answers.
const BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
export const llmEnabled = BASE.length > 0;

const token = (j) => j.response ?? j.choices?.[0]?.delta?.content ?? "";

// history: [{role, content}]. Resolves {guarded} | {text, sources}. Throws on any failure (caller falls back).
export async function askLLM(history, projectId, onToken) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 25000);
  try {
    const res = await fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, projectId }),
      signal: ctl.signal,
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    if ((res.headers.get("Content-Type") || "").includes("application/json")) {
      const j = await res.json();
      if (j.guarded) return { guarded: j.guarded };
      throw new Error("bad reply");
    }

    const sources = (res.headers.get("X-Sources") || "").split(",").filter(Boolean);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const l of lines) {
        if (!l.startsWith("data:")) continue;
        const d = l.slice(5).trim();
        if (!d || d === "[DONE]") continue;
        try {
          const t = token(JSON.parse(d));
          if (t) {
            text += t;
            onToken(text);
          }
        } catch {
          /* ignore a partial or unknown chunk */
        }
      }
    }
    if (!text.trim()) throw new Error("empty");
    return { text, sources };
  } finally {
    clearTimeout(timer);
  }
}
