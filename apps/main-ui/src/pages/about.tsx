import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "wouter";
import {
  Compass,
  Layers,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const VALUES = [
  {
    icon: Compass,
    title: "Practical first",
    desc: "We obsess over working software. Every agent we ship is one a real team can deploy on Monday.",
  },
  {
    icon: Layers,
    title: "Composable systems",
    desc: "We build small, well-typed primitives that fit together — not monolithic black boxes you can't audit.",
  },
  {
    icon: ShieldCheck,
    title: "Trust by default",
    desc: "Isolated vector storage, encryption everywhere, region pinning. Privacy isn't a paid add-on.",
  },
  {
    icon: HeartHandshake,
    title: "Built with our partners",
    desc: "Every feature traces back to a beta partner's real workflow. We ship what teams actually need.",
  },
];

const NUMBERS = [
  { figure: "Agentic AI", label: "Where the studio is focused" },
  { figure: "Hyderabad", label: "Where we build" },
  { figure: "2025", label: "When we started" },
];

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((elem) => {
        gsap.fromTo(
          elem,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: elem,
              start: "top 88%",
              once: true,
            },
          },
        );
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      className="bg-background min-h-screen pt-32 pb-24 font-sans"
      ref={containerRef}
    >
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Headline */}
        <div className="mb-20">
          <h1 className="text-4xl md:text-6xl lg:text-7xl text-foreground font-display font-semibold tracking-tight leading-[1.05] mb-8 reveal-up">
            We build the AI{" "}
            <span className="text-primary">infrastructure</span>
            <br />
            other teams wish they had.
          </h1>
          <p className="text-lg md:text-xl text-foreground/60 max-w-3xl leading-relaxed font-light reveal-up">
            Jaabili Tech Solutions is an Agentic AI studio. We design, build,
            and operate intelligent agent platforms for businesses that want to
            move faster — across sales, support, marketing, and the long tail
            of internal operations.
          </p>
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start mb-24">
          <div className="md:col-span-5 reveal-up">
            <div className="text-xs text-primary uppercase tracking-[0.22em] font-semibold mb-4">
              Our story
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground tracking-tight leading-snug">
              A small studio with a strong opinion about how AI should ship.
            </h2>
          </div>
          <div className="md:col-span-7 space-y-5 text-foreground/70 text-base md:text-lg leading-relaxed reveal-up">
            <p>
              Jaabili Tech Solutions was founded with a simple frustration:
              every business is being told to "use AI", but most of the
              available tools are either generic chatbots bolted onto a SaaS
              dashboard, or expensive consulting engagements that produce a
              slide deck instead of working software.
            </p>
            <p>
              We thought there was a better path — a focused studio that
              treats agents like real engineering: production-ready templates,
              composable building blocks, isolated data, and one runtime that
              speaks every channel a customer actually uses.
            </p>
            <p>
              Today we partner with founders, operators, and enterprise teams
              to design intelligent systems that quietly do the heavy lifting
              behind sales pipelines, support queues, and internal workflows.
            </p>
          </div>
        </div>

        {/* Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground/10 rounded-2xl overflow-hidden mb-24 reveal-up">
          {NUMBERS.map((n, i) => (
            <div
              key={i}
              className="bg-card/40 backdrop-blur-sm p-8 text-center md:text-left"
            >
              <div className="text-2xl md:text-3xl font-display font-semibold text-foreground tracking-tight mb-2">
                {n.figure}
              </div>
              <div className="text-foreground/55 text-sm">{n.label}</div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mb-24">
          <div className="mb-10 reveal-up">
            <div className="text-xs text-primary uppercase tracking-[0.22em] font-semibold mb-3">
              How we work
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground tracking-tight leading-tight">
              Principles we don't compromise on.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {VALUES.map((v, i) => (
              <div
                key={i}
                className="reveal-up rounded-2xl border border-border bg-card/30 backdrop-blur-md p-7 hover:border-border hover:-translate-y-1 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary mb-5">
                  <v.icon className="w-5 h-5" strokeWidth={1.6} />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2 tracking-tight">
                  {v.title}
                </h3>
                <p className="text-foreground/60 leading-relaxed font-light">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Founder note (small, factual, no resume) */}
        <div className="reveal-up rounded-2xl border border-border bg-card/30 backdrop-blur-md p-8 md:p-10 mb-20">
          <div className="text-xs text-foreground/40 uppercase tracking-[0.22em] font-semibold mb-3">
            A note from the founder
          </div>
          <p className="text-lg text-foreground/75 leading-relaxed mb-4 font-light">
            Jaabili is run from Hyderabad, India by a small founding team. We
            care more about whether an agent helps a real business close
            another deal or resolve another ticket than about benchmark scores.
            If that resonates, we'd love to talk.
          </p>
          <p className="text-sm text-foreground/50">
            — Saathvik Kalepu, Founder
          </p>
        </div>

        {/* CTA */}
        <div className="reveal-up flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-card/40 to-accent/10 p-8 md:p-10">
          <div>
            <h3 className="text-2xl md:text-3xl font-display font-semibold text-foreground tracking-tight mb-2">
              Want to work with us?
            </h3>
            <p className="text-foreground/60">
              Whether you're a founder, operator, or partner — we'd love to
              hear what you're trying to automate.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-semibold hover:bg-foreground/90 transition-colors shrink-0"
          >
            Get in touch
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
