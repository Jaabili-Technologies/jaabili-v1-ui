import { getStoredAdminAccessToken, getStoredSessionToken } from "./auth-context";

export type LeadTemperature = "hot" | "medium" | "low";
export type LeadGrade = "A" | "B" | "C" | "D";
export type ConversationStatus = "active" | "handoff_requested" | "resolved";
export type BuyerIntent =
  | "pricing"
  | "product_fit"
  | "availability"
  | "policy"
  | "comparison"
  | "objection"
  | "handoff"
  | "support"
  | "strategy"
  | "unknown";
export type BuyerSentiment = "positive" | "neutral" | "concerned" | "negative";
export type BuyingStage = "awareness" | "consideration" | "decision" | "retention";

export interface InteractionIntelligence {
  intent: BuyerIntent;
  sentiment: BuyerSentiment;
  buyingStage: BuyingStage;
  urgency: "low" | "medium" | "high";
  confidence: number;
  keywords: string[];
  scoreDelta: number;
  recommendedAction: string;
}

export interface LeadProfile {
  id: string;
  tenantId: string;
  conversationId: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  followUpConsent: boolean;
  budget: number | null;
  requirement: string | null;
  timeline: string | null;
  qualification: LeadTemperature;
  score: number;
  grade: LeadGrade;
  gradeReasons: string[];
  missingFields: string[];
  nextBestAction: string;
  intent: BuyerIntent;
  sentiment: BuyerSentiment;
  buyingStage: BuyingStage;
  urgency: "low" | "medium" | "high";
  intentConfidence: number;
  intelligenceSummary: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  role: "visitor" | "agent" | "system";
  content: string;
  createdAt: string;
}

