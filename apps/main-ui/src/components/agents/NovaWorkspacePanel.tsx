import { useCallback, useEffect, useRef, useState } from "react";
import {
  ProgressRing,
  ThinkingDots,
  WizardComposer,
  WizardTurnBubble,
  WizardYesNoPrompt,
} from "@/components/ui/wizard-kit";
import {
  answerWebsiteSalesDataRequest,
  approveWebsiteSalesActivation,
  getWebsiteSalesDiagnosisReport,
  listWebsiteSalesActivationPlans,
  resetWebsiteSalesDiagnosisWizard,
  updateWebsiteSalesDiagnosisSolutions,
  type WebsiteSalesActivationPlan,
  type WebsiteSalesDataAnswerMode,
  type WebsiteSalesDiagnosisReport,
} from "@/lib/website-sales-agent-api";
import { DiagnosisResultsView } from "@/pages/website-sales-agent";

/**
 * Self-contained Nova workspace: fetches its own diagnosis/activation state
 * for the given tenant and renders the same progress-ring + conversational
 * diagnosis experience as the full Agent Lab page, so it can be embedded
 * directly in the unified multi-agent dashboard shell.
 */
export function NovaWorkspacePanel({ tenantId }: { tenantId: string }) {
  const [diagnosisReport, setDiagnosisReport] = useState<WebsiteSalesDiagnosisReport | null>(null);
  const [activationPlans, setActivationPlans] = useState<WebsiteSalesActivationPlan[]>([]);
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
      getWebsiteSalesDiagnosisReport({ tenantId }),
      listWebsiteSalesActivationPlans(tenantId),
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

  const submitAnswer = async (mode: WebsiteSalesDataAnswerMode, answerText?: string) => {
    if (!wizard?.currentQuestion) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const { report } = await answerWebsiteSalesDataRequest({
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
      const { report } = await resetWebsiteSalesDiagnosisWizard(tenantId);
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
      const { report } = await updateWebsiteSalesDiagnosisSolutions({
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
      const plan = await approveWebsiteSalesActivation(selectedActivationPlan.id);
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
            {wizard?.status === "completed" ? "Business analysis complete" : "Business problem analysis"}
          </div>
          <div className="mt-1 text-sm leading-6 text-foreground/50">
            {!wizard
              ? "Preparing Nova's questions for your business."
              : wizard.status === "completed"
                ? "Review what Nova found and approve the solutions you want it to work on."
                : `Nova is asking what it needs to diagnose your sales gaps. ${wizard.answeredCount} of ${wizard.totalCount} answered.`}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card/85">
        {!wizard || !diagnosisReport ? (
          <div className="p-6 text-sm text-foreground/40">Loading diagnosis...</div>
        ) : wizard.status === "completed" ? (
          <DiagnosisResultsView
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
export async function getNovaAgentStatus(tenantId: string): Promise<{ percent: number; isLive: boolean }> {
  try {
    const [report, plans] = await Promise.all([
      getWebsiteSalesDiagnosisReport({ tenantId }),
      listWebsiteSalesActivationPlans(tenantId),
    ]);
    const wizard = report.wizard;
    const percent = wizard.totalCount > 0 ? Math.round((wizard.answeredCount / wizard.totalCount) * 100) : 0;
    const isLive = plans.some((plan) => plan.tenantId === tenantId && plan.consentApproved);
    return { percent, isLive };
  } catch {
    return { percent: 0, isLive: false };
  }
}
