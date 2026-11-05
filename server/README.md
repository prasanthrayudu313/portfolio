# Portfolio assistant backend (Cloudflare Worker + Workers AI)

Runs an open-source Llama model on Cloudflare's free tier (10,000 neurons/day, about 100 answers a day). No API key and no card needed.

How it answers:
- **Questions about Prasanth**: the model sees only the matching project notes from `src/data/` plus his profile, and is told to answer only from them.
- **General hardware questions**: the model answers from its own knowledge and starts with "General knowledge:".
- **Contact, privacy, prompt-injection, greetings**: handled by fixed code (`guardAnswer`), never by the model.
- If the free quota runs out or the Worker is down, the website falls back to its built-in notes-only answers.

## What lives where

```
server/
  worker.js            API: validation, CORS, rate limit, guards, streaming
  prompt.js            system prompt + notes assembly (server only, not in the website bundle)
  knowledge/
    docs/*.md          extra documents you approve (see docs/README.md)
    build.mjs          turns approved docs into index.js (private ones are skipped)
    search.js          keyword search over approved chunks
```

The portfolio facts (`src/data/`) are shared with the website on purpose: one copy, so the site and the AI can never disagree. Add longer write-ups to `knowledge/docs/` and run `npm run knowledge` before deploying.

## Deploy (one time)

```bash
cd server
npm install
npx wrangler login      # opens a browser; sign in to your free Cloudflare account
npx wrangler deploy     # prints https://portfolio-assistant.<your-subdomain>.workers.dev
```

Then in the GitHub repo: Settings > Secrets and variables > Actions > Variables > New repository variable
`VITE_API_BASE` = the URL printed above (no trailing slash). Push to `main` and the site rebuilds with the AI turned on.

Edit `ALLOWED_ORIGINS` in `wrangler.toml` if your Pages URL differs.

## Local checks (no Cloudflare account needed)

```bash
node server/worker.check.mjs
node server/knowledge/knowledge.check.mjs
node src/assistant/answer.check.mjs
```

## Known limits
- Free quota resets daily at 00:00 UTC; past it the site uses the notes-only fallback.
- The rate limit is per Worker instance (approximate).
- An 8B open model can make mistakes on general topics, and the panel says so. Check the Workers AI model catalog for current model names and free-plan access (`AI_MODEL` in `wrangler.toml`).
