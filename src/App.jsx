import { motion } from "framer-motion";
import "./App.css";

const skillGroups = [
  {
    title: "Hardware & Digital Systems",
    items: [
      "FPGA Development",
      "HDL Design (Verilog/VHDL)",
      "Embedded Systems",
      "SoC Validation",
      "RTL Debug",
      "Digital Systems",
      "Computer Architecture",
    ],
  },
  {
    title: "AI, HDC & Edge Computing",
    items: [
      "Hyperdimensional Computing (HDC)",
      "AI / Machine Learning",
      "Edge AI Optimization",
      "Quantization-Aware Design",
      "PIM Co-Design",
      "Inference Optimization",
      "Data Analysis",
    ],
  },
  {
    title: "Modeling, Simulation & Tools",
    items: [
      "Python",
      "MATLAB",
      "C++",
      "SimPy",
      "Streamlit",
      "PyDeck",
      "Vivado",
      "ModelSim",
      "Synopsys VCS",
      "Cadence Virtuoso",
      "Spectre",
      "HFSS",
      "ADS",
    ],
  },
  {
    title: "Testing, Systems & Communication",
    items: [
      "Test Automation",
      "Power Modeling",
      "Dynamic Power Estimation",
      "Signal Activity Analysis",
      "Wireless Systems",
      "Networking Systems",
      "LabVIEW",
      "DAQ / Oscilloscopes",
      "Data Visualization",
      "Git / Make / Tcl / Shell",
    ],
  },
];

