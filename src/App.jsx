import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { projects } from "./data/projects";
import { experience, skillGroups } from "./data/profile";
import HeroGraphic from "./components/fx/HeroGraphic";
import CountUp from "./components/fx/CountUp";
import RotatingWords from "./components/fx/RotatingWords";
import "./App.css";

// Assistant code is a separate chunk, fetched only when the visitor opens it.
const AssistantPanel = lazy(() => import("./components/assistant/AssistantPanel"));

const resumes = [
  {
    title: "ASIC Verification Engineer",
    focus: "SystemVerilog testbenches, BFMs, FPGA/SoC validation",
    href: "/portfolio/resume-asic-verification.pdf",
    label: "View Resume",
  },
  {
    title: "RTL Design Engineer",
    focus: "Verilog/SystemVerilog design, timing closure, CDC",
    href: "/portfolio/resume-rtl-design.pdf",
    label: "View Resume",
  },
  {
    title: "Silicon / Graduate Engineer",
    focus: "Micro-architecture, RTL for accelerators, PPA and power tooling",
    href: "/portfolio/resume-silicon-engineer.pdf",
    label: "View Resume",
  },
  {
    title: "GPU Engineer",
    focus: "GPU architecture modeling, performance and power verification",
    href: "/portfolio/resume-gpu-engineer.pdf",
    label: "View Resume",
  },
];

const featuredProject = {
  title: "HyperOPT: HW-SW Co-Optimization for In-Memory Hyperdimensional Computing",
  subtitle: "Featured Project",
  description:
    "A hardware-software co-design framework for optimizing Hyperdimensional Computing on analog Processing-in-Memory architectures for edge AI systems.",
  metrics: [
    { value: "35–50%", label: "energy reduction" },
    { value: "~30%", label: "latency improvement" },
    { value: "12%", label: "accuracy gain under low-bit quantization" },
    { value: "25%", label: "memory footprint reduction" },
  ],
  details: [
    "Jointly tuned HDC algorithms and PIM hardware under multi-objective constraints: accuracy, energy, latency, and area.",
    "Integrated hardware-aware noise modeling into the optimization flow to improve robustness under 1–3 bit quantization.",
    "Used binary-search-based design space exploration with pruning to reduce optimization runtime by ~40%.",
    "Evaluated MLC-based NVM mappings and analog non-idealities including device variability and noise.",
  ],
};

