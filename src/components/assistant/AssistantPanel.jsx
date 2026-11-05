import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { answer } from "../../assistant/answer.js";
import { askLLM, llmEnabled } from "../../assistant/llmClient.js";
import { projects } from "../../data/projects.js";

const SUGGESTED = llmEnabled
  ? ["What did you build in HyperOPT?", "Explain clock domain crossing", "What is processing-in-memory?", "How can I contact you?"]
  : ["What did you build in HyperOPT?", "What FPGA experience do you have?", "Compare HyperOPT and HAME", "How can I contact you?"];

const flat = (m) => (m.text ?? m.blocks?.map((b) => b.p || b.ul.join("; ")).join("\n") ?? "");

// Minimal, safe formatting for model output: bullets, **bold**, `code`. No HTML is ever injected.
function inline(s) {
  return s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) =>
    part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part.startsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : part
  );
}

function RichText({ text }) {
  const out = [];
  let list = [];
  const flush = () => {
    if (list.length) out.push(<ul key={out.length}>{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>);
    list = [];
  };
  for (const raw of text.split("\n")) {
    const li = raw.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (li) list.push(li[1]);
    else {
      flush();
      if (raw.trim()) out.push(<p key={out.length}>{inline(raw)}</p>);
    }
  }
  flush();
  return out;
}

function Blocks({ blocks }) {
  return blocks.map((b, i) =>
    b.ul ? (
      <ul key={i}>
        {b.ul.map((li) => (
          <li key={li}>{li}</li>
        ))}
      </ul>
    ) : (
      <p key={i}>{b.p}</p>
    )
  );
}

// Actions come from an allowlist; neither the engine nor the model produces arbitrary code or URLs.
function ActionButton({ action, onAction }) {
  if (action.type !== "OPEN_PROJECT" && action.type !== "GO_SECTION") return null;
  return (
    <button type="button" className="asst-action" onClick={() => onAction(action)}>
      {action.label} →
    </button>
  );
}

export default function AssistantPanel({ onClose, onAction, currentProjectId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [ctxProject, setCtxProject] = useState(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const replaceLast = (patch) => setMessages((m) => [...m.slice(0, -1), { ...m[m.length - 1], ...patch }]);

  const localReply = (question, note) => {
    const res = answer(question, { projectId: ctxProject || currentProjectId });
    if (res.projectId) setCtxProject(res.projectId);
    return { role: "bot", ...res, note };
  };

  const ask = async (q) => {
    const question = q.trim();
    if (!question || busy) return;
    setText("");
    setBusy(true);
    const history = [...messages.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: flat(m) })), { role: "user", content: question }];
    setMessages((m) => [...m, { role: "user", text: question }]);

    if (!llmEnabled) {
      // Built-in answers: short pause so the reply doesn't feel like a page jump.
      setTimeout(() => {
        setMessages((m) => [...m, localReply(question)]);
        setBusy(false);
      }, 350);
      return;
    }

    setMessages((m) => [...m, { role: "bot", text: "", streaming: true }]);
    try {
      const res = await askLLM(history, ctxProject || currentProjectId, (t) => replaceLast({ text: t }));
      if (res.guarded) {
        if (res.guarded.projectId) setCtxProject(res.guarded.projectId);
        replaceLast({ ...res.guarded, text: undefined, streaming: false });
      } else {
        const fromNotes = /^\s*from the portfolio/i.test(res.text);
        const picked = fromNotes ? res.sources.map((id) => projects.find((p) => p.id === id)).filter(Boolean) : [];
        if (picked[0]) setCtxProject(picked[0].id);
        replaceLast({
          text: res.text,
          streaming: false,
          ai: true,
          sources: picked.map((p) => `${p.title.split(":")[0]} · project notes`),
          actions: picked.slice(0, 2).map((p) => ({ type: "OPEN_PROJECT", projectId: p.id, label: `Open ${p.title.split(":")[0]}` })),
        });
      }
    } catch {
      setMessages((m) => [...m.slice(0, -1), localReply(question, "Live AI is unavailable right now, so this answer comes from my built-in notes.")]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.aside
      className="asst-panel"
      role="dialog"
      aria-label="Portfolio Assistant"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.22 }}
    >
      <header className="asst-head">
        <span>
          Portfolio Assistant
          <small>
            {llmEnabled
              ? "AI (open-source model). Facts about Prasanth come from his notes; general hardware answers come from the model."
              : "Answers come from Prasanth's project notes. Not a generative AI."}
          </small>
        </span>
        <button type="button" onClick={onClose} aria-label="Close assistant">
          ✕
        </button>
      </header>

      <div className="asst-list" ref={listRef} aria-live="polite">
        {messages.length === 0 && (
          <div className="asst-empty">
            <h3>What would you like to know?</h3>
            <p>
              {llmEnabled
                ? "Ask about my projects and experience, or any hardware and computer-engineering question."
                : "Ask about my projects, tools, results, or the problems I solved."}
            </p>
            <p className="asst-try">Try</p>
            {SUGGESTED.map((s) => (
              <button key={s} type="button" className="asst-suggest" onClick={() => ask(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="asst-msg asst-user">
              {m.text}
            </div>
          ) : (
            <div key={i} className="asst-msg asst-bot">
              {m.blocks ? <Blocks blocks={m.blocks} /> : m.text ? <RichText text={m.text} /> : <span className="asst-typing">Thinking…</span>}
              {m.streaming && m.text && <span className="asst-caret" aria-hidden="true" />}
              {m.note && <p className="asst-note">{m.note}</p>}
              {m.ai && !m.streaming && <p className="asst-note">AI-generated. Double-check anything important.</p>}
              {m.actions?.length > 0 && (
                <div className="asst-actions">
                  {m.actions.map((a) => (
                    <ActionButton key={`${a.type}-${a.projectId || a.section}`} action={a} onAction={onAction} />
                  ))}
                </div>
              )}
              {m.sources?.length > 0 && (
                <details className="asst-sources">
                  <summary>Sources ({new Set(m.sources).size})</summary>
                  <ul>
                    {[...new Set(m.sources)].map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )
        )}
        {busy && !llmEnabled && <div className="asst-msg asst-bot asst-typing">Looking through my notes…</div>}
      </div>

      <form
        className="asst-form"
        onSubmit={(e) => {
          e.preventDefault();
          ask(text);
        }}
      >
        <input
          ref={inputRef}
          value={text}
          maxLength={300}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask a question..."
          aria-label="Ask a question"
        />
        <button type="submit" disabled={!text.trim() || busy} aria-label="Send">
          ↑
        </button>
      </form>
    </motion.aside>
  );
}