const projects = [
  {
    title: "Delay Tolerant Network (DTN) Simulator",
    subtitle: "Python | SimPy | Streamlit | Networking Systems",
    description:
      "Designed and developed a DTN simulation framework modeling intermittent connectivity using a store-carry-forward architecture across 7+ nodes with BLE and Wi-Fi Direct abstractions.",
    highlights: [
      "Implemented 3 routing protocols: Epidemic, Spray-and-Wait, and PRoPHET",
      "Added TTL management, duplicate suppression, and finite buffer constraints",
      "Modeled PHY/MAC behavior including contact capacity, BER, ARQ, and half-duplex communication",
      "Built an event-driven simulator processing 500+ contact events",
      "Created an interactive 3D visualization dashboard using Streamlit and PyDeck",
      "Ran structured experiments on buffer size, TTL, reliability, delay, and overhead trade-offs",
    ],
  },
  {
    title: "Test & Measurement System for FPGA-Based Neural Network Video Processor",
    subtitle: "FPGA | MATLAB | LabVIEW | Hardware Testing",
    description:
      "Designed and implemented an FPGA-based neural network block for RGB pixel classification at 30 fps with high detection accuracy under predefined color thresholds.",
    highlights: [
      "Achieved >95% detection accuracy for target color thresholds",
      "Integrated DAQ modules and oscilloscopes for latency, jitter, and noise measurements",
      "Reduced system error margin by 12% compared to the initial design",
      "Automated measurement routines with MATLAB and LabVIEW",
      "Reduced manual testing time by 25%",
      "Stabilized operation across ±10% lighting variation using variance-based threshold optimization",
    ],
  },
  {
    title: "Multi-Constraint HW-SW Co-Optimization for In-Memory Hyperdimensional Computing",
    subtitle: "HDC | Edge AI | PIM | Hardware-Software Co-Design",
    description:
      "Designed and implemented HyperOPT, a hardware-software co-design framework for optimizing Hyperdimensional Computing models on analog Processing-in-Memory architectures for edge AI applications.",
    highlights: [
      "Reduced inference energy by about 35–50%",
      "Reduced latency by around 30%",
      "Improved model accuracy by up to 12% under aggressive 1–3 bit quantization",
      "Built a multi-objective optimization engine for accuracy, energy, latency, and area",
      "Cut optimization runtime by ~40% using binary-search-based exploration with pruning",
      "Reduced memory footprint by 25% without major accuracy loss",
      "Reduced area overhead by ~20% for MLC-based NVM crossbar mappings",
      "Modeled and mitigated analog PIM noise and device variability",
    ],
  },
  {
    title: "Power-Aware Inference Optimization for Edge AI on PIM SoCs",
    subtitle: "Python | MATLAB | HDC | Low-Power AI",
    description:
      "Modeled power-performance tradeoffs for Hyperdimensional Computing inference workloads running on analog PIM accelerators for ultra-low-power edge AI systems.",
    highlights: [
      "Analyzed dimensionality reduction, quantization, and analog non-idealities",
      "Predicted energy savings up to 42% with less than 3% accuracy loss",
      "Built workload-level simulation models in Python and MATLAB",
      "Proposed power-aware design constraints for edge sensor deployment",
    ],
  },
  {
    title: "Dynamic Power Profiling Framework for SoC RTL Validation",
    subtitle: "Python | RTL | VCD Analysis | Power Estimation",
    description:
      "Developed an automated framework to extract switching activity from RTL simulations and estimate dynamic power behavior across multiple SoC IP blocks.",
    highlights: [
      "Parsed VCD files to compute switching factors automatically",
      "Achieved 88% correlation to post-silicon dynamic power results",
      "Generated IP-level power breakdown reports",
      "Modeled impact of clock gating and bus utilization on energy consumption",
      "Integrated regression hooks for nightly build analysis",
    ],
  },
  {
    title: "Energy Efficiency Exploration in Compact AI Hardware Models",
    subtitle: "AI Hardware | Quantization | Energy-Latency Tradeoffs",
    description:
      "Evaluated the tradeoffs between accuracy, latency, and energy in highly quantized neural and hyperdimensional models for constrained hardware systems.",
    highlights: [
      "Explored compact AI workloads under strict power budgets",
      "Analyzed algorithmic hyperparameter space using Python-based simulations",
      "Configured optimized hardware-aware AI deployments for edge applications",
    ],
  },
  {
    title: "System-Level FPGA Emulation Framework for SoC Subsystem Validation",
    subtitle: "FPGA | Verilog | SoC Validation | Pre-Silicon Emulation",
    description:
      "Designed and integrated a multi-IP SoC prototype on a Xilinx FPGA to enable pre-silicon validation of a CPU-microcontroller subsystem.",
    highlights: [
      "Built reusable Verilog testbenches and transactors",
      "Simulated register access, memory-mapped I/O, and interrupt scenarios",
      "Created Tcl and Make automation scripts to reduce build cycle by 40%",
      "Debugged RTL-to-emulation mismatches with ModelSim and ILA probes",
      "Validated function, timing, and arbitration with design, firmware, and verification teams",
    ],
  },
  {
    title: "FPGA Emulation Flow Automation with CI/CD Integration",
    subtitle: "Python | CI/CD | FPGA Bring-Up | Automation",
    description:
      "Built a scalable FPGA emulation flow with support for remote access, CI-triggered builds, simulation-to-hardware handoff, and automated failure triage.",
    highlights: [
      "Implemented Python automation for FPGA builds and runtime environment setup",
      "Integrated Git-based source tracking and job control using Make and shell scripts",
      "Supported multiple concurrent test branches",
      "Enabled root-cause tracking for over 95% of emulation mismatches",
      "Explored ML-assisted debug suggestion workflows for regression failure clustering",
    ],
  },
  {
    title: "Transistor-Level Analog Readout Chain for CMOS Image Sensor",
    subtitle: "Analog Design | Cadence Virtuoso | CMOS Imaging",
    description:
      "Designed and simulated a complete analog readout chain including source follower buffer, CDS stage, and programmable gain amplifier for CMOS image sensing applications.",
    highlights: [
      "Achieved 64.8 dB SNR",
      "Maintained gain linearity within ±1.5% across a 10-bit dynamic range",
      "Verified >95% yield under ±5% mismatch through corner and Monte Carlo analysis",
      "Completed layout and parasitic validation with Calibre DRC/LVS",
      "Reduced analog front-end area by 12%",
    ],
  },
  {
    title: "Pixel-Level Analog Signal Chain Optimization for Low-Noise Imaging",
    subtitle: "Analog/Mixed-Signal | Spectre | Low-Noise Design",
    description:
      "Modeled the photodiode-to-ADC signal path and optimized the analog chain for low-noise imaging under low-light conditions.",
    highlights: [
      "Designed a low-noise charge amplifier and correlated sample-hold stage",
      "Improved robustness under sub-µlux illumination",
      "Validated performance across 0–85°C and process variation",
      "Worked with layout engineers on shielding and matched sizing",
    ],
  },
];

