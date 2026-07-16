import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  FileText,
  Home,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  Users,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@assets/jaabili-logo-dark.png";
import { useAuth } from "@/lib/auth-context";
import { readOnboarding } from "@/lib/onboarding";
import { AGENT_CATALOG, PLAN_LIMITS, type ProductAgent } from "@/lib/agent-catalog";
import { getNovaAgentStatus, NovaWorkspacePanel } from "@/components/agents/NovaWorkspacePanel";
import { getMarketingAgentStatus, MarketingWorkspacePanel } from "@/pages/marketing-agent";
import { WhatsAppWorkspacePanel } from "@/pages/whatsapp-agent";
import { listAgentTenants, type AgentTenant } from "@/lib/website-sales-agent-api";

// Shared across every agent page: one "current client" concept for the
// whole workspace, not a per-agent selection.
const TENANT_STORAGE_KEY = "jaabili.websiteSales.tenantId";

const comingSoonNavItems = [
  { icon: MessageCircle, label: "Conversations" },
  { icon: Users, label: "Leads" },
  { icon: BarChart3, label: "Analytics" },
  { icon: FileText, label: "Knowledge Base" },
  { icon: Workflow, label: "Integrations" },
  { icon: Settings, label: "Settings" },
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

  useEffect(() => {
    listAgentTenants().then(setTenants).catch(() => setTenants([]));
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

  const nextSteps = [
    { label: "Select plan and agents", done: true, href: "/onboarding" },
    { label: "Add company profile", done: false, href: websiteAgent?.href ?? "/onboarding" },
    { label: "Add website, FAQs, and pricing", done: false, href: websiteAgent?.href ?? "/onboarding" },
    { label: "Generate the activation analysis", done: false, href: websiteAgent?.href ?? "/onboarding" },
    { label: "Approve launch and go live", done: false, href: websiteAgent?.href ?? "/onboarding" },
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

          <div className="mt-5 mb-1.5 px-2.5 text-xs font-medium text-muted-foreground/70">
            My agents
          </div>
          {availableAgents.map((agent) => {
            const Icon = agent.icon;
            const status = agentStatuses[agent.id];
            return (
              <button
                key={agent.id}
                type="button"
                disabled={agent.status === "locked"}
                onClick={() => agent.panel && setActiveView(agent.id)}
                className={cn(
                  "flex h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
                  activeView === agent.id
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  agent.status === "locked" && "cursor-not-allowed opacity-50",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-left">{agent.name}</span>
                {status?.isLive ? (
                  <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    Live
                  </span>
                ) : status && agent.panel ? (
                  <span className="shrink-0 text-[10px] text-muted-foreground/70">{status.percent}%</span>
                ) : null}
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
            {activeView === "home" ? "Home" : activeAgent?.name ?? "Home"}
          </h1>
          {activeView === "home" ? (
            <div className="hidden min-w-0 flex-1 justify-center lg:flex">
              <div className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-muted/60 px-3">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Search"
                />
              </div>
            </div>
          ) : (
            <TenantSwitcher
              tenants={tenants}
              selectedTenant={selectedTenant}
              onChange={setSelectedTenantId}
            />
          )}
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
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
                <div className="mb-4 flex items-end justify-between">
                  <h3 className="text-base font-semibold">My agents</h3>
                  <Link href="/onboarding" className="text-sm text-muted-foreground hover:text-foreground">
                    Change selection
                  </Link>
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onOpenPanel={agent.panel ? () => setActiveView(agent.id) : undefined}
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
                  {nextSteps.map((step) => (
                    <NextStepRow key={step.label} {...step} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="min-h-0 flex-1 overflow-y-auto px-4 py-8">
            {activeAgent?.panel === "website-sales" && (
              <NovaWorkspacePanel tenantId={selectedTenantId} />
            )}
            {activeAgent?.panel === "marketing" && (
              <MarketingWorkspacePanel tenantId={selectedTenantId} />
            )}
            {activeAgent?.panel === "whatsapp" && (
              <WhatsAppWorkspacePanel
                tenantId={selectedTenantId}
                tenant={tenants.find((tenant) => tenant.id === selectedTenantId) ?? null}
                onTenantUpdated={setTenants}
              />
            )}
          </section>
        )}
      </main>
    </div>
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
        {selectedTenant?.name ?? "Select client"}
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
}: {
  label: string;
  done: boolean;
  href: string;
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
      <span className={cn("flex-1 text-sm", done ? "text-muted-foreground line-through" : "text-foreground")}>
        {label}
      </span>
      {!done && <ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
    </div>
  );

  if (done) {
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
  onOpenPanel,
}: {
  agent: ProductAgent;
  onOpenPanel?: () => void;
}) {
  const locked = agent.status === "locked";

  return (
    <div className="flex w-full max-w-xs flex-col gap-3 rounded-xl border border-border p-4">
      <div className="flex items-center gap-2.5">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg", agent.tint)}>
          <img src={agent.illustrationSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{agent.name}</div>
          <div className="truncate text-xs text-muted-foreground">{agent.category}</div>
        </div>
      </div>
      <p className="flex-1 text-sm leading-6 text-muted-foreground">{agent.description}</p>
      {onOpenPanel ? (
        <button
          type="button"
          onClick={onOpenPanel}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-foreground text-sm font-medium text-background transition-colors hover:opacity-90"
        >
          Open agent
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      ) : (
        <Link
          href={agent.href}
          className={cn(
            "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors",
            locked
              ? "border border-border text-muted-foreground hover:bg-muted"
              : "bg-foreground text-background hover:opacity-90",
          )}
        >
          {locked ? "Discuss upgrade" : "Open agent"}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
