import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketingAgentIcon } from "@/components/ui/agent-icons";
import {
  ProgressRing,
  ThinkingDots,
  WizardComposer,
  WizardTurnBubble,
  WizardYesNoPrompt,
} from "@/components/ui/wizard-kit";
import { listAgentTenants, type AgentTenant } from "@/lib/website-sales-agent-api";
import {
  answerMarketingDataRequest,
  approveMarketingActivation,
  getMarketingDiagnosisReport,
  listMarketingActivationPlans,
  resetMarketingDiagnosisWizard,
  updateMarketingDiagnosisSolutions,
  type MarketingActivationPlan,
  type MarketingDataAnswerMode,
  type MarketingDiagnosisReport,
} from "@/lib/marketing-agent-api";

// Intentionally the same key website-sales-agent.tsx uses: tenant selection
// is shared across agents, since they all work on the same client workspace.
const TENANT_STORAGE_KEY = "jaabili.websiteSales.tenantId";

export default function MarketingAgentPage() {
  const [tenants, setTenants] = useState<AgentTenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState(
    () => window.localStorage.getItem(TENANT_STORAGE_KEY) ?? "jaabili-default",
  );

  const selectedTenant = tenants.find((tenant) => tenant.id === selectedTenantId) ?? tenants[0] ?? null;

  useEffect(() => {
    listAgentTenants().then(setTenants).catch(() => setTenants([]));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(TENANT_STORAGE_KEY, selectedTenantId);
  }, [selectedTenantId]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex h-16 items-center justify-between border-b border-border px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex size-9 items-center justify-center rounded-full hover:bg-foreground/10"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex size-9 items-center justify-center rounded-lg bg-fuchsia-500/12 text-fuchsia-500">
            <MarketingAgentIcon className="size-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Marketing Agent</div>
            <div className="text-xs text-foreground/45">Campaign planning and content strategy</div>
          </div>
        </div>
        <TenantSwitcher
          tenants={tenants}
          selectedTenant={selectedTenant}
          onChange={setSelectedTenantId}
        />
      </header>

      <main className="px-4 py-8">
        <MarketingWorkspacePanel tenantId={selectedTenantId} />
      </main>
    </div>
  );
}

/**
 * Self-contained Marketing workspace: fetches its own diagnosis/activation
 * state for the given tenant, so it can be embedded directly in the unified
 * multi-agent dashboard shell as well as this standalone page.
 */
