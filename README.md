# Prasanth Rayudu — Engineering Portfolio

React 19 + Vite 8 single-page portfolio, deployed to GitHub Pages (`base: /portfolio/`) by `.github/workflows/deploy.yml` on push to `main`.

```bash
npm install
npm run dev     # local dev server
npm run build   # production build to dist/
npm run lint
```

## Portfolio assistant

The chat in the bottom-right works in two modes:
- **Notes mode (default):** answers come from `src/data/`, no server needed.
- **AI mode:** set the `VITE_API_BASE` repository variable to the deployed Cloudflare Worker URL. See `server/README.md` for deployment.

Checks (no accounts needed):

```bash
node src/assistant/answer.check.mjs
node server/worker.check.mjs
node server/knowledge/knowledge.check.mjs
```

## Content

- Projects: `src/data/projects.js` (each written as Situation, Task, Action, Result).
- Profile, experience, skills: `src/data/profile.js`.
- Resume PDFs: `public/resume-*.pdf`.
