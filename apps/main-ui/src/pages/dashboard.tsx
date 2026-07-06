import { useMemo } from "react";
import { Link } from "wouter";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  HelpCircle,
  Home,
  LayoutGrid,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@assets/jaabili-logo-dark.png";
import { useAuth } from "@/lib/auth-context";
import { readOnboarding } from "@/lib/onboarding";

type AgentStatus = "live" | "setup" | "locked";

interface ProductAgent {
  id: string;
  name: string;
  category: string;
  description: string;
  status: AgentStatus;
  href: string;
  channels: string[];
  jobs: string[];
  plan: "free" | "basic" | "pro";
}

const PLAN_LIMITS = {
  free: { label: "Free", agents: 1, conversations: "500/mo" },
  basic: { label: "Basic", agents: 3, conversations: "5,000/mo" },
  pro: { label: "Pro", agents: 15, conversations: "50,000/mo" },
};

const AGENT_CATALOG: ProductAgent[] = [
  {
    id: "website-sales",
    name: "Nova",
    category: "Sales",
    description:
      "Your website sales agent — turns website visitors into qualified leads, captures requirements, scores intent, and routes hot opportunities to your team.",
    status: "setup",
    href: "/dashboard/agents/website-sales",
    channels: ["Website", "Email alerts", "WhatsApp handoff"],
    jobs: [
      "Ask visitor qualification questions",
      "Answer from approved company sources",
      "Capture name, phone, email, budget, timeline",
      "Create lead grade and handoff action",
    ],
    plan: "free",
  },
  {
    id: "whatsapp-capture",
    name: "WhatsApp Sales Agent",
    category: "Messaging",
    description:
      "Continues sales conversations on WhatsApp, handles FAQs, and keeps follow-ups moving after website lead capture.",
    status: "setup",
    href: "/contact",
    channels: ["WhatsApp", "Lead handoff"],
    jobs: ["Reply to inbound inquiries", "Send approved offers", "Escalate urgent leads"],
    plan: "basic",
  },
  {
    id: "follow-up",
    name: "Lead Follow-Up Agent",
    category: "Sales ops",
    description:
      "Follows up with warm leads, reminds the team, and prevents high-intent buyers from going cold.",
    status: "setup",
    href: "/contact",
    channels: ["Email", "WhatsApp", "CRM export"],
    jobs: ["Nurture warm leads", "Schedule reminders", "Flag stalled deals"],
    plan: "basic",
  },
  {
    id: "support",
    name: "Customer Support Agent",
    category: "Support",
    description:
      "Answers common questions, detects unhappy customers, and escalates sensitive cases to a human.",
    status: "locked",
    href: "/contact",
    channels: ["Website", "Email", "WhatsApp"],
    jobs: ["Resolve FAQs", "Create support cases", "Track unresolved issues"],
    plan: "pro",
  },
  {
    id: "ops-summary",
    name: "Operations Summary Agent",
    category: "Management",
    description:
      "Summarizes daily activity, source gaps, hot leads, conversion issues, and recommended improvements.",
    status: "locked",
    href: "/contact",
    channels: ["Dashboard", "Email report"],
    jobs: ["Daily report", "Quality audit", "Knowledge gap list"],
    plan: "pro",
  },
];

