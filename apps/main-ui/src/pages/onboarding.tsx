import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Briefcase,
  Building2,
  Check,
  Code2,
  Globe2,
  GraduationCap,
  Headphones,
  HelpCircle,
  Mail,
  Megaphone,
  MessageSquare,
  Search,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import logo from "@assets/jaabili_logo_clean.png";
import { useAuth } from "@/lib/auth-context";
import { saveOnboarding } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

interface Choice {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  description?: string;
  plan?: "starter" | "growth" | "scale";
}

interface StepConfig {
  key: "role" | "useCase" | "plan" | "agents" | "channels";
  title: string;
  hint: string;
  choices: Choice[];
  multi?: boolean;
}

const ROLES: Choice[] = [
  { id: "founder", label: "Founder / Owner", icon: Briefcase, description: "I run the business and want agents to handle customer work." },
  { id: "marketing", label: "Marketing", icon: Megaphone, description: "I manage growth, campaigns, content, or inbound leads." },
  { id: "sales", label: "Sales", icon: Users, description: "I handle inquiries, qualification, follow-up, and handoff." },
  { id: "support", label: "Support", icon: Headphones, description: "I manage customer questions, issues, and service requests." },
  { id: "developer", label: "Developer", icon: Code2, description: "I will connect agents to tools, data, or websites." },
  { id: "student", label: "Student", icon: GraduationCap, description: "I am learning or testing agent workflows." },
];

const USE_CASES: Choice[] = [
  { id: "sales", label: "Sales agents", icon: Briefcase, description: "Qualify visitors, capture leads, and route hot prospects." },
  { id: "whatsapp", label: "WhatsApp agents", icon: MessageSquare, description: "Continue customer conversations on WhatsApp." },
  { id: "support", label: "Support agents", icon: Headphones, description: "Answer FAQs and escalate unresolved issues." },
  { id: "follow-up", label: "Follow-up agents", icon: Workflow, description: "Nurture warm leads and remind the team." },
  { id: "ops", label: "Ops agents", icon: Bot, description: "Summarize activity and surface business gaps." },
  { id: "custom", label: "Custom setup", icon: Sparkles, description: "I want Jaabili to recommend the right agent stack." },
];

const PLANS: Choice[] = [
  { id: "starter", label: "Starter", icon: Bot, description: "1 active agent for first deployment.", plan: "starter" },
  { id: "growth", label: "Growth", icon: Sparkles, description: "3 agents for sales, WhatsApp, and follow-up.", plan: "growth" },
  { id: "scale", label: "Scale", icon: Building2, description: "5 agents for sales, support, follow-up, and ops.", plan: "scale" },
];

const CHANNELS: Choice[] = [
  { id: "web", label: "Website", icon: Globe2 },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { id: "email", label: "Email", icon: Mail },
  { id: "search", label: "Search traffic", icon: Search },
];

const AGENT_CHOICES: Choice[] = [
  {
    id: "website-sales",
    label: "Website Sales Agent",
    icon: Briefcase,
    description: "Qualifies website visitors, captures leads, and routes hot buyers.",
  },
  {
    id: "whatsapp-capture",
    label: "WhatsApp Sales Agent",
    icon: MessageSquare,
    description: "Continues conversations and replies to sales inquiries on WhatsApp.",
  },
  {
    id: "follow-up",
    label: "Lead Follow-Up Agent",
    icon: Workflow,
    description: "Nurtures warm leads and reminds the team before buyers go cold.",
  },
  {
    id: "support",
    label: "Customer Support Agent",
    icon: Headphones,
    description: "Answers FAQs and escalates unresolved customer issues.",
  },
  {
    id: "ops-summary",
    label: "Operations Summary Agent",
    icon: Bot,
    description: "Summarizes daily activity, source gaps, and agent performance.",
  },
];

const AGENTS_BY_PLAN: Record<string, string[]> = {
  starter: ["website-sales"],
  growth: ["website-sales", "whatsapp-capture", "follow-up"],
  scale: ["website-sales", "whatsapp-capture", "follow-up", "support", "ops-summary"],
};

