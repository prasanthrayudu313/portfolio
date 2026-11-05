import chunks from "./index.js";

const STOP = new Set("the and for with that this what how why did does you your his him are was were has have from about into then than".split(" "));
const tok = (s) => s.toLowerCase().replace(/[^a-z0-9+\-\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

// Keyword search over approved document chunks. `projectIds` boosts chunks of projects already in play.
export function searchDocs(query, projectIds = [], limit = 2, source = chunks) {
  const q = [...new Set(tok(query))];
  if (!q.length) return [];
  return source
    .map((c) => {
      const words = new Set(tok(`${c.title} ${c.section} ${c.text}`));
      let s = q.filter((t) => words.has(t)).length * 2;
      if (s > 0 && c.projectId && projectIds.includes(c.projectId)) s += 2;
      return { c, s };
    })
    .filter((x) => x.s >= 4)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.c);
}
