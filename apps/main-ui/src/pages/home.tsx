import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Target,
  Brain,
  ShieldCheck,
  Zap,
  Lock,
  Globe,
  BarChart,
  Mic,
  ArrowRight,
  Sparkles,
  Layers,
  MessagesSquare,
  Rocket,
  Star,
  Quote,
} from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { RollingHeadline } from "@/components/ui/rolling-headline";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

gsap.registerPlugin(ScrollTrigger);

const BASE = import.meta.env.BASE_URL;
const templateSales = BASE + "assets/images/template-sales.png";
const templateSupport = BASE + "assets/images/template-support.png";
const templateMarketing = BASE + "assets/images/template-marketing.png";
const channelsHub = BASE + "assets/images/channels-hub.png";
const dashboardMockup = BASE + "assets/images/dashboard-mockup.png";

const partners = [
  "Aurora Ventures",
  "Helios Labs",
  "Northwind Capital",
  "Starlight Partners",
  "Meridian Tech",
  "Vanguard Systems",
  "Apex Dynamics",
  "Zenith Corp",
];

const templates = [
  {
    title: "Sales Closer",
    tag: "Sales · WhatsApp · Web",
    desc: "Always-on outbound that qualifies and books meetings.",
    image: templateSales,
    accent: "var(--primary)",
  },
  {
    title: "Support Concierge",
    tag: "Support · CRM sync",
    desc: "Resolves L1 tickets instantly with empathy and context.",
    image: templateSupport,
    accent: "var(--secondary)",
  },
  {
    title: "Social Marketer",
    tag: "Marketing · DMs",
    desc: "Engages Instagram and Twitter conversations on-brand.",
    image: templateMarketing,
    accent: "var(--accent)",
  },
  {
    title: "Lead Router",
    tag: "Operations · Routing",
    desc: "Scores and routes leads to the right rep in real time.",
    image: channelsHub,
    accent: "var(--primary)",
  },
  {
    title: "Workflow Copilot",
    tag: "Internal · Automations",
    desc: "Automates the manual work between your tools.",
    image: dashboardMockup,
    accent: "var(--secondary)",
  },
];

const flashCards = [
  { title: "AI Sales Agent", desc: "Always-on outbound & inbound.", icon: Target, color: "var(--primary)" },
  { title: "Customer Support", desc: "Instant empathic resolution.", icon: MessageSquare, color: "var(--secondary)" },
  { title: "Lead Qualification", desc: "Automated scoring & routing.", icon: Zap, color: "var(--accent)" },
  { title: "Multi-LLM Router", desc: "GPT, Claude, or Gemini.", icon: Brain, color: "var(--primary)" },
  { title: "Security Cloud", desc: "Enterprise-grade encryption.", icon: ShieldCheck, color: "var(--secondary)" },
  { title: "WhatsApp Integration", desc: "Native messaging APIs.", icon: Globe, color: "var(--accent)" },
  { title: "Knowledge Base", desc: "Isolated vector databases.", icon: Lock, color: "var(--primary)" },
  { title: "Analytics", desc: "Deep conversation insights.", icon: BarChart, color: "var(--secondary)" },
  { title: "Voice Channel", desc: "Real-time voice synthesis.", icon: Mic, color: "var(--accent)" },
];

const purposeCards = [
  {
    title: "Turn scattered service work into one operating layer",
    desc: "Jaabili connects the places where work starts - chat, web, voice, CRM, documents - and gives each service a clear agentic owner.",
    icon: Layers,
    accent: "var(--primary)",
    stat: "01",
  },
  {
    title: "Let each agent own a real business outcome",
    desc: "Sales agents qualify, support agents resolve, onboarding agents collect context, and internal agents move work across your tools.",
    icon: Target,
    accent: "var(--secondary)",
    stat: "02",
  },
  {
    title: "Keep control while the system gets faster",
    desc: "Human approval, audit trails, secure memory, and model routing keep automation useful without turning your operations into a black box.",
    icon: ShieldCheck,
    accent: "var(--accent)",
    stat: "03",
  },
];

