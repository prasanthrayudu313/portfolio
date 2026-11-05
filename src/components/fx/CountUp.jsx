import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

const NUM = /\d[\d,]*\.?\d*/g;

// Counts every number inside a string (e.g. "35-50%", "~9,879 um^2") up from 0 when scrolled into view.
export default function CountUp({ value, duration = 1.1 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();
  const [progress, setP] = useState(0);
  const p = reduced ? 1 : progress;

  useEffect(() => {
    if (!inView || reduced) return;
    const c = animate(0, 1, { duration, ease: "easeOut", onUpdate: setP });
    return () => c.stop();
  }, [inView, reduced, duration]);

  const text = value.replace(NUM, (tok) => {
    const target = parseFloat(tok.replace(/,/g, ""));
    const decimals = tok.includes(".") ? tok.split(".")[1].length : 0;
    const cur = (target * p).toFixed(decimals);
    return tok.includes(",") ? Number(cur).toLocaleString("en-US", { minimumFractionDigits: decimals }) : cur;
  });

  return <span ref={ref}>{text}</span>;
}