const STEPS: StepConfig[] = [
  { key: "role", title: "What best describes you?", hint: "This keeps the workspace defaults relevant.", choices: ROLES },
  { key: "useCase", title: "Which agent outcome matters first?", hint: "Company details come later inside the dashboard.", choices: USE_CASES },
  { key: "plan", title: "Select the agent stack for this workspace.", hint: "The plan controls how many agents are available.", choices: PLANS },
  { key: "channels", title: "Where should these agents work?", hint: "You can connect the actual accounts after setup.", choices: CHANNELS, multi: true },
  { key: "agents", title: "Select the agents for this plan.", hint: "Only agents included in the selected plan are available now.", choices: AGENT_CHOICES, multi: true },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({
    role: "",
    useCase: "",
    plan: "growth",
    agents: ["website-sales", "whatsapp-capture", "follow-up"],
    channels: ["web"],
  });

  if (!loading && !user) {
    setLocation("/get-started");
    return null;
  }

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;
  const progress = ((stepIdx + 1) / STEPS.length) * 100;
  const currentValue = answers[step.key];
  const selectedPlan = String(answers.plan || "growth");
  const enabledAgents = AGENTS_BY_PLAN[selectedPlan] ?? AGENTS_BY_PLAN.growth;
  const stepChoices =
    step.key === "agents"
      ? AGENT_CHOICES.filter((choice) => enabledAgents.includes(choice.id))
      : step.choices;
  const greeting = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const canContinue = useMemo(() => {
    if (step.multi) {
      return Array.isArray(currentValue) && currentValue.length > 0;
    }
    return typeof currentValue === "string" && currentValue.length > 0;
  }, [currentValue, step.multi]);

  const selectChoice = (id: string) => {
    setAnswers((prev) => {
      if (step.multi) {
        const current = Array.isArray(prev[step.key]) ? (prev[step.key] as string[]) : [];
        return {
          ...prev,
          [step.key]: current.includes(id)
            ? current.filter((item) => item !== id)
            : [...current, id],
        };
      }
      if (step.key === "plan") {
        return {
          ...prev,
          plan: id,
          agents: AGENTS_BY_PLAN[id] ?? AGENTS_BY_PLAN.growth,
        };
      }
      return { ...prev, [step.key]: id };
    });
  };

  const next = () => {
    if (!canContinue) return;
    if (isLast) {
      saveOnboarding({
        role: String(answers.role),
        useCase: String(answers.useCase),
        teamSize: selectedPlan === "starter" ? "small" : selectedPlan === "growth" ? "medium" : "large",
        source: "onboarding",
        channels: Array.isArray(answers.channels) ? answers.channels : [],
        plan: selectedPlan,
        selectedAgents: Array.isArray(answers.agents)
          ? answers.agents.filter((agent) => enabledAgents.includes(agent))
          : enabledAgents,
      });
      setLocation("/dashboard");
      return;
    }
    setStepIdx((value) => value + 1);
  };

  return (
    <div className="min-h-[100dvh] bg-[#090a0d] text-white font-sans">
      <header className="flex h-16 items-center justify-between border-b border-white/8 bg-[#121212] px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <img src={logo} alt="Jaabili" className="h-9 w-auto" />
          <span className="text-sm font-semibold">Jaabili Setup</span>
        </Link>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">
          Step {stepIdx + 1} of {STEPS.length}
        </span>
      </header>

      <div className="h-1 bg-white/6">
        <motion.div
          className="h-full bg-gradient-to-r from-[#ffb84d] via-[#22d3ee] to-[#8b5cf6]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>

      <main className="mx-auto flex min-h-[calc(100dvh-68px)] w-full max-w-6xl flex-col px-4 py-8 sm:px-6">
        <div className="mx-auto w-full max-w-3xl flex-1">
          {stepIdx === 0 && (
            <p className="mb-3 text-center text-sm text-white/45">Welcome, {greeting}.</p>
          )}

          <AnimatePresence mode="wait">
            <motion.section
              key={step.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <h1 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
                {step.title}
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-6 text-white/50">
                {step.hint}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {stepChoices.map((choice) => {
                  const Icon = choice.icon;
                  const selected = step.multi
                    ? Array.isArray(currentValue) && currentValue.includes(choice.id)
                    : currentValue === choice.id;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => selectChoice(choice.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition",
                        selected
                          ? "border-[#67e8f9]/45 bg-[#10272c]"
                          : "border-white/10 bg-white/[0.035] hover:border-white/20",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/6 text-[#67e8f9]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-white">{choice.label}</span>
                          {choice.description && (
                            <span className="mt-1 block text-xs leading-5 text-white/48">
                              {choice.description}
                            </span>
                          )}
                        </span>
                        {selected && (
                          <span className="rounded-full bg-[#67e8f9] p-1 text-black">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.section>
          </AnimatePresence>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-4 w-4 text-[#ffcf7a]" />
              <p className="text-sm text-white/65">
                After onboarding, the dashboard collects company details, sources, policies,
                pricing, and routing rules before each agent starts working.
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 mx-auto mt-8 flex w-full max-w-3xl items-center justify-between border-t border-white/8 bg-[#090a0d]/95 py-4 backdrop-blur">
          <button
            type="button"
            onClick={() => setStepIdx((value) => Math.max(0, value - 1))}
            disabled={stepIdx === 0}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white/55 hover:bg-white/6 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!canContinue}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90 disabled:pointer-events-none disabled:opacity-40"
          >
            {isLast ? "Open dashboard" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