export function MarketingWorkspacePanel({ tenantId }: { tenantId: string }) {
  const [diagnosisReport, setDiagnosisReport] = useState<MarketingDiagnosisReport | null>(null);
  const [activationPlans, setActivationPlans] = useState<MarketingActivationPlan[]>([]);
  const [isActivationWorking, setIsActivationWorking] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedActivationPlan =
    activationPlans.find((plan) => plan.tenantId === tenantId) ?? null;
  const wizard = diagnosisReport?.wizard ?? null;
  const percent =
    wizard && wizard.totalCount > 0 ? Math.round((wizard.answeredCount / wizard.totalCount) * 100) : 0;

  const refreshAll = useCallback(async () => {
    const [nextDiagnosis, nextPlans] = await Promise.allSettled([
      getMarketingDiagnosisReport({ tenantId }),
      listMarketingActivationPlans(tenantId),
    ]);
    if (nextDiagnosis.status === "fulfilled") setDiagnosisReport(nextDiagnosis.value);
    if (nextPlans.status === "fulfilled") setActivationPlans(nextPlans.value);
  }, [tenantId]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [wizard?.turnHistory.length]);

  const submitAnswer = async (mode: MarketingDataAnswerMode, answerText?: string) => {
    if (!wizard?.currentQuestion) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const { report } = await answerMarketingDataRequest({
        tenantId,
        dataRequestId: wizard.currentQuestion.dataRequestId,
        mode,
        answerText,
      });
      setDiagnosisReport(report);
      setDraftText("");
      if (report.wizard.status === "completed") {
        refreshAll();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record that answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { report } = await resetMarketingDiagnosisWizard(tenantId);
      setDiagnosisReport(report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not restart the conversation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSolution = async (solutionId: string) => {
    if (!diagnosisReport) return;
    const current = diagnosisReport.solutionOptions.find((solution) => solution.id === solutionId);
    const selectedIds = diagnosisReport.solutionOptions
      .filter((solution) =>
        solution.id === solutionId
          ? current?.status !== "selected"
          : solution.status === "selected",
      )
      .map((solution) => solution.id);
    try {
      const { report } = await updateMarketingDiagnosisSolutions({
        tenantId,
        selectedSolutionIds: selectedIds,
      });
      setDiagnosisReport(report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update solution selection.");
    }
  };

  const approve = async () => {
    if (!selectedActivationPlan) return;
    setIsActivationWorking(true);
    setError(null);
    try {
      const plan = await approveMarketingActivation(selectedActivationPlan.id);
      setActivationPlans((plans) => plans.map((item) => (item.id === plan.id ? plan : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not approve activation.");
    } finally {
      setIsActivationWorking(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-4 flex items-center gap-4 rounded-2xl border border-border bg-card/85 p-4">
        <ProgressRing percent={percent} />
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-foreground">
            {wizard?.status === "completed" ? "Marketing analysis complete" : "Business marketing analysis"}
          </div>
          <div className="mt-1 text-sm leading-6 text-foreground/50">
            {!wizard
              ? "Preparing the Marketing Agent's questions."
              : wizard.status === "completed"
                ? "Review the campaign plan and approve what the agent should work on."
                : `The agent is asking what it needs to plan your marketing. ${wizard.answeredCount} of ${wizard.totalCount} answered.`}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card/85">
        {!wizard || !diagnosisReport ? (
          <div className="p-6 text-sm text-foreground/40">Loading diagnosis...</div>
        ) : wizard.status === "completed" ? (
          <MarketingResultsView
            report={diagnosisReport}
            activationPlan={selectedActivationPlan}
            isActivationWorking={isActivationWorking}
            isSubmitting={isSubmitting}
            error={error}
            onToggleSolution={toggleSolution}
            onApprove={approve}
            onReset={handleReset}
          />
        ) : (
          <>
            <div ref={scrollRef} className="max-h-[26rem] space-y-4 overflow-y-auto px-5 py-5">
              {wizard.turnHistory.length === 0 && wizard.currentQuestion && (
                <WizardTurnBubble
                  turn={{ id: "first-question", role: "agent", content: wizard.currentQuestion.prompt }}
                />
              )}
              {wizard.turnHistory.map((turn) => (
                <WizardTurnBubble key={turn.id} turn={turn} />
              ))}
              {isSubmitting && (
                <div className="flex gap-3">
                  <div className="mt-2 size-2 shrink-0 rounded-full bg-primary/70" />
                  <div className="rounded-3xl px-5 py-3">
                    <ThinkingDots />
                  </div>
                </div>
              )}
            </div>
            {error && (
              <div className="mx-5 mb-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
            <div className="border-t border-border p-4">
              {wizard.currentQuestion?.inputMode === "yes_no" ? (
                <WizardYesNoPrompt
                  disabled={isSubmitting}
                  onYes={() => submitAnswer("yes")}
                  onNo={() => submitAnswer("no")}
                />
              ) : (
                <WizardComposer
                  value={draftText}
                  disabled={isSubmitting}
                  skippable={wizard.currentQuestion?.skippable ?? false}
                  onChange={setDraftText}
                  onSend={() => draftText.trim() && submitAnswer("text", draftText.trim())}
                  onSkip={() => submitAnswer("skip")}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Lightweight status used by the dashboard rail — percent complete + live badge. */
export async function getMarketingAgentStatus(
  tenantId: string,
): Promise<{ percent: number; isLive: boolean }> {
  try {
    const [report, plans] = await Promise.all([
      getMarketingDiagnosisReport({ tenantId }),
      listMarketingActivationPlans(tenantId),
    ]);
    const wizard = report.wizard;
    const percent = wizard.totalCount > 0 ? Math.round((wizard.answeredCount / wizard.totalCount) * 100) : 0;
    const isLive = plans.some((plan) => plan.tenantId === tenantId && plan.consentApproved);
    return { percent, isLive };
  } catch {
    return { percent: 0, isLive: false };
  }
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

function MarketingResultsView({
  report,
  activationPlan,
  isActivationWorking,
  isSubmitting,
  error,
  onToggleSolution,
  onApprove,
  onReset,
}: {
  report: MarketingDiagnosisReport;
  activationPlan: MarketingActivationPlan | null;
  isActivationWorking: boolean;
  isSubmitting: boolean;
  error: string | null;
  onToggleSolution: (solutionId: string) => void;
  onApprove: () => void;
  onReset: () => void;
}) {
  const selectedSolutions = report.solutionOptions.filter((solution) => solution.status === "selected");
  const isApproved = activationPlan?.consentApproved ?? false;

  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
      <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4">
        <div className="text-xs uppercase tracking-[0.16em] text-foreground/40">Diagnosis complete</div>
        <p className="mt-2 text-sm leading-6 text-foreground/80">{report.summary}</p>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground/70">
          Where {report.companySnapshot.name}'s marketing is falling short
        </h3>
        <div className="space-y-2">
          {report.issues.map((issue) => (
            <div key={issue.id} className="rounded-2xl bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground/85">{issue.title}</div>
                  <div className="mt-1 text-xs leading-5 text-foreground/45">{issue.impact}</div>
                </div>
                <SeverityPill severity={issue.severity} />
              </div>
            </div>
          ))}
          {report.issues.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-4 text-xs text-foreground/40">
              No material marketing gaps found.
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground/70">Recommended campaigns</h3>
          <span className="text-xs text-foreground/40">Select what the agent should work on</span>
        </div>
        <div className="space-y-2">
          {report.solutionOptions.map((solution) => (
            <button
              key={solution.id}
              type="button"
              onClick={() => onToggleSolution(solution.id)}
              className={cn(
                "w-full rounded-2xl border p-4 text-left transition",
                solution.status === "selected"
                  ? "border-primary/50 bg-primary/10"
                  : "border-border bg-black/20 hover:border-foreground/20",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground/90">{solution.title}</div>
                  <div className="mt-1 text-xs leading-5 text-foreground/50">{solution.problem}</div>
                  <div className="mt-2 text-xs leading-5 text-foreground/40">{solution.expectedOutcome}</div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-1 text-[11px]",
                    solution.status === "selected"
                      ? "bg-primary/20 text-foreground"
                      : "bg-foreground/8 text-foreground/45",
                  )}
                >
                  {solution.status === "selected" ? "Selected" : "Select"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {solution.kpis.slice(0, 3).map((kpi) => (
                  <span key={kpi} className="rounded-full bg-foreground/8 px-2 py-1 text-[11px] text-foreground/45">
                    {kpi}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      {activationPlan && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground/70">What the agent will do once approved</h3>
          <ReportListCard title="Marketing thesis" items={activationPlan.report.marketingThesis} />
          <ReportListCard title="Content calendar" items={activationPlan.report.contentCalendar} />
          <ReportListCard title="Campaign plan" items={activationPlan.report.campaignPlan} />
          <ReportListCard title="Human approval rules" items={activationPlan.report.humanApprovalRules} />
          <div className="rounded-2xl bg-black/20 p-4 text-xs leading-6 text-foreground/60">
            <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-foreground/35">
              Success metrics we will track
            </div>
            <div className="flex flex-wrap gap-2">
              {activationPlan.report.successMetrics.slice(0, 6).map((metric) => (
                <span key={metric} className="rounded-full bg-foreground/8 px-2 py-1 text-[11px] text-foreground/50">
                  {metric}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2 pb-2">
        {isApproved ? (
          <div className="flex items-center gap-2 rounded-full bg-primary/15 px-4 py-3 text-sm font-medium text-primary">
            <Check className="size-4" /> Live: {selectedSolutions.length || "all"} campaign(s) approved and running
          </div>
        ) : (
          <button
            type="button"
            onClick={onApprove}
            disabled={!activationPlan || isActivationWorking}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {isActivationWorking && <Loader2 className="size-4 animate-spin" />}
            Approve and let the agent start working
          </button>
        )}
        <button
          type="button"
          onClick={onReset}
          disabled={isSubmitting}
          className="h-10 w-full rounded-full border border-border text-xs font-medium text-foreground/55 hover:bg-foreground/8"
        >
          Restart marketing diagnosis
        </button>
      </div>
    </div>
  );
}

function ReportListCard({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl bg-black/20 p-4 text-xs leading-6 text-foreground/60">
      <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-foreground/35">{title}</div>
      <ul className="list-disc space-y-1 pl-4">
        {items.slice(0, 4).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

function SeverityPill({ severity }: { severity: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-1 text-[11px]",
        severity === "critical" && "bg-destructive/15 text-destructive",
        severity === "high" && "bg-secondary/15 text-secondary",
        severity === "medium" && "bg-primary/15 text-foreground",
        severity === "low" && "bg-foreground/8 text-foreground/45",
      )}
    >
      {severity}
    </span>
  );
}
