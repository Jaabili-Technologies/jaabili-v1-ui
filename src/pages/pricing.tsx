import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "wouter";
import { Check, Sparkles, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Tier {
  name: string;
  status: "available" | "coming-soon";
  price: string;
  period: string;
  desc: string;
  features: string[];
  cta: { label: string; href: string; mailto?: boolean };
  featured?: boolean;
}

const TIERS_MONTHLY: Tier[] = [
  {
    name: "Free",
    status: "available",
    price: "$0",
    period: "forever",
    desc: "Everything you need to explore the platform end-to-end.",
    features: [
      "1 active agent",
      "500 conversations / month",
      "All starter templates",
      "WhatsApp + web channel",
      "Community support",
    ],
    cta: { label: "Start for free", href: "/get-started" },
    featured: true,
  },
  {
    name: "Basic",
    status: "coming-soon",
    price: "—",
    period: "Coming soon",
    desc: "For solo operators and small projects ready to scale past free limits.",
    features: [
      "Up to 3 active agents",
      "5,000 conversations / month",
      "Knowledge base sync",
      "Email support",
      "Founder pricing for early users",
    ],
    cta: {
      label: "Notify me",
      href: "mailto:jaabilitech@gmail.com?subject=Notify me about Basic plan",
      mailto: true,
    },
  },
  {
    name: "Pro",
    status: "coming-soon",
    price: "—",
    period: "Coming soon",
    desc: "For growing teams running real customer-facing operations.",
    features: [
      "Up to 15 active agents",
      "50,000 conversations / month",
      "Multi-LLM routing",
      "All channels (voice + Slack + email)",
      "Priority support",
    ],
    cta: {
      label: "Notify me",
      href: "mailto:jaabilitech@gmail.com?subject=Notify me about Pro plan",
      mailto: true,
    },
  },
  {
    name: "Enterprise",
    status: "coming-soon",
    price: "Custom",
    period: "Talk to us",
    desc: "Custom deployment, on-prem options, SSO, and a dedicated team.",
    features: [
      "Unlimited agents and conversations",
      "Region pinning (EU / India / US)",
      "SSO + SOC 2 alignment",
      "On-prem / private cloud option",
      "Dedicated solutions engineer",
    ],
    cta: {
      label: "Contact sales",
      href: "mailto:jaabilitech@gmail.com?subject=Enterprise inquiry",
      mailto: true,
    },
  },
];

const FAQ = [
  {
    q: "Is the Free tier really free forever?",
    a: "Yes. One active agent, 500 monthly conversations, every template — no card, no expiry. It's how we want most people to first try Jaabili.",
  },
  {
    q: "When will paid tiers be available?",
    a: "We're rolling out Basic, Pro, and Enterprise as we open the public beta. Early Free-tier users get founder pricing and grandfathered limits.",
  },
  {
    q: "Can I bring my own LLM keys?",
    a: "Yes — every tier supports BYO keys for OpenAI, Anthropic, Gemini, and Mistral. You only pay Jaabili for the platform; model usage is billed by the provider.",
  },
  {
    q: "What counts as a conversation?",
    a: "A continuous back-and-forth thread with one end-user, even if it spans hours. We don't bill per message — that incentivises bad UX.",
  },
];

export default function Pricing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((elem) => {
        gsap.fromTo(
          elem,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
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
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl text-white font-display font-semibold tracking-tight leading-[1.05] mb-5 reveal-up">
            Pricing built for how teams actually grow.
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed font-light reveal-up">
            Start free. Upgrade when you need more agents, more channels, or
            more conversations. No surprise overages, no per-seat games.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 mt-10 p-1 rounded-full border border-white/10 bg-card/40 backdrop-blur-sm reveal-up">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billing === "monthly"
                  ? "bg-white text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billing === "yearly"
                  ? "bg-white text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Yearly
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Tiers grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-24 reveal-up">
          {TIERS_MONTHLY.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-3xl border p-7 flex flex-col bg-card/30 backdrop-blur-md transition-all hover:-translate-y-1 ${
                tier.featured
                  ? "border-primary/40 shadow-[0_0_40px_rgba(20,184,166,0.12)] bg-gradient-to-b from-primary/8 to-card/40"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-black text-[10px] font-bold uppercase tracking-[0.18em]">
                  Available now
                </div>
              )}

              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white/70 font-medium">
                    {tier.name}
                  </span>
                  {tier.status === "coming-soon" && (
                    <span className="text-[10px] uppercase tracking-wider text-white/40 px-1.5 py-0.5 border border-white/10 rounded">
                      Soon
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`font-display font-semibold tracking-tight ${
                      tier.price.length > 3
                        ? "text-3xl text-white"
                        : "text-5xl text-white"
                    }`}
                  >
                    {tier.price}
                  </span>
                  <span className="text-white/40 text-sm">
                    {tier.period && `/ ${tier.period}`}
                  </span>
                </div>
                <p className="text-white/55 text-sm mt-3 leading-relaxed">
                  {tier.desc}
                </p>
              </div>

              <ul className="space-y-2.5 mb-7 flex-1">
                {tier.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-white/75"
                  >
                    <Check
                      className={`w-4 h-4 mt-0.5 shrink-0 ${tier.featured ? "text-primary" : "text-white/45"}`}
                      strokeWidth={2.5}
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {tier.cta.mailto ? (
                <a
                  href={tier.cta.href}
                  className={`w-full text-center py-3 rounded-xl font-medium text-sm transition-colors ${
                    tier.featured
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-white/5 text-white/85 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {tier.cta.label}
                </a>
              ) : (
                <Link href={tier.cta.href}>
                  <button
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                      tier.featured
                        ? "bg-white text-black hover:bg-white/90"
                        : "bg-white/5 text-white/85 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {tier.cta.label}
                  </button>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Fair use note */}
        <div className="reveal-up rounded-2xl border border-white/10 bg-card/20 p-6 mb-20 flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-white font-semibold mb-1">
              Fair-use, not per-seat
            </h4>
            <p className="text-white/55 text-sm leading-relaxed">
              We don't charge per teammate. Pricing scales on agents, channels,
              and monthly conversations — the things that actually map to value.
              Bring your whole team into the workspace at no extra cost.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-white tracking-tight mb-8 text-center reveal-up">
            Pricing questions, answered.
          </h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="reveal-up rounded-2xl border border-white/10 bg-card/30 backdrop-blur-md p-5"
              >
                <h3 className="text-white font-semibold mb-2">{item.q}</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="reveal-up text-center rounded-3xl border border-white/10 bg-gradient-to-r from-primary/10 via-card/40 to-accent/10 p-10 md:p-14">
          <h3 className="text-2xl md:text-3xl font-display font-semibold text-white tracking-tight mb-3">
            Ready to start with the Free tier?
          </h3>
          <p className="text-white/60 mb-7 max-w-xl mx-auto">
            One agent, every template, no card. You can be live on WhatsApp or
            web in under thirty minutes.
          </p>
          <Link
            href="/get-started"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-colors"
          >
            Open the platform
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
