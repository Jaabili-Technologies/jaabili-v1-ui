import { useEffect, useMemo, useRef, useState } from "react";
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
import { useTheme } from "next-themes";
import logoDark from "@assets/jaabili-logo-dark.png";
import logoLight from "@assets/jaabili-logo-light.png";
import iconDark from "@assets/jaabili-icon-dark.png";
import iconLight from "@assets/jaabili-icon-light.png";
import { useAuth } from "@/lib/auth-context";
import { createPineLabsCheckout, extractCheckoutUrl } from "@/lib/billing-api";
import { saveOnboarding } from "@/lib/onboarding";
import {
  createWebsiteSalesTenant,
  registerKnowledgeText,
  registerKnowledgeUrl,
  uploadKnowledgeFile,
} from "@/lib/agent-api";
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
    body: "Learning, research, writing, and daily work. Coming soon.",
  },
  {
    id: "team",
    label: "Team / Organization",
    icon: HeartHandshake,
    body: "Internal knowledge, projects, docs, and support. Coming soon.",
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

const industryInsights: Record<
  string,
  { tip: string; placeholder: string; starterFaqs: string[] }
> = {
  "Real Estate": {
    tip: "78% of buyers go with whichever agent replies first. Nova answers listing questions instantly, even after hours.",
    placeholder: "We sell luxury villas in Hyderabad, provide property tours, and help buyers shortlist homes.",
    starterFaqs: [
      "Is this property still available?",
      "What's the price and any hidden costs?",
      "Can I schedule a viewing this week?",
    ],
  },
  Healthcare: {
    tip: "Clinics miss about 40% of appointment requests after hours. Nova can answer insurance, hours, and booking questions while your front desk is busy.",
    placeholder: "We're a family clinic offering general checkups, vaccinations, and specialist referrals.",
    starterFaqs: [
      "Do you accept my insurance?",
      "What are your clinic hours?",
      "How do I book a new patient appointment?",
    ],
  },
  Education: {
    tip: "Replying within 5 minutes converts up to 21x better than a 30-minute delay. Nova keeps prospective families engaged instantly.",
    placeholder: "We're a K-12 school offering CBSE curriculum with a focus on sports and arts.",
    starterFaqs: [
      "What's the tuition and fee structure?",
      "What's the admissions process and deadline?",
      "Can I schedule a campus visit?",
    ],
  },
  "Interior Design": {
    tip: "Pre-qualifying budget and scope before a call saves you hours. Nova can screen serious leads automatically.",
    placeholder: "We design and renovate homes and offices, from full remodels to styling consultations.",
    starterFaqs: [
      "What's your starting budget for a project like mine?",
      "Do you handle full renovations or just styling?",
      "What's your typical project timeline?",
    ],
  },
  Restaurant: {
    tip: "Restaurants miss up to 43% of calls during dinner rush. Nova answers hours, reservations, and catering questions so you don't lose business to a busy line.",
    placeholder: "We're a family restaurant serving North Indian cuisine, open for dine-in, takeout, and catering.",
    starterFaqs: [
      "Are you open right now and what are your hours?",
      "Do you take reservations?",
      "Do you cater for events?",
    ],
  },
  "E-commerce": {
    tip: "Live chat lifts conversion 2.8x. Nova answers sizing, shipping, and returns questions right at the moment of purchase intent.",
    placeholder: "We sell handcrafted leather bags and accessories, shipping across India.",
    starterFaqs: [
      "What's your shipping and delivery time?",
      "What's your return or exchange policy?",
      "Is this item in stock in my size?",
    ],
  },
  Travel: {
    tip: "Confusing pricing and slow replies are the top complaint in travel. Nova answers itinerary and pricing questions instantly.",
    placeholder: "We plan custom domestic and international trips, including flights, stays, and local experiences.",
    starterFaqs: [
      "What's included in this package price?",
      "What's the cancellation or refund policy?",
      "Can you customize an itinerary for my dates?",
    ],
  },
  Consulting: {
    tip: "Poor lead qualification wastes paid discovery calls. Nova can ask about goals, budget, and timeline before someone books time with you.",
    placeholder: "We provide business strategy and growth consulting for small and mid-sized companies.",
    starterFaqs: [
      "What's your pricing and packages?",
      "What's the process to get started?",
      "Do you offer a free consultation?",
    ],
  },
  Other: {
    tip: "Nova learns from whatever you give it. Add your most common customer questions to get started fastest.",
    placeholder: "Describe what your business sells or does, and who your typical customer is.",
    starterFaqs: [
      "What are your hours or availability?",
      "What's the pricing for your main service?",
      "How do I get started or book with you?",
    ],
  },
};

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
    id: "free",
    name: "Free",
    price: "$0/forever",
    badge: "Available now",
    limit: 1,
    available: true,
    features: ["1 active agent", "500 conversations/month", "All starter templates", "Community support"],
  },
  {
    id: "basic",
    name: "Basic",
    price: "Coming soon",
    badge: "",
    limit: 3,
    available: false,
    features: ["Up to 3 active agents", "5,000 conversations/month", "Knowledge base sync", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "Coming soon",
    badge: "",
    limit: 15,
    available: false,
    features: ["Up to 15 active agents", "50,000 conversations/month", "Multi-LLM routing", "Priority support"],
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
  "Setting up your workspace",
  "Saving what you told us",
  "Getting your agents ready",
  "Teaching your first agent",
  "Almost there",
  "Ready",
];

const stepNav = [
  { label: "Welcome", short: "Start" },
  { label: "Your business", short: "Business" },
  { label: "About you", short: "About" },
  { label: "What to watch", short: "Watch for" },
  { label: "What it knows", short: "Knows" },
  { label: "Plan", short: "Plan" },
  { label: "Setting up", short: "Setup" },
  { label: "Review & approve", short: "Approve" },
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
  const { resolvedTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);
  useEffect(() => setThemeMounted(true), []);
  const logo = themeMounted && resolvedTheme === "light" ? logoLight : logoDark;
  const [step, setStep] = useState(0);
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType | null>(null);
  const [experience, setExperience] = useState<ExperienceLevel>("beginner");
  const [form, setForm] = useState<SetupForm>(defaultForm);
  const [knowledgeFiles, setKnowledgeFiles] = useState<File[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [couponCode, setCouponCode] = useState("");
  const [paymentMode, setPaymentMode] = useState<"trial" | "gateway">("trial");
  const [paymentProvider, setPaymentProvider] = useState<"pine-labs">("pine-labs");
  const [buildIndex, setBuildIndex] = useState(0);
  const provisionRef = useRef<Promise<{
    tenantId: string;
    widgetPublicKey: string | null;
  } | null> | null>(null);
  const [draftConsent, setDraftConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);

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
  const plan = plans.find((item) => item.id === selectedPlan) ?? plans[0];
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
    }, 420);

    if (activeType === "business" && !provisionRef.current) {
      provisionRef.current = provisionBusinessTenant();
    }

    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step !== 6 || buildIndex < buildSteps.length - 1) return;
    const timer = window.setTimeout(() => setStep(7), 700);
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

  const provisionBusinessTenant = async (): Promise<{
    tenantId: string;
    widgetPublicKey: string | null;
  } | null> => {
    try {
      const tenant = await createWebsiteSalesTenant({
        name: form.businessName.trim() || `${firstName}'s Business`,
        websiteUrl: form.websiteUrl.trim() || undefined,
        industry: form.industry || undefined,
        contactEmail: ownerEmail || undefined,
      });

      const notes = [form.services, form.knowledgeNotes].filter(Boolean).join("\n\n");
      await Promise.allSettled([
        form.websiteUrl.trim()
          ? registerKnowledgeUrl({
              tenantId: tenant.id,
              title: `${form.businessName || "Business"} website`,
              url: form.websiteUrl.trim(),
            })
          : Promise.resolve(),
        notes.trim()
          ? registerKnowledgeText({
              tenantId: tenant.id,
              title: "Business details",
              text: notes,
            })
          : Promise.resolve(),
        ...knowledgeFiles.map((file) =>
          uploadKnowledgeFile({ tenantId: tenant.id, file, title: file.name }),
        ),
      ]);

      return { tenantId: tenant.id, widgetPublicKey: tenant.widgetPublicKey };
    } catch (err) {
      console.error("Website Sales Agent tenant setup failed", err);
      return null;
    }
  };

  const persistWorkspace = (
    provision?: { tenantId: string; widgetPublicKey: string | null } | null,
  ) => {
    const workspaceName =
      activeType === "business"
        ? form.businessName.trim()
        : activeType === "team"
          ? form.teamName.trim()
          : `${firstName}'s Workspace`;

    saveOnboarding(user?.uid ?? "anonymous", {
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
      monthlyLeads: selectedPlan === "free" ? "0-100" : "100-500",
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
      tenantId: provision?.tenantId,
      widgetPublicKey: provision?.widgetPublicKey ?? null,
    });
  };

  const startPineLabsCheckout = async (tenantId: string | undefined) => {
    if (paymentMode === "gateway") {
      if (!tenantId) {
        setLocation("/payment/failure?reason=missing-workspace");
        return;
      }
      try {
        const amount = Number(plan.price.replace(/[^\d]/g, ""));
        const checkout = await createPineLabsCheckout({
          tenantId,
          planId: plan.id,
          planName: plan.name,
          amount,
          currency: "INR",
          couponCode: couponCode.trim() || undefined,
          customer: {
            name: ownerName,
            email: ownerEmail,
            // No phone field is collected during onboarding today -- omit
            // rather than send a fake placeholder number.
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
    let provision =
      activeType === "business" ? await (provisionRef.current ?? Promise.resolve(null)) : null;

    // provisionBusinessTenant swallows its own errors and resolves null on
    // failure -- proceeding to the dashboard anyway used to leave the
    // account on an empty auto-provisioned workspace with none of what was
    // just entered, no error shown, nothing to retry. A business signup
    // with no created tenant is a hard stop, not a silent partial success.
    // provisionRef is memoized, so a plain retry would just re-await the
    // same failed (null) result -- clear it and try again for real.
    if (activeType === "business" && !provision) {
      provisionRef.current = null;
      setProvisionError(null);
      const retry = provisionBusinessTenant();
      provisionRef.current = retry;
      provision = await retry;
      if (!provision) {
        setProvisionError(
          "We couldn't create your workspace just now. Please try again -- nothing you entered has been lost.",
        );
        return;
      }
    }

    persistWorkspace(provision);

    if (paymentMode === "gateway") {
      await startPineLabsCheckout(provision?.tenantId);
      return;
    }

    setLocation("/dashboard");
  };

  const provisionAndCheckout = async () => {
    const provision =
      activeType === "business" ? await (provisionRef.current ?? Promise.resolve(null)) : null;
    persistWorkspace(provision);
    await startPineLabsCheckout(provision?.tenantId);
  };

  const next = () => {
    if (!canContinue) return;
    if (step === 5 && paymentMode === "gateway") {
      void provisionAndCheckout();
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
    <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-foreground/12 bg-background/95 backdrop-blur-xl">
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
            className="inline-flex items-center gap-2 rounded-full border border-foreground/16 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/35 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100dvh-80px)] w-full max-w-7xl px-4 py-6 sm:px-8">
        <TopStepper step={step} />

        <section className="relative mx-auto mt-6 min-h-[460px] max-w-6xl overflow-hidden rounded-[24px] border border-foreground/14 bg-card/72 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.28)] sm:p-7 lg:min-h-[520px]">
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
                  files={knowledgeFiles}
                  onFilesChange={setKnowledgeFiles}
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
                  fileCount={knowledgeFiles.length}
                  draftConsent={draftConsent}
                  termsConsent={termsConsent}
                  setDraftConsent={setDraftConsent}
                  setTermsConsent={setTermsConsent}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {step === 7 && provisionError && (
            <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {provisionError}
            </div>
          )}

          {step !== 6 && (
            <div className="relative mt-8 flex items-center justify-between border-t border-foreground/12 pt-5">
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-foreground/60 transition hover:bg-foreground/7 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
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
                    ? "bg-gradient-to-r from-accent to-primary text-foreground shadow-[0_16px_42px_rgba(22,191,211,0.22)] hover:brightness-110"
                    : "bg-foreground text-background hover:opacity-90",
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
        <motion.div
          className="relative flex h-24 w-24 items-center justify-center rounded-full"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.span
            className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.img
            src="/peacock-mark.png"
            alt=""
            className="relative h-16 w-16"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        <h1 className="mt-7 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Welcome, {firstName}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-foreground/60">
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
                  ? "border-primary/45 bg-primary/10 shadow-[0_18px_44px_rgba(85,231,255,0.08)]"
                  : "border-foreground/14 bg-card hover:border-foreground/28",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-foreground">{level.label}</div>
                  <p className="mt-2 text-sm leading-6 text-foreground/55">{level.body}</p>
                </div>
                {experience === level.id && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-background">
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
                  ? "border-primary/45 bg-primary/10"
                  : "border-border bg-foreground/[0.035] hover:border-border",
              )}
            >
              <div className="flex items-start justify-between">
                <span className="rounded-full border border-foreground/14 bg-foreground/[0.035] px-3 py-1 text-xs font-semibold text-foreground/55">
                  {type.id === "business" ? "Primary" : "Coming soon"}
                </span>
                {isSelected && (
                  <span className="rounded-full bg-primary p-1 text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
              <div className="mt-5 text-lg font-semibold">{type.label}</div>
              <p className="mt-2 text-sm leading-6 text-foreground/52">{type.body}</p>
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
            <div className="mb-3 text-sm font-semibold text-foreground/72">Choose focus areas</div>
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
                        ? "border-primary/45 bg-primary/10 text-foreground"
                        : "border-foreground/14 bg-card text-foreground/72 hover:border-foreground/28",
                    )}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold text-foreground/72">Preferred answer style</div>
            <div className="flex flex-wrap gap-2">
              {personalOutputStyles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => updateForm("personalOutputStyle", style)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition",
                    form.personalOutputStyle === style
                      ? "border-primary/45 bg-primary/12 text-primary"
                      : "border-foreground/14 bg-card text-foreground/60 hover:text-foreground",
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

  const insight = industryInsights[form.industry] ?? industryInsights.Other;

  return (
    <div className="mx-auto max-w-4xl">
      <StepHeader
        eyebrow="Business setup"
        title="Business profile"
        subtitle="Basic company context for the first agents."
      />
      <div className="mt-6 rounded-2xl border border-primary/18 bg-primary/8 px-4 py-3 text-sm leading-6 text-foreground/80">
        <span className="font-semibold text-primary">{form.industry}: </span>
        {insight.tip}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
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
        <div className="rounded-3xl border border-primary/18 bg-primary/8 p-4">
          <Globe2 className="mb-3 h-5 w-5 text-primary" />
          <div className="text-sm font-semibold">Smart Website Import</div>
          <p className="mt-2 text-sm leading-6 text-foreground/52">Import services, FAQs, about, and contacts.</p>
        </div>
        <Field label="Services" className="md:col-span-2">
          <textarea
            value={form.services}
            onChange={(event) => updateForm("services", event.target.value)}
            placeholder={insight.placeholder}
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
                  ? "border-primary/45 bg-primary/10"
                  : "border-border bg-foreground/[0.035] hover:border-border",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-base font-semibold">{goal.label}</span>
                {selected && (
                  <span className="rounded-full bg-primary p-1 text-primary-foreground">
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
  files,
  onFilesChange,
}: {
  workspaceType: WorkspaceType;
  form: SetupForm;
  updateForm: (key: keyof SetupForm, value: string | string[]) => void;
  recommendedAgents: string[];
  files: File[];
  onFilesChange: (files: File[]) => void;
}) {
  const addFakeFile = (name: string) => {
    updateForm("uploadedFiles", Array.from(new Set([...form.uploadedFiles, name])));
  };
  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const next = [...files];
    for (const file of Array.from(list)) {
      if (!next.some((existing) => existing.name === file.name && existing.size === file.size)) {
        next.push(file);
      }
    }
    onFilesChange(next);
  };
  const removeFile = (name: string) => {
    onFilesChange(files.filter((file) => file.name !== name));
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
            <div className="mb-3 text-sm font-semibold text-foreground/72">Available now</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {sourceOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => addFakeFile(option)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition",
                    form.uploadedFiles.includes(option)
                      ? "border-primary/45 bg-primary/10 text-foreground"
                      : "border-foreground/14 bg-card text-foreground/68 hover:border-foreground/28",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {!isPersonal && !isTeam && (
            <div>
              <div className="mb-3 text-sm font-semibold text-foreground/72">
                Common questions in {form.industry}
              </div>
              <div className="flex flex-wrap gap-2">
                {(industryInsights[form.industry] ?? industryInsights.Other).starterFaqs.map(
                  (question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() =>
                        updateForm(
                          "knowledgeNotes",
                          form.knowledgeNotes
                            ? `${form.knowledgeNotes}\n\nQ: ${question}\nA: `
                            : `Q: ${question}\nA: `,
                        )
                      }
                      className="rounded-full border border-foreground/14 bg-card px-3 py-1.5 text-left text-xs font-medium text-foreground/70 transition hover:border-primary/45 hover:text-foreground"
                    >
                      + {question}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          <Field label={contextLabel} hint="Optional. Skip if you do not have this yet.">
            <textarea
              value={form.knowledgeNotes}
              onChange={(event) => updateForm("knowledgeNotes", event.target.value)}
              placeholder={contextPlaceholder}
              className="jaabili-input min-h-24 resize-none"
            />
          </Field>

          <div>
            <div className="mb-3 text-sm font-semibold text-foreground/72">
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
                      ? "border-primary/50 bg-primary/12 text-primary"
                      : "border-border bg-foreground/[0.035] text-foreground/55 hover:text-foreground",
                  )}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <AgentCompactList agentIds={recommendedAgents} />
        </div>
        <div className="rounded-3xl border border-dashed border-foreground/18 bg-foreground/[0.03] p-5">
          <div className="text-lg font-semibold">Files</div>
          <p className="mt-2 text-sm leading-6 text-foreground/48">
            Optional now. PDFs, Word docs, or text files — uploaded when your
            workspace is created.
          </p>
          <label className="mt-5 flex cursor-pointer items-center justify-center rounded-2xl border border-border bg-foreground/[0.04] px-4 py-6 text-sm text-foreground/72 transition hover:bg-foreground/7 hover:text-foreground">
            <span>Choose files to upload</span>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(file.name)}
                    className="ml-2 shrink-0 text-foreground/50 hover:text-foreground"
                    aria-label={`Remove ${file.name}`}
                  >
                    ✕
                  </button>
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
      <div className="mx-auto mt-5 inline-flex rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
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
              disabled={!plan.available}
              onClick={() => plan.available && setSelectedPlan(plan.id)}
              className={cn(
                "relative rounded-3xl border p-5 text-left transition",
                !plan.available && "cursor-not-allowed opacity-55",
                selected
                  ? "border-primary/50 bg-primary/10"
                  : "border-border bg-foreground/[0.035] hover:border-border",
              )}
            >
              <span className="absolute right-5 top-5 rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-foreground/70">
                {plan.available ? plan.badge || "Available now" : "Coming soon"}
              </span>
              <div className="text-xl font-semibold">{plan.name}</div>
              <div className="mt-3 text-3xl font-semibold">{plan.price}</div>
              {plan.available && (
                <div className="mt-2 text-xs text-foreground/45">
                  Activates {includedCount}/{recommendedAgents.length} recommended agents
                </div>
              )}
              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-foreground/68">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {feature}
                  </div>
                ))}
              </div>
              <div
                className={cn(
                  "mt-6 rounded-2xl px-4 py-3 text-center text-sm font-semibold",
                  !plan.available
                    ? "bg-foreground/7 text-foreground/50"
                    : selected
                      ? "bg-foreground text-background"
                      : "bg-foreground/7 text-foreground",
                )}
              >
                {plan.available ? `Choose ${plan.name}` : "Notify me when ready"}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-3xl border border-foreground/14 bg-card p-5">
        <div className="text-sm font-semibold text-foreground/78">You're set up on the Free plan</div>
        <p className="mt-1 text-xs text-foreground/48">
          No payment needed — Nova is free while it's the only agent live. Paid
          tiers unlock automatically once more agents ship.
        </p>
      </div>
    </div>
  );
}

function BuildStep({ buildIndex }: { buildIndex: number }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const icon = mounted && resolvedTheme === "light" ? iconLight : iconDark;

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center py-14 text-center">
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-card">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-secondary" />
        <img src={icon} alt="Jaabili" className="h-14 w-auto" />
      </div>
      <h1 className="text-4xl font-semibold tracking-tight">Setting things up...</h1>
      <p className="mt-3 text-sm text-foreground/48">This takes a few seconds — nothing goes live yet.</p>
      <div className="mt-10 w-full max-w-lg space-y-3 text-left">
        {buildSteps.map((item, index) => (
          <div
            key={item}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm",
              index <= buildIndex
                ? "border-primary/20 bg-primary/10 text-foreground"
                : "border-border bg-foreground/[0.025] text-foreground/35",
            )}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/8">
              {index <= buildIndex ? <Check className="h-3.5 w-3.5 text-primary" /> : index + 1}
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
                      ? "border border-primary/50 bg-primary/14 text-primary"
                      : active
                        ? "border border-accent/55 bg-accent/14 text-accent"
                        : "border border-foreground/14 bg-card text-foreground/42",
                  )}
                >
                  {complete ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                {index < stepNav.length - 1 && (
                  <span
                    className={cn(
                      "ml-2 hidden h-px flex-1 rounded-full md:block",
                      index < step
                        ? "bg-primary/55"
                        : active
                          ? "bg-accent/45"
                          : "bg-foreground/12",
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "w-full truncate text-center text-[10px] font-medium sm:text-[11px]",
                  active ? "text-accent" : complete ? "text-primary/86" : "text-foreground/42",
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
  fileCount,
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
  fileCount: number;
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
        title="Review, then approve"
        subtitle="Nothing goes live until you say so — you can review and publish from your dashboard any time."
      />
      <div className="mt-6 space-y-3">
        <ReviewRow
          icon={Building2}
          title={workspaceType === "business" ? "Business Profile" : "Workspace Profile"}
          meta={`${profileTitle} - ${profileMeta}`}
        />
        <ReviewRow
          icon={Sparkles}
          title="How it talks to people"
          meta={`${form.tone} - ${workspaceType === "business" ? form.leadChannel : "Helpful"} - Guided`}
        />
        <ReviewRow
          icon={FileText}
          title={workspaceType === "business" ? "Services & FAQs" : "Knowledge"}
          meta={`${selectedGoalLabels.length || agentIds.length} goals - ${fileCount} file${fileCount === 1 ? "" : "s"} attached`}
        />
      </div>

      <div className="mt-7 rounded-[26px] border border-foreground/55 bg-gradient-to-r from-[#246c7a] via-[#21415e] to-[#6f668f] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-2xl font-semibold text-primary">{plan.name} Plan</div>
            <div className="mt-2 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              {plan.price.replace("/month", "")}
              <span className="text-base font-medium text-foreground/70"> /month</span>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-foreground/78 sm:grid-cols-2">
            {plan.features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {feature}
              </div>
            ))}
          </div>
        </div>
        <span className="mt-5 inline-flex rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
          14-day free trial
        </span>
      </div>

      <div className="mt-7 space-y-4">
        <ConsentCheck
          checked={draftConsent}
          onChange={setDraftConsent}
          label="I've reviewed what my agent will do — it stays off until I approve it going live."
        />
        <ConsentCheck
          checked={termsConsent}
          onChange={setTermsConsent}
          label={
            <>
              I approve setting this up, under the{" "}
              <Link href="/terms" className="text-primary underline underline-offset-4">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary underline underline-offset-4">
                Privacy Policy
              </Link>
              .
            </>
          }
        />
      </div>

      <div className="mt-8 rounded-2xl border border-primary/16 bg-primary/8 px-4 py-3 text-center text-sm text-foreground/72">
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
    <div className="flex items-center gap-4 rounded-3xl border border-foreground/45 bg-card p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card text-accent">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-lg font-semibold text-foreground">{title}</div>
        <p className="mt-1 truncate text-sm font-medium text-foreground/68">{meta}</p>
      </div>
      <button
        type="button"
        className="hidden items-center gap-3 rounded-full px-3 py-2 text-sm font-semibold text-accent transition hover:bg-foreground/7 sm:inline-flex"
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
      className="flex w-full items-start gap-3 text-left text-sm text-foreground/82"
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
          checked
            ? "border-primary bg-primary text-background"
            : "border-foreground/35 bg-card",
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
    <div className="mt-6 rounded-3xl border border-primary/18 bg-primary/8 p-5">
      <div className="text-sm font-semibold text-primary">Recommended AI workspace</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {agentIds.map((id) => {
          const agent = agentCatalog[id as keyof typeof agentCatalog];
          if (!agent) return null;
          return (
            <span key={id} className="rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-xs text-foreground/72">
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
    <div className="rounded-2xl border border-foreground/12 bg-foreground/[0.04] p-4">
      <div className="mb-3 text-sm font-semibold text-foreground/72">Agents prepared</div>
      <div className="flex flex-wrap gap-2">
        {agentIds.map((id) => {
          const agent = agentCatalog[id as keyof typeof agentCatalog];
          if (!agent) return null;
          return (
            <span
              key={id}
              className="rounded-full border border-primary/18 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary"
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
    <div className="mt-6 rounded-3xl border border-border bg-foreground/[0.04] p-5">
      <div className="mb-4 text-sm font-semibold text-foreground/72">AI Creates Agents</div>
      <div className="grid gap-3 md:grid-cols-2">
        {agentIds.map((id) => {
          const agent = agentCatalog[id as keyof typeof agentCatalog];
          if (!agent) return null;
          const Icon = agent.icon;
          return (
            <div key={id} className="rounded-2xl bg-foreground/[0.035] p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-semibold">{agent.name}</div>
                  <p className="mt-1 text-sm leading-5 text-foreground/48">{agent.purpose}</p>
                  <span className="mt-3 inline-flex rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
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
      <p className="text-sm font-medium text-primary">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-foreground/52">{subtitle}</p>
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
      <span className="mb-2 block text-sm font-semibold text-foreground/72">{label}</span>
      {children}
      {hint && <span className="mt-2 block text-xs leading-5 text-foreground/38">{hint}</span>}
    </label>
  );
}
