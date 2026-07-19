import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CircleHelp,
  ChevronDown,
  FileText,
  Home,
  LogOut,
  MessageCircle,
  Settings,
  Users,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@assets/jaabili-logo-dark.png";
import { useAuth } from "@/lib/auth-context";
import { readOnboarding } from "@/lib/onboarding";
import { AGENT_CATALOG, PLAN_LIMITS, planUnlocksAgent, type ProductAgent } from "@/lib/agent-catalog";
import { getNovaAgentStatus } from "@/components/agents/NovaWorkspacePanel";
import { getMarketingAgentStatus } from "@/pages/marketing-agent";
import { listMyWorkspaces, type AgentTenant } from "@/lib/website-sales-agent-api";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

// Shared across every agent page: one "current client" concept for the
// whole workspace, not a per-agent selection.
const TENANT_STORAGE_KEY = "jaabili.websiteSales.tenantId";
const TOUR_STORAGE_PREFIX = "jaabili.dashboard.tourSeen.";

const TOUR_STEPS = [
  {
    title: "This is your home base",
    body: "Each agent you picked shows up under \"My agents\" on the left. You'll spend most of your time inside Nova, your website sales agent.",
  },
  {
    title: "Nova asks, you answer",
    body: "Open Nova and it asks you one question at a time about your business — no forms to fill in. Don't have something on hand? Skip it and come back later.",
  },
  {
    title: "Test before anyone sees it",
    body: "Once Nova has enough to work with, use the visitor simulator inside its workspace to ask it real buyer questions yourself, before it ever talks to a real visitor.",
  },
  {
    title: "You approve before it goes live",
    body: "Nothing reaches your website until you review Nova's plan and approve the launch. You're always in control of when it starts.",
  },
] as const;

function hasSeenTour(uid: string | undefined): boolean {
  if (!uid || typeof window === "undefined") return true;
  return window.localStorage.getItem(`${TOUR_STORAGE_PREFIX}${uid}`) === "1";
}

function markTourSeen(uid: string | undefined): void {
  if (!uid || typeof window === "undefined") return;
  window.localStorage.setItem(`${TOUR_STORAGE_PREFIX}${uid}`, "1");
}

const comingSoonNavItems = [
  { icon: MessageCircle, label: "Conversations" },
  { icon: Users, label: "Leads" },
  { icon: BarChart3, label: "Analytics" },
  { icon: FileText, label: "Knowledge Base" },
  { icon: Workflow, label: "Integrations" },
];