function SkillGroup({ title, items }) {
  return (
    <motion.div
      className="glass-card skill-group-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
    >
      <p className="section-kicker">{title}</p>
      <div className="skill-chip-wrap">
        {items.map((item) => (
          <span key={item} className="skill-chip">
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function ResumeCard({ title, focus, href, label }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="resume-card glass-card">
      <p className="section-kicker">Resume · PDF</p>
      <h3>{title}</h3>
      <p className="resume-focus">{focus}</p>
      <span className="resume-link">{label} ↗</span>
    </a>
  );
}

function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.22 }}
        >
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
          <p className="section-kicker">
            {project.domain} · {project.tools}
          </p>
          <h3>{project.title}</h3>
          <p className="modal-role">{project.role}</p>

          <h4 className="star-head">Why I built it</h4>
          <p className="modal-description">{project.situation}</p>
          <h4 className="star-head">What I set out to do</h4>
          <p className="modal-description">{project.task}</p>
          <h4 className="star-head">What I did</h4>
          <div className="highlight-list">
            {project.action.map((point) => (
              <div key={point} className="highlight-item">
                <span className="highlight-dot"></span>
                <span>{point}</span>
              </div>
            ))}
          </div>
          <h4 className="star-head">
            What came out <span className="status-badge">{project.status}</span>
          </h4>
          {project.results.length > 0 ? (
            <div className="result-grid">
              {project.results.map((r, i) => (
                <motion.div
                  key={r.t}
                  className="metric-card"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                >
                  <span className="metric-value">
                    <CountUp value={r.n} />
                  </span>
                  <span className="metric-label">{r.t}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="modal-description">No quantitative results to report for this one.</p>
          )}
          {project.problems.length > 0 && (
            <>
              <h4 className="star-head">Problems I hit and how I fixed them</h4>
              <div className="highlight-list">
                {project.problems.map((p) => (
                  <div key={p.problem} className="problem-row">
                    <p><strong>Problem:</strong> {p.problem}</p>
                    <p><strong>Fix:</strong> {p.solution}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {project.limits && <p className="modal-limits">Worth knowing: {project.limits}</p>}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Tilts toward the cursor and lights up under it; values go through CSS variables, no re-render.
function ProjectCard({ project, onOpen, featured = false }) {
  const move = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.setProperty("--rx", `${(0.5 - y) * 7}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 9}deg`);
  };
  const leave = (e) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <motion.div
      layout
      className="tilt-wrap"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
    >
      <button
        type="button"
        className={`glass-card project-card ${featured ? "project-card-featured" : ""}`}
        onMouseMove={move}
        onMouseLeave={leave}
        onClick={() => onOpen(project)}
      >
        <p className="section-kicker">{project.domain}</p>
        <h3>{project.title}</h3>
        <p className="project-short">{project.short}</p>
        {project.results[0] && (
          <p className="project-metric">
            <strong>
              <CountUp value={project.results[0].n} />
            </strong>{" "}
            {project.results[0].t}
          </p>
        )}
        <span className="project-open">See how it went →</span>
      </button>
    </motion.div>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return <motion.div className="scroll-progress" style={{ scaleX }} />;
}

const SECTIONS = ["contact", "resumes", "skills", "experience", "projects"];
const NAV = ["about", "featured", "skills", "projects", "experience", "resumes", "contact"];

function useActiveSection() {
  const [active, setActive] = useState("");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    NAV.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  return active;
}

const category = (p) => p.domain.split(" / ")[0];

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState("All");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const active = useActiveSection();
  const handleAssistantAction = (a) => {
    if (a.type === "OPEN_PROJECT") setSelectedProject(projects.find((p) => p.id === a.projectId) || null);
    if (a.type === "GO_SECTION" && SECTIONS.includes(a.section)) {
      setAssistantOpen(false);
      document.getElementById(a.section)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // One-time nudge so first-time visitors notice the assistant.
  const [teaser, setTeaser] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("asst-teased")) return;
    const show = setTimeout(() => setTeaser(true), 2500);
    const hide = setTimeout(() => setTeaser(false), 11000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);
  const openAssistant = () => {
    sessionStorage.setItem("asst-teased", "1");
    setTeaser(false);
    setAssistantOpen(true);
  };
  const categories = useMemo(() => {
    const counts = {};
    projects.forEach((p) => (counts[category(p)] = (counts[category(p)] || 0) + 1));
    return Object.entries(counts);
  }, []);
  const shown = filter === "All" ? projects : projects.filter((p) => category(p) === filter);

  return (
    <div className="site-shell">
      <ScrollProgress />
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand-block">
            <a href="#home" className="brand-name">
              Prasanth Rayudu
            </a>
            <span className="brand-location">San Diego, CA</span>
          </div>

          <nav className="nav-links">
            {NAV.map((id) => (
              <a key={id} href={`#${id}`} className={active === id ? "active" : ""}>
                {id[0].toUpperCase() + id.slice(1)}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section id="home" className="hero-section container">
          <HeroGraphic />
          <div className="hero-grid">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="eyebrow">Computer Engineer</p>
              <h1 className="hero-title">Prasanth Rayudu</h1>
              <p className="hero-subtitle">
                I build{" "}
                <RotatingWords
                  words={[
                    "AI hardware",
                    "FPGA and RTL systems",
                    "in-memory computing",
                    "embedded firmware",
                    "analog and RF designs",
                    "engineering automation",
                  ]}
                />
              </p>
              <p className="hero-copy">
                I design intelligent computing systems across Hyperdimensional
                Computing, FPGA platforms, embedded systems, edge AI,
                power-aware architectures, analog and mixed-signal design,
                wireless systems, and engineering automation.
              </p>

              <div className="hero-actions">
                <a href="#featured" className="primary-btn">
                  Explore Featured Work
                </a>
                <button type="button" className="secondary-btn ask-btn" onClick={openAssistant}>
                  <span aria-hidden="true">✦</span>&nbsp;Ask my portfolio
                </button>
                <a
                  href="/portfolio/resume-silicon-engineer.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-btn"
                >
                  Download Resume
                </a>
              </div>

              <div className="hero-mini-stats">
                <div className="mini-stat glass-card">
                  <span className="mini-value">
                    <CountUp value={`${projects.length}+`} />
                  </span>
                  <span className="mini-label">engineering projects</span>
                </div>
                <div className="mini-stat glass-card">
                  <span className="mini-value">
                    <CountUp value="150+" />
                  </span>
                  <span className="mini-label">students supported in teaching</span>
                </div>
                <div className="mini-stat glass-card">
                  <span className="mini-value">MS</span>
                  <span className="mini-label">Computer Engineering, SDSU</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="hero-panel glass-card"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75 }}
            >
              <div className="panel-block">
                <p className="panel-label">Focus Areas</p>
                <h3>HDC • FPGA • Embedded • AI • Wireless • Power</h3>
              </div>

              <div className="panel-block">
                <p className="panel-label">Education</p>
                <h3>MS, Computer Engineering</h3>
              </div>

              <div className="panel-block">
                <p className="panel-label">Current Goal</p>
                <h3>
                  Hardware, AI, FPGA, SoC, Embedded, Wireless, and
                  Cross-Domain Engineering Roles
                </h3>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="about" className="content-section container">
          <div className="section-head">
            <p className="eyebrow">About</p>
            <h2>Modern engineering across hardware, intelligence, and system performance.</h2>
            <p>
              I am a Computer Engineering master’s student building systems that
              connect algorithms, hardware, and real-world validation. My work
              spans HDC-based edge AI, FPGA emulation, digital and embedded
              systems, power modeling, analog and mixed-signal circuits,
              networking simulation, RF and wireless workflows, and automation.
            </p>
          </div>
        </section>

        <section id="featured" className="content-section container">
          <div className="featured-wrap glass-card">
            <div className="featured-copy">
              <p className="eyebrow">{featuredProject.subtitle}</p>
              <h2>{featuredProject.title}</h2>
              <p>{featuredProject.description}</p>

              <div className="featured-points">
                {featuredProject.details.map((item) => (
                  <div key={item} className="highlight-item">
                    <span className="highlight-dot"></span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="featured-metrics">
              {featuredProject.metrics.map((metric) => (
                <div key={metric.label} className="metric-card">
                  <span className="metric-value">
                    <CountUp value={metric.value} />
                  </span>
                  <span className="metric-label">{metric.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="skills" className="content-section container">
          <div className="section-head">
            <p className="eyebrow">Skills</p>
            <h2>Cross-domain capability, grouped like a modern engineering profile.</h2>
            <p>
              A blend of HDC, FPGA, analog design, power analysis, wireless systems,
              simulation tools, and engineering automation.
            </p>
          </div>

          <div className="skills-grid">
            {skillGroups.map((group) => (
              <SkillGroup key={group.title} title={group.title} items={group.items} />
            ))}
          </div>
        </section>

        <section id="projects" className="content-section container">
          <div className="section-head">
            <p className="eyebrow">Projects</p>
            <h2>Things I've built, and what came out of them.</h2>
            <p>
              Open any project to see why I built it, what I did, the numbers,
              and the problems I hit along the way. Each result is labelled
              measured, modeled, simulated, or reported.
            </p>
          </div>

          <div className="filter-row" role="tablist" aria-label="Filter projects">
            {[["All", projects.length], ...categories].map(([name, n]) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={filter === name}
                className={`filter-chip ${filter === name ? "selected" : ""}`}
                onClick={() => setFilter(name)}
              >
                {name} <span>{n}</span>
              </button>
            ))}
          </div>

          <motion.div layout className="projects-grid">
            <AnimatePresence mode="popLayout">
              {shown.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={setSelectedProject}
                  featured={project.id === "hyperopt"}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </section>

        <section id="experience" className="content-section container">
          <div className="section-head">
            <p className="eyebrow">Experience</p>
            <h2>Teaching, research, and industry-facing engineering work.</h2>
          </div>

          <div className="experience-stack">
            {experience.map((item, index) => (
              <motion.div
                key={item.role}
                className="glass-card experience-card"
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <p className="section-kicker">{item.company}</p>
                <h3>{item.role}</h3>
                <p>{item.details}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="resumes" className="content-section container">
          <div className="section-head">
            <p className="eyebrow">Resumes</p>
            <h2>Role-targeted resumes for different opportunities.</h2>
            <p>
              Open the version that best matches the role.
            </p>
          </div>

          <div className="resume-grid">
            {resumes.map((resume) => (
              <ResumeCard key={resume.title} {...resume} />
            ))}
          </div>
        </section>

        <section id="contact" className="content-section container">
          <div className="contact-panel glass-card">
            <div>
              <p className="eyebrow">Contact</p>
              <h2>Let’s build something impactful.</h2>
              <p className="contact-copy">
                I’m interested in engineering roles across AI hardware, HDC,
                FPGA, embedded systems, power-aware architecture,
                analog and mixed-signal design, and wireless systems.
              </p>
            </div>

            <div className="contact-links">
              <a href="mailto:rprasanth2024@gmail.com">rprasanth2024@gmail.com</a>
              <a href="tel:+14083961546">(408) 396-1546</a>
              <a
                href="https://www.linkedin.com/in/prasanth-rayudu"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/prasanthrayudu313"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
        </section>
      </main>

      {!assistantOpen && (
        <div className="asst-dock">
          <AnimatePresence>
            {teaser && (
              <motion.button
                type="button"
                className="asst-teaser"
                onClick={openAssistant}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6 }}
              >
                Ask me about any project, tool, or result
              </motion.button>
            )}
          </AnimatePresence>
          <motion.button
            type="button"
            className="asst-launcher"
            onClick={openAssistant}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            <span className="asst-spark" aria-hidden="true">✦</span>
            <span>
              Ask my portfolio
              <small>Instant answers about my work</small>
            </span>
          </motion.button>
        </div>
      )}
      <AnimatePresence>
        {assistantOpen && (
          <Suspense fallback={null}>
            <AssistantPanel
              onClose={() => setAssistantOpen(false)}
              onAction={handleAssistantAction}
              currentProjectId={selectedProject?.id}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
