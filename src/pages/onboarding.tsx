import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  Code2,
  Briefcase,
  Megaphone,
  Headphones,
  Sparkles,
  Users,
  User as UserIcon,
  Building2,
  Building,
  MessageSquare,
  Globe,
  Mic,
  Mail,
  Hash,
  Search,
  Linkedin,
  PartyPopper,
  Newspaper,
  HelpCircle,
} from "lucide-react";
import logo from "@assets/jaabili_logo_clean.png";
import { useAuth } from "@/lib/auth-context";
import { saveOnboarding } from "@/lib/onboarding";

interface Choice {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  description?: string;
}

const ROLES: Choice[] = [
  { id: "student", label: "Student", icon: GraduationCap, description: "I'm learning or building for a class project." },
  { id: "developer", label: "Developer", icon: Code2, description: "I write code and want to embed agents in apps." },
  { id: "founder", label: "Founder / Owner", icon: Briefcase, description: "I run a company and want to automate operations." },
  { id: "marketer", label: "Marketing", icon: Megaphone, description: "I run growth, content, or social campaigns." },
  { id: "support", label: "Customer Success", icon: Headphones, description: "I handle support tickets and customer ops." },
  { id: "other", label: "Something else", icon: Sparkles, description: "None of these quite fit." },
];

const USE_CASES: Choice[] = [
  { id: "sales", label: "Sales agent", icon: Briefcase, description: "Qualify leads, book meetings, follow up." },
  { id: "support", label: "Customer support", icon: Headphones, description: "Answer L1 tickets and sync to your CRM." },
  { id: "marketing", label: "Marketing automation", icon: Megaphone, description: "Reply to DMs, run campaigns on-brand." },
  { id: "internal", label: "Internal copilot", icon: Sparkles, description: "Automate workflows between your tools." },
  { id: "research", label: "Research / learning", icon: GraduationCap, description: "Just exploring what agents can do." },
  { id: "other", label: "Other", icon: HelpCircle, description: "I'll describe it later." },
];

const TEAM_SIZES: Choice[] = [
  { id: "solo", label: "Just me", icon: UserIcon },
  { id: "small", label: "2 – 10", icon: Users },
  { id: "medium", label: "11 – 50", icon: Building2 },
  { id: "large", label: "50+", icon: Building },
];

const SOURCES: Choice[] = [
  { id: "search", label: "Search engine", icon: Search },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "social", label: "Other social media", icon: Hash },
  { id: "friend", label: "Friend or colleague", icon: PartyPopper },
  { id: "press", label: "Press / blog", icon: Newspaper },
  { id: "other", label: "Other", icon: HelpCircle },
];

const CHANNELS: Choice[] = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { id: "web", label: "Web widget", icon: Globe },
  { id: "voice", label: "Voice", icon: Mic },
  { id: "email", label: "Email", icon: Mail },
  { id: "slack", label: "Slack", icon: Hash },
  { id: "instagram", label: "Instagram DM", icon: MessageSquare },
];

interface StepConfig {
  key: "role" | "useCase" | "teamSize" | "source" | "channels";
  question: string;
  hint: string;
  choices: Choice[];
  multi?: boolean;
}

const STEPS: StepConfig[] = [
  {
    key: "role",
    question: "First, what describes you best?",
    hint: "We'll use this to tune defaults across the dashboard.",
    choices: ROLES,
  },
  {
    key: "useCase",
    question: "What are you here to build?",
    hint: "Pick the closest match — you can always change it later.",
    choices: USE_CASES,
  },
  {
    key: "teamSize",
    question: "How big is your team?",
    hint: "Helps us recommend the right tier and integrations.",
    choices: TEAM_SIZES,
  },
  {
    key: "source",
    question: "Where did you hear about Jaabili?",
    hint: "Genuinely curious — it helps us reach more people like you.",
    choices: SOURCES,
  },
  {
    key: "channels",
    question: "Which channels do you want to deploy on?",
    hint: "Pick all that apply — you can connect them later.",
    choices: CHANNELS,
    multi: true,
  },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({
    role: "",
    useCase: "",
    teamSize: "",
    source: "",
    channels: [] as string[],
  });

  // Redirect unauthenticated users to sign-in
  if (!loading && !user) {
    setLocation("/get-started");
    return null;
  }

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;
  const currentValue = answers[step.key];
  const canContinue = step.multi
    ? Array.isArray(currentValue) && currentValue.length > 0
    : typeof currentValue === "string" && currentValue.length > 0;

  const handleSelect = (id: string) => {
    setAnswers((prev) => {
      if (step.multi) {
        const current = (prev[step.key] as string[]) ?? [];
        const next = current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id];
        return { ...prev, [step.key]: next };
      }
      return { ...prev, [step.key]: id };
    });
  };

  const handleNext = () => {
    if (!canContinue) return;
    if (isLast) {
      saveOnboarding({
        role: answers.role as string,
        useCase: answers.useCase as string,
        teamSize: answers.teamSize as string,
        source: answers.source as string,
        channels: answers.channels as string[],
      });
      setLocation("/dashboard");
      return;
    }
    setStepIdx((s) => s + 1);
  };

  const handleBack = () => {
    if (stepIdx === 0) return;
    setStepIdx((s) => s - 1);
  };

  const progress = ((stepIdx + 1) / STEPS.length) * 100;
  const greeting =
    user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-[100dvh] bg-background text-white font-sans flex flex-col">
      {/* Top bar */}
      <header className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-white/5">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="Jaabili home"
        >
          <img
            src={logo}
            alt="Jaabili Tech Solutions"
            className="h-10 w-auto drop-shadow-[0_0_12px_rgba(20,184,166,0.4)]"
          />
        </Link>
        <div className="text-xs text-white/40 tracking-wide">
          Step {stepIdx + 1} of {STEPS.length}
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Body */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-accent/6 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 w-full max-w-3xl">
          {stepIdx === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center text-white/50 text-sm tracking-wide mb-3"
            >
              Welcome, {greeting} — let's set up your workspace.
            </motion.p>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <h1 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-white text-center mb-3 leading-tight">
                {step.question}
              </h1>
              <p className="text-white/50 text-center mb-10 max-w-xl mx-auto">
                {step.hint}
              </p>

              <div
                className={
                  step.choices.length > 4
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
                    : "grid grid-cols-2 md:grid-cols-4 gap-3"
                }
              >
                {step.choices.map((choice) => {
                  const Icon = choice.icon;
                  const selected = step.multi
                    ? (currentValue as string[]).includes(choice.id)
                    : currentValue === choice.id;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleSelect(choice.id)}
                      className={`group text-left p-5 rounded-2xl border transition-all relative ${
                        selected
                          ? "border-primary/60 bg-primary/10 shadow-[0_0_20px_rgba(20,184,166,0.18)]"
                          : "border-white/10 bg-card/30 hover:border-white/25 hover:bg-card/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            selected
                              ? "bg-primary/20 text-primary"
                              : "bg-white/5 text-white/70"
                          }`}
                        >
                          <Icon className="w-5 h-5" strokeWidth={1.6} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-sm md:text-base">
                            {choice.label}
                          </div>
                          {choice.description && (
                            <div className="text-white/45 text-xs mt-1 leading-relaxed">
                              {choice.description}
                            </div>
                          )}
                        </div>
                        {selected && (
                          <div className="w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Footer actions */}
          <div className="flex items-center justify-between mt-12">
            <button
              type="button"
              onClick={handleBack}
              disabled={stepIdx === 0}
              className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canContinue}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isLast ? "Open my dashboard" : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