type AgentRailStatus = { percent: number; isLive: boolean };

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const onboarding = useMemo(() => readOnboarding(user?.uid), [user?.uid]);
  const selectedPlan = (onboarding?.plan ?? "free") as keyof typeof PLAN_LIMITS;
  const selectedAgentIds =
    onboarding?.selectedAgents && onboarding.selectedAgents.length > 0
      ? onboarding.selectedAgents
      : ["website-sales"];
  const selectedAgents = AGENT_CATALOG.filter((agent) => selectedAgentIds.includes(agent.id));
  const availableAgents = selectedAgents.length > 0 ? selectedAgents : [AGENT_CATALOG[0]];
  const plan = PLAN_LIMITS[selectedPlan] ?? PLAN_LIMITS.free;

  const [activeView, setActiveView] = useState<"home" | string>("home");
  const [tenants, setTenants] = useState<AgentTenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState(
    () => window.localStorage.getItem(TENANT_STORAGE_KEY) ?? "jaabili-default",
  );
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentRailStatus>>({});
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    if (!hasSeenTour(user?.uid)) setIsTourOpen(true);
  }, [user?.uid]);

  useEffect(() => {
    listMyWorkspaces().then(setTenants).catch(() => setTenants([]));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(TENANT_STORAGE_KEY, selectedTenantId);
  }, [selectedTenantId]);

  useEffect(() => {
    let active = true;
    availableAgents.forEach((agent) => {
      const fetchStatus =
        agent.panel === "website-sales"
          ? getNovaAgentStatus
          : agent.panel === "marketing"
            ? getMarketingAgentStatus
            : null;
      if (!fetchStatus) return;
      fetchStatus(selectedTenantId).then((status) => {
        if (active) setAgentStatuses((current) => ({ ...current, [agent.id]: status }));
      });
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTenantId, availableAgentIds(availableAgents)]);

  const fullName = user?.displayName?.trim() || user?.email?.split("@")[0] || "there";
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
  const activeAgent = availableAgents.find((agent) => agent.id === activeView) ?? null;
  const selectedTenant = tenants.find((tenant) => tenant.id === selectedTenantId) ?? tenants[0] ?? null;

  // Setup is one continuous conversation with Nova, not four separate
  // checkboxes a client fills in manually -- these read off the same
  // percent Nova's own wizard already tracks (agentStatuses), so this list
  // reflects what's actually done instead of always showing "not done."
  const websiteSetupPercent = websiteAgent ? (agentStatuses[websiteAgent.id]?.percent ?? 0) : 0;
  const websiteSetupLive = websiteAgent ? (agentStatuses[websiteAgent.id]?.isLive ?? false) : false;
  const nextSteps = [
    { label: "Select plan and agents", done: true, href: "/onboarding" },
    {
      label: "Answer Nova's setup questions",
      done: websiteSetupPercent >= 50,
      href: websiteAgent?.href ?? "/onboarding",
    },
    {
      label: "Generate the activation analysis",
      done: websiteSetupPercent >= 100,
      href: websiteAgent?.href ?? "/onboarding",
    },
    { label: "Approve launch and go live", done: websiteSetupLive, href: websiteAgent?.href ?? "/onboarding" },
  ];

  return (
    <div className="flex min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border md:flex">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <img src={logo} alt="Jaabili" className="h-8 w-auto" />
          <span className="text-sm font-medium text-foreground/80">Workspace</span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveView("home")}
            className={cn(
              "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
              activeView === "home"
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Home className="h-4 w-4" />
            Home
          </button>
          <button
            type="button"
            onClick={() => setActiveView("settings")}
            className={cn(
              "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
              activeView === "settings"
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>

          <div className="mt-5 mb-1.5 px-2.5 text-xs font-medium text-muted-foreground/70">
            My agents
          </div>
          {AGENT_CATALOG.map((agent) => {
            const Icon = agent.icon;
            const status = agentStatuses[agent.id];
            const inDevelopment = agent.status === "locked";
            const planLocked = !inDevelopment && !planUnlocksAgent(selectedPlan, agent.plan);
            const rowClass = cn(
              "flex h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
              activeView === agent.id
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              (inDevelopment || planLocked) && "opacity-50",
            );
            const content = (
              <>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-left">{agent.name}</span>
                {status?.isLive ? (
                  <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    Live
                  </span>
                ) : status && agent.panel ? (
                  <span className="shrink-0 text-[10px] text-muted-foreground/70">{status.percent}%</span>
                ) : inDevelopment ? (
                  <span className="shrink-0 text-[10px] text-muted-foreground/70">Soon</span>
                ) : planLocked ? (
                  <span className="shrink-0 text-[10px] text-muted-foreground/70">Locked</span>
                ) : null}
              </>
            );

            // Nova has one real workspace, the full page at agent.href --
            // this used to also render a second, lighter-weight copy of the
            // same workspace inline here, so the UI looked different
            // depending on which of the two ways you got to it. Every
            // agent link now goes to its one real workspace. Plan-locked
            // agents route to Settings (the real, honest "how to upgrade"
            // story) instead of their workspace page, which has no handling
            // for the plan_upgrade_required error and would just break
            // silently for an account that isn't unlocked yet.
            if (planLocked) {
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setActiveView("settings")}
                  className={rowClass}
                >
                  {content}
                </button>
              );
            }
            if (!inDevelopment && agent.href) {
              return (
                <Link key={agent.id} href={agent.href} className={rowClass}>
                  {content}
                </Link>
              );
            }
            return (
              <button key={agent.id} type="button" disabled className={rowClass}>
                {content}
              </button>
            );
          })}

          <div className="mt-5 mb-1.5 px-2.5 text-xs font-medium text-muted-foreground/70">
            Coming soon
          </div>
          {comingSoonNavItems.map((item) => (
            <div
              key={item.label}
              className="flex h-9 w-full cursor-default items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground/50"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{fullName}</div>
              <div className="truncate text-xs text-muted-foreground">{plan.label} plan</div>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              aria-label="Sign out"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border px-5 sm:px-8">
          <h1 className="shrink-0 text-sm font-medium text-foreground/80">
            {activeView === "home" ? "Home" : activeView === "settings" ? "Settings" : activeAgent?.name ?? "Home"}
          </h1>
          {activeView === "home" || activeView === "settings" ? (
            <div className="hidden min-w-0 flex-1 lg:flex" />
          ) : (
            <TenantSwitcher
              tenants={tenants}
              selectedTenant={selectedTenant}
              onChange={setSelectedTenantId}
            />
          )}
          <button
            type="button"
            onClick={() => setIsTourOpen(true)}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <CircleHelp className="h-4 w-4" />
            <span className="hidden sm:inline">How this works</span>
          </button>
        </header>

        {activeView === "home" ? (
          <section className="min-h-0 flex-1 overflow-y-auto px-5 py-10 sm:px-8">
            <div className="mx-auto max-w-5xl space-y-12">
              <div>
                <p className="text-sm text-muted-foreground">Welcome back, {firstName}</p>
                <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="text-3xl font-semibold tracking-tight">
                    Set up the agents you selected
                  </h2>
                  {websiteAgent && (
                    <Link
                      href={websiteAgent.href}
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                      Continue setup
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-8 border-t border-border pt-5">
                  <Stat label="Plan" value={plan.label} />
                  <Stat label="Agents" value={`${availableAgents.length} of ${plan.agents}`} />
                  <Stat label="Conversations included" value={plan.conversations} />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-end justify-between">
                  <h3 className="text-base font-semibold">Agents</h3>
                  <button
                    type="button"
                    onClick={() => setActiveView("settings")}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Manage plan
                  </button>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  Every agent, what it does, and whether your plan unlocks it yet.
                </p>
                <div className="flex flex-wrap gap-3">
                  {AGENT_CATALOG.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      currentPlan={selectedPlan}
                      onOpenSettings={() => setActiveView("settings")}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-1 text-base font-semibold">Next steps</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Complete these before sending real traffic to Nova.
                </p>
                <div className="divide-y divide-border rounded-xl border border-border">
                  {nextSteps.map((step, index) => (
                    <NextStepRow
                      key={step.label}
                      {...step}
                      // These steps all happen inside the same Nova
                      // workspace conversation, not separate destinations --
                      // making every unfinished row clickable made it look
                      // like each one led somewhere different when they all
                      // opened the identical page. Only the next actual
                      // thing to do is a link; steps after it are just
                      // status, not yet reachable.
                      isNext={!step.done && nextSteps.slice(0, index).every((s) => s.done)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : activeView === "settings" ? (
          <section className="min-h-0 flex-1 overflow-y-auto px-4 py-8">
            <SettingsPanel />
          </section>
        ) : null}
      </main>

      <AnimatePresence>
        {isTourOpen && (
          <WalkthroughModal
            onClose={() => {
              markTourSeen(user?.uid);
              setIsTourOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function WalkthroughModal({ onClose }: { onClose: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const step = TOUR_STEPS[stepIndex];
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  const goNext = () => {
    if (isLast) return onClose();
    setDirection(1);
    setStepIndex((index) => index + 1);
  };
  const goBack = () => {
    if (stepIndex === 0) return;
    setDirection(-1);
    setStepIndex((index) => index - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="mb-5 flex gap-1.5">
          {TOUR_STEPS.map((_, index) => (
            <span key={index} className="h-1 flex-1 overflow-hidden rounded-full bg-border">
              <motion.span
                className="block h-full bg-primary"
                initial={false}
                animate={{ width: index <= stepIndex ? "100%" : "0%" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </span>
          ))}
        </div>

        <div className="relative min-h-[7rem] overflow-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={stepIndex}
              custom={direction}
              initial={{ opacity: 0, x: 24 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 * direction }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-between">
          {stepIndex === 0 ? (
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
          ) : (
            <button
              type="button"
              onClick={goBack}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            {isLast ? "Got it" : "Next"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function availableAgentIds(agents: ProductAgent[]): string {
  return agents.map((agent) => agent.id).join(",");
}

function TenantSwitcher({
  tenants,
  selectedTenant,
  onChange,
}: {
  tenants: AgentTenant[];
  selectedTenant: AgentTenant | null;
  onChange: (tenantId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-border bg-foreground/[0.03] px-3 py-2 text-sm text-foreground/75 hover:bg-foreground/8"
      >
        {selectedTenant?.name ?? "Select business"}
        <ChevronDown className="size-3.5" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-56 rounded-2xl border border-border bg-card p-1.5 shadow-xl">
          {tenants.map((tenant) => (
            <button
              key={tenant.id}
              type="button"
              onClick={() => {
                onChange(tenant.id);
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-foreground/8"
            >
              <span className="truncate">{tenant.name}</span>
              {tenant.id === selectedTenant?.id && <Check className="size-3.5 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function NextStepRow({
  label,
  done,
  href,
  isNext,
}: {
  label: string;
  done: boolean;
  href: string;
  isNext: boolean;
}) {
  const content = (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-transparent",
        )}
      >
        <Check className="h-3 w-3" />
      </div>
      <span
        className={cn(
          "flex-1 text-sm",
          done ? "text-muted-foreground line-through" : isNext ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      {isNext && <ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
    </div>
  );

  if (!isNext) {
    return content;
  }

  return (
    <Link href={href} className="block hover:bg-muted/60">
      {content}
    </Link>
  );
}

function AgentCard({
  agent,
  currentPlan,
  onOpenSettings,
}: {
  agent: ProductAgent;
  currentPlan: keyof typeof PLAN_LIMITS;
  onOpenSettings: () => void;
}) {
  // agent.illustrationSrc is a large, moody hero-style image (built for
  // marketing pages) -- cropped into a 36px card icon with object-cover it
  // just shows a blurry corner of gradient, unrecognizable as an icon. The
  // crisp vector marks in agent-icons.tsx were built for exactly this slot.
  const Icon = agent.icon;
  const inDevelopment = agent.status === "locked";
  const planLocked = !inDevelopment && !planUnlocksAgent(currentPlan, agent.plan);

  return (
    <div className="flex w-full max-w-xs flex-col gap-3 rounded-xl border border-border p-4">
      <div className="flex items-center gap-2.5">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", agent.tint)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold">{agent.name}</span>
            {inDevelopment && (
              <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                In development
              </span>
            )}
          </div>
          <div className="truncate text-xs text-muted-foreground">{agent.category}</div>
        </div>
      </div>
      <p className="flex-1 text-sm leading-6 text-muted-foreground">{agent.description}</p>
      {planLocked && (
        <p className="text-xs text-muted-foreground">
          Needs the {PLAN_LIMITS[agent.plan].label} plan or higher.
        </p>
      )}
      {inDevelopment ? (
        <button
          type="button"
          disabled
          className="inline-flex h-9 w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground"
        >
          Not built yet
        </button>
      ) : planLocked ? (
        // Its workspace page has no handling for the plan_upgrade_required
        // error and would just break silently for an account that isn't
        // unlocked yet -- Settings has the real, honest upgrade story.
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          Upgrade to unlock
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      ) : (
        <Link
          href={agent.href}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-foreground text-sm font-medium text-background transition-colors hover:opacity-90"
        >
          Open agent
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
