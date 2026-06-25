import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  FileText,
  Globe2,
  GraduationCap,
  Headphones,
  HeartHandshake,
  Landmark,
  MessageSquare,
  Plane,
  Search,
  Sparkles,
  Users,
  Workflow,
  PenLine,
  ChevronDown,
  Rocket,
} from "lucide-react";
import logo from "@assets/jaabili_logo_clean.png";
import { useAuth } from "@/lib/auth-context";
import { createPineLabsCheckout, extractCheckoutUrl } from "@/lib/billing-api";
import { saveOnboarding } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

type WorkspaceType = "business" | "personal" | "team";
type ExperienceLevel = "beginner" | "intermediate" | "advanced";

const workspaceTypes = [
  {
    id: "business",
    label: "Business",
    icon: Building2,
    body: "Leads, support, WhatsApp, and operations.",
  },
  {
    id: "personal",
    label: "Personal",
    icon: Users,
    body: "Learning, research, writing, and daily work.",
  },
  {
    id: "team",
    label: "Team / Organization",
    icon: HeartHandshake,
    body: "Internal knowledge, projects, docs, and support.",
  },
] satisfies Array<{
  id: WorkspaceType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  body: string;
}>;

const businessIndustries = [
  "Real Estate",
  "Healthcare",
  "Education",
  "Interior Design",
  "Restaurant",
  "E-commerce",
  "Travel",
  "Consulting",
  "Other",
];

const goalCatalog = {
  business: [
    { id: "leads", label: "Capture More Leads", icon: Briefcase, agents: ["website-sales"] },
    { id: "support", label: "Customer Support", icon: Headphones, agents: ["support"] },
    { id: "whatsapp", label: "Automate WhatsApp", icon: MessageSquare, agents: ["whatsapp-capture"] },
    { id: "follow-up", label: "Lead Follow-Up", icon: Workflow, agents: ["follow-up"] },
    { id: "reports", label: "Daily Business Reports", icon: BarChart3, agents: ["ops-summary"] },
  ],
  personal: [
    { id: "learning", label: "Learning", icon: GraduationCap, agents: ["study"] },
    { id: "research", label: "Research", icon: Search, agents: ["research"] },
    { id: "writing", label: "Writing", icon: PenLine, agents: ["writing"] },
    { id: "productivity", label: "Productivity", icon: ClipboardList, agents: ["productivity"] },
    { id: "travel", label: "Travel", icon: Plane, agents: ["travel"] },
    { id: "finance", label: "Finance", icon: Landmark, agents: ["finance"] },
    { id: "custom", label: "Custom", icon: Sparkles, agents: ["personal-assistant"] },
  ],
  team: [
    { id: "knowledge", label: "Knowledge Base", icon: BookOpen, agents: ["knowledge"] },
    { id: "projects", label: "Project Management", icon: Workflow, agents: ["project-assistant"] },
    { id: "internal-support", label: "Internal Support", icon: Headphones, agents: ["hr"] },
    { id: "documentation", label: "Documentation", icon: FileText, agents: ["documentation"] },
    { id: "meetings", label: "Meetings", icon: Users, agents: ["meeting"] },
    { id: "custom", label: "Custom", icon: Sparkles, agents: ["knowledge"] },
  ],
};

const agentCatalog = {
  "website-sales": {
    name: "Sales Agent",
    purpose: "Capture and qualify website visitors",
    icon: Briefcase,
  },
  "whatsapp-capture": {
    name: "WhatsApp Agent",
    purpose: "Answer customer inquiries and continue conversations",
    icon: MessageSquare,
  },
  support: {
    name: "Support Agent",
    purpose: "Resolve customer questions and escalate sensitive cases",
    icon: Headphones,
  },
  "follow-up": {
    name: "Follow-Up Agent",
    purpose: "Convert warm leads automatically",
    icon: Workflow,
  },
  "ops-summary": {
    name: "Operations Agent",
    purpose: "Send daily reports and improvement recommendations",
    icon: BarChart3,
  },
  study: {
    name: "Study Agent",
    purpose: "Plan learning, explain topics, and track progress",
    icon: GraduationCap,
  },
  research: {
    name: "Research Agent",
    purpose: "Collect, compare, and summarize research",
    icon: Search,
  },
  writing: {
    name: "Writing Agent",
    purpose: "Draft, rewrite, and polish content",
    icon: PenLine,
  },
  productivity: {
    name: "Productivity Agent",
    purpose: "Organize tasks, schedules, and priorities",
    icon: ClipboardList,
  },
  travel: {
    name: "Travel Agent",
    purpose: "Plan trips, compare options, and build itineraries",
    icon: Plane,
  },
  finance: {
    name: "Finance Agent",
    purpose: "Track budgets, explain expenses, and organize goals",
    icon: Landmark,
  },
  "personal-assistant": {
    name: "Personal Assistant",
    purpose: "Handle custom daily tasks and reminders",
    icon: Bot,
  },
  knowledge: {
    name: "Knowledge Agent",
    purpose: "Answer from company docs and shared knowledge",
    icon: BookOpen,
  },
  documentation: {
    name: "Documentation Agent",
    purpose: "Create, clean, and maintain internal docs",
    icon: FileText,
  },
  "project-assistant": {
    name: "Project Assistant",
    purpose: "Track projects, updates, blockers, and next steps",
    icon: Workflow,
  },
  hr: {
    name: "HR Agent",
    purpose: "Answer internal policy and employee questions",
    icon: HeartHandshake,
  },
  meeting: {
    name: "Meeting Agent",
    purpose: "Summarize meetings and create action items",
    icon: Users,
  },
};

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "₹2,999/month",
    badge: "",
    limit: 1,
    features: ["1 Agent", "500 Conversations", "Basic Knowledge Base", "Starter Analytics"],
  },
  {
    id: "growth",
    name: "Growth",
    price: "₹6,999/month",
    badge: "Most Popular",
    limit: 4,
    features: ["4 Agents", "5,000 Conversations", "WhatsApp/Email workflows", "Lead Follow-Up"],
  },
  {
    id: "scale",
    name: "Pro",
    price: "₹14,999/month",
    badge: "Best for teams",
    limit: 99,
    features: ["Unlimited Agents", "Advanced Analytics", "Custom Workflows", "Priority Support"],
  },
];

