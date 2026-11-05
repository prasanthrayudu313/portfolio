// Local, deterministic answer engine over src/data/*. No LLM, no network.
// It only quotes what the notes say; anything else gets an honest "not documented".
import { projects } from "../data/projects.js";
import { experience, skillGroups, about } from "../data/profile.js";

export const CONTACT = {
  email: "rprasanth2024@gmail.com",
  linkedin: "https://www.linkedin.com/in/prasanth-rayudu",
  github: "https://github.com/prasanthrayudu313",
};

// ---------- helpers ----------
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hasWord = (text, w) => new RegExp(`(^|[^a-z0-9])${esc(w)}([^a-z0-9]|$)`, "i").test(text);
const words = (s) => s.toLowerCase().replace(/[^a-z0-9+\-\s]/g, " ").split(/\s+/).filter(Boolean);
const short = (p) => p.title.split(":")[0];

const norm = (q) =>
  q
    .toLowerCase()
    .replace(/hyper[\s-]?opt/g, "hyperopt")
    .replace(/pro[\s-]?phet/g, "prophet")
    .replace(/free[\s-]?rtos/g, "freertos")
    .replace(/tape[\s-]?out/g, "tapeout")
    .replace(/machine[\s-]?learning/g, "ml");

const STOP = new Set(
  ("what did you do does the a an is are was were of in on for to and or with about me tell explain show describe " +
    "project projects build built make made have has had any experience experienced work worked your my it its this " +
    "that them can could would should please i want like know give how why who which where when use used using he his " +
    "him her she they their be been am there all some really also same role job candidate prasanth rayudu list " +
    "tool tools skill skills language languages stack software knowledge familiar proficient expertise design " +
    "best most strongest impressive good great fit relevant suitable thing things stuff more detail details " +
    "happened became get got want need involve involves involving include includes still full").split(" ")
);

const SYN = {
  ml: ["neural", "forest"],
  ai: ["neural", "hdc"],
  verification: ["testbench", "testbenches", "bfms", "self-checking"],
  rtl: ["verilog", "systemverilog"],
  wireless: ["rf", "antenna"],
  networking: ["dtn", "networks"],
  memory: ["hbm", "cxl"],
};

const textOf = (p) =>
  [
    p.title, p.domain, p.tools, p.short, p.situation, p.task, p.role, p.limits || "",
    ...p.action,
    ...p.problems.flatMap((x) => [x.problem, x.solution]),
    ...p.results.map((r) => `${r.n} ${r.t}`),
  ]
    .join(" ")
    .toLowerCase();
const TEXT = new Map(projects.map((p) => [p.id, textOf(p)]));
const KNOWN = [about.summary, about.focus, ...experience.map((e) => `${e.role} ${e.company} ${e.details}`), ...skillGroups.flatMap((g) => [g.title, ...g.items])].join(" ").toLowerCase();
const df = (t) => projects.filter((p) => hasWord(TEXT.get(p.id), t)).length;
const nameMatch = (p, t) => p.id.split("-").includes(t) || hasWord(p.title.toLowerCase(), t);

function score(p, tokens) {
  let s = 0;
  const meta = `${p.domain} ${p.tools}`.toLowerCase();
  for (const t of tokens) {
    if (p.id.split("-").includes(t)) s += 6;
    else if (hasWord(p.title.toLowerCase(), t)) s += 4;
    if (hasWord(meta, t)) s += 2;
    if (hasWord(TEXT.get(p.id), t)) s += df(t) <= 2 ? 3 : 1;
    for (const x of SYN[t] || []) if (hasWord(TEXT.get(p.id), x)) s += 1;
  }
  return s;
}

const contentTokens = (q) => words(q).filter((w) => !STOP.has(w) && w.length > 1);

const go = (section, label) => ({ type: "GO_SECTION", section, label });
const open = (p) => ({ type: "OPEN_PROJECT", projectId: p.id, label: `Open ${short(p)}` });
const src = (p, f) => `${short(p)} · ${f}`;
const say = (paras, extra = {}) => ({
  blocks: paras.map((x) => (Array.isArray(x) ? { ul: x } : { p: x })),
  sources: [],
  actions: [],
  ...extra,
});