export interface ConversationRecord {
  id: string;
  tenantId: string;
  visitorId: string;
  status: ConversationStatus;
  priority: LeadTemperature;
  labels: string[];
  messages: ConversationMessage[];
  leadId: string | null;
  channel: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentNotification {
  id: string;
  tenantId: string;
  conversationId: string;
  leadId: string | null;
  type: "hot_lead" | "handoff" | "lead_captured";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AgentReply {
  conversation: ConversationRecord;
  lead: LeadProfile | null;
  reply: string;
  notification: AgentNotification | null;
  intelligence: InteractionIntelligence;
}

export interface AgentAnalytics {
  totalConversations: number;
  activeConversations: number;
  handoffRequested: number;
  leadsCaptured: number;
  hotLeads: number;
  mediumLeads: number;
  lowLeads: number;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  gradeD: number;
  unreadNotifications: number;
}

export interface AgentReadinessReport {
  tenantId: string;
  score: number;
  grade: "A" | "B" | "C" | "D";
  stage: "draft" | "data-room" | "pilot-ready" | "scale-ready";
  readyToPilot: boolean;
  sourceCoverage: {
    website: boolean;
    faq: boolean;
    pricing: boolean;
    policy: boolean;
    document: boolean;
  };
  strengths: string[];
  gaps: string[];
  nextActions: string[];
  metrics: {
    sources: number;
    chunks: number;
    conversations: number;
    leads: number;
    gradeALeads: number;
    labeledConversations: number;
  };
}

export interface AgentStatus {
  intelligence: {
    modelVersion?: string;
    modelName?: string;
    knowledge?: {
      configured: boolean;
      version: string | null;
      generatedAt: string | null;
      sourceCount: number;
      chunkCount: number;
      embeddingModel: string | null;
    };
    activeProvider: string;
    providers: Array<{
      name: string;
      configured: boolean;
    }>;
  };
}

export interface KnowledgeSource {
  id: string;
  tenantId?: string;
  title: string;
  url: string;
  category: string;
  sourceType?: "website" | "document" | "faq" | "pricing" | "policy" | "text";
  status?: "pending" | "processing" | "ready" | "failed";
  trustLevel: "official" | "owned" | "partner" | "public";
  enabled: boolean;
  error?: string | null;
}

export interface AgentTenant {
  id: string;
  name: string;
  websiteUrl: string | null;
  industry: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  widgetPublicKey: string | null;
  allowedWidgetOrigins: string[];
  activeAgentProfile: string;
  subscriptionPlan: "free" | "basic" | "pro" | "enterprise";
  subscriptionStatus: string;
  whatsappPhoneNumberId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeIngestSummary {
  version: string;
  generatedAt: string;
  sourceCount: number;
  chunkCount: number;
  embeddingModel: string;
}

export interface WebsiteSalesAgentSettings {
  notificationEmail: string | null;
  notificationWhatsappPhone: string | null;
}

export interface AgentRuntimeSettings {
  model?: string;
  temperature?: number;
  maxResponseWords?: number;
  retrievalChunks?: number;
  strictGrounding?: boolean;
}

export interface TrainingExample {
  conversationId: string;
  labels: string[];
  prompt: string;
  response: string;
  quality: "good" | "bad" | "review";
  source: "website-sales-chat";
  createdAt: string;
}

export interface CompanyProfileInput {
  companyName?: string;
  websiteUrl?: string;
  industry?: string;
  targetCustomers?: string;
  primaryOffer?: string;
  salesGoal?: string;
  averageOrderValue?: string;
  serviceLocations?: string;
  currentChannels?: string[];
}

export interface PromoAssetInput {
  name: string;
  type: "website" | "image" | "video" | "brochure" | "offer" | "testimonial" | "catalog" | "other";
  url?: string;
  notes?: string;
}

export interface WebsiteSalesActivationReport {
  summary: string;
  confidence: "low" | "medium" | "high";
  salesThesis: string[];
  requiredDataGaps: string[];
  promoAssetPlan: string[];
  websiteSalesWorkflows: string[];
  followUpSequences: string[];
  contentCampaigns: string[];
  automationScope: string[];
  humanEscalationRules: string[];
  launchChecklist: string[];
  successMetrics: string[];
  estimatedSetupStage: "needs-data" | "ready-for-review" | "ready-for-consent";
}

export interface WebsiteSalesActivationPlan {
  id: string;
  tenantId: string;
  status: "analyzing" | "ready_for_consent" | "approved" | "paused";
  companyProfile: CompanyProfileInput;
  promoAssets: PromoAssetInput[];
  report: WebsiteSalesActivationReport;
  consentApproved: boolean;
  consentApprovedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type WebsiteSalesOperationPriority = "urgent" | "high" | "medium" | "low";

export interface WebsiteSalesOperationAction {
  id: string;
  priority: WebsiteSalesOperationPriority;
  title: string;
  detail: string;
  owner: "agent" | "human" | "admin";
  channel: "dashboard" | "whatsapp" | "email" | "call";
  due: "now" | "today" | "next-business-day" | "monitor";
  recommendedMessage?: string;
  leadId?: string;
  conversationId?: string;
}

export interface WebsiteSalesOperationsReport {
  generatedAt: string;
  mode: "setup" | "pilot" | "live";
  summary: string;
  operatingPrinciples: string[];
  actionQueue: WebsiteSalesOperationAction[];
  leadFollowUps: WebsiteSalesOperationAction[];
  riskControls: string[];
  optimizationBacklog: string[];
  dailyReport: {
    leadsCaptured: number;
    gradeALeads: number;
    handoffs: number;
    openConversations: number;
    missingLeadFields: string[];
  };
}

export interface WebsiteSalesConversationAudit {
  conversationId: string;
  generatedAt: string;
  score: number;
  grade: "pass" | "review" | "handoff";
  risks: string[];
  missingLeadFields: string[];
  requiredActions: string[];
  nextBestAction: string;
}

export type WebsiteSalesDataSensitivity = "public" | "internal" | "confidential";
export type WebsiteSalesSolutionSeverity = "critical" | "high" | "medium" | "low";
export type WebsiteSalesDataRequestStatus = "needed" | "provided" | "skipped";
export type WebsiteSalesSolutionStatus = "recommended" | "selected" | "skipped";

export interface WebsiteSalesDataRequest {
  id: string;
  category:
    | "company"
    | "website"
    | "offer"
    | "sales"
    | "customer"
    | "policy"
    | "analytics"
    | "content"
    | "handoff";
  title: string;
  reason: string;
  examples: string[];
  sensitivity: WebsiteSalesDataSensitivity;
  requiredFor: string[];
  canSkip: boolean;
  skipImpact: string;
  status: WebsiteSalesDataRequestStatus;
  gatingPrompt?: string;
}

export type WebsiteSalesDataAnswerMode = "text" | "yes" | "no" | "skip";

export interface WebsiteSalesDataRequestAnswer {
  dataRequestId: string;
  mode: WebsiteSalesDataAnswerMode;
  answerText: string | null;
  knowledgeSourceId: string | null;
  answeredAt: string;
}

export interface WebsiteSalesWizardTurn {
  id: string;
  role: "agent" | "owner";
  dataRequestId: string | null;
  content: string;
  inputMode: "text" | "yes_no" | null;
  createdAt: string;
}

export interface WebsiteSalesWizardQuestion {
  dataRequestId: string;
  prompt: string;
  inputMode: "text" | "yes_no";
  examples: string[];
  sensitivity: WebsiteSalesDataSensitivity;
  skippable: boolean;
}

export interface WebsiteSalesDiagnosisWizard {
  status: "not_started" | "in_progress" | "completed";
  industry: string;
  currentQuestion: WebsiteSalesWizardQuestion | null;
  answeredCount: number;
  totalCount: number;
  turnHistory: WebsiteSalesWizardTurn[];
}

export interface WebsiteSalesDiagnosisIssue {
  id: string;
  title: string;
  severity: WebsiteSalesSolutionSeverity;
  evidence: string[];
  impact: string;
  missingDataIds: string[];
}

export interface WebsiteSalesSolutionOption {
  id: string;
  title: string;
  problem: string;
  severity: WebsiteSalesSolutionSeverity;
  expectedOutcome: string;
  requiredDataIds: string[];
  firstActions: string[];
  agentWorkflows: string[];
  kpis: string[];
  riskControls: string[];
  status: WebsiteSalesSolutionStatus;
}

export interface WebsiteSalesDiagnosisReport {
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
    leadCount: number;
  };
  issues: WebsiteSalesDiagnosisIssue[];
  pinpointedFindings: string[];
  dataRequests: WebsiteSalesDataRequest[];
  solutionOptions: WebsiteSalesSolutionOption[];
  recommendedSolutionIds: string[];
  nextBestStep: string;
  wizard: WebsiteSalesDiagnosisWizard;
}

export type WebsiteSalesLearningPriority = "urgent" | "high" | "medium" | "low";

export interface WebsiteSalesLearningInsight {
  id: string;
  priority: WebsiteSalesLearningPriority;
  title: string;
  evidence: string[];
  improvement: string;
  owner: "agent" | "human" | "admin";
}

export interface WebsiteSalesEvalQuestion {
  id: string;
  question: string;
  expectedBehavior: string;
  category: "pricing" | "policy" | "handoff" | "qualification" | "objection" | "strategy";
  difficulty: "basic" | "intermediate" | "advanced";
}

export interface WebsiteSalesLearningReport {
  tenantId: string;
  generatedAt: string;
  learningScore: number;
  stage: "cold-start" | "labeling" | "pilot-learning" | "improving" | "ready-to-scale";
  summary: string;
  labelStats: {
    totalConversations: number;
    labeledConversations: number;
    good: number;
    bad: number;
    review: number;
    trainingReady: number;
  };
  answerQuality: {
    auditedConversations: number;
    pass: number;
    review: number;
    handoff: number;
    averageScore: number;
  };
  sourceGaps: string[];
  recurringBuyerQuestions: string[];
  recommendedLabels: Array<{
    conversationId: string;
    title: string;
    labels: string[];
    reason: string;
  }>;
  insights: WebsiteSalesLearningInsight[];
  evalQuestions: WebsiteSalesEvalQuestion[];
  nextTrainingStep: string;
}

const apiBase = (
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "http://localhost:3001" : "")
).replace(/\/$/, "");

export const websiteSalesApiBase = apiBase;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // Attached whenever a logged-in user's session exists -- required for
  // tenant-scoped dashboard routes (leads, reports, tickets) now gated by
  // requireWorkspaceAccess server-side. Harmless on public/unauthenticated
  // routes (greet, chat, FAQ reads), which never checked this header.
  const sessionToken = getStoredSessionToken();
  const response = await fetch(`${apiBase}/api${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(sessionToken ? { authorization: `Bearer ${sessionToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => null)) as
    | T
    | { error?: string }
    | null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data && data.error
        ? data.error
        : `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

/** Attaches the stored Google admin token (see auth-context.tsx). Use only for Jaabili-internal admin operations (tenant create/subscription/widget-key rotate). */
function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredAdminAccessToken();
  return request<T>(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
}

export function greetWebsiteSalesAgent(visitorId: string) {
  return request<AgentReply>("/agents/website-sales/greet", {
    method: "POST",
    body: JSON.stringify({ visitorId }),
  });
}

export function chatWithWebsiteSalesAgent(input: {
  tenantId?: string;
  visitorId: string;
  message: string;
  conversationId?: string;
  runtime?: AgentRuntimeSettings;
}) {
  return request<AgentReply>("/agents/website-sales/chat", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getWebsiteSalesAgentAnalytics(tenantId?: string) {
  const query = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
  return request<AgentAnalytics>(`/agents/website-sales/analytics${query}`);
}

export function getWebsiteSalesOperationsReport(tenantId?: string) {
  const query = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
  return request<WebsiteSalesOperationsReport>(
    `/agents/website-sales/operations${query}`,
  );
}

export function getWebsiteSalesAgentReadiness(tenantId?: string) {
  const query = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
  return request<AgentReadinessReport>(`/agents/website-sales/readiness${query}`);
}

export function getWebsiteSalesDiagnosisReport(input: {
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
  return request<WebsiteSalesDiagnosisReport>(
    `/agents/website-sales/diagnosis${query}`,
  );
}

export function answerWebsiteSalesDataRequest(input: {
  tenantId?: string;
  dataRequestId: string;
  mode: WebsiteSalesDataAnswerMode;
  answerText?: string;
}) {
  return request<{ report: WebsiteSalesDiagnosisReport }>(
    "/agents/website-sales/diagnosis/answer",
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function updateWebsiteSalesDiagnosisSolutions(input: {
  tenantId?: string;
  selectedSolutionIds: string[];
}) {
  return request<{ report: WebsiteSalesDiagnosisReport }>(
    "/agents/website-sales/diagnosis/solutions",
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function resetWebsiteSalesDiagnosisWizard(tenantId?: string) {
  return request<{ report: WebsiteSalesDiagnosisReport }>(
    "/agents/website-sales/diagnosis/reset",
    { method: "POST", body: JSON.stringify({ tenantId }) },
  );
}

export function listWebsiteSalesAgentConversations(tenantId?: string) {
  const query = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
  return request<ConversationRecord[]>(`/agents/website-sales/conversations${query}`);
}

export function getWebsiteSalesConversationAudit(conversationId: string) {
  return request<WebsiteSalesConversationAudit>(
    `/agents/website-sales/conversations/${conversationId}/audit`,
  );
}

export function listWebsiteSalesTrainingExamples(includeUnlabeled = false) {
  return request<{
    modelVersion: string;
    generatedAt: string;
    examples: TrainingExample[];
  }>(
    `/agents/website-sales/training/examples${
      includeUnlabeled ? "?includeUnlabeled=true" : ""
    }`,
  );
}

export function getWebsiteSalesLearningReport(tenantId?: string) {
  const query = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
  return request<WebsiteSalesLearningReport>(
    `/agents/website-sales/training/learning-report${query}`,
  );
}

export function listWebsiteSalesActivationPlans(tenantId?: string) {
  const query = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
  return request<WebsiteSalesActivationPlan[]>(
    `/agents/website-sales/activation${query}`,
  );
}

export function analyzeWebsiteSalesActivation(input: {
  tenantId?: string;
  companyProfile: CompanyProfileInput;
  promoAssets: PromoAssetInput[];
}) {
  return request<WebsiteSalesActivationPlan>("/agents/website-sales/activation/analyze", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function approveWebsiteSalesActivation(planId: string) {
  return request<WebsiteSalesActivationPlan>(
    `/agents/website-sales/activation/${planId}/approve`,
    { method: "POST" },
  );
}

export function updateWebsiteSalesConversationLabels(
  conversationId: string,
  labels: string[],
) {
  return request<ConversationRecord>(
    `/agents/website-sales/conversations/${conversationId}/labels`,
    {
      method: "PATCH",
      body: JSON.stringify({ labels }),
    },
  );
}

export function listWebsiteSalesAgentLeads(tenantId?: string) {
  const query = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
  return request<LeadProfile[]>(`/agents/website-sales/leads${query}`);
}

export function getWebsiteSalesAgentStatus() {
  return request<AgentStatus>("/agents/website-sales/status");
}

export function getWebsiteSalesAgentSettings() {
  return request<WebsiteSalesAgentSettings>("/agents/website-sales/settings");
}

export function listTenantKnowledgeSources() {
  return request<KnowledgeSource[]>("/agents/website-sales/knowledge/sources");
}

export function listAgentTenants() {
  return request<AgentTenant[]>("/agents/website-sales/tenants");
}

export function createAgentTenant(input: {
  id?: string;
  name: string;
  websiteUrl?: string | null;
  industry?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  allowedWidgetOrigins?: string[] | null;
  activeAgentProfile?: string | null;
}) {
  return adminRequest<AgentTenant>("/agents/website-sales/tenants", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateAgentTenantSubscription(
  tenantId: string,
  plan: "free" | "basic" | "pro" | "enterprise",
  status = "active",
) {
  return adminRequest<AgentTenant>(
    `/agents/website-sales/tenants/${encodeURIComponent(tenantId)}/subscription`,
    {
      method: "POST",
      body: JSON.stringify({ plan, status }),
    },
  );
}

export function rotateAgentTenantWidgetKey(tenantId: string) {
  return adminRequest<AgentTenant>(
    `/agents/website-sales/tenants/${encodeURIComponent(tenantId)}/widget-key/rotate`,
    {
      method: "POST",
    },
  );
}

export function connectAgentTenantWhatsApp(tenantId: string, whatsappPhoneNumberId: string) {
  return adminRequest<AgentTenant>(
    `/agents/whatsapp/tenants/${encodeURIComponent(tenantId)}/connect`,
    {
      method: "POST",
      body: JSON.stringify({ whatsappPhoneNumberId }),
    },
  );
}

export function registerTenantKnowledgeSource(input: {
  tenantId?: string;
  title: string;
  category: string;
  sourceType?: KnowledgeSource["sourceType"];
  url?: string;
  text?: string;
  ingest?: boolean;
}) {
  return request<{
    source: KnowledgeSource;
    store: KnowledgeIngestSummary | null;
  }>("/agents/website-sales/knowledge/sources", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function uploadTenantKnowledgeFile(input: {
  tenantId?: string;
  file: File;
  title?: string;
  category?: string;
  sourceType?: KnowledgeSource["sourceType"];
}) {
  const formData = new FormData();
  formData.append("file", input.file);
  if (input.tenantId) formData.append("tenantId", input.tenantId);
  if (input.title) formData.append("title", input.title);
  if (input.category) formData.append("category", input.category);
  if (input.sourceType) formData.append("sourceType", input.sourceType);

  const response = await fetch(`${apiBase}/api/agents/website-sales/knowledge/upload`, {
    method: "POST",
    body: formData,
  });
  const data = (await response.json().catch(() => null)) as
    | {
        source: KnowledgeSource;
        store: KnowledgeIngestSummary;
      }
    | { error?: string }
    | null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data && data.error
        ? data.error
        : `Upload failed with ${response.status}`;
    throw new Error(message);
  }

  return data as {
    source: KnowledgeSource;
    store: KnowledgeIngestSummary;
  };
}

export function ingestWebsiteSalesKnowledge() {
  return request<{ store: KnowledgeIngestSummary }>(
    "/agents/website-sales/knowledge/ingest",
    {
      method: "POST",
    },
  );
}

export function updateWebsiteSalesAgentSettings(
  settings: Partial<WebsiteSalesAgentSettings>,
) {
  return request<WebsiteSalesAgentSettings>("/agents/website-sales/settings", {
    method: "PATCH",
    body: JSON.stringify(settings),
  });
}