const tones = ["Professional", "Friendly", "Luxury", "Corporate", "Casual"];
const experienceLevels = [
  { id: "beginner", label: "Beginner", body: "Guided setup." },
  { id: "intermediate", label: "Intermediate", body: "Practical controls." },
  { id: "advanced", label: "Advanced", body: "Model and API controls." },
] satisfies Array<{ id: ExperienceLevel; label: string; body: string }>;

const personalQuickContexts = [
  "Study planning",
  "Research summaries",
  "Writing drafts",
  "Daily productivity",
  "Travel planning",
  "Budget tracking",
];

const personalOutputStyles = [
  "Clear action steps",
  "Short answers",
  "Detailed explanations",
  "Checklists",
];

const buildSteps = [
  "Creating Workspace",
  "Setting Up Knowledge Base",
  "Creating Recommended Agents",
  "Training First Agent",
  "Configuring Dashboard",
  "Ready",
];

const stepNav = [
  { label: "Welcome", short: "Start" },
  { label: "Workspace", short: "Type" },
  { label: "Profile", short: "Profile" },
  { label: "Goals", short: "Goals" },
  { label: "Knowledge", short: "Train" },
  { label: "Plan", short: "Plan" },
  { label: "Build", short: "Build" },
  { label: "Review", short: "Review" },
];

type SetupForm = {
  businessName: string;
  industry: string;
  websiteUrl: string;
  services: string;
  targetCustomer: string;
  serviceMarket: string;
  leadChannel: string;
  handoffOwner: string;
  teamName: string;
  teamSize: string;
  teamUseCase: string;
  personalNotes: string;
  personalTools: string;
  personalOutputStyle: string;
  knowledgeNotes: string;
  tone: string;
  uploadedFiles: string[];
};