function detailLines(p, tokens) {
  const rare = tokens.filter((t) => df(t) <= 2 && !nameMatch(p, t));
  if (!rare.length) return [];
  const lines = [
    ...p.action,
    ...p.problems.flatMap((x) => [x.problem, x.solution]),
    p.situation,
    p.task,
    ...p.results.map((r) => `${r.n} ${r.t}`),
  ];
  return lines.filter((l) => rare.some((t) => hasWord(l.toLowerCase(), t))).slice(0, 3);
}

// ---------- per-project answers ----------
const INTENTS = [
  ["compare", /\bcompare|versus|\bvs\b|difference between/],
  ["problems", /\b(problem|challenge|issue|bug|struggle|difficult|fix|solv|went wrong)/],
  ["results", /\b(result|number|metric|achiev|improv|how (much|fast)|percent|performance|outcome|reduction|snr)/],
  ["limits", /\b(limit|limitation|not do|missing|caveat|verified)/],
  ["why", /\b(why|motivat|purpose|reason)/],
  ["tools", /\b(tool|language|stack|software|framework|technolog|used for|which (fpga|board))/],
  ["how", /\b(how|implement|built it|works?|approach|method|step)/],
  ["role", /\b(role|contribut|my part|your part|personally|alone|team|solo)/],
];

function projectAnswer(p, intent, tokens) {
  const status = `Results are labelled "${p.status}".`;
  const act = [open(p)];
  switch (intent) {
    case "why":
      return say([p.situation, p.task], { sources: [src(p, "why")], actions: act });
    case "how":
      return say(["Here is what I did:", p.action], { sources: [src(p, "what I did")], actions: act });
    case "tools":
      return say([p.tools.split(" | ").join(", ") + ".", p.role], { sources: [src(p, "tools")], actions: act });
    case "role":
      return say([p.role], { sources: [src(p, "role")], actions: act });
    case "results":
      return p.results.length
        ? say([p.results.map((r) => `${r.n}: ${r.t}`), status], { sources: [src(p, "results")], actions: act })
        : say(["No measured numbers are recorded for this project."], { actions: act });
    case "problems":
      return p.problems.length
        ? say([p.problems.map((x) => `Problem: ${x.problem} Fix: ${x.solution}`)], { sources: [src(p, "problems")], actions: act })
        : say(["No specific problems and fixes are written down for this project."], { actions: act });
    case "limits":
      return say([p.limits || "No specific limitations are recorded for this project."], {
        sources: p.limits ? [src(p, "limits")] : [],
        actions: act,
      });
    default: {
      const lines = detailLines(p, tokens);
      if (lines.length) return say(["From the notes:", lines, "That is all the notes say on it."], { sources: [src(p, "notes")], actions: act });
      const blocks = [p.short, p.role];
      if (p.results[0]) blocks.push(`Headline result: ${p.results[0].n} ${p.results[0].t}. ${status}`);
      return say(blocks, { sources: [src(p, "role"), src(p, "results")], actions: act });
    }
  }
}

const listAnswer = (items, tokens, preface) =>
  say(
    [
      preface,
      items.map((p) => {
        const l = detailLines(p, tokens)[0];
        return `${short(p)}: ${l || p.short}`;
      }),
      "Ask about any of them for the detail.",
    ],
    { sources: items.map((p) => src(p, "notes")), actions: items.slice(0, 4).map(open) }
  );