const experience = [
  {
    role: "Teaching Assistant / Instructor",
    company: "Department of Computer Engineering, San Diego State University",
    details:
      "Delivered instructional support for undergraduate and graduate courses, teaching core concepts in digital systems, machine learning, and data analysis to classes of 150+ students. Led weekly discussion sections and lab sessions, simplified complex technical topics through hands-on demonstrations, coordinated course logistics, evaluated assignments and exams, hosted office hours, and collaborated with faculty and fellow TAs to develop course materials, grading rubrics, and assessment strategies. Used Python, MATLAB, and data visualization tools to support teaching and real-world demonstrations.",
  },
  {
    role: "Research Assistant – Edge AI & In-Memory Computing",
    company: "San Diego State University",
    details:
      "Collaborated with faculty on hardware-software co-optimization of Hyperdimensional Computing for edge AI using analog Processing-in-Memory architectures. Designed HyperOPT to jointly tune HDC algorithms and PIM hardware parameters under accuracy, energy, latency, and area constraints. Achieved ~35–50% energy reduction, ~30% latency improvement, up to 12% accuracy gains under low-bit quantization, ~40% faster design space exploration, ~25% memory reduction, and ~20% area savings while modeling analog non-idealities such as device variability and noise.",
  },
  {
    role: "Student Intern",
    company: "In22 Labs",
    details:
      "Designed and validated machine-learning-driven engineering workflows, supported embedded and data-driven system development, and contributed to automation, validation, and technical analysis across applied engineering tasks.",
  },
];