const defaultForm: SetupForm = {
  businessName: "",
  industry: "E-commerce",
  websiteUrl: "",
  services: "",
  targetCustomer: "",
  serviceMarket: "",
  leadChannel: "WhatsApp",
  handoffOwner: "",
  teamName: "",
  teamSize: "2-10",
  teamUseCase: "",
  personalNotes: "",
  personalTools: "",
  personalOutputStyle: "Clear action steps",
  knowledgeNotes: "",
  tone: "Professional",
  uploadedFiles: [],
};

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(0);
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType | null>(null);
  const [experience, setExperience] = useState<ExperienceLevel>("beginner");
  const [form, setForm] = useState<SetupForm>(defaultForm);
  const [goals, setGoals] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState("growth");
  const [couponCode, setCouponCode] = useState("");
  const [paymentMode, setPaymentMode] = useState<"trial" | "gateway">("trial");
  const [paymentProvider, setPaymentProvider] = useState<"pine-labs">("pine-labs");
  const [buildIndex, setBuildIndex] = useState(0);
  const [draftConsent, setDraftConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);

  const firstName =
    user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const ownerName = user?.displayName || "Workspace Owner";
  const ownerEmail = user?.email || "";

  if (!loading && !user) {
    setLocation("/get-started");
    return null;
  }

  const activeType = workspaceType ?? "business";
  const activeGoals = goalCatalog[activeType];
  const recommendedAgents = useMemo(() => {
    const ids = goals.flatMap(
      (goal) => activeGoals.find((item) => item.id === goal)?.agents ?? [],
    );
    const fallback =
      activeType === "business"
        ? ["website-sales", "whatsapp-capture", "follow-up"]
        : activeType === "personal"
          ? ["study", "research"]
          : ["knowledge", "documentation"];
    return Array.from(new Set(ids.length ? ids : fallback));
  }, [activeGoals, activeType, goals]);
  const plan = plans.find((item) => item.id === selectedPlan) ?? plans[1];
  const finalAgents = recommendedAgents.slice(0, plan.limit);
  useEffect(() => {
    if (step !== 6) return;
    setBuildIndex(0);
    const timer = window.setInterval(() => {
      setBuildIndex((value) => {
        if (value >= buildSteps.length - 1) {
          window.clearInterval(timer);
          return value;
        }
        return value + 1;
      });
    }, 650);
    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step !== 6 || buildIndex < buildSteps.length - 1) return;
    const timer = window.setTimeout(() => void persistAndGoDashboard(), 700);
    return () => window.clearTimeout(timer);
  }, [step, buildIndex]);

  const updateForm = (key: keyof SetupForm, value: string | string[]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleGoal = (goalId: string) => {
    setGoals((items) =>
      items.includes(goalId)
        ? items.filter((item) => item !== goalId)
        : [...items, goalId],
    );
  };

  const selectWorkspace = (type: WorkspaceType) => {
    setWorkspaceType(type);
    setGoals([]);
  };

  const canContinue =
    step === 1
      ? workspaceType !== null
      : step === 2
        ? activeType === "business"
          ? form.businessName.trim().length > 1 &&
            form.industry.length > 0 &&
            form.services.trim().length > 2
          : activeType === "team"
            ? form.teamName.trim().length > 1 && form.teamUseCase.trim().length > 2
            : true
        : step === 3
          ? goals.length > 0
          : step === 7
            ? draftConsent && termsConsent
          : true;

  const persistWorkspace = () => {
    const workspaceName =
      activeType === "business"
        ? form.businessName.trim()
        : activeType === "team"
          ? form.teamName.trim()
          : `${firstName}'s Workspace`;

    saveOnboarding({
      role: activeType,
      useCase: goals.join(","),
      teamSize: activeType === "team" ? form.teamSize : selectedPlan,
      source: "dual-onboarding",
      channels:
        activeType === "business" && goals.includes("whatsapp")
          ? ["web", "whatsapp", "email"]
          : ["web", "email"],
      plan: selectedPlan,
      selectedAgents: finalAgents,
      companyName: workspaceName,
      website: form.websiteUrl.trim(),
      industry: activeType === "business" ? form.industry : activeType,
      targetCustomer:
        activeType === "business"
          ? form.targetCustomer || form.services
          : activeType === "team"
            ? form.teamUseCase
            : [form.personalNotes, form.personalTools].filter(Boolean).join(" - "),
      monthlyLeads: selectedPlan === "starter" ? "0-100" : "100-500",
      salesOwner: form.handoffOwner || ownerName,
      knowledgeSources: [
        activeType === "business" ? "Services" : "Workspace notes",
        "Goals",
        ...form.uploadedFiles,
      ],
      launchMode: "workspace-type-onboarding",
      workspaceType: activeType,
      automationGoals: goals,
      businessDescription:
        activeType === "business"
          ? [form.services, form.serviceMarket, form.leadChannel].filter(Boolean).join(" - ")
          : [form.personalNotes, form.personalTools].filter(Boolean).join(" - ") || form.teamUseCase,
      servicesOffered: form.services,
      commonQuestions: form.knowledgeNotes,
      brandTone: activeType === "personal" ? form.personalOutputStyle : form.tone,
      selectedPlanName: plan.name,
      couponCode: couponCode.trim(),
      paymentGateway: paymentMode === "gateway" ? paymentProvider : "trial",
      paymentMode,
      paymentProvider,
      aiExperience: experience,
      workspaceOwnerEmail: ownerEmail,
    });
  };

  const startPineLabsCheckout = async () => {
    if (paymentMode === "gateway") {
      try {
        const amount = Number(plan.price.replace(/[^\d]/g, ""));
        const checkout = await createPineLabsCheckout({
          planId: plan.id,
          planName: plan.name,
          amount,
          currency: "INR",
          couponCode: couponCode.trim() || undefined,
          customer: {
            name: ownerName,
            email: ownerEmail,
            phone: "9876543210",
          },
        });
        const checkoutUrl = extractCheckoutUrl(checkout);
        if (checkoutUrl) {
          window.location.assign(checkoutUrl);
          return;
        }
        setLocation("/payment/failure?reason=checkout-url-missing");
        return;
      } catch {
        setLocation("/payment/failure?reason=checkout-failed");
        return;
      }
    }
  };

  const persistAndGoDashboard = async () => {
    persistWorkspace();

    if (paymentMode === "gateway") {
      await startPineLabsCheckout();
      return;
    }

    setLocation("/dashboard");
  };

  const next = () => {
    if (!canContinue) return;
    if (step === 5 && paymentMode === "gateway") {
      persistWorkspace();
      void startPineLabsCheckout();
      return;
    }
    if (step === 7) {
      void persistAndGoDashboard();
      return;
    }
    setStep((value) => Math.min(7, value + 1));
  };

  const back = () => setStep((value) => Math.max(0, value - 1));

  return (
    <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden bg-[#061321] text-white">
      <header className="sticky top-0 z-20 border-b border-[#9fb8d7]/12 bg-[#061321]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center">
            <img
              src={logo}
              alt="Jaabili Tech Solutions"
              className="h-12 w-auto drop-shadow-[0_0_18px_rgba(85,231,255,0.22)]"
            />
          </Link>
          <div className="hidden md:block" />
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#9fb8d7]/16 bg-[#102236] px-4 py-2 text-sm font-semibold text-[#dbe8ff] transition hover:border-[#55e7ff]/35 hover:bg-[#15314c]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100dvh-80px)] w-full max-w-7xl px-4 py-6 sm:px-8">
        <TopStepper step={step} />

        <section className="relative mx-auto mt-6 min-h-[460px] max-w-6xl overflow-hidden rounded-[24px] border border-[#9fb8d7]/14 bg-[#0b1a2a]/72 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.28)] sm:p-7 lg:min-h-[520px]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_8%,rgba(85,231,255,0.12),transparent_28%),radial-gradient(circle_at_76%_84%,rgba(139,92,246,0.11),transparent_30%)]" />
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="relative"
            >
              {step === 0 && (
                <WelcomeStep
                  firstName={firstName}
                  experience={experience}
                  setExperience={setExperience}
                />
              )}
              {step === 1 && (
                <WorkspaceTypeStep
                  selected={workspaceType}
                  selectWorkspace={selectWorkspace}
                />
              )}
              {step === 2 && (
                <DetailsStep
                  workspaceType={activeType}
                  form={form}
                  updateForm={updateForm}
                />
              )}
              {step === 3 && (
                <GoalsStep
                  workspaceType={activeType}
                  goals={goals}
                  toggleGoal={toggleGoal}
                  recommendedAgents={recommendedAgents}
                />
              )}
              {step === 4 && (
                <KnowledgeStep
                  workspaceType={activeType}
                  form={form}
                  updateForm={updateForm}
                  recommendedAgents={recommendedAgents}
                />
              )}
              {step === 5 && (
                <PlanStep
                  selectedPlan={selectedPlan}
                  setSelectedPlan={setSelectedPlan}
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  paymentMode={paymentMode}
                  setPaymentMode={setPaymentMode}
                  paymentProvider={paymentProvider}
                  setPaymentProvider={setPaymentProvider}
                  recommendedAgents={recommendedAgents}
                />
              )}
              {step === 6 && <BuildStep buildIndex={buildIndex} />}
              {step === 7 && (
                <FinalReviewStep
                  agentIds={finalAgents}
                  firstName={firstName}
                  workspaceType={activeType}
                  form={form}
                  goals={goals}
                  plan={plan}
                  draftConsent={draftConsent}
                  termsConsent={termsConsent}
                  setDraftConsent={setDraftConsent}
                  setTermsConsent={setTermsConsent}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {step !== 6 && (
            <div className="relative mt-8 flex items-center justify-between border-t border-[#9fb8d7]/12 pt-5">
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-[#c9d5ef]/60 transition hover:bg-white/7 hover:text-white disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!canContinue}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-40",
                  step === 7
                    ? "bg-gradient-to-r from-[#8b5cf6] to-[#16bfd3] text-white shadow-[0_16px_42px_rgba(22,191,211,0.22)] hover:brightness-110"
                    : "bg-white text-black hover:bg-white/90",
                )}
              >
                {step === 5 && paymentMode === "gateway"
                  ? "Continue to payment"
                  : step === 7
                    ? "Create Workspace & Dashboard"
                    : "Continue"}
                {step === 7 || (step === 5 && paymentMode === "gateway") ? (
                  <Rocket className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function WelcomeStep({
  firstName,
  experience,
  setExperience,
}: {
  firstName: string;
  experience: ExperienceLevel;
  setExperience: (level: ExperienceLevel) => void;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center py-4 text-center sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.34, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <img
          src={logo}
          alt="Jaabili Tech Solutions"
          className="h-20 w-auto drop-shadow-[0_0_28px_rgba(85,231,255,0.24)] sm:h-24"
        />
        <h1 className="mt-7 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          Welcome, {firstName}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#c9d5ef]/60">
          Choose how much guidance you want while we set up your workspace.
        </p>
      </motion.div>

      <div className="mt-7 w-full">
        <div className="grid gap-3 sm:grid-cols-3">
          {experienceLevels.map((level) => (
            <motion.button
              key={level.id}
              type="button"
              onClick={() => setExperience(level.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.28,
                delay: level.id === "beginner" ? 0.05 : level.id === "intermediate" ? 0.1 : 0.15,
                ease: "easeOut",
              }}
              className={cn(
                "rounded-2xl border p-4 text-left transition",
                experience === level.id
                  ? "border-[#55e7ff]/45 bg-[#0f3440] shadow-[0_18px_44px_rgba(85,231,255,0.08)]"
                  : "border-[#9fb8d7]/14 bg-[#111d2f] hover:border-[#9fb8d7]/28",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-white">{level.label}</div>
                  <p className="mt-2 text-sm leading-6 text-[#c9d5ef]/55">{level.body}</p>
                </div>
                {experience === level.id && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#55e7ff] text-[#061321]">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkspaceTypeStep({
  selected,
  selectWorkspace,
}: {
  selected: WorkspaceType | null;
  selectWorkspace: (type: WorkspaceType) => void;
}) {
  return (
    <div className="mx-auto max-w-5xl">
      <StepHeader
        eyebrow="Workspace type"
        title="What are you building today?"
        subtitle="Pick one. The dashboard adapts automatically."
      />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {workspaceTypes.map((type) => {
          const isSelected = selected === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => selectWorkspace(type.id)}
              className={cn(
                "rounded-[24px] border p-5 text-left transition",
                isSelected
                  ? "border-[#6ee7d8]/45 bg-[#102c2a]"
                  : "border-white/10 bg-white/[0.035] hover:border-white/20",
              )}
            >
              <div className="flex items-start justify-between">
                <span className="rounded-full border border-[#9fb8d7]/14 bg-white/[0.035] px-3 py-1 text-xs font-semibold text-[#c9d5ef]/55">
                  {type.id === "business" ? "Primary" : "Optional"}
                </span>
                {isSelected && (
                  <span className="rounded-full bg-[#6ee7d8] p-1 text-black">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
              <div className="mt-5 text-lg font-semibold">{type.label}</div>
              <p className="mt-2 text-sm leading-6 text-white/52">{type.body}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DetailsStep({
  workspaceType,
  form,
  updateForm,
}: {
  workspaceType: WorkspaceType;
  form: SetupForm;
  updateForm: (key: keyof SetupForm, value: string | string[]) => void;
}) {
  if (workspaceType === "personal") {
    const togglePersonalContext = (item: string) => {
      const current = form.personalNotes
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const next = current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item];
      updateForm("personalNotes", next.join(", "));
    };

    return (
      <div className="mx-auto max-w-4xl">
        <StepHeader
          eyebrow="Personal setup"
          title="Pick what you need"
          subtitle="No long form needed. You can add details later."
        />
        <div className="mt-6 space-y-6">
          <div>
            <div className="mb-3 text-sm font-semibold text-white/72">Choose focus areas</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {personalQuickContexts.map((item) => {
                const selected = form.personalNotes
                  .split(",")
                  .map((value) => value.trim())
                  .includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => togglePersonalContext(item)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition",
                      selected
                        ? "border-[#55e7ff]/45 bg-[#0f3440] text-white"
                        : "border-[#9fb8d7]/14 bg-[#111d2f] text-[#c9d5ef]/72 hover:border-[#9fb8d7]/28",
                    )}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold text-white/72">Preferred answer style</div>
            <div className="flex flex-wrap gap-2">
              {personalOutputStyles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => updateForm("personalOutputStyle", style)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition",
                    form.personalOutputStyle === style
                      ? "border-[#55e7ff]/45 bg-[#55e7ff]/12 text-[#a9f7ff]"
                      : "border-[#9fb8d7]/14 bg-[#111d2f] text-[#c9d5ef]/60 hover:text-white",
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <Field label="Optional context">
            <textarea
              value={form.personalTools}
              onChange={(event) => updateForm("personalTools", event.target.value)}
              placeholder="Add tools, subjects, projects, or preferences only if needed."
              className="jaabili-input min-h-24 resize-none"
            />
          </Field>
        </div>
      </div>
    );
  }

  if (workspaceType === "team") {
    return (
      <div className="mx-auto max-w-4xl">
        <StepHeader
          eyebrow="Team setup"
          title="Team profile"
          subtitle="Enough detail to create internal agents."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Team Name">
            <input
              value={form.teamName}
              onChange={(event) => updateForm("teamName", event.target.value)}
              placeholder="Jaabili Growth Team"
              className="jaabili-input"
            />
          </Field>
          <Field label="Team Size">
            <select
              value={form.teamSize}
              onChange={(event) => updateForm("teamSize", event.target.value)}
              className="jaabili-input"
            >
              {["1-5", "6-20", "21-50", "51-200", "200+"].map((size) => (
                <option key={size}>{size}</option>
              ))}
            </select>
          </Field>
          <Field label="Team Use Case" className="md:col-span-2">
            <textarea
              value={form.teamUseCase}
              onChange={(event) => updateForm("teamUseCase", event.target.value)}
              placeholder="We need agents to answer internal questions, maintain documentation, and summarize project updates."
              className="jaabili-input min-h-32 resize-none"
            />
          </Field>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <StepHeader
        eyebrow="Business setup"
        title="Business profile"
        subtitle="Basic company context for the first agents."
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Business Name">
          <input
            value={form.businessName}
            onChange={(event) => updateForm("businessName", event.target.value)}
            placeholder="Kalepu Interiors"
            className="jaabili-input"
          />
        </Field>
        <Field label="Industry">
          <select
            value={form.industry}
            onChange={(event) => updateForm("industry", event.target.value)}
            className="jaabili-input"
          >
            {businessIndustries.map((industry) => (
              <option key={industry}>{industry}</option>
            ))}
          </select>
        </Field>
        <Field label="Website URL" hint="Optional. Use it to import services, FAQs, about, and contact details.">
          <input
            value={form.websiteUrl}
            onChange={(event) => updateForm("websiteUrl", event.target.value)}
            placeholder="https://yourbusiness.com"
            className="jaabili-input"
          />
        </Field>
        <div className="rounded-3xl border border-[#6ee7d8]/18 bg-[#6ee7d8]/8 p-4">
          <Globe2 className="mb-3 h-5 w-5 text-[#6ee7d8]" />
          <div className="text-sm font-semibold">Smart Website Import</div>
          <p className="mt-2 text-sm leading-6 text-white/52">Import services, FAQs, about, and contacts.</p>
        </div>
        <Field label="Services" className="md:col-span-2">
          <textarea
            value={form.services}
            onChange={(event) => updateForm("services", event.target.value)}
            placeholder="We sell luxury villas in Hyderabad, provide property tours, and help buyers shortlist homes."
            className="jaabili-input min-h-28 resize-none"
          />
        </Field>
        <Field label="Ideal customer">
          <input
            value={form.targetCustomer}
            onChange={(event) => updateForm("targetCustomer", event.target.value)}
            placeholder="Home buyers, clinic patients, fashion shoppers..."
            className="jaabili-input"
          />
        </Field>
        <Field label="Service market">
          <input
            value={form.serviceMarket}
            onChange={(event) => updateForm("serviceMarket", event.target.value)}
            placeholder="Hyderabad, India, online, local area..."
            className="jaabili-input"
          />
        </Field>
        <Field label="Primary lead channel">
          <select
            value={form.leadChannel}
            onChange={(event) => updateForm("leadChannel", event.target.value)}
            className="jaabili-input"
          >
            {["WhatsApp", "Phone call", "Email", "CRM", "Website dashboard"].map((channel) => (
              <option key={channel}>{channel}</option>
            ))}
          </select>
        </Field>
        <Field label="Lead handoff owner">
          <input
            value={form.handoffOwner}
            onChange={(event) => updateForm("handoffOwner", event.target.value)}
            placeholder="Sales manager, founder, front desk..."
            className="jaabili-input"
          />
        </Field>
      </div>
    </div>
  );
}

function GoalsStep({
  workspaceType,
  goals,
  toggleGoal,
  recommendedAgents,
}: {
  workspaceType: WorkspaceType;
  goals: string[];
  toggleGoal: (goalId: string) => void;
  recommendedAgents: string[];
}) {
  const title =
    workspaceType === "business"
      ? "What do you want to automate?"
      : workspaceType === "personal"
        ? "What do you want help with?"
        : "What should your team agents handle?";

  return (
    <div className="mx-auto max-w-5xl">
      <StepHeader
        eyebrow="Goals"
        title={title}
        subtitle="Choose multiple. Agents are created automatically."
      />
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {goalCatalog[workspaceType].map((goal) => {
          const selected = goals.includes(goal.id);
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                "rounded-2xl border p-4 text-left transition",
                selected
                  ? "border-[#6ee7d8]/45 bg-[#102c2a]"
                  : "border-white/10 bg-white/[0.035] hover:border-white/20",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-base font-semibold">{goal.label}</span>
                {selected && (
                  <span className="rounded-full bg-[#6ee7d8] p-1 text-black">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <AgentRecommendation agentIds={recommendedAgents} />
    </div>
  );
}

function KnowledgeStep({
  workspaceType,
  form,
  updateForm,
  recommendedAgents,
}: {
  workspaceType: WorkspaceType;
  form: SetupForm;
  updateForm: (key: keyof SetupForm, value: string | string[]) => void;
  recommendedAgents: string[];
}) {
  const addFakeFile = (name: string) => {
    updateForm("uploadedFiles", Array.from(new Set([...form.uploadedFiles, name])));
  };
  const isPersonal = workspaceType === "personal";
  const isTeam = workspaceType === "team";
  const sourceOptions = isPersonal
    ? ["Use my goals", "Add notes later", "Create starter plan"]
    : isTeam
      ? ["Use team profile", "Add docs later", "Create starter knowledge"]
      : ["Use website", "Add docs later", "Create starter FAQ"];
  const contextLabel = isPersonal
    ? "Anything important?"
    : isTeam
      ? "Team knowledge"
      : "Customer questions";
  const contextPlaceholder = isPersonal
    ? "Optional: subjects, projects, tools, preferences..."
    : isTeam
      ? "Optional: policies, SOPs, docs, team rules..."
      : "Optional: pricing, timelines, availability, objections...";

  return (
    <div className="mx-auto max-w-5xl">
      <StepHeader
        eyebrow="Knowledge"
        title="Add what you have"
        subtitle="No documents? Continue. Agents can start with your answers."
      />
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div>
            <div className="mb-3 text-sm font-semibold text-white/72">Available now</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {sourceOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => addFakeFile(option)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition",
                    form.uploadedFiles.includes(option)
                      ? "border-[#55e7ff]/45 bg-[#0f3440] text-white"
                      : "border-[#9fb8d7]/14 bg-[#111d2f] text-[#c9d5ef]/68 hover:border-[#9fb8d7]/28",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <Field label={contextLabel} hint="Optional. Skip if you do not have this yet.">
            <textarea
              value={form.knowledgeNotes}
              onChange={(event) => updateForm("knowledgeNotes", event.target.value)}
              placeholder={contextPlaceholder}
              className="jaabili-input min-h-24 resize-none"
            />
          </Field>

          <div>
            <div className="mb-3 text-sm font-semibold text-white/72">
              {isPersonal ? "Answer style" : "Agent tone"}
            </div>
            <div className="flex flex-wrap gap-2">
              {tones.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => updateForm("tone", tone)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition",
                    form.tone === tone
                      ? "border-[#6ee7d8]/50 bg-[#6ee7d8]/12 text-[#a7fff2]"
                      : "border-white/10 bg-white/[0.035] text-white/55 hover:text-white",
                  )}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <AgentCompactList agentIds={recommendedAgents} />
        </div>
        <div className="rounded-3xl border border-dashed border-[#9fb8d7]/18 bg-white/[0.03] p-5">
          <div className="text-lg font-semibold">Files</div>
          <p className="mt-2 text-sm leading-6 text-white/48">
            Optional now. Add when available.
          </p>
          <div className="mt-5 grid gap-2">
            {["PDF", "Brochure", "Price List", "Company Profile"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => addFakeFile(`Upload ${item}`)}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-white/72 transition hover:bg-white/7 hover:text-white"
              >
                <span>{item}</span>
                <span className="text-xs text-white/34">Add</span>
              </button>
            ))}
          </div>
          {form.uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {form.uploadedFiles.map((file) => (
                <div key={file} className="rounded-xl bg-[#6ee7d8]/10 px-3 py-2 text-xs text-[#a7fff2]">
                  {file}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanStep({
  selectedPlan,
  setSelectedPlan,
  couponCode,
  setCouponCode,
  paymentMode,
  setPaymentMode,
  paymentProvider,
  setPaymentProvider,
  recommendedAgents,
}: {
  selectedPlan: string;
  setSelectedPlan: (plan: string) => void;
  couponCode: string;
  setCouponCode: (value: string) => void;
  paymentMode: "trial" | "gateway";
  setPaymentMode: (value: "trial" | "gateway") => void;
  paymentProvider: "pine-labs";
  setPaymentProvider: (value: "pine-labs") => void;
  recommendedAgents: string[];
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <StepHeader
        eyebrow="Subscription"
        title="Choose a plan"
        subtitle="Start with trial. Upgrade after setup."
      />
      <div className="mx-auto mt-5 inline-flex rounded-full border border-[#ffcf7a]/30 bg-[#ffcf7a]/10 px-4 py-2 text-sm font-semibold text-[#ffdf9b]">
        14 Day Free Trial - No Credit Card
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const selected = selectedPlan === plan.id;
          const includedCount = Math.min(recommendedAgents.length, plan.limit);
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                "relative rounded-3xl border p-5 text-left transition",
                selected
                  ? "border-[#6ee7d8]/50 bg-[#102c2a]"
                  : "border-white/10 bg-white/[0.035] hover:border-white/20",
              )}
            >
              {plan.badge && (
                <span className="absolute right-5 top-5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                  {plan.badge}
                </span>
              )}
              <div className="text-xl font-semibold">{plan.name}</div>
              <div className="mt-3 text-3xl font-semibold">{plan.price}</div>
              <div className="mt-2 text-xs text-white/45">
                Activates {includedCount}/{recommendedAgents.length} recommended agents
              </div>
              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-white/68">
                    <CheckCircle2 className="h-4 w-4 text-[#6ee7d8]" />
                    {feature}
                  </div>
                ))}
              </div>
              <div
                className={cn(
                  "mt-6 rounded-2xl px-4 py-3 text-center text-sm font-semibold",
                  selected ? "bg-white text-black" : "bg-white/7 text-white",
                )}
              >
                Choose {plan.name}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-3xl border border-[#9fb8d7]/14 bg-[#111d2f] p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.7fr)]">
          <div>
            <div className="text-sm font-semibold text-white/78">Coupon code</div>
            <p className="mt-1 text-xs text-[#c9d5ef]/48">Optional. Apply only if you have a Jaabili offer code.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
              placeholder="JAABILI20"
              className="jaabili-input h-12 flex-1"
            />
            <button
              type="button"
              className="h-12 rounded-2xl border border-[#55e7ff]/24 px-5 text-sm font-semibold text-[#a9f7ff] transition hover:bg-[#55e7ff]/10"
            >
              Apply
            </button>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-white/78">Payment method</div>
            <p className="mt-1 text-xs text-[#c9d5ef]/48">Choose how you want to activate this plan.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            <button
              type="button"
              onClick={() => setPaymentMode("trial")}
              className={cn(
                "flex min-h-14 items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
                paymentMode === "trial"
                  ? "border-[#55e7ff]/45 bg-[#0f3440]"
                  : "border-[#9fb8d7]/14 bg-black/16 hover:border-[#9fb8d7]/28",
              )}
            >
              <span className="text-sm font-semibold">Free trial</span>
              <span className="text-xs text-[#c9d5ef]/48">14 days</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPaymentProvider("pine-labs");
                setPaymentMode("gateway");
              }}
              className={cn(
                "flex min-h-14 items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
                paymentMode === "gateway" && paymentProvider === "pine-labs"
                  ? "border-[#55e7ff]/55 bg-[#0f3440] shadow-[0_0_0_1px_rgba(85,231,255,0.18)]"
                  : "border-[#9fb8d7]/14 bg-black/16 hover:border-[#9fb8d7]/28",
              )}
            >
              <span className="rounded-lg bg-white px-3 py-1.5">
                <img src="/assets/logos/pinelab.svg" alt="Pine Labs" className="h-5 w-auto" />
              </span>
              <span className="text-xs font-semibold text-[#9afcf1]">Pay now</span>
            </button>

            <button
              type="button"
              disabled
              className="flex min-h-14 items-center justify-between rounded-2xl border border-[#9fb8d7]/10 bg-black/10 px-4 py-3 text-left opacity-55"
            >
              <span className="rounded-lg bg-white px-3 py-1.5">
                <img src="/assets/logos/razorpay.png" alt="Razorpay" className="h-5 w-auto" />
              </span>
              <span className="text-xs text-white/45">Soon</span>
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildStep({ buildIndex }: { buildIndex: number }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center py-14 text-center">
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#121821]">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#6ee7d8] border-r-[#ffcf7a]" />
        <img src={logo} alt="Jaabili" className="h-14 w-auto" />
      </div>
      <h1 className="text-4xl font-semibold tracking-tight">Building Workspace...</h1>
      <p className="mt-3 text-sm text-white/48">Creating your AI workspace and dashboard.</p>
      <div className="mt-10 w-full max-w-lg space-y-3 text-left">
        {buildSteps.map((item, index) => (
          <div
            key={item}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm",
              index <= buildIndex
                ? "border-[#6ee7d8]/20 bg-[#6ee7d8]/10 text-white"
                : "border-white/8 bg-white/[0.025] text-white/35",
            )}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/8">
              {index <= buildIndex ? <Check className="h-3.5 w-3.5 text-[#6ee7d8]" /> : index + 1}
            </span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function TopStepper({ step }: { step: number }) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
        {stepNav.map((item, index) => {
          const complete = index < step;
          const active = index === step;
          return (
            <div key={item.label} className="flex min-w-0 flex-col items-center gap-1.5">
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition sm:h-9 sm:w-9",
                    complete
                      ? "border border-[#55dff5]/50 bg-[#55dff5]/14 text-[#55dff5]"
                      : active
                        ? "border border-[#d4b8ff]/55 bg-[#d4b8ff]/14 text-[#e3d2ff]"
                        : "border border-[#9fb8d7]/14 bg-[#102033] text-[#c9d5ef]/42",
                  )}
                >
                  {complete ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                {index < stepNav.length - 1 && (
                  <span
                    className={cn(
                      "ml-2 hidden h-px flex-1 rounded-full md:block",
                      index < step
                        ? "bg-[#55dff5]/55"
                        : active
                          ? "bg-[#d4b8ff]/45"
                          : "bg-[#9fb8d7]/12",
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "w-full truncate text-center text-[10px] font-medium sm:text-[11px]",
                  active ? "text-[#d4b8ff]" : complete ? "text-[#55dff5]/86" : "text-[#c9d5ef]/42",
                )}
              >
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.short}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FinalReviewStep({
  agentIds,
  firstName,
  workspaceType,
  form,
  goals,
  plan,
  draftConsent,
  termsConsent,
  setDraftConsent,
  setTermsConsent,
}: {
  agentIds: string[];
  firstName: string;
  workspaceType: WorkspaceType;
  form: SetupForm;
  goals: string[];
  plan: (typeof plans)[number];
  draftConsent: boolean;
  termsConsent: boolean;
  setDraftConsent: (value: boolean) => void;
  setTermsConsent: (value: boolean) => void;
}) {
  const profileTitle =
    workspaceType === "business"
      ? form.businessName || "Business Workspace"
      : workspaceType === "team"
        ? form.teamName || "Team Workspace"
        : `${firstName}'s Workspace`;
  const profileMeta =
    workspaceType === "business"
      ? `${form.industry}${form.serviceMarket ? ` - ${form.serviceMarket}` : ""}${form.websiteUrl ? ` - ${form.websiteUrl}` : ""}`
      : workspaceType === "team"
        ? `${form.teamSize} members - ${form.teamUseCase || "Internal workflows"}`
        : [form.personalNotes, form.personalOutputStyle].filter(Boolean).join(" - ") || "Personal AI workspace";
  const selectedGoalLabels = goalCatalog[workspaceType]
    .filter((goal) => goals.includes(goal.id))
    .map((goal) => goal.label);

  return (
    <div className="mx-auto max-w-5xl py-2">
      <StepHeader
        eyebrow="Final Review"
        title="Review and create"
        subtitle="Agents stay in draft until you publish."
      />
      <div className="mt-6 space-y-3">
        <ReviewRow
          icon={Building2}
          title={workspaceType === "business" ? "Business Profile" : "Workspace Profile"}
          meta={`${profileTitle} - ${profileMeta}`}
        />
        <ReviewRow
          icon={Sparkles}
          title="Agent Personality"
          meta={`${form.tone} - ${workspaceType === "business" ? form.leadChannel : "Helpful"} - Guided`}
        />
        <ReviewRow
          icon={FileText}
          title={workspaceType === "business" ? "Services & FAQs" : "Knowledge"}
          meta={`${selectedGoalLabels.length || agentIds.length} goals - ${form.uploadedFiles.length} files loaded`}
        />
      </div>

      <div className="mt-7 rounded-[26px] border border-[#b8c6e6]/55 bg-gradient-to-r from-[#246c7a] via-[#21415e] to-[#6f668f] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-2xl font-semibold text-[#67e8f9]">{plan.name} Plan</div>
            <div className="mt-2 text-4xl font-bold tracking-tight text-[#bdefff] sm:text-5xl">
              {plan.price.replace("/month", "")}
              <span className="text-base font-medium text-white/70"> /month</span>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-white/78 sm:grid-cols-2">
            {plan.features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#55e7ff]" />
                {feature}
              </div>
            ))}
          </div>
        </div>
        <span className="mt-5 inline-flex rounded-full bg-[#55dff5] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#063042]">
          14-day free trial
        </span>
      </div>

      <div className="mt-7 space-y-4">
        <ConsentCheck
          checked={draftConsent}
          onChange={setDraftConsent}
          label="I understand that my agents will start in Draft Mode until I publish them to live channels."
        />
        <ConsentCheck
          checked={termsConsent}
          onChange={setTermsConsent}
          label={
            <>
              I agree to the{" "}
              <Link href="/terms" className="text-[#55e7ff] underline underline-offset-4">
                Terms
              </Link>
              ,{" "}
              <Link href="/privacy" className="text-[#55e7ff] underline underline-offset-4">
                Privacy Policy
              </Link>
              , and data processing for agent setup.
            </>
          }
        />
      </div>

      <div className="mt-8 rounded-2xl border border-[#55e7ff]/16 bg-[#55e7ff]/8 px-4 py-3 text-center text-sm text-[#c9d5ef]/72">
        No credit card required for trial. You can upgrade, cancel, or publish agents from the dashboard.
      </div>
    </div>
  );
}

function ReviewRow({
  icon: Icon,
  title,
  meta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  meta: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-[#b8c6e6]/45 bg-[#111d2f] p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#162b45] text-[#d8c3ff]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-lg font-semibold text-[#dbe8ff]">{title}</div>
        <p className="mt-1 truncate text-sm font-medium text-[#c9d5ef]/68">{meta}</p>
      </div>
      <button
        type="button"
        className="hidden items-center gap-3 rounded-full px-3 py-2 text-sm font-semibold text-[#d8c3ff] transition hover:bg-white/7 sm:inline-flex"
      >
        Edit
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}

function ConsentCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 text-left text-sm text-[#dbe8ff]/82"
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
          checked
            ? "border-[#55dff5] bg-[#55dff5] text-[#061321]"
            : "border-[#9fb8d7]/35 bg-[#111d2f]",
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
      <span>{label}</span>
    </button>
  );
}

function AgentRecommendation({ agentIds }: { agentIds: string[] }) {
  return (
    <div className="mt-6 rounded-3xl border border-[#6ee7d8]/18 bg-[#6ee7d8]/8 p-5">
      <div className="text-sm font-semibold text-[#a7fff2]">Recommended AI workspace</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {agentIds.map((id) => {
          const agent = agentCatalog[id as keyof typeof agentCatalog];
          if (!agent) return null;
          return (
            <span key={id} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/72">
              {agent.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function AgentCompactList({ agentIds }: { agentIds: string[] }) {
  return (
    <div className="rounded-2xl border border-[#9fb8d7]/12 bg-black/12 p-4">
      <div className="mb-3 text-sm font-semibold text-white/72">Agents prepared</div>
      <div className="flex flex-wrap gap-2">
        {agentIds.map((id) => {
          const agent = agentCatalog[id as keyof typeof agentCatalog];
          if (!agent) return null;
          return (
            <span
              key={id}
              className="rounded-full border border-[#55e7ff]/18 bg-[#55e7ff]/8 px-3 py-1.5 text-xs font-semibold text-[#a9f7ff]"
            >
              {agent.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function AgentPreview({ agentIds }: { agentIds: string[] }) {
  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-black/18 p-5">
      <div className="mb-4 text-sm font-semibold text-white/72">AI Creates Agents</div>
      <div className="grid gap-3 md:grid-cols-2">
        {agentIds.map((id) => {
          const agent = agentCatalog[id as keyof typeof agentCatalog];
          if (!agent) return null;
          const Icon = agent.icon;
          return (
            <div key={id} className="rounded-2xl bg-white/[0.035] p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6ee7d8]/10 text-[#6ee7d8]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-semibold">{agent.name}</div>
                  <p className="mt-1 text-sm leading-5 text-white/48">{agent.purpose}</p>
                  <span className="mt-3 inline-flex rounded-full bg-[#6ee7d8]/12 px-3 py-1 text-xs font-semibold text-[#a7fff2]">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-[#6ee7d8]">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-white/52">{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-sm font-semibold text-white/72">{label}</span>
      {children}
      {hint && <span className="mt-2 block text-xs leading-5 text-white/38">{hint}</span>}
    </label>
  );
}
