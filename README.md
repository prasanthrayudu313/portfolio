# Prasanth Rayudu — Engineering Portfolio

React 19 + Vite 8 single-page portfolio, deployed to GitHub Pages (`base: /portfolio/`) by `.github/workflows/deploy.yml` on push to `main`.

```bash
npm install
npm run dev     # local dev server
npm run build   # production build to dist/
npm run lint
```

Roadmap: restrained design system, structured project data, and an optional RAG-based portfolio assistant (the site must stay fully usable without it).

Known gap: resume PDFs (`public/resume-{analog,power,rf}.pdf`) are not added yet, so the resume links 404.