function SkillGroup({ title, items }) {
  return (
    <div className="card skill-group-card">
      <p className="project-subtitle">{title}</p>
      <div className="skill-chip-wrap">
        {items.map((item) => (
          <span key={item} className="skill-chip">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project, index }) {
  return (
    <motion.div
      className="card project-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <p className="project-subtitle">{project.subtitle}</p>
      <h3>{project.title}</h3>
      <p className="project-description">{project.description}</p>

      <div className="highlight-list">
        {project.highlights.map((point) => (
          <div key={point} className="highlight-item">
            <span className="highlight-dot"></span>
            <span>{point}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function App() {
  return (
    <div className="site">
      <header className="navbar">
        <div className="container nav-inner">
          <div className="logo-block">
            <a href="#home" className="logo">
              Prasanth Rayudu
            </a>
            <span className="location">San Diego, CA</span>
          </div>

          <nav className="nav-links">
            <a href="#about">About</a>
            <a href="#skills">Skills</a>
            <a href="#projects">Projects</a>
            <a href="#experience">Experience</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <main>
        <section id="home" className="hero container">
          <div className="hero-grid">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="eyebrow">Portfolio</p>

              <h1>Prasanth Rayudu</h1>

              <p className="hero-subtitle">
                HDC | FPGA | Embedded Systems | AI | Wireless Engineering
              </p>

              <p className="hero-text">
                I build intelligent hardware and computing systems across
                Hyperdimensional Computing, FPGA design, embedded systems, AI,
                wireless engineering, SoC validation, power modeling, analog and
                mixed-signal design, networking systems, and engineering
                automation.
              </p>

              <div className="hero-buttons">
                <a href="#projects" className="btn btn-primary">
                  View Projects
                </a>
                <a href="#contact" className="btn btn-secondary">
                  Contact Me
                </a>
              </div>
            </motion.div>

            <motion.div
              className="hero-card"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9 }}
            >
              <div className="window-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="info-box">
                <p className="label">Focus Areas</p>
                <h3>HDC • FPGA • Embedded Systems • AI • Wireless • Power</h3>
              </div>

              <div className="two-col">
                <div className="info-box">
                  <p className="label">Education</p>
                  <h3>MS, Computer Engineering</h3>
                </div>
                <div className="info-box">
                  <p className="label">Location</p>
                  <h3>San Diego, CA</h3>
                </div>
              </div>

              <div className="info-box">
                <p className="label">Phone</p>
                <h3>(408) 396-1546</h3>
              </div>

              <div className="info-box">
                <p className="label">Current Goal</p>
                <h3>
                  Hardware, AI, Embedded, FPGA, SoC, and Wireless Engineering
                  Roles
                </h3>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="about" className="section container">
          <p className="eyebrow">About</p>
          <h2>
            Building intelligent systems at the intersection of hardware,
            computation, and real-world performance.
          </h2>
          <p className="section-text">
            I am a Computer Engineering master’s student focused on practical
            system design across digital hardware, edge AI, embedded systems,
            FPGA prototyping, networking simulation, power-aware optimization,
            analog and mixed-signal circuits, wireless engineering, and
            validation workflows. My work combines modeling, implementation,
            automation, teaching, and experimentation to build efficient and
            reliable systems for modern engineering applications.
          </p>
        </section>

        <section id="skills" className="section container">
          <p className="eyebrow">Skills</p>
          <h2>Core tools and capabilities</h2>
          <p className="section-text">
            A blend of hardware design, AI systems, simulation, validation,
            optimization, and engineering automation shaped by project work,
            research, and teaching.
          </p>

          <div className="skills-groups-grid">
            {skillGroups.map((group) => (
              <SkillGroup key={group.title} title={group.title} items={group.items} />
            ))}
          </div>
        </section>

        <section id="projects" className="section container">
          <p className="eyebrow">Projects</p>
          <h2>Selected engineering work</h2>
          <p className="section-text">
            Projects spanning networking systems, FPGA validation, HDC and edge
            AI optimization, SoC power analysis, emulation automation, and
            analog and mixed-signal design.
          </p>

          <div className="projects-grid">
            {projects.map((project, index) => (
              <ProjectCard key={project.title} project={project} index={index} />
            ))}
          </div>
        </section>

        <section id="experience" className="section container">
          <p className="eyebrow">Experience</p>
          <h2>Work and academic experience</h2>
          <p className="section-text">
            Experience across teaching, research, and internship work involving
            digital systems, machine learning, data analysis, hardware-software
            co-design, and system validation.
          </p>

          <div className="experience-list">
            {experience.map((item, index) => (
              <motion.div
                key={item.role + item.company}
                className="card"
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <p className="project-subtitle">{item.company}</p>
                <h3>{item.role}</h3>
                <p>{item.details}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="contact" className="section container">
          <div className="contact-box">
            <p className="eyebrow">Contact</p>
            <h2>Let’s build something impactful.</h2>
            <p className="section-text">
              I’m interested in opportunities related to hardware engineering,
              embedded systems, FPGA design, HDC, edge AI, SoC validation,
              analog and mixed-signal design, and wireless engineering.
            </p>

            <div className="contact-links">
              <a href="mailto:rprasanth2024@gmail.com">rprasanth2024@gmail.com</a>
              <a href="tel:+14083961546">(408) 396-1546</a>
              <a href="#">Add your LinkedIn link here</a>
              <a href="#">Add your GitHub link here</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;