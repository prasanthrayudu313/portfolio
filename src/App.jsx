import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";

const skillGroups = [
  {
    title: "AI, HDC & Edge Computing",
    items: [
      "Hyperdimensional Computing (HDC)",
      "Edge AI Optimization",
      "AI / Machine Learning",
      "Quantization-Aware Design",
      "PIM Co-Design",
      "Inference Optimization",
      "Hardware-Aware Modeling",
    ],
  },
  {
    title: "FPGA, Digital & Embedded Systems",
    items: [
      "FPGA Development",
      "HDL Design (Verilog/VHDL)",
      "Embedded Systems",
      "RTL Debug",
      "SoC Validation",
      "Digital Systems",
      "Computer Architecture",
    ],
  },
  {
    title: "Simulation, Tools & Automation",
    items: [
      "Python",
      "MATLAB",
      "C / C++",
      "SimPy",
      "Streamlit",
      "PyDeck",
      "Vivado",
      "ModelSim",
      "Synopsys VCS",
      "Git / Make / Tcl / Shell",
      "LabVIEW",
      "Data Visualization",
    ],
  },
  {
    title: "Analog, Wireless & Systems",
    items: [
      "Cadence Virtuoso",
      "Spectre",
      "HFSS",
      "ADS",
      "Analog/Mixed-Signal Design",
      "Wireless Systems",
      "Networking Systems",
      "Power Modeling",
      "DAQ / Oscilloscopes",
      "Signal Integrity",
      "RF Test Automation",
    ],
  },
];

