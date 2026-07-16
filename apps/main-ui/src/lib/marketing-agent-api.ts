export type MarketingDataSensitivity = "public" | "internal" | "confidential";
export type MarketingSolutionSeverity = "critical" | "high" | "medium" | "low";
export type MarketingDataRequestStatus = "needed" | "provided" | "skipped";
export type MarketingSolutionStatus = "recommended" | "selected" | "skipped";
export type MarketingDataAnswerMode = "text" | "yes" | "no" | "skip";

export interface MarketingDataRequest {
  id: string;
  category:
    | "brand"
    | "audience"
    | "channels"
    | "content"
    | "budget"
    | "competitors"
    | "seo"
    | "goals";
  title: string;
  reason: string;
  examples: string[];
  sensitivity: MarketingDataSensitivity;
  requiredFor: string[];
  canSkip: boolean;
  skipImpact: string;
  status: MarketingDataRequestStatus;
  gatingPrompt?: string;
}

export interface MarketingDiagnosisIssue {
  id: string;
  title: string;
  severity: MarketingSolutionSeverity;
  evidence: string[];
  impact: string;
  missingDataIds: string[];
}

export interface MarketingSolutionOption {
  id: string;
  title: string;
  problem: string;
  severity: MarketingSolutionSeverity;
  expectedOutcome: string;
  requiredDataIds: string[];
  firstActions: string[];
  agentWorkflows: string[];
  kpis: string[];
  riskControls: string[];
  status: MarketingSolutionStatus;
}

export interface MarketingWizardTurn {
  id: string;
  role: "agent" | "owner";
  dataRequestId: string | null;
  content: string;
  inputMode: "text" | "yes_no" | null;
  createdAt: string;
}

export interface MarketingWizardQuestion {
  dataRequestId: string;
  prompt: string;
  inputMode: "text" | "yes_no";
  examples: string[];
  sensitivity: MarketingDataSensitivity;
  skippable: boolean;
}

export interface MarketingDiagnosisWizard {
  status: "not_started" | "in_progress" | "completed";
  industry: string;
  currentQuestion: MarketingWizardQuestion | null;
  answeredCount: number;
  totalCount: number;
  turnHistory: MarketingWizardTurn[];
}

export interface MarketingDiagnosisReport {
  tenantId: string;
  generatedAt: string;
  confidence: "low" | "medium" | "high";
  summary: string;
  consentPrompt: string;
  companySnapshot: {
    name: string;
    website: string | null;
    industry: string | null;
    classifiedIndustry: string;
    sourceCount: number;
  };
  issues: MarketingDiagnosisIssue[];
  pinpointedFindings: string[];
  dataRequests: MarketingDataRequest[];
  solutionOptions: MarketingSolutionOption[];
  recommendedSolutionIds: string[];
  nextBestStep: string;
  wizard: MarketingDiagnosisWizard;
}

export interface MarketingProfileInput {
  companyName?: string;
  websiteUrl?: string;
  industry?: string;
  targetAudience?: string;
  brandVoice?: string;
  campaignGoal?: string;
  currentChannels?: string[];
}

export interface MarketingActivationReport {
  summary: string;
  confidence: "low" | "medium" | "high";
  marketingThesis: string[];
  requiredDataGaps: string[];
  contentCalendar: string[];
  contentDraftSamples: string[];
  campaignPlan: string[];
  seoChecklist: string[];
  socialMediaPlan: string[];
  automationScope: string[];
  humanApprovalRules: string[];
  launchChecklist: string[];
  successMetrics: string[];
  estimatedSetupStage: "needs-data" | "ready-for-review" | "ready-for-consent";
}

export interface MarketingActivationPlan {
  id: string;
  tenantId: string;
  status: "analyzing" | "ready_for_consent" | "approved" | "paused";
  companyProfile: MarketingProfileInput;
  report: MarketingActivationReport;
  consentApproved: boolean;
  consentApprovedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const apiBase = (
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "http://localhost:3001" : "")
).replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}/api${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => null)) as T | { error?: string } | null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data && data.error
        ? data.error
        : `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export function getMarketingDiagnosisReport(input: {
  tenantId?: string;
  selectedSolutionIds?: string[];
  skippedDataRequestIds?: string[];
}) {
  const params = new URLSearchParams();
  if (input.tenantId) params.set("tenantId", input.tenantId);
  if (input.selectedSolutionIds?.length) {
    params.set("selectedSolutionIds", input.selectedSolutionIds.join(","));
  }
  if (input.skippedDataRequestIds?.length) {
    params.set("skippedDataRequestIds", input.skippedDataRequestIds.join(","));
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<MarketingDiagnosisReport>(`/agents/marketing/diagnosis${query}`);
}

export function answerMarketingDataRequest(input: {
  tenantId?: string;
  dataRequestId: string;
  mode: MarketingDataAnswerMode;
  answerText?: string;
}) {
  return request<{ report: MarketingDiagnosisReport }>("/agents/marketing/diagnosis/answer", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateMarketingDiagnosisSolutions(input: {
  tenantId?: string;
  selectedSolutionIds: string[];
}) {
  return request<{ report: MarketingDiagnosisReport }>("/agents/marketing/diagnosis/solutions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function resetMarketingDiagnosisWizard(tenantId?: string) {
  return request<{ report: MarketingDiagnosisReport }>("/agents/marketing/diagnosis/reset", {
    method: "POST",
    body: JSON.stringify({ tenantId }),
  });
}

export function listMarketingActivationPlans(tenantId?: string) {
  const query = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
  return request<MarketingActivationPlan[]>(`/agents/marketing/activation${query}`);
}

export function approveMarketingActivation(planId: string) {
  return request<MarketingActivationPlan>(`/agents/marketing/activation/${planId}/approve`, {
    method: "POST",
  });
}
