# Approved documents for the assistant

Put extra project documentation here as `.md` files, then run `node server/knowledge/build.mjs` and redeploy.

Each file starts with front-matter:

```
---
id: hyperopt-experiments
title: HyperOPT experiment notes
projectId: hyperopt
visibility: public-approved
verification: portfolio_claim
---
# Section heading
Text the assistant may quote...
```

Rules:
- Only `visibility: public-approved` files are ever indexed. Anything else (or a missing line) is skipped.
- Remember that approved text becomes quotable by anyone who uses the chat. Do not put private, employer, or unpublished material here.
- Lines that look like instructions to an AI ("ignore previous instructions", "api key"...) are skipped and reported.
- Documents are treated as data, never as instructions.