const bentoItems = [
  {
    title: "Sales Agents",
    desc: "Closers that work every channel — WhatsApp, web, and voice — qualifying leads while you sleep.",
    icon: Target,
    accent: "var(--primary)",
    span: "md:col-span-2 md:row-span-2",
    big: true,
  },
  {
    title: "Customer Support",
    desc: "Empathic L1 resolution synced to your CRM.",
    icon: MessagesSquare,
    accent: "var(--secondary)",
    span: "md:col-span-1",
  },
  {
    title: "Multi-LLM Routing",
    desc: "Right model, right task — GPT, Claude, Gemini.",
    icon: Brain,
    accent: "var(--accent)",
    span: "md:col-span-1",
  },
  {
    title: "Security Cloud",
    desc: "Enterprise encryption with isolated vector stores.",
    icon: ShieldCheck,
    accent: "var(--primary)",
    span: "md:col-span-2",
  },
  {
    title: "Voice Channel",
    desc: "Real-time voice synthesis on your line.",
    icon: Mic,
    accent: "var(--accent)",
    span: "md:col-span-1",
  },
  {
    title: "Workflow Copilot",
    desc: "Wire it to Notion, Sheets, Slack, anywhere.",
    icon: Layers,
    accent: "var(--secondary)",
    span: "md:col-span-1",
  },
];

const howSteps = [
  {
    n: "01",
    icon: Sparkles,
    title: "Map the work",
    desc: "We identify where service work enters, who owns it, and which handoffs are slow enough to deserve an agent.",
    accent: "var(--primary)",
  },
  {
    n: "02",
    icon: MessagesSquare,
    title: "Customize in chat",
    desc: "Describe how it should behave. The studio shapes the system prompt, knowledge base, and tools as you talk.",
    accent: "var(--secondary)",
  },
  {
    n: "03",
    icon: Rocket,
    title: "Deploy everywhere",
    desc: "One click to ship to WhatsApp, web widget, voice, or your CRM — with analytics from minute one.",
    accent: "var(--accent)",
  },
];

