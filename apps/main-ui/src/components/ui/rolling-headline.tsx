import { motion } from "framer-motion";
import { ReactNode } from "react";

interface RollingWord {
  text: string;
  className?: string;
}

interface RollingHeadlineProps {
  lines: (string | RollingWord)[][];
  className?: string;
  delay?: number;
}

const wordVariants = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function RollingHeadline({
  lines,
  className = "",
  delay = 0.05,
}: RollingHeadlineProps): ReactNode {
  let wordIndex = 0;
  return (
    <h1 className={className}>
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block">
          {line.map((word, i) => {
            const w = typeof word === "string" ? { text: word } : word;
            const myDelay = wordIndex * delay;
            wordIndex++;
            return (
              <span
                key={`${lineIdx}-${i}`}
                className="inline-block overflow-hidden align-bottom mr-[0.22em] last:mr-0"
                style={{ paddingBottom: "0.1em" }}
              >
                <motion.span
                  className={`inline-block ${w.className || ""}`}
                  initial="hidden"
                  animate="visible"
                  variants={wordVariants}
                  transition={{
                    duration: 0.85,
                    delay: myDelay,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {w.text}
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}