const resumes = [
  {
    title: "Analog / Mixed-Signal Resume",
    href: "/portfolio/resume-analog.pdf",
    label: "View Resume",
  },
  {
    title: "Power / SoC / Edge AI Resume",
    href: "/portfolio/resume-power.pdf",
    label: "View Resume",
  },
  {
    title: "RF / Wireless Resume",
    href: "/portfolio/resume-rf.pdf",
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

const projects = [
  {
    title: "Delay Tolerant Network (DTN) Simulator",
    subtitle: "Python | SimPy | Streamlit | Networking Systems",
    short:
      "Built a store-carry-forward DTN simulator with routing, PHY/MAC modeling, and interactive 3D visualization.",
    description:
      "Designed and developed a DTN simulation framework modeling intermittent connectivity across 7+ nodes with BLE and Wi-Fi Direct abstractions using an event-driven architecture.",
    highlights: [
      "Implemented Epidemic, Spray-and-Wait, and PRoPHET routing",
      "Added TTL control, duplicate suppression, and finite buffer constraints",
      "Modeled BER, ARQ, half-duplex links, and contact-capacity behavior",
      "Processed 500+ contact events in structured experiments",
      "Built a Streamlit + PyDeck 3D dashboard for topology and metric visualization",
    ],
  },
  {
    title: "Test & Measurement System for FPGA-Based Neural Network Video Processor",
    subtitle: "FPGA | MATLAB | LabVIEW | Hardware Testing",
    short:
      "Implemented an FPGA vision block and automated latency, noise, and jitter measurements.",
    description:
      "Designed and implemented an FPGA-based neural network block for RGB pixel classification at 30 fps with high detection accuracy and automated test workflows.",
    highlights: [
      "Achieved >95% detection accuracy",
      "Measured latency, jitter, and noise using DAQ modules and oscilloscopes",
      "Reduced error margin by 12%",
      "Reduced manual testing time by 25%",
      "Maintained stable behavior across ±10% lighting variation",
    ],
  },
  {
    title: "Multi-Constraint HW-SW Co-Optimization for In-Memory Hyperdimensional Computing",
    subtitle: "HDC | Edge AI | PIM | Hardware-Software Co-Design",
    short:
      "Created HyperOPT to co-optimize HDC models and analog PIM hardware for edge AI.",
    description:
      "Designed and implemented HyperOPT, a co-design framework for optimizing Hyperdimensional Computing models on analog Processing-in-Memory architectures for energy-efficient inference.",
    highlights: [
      "Reduced inference energy by about 35–50%",
      "Reduced latency by around 30%",
      "Improved accuracy by up to 12% under 1–3 bit quantization",
      "Reduced memory footprint by 25%",
      "Reduced area overhead by ~20% for MLC-based mappings",
    ],
  },
  {
    title: "Power-Aware Inference Optimization for Edge AI on PIM SoCs",
    subtitle: "Python | MATLAB | HDC | Low-Power AI",
    short:
      "Modeled power-performance tradeoffs for HDC inference on analog PIM accelerators.",
    description:
      "Analyzed dimensionality reduction, quantization, and analog non-idealities for ultra-low-power edge AI deployment.",
    highlights: [
      "Predicted up to 42% energy savings",
      "Kept accuracy loss below 3% in modeled scenarios",
      "Built workload-level simulation models in Python and MATLAB",
      "Proposed power-aware constraints for edge sensor deployment",
    ],
  },
  {
    title: "Dynamic Power Profiling Framework for SoC RTL Validation",
    subtitle: "Python | RTL | VCD Analysis | Power Estimation",
    short:
      "Automated switching-activity extraction and IP-level dynamic power estimation from RTL simulations.",
    description:
      "Developed an automated framework to parse VCD activity and estimate dynamic power behavior across SoC IP blocks.",
    highlights: [
      "Computed switching factors directly from RTL simulation output",
      "Reached 88% correlation to post-silicon dynamic power results",
      "Generated IP-level power breakdown reports",
      "Modeled clock gating and bus utilization effects",
      "Integrated regression hooks for nightly analysis",
    ],
  },
  {
    title: "System-Level FPGA Emulation Framework for SoC Subsystem Validation",
    subtitle: "FPGA | Verilog | SoC Validation | Pre-Silicon Emulation",
    short:
      "Integrated a multi-IP SoC prototype on FPGA for pre-silicon subsystem validation.",
    description:
      "Designed and integrated a multi-IP SoC prototype on a Xilinx FPGA to validate CPU-microcontroller subsystem behavior before silicon.",
    highlights: [
      "Built reusable Verilog testbenches and transactors",
      "Simulated register access, MMIO, and interrupts",
      "Reduced build cycle by 40% using Tcl and Make automation",
      "Debugged RTL-to-emulation mismatches with ModelSim and ILA probes",
      "Validated timing, function, and arbitration across teams",
    ],
  },
  {
    title: "FPGA Emulation Flow Automation with CI/CD Integration",
    subtitle: "Python | CI/CD | FPGA Bring-Up | Automation",
    short:
      "Built an automated FPGA emulation flow with remote access, job control, and failure triage.",
    description:
      "Developed a scalable automation flow for FPGA build, runtime setup, source tracking, and regression mismatch analysis.",
    highlights: [
      "Automated FPGA builds and runtime environment setup",
      "Integrated Git-based source tracking and concurrent branch handling",
      "Enabled root-cause tracking for 95%+ of emulation mismatches",
      "Explored ML-assisted clustering for regression failures",
    ],
  },
  {
    title: "Transistor-Level Analog Readout Chain for CMOS Image Sensor",
    subtitle: "Analog Design | Cadence Virtuoso | CMOS Imaging",
    short:
      "Designed a complete analog readout chain for CMOS image sensing with strong SNR and yield.",
    description:
      "Designed and simulated a source follower, CDS stage, and programmable gain amplifier for CMOS image sensor readout in Cadence Virtuoso.",
    highlights: [
      "Achieved 64.8 dB SNR",
      "Maintained gain linearity within ±1.5%",
      "Validated >95% yield under ±5% mismatch",
      "Completed layout and parasitic validation with DRC/LVS",
      "Reduced analog front-end area by 12%",
    ],
  },
  {
    title: "Pixel-Level Analog Signal Chain Optimization for Low-Noise Imaging",
    subtitle: "Analog/Mixed-Signal | Spectre | Low-Noise Design",
    short:
      "Optimized the photodiode-to-ADC analog chain for low-noise imaging under low-light conditions.",
    description:
      "Modeled the signal path and optimized low-noise charge amplification and correlated sample-hold performance across temperature and process variation.",
    highlights: [
      "Designed low-noise analog front-end stages",
      "Improved robustness under sub-µlux illumination",
      "Validated operation across 0–85°C and process variation",
      "Worked with layout constraints including shielding and matched sizing",
    ],
  },
  {
    title: "RF DUT Automation & Measurement Framework",
    subtitle: "Python | SCPI | RF Measurement | Wireless Systems",
    short:
      "Built Python automation for RF test equipment control, measurement parsing, and calibration reporting.",
    description:
      "Developed a Python-based automation framework to control RF test instruments and generate automated reports for characterization workflows.",
    highlights: [
      "Controlled VNA, spectrum analyzer, and signal generator via SCPI",
      "Automated power sweep, IP3, NF, and ACPR routines",
      "Generated summary reports benchmarked to specs",
      "Improved repeatability and reduced manual overhead",
    ],
  },
];

const experience = [
  {
    role: "Teaching Assistant / Instructor",
    company: "Department of Computer Engineering, San Diego State University",
    details:
      "Delivered instructional support for undergraduate and graduate courses, teaching digital systems, machine learning, and data analysis to classes of 150+ students. Led discussion sections and labs, evaluated assignments and exams, hosted office hours, and used Python, MATLAB, and data visualization tools to reinforce hands-on understanding.",
  },
  {
    role: "Research Assistant – Edge AI & In-Memory Computing",
    company: "San Diego State University",
    details:
      "Collaborated on hardware-software co-optimization of Hyperdimensional Computing for edge AI using analog PIM architectures. Designed HyperOPT to jointly tune HDC algorithms and hardware parameters under accuracy, energy, latency, and area constraints, achieving strong gains in energy efficiency, latency, robustness, and memory efficiency.",
  },
  {
    role: "Student Intern",
    company: "In22 Labs",
    details:
      "Contributed to machine-learning-driven engineering workflows, RTL validation, embedded co-simulation, automation, and technical analysis across applied engineering tasks.",
  },
];

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

function ResumeCard({ title, href, label }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="resume-card glass-card">
      <p className="section-kicker">Resume</p>
      <h3>{title}</h3>
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
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
          <p className="section-kicker">{project.subtitle}</p>
          <h3>{project.title}</h3>
          <p className="modal-description">{project.description}</p>
          <div className="highlight-list">
            {project.highlights.map((point) => (
              <div key={point} className="highlight-item">
                <span className="highlight-dot"></span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ProjectCard({ project, index, onOpen, featured = false }) {
  return (
    <motion.button
      type="button"
      className={`glass-card project-card ${featured ? "project-card-featured" : ""}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onOpen(project)}
    >
      <p className="section-kicker">{project.subtitle}</p>
      <h3>{project.title}</h3>
      <p className="project-short">{project.short}</p>
      <span className="project-open">View details ↗</span>
    </motion.button>
  );
}

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="site-shell">
      <div className="ambient ambient-1"></div>
      <div className="ambient ambient-2"></div>
      <div className="ambient ambient-3"></div>

      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand-block">
            <a href="#home" className="brand-name">
              Prasanth Rayudu
            </a>
            <span className="brand-location">San Diego, CA</span>
          </div>

          <nav className="nav-links">
            <a href="#about">About</a>
            <a href="#featured">Featured</a>
            <a href="#skills">Skills</a>
            <a href="#projects">Projects</a>
            <a href="#experience">Experience</a>
            <a href="#resumes">Resumes</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <main>
        <section id="home" className="hero-section container">
          <div className="hero-grid">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="eyebrow">Interactive Portfolio</p>
              <h1 className="hero-title">Prasanth Rayudu</h1>
              <p className="hero-subtitle">
                HDC | FPGA | Embedded Systems | AI | Wireless Engineering
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
                <a
                  href="/portfolio/resume-power.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-btn"
                >
                  Download Resume
                </a>
              </div>

              <div className="hero-mini-stats">
                <div className="mini-stat glass-card">
                  <span className="mini-value">10+</span>
                  <span className="mini-label">major engineering projects</span>
                </div>
                <div className="mini-stat glass-card">
                  <span className="mini-value">150+</span>
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
              <div className="window-controls">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="panel-block">
                <p className="panel-label">Focus Areas</p>
                <h3>HDC • FPGA • Embedded • AI • Wireless • Power</h3>
              </div>

              <div className="panel-grid">
                <div className="panel-block">
                  <p className="panel-label">Education</p>
                  <h3>MS, Computer Engineering</h3>
                </div>
                <div className="panel-block">
                  <p className="panel-label">Phone</p>
                  <h3>(408) 396-1546</h3>
                </div>
              </div>

              <div className="panel-block">
                <p className="panel-label">Current Goal</p>
                <h3>
                  Hardware, AI, FPGA, SoC, Embedded, Wireless, and
                  Cross-Domain Engineering Roles
                </h3>
              </div>

              <div className="signal-line">
                <span></span>
                <span></span>
                <span></span>
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
              networking simulation, RF/wireless workflows, and automation. That
              breadth is reflected across your uploaded resumes in analog image
              sensor design, power-aware SoC analysis, RF automation, and FPGA
              validation. :contentReference[oaicite:3]{index=3} :contentReference[oaicite:4]{index=4} :contentReference[oaicite:5]{index=5}
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
                  <span className="metric-value">{metric.value}</span>
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
              Skills below are aligned to your HDC, FPGA, analog, power,
              wireless, and automation work, including the uploaded resumes and
              research/project descriptions. :contentReference[oaicite:6]{index=6} :contentReference[oaicite:7]{index=7} :contentReference[oaicite:8]{index=8}
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
            <h2>Click any project to open a full detail popup.</h2>
            <p>
              The project mix now tells a strong story: HDC and edge AI, FPGA
              validation, SoC power analysis, analog/mixed-signal design,
              networking systems, and RF automation. :contentReference[oaicite:9]{index=9} :contentReference[oaicite:10]{index=10} :contentReference[oaicite:11]{index=11}
            </p>
          </div>

          <div className="projects-grid">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.title}
                project={project}
                index={index}
                onOpen={setSelectedProject}
                featured={project.title.includes("Hyperdimensional Computing")}
              />
            ))}
          </div>
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
              You uploaded resumes targeted toward analog design, power/SoC
              analysis, and RF engineering, so this section lets recruiters open
              the most relevant version directly. :contentReference[oaicite:12]{index=12} :contentReference[oaicite:13]{index=13} :contentReference[oaicite:14]{index=14}
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
                FPGA, embedded systems, power-aware architecture, analog/mixed-signal
                design, and wireless systems.
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

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}