const reviews = [
  {
    q: "How long does it take to launch our first agent?",
    a: "Most teams have a working agent in under 30 minutes — pick a template, paste your knowledge base, and connect a channel. Our beta partners ship to production the same day.",
    by: "Priya M.",
    role: "Head of CX, Aurora Retail",
  },
  {
    q: "Do you handle compliance and data isolation for us?",
    a: "Yes. Every workspace runs on isolated vector storage with end-to-end encryption. We're SOC 2-aligned and provide region pinning for EU and India deployments out of the box.",
    by: "Rohit S.",
    role: "VP Engineering, Meridian Tech",
  },
  {
    q: "Can the agents talk to our existing tools?",
    a: "The Workflow Copilot ships with first-party connectors for Notion, Sheets, Slack, HubSpot, Salesforce, and a webhook bridge for anything else. You can also expose your own internal APIs as tools.",
    by: "Lina T.",
    role: "Operations Lead, Helios Labs",
  },
  {
    q: "What does pricing look like once we scale past the free tier?",
    a: "Start free with one agent and a small monthly conversation budget. Paid tiers price on conversations and channels — we'll publish Basic, Pro, and Enterprise rates as we open the public beta.",
    by: "Daniel K.",
    role: "Founder, Northwind Capital",
  },
  {
    q: "Which models can the platform route between?",
    a: "Today: OpenAI GPT-5/4, Anthropic Claude, Google Gemini, and Mistral. The router picks per-turn based on task complexity, latency budget, and cost ceiling — you can also pin a model per skill.",
    by: "Anika R.",
    role: "ML Lead, Vanguard Systems",
  },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Marquee
      if (marqueeRef.current) {
        gsap.to(".marquee-inner", {
          xPercent: -50,
          ease: "none",
          duration: 35,
          repeat: -1,
        });
      }

      // Reveal-up (no blur, only-once)
      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((elem) => {
        gsap.fromTo(
          elem,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: elem,
              start: "top 88%",
              toggleActions: "play none none none",
              once: true,
            },
          },
        );
      });

      // Flash cards staggered grid
      gsap.fromTo(
        ".flash-card-item",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".flash-cards-grid",
            start: "top 85%",
            once: true,
          },
        },
      );

      // Bento staggered
      gsap.fromTo(
        ".bento-item",
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".bento-grid",
            start: "top 85%",
            once: true,
          },
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <div
      className="bg-background min-h-screen font-sans overflow-x-clip"
      ref={containerRef}
    >
      {/* HERO — clean, minimal background */}
      <section
        ref={heroRef}
        className="relative pt-36 pb-16 md:pb-24 flex flex-col items-center"
      >
        {/* Subtle background only — radial spotlight, no busy imagery */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.10),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(139,92,246,0.06),transparent_60%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="container px-6 relative z-10 max-w-5xl text-center flex flex-col items-center">
          <RollingHeadline
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-semibold text-white tracking-tight leading-[1.08] mb-7 font-display"
            lines={[
              [
                { text: "Build" },
                { text: "agents" },
                { text: "that" },
                { text: "think,", className: "text-primary" },
              ],
              [
                { text: "act,", className: "text-secondary" },
                { text: "and" },
                { text: "grow.", className: "text-accent" },
              ],
            ]}
          />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
            className="text-white/60 text-base md:text-xl max-w-2xl mb-10 font-light leading-relaxed"
          >
            The unified intelligence layer for your operations. Build each
            service as a focused agent, then connect them into one calm system
            across WhatsApp, web, voice, CRM, and internal tools.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link href="/get-started">
              <button className="px-7 py-3.5 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.12)]">
                Open the Platform
              </button>
            </Link>
            <Link href="/agents">
              <button className="px-7 py-3.5 bg-white/5 text-white border border-white/10 rounded-full font-medium hover:bg-white/10 transition-colors backdrop-blur-sm">
                Watch the demo
              </button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.05 }}
            className="mt-5 text-xs text-white/35 tracking-wide"
          >
            No credit card · 14-day trial · Cancel anytime
          </motion.p>
        </div>
      </section>

      {/* PURPOSE */}
      <section className="relative pt-6 pb-32">
        <div className="container px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-end mb-10 reveal-up">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-primary mb-5">
                <Sparkles className="h-3.5 w-3.5" />
                Purpose
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl text-white font-display font-semibold tracking-tight leading-tight">
                Not another dashboard. A working layer for every service.
              </h2>
            </div>
            <p className="text-white/55 text-base md:text-lg leading-relaxed max-w-2xl lg:justify-self-end">
              Jaabili is meant to split your business into capable agent
              applications without losing the benefit of one connected platform.
              Each agent has a job, memory, tools, guardrails, and a measurable
              outcome.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {purposeCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: "easeOut" }}
                className="group relative min-h-[300px] overflow-hidden rounded-2xl border border-white/10 bg-card/35 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
              >
                <div
                  className="absolute -right-16 -top-16 h-44 w-44 rounded-full blur-[70px] opacity-25 transition-opacity duration-500 group-hover:opacity-40"
                  style={{ backgroundColor: card.accent }}
                />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-8 flex items-center justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]"
                      style={{ color: card.accent }}
                    >
                      <card.icon className="h-5 w-5" strokeWidth={1.6} />
                    </div>
                    <span
                      className="font-mono text-sm font-semibold"
                      style={{ color: card.accent }}
                    >
                      {card.stat}
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-semibold tracking-tight text-white leading-tight">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-sm md:text-base leading-relaxed text-white/55">
                    {card.desc}
                  </p>
                  <div className="mt-auto pt-8">
                    <div className="h-px w-full bg-gradient-to-r from-white/15 via-white/5 to-transparent" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div
        ref={marqueeRef}
        className="bg-white/[0.02] border-y border-white/5 py-6 overflow-hidden flex whitespace-nowrap"
      >
        <div className="marquee-inner flex gap-14 items-center text-white/30 font-serif italic text-xl">
          {Array(4).fill(partners).flat().map((partner, i) => (
            <span
              key={i}
              className="hover:text-white/70 transition-colors cursor-default"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>

      {/* FLASH CARDS GRID */}
      <section className="py-32 relative">
        <div className="container px-6 relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal-up">
            <h2 className="text-3xl md:text-5xl text-white font-display font-semibold tracking-tight mb-4 leading-tight">
              A complete agent ecosystem
            </h2>
            <p className="text-white/55 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
              Everything you need to automate operations, embedded natively
              into your existing channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flash-cards-grid">
            {flashCards.map((card, i) => (
              <div
                key={i}
                className="flash-card-item group relative bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-2xl overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{
                    backgroundColor: card.color,
                    boxShadow: `0 0 10px ${card.color}`,
                  }}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at top right, ${card.color}, transparent 70%)`,
                  }}
                />
                <div className="relative z-10 flex flex-col h-full">
                  <div
                    className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300"
                    style={{ color: card.color }}
                  >
                    <card.icon strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed font-light">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPLIT — ONE PLATFORM */}
      <section className="py-20 relative border-y border-white/5 bg-black/20">
        <div className="container px-6 relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal-up order-2 lg:order-1">
              <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-white mb-6 leading-tight">
                One platform. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                  Every channel.
                </span>
              </h2>
              <p className="text-white/60 text-xl font-light leading-relaxed mb-8">
                Unify your customer interactions across WhatsApp, web, and
                voice. Our intelligent routing dynamically delegates tasks to
                the optimal LLM while keeping your data isolated and secure.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "Omnichannel memory sync",
                  "Dynamic model selection (GPT, Claude)",
                  "Isolated vector storage",
                  "End-to-end encryption",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/agents">
                <MagneticButton variant="outline">
                  Explore Architecture
                </MagneticButton>
              </Link>
            </div>

            <div className="reveal-up order-1 lg:order-2 relative">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(20,184,166,0.15)] aspect-square">
                <img
                  src={
                    import.meta.env.BASE_URL +
                    "assets/images/channels-hub.png"
                  }
                  alt="Channels converging into a single AI hub"
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-1000"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE BUILD — BENTO GRID */}
      <section className="py-32 relative border-b border-white/5">
        <div className="container px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 reveal-up">
            <div>
              <h2 className="text-3xl md:text-5xl text-white font-display font-semibold tracking-tight leading-tight">
                What we build, end to end.
              </h2>
            </div>
            <p className="text-white/50 max-w-md font-light leading-relaxed">
              Six building blocks. One unified runtime. Compose the agents your
              business actually needs — without stitching tools together.
            </p>
          </div>

          <div className="bento-grid grid grid-cols-1 md:grid-cols-4 auto-rows-[180px] gap-4">
            {bentoItems.map((item, i) => (
              <div
                key={i}
                className={`bento-item group relative rounded-3xl border border-white/8 bg-card/30 backdrop-blur-md overflow-hidden p-6 md:p-8 flex flex-col justify-between hover:border-white/20 hover:-translate-y-1 transition-all duration-500 ${item.span}`}
              >
                <div
                  className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[60px] opacity-25 group-hover:opacity-40 transition-opacity"
                  style={{ backgroundColor: item.accent }}
                />
                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-60"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)`,
                  }}
                />
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 relative z-10"
                  style={{ color: item.accent }}
                >
                  <item.icon strokeWidth={1.5} className="w-5 h-5" />
                </div>
                <div className="relative z-10">
                  <h3
                    className={`font-display font-semibold text-white mb-2 tracking-tight ${item.big ? "text-3xl md:text-4xl" : "text-xl"}`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-white/55 leading-relaxed font-light ${item.big ? "text-base md:text-lg max-w-md" : "text-sm"}`}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — replaces stats */}
      <section className="py-32 relative border-b border-white/5">
        <div className="container px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal-up">
            <h2 className="text-3xl md:text-5xl text-white font-display font-semibold tracking-tight leading-tight">
              From idea to live agent in three moves.
            </h2>
          </div>

          <div className="relative">
            {/* connecting line */}
            <div className="hidden md:block absolute top-[58px] left-[12%] right-[12%] h-px bg-gradient-to-r from-primary/40 via-secondary/40 to-accent/40" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 relative">
              {howSteps.map((step, i) => (
                <div
                  key={i}
                  className="reveal-up flex flex-col items-center text-center relative"
                >
                  <div className="relative mb-6">
                    <div
                      className="absolute inset-0 rounded-full blur-2xl opacity-40"
                      style={{ backgroundColor: step.accent }}
                    />
                    <div
                      className="relative w-28 h-28 rounded-full flex items-center justify-center border bg-card/40 backdrop-blur-md"
                      style={{ borderColor: `${step.accent}40` }}
                    >
                      <step.icon
                        className="w-9 h-9"
                        strokeWidth={1.5}
                        style={{ color: step.accent }}
                      />
                    </div>
                    <div
                      className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-background border flex items-center justify-center text-xs font-bold tracking-wider"
                      style={{ borderColor: `${step.accent}60`, color: step.accent }}
                    >
                      {step.n}
                    </div>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-white/55 leading-relaxed font-light max-w-xs">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL — keep one polished quote */}
      <section className="py-32 relative">
        <div className="container px-6 relative z-10 max-w-4xl mx-auto reveal-up">
          <div className="glass-panel p-12 md:p-16 rounded-[2.5rem] relative overflow-hidden text-center border-white/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-50" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
            <Quote className="w-10 h-10 text-white/15 mx-auto mb-8" strokeWidth={1.5} />
            <h3 className="text-2xl md:text-4xl font-serif italic text-white leading-relaxed mb-8">
              "We don't just build chatbots. We build cognitive systems that
              understand your business logic and execute it flawlessly across
              every medium."
            </h3>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-serif text-xl border border-white/20">
                SK
              </div>
              <div className="text-left">
                <div className="text-white font-medium">Saathvik Kalepu</div>
                <div className="text-white/50 text-sm">Founder, Jaabili</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — user questions answered */}
      <section className="py-32 relative bg-black/20 border-y border-white/5">
        <div className="container px-6 max-w-5xl mx-auto">
          <div className="text-center mb-14 reveal-up">
            <h2 className="text-3xl md:text-5xl text-white font-display font-semibold tracking-tight mb-4 leading-tight">
              Questions our beta partners asked.
            </h2>
            <p className="text-white/55 text-lg font-light max-w-2xl mx-auto leading-relaxed">
              These are the things teams actually wanted to know before
              shipping. Real questions, real answers.
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="space-y-3 reveal-up"
            defaultValue="q-0"
          >
            {reviews.map((r, i) => (
              <AccordionItem
                key={i}
                value={`q-${i}`}
                className="border border-white/10 bg-card/30 backdrop-blur-md rounded-2xl overflow-hidden data-[state=open]:border-white/20 data-[state=open]:bg-card/50 transition-colors"
              >
                <AccordionTrigger className="px-6 py-5 text-left hover:no-underline group">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-xs font-semibold">
                      {r.by
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-sm">
                          {r.by}
                        </span>
                        <span className="text-white/40 text-xs">
                          · {r.role}
                        </span>
                        <div className="flex items-center gap-0.5 ml-auto md:ml-2">
                          {[...Array(5)].map((_, k) => (
                            <Star
                              key={k}
                              className="w-3 h-3 fill-secondary text-secondary"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-base md:text-lg font-medium text-white/90 leading-snug group-hover:text-white transition-colors">
                        {r.q}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="ml-13 pl-13 border-l border-white/10">
                    <div className="ml-4 flex gap-3">
                      <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-primary via-secondary to-accent p-[1.5px]">
                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-[10px] font-bold tracking-wider text-white">
                          JB
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-white/40 mb-1.5 font-medium">
                          Jaabili Studio
                        </div>
                        <p className="text-white/75 text-base leading-relaxed font-light">
                          {r.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-12 reveal-up">
            <p className="text-white/50 text-sm mb-4">
              Have a question we haven't answered?
            </p>
            <a
              href="mailto:jaabilitech@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/85 text-sm font-medium"
            >
              <MessageSquare className="w-4 h-4 text-primary" />
              Talk to our team
            </a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 bg-gradient-to-b from-transparent to-primary/10 text-center relative overflow-hidden">
        <div className="container px-6 relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl mb-6 text-white font-display font-semibold tracking-tight leading-tight reveal-up">
            Ready to automate?
          </h2>
          <p className="text-lg md:text-xl text-white/60 mb-10 reveal-up max-w-2xl leading-relaxed font-light">
            Step into the future. Let us build the intelligent systems that
            drive your autonomous growth.
          </p>
          <div className="reveal-up flex flex-col sm:flex-row gap-3">
            <Link href="/get-started">
              <button className="px-8 py-3.5 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] hover:scale-[1.02]">
                Start building today
              </button>
            </Link>
            <Link href="/pricing">
              <button className="px-8 py-3.5 bg-white/5 text-white border border-white/10 rounded-full font-medium hover:bg-white/10 transition-colors">
                See pricing
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

interface Template {
  title: string;
  tag: string;
  desc: string;
  image: string;
  accent: string;
}

function TemplateCard({
  tpl,
  index,
  wide,
}: {
  tpl: Template;
  index: number;
  wide?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="group relative rounded-2xl overflow-hidden border border-white/10 bg-card/30 backdrop-blur-md cursor-pointer"
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{
          backgroundColor: tpl.accent,
          boxShadow: `0 0 10px ${tpl.accent}`,
        }}
      />
      <div
        className={`relative w-full ${wide ? "aspect-[16/8]" : "aspect-[16/10]"} overflow-hidden bg-black/40`}
      >
        <img
          src={tpl.image}
          alt={tpl.title}
          loading="lazy"
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        <div className="absolute top-3 left-3">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md border border-white/15"
            style={{
              color: tpl.accent,
              backgroundColor: "rgba(0,0,0,0.45)",
            }}
          >
            {tpl.tag}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-display font-semibold text-white tracking-tight group-hover:text-primary transition-colors">
            {tpl.title}
          </h3>
          <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
        </div>
        <p className="text-sm text-white/55 leading-relaxed mb-4">
          {tpl.desc}
        </p>
        <Link
          href="/get-started"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white transition-colors"
        >
          <span>Use template</span>
          <span className="text-white/40 group-hover:text-white transition-colors">
            ·
          </span>
          <span className="text-white/60 group-hover:text-white transition-colors">
            Customize
          </span>
        </Link>
      </div>
    </motion.div>
  );
}
