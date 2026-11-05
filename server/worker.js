// Cloudflare Worker: POST /api/chat -> streams a Workers AI (open-source Llama) answer.
// No API keys: the AI binding is configured in wrangler.toml. Nothing from visitors is logged.
import { buildMessages, LIMITS } from "./prompt.js";
import { guardAnswer } from "../src/assistant/answer.js";

// Open-source chat models on Workers AI, best first. @cf/meta/llama-3.1-8b-instruct was removed on 2026-05-30.
// Check https://developers.cloudflare.com/workers-ai/models/ if all of these are ever retired.
const MODELS = ["@cf/meta/llama-3.1-8b-instruct-fp8", "@cf/meta/llama-3.2-3b-instruct"];
const MAX_BODY = 6000;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;

// ponytail: per-isolate counter, so the limit is approximate; upgrade to the Rate Limiting binding if abused.
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const rec = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  rec.push(now);
  hits.set(ip, rec);
  if (hits.size > 5000) hits.clear();
  return rec.length > MAX_PER_WINDOW;
}

const cors = (env, req) => {
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const origin = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0] || "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Expose-Headers": "X-Sources",
    Vary: "Origin",
  };
};

const json = (obj, status, headers) => new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...headers } });

export default {
  async fetch(req, env) {
    const h = cors(env, req);
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    if (url.pathname !== "/api/chat" || req.method !== "POST") return json({ error: "not_found" }, 404, h);

    const origin = req.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim());
    if (origin && !allowed.includes(origin)) return json({ error: "forbidden" }, 403, h);

    const ip = req.headers.get("CF-Connecting-IP") || "unknown";
    if (limited(ip)) return json({ error: "rate_limited" }, 429, h);

    const raw = await req.text();
    if (raw.length > MAX_BODY) return json({ error: "too_large" }, 413, h);
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: "bad_json" }, 400, h);
    }
    if (!Array.isArray(body.messages)) return json({ error: "bad_request" }, 400, h);
    const projectId = typeof body.projectId === "string" ? body.projectId.slice(0, 40) : undefined;

    // Safety-critical topics (contact, privacy, injection...) never reach the model.
    const lastUser = [...body.messages].reverse().find((m) => m && m.role === "user");
    const guarded = lastUser && typeof lastUser.content === "string" ? guardAnswer(lastUser.content.slice(0, LIMITS.chars), { llm: true, projectId }) : null;
    if (guarded) return json({ guarded }, 200, h);

    const built = buildMessages(body.messages, projectId);
    if (!built) return json({ error: "bad_request" }, 400, h);

    // Try the configured model first, then the built-in fallbacks, so one deprecated model doesn't take the chat down.
    let lastError = "";
    for (const model of [env.AI_MODEL, ...MODELS].filter(Boolean)) {
      try {
        const stream = await env.AI.run(model, {
          messages: built.messages,
          stream: true,
          max_tokens: LIMITS.maxTokens,
          temperature: 0.3,
        });
        return new Response(stream, {
          headers: { ...h, "Content-Type": "text/event-stream", "Cache-Control": "no-store", "X-Sources": built.sources.join(",") },
        });
      } catch (e) {
        lastError = `${model}: ${String(e?.message || e)}`;
      }
    }
    // Every model failed (daily quota used up, all deprecated...). The site falls back to its built-in answers.
    // `detail` is the platform's error text (no visitor data), to make a bad model name easy to spot.
    return json({ error: "ai_unavailable", detail: lastError.slice(0, 300) }, 503, h);
  },
};