// ---------- visitor-intent rules (checked in order, before project matching) ----------
const RULES = [
  [
    /(ignore|disregard|forget).{0,25}(previous|prior|above|all|your).{0,25}(instruction|rule|prompt)|system prompt|api[\s-]?key|password|jailbreak|developer mode|you are now|pretend (to be|you)|act as (a|an)\b|reveal your/,
    () =>
      say([
        "I can only answer questions about Prasanth's projects and background, using the notes on this site. I can't change those rules or share keys or internal details.",
        "Ask me about a project and I'll quote what's written.",
      ]),
  ],
  [/^(hi|hello|hey|hiya|yo|greetings|good (morning|afternoon|evening))\b/, (q) => (q.split(/\s+/).length <= 4 ? say(["Hi! Ask me about Prasanth's projects, tools, results, or background."]) : null)],
  [/\b(thanks|thank you|thx|cheers|appreciate)\b/, (q) => (q.split(/\s+/).length <= 6 ? say(["You're welcome! Ask another question any time."]) : null)],
  [
    /who are you|what are you|(are you|is this|is it|is that) (an? )?(ai|bot|robot|human|chatgpt|gpt|llm|real|person|automated)\b|what can you do|how do you work|^help\b|how can you help|what should i ask|what do you know|capabilit/,
    (q, tokens, hasNamed, ctx) =>
      ctx.llm
        ? say([
            "I'm an AI assistant running an open-source language model. For questions about Prasanth I answer only from the notes on this site; for general hardware and engineering questions I answer from the model's own knowledge and say so.",
            "Because it's a model, it can make mistakes on general topics. Check anything important, and ask Prasanth directly about details beyond the notes.",
          ])
        : say([
            "I'm a simple assistant built into this site, not a large language model like ChatGPT. I match your question against Prasanth's project notes and quote them back, so I can't improvise or go beyond what's written.",
            "I can tell you what he built, why, how, which tools, the results, and the problems he hit. I can compare projects, list which ones involve a topic, and point you to his contact details.",
          ]),
  ],
  [
    /weather|president|prime minister|\bjoke|poem|recipe|stock price|bitcoin|crypto|\bsports?\b|\bmovie|\bsong\b|lyrics|translate|capital of|\bnews\b|horoscope|homework|essay|(write|generate|code|create) (me )?(a|an|some|the)?\s*(python|javascript|java|c\+\+|script|program|code|function|app|website|story)/,
    () => say(["That's outside what I can help with here. I'm limited to Prasanth's projects and background."]),
  ],
  [
    /\b(salary|compensation|pay expectation|how much (does|do) (he|you) (earn|make)|visa|work authori[sz]ation|authori[sz]ed to work|sponsorship|citizen|green card|how old|\bage\b|married|religion|home address|date of birth|ssn|passport)\b/,
    () => say(["That's personal or role-specific, so it's best asked to Prasanth directly."], { actions: [go("contact", "Go to contact")] }),
  ],
  [
    /(open to work|looking for (a )?(job|work|role|position|opportunit)|\bavailab|job search|seeking|currently (working|employed)|start date|notice period)/,
    () =>
      say(["The site says he's interested in engineering roles across AI hardware, HDC, FPGA, embedded systems, power-aware architecture, analog and mixed-signal, and wireless. For timing and availability, ask him directly."], {
        actions: [go("contact", "Go to contact")],
      }),
  ],
  [
    /(contact (him|you|prasanth|me)|\bhire\b|hiring|recruit|reach (out|him|you)|(his|your|prasanth'?s?) (email|phone)|email (him|you)|message (him|you)|talk to (him|you|prasanth)|speak (to|with) (him|you|prasanth)|discuss (his|your)|chat with (him|you)|meet (him|you)|collaborat\w* with (him|you)|get in touch|job opportunit|way to contact)/,
    () =>
      say(["Happy to connect you with Prasanth. Direct messages from this chat aren't available yet, so please use one of these:", [`Email: ${CONTACT.email}`, "Phone and LinkedIn are in the Contact section."]], {
        actions: [go("contact", "Go to contact")],
      }),
  ],
  [
    /\b(github|linkedin|resume|resumes|cv)\b/,
    (q) =>
      /resume|cv/.test(q)
        ? say(["Role-targeted resumes (analog, power/SoC/edge AI, RF/wireless) are in the Resumes section."], { actions: [go("resumes", "Go to resumes")] })
        : say(["His profiles are linked in the Contact section.", [`GitHub: ${CONTACT.github}`, `LinkedIn: ${CONTACT.linkedin}`]], { actions: [go("contact", "Go to contact")] }),
  ],
  [
    /(publication|publish|journal|conference|\bieee\b|research paper|\bpaper\b)/,
    () =>
      say(["The notes mention one paper: HyperOPT's, which is submitted and under review. No other publications are listed."], {
        sources: ["HyperOPT · role"],
        actions: [open(projects.find((p) => p.id === "hyperopt"))],
      }),
  ],
  [
    /(tapeout|taped|\basics?\b|silicon|fabricat|foundry|tsmc|gdsii|wafer|\bnode\b|\bnm\b)/,
    () =>
      say(
        [
          "The notes don't mention any tape-out or fabricated chip, so I won't claim one. The transistor-level work was done in simulation, through layout, DRC/LVS, and extraction.",
          projects.filter((p) => ["vlsi-cmos-video", "cmos-readout"].includes(p.id)).map((p) => short(p)),
        ],
        { actions: projects.filter((p) => ["vlsi-cmos-video", "cmos-readout"].includes(p.id)).map(open) }
      ),
  ],
  [
    /(where (is|are|does) (he|you) (located|based|live)|located|location|which city|based in)/,
    () => say(["Prasanth is based in San Diego, CA."]),
  ],
  [
    /(where did (he|you) (study|go to school)|degree|education|university|college|graduat|masters?\b|b\.?tech|studied|\bschool\b)/,
    () =>
      say(["He is a Computer Engineering master's student at San Diego State University. His B.Tech capstone (2023-2024) was a MIMO antenna design."], {
        sources: ["Profile · About"],
        actions: [open(projects.find((p) => p.id === "mimo-antenna"))],
      }),
  ],
  [
    /(work experience|career|employment|work history|worked (at|for)|\bjobs?\b|internship|\bintern\b|teach|taught|\bta\b|instructor|research assistant|employer|companies)/,
    (q) => {
      const pick = /intern/.test(q) ? /intern/i : /teach|taught|\bta\b|instructor/.test(q) ? /teaching/i : /research/.test(q) ? /research/i : null;
      const list = pick ? experience.filter((e) => pick.test(e.role)) : experience;
      return say(list.map((e) => `${e.role}, ${e.company}: ${e.details}`), {
        sources: ["Profile · Experience"],
        actions: [
          go("experience", "See experience"),
          ...(/intern/.test(q) ? [open(projects.find((p) => p.id === "in22-biosensor"))] : []),
        ],
      });
    },
  ],
  [
    /(how many projects|number of projects|all (the |his |your )?projects|every project|everything|what (projects|has he built|have you built)|list (all|every))/,
    (q, tokens) => {
      if (tokens.length) return null; // "what projects involve X" is a topic search, not a full listing

      const by = {};
      projects.forEach((p) => (by[p.domain.split(" / ")[0]] ||= []).push(short(p)));
      return say([`${projects.length} projects are documented, by area:`, Object.entries(by).map(([k, v]) => `${k} (${v.length}): ${v.join("; ")}`)], {
        sources: ["Project notes"],
        actions: [go("projects", "Browse projects")],
      });
    },
  ],
  [
    /(team projects?|group projects?|which (projects )?(were|are) (done )?(in|as) a team)/,
    () => {
      const l = projects.filter((p) => /team|my team/i.test(p.role));
      return say([`${l.length} projects were team efforts, and each says which part was his:`, l.map((p) => `${short(p)}: ${p.role}`)], { actions: l.slice(0, 4).map(open) });
    },
  ],
  [
    /(solo projects?|projects? (are |were |done )*(alone|solo|independent(ly)?|by (him|your)self))/,
    (q, tokens, hasNamed) => {
      if (hasNamed) return null;
      const l = projects.filter((p) => /solo|independent/i.test(p.role));
      return say([`${l.length} projects were solo work:`, l.map(short)], { actions: l.slice(0, 4).map(open) });
    },
  ],
  [
    /(in progress|ongoing|working on (now|currently)|current(ly)? (project|work)|latest project|recent project)/,
    (q, tokens, hasNamed) => {
      if (hasNamed) return null;
      const l = projects.filter((p) => /in progress|present/i.test(p.role + (p.limits || "")));
      return say(["Current work:", l.map((p) => `${short(p)}: ${p.role}`)], { actions: l.map(open) });
    },
  ],
  [
    /(were measured|measured (on|results)|real hardware|physical hardware|results.{0,15}measured)/,
    () => {
      const l = projects.filter((p) => p.status === "measured");
      return say(["These have results labelled \"measured\" (taken from real runs, not only models or simulation):", l.map((p) => `${short(p)}: ${p.results[0]?.n} ${p.results[0]?.t}`)], { actions: l.map(open) });
    },
  ],
  [
    /(most impressive|best project|favou?rite|flagship|proudest|top project|highlight|featured)/,
    (q, tokens) =>
      tokens.length ? null : say(["The site features HyperOPT, his research on co-optimizing hyperdimensional computing with analog in-memory hardware (paper submitted, under review). His current build is HAME, a HBM/CXL memory-tiering engine in RTL (in progress, simulated)."], {
        actions: ["hyperopt", "hame"].map((id) => open(projects.find((p) => p.id === id))),
      }),
  ],
];

// ---------- main ----------
// Words that show the question is about Prasanth himself (not a general hardware question).
const PERSONAL = /\b(he|him|his|you|your|prasanth|rayudu|portfolio)\b/;
// The first GUARD_COUNT rules are deterministic guards (safety, contact, identity). With an LLM
// behind the chat they still run first, so the model never improvises on them.
const GUARD_COUNT = 9;
export const guardAnswer = (question, ctx = {}) => answer(question, { ...ctx, guardOnly: true });

// Top projects whose notes should be handed to the LLM as context.
export function retrieve(question, projectId, limit = 3) {
  const tokens = contentTokens(norm(question));
  const hits = projects
    .map((p) => ({ p, s: score(p, tokens) }))
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.p);
  const current = projectId && projects.find((p) => p.id === projectId);
  if (current && !hits.includes(current) && (hits.length === 0 || !tokens.some((t) => projects.some((p) => nameMatch(p, t))))) hits.unshift(current);
  return hits.slice(0, limit);
}

export function answer(question, ctx = {}) {
  const raw = question.trim();
  if (!raw) return say(["Type a question about Prasanth's projects or background."]);
  const q = norm(raw);
  const tokens = contentTokens(q);
  const scored = projects
    .map((p) => ({ p, s: score(p, tokens) }))
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s);
  const hasNamed = tokens.some((t) => projects.some((p) => nameMatch(p, t)));

  // "did he really do these" is about trust, so handle it before topic rules.
  if (PERSONAL.test(q) && /\b(really|actually|truly|legit|genuine|verif(y|ied)|proof|prove|evidence|honest|fake|lie|lying|exaggerat|believe|trust)\b/.test(q)) {
    const count = (s) => projects.filter((p) => p.status === s).length;
    const team = projects.filter((p) => /team|my team/i.test(p.role)).length;
    const wip = projects.filter((p) => /in progress/i.test(p.role + (p.limits || ""))).length;
    const focus = ctx.projectId && projects.find((p) => p.id === ctx.projectId);
    const blocks = [
      "Everything here is Prasanth's own account of his work, and this chat can't independently prove it. What it can do is show how each claim is labelled:",
      [
        `Results are tagged by how they were obtained: ${count("measured")} measured, ${count("simulated")} simulated, ${count("modeled")} modeled, ${count("reported")} reported.`,
        `${team} projects were team efforts, and those state which part was his.`,
        `${wip} project is still in progress and says so.`,
        "Limits are stated where they exist, for example that HyperOPT is a modeling study and its paper is under review.",
      ],
    ];
    if (focus) blocks.push(`For ${short(focus)}: ${focus.role} Results are labelled "${focus.status}".`);
    blocks.push("To check details first-hand, ask him directly. He can walk through any project in an interview.");
    return say(blocks, {
      sources: focus ? [src(focus, "role")] : ["Project notes · status labels"],
      actions: [go("contact", "Go to contact"), ...(focus ? [open(focus)] : [])],
      projectId: focus ? focus.id : undefined,
    });
  }

  for (const [i, [re, run]] of RULES.entries()) {
    if (ctx.guardOnly && i >= GUARD_COUNT) return null;
    if (re.test(q)) {
      const r = run(q, tokens, hasNamed, ctx);
      if (r) return { ...r, projectId: r.projectId ?? ctx.projectId };
    }
  }

  if (ctx.guardOnly) return null;

  const intent = (INTENTS.find(([, re]) => re.test(q)) || [])[0];
  const skillsAsk = /\b(skills?|know|knows|familiar|proficien|expertise|languages?|stack|what tools|which tools|what software|experience (with|in))\b/.test(q);

  if (intent === "compare") {
    const uniq = [...new Set(tokens.map((t) => projects.filter((p) => nameMatch(p, t))).filter((a) => a.length === 1).map((a) => a[0]))];
    if (uniq.length >= 2) {
      const [a, b] = uniq;
      const line = (p) => `${short(p)}: ${p.domain}; ${p.tools.split(" | ").slice(0, 3).join(", ")}; ${p.results[0] ? `${p.results[0].n} ${p.results[0].t}` : "no recorded numbers"}`;
      return say(["Side by side, from the project notes:", [line(a), line(b)], `Roles: ${a.role} / ${b.role}`], {
        sources: [src(a, "role"), src(b, "role")],
        actions: [open(a), open(b)],
        projectId: a.id,
      });
    }
    if (scored.length) return listAnswer(scored.slice(0, 4).map((x) => x.p), tokens, "Which two should I compare? These are the closest matches:");
  }

  // If most of the topic words appear nowhere in the notes, say so instead of matching on a stray word.
  const unknown = tokens.filter((t) => t.length > 2 && df(t) === 0 && !hasWord(KNOWN, t) && !SYN[t] && !Object.values(SYN).some((v) => v.includes(t)));
  const followUp = ctx.projectId && intent;
  if (!hasNamed && !followUp && unknown.length && unknown.length * 2 >= tokens.length)
    return say([`I don't see "${unknown.slice(0, 3).join(" ")}" in the project notes or skills list, so I won't guess and can't claim it.`, "Ask what he has built, or browse the projects and skills."], {
      actions: [go("projects", "Browse projects"), go("skills", "See skills")],
    });

  const top = scored[0];
  const clear = top && (scored.length === 1 || top.s >= scored[1].s * 1.5);
  let target = clear ? top.p : null;
  if (!target && !top && ctx.projectId && intent) target = projects.find((p) => p.id === ctx.projectId);

  if (target) return { ...projectAnswer(target, intent, tokens), projectId: target.id };

  if (scored.length) {
    const rareT = tokens.filter((t) => df(t) > 0 && df(t) <= 2);
    const onlyRare = rareT.length > 0 && !hasNamed;
    const pool = onlyRare ? scored.filter((x) => rareT.some((t) => hasWord(TEXT.get(x.p.id), t))) : scored;
    const list = pool.slice(0, 4).map((x) => x.p);
    const preface = onlyRare
      ? "The notes only mention this briefly, in these places:"
      : skillsAsk
        ? `Yes, "${tokens.slice(0, 3).join(" ")}" shows up in these projects:`
        : "These projects fit best:";
    return { ...listAnswer(list, tokens, preface) };
  }

  if (skillsAsk || /\b(skills?|tools?)\b/.test(q) || tokens.some((t) => hasWord(KNOWN, t))) {
    const hit = skillGroups.filter((g) => g.items.some((i) => tokens.some((t) => hasWord(i.toLowerCase(), t))));
    if (tokens.length && !hit.length)
      return say([`I don't see "${tokens.slice(0, 3).join(" ")}" in the project notes or skills list, so I can't claim it.`, "Ask what he has built, or open the Skills section for the full list."], { actions: [go("skills", "See skills")] });
    const groups = hit.length ? hit : skillGroups;
    return say([hit.length ? "It's in his skills list, though no project notes use it yet:" : "Skills, by group:", groups.map((g) => `${g.title}: ${g.items.join(", ")}`)], {
      sources: ["Profile · Skills"],
      actions: [go("skills", "See skills")],
    });
  }

  if (/\b(about|who is|who's|introduce|overview|background|bio)\b/.test(q) && /(prasanth|him|he\b|himself|you|yourself|this person)/.test(q))
    return say([about.summary, `Focus: ${about.focus}`, experience.map((e) => `${e.role}, ${e.company}`), `${projects.length} projects are documented. Ask about any of them, or which ones involve a topic like FPGA or RF.`], {
      sources: ["Profile · About", "Profile · Experience"],
    });

  if (tokens.length)
    return say([`I don't see "${tokens.slice(0, 3).join(" ")}" in the project notes, so I won't guess.`, "You can ask what I built, why, how, which tools, the results, or the problems I hit for any project."], {
      actions: [go("projects", "Browse projects")],
    });
  return say(["I didn't catch that. You can ask what I built, why, how, which tools, the results, or the problems I hit for any project."]);
}