const navItems = [
  { icon: Home, label: "Home", active: true },
  { icon: Bot, label: "My Agents", active: true },
  { icon: MessageCircle, label: "Conversations" },
  { icon: Users, label: "Leads" },
  { icon: BarChart3, label: "Analytics" },
  { icon: FileText, label: "Knowledge Base" },
  { icon: Workflow, label: "Integrations" },
  { icon: Settings, label: "Settings" },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const onboarding = useMemo(() => readOnboarding(), []);
  const selectedPlan = (onboarding?.plan ?? "free") as keyof typeof PLAN_LIMITS;
  const selectedAgentIds =
    onboarding?.selectedAgents && onboarding.selectedAgents.length > 0
      ? onboarding.selectedAgents
      : ["website-sales"];
  const selectedAgents = AGENT_CATALOG.filter((agent) =>
    selectedAgentIds.includes(agent.id),
  );
  const availableAgents = selectedAgents.length > 0 ? selectedAgents : [AGENT_CATALOG[0]];
  const plan = PLAN_LIMITS[selectedPlan] ?? PLAN_LIMITS.free;
  const selectedChannels =
    onboarding?.channels && onboarding.channels.length > 0
      ? onboarding.channels
      : ["web"];

  const fullName =
    user?.displayName?.trim() || user?.email?.split("@")[0] || "there";
  const firstName = fullName.split(" ")[0];
  const initials =
    fullName
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "JA";

  const websiteAgent = availableAgents.find((agent) => agent.id === "website-sales");

  return (
    <div className="flex min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-20 items-center gap-3 px-6">
          <img src={logo} alt="Jaabili" className="h-11 w-auto" />
          <div>
            <div className="text-lg font-semibold">Jaabili</div>
            <div className="text-xs text-foreground/42">Agent workspace</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={cn(
                "flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-medium transition",
                item.active
                  ? "bg-foreground text-background"
                  : "text-foreground/58 hover:bg-foreground/7 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-3xl bg-foreground/[0.04] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{fullName}</div>
                <div className="truncate text-xs text-foreground/45">{plan.label} plan</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-2xl text-xs text-foreground/55 hover:bg-foreground/7 hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <LayoutGrid className="h-5 w-5 text-primary md:hidden" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">Business Agent Dashboard</div>
              <div className="hidden text-xs text-foreground/42 sm:block">
                Set up, launch, and monitor every selected agent.
              </div>
            </div>
          </div>
          <div className="hidden min-w-0 flex-1 justify-center px-8 lg:flex">
            <div className="flex h-10 w-full max-w-xl items-center gap-2 rounded-full border border-border bg-foreground/5 px-4">
              <Search className="h-4 w-4 text-foreground/35" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/35"
                placeholder="Search leads, sources, agents, conversations"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/pricing"
              className="hidden rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary sm:inline-flex"
            >
              {plan.label}
            </Link>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-foreground/7">
              <Bell className="h-5 w-5 text-foreground/65" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-secondary" />
            </button>
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-5 pb-24">
            <section className="rounded-[2rem] border border-border bg-card p-5 sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Welcome, {firstName}
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Set up the agents you selected.
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/58">
                    Your workspace is based on the {plan.label} plan. Start with the
                    selected agents below, add business data, and approve each agent
                    only after the activation analysis is ready.
                  </p>
                </div>
                {websiteAgent && (
                  <Link
                    href={websiteAgent.href}
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background hover:opacity-90"
                  >
                    Continue setup
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MetricTile label="Plan" value={plan.label} />
                <MetricTile label="Selected agents" value={`${availableAgents.length}/${plan.agents}`} />
                <MetricTile label="Conversations" value={plan.conversations} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedChannels.map((channel) => (
                  <span
                    key={channel}
                    className="rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-xs capitalize text-foreground/50"
                  >
                    {channel.replace("-", " ")}
                  </span>
                ))}
              </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-[1fr_0.72fr]">
              <section className="rounded-[2rem] border border-border bg-card p-5 sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">My agents</h2>
                  <p className="mt-1 text-sm text-foreground/45">
                    Only the agents selected during onboarding are shown here.
                  </p>
                </div>
                <Link
                  href="/onboarding"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm text-foreground/70 hover:bg-foreground/7 hover:text-foreground"
                >
                  Change selection
                </Link>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {availableAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} isPrimary={agent.id === "website-sales"} />
                ))}
              </div>
              </section>

              <section className="rounded-[2rem] border border-border bg-card p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Guided setup</h2>
                    <p className="mt-1 text-sm text-foreground/45">
                      Follow these steps before sending real traffic.
                    </p>
                  </div>
                  <Clock3 className="h-6 w-6 text-secondary" />
                </div>
                <div className="mb-5 space-y-3">
                  <ReadinessItem done label="Select plan and agents" />
                  <ReadinessItem label="Add company profile" />
                  <ReadinessItem label="Add website, FAQ, pricing, policy" />
                  <ReadinessItem label="Generate activation analysis" />
                  <ReadinessItem label="Approve launch consent" />
                </div>
                <div className="space-y-3">
                  <ActionRow title="Open Nova" detail="Start company onboarding and add approved business sources." href="/dashboard/agents/website-sales" />
                  <ActionRow title="Add notification recipients" detail="Set email and WhatsApp owner contacts for hot lead alerts." href="/dashboard/agents/website-sales" />
                  <ActionRow title="Test visitor questions" detail="Use realistic buyer questions and verify lead capture, audit, and handoff." href="/dashboard/agents/website-sales" />
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
      <DashboardAssistant />
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-border bg-foreground/[0.04] p-4">
      <div className="text-xs text-foreground/42">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function ReadinessItem({ label, done = false }: { label: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-foreground/[0.04] px-3 py-2.5">
      <CheckCircle2
        className={cn("h-4 w-4", done ? "text-primary" : "text-foreground/25")}
      />
      <span className={cn("text-sm", done ? "text-foreground/80" : "text-foreground/48")}>
        {label}
      </span>
    </div>
  );
}

function AgentCard({ agent, isPrimary }: { agent: ProductAgent; isPrimary: boolean }) {
  return (
    <div
      className={cn(
        "flex min-h-[23rem] flex-col rounded-[1.75rem] border p-5",
        isPrimary
          ? "border-primary/30 bg-primary/10"
          : "border-border bg-foreground/[0.04]",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/8">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            agent.status === "locked"
              ? "bg-foreground/8 text-foreground/38"
              : "bg-primary/12 text-primary",
          )}
        >
          {agent.status === "locked" ? "Upgrade" : "Ready to set up"}
        </span>
      </div>
      <div className="mt-5">
        <div className="text-xs uppercase tracking-[0.16em] text-foreground/35">
          {agent.category}
        </div>
        <h3 className="mt-2 text-xl font-semibold">{agent.name}</h3>
        <p className="mt-3 text-sm leading-6 text-foreground/55">{agent.description}</p>
      </div>
      <div className="mt-5 space-y-2">
        {agent.jobs.slice(0, 3).map((job) => (
          <div key={job} className="flex gap-2 text-sm text-foreground/58">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {job}
          </div>
        ))}
      </div>
      <div className="mt-auto pt-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {agent.channels.map((channel) => (
            <span
              key={channel}
              className="rounded-full border border-border bg-foreground/5 px-2.5 py-1 text-xs text-foreground/48"
            >
              {channel}
            </span>
          ))}
        </div>
        <Link
          href={agent.href}
          className={cn(
            "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold",
            agent.status === "locked"
              ? "border border-border text-foreground/58 hover:bg-foreground/7"
              : "bg-foreground text-background hover:opacity-90",
          )}
        >
          {agent.status === "locked" ? "Discuss upgrade" : "Open agent"}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function ActionRow({
  title,
  detail,
  href,
}: {
  title: string;
  detail: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-foreground/[0.04] p-4 hover:border-primary/35"
    >
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-foreground/45">{detail}</span>
      </span>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-foreground/45" />
    </Link>
  );
}

function DashboardAssistant() {
  return (
    <button
      type="button"
      aria-label="Open Jaabili setup assistant"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-primary/35 bg-card text-primary shadow-[0_0_30px_rgba(16,184,166,0.28)] transition hover:scale-105 hover:bg-primary/15"
      title="Setup assistant"
    >
      <HelpCircle className="h-6 w-6" />
      <span className="absolute -left-40 hidden rounded-2xl border border-border bg-card px-3 py-2 text-xs text-foreground/70 shadow-xl lg:block">
        Need help setting up?
      </span>
    </button>
  );
}
