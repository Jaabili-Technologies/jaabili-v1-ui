import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface AuthVisualPanelProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: string[];
  accent: "teal" | "violet";
}

const orbAccents: Record<AuthVisualPanelProps["accent"], { a: string; b: string; c: string }> = {
  teal: { a: "rgba(20,184,166,0.4)", b: "rgba(56,189,248,0.28)", c: "rgba(139,92,246,0.22)" },
  violet: { a: "rgba(139,92,246,0.4)", b: "rgba(20,184,166,0.26)", c: "rgba(236,72,153,0.18)" },
};

export function AuthVisualPanel({ eyebrow, title, subtitle, items, accent }: AuthVisualPanelProps) {
  const colors = orbAccents[accent];

  return (
    <section className="relative hidden overflow-hidden border-r border-border bg-background lg:flex lg:flex-col lg:justify-between lg:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(120,120,140,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(120,120,140,0.08)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_0%,#000_60%,transparent_100%)]" />

      <motion.div
        className="pointer-events-none absolute -left-24 top-[-10%] h-[420px] w-[420px] rounded-full blur-[110px]"
        style={{ background: colors.a }}
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute right-[-15%] top-1/3 h-[380px] w-[380px] rounded-full blur-[120px]"
        style={{ background: colors.b }}
        animate={{ y: [0, -25, 0], x: [0, -15, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-[-15%] left-1/4 h-[340px] w-[340px] rounded-full blur-[110px]"
        style={{ background: colors.c }}
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col items-start">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-foreground/55 transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mb-9 inline-flex items-center gap-2.5 rounded-full border border-border bg-foreground/[0.04] px-3.5 py-1.5 backdrop-blur">
          <img src="/peacock-mark.png" alt="" className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/60">
            {eyebrow}
          </span>
        </div>

        <h1 className="max-w-lg text-[2.6rem] font-semibold leading-[1.08] tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-6 max-w-md text-base leading-7 text-foreground/55">{subtitle}</p>
      </div>

      <div className="relative z-10 space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + index * 0.08, duration: 0.5 }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-foreground/[0.03] px-4 py-3 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-teal-400 to-violet-400" />
            <span className="text-sm font-medium text-foreground/75">{item}</span>
          </motion.div>
        ))}
        <p className="pt-3 text-xs text-foreground/35">© {new Date().getFullYear()} Jaabili Tech Solutions.</p>
      </div>
    </section>
  );
}
