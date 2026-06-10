import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  Bot,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  History,
  LayoutGrid,
  Loader2,
  Menu,
  MessageSquare,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRight,
  Plus,
  Search,
  Send,
  Settings,
  Target,
  TrendingUp,
  Upload,
  X,
  Check,
} from "lucide-react";
import logo from "@assets/jaabili_logo_clean.png";
import { cn } from "@/lib/utils";
import {
  agentOptions,
  labelOptions,
  modelOptions,
  promptMessages,
  sourceOptions,
  starterPrompts,
} from "@/lib/agent-lab-config";
import {
  analyzeWebsiteSalesActivation,
  approveWebsiteSalesActivation,
  chatWithWebsiteSalesAgent,
  createAgentTenant,
  getWebsiteSalesAgentAnalytics,
  getWebsiteSalesDiagnosisReport,
  getWebsiteSalesLearningReport,
  getWebsiteSalesOperationsReport,
  getWebsiteSalesAgentReadiness,
  getWebsiteSalesAgentSettings,
  getWebsiteSalesAgentStatus,
  getWebsiteSalesConversationAudit,
  listAgentTenants,
  listWebsiteSalesTrainingExamples,
  listWebsiteSalesAgentConversations,
  listWebsiteSalesAgentLeads,
  listWebsiteSalesActivationPlans,
  listTenantKnowledgeSources,
  registerTenantKnowledgeSource,
  uploadTenantKnowledgeFile,
  updateWebsiteSalesConversationLabels,
  updateWebsiteSalesAgentSettings,
  websiteSalesApiBase,
  type AgentAnalytics,
  type AgentReadinessReport,
  type AgentReply,
  type AgentStatus,
  type AgentTenant,
  type CompanyProfileInput,
  type ConversationRecord,
  type KnowledgeSource,
  type LeadProfile,
  type TrainingExample,
  type WebsiteSalesActivationPlan,
  type WebsiteSalesConversationAudit,
  type WebsiteSalesDiagnosisReport,
  type WebsiteSalesLearningReport,
  type WebsiteSalesOperationsReport,
} from "@/lib/website-sales-agent-api";

const fallbackAnalytics: AgentAnalytics = {
  totalConversations: 0,
  activeConversations: 0,
  handoffRequested: 0,
  leadsCaptured: 0,
  hotLeads: 0,
  mediumLeads: 0,
  lowLeads: 0,
  gradeA: 0,
  gradeB: 0,
  gradeC: 0,
  gradeD: 0,
  unreadNotifications: 0,
};

type ModelRuntimeSettings = {
  temperature: number;
  maxResponseWords: number;
  retrievalChunks: number;
  strictGrounding: boolean;
};

type CompanyOnboardingDraft = {
  companyName: string;
  websiteUrl: string;
  industry: string;
  targetCustomers: string;
  primaryOffer: string;
  salesGoal: string;
  averageOrderValue: string;
  serviceLocations: string;
  currentChannels: string;
  contactEmail: string;
  contactPhone: string;
};

const defaultModelSettings: ModelRuntimeSettings = {
  temperature: 0.3,
  maxResponseWords: 220,
  retrievalChunks: 3,
  strictGrounding: true,
};

export default function WebsiteSalesAgentPage() {
  const visitorId = useMemo(
    () => `visitor_${Math.random().toString(36).slice(2, 10)}`,
    [],
  );
  const [conversation, setConversation] = useState<ConversationRecord | null>(null);
  const [history, setHistory] = useState<ConversationRecord[]>([]);
  const [lead, setLead] = useState<LeadProfile | null>(null);
  const [leads, setLeads] = useState<LeadProfile[]>([]);
  const [analytics, setAnalytics] = useState<AgentAnalytics>(fallbackAnalytics);
  const [readiness, setReadiness] = useState<AgentReadinessReport | null>(null);
  const [operationsReport, setOperationsReport] =
    useState<WebsiteSalesOperationsReport | null>(null);
  const [diagnosisReport, setDiagnosisReport] =
    useState<WebsiteSalesDiagnosisReport | null>(null);
  const [learningReport, setLearningReport] =
    useState<WebsiteSalesLearningReport | null>(null);
  const [conversationAudit, setConversationAudit] =
    useState<WebsiteSalesConversationAudit | null>(null);
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [tenants, setTenants] = useState<AgentTenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState(
    () => window.localStorage.getItem("jaabili.websiteSales.tenantId") ?? "jaabili-default",
  );
  const [tenantSources, setTenantSources] = useState<KnowledgeSource[]>([]);
  const [trainingExamples, setTrainingExamples] = useState<TrainingExample[]>([]);
  const [activationPlans, setActivationPlans] = useState<WebsiteSalesActivationPlan[]>([]);
  const [isActivationWorking, setIsActivationWorking] = useState(false);
  const [selectedModel, setSelectedModel] = useState("jaabilv-2.0");
  const [selectedAgent, setSelectedAgent] = useState(agentOptions[0]);
  const [message, setMessage] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [notificationWhatsappPhone, setNotificationWhatsappPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modelSettings, setModelSettings] =
    useState<ModelRuntimeSettings>(defaultModelSettings);
  const [isSending, setIsSending] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isModelSettingsOpen, setIsModelSettingsOpen] = useState(false);
  const [companyDraft, setCompanyDraft] = useState<CompanyOnboardingDraft>(
    createCompanyDraft(),
  );
  const [knowledgeDialog, setKnowledgeDialog] = useState<KnowledgeDialogState | null>(
    null,
  );
  const [selectedDiagnosisSolutionIds, setSelectedDiagnosisSolutionIds] = useState<
    string[]
  >([]);
  const [skippedDiagnosisDataIds, setSkippedDiagnosisDataIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = conversation?.messages ?? [];
  const hasVisitorMessage = messages.some((item) => item.role === "visitor");
  const visibleMessages = hasVisitorMessage ? messages : [];
  const conversationLead =
    lead ?? leads.find((item) => item.conversationId === conversation?.id) ?? null;
  const activeProvider = status?.intelligence.activeProvider ?? "loading";
  const selectedTenant =
    tenants.find((tenant) => tenant.id === selectedTenantId) ?? tenants[0] ?? null;
  const selectedActivationPlan =
    activationPlans.find((plan) => plan.tenantId === selectedTenantId) ?? null;
  const selectedTenantSources = useMemo(
    () =>
      tenantSources.filter(
        (source) => !source.tenantId || source.tenantId === selectedTenantId,
      ),
    [selectedTenantId, tenantSources],
  );
  const filteredHistory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const visibleHistory = history.filter((item) => !isInternalTestConversation(item));
    const matchingHistory = query
      ? visibleHistory.filter((item) => {
          const title = conversationTitle(item).toLowerCase();
          const labels = (item.labels ?? []).join(" ").toLowerCase();
          const transcript = item.messages
            .map((messageItem) => messageItem.content)
            .join(" ")
            .toLowerCase();
          return (
            title.includes(query) ||
            labels.includes(query) ||
            transcript.includes(query)
          );
        })
      : visibleHistory;

    return matchingHistory.slice(0, 30);
  }, [history, searchQuery]);

  const refreshOperationalData = useCallback(async () => {
    const [
      nextAnalytics,
      nextOperations,
      nextDiagnosis,
      nextLearning,
      nextHistory,
      nextLeads,
      nextStatus,
      nextTenants,
      nextTenantSources,
      nextTrainingExamples,
      nextActivationPlans,
    ] =
      await Promise.allSettled([
        getWebsiteSalesAgentAnalytics(selectedTenantId),
        getWebsiteSalesOperationsReport(selectedTenantId),
        getWebsiteSalesDiagnosisReport({
          tenantId: selectedTenantId,
          selectedSolutionIds: selectedDiagnosisSolutionIds,
          skippedDataRequestIds: skippedDiagnosisDataIds,
        }),
        getWebsiteSalesLearningReport(selectedTenantId),
        listWebsiteSalesAgentConversations(selectedTenantId),
        listWebsiteSalesAgentLeads(selectedTenantId),
        getWebsiteSalesAgentStatus(),
        listAgentTenants(),
        listTenantKnowledgeSources(),
        listWebsiteSalesTrainingExamples(true),
        listWebsiteSalesActivationPlans(selectedTenantId),
      ]);

    if (nextAnalytics.status === "fulfilled") setAnalytics(nextAnalytics.value);
    if (nextOperations.status === "fulfilled") {
      setOperationsReport(nextOperations.value);
    }
    if (nextDiagnosis.status === "fulfilled") {
      setDiagnosisReport(nextDiagnosis.value);
    }
    if (nextLearning.status === "fulfilled") {
      setLearningReport(nextLearning.value);
    }
    if (nextHistory.status === "fulfilled") {
      setHistory(
        [...nextHistory.value]
          .filter((item) => item.messages.some((message) => message.role === "visitor"))
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
      );
    }
    if (nextLeads.status === "fulfilled") setLeads(nextLeads.value);
    if (nextStatus.status === "fulfilled") setStatus(nextStatus.value);
    if (nextTenants.status === "fulfilled") {
      setTenants(nextTenants.value);
      setSelectedTenantId((current) =>
        nextTenants.value.some((tenant) => tenant.id === current)
          ? current
          : nextTenants.value[0]?.id ?? "jaabili-default",
      );
    }
    if (nextTenantSources.status === "fulfilled") {
      setTenantSources(nextTenantSources.value);
    }
    if (nextTrainingExamples.status === "fulfilled") {
      setTrainingExamples(nextTrainingExamples.value.examples);
    }
    if (nextActivationPlans.status === "fulfilled") {
      setActivationPlans(nextActivationPlans.value);
    }
  }, [selectedTenantId, selectedDiagnosisSolutionIds, skippedDiagnosisDataIds]);

  useEffect(() => {
    window.localStorage.setItem("jaabili.websiteSales.tenantId", selectedTenantId);
  }, [selectedTenantId]);

  useEffect(() => {
    const selected = window.localStorage.getItem(
      `jaabili.websiteSales.selectedSolutions.${selectedTenantId}`,
    );
    const skipped = window.localStorage.getItem(
      `jaabili.websiteSales.skippedData.${selectedTenantId}`,
    );
    setSelectedDiagnosisSolutionIds(parseSavedStringArray(selected));
    setSkippedDiagnosisDataIds(parseSavedStringArray(skipped));
  }, [selectedTenantId]);

  useEffect(() => {
    window.localStorage.setItem(
      `jaabili.websiteSales.selectedSolutions.${selectedTenantId}`,
      JSON.stringify(selectedDiagnosisSolutionIds),
    );
  }, [selectedTenantId, selectedDiagnosisSolutionIds]);

  useEffect(() => {
    window.localStorage.setItem(
      `jaabili.websiteSales.skippedData.${selectedTenantId}`,
      JSON.stringify(skippedDiagnosisDataIds),
    );
  }, [selectedTenantId, skippedDiagnosisDataIds]);

  useEffect(() => {
    let active = true;
    getWebsiteSalesAgentReadiness(selectedTenantId)
      .then((report) => {
        if (active) setReadiness(report);
      })
      .catch(() => {
        if (active) setReadiness(null);
      });

    return () => {
      active = false;
    };
  }, [
    selectedTenantId,
    selectedTenantSources.length,
    analytics.leadsCaptured,
    analytics.gradeA,
    trainingExamples.length,
  ]);

  useEffect(() => {
    let active = true;

    listWebsiteSalesActivationPlans(selectedTenantId)
      .then((plans) => {
        if (active) setActivationPlans(plans);
      })
      .catch(() => {
        if (active) setActivationPlans([]);
      });

    return () => {
      active = false;
    };
  }, [selectedTenantId]);

  useEffect(() => {
    setCompanyDraft((current) =>
      createCompanyDraft({
        ...current,
        companyName: selectedTenant?.name ?? current.companyName,
        websiteUrl: selectedTenant?.websiteUrl ?? current.websiteUrl,
        industry: selectedTenant?.industry ?? current.industry,
        contactEmail: selectedTenant?.contactEmail ?? current.contactEmail,
        contactPhone: selectedTenant?.contactPhone ?? current.contactPhone,
      }),
    );
  }, [
    selectedTenant?.name,
    selectedTenant?.websiteUrl,
    selectedTenant?.industry,
    selectedTenant?.contactEmail,
    selectedTenant?.contactPhone,
  ]);

  const applyAgentResult = useCallback(
    (result: AgentReply) => {
      setConversation(result.conversation);
      setLead(result.lead);
      setError(null);
      refreshOperationalData().catch(() => undefined);
    },
    [refreshOperationalData],
  );

  useEffect(() => {
    let active = true;

    async function boot() {
      setIsBooting(true);
      try {
        const settings = await getWebsiteSalesAgentSettings().catch(() => null);
        if (!active) return;
        setNotificationEmail(settings?.notificationEmail ?? "");
        setNotificationWhatsappPhone(settings?.notificationWhatsappPhone ?? "");
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Agent API is unavailable.");
        }
      } finally {
        if (active) setTimeout(() => setIsBooting(false), 450);
      }

      refreshOperationalData().catch(() => undefined);
    }

    boot();
    return () => {
      active = false;
    };
  }, [refreshOperationalData]);

  useEffect(() => {
    const saved = window.localStorage.getItem("jaabili-model-settings");
    if (!saved) return;

    try {
      setModelSettings({ ...defaultModelSettings, ...JSON.parse(saved) });
    } catch {
      window.localStorage.removeItem("jaabili-model-settings");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "jaabili-model-settings",
      JSON.stringify(modelSettings),
    );
  }, [modelSettings]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visibleMessages.length, isSending]);

  useEffect(() => {
    let active = true;
    if (!conversation?.id) {
      setConversationAudit(null);
      return () => {
        active = false;
      };
    }

    getWebsiteSalesConversationAudit(conversation.id)
      .then((audit) => {
        if (active) setConversationAudit(audit);
      })
      .catch(() => {
        if (active) setConversationAudit(null);
      });

    return () => {
      active = false;
    };
  }, [conversation?.id, conversation?.updatedAt]);

  const sendMessage = async (nextMessage = message) => {
    const cleanMessage = nextMessage.trim();
    if (!cleanMessage || isSending) return;

    setIsSending(true);
    setError(null);
    setMessage("");

    try {
      const result = await chatWithWebsiteSalesAgent({
        tenantId: selectedTenantId,
        visitorId,
        conversationId: conversation?.id,
        message: cleanMessage,
        runtime: {
          model: selectedModel,
          temperature: modelSettings.temperature,
          maxResponseWords: modelSettings.maxResponseWords,
          retrievalChunks: modelSettings.retrievalChunks,
          strictGrounding: modelSettings.strictGrounding,
        },
      });
      applyAgentResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Agent request failed.");
      setMessage(cleanMessage);
    } finally {
      setIsSending(false);
    }
  };

  const startCompanySetup = async () => {
    setError(null);
    setMessage("");
    setConversation(null);
    setLead(null);
    setIsOnboardingOpen(true);
    setIsSidebarOpen(false);
  };

  const saveRecipients = async () => {
    setError(null);
    try {
      const settings = await updateWebsiteSalesAgentSettings({
        notificationEmail: notificationEmail.trim() || null,
        notificationWhatsappPhone: notificationWhatsappPhone.trim() || null,
      });
      setNotificationEmail(settings.notificationEmail ?? "");
      setNotificationWhatsappPhone(settings.notificationWhatsappPhone ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save recipients.");
    }
  };

  const addKnowledgeSource = async (input: {
    title: string;
    category: string;
    sourceType?: KnowledgeSource["sourceType"];
    url?: string;
    text?: string;
  }) => {
    setError(null);
    try {
      await registerTenantKnowledgeSource({
        ...input,
        tenantId: selectedTenantId,
      });
      await refreshOperationalData();
      setKnowledgeDialog(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add knowledge.");
      throw err;
    }
  };

  const updateConversationLabels = async (labels: string[]) => {
    if (!conversation) return;

    setError(null);
    try {
      const updated = await updateWebsiteSalesConversationLabels(
        conversation.id,
        labels,
      );
      setConversation(updated);
      setHistory((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update labels.");
    }
  };

  const attachFile = async (file: File) => {
    const supported = /\.(txt|md|csv|json|pdf|docx)$/i.test(file.name);
    if (!supported) {
      setError("Upload PDF, DOCX, TXT, Markdown, CSV, or JSON.");
      return;
    }

    setError(null);
    try {
      await uploadTenantKnowledgeFile({
        tenantId: selectedTenantId,
        file,
        title: file.name,
        sourceType: "document",
      });
      await refreshOperationalData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload file.");
    }
  };

  const createTenant = async (input: {
    id?: string;
    name: string;
    websiteUrl?: string | null;
    industry?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  }): Promise<AgentTenant | null> => {
    setError(null);
    try {
      const tenant = await createAgentTenant({
        ...input,
        activeAgentProfile: "website-sales",
      });
      setTenants((items) => [
        tenant,
        ...items.filter((item) => item.id !== tenant.id),
      ]);
      setSelectedTenantId(tenant.id);
      await refreshOperationalData();
      setSelectedTenantId(tenant.id);
      return tenant;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create client.");
      return null;
    }
  };

  const saveOnboardingCompany = async () => {
    const cleanName =
      companyDraft.companyName.trim() || selectedTenant?.name || "Client company";
    return createTenant({
      id:
        selectedTenant && selectedTenant.id !== "jaabili-default"
          ? selectedTenant.id
          : undefined,
      name: cleanName,
      websiteUrl: companyDraft.websiteUrl.trim() || null,
      industry: companyDraft.industry.trim() || null,
      contactEmail: companyDraft.contactEmail.trim() || null,
      contactPhone: companyDraft.contactPhone.trim() || null,
    });
  };

  const generateActivationPlan = async (profileOverride?: CompanyProfileInput) => {
    setError(null);
    setIsActivationWorking(true);
    try {
      const plan = await analyzeWebsiteSalesActivation({
        tenantId: selectedTenantId,
        companyProfile: profileOverride ?? {
          companyName: selectedTenant?.name ?? "Client company",
          websiteUrl: selectedTenant?.websiteUrl ?? undefined,
          industry: selectedTenant?.industry ?? undefined,
          targetCustomers: "Website visitors and high-intent inbound buyers",
          primaryOffer: "Company products or services from approved sources",
          salesGoal: "Increase qualified website leads and sales conversations",
          currentChannels: ["website", "whatsapp", "email"],
        },
        promoAssets: selectedTenantSources.slice(0, 6).map((source) => ({
          name: source.title,
          type:
            source.sourceType === "pricing"
              ? "offer"
              : source.sourceType === "website" ||
                  source.sourceType === "document" ||
                  source.sourceType === "faq" ||
                  source.sourceType === "policy"
                ? "website"
                : "other",
          url: source.url,
          notes: `${source.category} source with ${source.status ?? "ready"} status`,
        })),
      });
      setActivationPlans((plans) => [plan, ...plans.filter((item) => item.id !== plan.id)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate activation plan.");
    } finally {
      setIsActivationWorking(false);
    }
  };

  const approveActivation = async (planId: string) => {
    setError(null);
    setIsActivationWorking(true);
    try {
      const plan = await approveWebsiteSalesActivation(planId);
      setActivationPlans((plans) =>
        plans.map((item) => (item.id === plan.id ? plan : item)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not approve activation.");
    } finally {
      setIsActivationWorking(false);
    }
  };

  const toggleDiagnosisSolution = (solutionId: string) => {
    setSelectedDiagnosisSolutionIds((items) =>
      items.includes(solutionId)
        ? items.filter((item) => item !== solutionId)
        : [...items, solutionId],
    );
  };

  const toggleDiagnosisDataSkip = (dataRequestId: string) => {
    setSkippedDiagnosisDataIds((items) =>
      items.includes(dataRequestId)
        ? items.filter((item) => item !== dataRequestId)
        : [...items, dataRequestId],
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0d0f12] text-white">
      <AgentPreloader show={isBooting} />
      <div className="flex h-full">
          <ChatSidebar
          conversations={filteredHistory}
          activeConversationId={conversation?.id ?? null}
          searchQuery={searchQuery}
          tenantSourceCount={selectedTenantSources.length}
          workspaceName={selectedTenant?.name ?? "Jaabili Technologies"}
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onClose={() => setIsSidebarOpen(false)}
          onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)}
          onNewChat={startCompanySetup}
          onSearchQueryChange={setSearchQuery}
          onOpenLibrary={() => {
            setIsLibraryOpen(true);
            setIsSidebarOpen(false);
          }}
          onOpenModelSettings={() => {
            setIsModelSettingsOpen(true);
            setIsSidebarOpen(false);
          }}
          onOpenInspector={() => {
            setIsInspectorOpen(true);
            setIsSidebarOpen(false);
          }}
          onSelect={(item) => {
            setConversation(item);
            setLead(leads.find((leadItem) => leadItem.conversationId === item.id) ?? null);
            setIsSidebarOpen(false);
          }}
        />

        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(28,54,145,0.28),transparent_32%),radial-gradient(circle_at_50%_55%,rgba(16,184,166,0.09),transparent_26%)]" />
      <TopBar
            selectedAgent={selectedAgent ?? agentOptions[0]}
            activeProvider={activeProvider}
            onAgentChange={setSelectedAgent}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onOpenInspector={() => setIsInspectorOpen(true)}
          />

          <section className="relative flex min-h-0 flex-1 flex-col">
            <EmptyComposerState
              message={message}
              messages={visibleMessages}
              selectedModel={selectedModel}
              isSending={isSending}
              isSimulatorOpen={isSimulatorOpen}
              error={error}
              analytics={analytics}
              readiness={readiness}
              sourceCount={selectedTenantSources.length}
              activationPlan={selectedActivationPlan}
              diagnosisReport={diagnosisReport}
              learningReport={learningReport}
              lead={conversationLead}
              messagesEndRef={messagesEndRef}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onToggleSimulator={() => setIsSimulatorOpen((value) => !value)}
              onMessageChange={setMessage}
              onModelChange={setSelectedModel}
              onSend={() => sendMessage()}
              onAttachFile={attachFile}
              onOpenKnowledgeDialog={setKnowledgeDialog}
              onPrompt={(prompt) => sendMessage(promptMessages[prompt] ?? prompt)}
            />
          </section>
        </main>

        <InspectorDrawer
          isOpen={isInspectorOpen}
          status={status}
          analytics={analytics}
          readiness={readiness}
          activationPlan={selectedActivationPlan}
          diagnosisReport={diagnosisReport}
          learningReport={learningReport}
          operationsReport={operationsReport}
          conversationAudit={conversationAudit}
          isActivationWorking={isActivationWorking}
          lead={conversationLead}
          tenantSources={selectedTenantSources}
          tenant={selectedTenant}
          conversation={conversation}
          notificationEmail={notificationEmail}
          notificationWhatsappPhone={notificationWhatsappPhone}
          onClose={() => setIsInspectorOpen(false)}
          onEmailChange={setNotificationEmail}
          onWhatsappChange={setNotificationWhatsappPhone}
          onSave={saveRecipients}
          onLabelsChange={updateConversationLabels}
          onGenerateActivation={generateActivationPlan}
          onApproveActivation={approveActivation}
          onToggleDiagnosisSolution={toggleDiagnosisSolution}
          onToggleDiagnosisDataSkip={toggleDiagnosisDataSkip}
        />
        <SourceLibraryDrawer
          isOpen={isLibraryOpen}
          tenant={selectedTenant}
          tenants={tenants}
          sources={selectedTenantSources}
          trainingExamples={trainingExamples}
          learningReport={learningReport}
          status={status}
          onClose={() => setIsLibraryOpen(false)}
          onAddSource={setKnowledgeDialog}
          onCreateTenant={createTenant}
          onTenantChange={setSelectedTenantId}
        />
        <ModelSettingsDrawer
          isOpen={isModelSettingsOpen}
          selectedModel={selectedModel}
          settings={modelSettings}
          onClose={() => setIsModelSettingsOpen(false)}
          onModelChange={setSelectedModel}
          onSettingsChange={setModelSettings}
        />
        <CompanyOnboardingDrawer
          isOpen={isOnboardingOpen}
          draft={companyDraft}
          tenant={selectedTenant}
          sources={selectedTenantSources}
          readiness={readiness}
          activationPlan={selectedActivationPlan}
          diagnosisReport={diagnosisReport}
          isWorking={isActivationWorking}
          onClose={() => setIsOnboardingOpen(false)}
          onDraftChange={setCompanyDraft}
          onSaveCompany={saveOnboardingCompany}
          onAddSource={setKnowledgeDialog}
          onGenerateActivation={() =>
            generateActivationPlan(companyDraftToProfile(companyDraft, selectedTenant))
          }
          onApproveActivation={approveActivation}
        />
        <KnowledgeDialog
          state={knowledgeDialog}
          onClose={() => setKnowledgeDialog(null)}
          onSubmit={addKnowledgeSource}
        />
      </div>
    </div>
  );
}

type KnowledgeDialogState =
  | { type: "website"; title: string; category: string }
  | { type: "document"; title: string; category: string }
  | { type: "faq"; title: string; category: string }
  | { type: "pricing"; title: string; category: string }
  | { type: "policy"; title: string; category: string };

function AgentPreloader({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#0d0f12]">
      <div className="absolute size-72 rounded-full bg-[radial-gradient(circle,rgba(245,182,66,0.18),transparent_62%)] blur-2xl" />
      <div className="relative flex flex-col items-center">
        <div className="jaabili-mandala flex size-36 items-center justify-center rounded-full bg-[#17191e]">
          <img src={logo} alt="Jaabili" className="h-20 w-auto object-contain" />
        </div>
        <div className="mt-6 text-sm text-white/70">Opening Jaabili Agent Lab</div>
        <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="jaabili-loader-line h-full rounded-full bg-gradient-to-r from-[#ff8a3d] via-white to-[#10b8a6]" />
        </div>
      </div>
    </div>
  );
}

function ChatSidebar({
  conversations,
  activeConversationId,
  searchQuery,
  tenantSourceCount,
  workspaceName,
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
  onNewChat,
  onSearchQueryChange,
  onOpenLibrary,
  onOpenInspector,
  onOpenModelSettings,
  onSelect,
}: {
  conversations: ConversationRecord[];
  activeConversationId: string | null;
  searchQuery: string;
  tenantSourceCount: number;
  workspaceName: string;
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  onNewChat: () => void;
  onSearchQueryChange: (value: string) => void;
  onOpenLibrary: () => void;
  onOpenInspector: () => void;
  onOpenModelSettings: () => void;
  onSelect: (conversation: ConversationRecord) => void;
}) {
  return (
    <>
      <button
        className={cn(
          "fixed inset-0 z-40 bg-black/60 md:hidden",
          isOpen ? "block" : "hidden",
        )}
        onClick={onClose}
        aria-label="Close sidebar overlay"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col bg-[#1f1f1f] transition-all md:relative md:z-auto md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed && "md:w-[4.5rem]",
        )}
      >
        <div className="flex h-14 items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Jaabili" className="h-8 w-8 object-contain" />
            {!isCollapsed && (
              <span className="leading-tight">
                <span className="block text-sm font-semibold">Jaabili</span>
                <span className="block text-[11px] text-white/36">Sales Agent</span>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={isOpen ? onClose : onToggleCollapse}
            className="inline-flex size-8 items-center justify-center rounded-full text-white/55 hover:bg-white/10"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isOpen ? (
              <X className="size-5 md:hidden" />
            ) : isCollapsed ? (
              <PanelLeftOpen className="hidden size-4 md:block" />
            ) : (
              <PanelLeftClose className="hidden size-4 md:block" />
            )}
          </button>
        </div>

        <nav className="space-y-1 px-3">
          {!isCollapsed && (
            <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/32">
              Agent workspace
            </div>
          )}
          <SidebarAction icon={Target} label="Start setup" active onClick={onNewChat} collapsed={isCollapsed} />
          <SidebarAction
            icon={LayoutGrid}
            label={`Sources${tenantSourceCount ? ` (${tenantSourceCount})` : ""}`}
            onClick={onOpenLibrary}
            collapsed={isCollapsed}
          />
          <SidebarAction
            icon={TrendingUp}
            label="Analysis"
            onClick={onOpenInspector}
            collapsed={isCollapsed}
          />
          <label className={cn("flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-medium text-white/75 transition focus-within:bg-[#111]", isCollapsed && "justify-center")}>
            <Search className="size-5 shrink-0" />
            {!isCollapsed && (
              <input
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder="Search tests"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/55"
              />
            )}
          </label>
        </nav>

        {!isCollapsed && <div className="mt-6 px-4 text-xs font-medium text-white/45">Test history</div>}
        <div className="mt-2 min-h-0 flex-1 overflow-y-auto px-2">
          {isCollapsed ? null : conversations.length === 0 ? (
            <div className="px-3 text-sm text-white/35">No tests yet.</div>
          ) : (
            conversations.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className={cn(
                    "mb-1 flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left text-[13px] transition",
                  activeConversationId === item.id
                    ? "bg-[#111] text-white"
                    : "text-white/70 hover:bg-white/8",
                )}
              >
                <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-white/45" />
                <span className="min-w-0">
                  <span className="block truncate">{conversationTitle(item)}</span>
                  <span className="mt-0.5 block text-[11px] text-white/35">
                    {new Date(item.updatedAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {(item.labels ?? []).length > 0 && (
                    <span className="mt-2 flex flex-wrap gap-1">
                      {(item.labels ?? []).slice(0, 2).map((label) => (
                        <span
                          key={label}
                          className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/45"
                        >
                          {label}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
              </button>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={onOpenModelSettings}
          className={cn("flex h-16 items-center gap-3 border-t border-white/8 px-3 text-left transition hover:bg-white/8", isCollapsed && "justify-center")}
        >
          <img src={logo} alt={workspaceName} className="size-7 object-contain" />
          {!isCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium">{workspaceName}</div>
                <div className="text-xs text-white/40">Model settings</div>
              </div>
              <Settings className="size-5 text-white/50" />
            </>
          )}
        </button>
      </aside>
    </>
  );
}

function SidebarAction({
  icon: Icon,
  label,
  active,
  collapsed,
  onClick,
}: {
  icon: typeof Plus;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-medium transition",
        collapsed && "justify-center",
        active ? "bg-[#111] text-white" : "text-white/75 hover:bg-white/8",
      )}
    >
      <Icon className="size-5" />
      {!collapsed && label}
    </button>
  );
}

function TopBar({
  selectedAgent,
  activeProvider,
  onAgentChange,
  onOpenSidebar,
  onOpenOnboarding,
  onOpenInspector,
}: {
  selectedAgent: string;
  activeProvider: string;
  onAgentChange: (value: string) => void;
  onOpenSidebar: () => void;
  onOpenOnboarding: () => void;
  onOpenInspector: () => void;
}) {
  return (
    <header className="relative z-20 flex h-[3.25rem] items-center justify-between border-b border-white/[0.04] px-3 md:px-5">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="hidden h-8 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/65 hover:bg-white/10 hover:text-white lg:inline-flex"
        >
          <LayoutGrid className="size-4" />
          Dashboard
        </Link>
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex size-9 items-center justify-center rounded-full text-white/65 hover:bg-white/10 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="size-5" />
        </button>
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-[#15171b] px-3 py-1.5 text-xs text-white/58 sm:flex">
          <Target className="size-3.5 text-[#72f2df]" />
          Website Sales Agent
        </div>
        <DropdownSelect
          value={selectedAgent}
          options={agentOptions.map((agent) => ({ value: agent, label: agent }))}
          onChange={onAgentChange}
          className="max-w-[58vw] md:max-w-none"
        />
        <span className="hidden rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/38 lg:inline-flex">
          {activeProvider}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenOnboarding}
          className="hidden h-8 items-center gap-2 rounded-full border border-[#10b8a6]/20 bg-[#10b8a6]/8 px-3 text-xs font-medium text-[#9cf5ea] hover:bg-[#10b8a6]/12 sm:inline-flex"
        >
          <Target className="size-4" />
          Setup
        </button>
        <button
          type="button"
          onClick={onOpenOnboarding}
          className="inline-flex size-9 items-center justify-center rounded-full text-white/65 hover:bg-white/10 sm:hidden"
          aria-label="Onboard company"
        >
          <Target className="size-5" />
        </button>
        <button
          type="button"
          onClick={onOpenInspector}
          className="inline-flex size-9 items-center justify-center rounded-full text-white/65 hover:bg-white/10"
          aria-label="Open inspector"
        >
          <PanelRight className="size-5" />
        </button>
      </div>
    </header>
  );
}

function DropdownSelect({
  value,
  options,
  onChange,
  className,
}: {
  value: string;
  options: Array<{ value: string; label: string; description?: string }>;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        className="flex h-9 max-w-full items-center gap-2 rounded-full border border-white/10 bg-[#1f1f1f]/95 px-3 text-left text-xs font-medium text-white shadow-lg shadow-black/10 transition hover:border-white/20 hover:bg-[#272727] focus:border-[#8ab4ff]/70 focus:outline-none"
      >
        <span className="min-w-0 truncate">{selected?.label}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-white/55 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="jaabili-pop-in absolute left-0 top-10 z-50 max-h-72 min-w-60 overflow-y-auto rounded-2xl border border-white/10 bg-[#262626] p-1 shadow-2xl shadow-black/40">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs transition",
                option.value === value
                  ? "bg-white/10 text-white"
                  : "text-white/65 hover:bg-white/8 hover:text-white",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate">{option.label}</span>
                {option.description && (
                  <span className="mt-0.5 block truncate text-xs text-white/35">
                    {option.description}
                  </span>
                )}
              </span>
              {option.value === value && (
                <Check className="size-4 shrink-0 text-[#8ab4ff]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyComposerState({
  message,
  messages,
  selectedModel,
  isSending,
  isSimulatorOpen,
  error,
  analytics,
  readiness,
  sourceCount,
  activationPlan,
  diagnosisReport,
  learningReport,
  lead,
  messagesEndRef,
  onOpenOnboarding,
  onToggleSimulator,
  onMessageChange,
  onModelChange,
  onSend,
  onAttachFile,
  onOpenKnowledgeDialog,
  onPrompt,
}: {
  message: string;
  messages: ConversationRecord["messages"];
  selectedModel: string;
  isSending: boolean;
  isSimulatorOpen: boolean;
  error: string | null;
  analytics: AgentAnalytics;
  readiness: AgentReadinessReport | null;
  sourceCount: number;
  activationPlan: WebsiteSalesActivationPlan | null;
  diagnosisReport: WebsiteSalesDiagnosisReport | null;
  learningReport: WebsiteSalesLearningReport | null;
  lead: LeadProfile | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onOpenOnboarding: () => void;
  onToggleSimulator: () => void;
  onMessageChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onSend: () => void;
  onAttachFile: (file: File) => void;
  onOpenKnowledgeDialog: (state: KnowledgeDialogState) => void;
  onPrompt: (prompt: string) => void;
}) {
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    surfaceRef.current?.scrollTo({ top: 0 });
  }, []);

  return (
    <div
      ref={surfaceRef}
      className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col justify-start overflow-y-auto px-3 pb-6 pt-5 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <SalesCommandCenter
        analytics={analytics}
        readiness={readiness}
        sourceCount={sourceCount}
        activationPlan={activationPlan}
        diagnosisReport={diagnosisReport}
        learningReport={learningReport}
        onOpenOnboarding={onOpenOnboarding}
        onOpenKnowledgeDialog={onOpenKnowledgeDialog}
      />

      <AgentBuildWorkspace
        sourceCount={sourceCount}
        activationPlan={activationPlan}
        diagnosisReport={diagnosisReport}
        readiness={readiness}
        onOpenOnboarding={onOpenOnboarding}
        onOpenKnowledgeDialog={onOpenKnowledgeDialog}
      />

      <VisitorSimulatorPanel
        isOpen={isSimulatorOpen}
        messages={messages}
        message={message}
        selectedModel={selectedModel}
        isSending={isSending}
        activationPlan={activationPlan}
        lead={lead}
        analytics={analytics}
        readiness={readiness}
        messagesEndRef={messagesEndRef}
        onToggle={onToggleSimulator}
        onMessageChange={onMessageChange}
        onModelChange={onModelChange}
        onSend={onSend}
        onAttachFile={onAttachFile}
        onOpenKnowledgeDialog={onOpenKnowledgeDialog}
        onPrompt={onPrompt}
      />

      {error && <div className="mt-4 text-sm text-red-300">{error}</div>}
    </div>
  );
}

function AgentBuildWorkspace({
  sourceCount,
  activationPlan,
  diagnosisReport,
  readiness,
  onOpenOnboarding,
  onOpenKnowledgeDialog,
}: {
  sourceCount: number;
  activationPlan: WebsiteSalesActivationPlan | null;
  diagnosisReport: WebsiteSalesDiagnosisReport | null;
  readiness: AgentReadinessReport | null;
  onOpenOnboarding: () => void;
  onOpenKnowledgeDialog: (state: KnowledgeDialogState) => void;
}) {
  const neededData = diagnosisReport?.dataRequests.filter(
    (request) => request.status === "needed",
  ) ?? [];
  const selectedSolutions = diagnosisReport?.solutionOptions.filter(
    (solution) => solution.status === "selected",
  ) ?? [];
  const nextActions = readiness?.nextActions.slice(0, 3) ?? [
    "Add company website and key offer pages.",
    "Upload pricing, FAQs, policy, and proof documents.",
    "Generate analysis before approving live automation.",
  ];

  return (
    <section className="jaabili-rise-in mx-auto w-full max-w-6xl space-y-3">
      <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-white/8 bg-[#111]/85 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Company intake</div>
              <div className="mt-1 text-xs text-white/42">
                Collect the business context before analysis starts.
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-[#dbe8ff]"
            >
              Open
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ["Company profile", "Brand, category, locations, contact owner"],
              ["Sales goal", "Leads, bookings, orders, demos, renewal target"],
              ["Customer profile", "ICP, buyer pains, objections, decision path"],
              ["Channels", "Website, WhatsApp, email, campaigns, handoff rules"],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl bg-black/22 p-3">
                <div className="text-[13px] font-medium text-white/86">{title}</div>
                <div className="mt-1 text-xs leading-5 text-white/42">{body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#111]/85 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Source room</div>
              <div className="mt-1 text-xs text-white/42">
                Add the approved website, offers, policies, FAQs, and assets.
              </div>
            </div>
            <div className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/60">
              {sourceCount} source{sourceCount === 1 ? "" : "s"}
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {sourceOptions.slice(0, 4).map((source) => {
              const Icon = source.icon;
              return (
                <button
                  key={source.type}
                  type="button"
                  onClick={() =>
                    onOpenKnowledgeDialog({
                      type: source.type,
                      title: source.title,
                      category: source.category,
                    })
                  }
                  className="flex min-h-14 items-start gap-3 rounded-2xl border border-white/8 bg-black/22 p-3 text-left transition hover:border-[#10b8a6]/35 hover:bg-[#10b8a6]/8"
                >
                  <Icon className={cn("mt-0.5 size-4 shrink-0", source.iconClassName)} />
                  <span>
                    <span className="block text-sm font-medium text-white/82">
                      Add {source.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-white/38">
                      {source.type === "website"
                        ? "Landing pages, products, offers, and CTAs"
                        : source.type === "faq"
                          ? "Common buyer questions and sales objections"
                          : source.type === "pricing"
                            ? "Packages, discounts, eligibility, and boundaries"
                            : source.type === "policy"
                              ? "Delivery, refund, cancellation, and handoff rules"
                              : "Brochures, proof, catalogues, and campaign assets"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-[#8ab4ff]/12 bg-[#101827]/90 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Analysis board</div>
              <div className="mt-1 text-xs text-white/42">
                Jaabili studies the company, finds sales leaks, and requests only useful missing data.
              </div>
            </div>
            <span className="rounded-full bg-black/25 px-3 py-1 text-xs text-[#bcd4ff]">
              {activationPlan ? "analysis generated" : "waiting for setup"}
            </span>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <AnalysisTile
              title="What is wrong"
              value={diagnosisReport?.issues[0]?.title ?? "Needs diagnosis"}
              body={diagnosisReport?.issues[0]?.impact ?? "Generate analysis after adding client details and sources."}
            />
            <AnalysisTile
              title="Missing data"
              value={`${neededData.length} request${neededData.length === 1 ? "" : "s"}`}
              body={neededData[0]?.reason ?? "No open request yet. The agent will ask only for useful sales data."}
            />
            <AnalysisTile
              title="Chosen playbook"
              value={selectedSolutions[0]?.title ?? "Not selected"}
              body={selectedSolutions[0]?.expectedOutcome ?? "Select the solution the company wants the agent to execute."}
            />
          </div>
          <div className="mt-3 rounded-2xl bg-black/20 p-3">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-white/35">
              Next best actions
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              {nextActions.map((action) => (
                <div key={action} className="rounded-xl bg-white/[0.04] px-3 py-2 text-xs leading-5 text-white/56">
                  {action}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#10b8a6]/12 bg-[#0d1716] p-4">
          <div className="text-sm font-semibold text-white">Launch control</div>
          <div className="mt-1 text-xs text-white/42">
            Automation starts only after consent and approved sources.
          </div>
          <div className="mt-4 space-y-2">
            {[
              ["Company approved analysis", Boolean(activationPlan)],
              ["Consent approved", Boolean(activationPlan?.consentApproved)],
              ["Ready to pilot", Boolean(readiness?.readyToPilot)],
            ].map(([label, done]) => (
              <div key={String(label)} className="flex items-center justify-between rounded-2xl bg-black/22 px-3 py-2">
                <span className="text-sm text-white/68">{label}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs", done ? "bg-[#10b8a6]/15 text-[#8ff4e8]" : "bg-white/8 text-white/45")}>
                  {done ? "done" : "pending"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-3">
            <div className="text-xs font-medium text-white/65">24/7 work preview</div>
            <div className="mt-2 grid gap-2 text-xs leading-5 text-white/45">
              <div>Answer buyer questions from approved knowledge.</div>
              <div>Capture need, budget, timeline, contact, and consent.</div>
              <div>Route hot leads to email, WhatsApp, and CRM handoff queue.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnalysisTile({
  title,
  value,
  body,
}: {
  title: string;
  value: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
      <div className="text-xs text-white/38">{title}</div>
      <div className="mt-2 line-clamp-2 text-sm font-semibold text-white/86">{value}</div>
      <div className="mt-2 line-clamp-3 text-xs leading-5 text-white/42">{body}</div>
    </div>
  );
}

function VisitorSimulatorPanel({
  isOpen,
  messages,
  message,
  selectedModel,
  isSending,
  activationPlan,
  lead,
  analytics,
  readiness,
  messagesEndRef,
  onToggle,
  onMessageChange,
  onModelChange,
  onSend,
  onAttachFile,
  onOpenKnowledgeDialog,
  onPrompt,
}: {
  isOpen: boolean;
  messages: ConversationRecord["messages"];
  message: string;
  selectedModel: string;
  isSending: boolean;
  activationPlan: WebsiteSalesActivationPlan | null;
  lead: LeadProfile | null;
  analytics: AgentAnalytics;
  readiness: AgentReadinessReport | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  onMessageChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onSend: () => void;
  onAttachFile: (file: File) => void;
  onOpenKnowledgeDialog: (state: KnowledgeDialogState) => void;
  onPrompt: (prompt: string) => void;
}) {
  const canTest = Boolean(activationPlan);

  return (
    <section className="jaabili-rise-in mx-auto w-full max-w-5xl rounded-3xl border border-white/8 bg-[#111]/75 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-white">Visitor simulator</div>
          <div className="mt-1 text-xs leading-5 text-white/42">
            Use this after analysis to test buyer questions. It is not the main product workspace.
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={!canTest}
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isOpen ? "Hide simulator" : canTest ? "Open simulator" : "Generate analysis first"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-3">
          <ConversationOutcomeStrip lead={lead} analytics={analytics} readiness={readiness} />
          <div className="max-h-72 overflow-y-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {messages.length === 0 ? (
              <div className="rounded-2xl bg-white/[0.03] p-4 text-sm leading-6 text-white/45">
                Start with a realistic visitor question after uploading the client website, FAQs, pricing, and policies.
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((item, index) => (
                  <MessageBubble
                    key={item.id}
                    message={item}
                    animate={index === messages.length - 1}
                  />
                ))}
                {isSending && (
                  <div className="flex items-center gap-3 text-white/45">
                    <Bot className="size-5 text-[#8ab4ff]" />
                    <ThinkingDots />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            {starterPrompts.slice(1, 3).map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onPrompt(prompt)}
                className="min-h-9 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-left text-[12px] text-white/58 transition hover:border-[#8ab4ff]/40 hover:bg-[#8ab4ff]/10 hover:text-white"
              >
                {prompt}
              </button>
            ))}
          </div>
          <Composer
            message={message}
            selectedModel={selectedModel}
            isSending={isSending}
            autoFocus={false}
            onMessageChange={onMessageChange}
            onModelChange={onModelChange}
            onSend={onSend}
            onAttachFile={onAttachFile}
            onOpenKnowledgeDialog={onOpenKnowledgeDialog}
          />
        </div>
      )}
    </section>
  );
}

function SalesCommandCenter({
  analytics,
  readiness,
  sourceCount,
  activationPlan,
  diagnosisReport,
  learningReport,
  onOpenOnboarding,
  onOpenKnowledgeDialog,
}: {
  analytics: AgentAnalytics;
  readiness: AgentReadinessReport | null;
  sourceCount: number;
  activationPlan: WebsiteSalesActivationPlan | null;
  diagnosisReport: WebsiteSalesDiagnosisReport | null;
  learningReport: WebsiteSalesLearningReport | null;
  onOpenOnboarding: () => void;
  onOpenKnowledgeDialog: (state: KnowledgeDialogState) => void;
}) {
  const qualifiedLeads = analytics.hotLeads + analytics.mediumLeads;
  const conversionRate =
    analytics.totalConversations > 0
      ? Math.round((analytics.leadsCaptured / analytics.totalConversations) * 100)
      : 0;
  const sourceProgress = Math.min(sourceCount, sourceOptions.length);
  const diagnosisOpenItems =
    diagnosisReport?.dataRequests.filter((request) => request.status === "needed")
      .length ?? 0;
  const selectedSolutions =
    diagnosisReport?.solutionOptions.filter((solution) => solution.status === "selected")
      .length ?? 0;
  const currentStage = activationPlan?.consentApproved
    ? learningReport && learningReport.labelStats.labeledConversations >= 5
      ? "Pilot learning"
      : "Live pilot"
    : activationPlan
      ? "Consent review"
      : sourceProgress >= 3
        ? "Analysis ready"
        : "Setup";

  return (
    <div className="jaabili-rise-in mx-auto mb-4 w-full max-w-6xl">
      <div className="mb-4 rounded-2xl border border-white/8 bg-[#111]/85 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#10b8a6]/25 bg-[#10b8a6]/8 px-3 py-1 text-xs font-medium text-[#8ff4e8]">
              <Target className="size-3.5" />
              Website Sales Agent
            </div>
            <h1 className="max-w-3xl text-2xl font-semibold tracking-normal text-white/92 md:text-[1.9rem]">
              Prepare a website sales agent that studies the company before it starts working.
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
              Add company details, approved sources, pricing, policies, and assets. Jaabili then diagnoses sales gaps, recommends playbooks, asks for missing data, and waits for launch consent.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border border-[#8ab4ff]/20 bg-[#101827] px-4 py-3">
            <div className="text-xs uppercase tracking-[0.16em] text-white/35">
              Current stage
            </div>
            <div className="mt-1 text-lg font-semibold text-[#bcd4ff]">
              {currentStage}
            </div>
            <div className="mt-1 text-xs text-white/42">
              {activationPlan?.consentApproved
                ? "Agent can operate from approved sources."
                : "Complete setup before live automation."}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-5">
          <FlowStepCard
            index={1}
            title="Company"
            body="Profile, offer, ICP, channels"
            done={sourceProgress > 0 || Boolean(activationPlan)}
          />
          <FlowStepCard
            index={2}
            title="Knowledge"
            body={`${sourceProgress}/${sourceOptions.length} sources ready`}
            done={sourceProgress >= sourceOptions.length}
          />
          <FlowStepCard
            index={3}
            title="Diagnosis"
            body={
              diagnosisReport
                ? `${diagnosisOpenItems} open data request${diagnosisOpenItems === 1 ? "" : "s"}`
                : "Generate sales analysis"
            }
            done={Boolean(diagnosisReport)}
          />
          <FlowStepCard
            index={4}
            title="Solutions"
            body={`${selectedSolutions} playbook${selectedSolutions === 1 ? "" : "s"} selected`}
            done={selectedSolutions > 0}
          />
          <FlowStepCard
            index={5}
            title="Launch"
            body={activationPlan?.consentApproved ? "Consent approved" : "Needs approval"}
            done={Boolean(activationPlan?.consentApproved)}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-black transition hover:bg-[#dbe8ff]"
          >
            <Target className="size-4" />
            Set up company
          </button>
          {sourceOptions.slice(0, 3).map((source) => {
            const Icon = source.icon;
            return (
              <button
                key={source.type}
                type="button"
                onClick={() =>
                  onOpenKnowledgeDialog({
                    type: source.type,
                    title: source.title,
                    category: source.category,
                  })
                }
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 text-sm text-white/70 transition hover:bg-white/8"
              >
                <Icon className={cn("size-4", source.iconClassName)} />
                Add {source.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <SalesSignalCard
          icon={MessageSquare}
          label="Conversations"
          value={analytics.totalConversations}
          tone="blue"
        />
        <SalesSignalCard
          icon={CircleDollarSign}
          label="Leads captured"
          value={analytics.leadsCaptured}
          tone="green"
        />
        <SalesSignalCard
          icon={TrendingUp}
          label="Qualified"
          value={qualifiedLeads}
          tone="gold"
        />
        <SalesSignalCard
          icon={Clock3}
          label={`${conversionRate}% lead conversion`}
          value={sourceCount}
          suffix={sourceCount === 1 ? "source" : "sources"}
          tone="violet"
        />
      </div>

      <div className="mt-3 grid gap-2 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-white/40">
            <span>Agent operating loop</span>
            <span>setup to launch to learning</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-4">
            {[
              ["Study", "Website, offers, proof"],
              ["Diagnose", "Leaks, gaps, risks"],
              ["Operate", "Qualify and route leads"],
              ["Learn", "Labels improve answers"],
            ].map(([title, body], index) => (
              <div key={title} className="rounded-xl bg-[#111]/80 p-3">
                <div className="mb-1.5 flex size-5 items-center justify-center rounded-full bg-white/8 text-[11px] text-white/70">
                  {index + 1}
                </div>
                <div className="text-sm font-medium text-white/86">{title}</div>
                <div className="mt-1 text-xs leading-5 text-white/38">{body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <ReadinessSummaryCard readiness={readiness} />
          <LearningSummaryCard learningReport={learningReport} />
        </div>
      </div>
    </div>
  );
}

function FlowStepCard({
  index,
  title,
  body,
  done,
}: {
  index: number;
  title: string;
  body: string;
  done: boolean;
}) {
  return (
    <div
      className={cn(
        "min-h-24 rounded-2xl border p-3",
        done
          ? "border-[#10b8a6]/25 bg-[#10b8a6]/8"
          : "border-white/8 bg-black/20",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
            done ? "bg-[#10b8a6]/20 text-[#8ff4e8]" : "bg-white/8 text-white/55",
          )}
        >
          {done ? <Check className="size-3.5" /> : index}
        </span>
      </div>
      <div className="text-sm font-semibold text-white/88">{title}</div>
      <div className="mt-1 text-xs leading-5 text-white/42">{body}</div>
    </div>
  );
}

function ReadinessSummaryCard({
  readiness,
}: {
  readiness: AgentReadinessReport | null;
}) {
  return (
    <div className="rounded-2xl border border-[#ffb74d]/15 bg-[#ffb74d]/5 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium text-[#ffd28a]">Readiness</div>
        <div className="rounded-full bg-black/25 px-2 py-0.5 text-xs text-white/75">
          {readiness ? `${readiness.grade} / ${readiness.score}` : "checking"}
        </div>
      </div>
      <div className="mt-2 text-sm leading-6 text-white/65">
        {readiness
          ? readiness.readyToPilot
            ? "Ready for controlled pilot testing."
            : readiness.nextActions[0] ?? "Add more client data before publishing."
          : "Checking sources, lead quality, and labels."}
      </div>
      {readiness?.gaps[0] && (
        <div className="mt-2 rounded-xl bg-black/20 px-3 py-2 text-xs leading-5 text-white/48">
          Gap: {readiness.gaps[0]}
        </div>
      )}
    </div>
  );
}

function LearningSummaryCard({
  learningReport,
}: {
  learningReport: WebsiteSalesLearningReport | null;
}) {
  return (
    <div className="rounded-2xl border border-[#8ab4ff]/15 bg-[#101827] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium text-[#bcd4ff]">Learning loop</div>
        <div className="rounded-full bg-black/25 px-2 py-0.5 text-xs text-white/75">
          {learningReport ? `${learningReport.learningScore}/100` : "waiting"}
        </div>
      </div>
      <div className="mt-2 text-sm leading-6 text-white/65">
        {learningReport
          ? learningReport.nextTrainingStep
          : "Run test chats and label answers after launch consent."}
      </div>
      {learningReport && (
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/45">
          <span className="rounded-full bg-white/8 px-2 py-1">
            {learningReport.stage}
          </span>
          <span className="rounded-full bg-white/8 px-2 py-1">
            {learningReport.labelStats.labeledConversations} labeled
          </span>
        </div>
      )}
    </div>
  );
}

function SalesSignalCard({
  icon: Icon,
  label,
  value,
  suffix,
  tone,
}: {
  icon: typeof MessageSquare;
  label: string;
  value: number;
  suffix?: string;
  tone: "blue" | "green" | "gold" | "violet";
}) {
  const tones = {
    blue: "text-[#8ab4ff] bg-[#8ab4ff]/10",
    green: "text-[#72f2df] bg-[#10b8a6]/10",
    gold: "text-[#ffd28a] bg-[#ffb74d]/10",
    violet: "text-[#d9b7ff] bg-[#c58cff]/10",
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-[#111]/85 p-2.5">
      <div className={cn("mb-2 flex size-7 items-center justify-center rounded-full", tones[tone])}>
        <Icon className="size-4" />
      </div>
      <div className="flex items-end gap-1">
        <span className="text-xl font-semibold text-white">{value}</span>
        {suffix && <span className="pb-0.5 text-xs text-white/38">{suffix}</span>}
      </div>
      <div className="mt-0.5 text-xs text-white/42">{label}</div>
    </div>
  );
}

function ConversationState({
  messages,
  message,
  selectedModel,
  isSending,
  error,
  lead,
  analytics,
  readiness,
  messagesEndRef,
  onMessageChange,
  onModelChange,
  onSend,
  onAttachFile,
  onOpenKnowledgeDialog,
}: {
  messages: ConversationRecord["messages"];
  message: string;
  selectedModel: string;
  isSending: boolean;
  error: string | null;
  lead: LeadProfile | null;
  analytics: AgentAnalytics;
  readiness: AgentReadinessReport | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onMessageChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onSend: () => void;
  onAttachFile: (file: File) => void;
  onOpenKnowledgeDialog: (state: KnowledgeDialogState) => void;
}) {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-4">
      <ConversationOutcomeStrip
        lead={lead}
        analytics={analytics}
        readiness={readiness}
      />
      <div className="min-h-0 flex-1 overflow-y-auto pb-5 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-6">
          {messages.map((item, index) => (
            <MessageBubble
              key={item.id}
              message={item}
              animate={index === messages.length - 1}
            />
          ))}
          {isSending && (
            <div className="flex items-center gap-3 text-white/45">
              <Bot className="size-5 text-[#8ab4ff]" />
              <ThinkingDots />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="pb-4">
        {error && <div className="mb-3 text-sm text-red-300">{error}</div>}
        <Composer
          message={message}
          selectedModel={selectedModel}
          isSending={isSending}
          onMessageChange={onMessageChange}
          onModelChange={onModelChange}
          onSend={onSend}
          onAttachFile={onAttachFile}
          onOpenKnowledgeDialog={onOpenKnowledgeDialog}
        />
      </div>
    </div>
  );
}

function ConversationOutcomeStrip({
  lead,
  analytics,
  readiness,
}: {
  lead: LeadProfile | null;
  analytics: AgentAnalytics;
  readiness: AgentReadinessReport | null;
}) {
  return (
    <div className="mt-2 grid gap-2 border-b border-white/8 pb-3 sm:grid-cols-4">
      <OutcomePill
        label="Lead status"
        value={lead ? lead.qualification : "collecting"}
        highlight={lead?.qualification === "hot"}
      />
      <OutcomePill
        label="Contact"
        value={lead?.phone || lead?.email ? "captured" : "missing"}
      />
      <OutcomePill
        label="Grade"
        value={lead ? `${lead.grade} / ${lead.score}` : "pending"}
        highlight={lead?.grade === "A"}
      />
      <OutcomePill
        label="Readiness"
        value={readiness ? `${readiness.grade} / ${readiness.stage}` : "checking"}
        highlight={Boolean(readiness?.readyToPilot)}
      />
    </div>
  );
}

function OutcomePill({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2",
        highlight
          ? "border-[#10b8a6]/25 bg-[#10b8a6]/10"
          : "border-white/8 bg-white/[0.025]",
      )}
    >
      <div className="text-[11px] text-white/38">{label}</div>
      <div className="mt-0.5 truncate text-xs font-medium text-white/75">{value}</div>
    </div>
  );
}

function Composer({
  message,
  selectedModel,
  isSending,
  autoFocus,
  onMessageChange,
  onModelChange,
  onSend,
  onAttachFile,
  onOpenKnowledgeDialog,
}: {
  message: string;
  selectedModel: string;
  isSending: boolean;
  autoFocus?: boolean;
  onMessageChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onSend: () => void;
  onAttachFile: (file: File) => void;
  onOpenKnowledgeDialog: (state: KnowledgeDialogState) => void;
}) {
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="jaabili-composer-glow w-full max-w-[48rem] rounded-[1.65rem] p-px">
      <div className="rounded-[1.65rem] bg-[#222] px-3 py-2.5 shadow-2xl shadow-black/30">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAttachOpen((value) => !value)}
              className={cn(
                "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10",
                isAttachOpen && "bg-white/10 text-white",
              )}
              aria-label="Add source"
            >
              <Plus className={cn("size-5 transition", isAttachOpen && "rotate-45")} />
            </button>
            {isAttachOpen && (
              <AttachmentMenu
                onUpload={() => {
                  setIsAttachOpen(false);
                  fileInputRef.current?.click();
                }}
                onSource={(source) => {
                  setIsAttachOpen(false);
                  onOpenKnowledgeDialog({
                    type: source.type,
                    title: source.title,
                    category: source.category,
                  });
                }}
              />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md,.csv,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onAttachFile(file);
                event.target.value = "";
              }}
            />
          </div>
          <textarea
            value={message}
            autoFocus={autoFocus}
            rows={1}
            onChange={(event) => onMessageChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            placeholder="Ask Jaabili"
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-6 text-white outline-none placeholder:text-white/45"
          />
          <div className="hidden sm:block">
            <DropdownSelect
            value={selectedModel}
            options={modelOptions.map((model) => ({
              value: model.id,
              label: model.label,
              description: model.description,
            }))}
            onChange={onModelChange}
            />
          </div>
          <button
            type="button"
            className="hidden size-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 sm:inline-flex"
            aria-label="Voice input"
          >
            <Mic className="size-5" />
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={!message.trim() || isSending}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-[#dbe8ff] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AttachmentMenu({
  onUpload,
  onSource,
}: {
  onUpload: () => void;
  onSource: (source: (typeof sourceOptions)[number]) => void;
}) {
  return (
    <div className="jaabili-pop-in fixed bottom-32 left-4 right-4 z-40 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#262626] p-2 shadow-2xl shadow-black/40 sm:absolute sm:bottom-14 sm:left-0 sm:right-auto sm:w-64">
      <AttachItem
        icon={Upload}
        label="Upload"
        onClick={onUpload}
      />
      {sourceOptions.map((source) => (
        <AttachItem
          key={source.type}
          icon={source.icon}
          label={source.label}
          onClick={() => onSource(source)}
        />
      ))}
    </div>
  );
}

function AttachItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Upload;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-full items-center gap-3 rounded-2xl px-3 text-left transition hover:bg-white/8"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/8 text-white/80">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 truncate text-sm font-medium">{label}</span>
    </button>
  );
}

function KnowledgeDialog({
  state,
  onClose,
  onSubmit,
}: {
  state: KnowledgeDialogState | null;
  onClose: () => void;
  onSubmit: (input: {
    title: string;
    category: string;
    sourceType?: KnowledgeSource["sourceType"];
    url?: string;
    text?: string;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(state?.title ?? "");
    setBody("");
    setSubmitError(null);
    setIsSubmitting(false);
  }, [state]);

  if (!state) return null;

  const isWebsite = state.type === "website";
  const labels = {
    website: {
      heading: "Add client website",
      body: "Paste the website or service page URL. It will be fetched and added to Jaabilv 2.0 retrieval.",
      placeholder: "https://client.com/services",
      action: "Add website",
    },
    document: {
      heading: "Add client PDF or document",
      body: "Paste approved content from a client PDF, brochure, proposal, or onboarding document.",
      placeholder: "Document title:\nKey facts:\nRules the agent must follow:",
      action: "Add document",
    },
    faq: {
      heading: "Add client FAQs",
      body: "Paste approved FAQs. Keep answers factual and client-approved.",
      placeholder: "Q: What are your timings?\nA: We are open from...",
      action: "Add FAQs",
    },
    pricing: {
      heading: "Add pricing document",
      body: "Paste packages, price ranges, inclusions, and quote rules.",
      placeholder: "Basic package: INR...\nIncludes...",
      action: "Add pricing",
    },
    policy: {
      heading: "Add policy document",
      body: "Paste refund, delivery, support, escalation, or compliance rules.",
      placeholder: "Refund policy:\nDelivery policy:\nEscalation rules:",
      action: "Add policies",
    },
  }[state.type];

  const cleanTitle = title.trim();
  const cleanBody = body.trim();
  const canSubmit = Boolean(cleanTitle && cleanBody && !isSubmitting);
  const submit = async () => {
    if (!canSubmit) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: cleanTitle,
        category: state.category,
        sourceType: state.type,
        ...(isWebsite
          ? { url: normalizeWebsiteUrl(cleanBody) }
          : { text: cleanBody }),
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not add this source.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        className="fixed inset-0 z-[80] bg-black/70"
        onClick={onClose}
        aria-label="Close knowledge dialog"
      />
      <div className="fixed left-1/2 top-1/2 z-[90] w-[34rem] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/10 bg-[#202124] p-5 shadow-2xl shadow-black/50">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{labels.heading}</h2>
            <p className="mt-1 text-sm leading-6 text-white/50">{labels.body}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <label className="mb-4 block text-sm text-white/55">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[#111] px-4 text-white outline-none focus:border-[#8ab4ff]/50"
          />
        </label>

        <label className="block text-sm text-white/55">
          {isWebsite ? "Website URL" : "Approved content"}
          {isWebsite ? (
            <input
              value={body}
              onChange={(event) => setBody(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submit();
                }
              }}
              placeholder={labels.placeholder}
              className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[#111] px-4 text-white outline-none placeholder:text-white/30 focus:border-[#8ab4ff]/50"
            />
          ) : (
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={labels.placeholder}
              rows={8}
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#8ab4ff]/50"
            />
          )}
        </label>

        {submitError && (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100">
            {submitError}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-11 rounded-full px-5 text-sm font-medium text-white/70 hover:bg-white/8"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="inline-flex h-11 min-w-32 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {labels.action}
          </button>
        </div>
      </div>
    </>
  );
}

function normalizeWebsiteUrl(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function MessageBubble({
  message,
  animate,
}: {
  message: ConversationRecord["messages"][number];
  animate?: boolean;
}) {
  const isVisitor = message.role === "visitor";

  return (
    <div className={cn("jaabili-message-in flex gap-3", isVisitor && "justify-end")}>
      {!isVisitor && (
        <div className="mt-2 size-2 shrink-0 rounded-full bg-[#8ab4ff]/70" />
      )}
      <div
        className={cn(
          "max-w-[76%] whitespace-pre-wrap rounded-3xl px-5 py-3 text-[15px] leading-7",
          isVisitor ? "bg-[#2f2f2f] text-white" : "text-white/78",
        )}
      >
        {!isVisitor && animate ? (
          <TypewriterText text={message.content} />
        ) : (
          message.content
        )}
      </div>
      {isVisitor && (
        <div className="mt-2 size-2 shrink-0 rounded-full bg-white/45" />
      )}
    </div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    setVisibleCharacters(0);
    const step = Math.max(1, Math.ceil(text.length / 80));
    const interval = window.setInterval(() => {
      setVisibleCharacters((current) => {
        const next = Math.min(text.length, current + step);
        if (next >= text.length) window.clearInterval(interval);
        return next;
      });
    }, 16);

    return () => window.clearInterval(interval);
  }, [text]);

  return (
    <span className="whitespace-pre-wrap">
      {text.slice(0, visibleCharacters)}
      {visibleCharacters < text.length && (
        <span className="jaabili-type-cursor" aria-hidden="true" />
      )}
    </span>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((item) => (
        <span
          key={item}
          className="size-2 rounded-full bg-white/55 jaabili-thinking-dot"
          style={{ animationDelay: `${item * 140}ms` }}
        />
      ))}
    </div>
  );
}

function InspectorDrawer({
  isOpen,
  status,
  analytics,
  readiness,
  activationPlan,
  diagnosisReport,
  learningReport,
  operationsReport,
  conversationAudit,
  isActivationWorking,
  lead,
  tenant,
  tenantSources,
  conversation,
  notificationEmail,
  notificationWhatsappPhone,
  onClose,
  onEmailChange,
  onWhatsappChange,
  onSave,
  onLabelsChange,
  onGenerateActivation,
  onApproveActivation,
  onToggleDiagnosisSolution,
  onToggleDiagnosisDataSkip,
}: {
  isOpen: boolean;
  status: AgentStatus | null;
  analytics: AgentAnalytics;
  readiness: AgentReadinessReport | null;
  activationPlan: WebsiteSalesActivationPlan | null;
  diagnosisReport: WebsiteSalesDiagnosisReport | null;
  learningReport: WebsiteSalesLearningReport | null;
  operationsReport: WebsiteSalesOperationsReport | null;
  conversationAudit: WebsiteSalesConversationAudit | null;
  isActivationWorking: boolean;
  lead: LeadProfile | null;
  tenant: AgentTenant | null;
  tenantSources: KnowledgeSource[];
  conversation: ConversationRecord | null;
  notificationEmail: string;
  notificationWhatsappPhone: string;
  onClose: () => void;
  onEmailChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
  onSave: () => void;
  onLabelsChange: (labels: string[]) => void;
  onGenerateActivation: () => void;
  onApproveActivation: (planId: string) => void;
  onToggleDiagnosisSolution: (solutionId: string) => void;
  onToggleDiagnosisDataSkip: (dataRequestId: string) => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
        aria-label="Close inspector overlay"
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 w-[23rem] max-w-[92vw] overflow-y-auto bg-[#1f1f1f] p-5 shadow-2xl shadow-black/40"
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Agent inspector</div>
            <div className="text-sm text-white/45">
              {status?.intelligence.modelName ?? "Jaabilv 2.0"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Close inspector"
          >
            <X className="size-5" />
          </button>
        </div>

        <InspectorBlock title="Knowledge">
          <div className="mb-2 rounded-2xl bg-[#111] p-4">
            <div className="truncate text-sm font-medium">
              {tenant?.name ?? "Jaabili Technologies"}
            </div>
            <div className="mt-1 truncate text-xs text-white/40">
              {tenant?.industry ?? tenant?.websiteUrl ?? "Default client workspace"}
            </div>
          </div>
          <div className="rounded-2xl bg-[#111] p-4">
            <div className="flex justify-between text-sm">
              <span>Knowledge base</span>
              <span className="text-[#8ab4ff]">
                {status?.intelligence.knowledge?.chunkCount ?? 0} chunks
              </span>
            </div>
            <div className="mt-1 text-xs text-white/40">
              {status?.intelligence.knowledge?.version ?? "not ingested"}
            </div>
          </div>
          {tenantSources.length > 0 && (
            <div className="mt-2 space-y-2">
              {tenantSources.slice(0, 4).map((source) => (
                <div
                  key={source.id}
                  className="rounded-2xl bg-[#111] px-4 py-3 text-sm"
                >
                  <div className="truncate text-white/80">{source.title}</div>
                  <div className="mt-1 truncate text-xs text-white/35">
                    {source.category} - {source.status ?? "ready"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </InspectorBlock>

        <InspectorBlock title="Sales diagnosis">
          {diagnosisReport ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-[#10b8a6]/20 bg-[#0d241f] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-[0.16em] text-white/35">
                      Deep analysis
                    </div>
                    <div className="mt-1 truncate text-sm font-semibold text-white">
                      {diagnosisReport.companySnapshot.name}
                    </div>
                  </div>
                  <span className="rounded-full bg-black/25 px-2 py-1 text-xs text-[#8ff4e8]">
                    {diagnosisReport.confidence}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  {diagnosisReport.summary}
                </p>
                <p className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs leading-5 text-white/50">
                  {diagnosisReport.consentPrompt}
                </p>
              </div>

              {diagnosisReport.issues.length > 0 && (
                <div className="space-y-2">
                  {diagnosisReport.issues.slice(0, 3).map((issue) => (
                    <div key={issue.id} className="rounded-2xl bg-[#111] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-white/85">
                            {issue.title}
                          </div>
                          <div className="mt-1 text-xs leading-5 text-white/45">
                            {issue.impact}
                          </div>
                        </div>
                        <SeverityPill severity={issue.severity} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-2xl bg-[#111] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs uppercase tracking-[0.16em] text-white/35">
                    Data needed
                  </div>
                  <div className="text-xs text-white/35">
                    {diagnosisReport.dataRequests.filter((item) => item.status === "needed").length} open
                  </div>
                </div>
                <div className="space-y-2">
                  {diagnosisReport.dataRequests.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                      className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm text-white/82">
                            {request.title}
                          </div>
                          <div className="mt-1 text-xs leading-5 text-white/42">
                            {request.reason}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-1 text-[11px]",
                            request.status === "provided" &&
                              "bg-[#10b8a6]/15 text-[#8ff4e8]",
                            request.status === "skipped" &&
                              "bg-white/8 text-white/45",
                            request.status === "needed" &&
                              "bg-[#ffb74d]/15 text-[#ffd28a]",
                          )}
                        >
                          {request.status}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/38">
                        <span className="rounded-full bg-white/8 px-2 py-1">
                          {request.sensitivity}
                        </span>
                        <span className="rounded-full bg-white/8 px-2 py-1">
                          {request.category}
                        </span>
                      </div>
                      {request.canSkip && request.status !== "provided" && (
                        <button
                          type="button"
                          onClick={() => onToggleDiagnosisDataSkip(request.id)}
                          className="mt-3 h-8 rounded-full border border-white/10 px-3 text-xs font-medium text-white/70 transition hover:bg-white/8"
                        >
                          {request.status === "skipped" ? "Need this data" : "Skip for now"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {diagnosisReport.solutionOptions.slice(0, 4).map((solution) => (
                  <button
                    key={solution.id}
                    type="button"
                    onClick={() => onToggleDiagnosisSolution(solution.id)}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition",
                      solution.status === "selected"
                        ? "border-[#8ab4ff]/50 bg-[#101827]"
                        : "border-white/10 bg-[#111] hover:border-white/20",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white/90">
                          {solution.title}
                        </div>
                        <div className="mt-1 text-xs leading-5 text-white/45">
                          {solution.expectedOutcome}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-1 text-[11px]",
                          solution.status === "selected"
                            ? "bg-[#8ab4ff]/15 text-[#bcd4ff]"
                            : "bg-white/8 text-white/45",
                        )}
                      >
                        {solution.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {solution.kpis.slice(0, 3).map((kpi) => (
                        <span
                          key={kpi}
                          className="rounded-full bg-white/8 px-2 py-1 text-[11px] text-white/45"
                        >
                          {kpi}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/60">
                {diagnosisReport.nextBestStep}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#111] p-4 text-sm text-white/40">
              Sales diagnosis is loading.
            </div>
          )}
        </InspectorBlock>

        <InspectorBlock title="24/7 work queue">
          {operationsReport ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-[#8ab4ff]/20 bg-[#101827] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-white/35">
                    Mode
                  </div>
                  <div className="rounded-full bg-white/10 px-2 py-1 text-xs text-[#8ab4ff]">
                    {operationsReport.mode}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  {operationsReport.summary}
                </p>
              </div>
              <div className="space-y-2">
                {operationsReport.actionQueue.slice(0, 4).map((action) => (
                  <div key={action.id} className="rounded-2xl bg-[#111] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-white/85">
                          {action.title}
                        </div>
                        <div className="mt-1 text-xs leading-5 text-white/45">
                          {action.detail}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/38">
                          <span className="rounded-full bg-white/8 px-2 py-1">
                            {action.channel}
                          </span>
                          <span className="rounded-full bg-white/8 px-2 py-1">
                            owner: {action.owner}
                          </span>
                        </div>
                        {action.recommendedMessage ? (
                          <div className="mt-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs leading-5 text-white/58">
                            {action.recommendedMessage}
                          </div>
                        ) : null}
                      </div>
                      <span className={cn(
                        "shrink-0 rounded-full px-2 py-1 text-[11px]",
                        action.priority === "urgent"
                          ? "bg-[#ff4d4d]/15 text-[#ff9b9b]"
                          : action.priority === "high"
                            ? "bg-[#ffb74d]/15 text-[#ffd28a]"
                            : "bg-white/8 text-white/45",
                      )}>
                        {action.due}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Metric label="Open" value={operationsReport.dailyReport.openConversations} />
                <Metric label="A leads" value={operationsReport.dailyReport.gradeALeads} />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#111] p-4 text-sm text-white/40">
              Work queue is loading.
            </div>
          )}
        </InspectorBlock>

        <InspectorBlock title="Learning loop">
          {learningReport ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-[#8ab4ff]/20 bg-[#101827] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.16em] text-white/40">
                    Learning score
                  </span>
                  <span className="text-2xl font-semibold text-[#bcd4ff]">
                    {learningReport.learningScore}
                  </span>
                </div>
                <div className="mt-2 text-xs text-white/45">
                  {learningReport.stage}
                </div>
                <div className="mt-3 text-sm leading-6 text-white/68">
                  {learningReport.summary}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Metric
                  label="Labeled"
                  value={learningReport.labelStats.labeledConversations}
                />
                <Metric
                  label="Training"
                  value={learningReport.labelStats.trainingReady}
                />
                <Metric
                  label="Avg audit"
                  value={learningReport.answerQuality.averageScore}
                />
                <Metric
                  label="Handoffs"
                  value={learningReport.answerQuality.handoff}
                />
              </div>
              {learningReport.sourceGaps.length > 0 && (
                <div className="rounded-2xl bg-[#111] p-4">
                  <div className="mb-2 text-xs uppercase tracking-[0.16em] text-white/35">
                    Source gaps
                  </div>
                  <div className="space-y-1 text-xs leading-5 text-white/55">
                    {learningReport.sourceGaps.slice(0, 4).map((gap) => (
                      <div key={gap}>- {gap}</div>
                    ))}
                  </div>
                </div>
              )}
              {learningReport.insights.slice(0, 3).map((insight) => (
                <div key={insight.id} className="rounded-2xl bg-[#111] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white/85">
                        {insight.title}
                      </div>
                      <div className="mt-1 text-xs leading-5 text-white/45">
                        {insight.improvement}
                      </div>
                    </div>
                    <span className="rounded-full bg-white/8 px-2 py-1 text-[11px] text-white/45">
                      {insight.priority}
                    </span>
                  </div>
                </div>
              ))}
              {learningReport.evalQuestions.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-2 text-xs uppercase tracking-[0.16em] text-white/35">
                    Test next
                  </div>
                  <div className="space-y-2">
                    {learningReport.evalQuestions.slice(0, 3).map((question) => (
                      <div
                        key={question.id}
                        className="rounded-xl bg-white/[0.04] px-3 py-2 text-xs leading-5 text-white/58"
                      >
                        {question.question}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="rounded-2xl bg-[#111] p-4 text-sm leading-6 text-white/60">
                {learningReport.nextTrainingStep}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#111] p-4 text-sm text-white/40">
              Learning report is loading.
            </div>
          )}
        </InspectorBlock>

        <InspectorBlock title="Quality audit">
          {conversationAudit ? (
            <div className="space-y-3">
              <div
                className={cn(
                  "rounded-2xl border p-4",
                  conversationAudit.grade === "handoff"
                    ? "border-[#ff4d4d]/20 bg-[#2a1010]"
                    : conversationAudit.grade === "review"
                      ? "border-[#ffb74d]/20 bg-[#21180b]"
                      : "border-[#10b8a6]/20 bg-[#0d241f]",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.16em] text-white/40">
                    Audit grade
                  </span>
                  <span className="text-lg font-semibold">
                    {conversationAudit.grade}
                  </span>
                </div>
                <div className="mt-2 text-xs text-white/45">
                  Score {conversationAudit.score}/100
                </div>
                <div className="mt-3 text-sm leading-6 text-white/70">
                  {conversationAudit.nextBestAction}
                </div>
              </div>
              {conversationAudit.risks.slice(0, 3).map((risk) => (
                <div key={risk} className="rounded-xl bg-[#111] px-3 py-2 text-xs leading-5 text-white/55">
                  {risk}
                </div>
              ))}
              {conversationAudit.missingLeadFields.length > 0 && (
                <div className="rounded-xl bg-[#111] px-3 py-2 text-xs leading-5 text-white/45">
                  Missing: {conversationAudit.missingLeadFields.join(", ")}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#111] p-4 text-sm text-white/40">
              Open a chat to audit lead quality and response risk.
            </div>
          )}
        </InspectorBlock>

        <InspectorBlock title="Conversation labels">
          {conversation ? (
            <LabelEditor
              labels={conversation.labels ?? []}
              onChange={onLabelsChange}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#111] p-4 text-sm text-white/40">
              Start or open a chat to label it for training.
            </div>
          )}
        </InspectorBlock>

        <InspectorBlock title="Readiness">
          {readiness ? (
            <div className="space-y-2">
              <div className="rounded-2xl border border-[#ffb74d]/20 bg-[#21180b] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.16em] text-white/40">
                    Agent grade
                  </span>
                  <span className="text-2xl font-semibold text-[#ffd28a]">
                    {readiness.grade}
                  </span>
                </div>
                <div className="mt-2 text-xs text-white/45">
                  {readiness.score}/100 - {readiness.stage}
                </div>
                <div className="mt-3 text-sm text-white/72">
                  {readiness.readyToPilot
                    ? "Pilot-ready for controlled traffic."
                    : readiness.nextActions[0] ?? "Add more client data."}
                </div>
              </div>
              {readiness.gaps.slice(0, 3).map((gap) => (
                <div key={gap} className="rounded-xl bg-[#111] px-3 py-2 text-xs text-white/52">
                  {gap}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#111] p-4 text-sm text-white/40">
              Readiness report is loading.
            </div>
          )}
        </InspectorBlock>

        <InspectorBlock title="Install on website">
          <InstallSnippet
            tenant={tenant}
            activationPlan={activationPlan}
            sourceCount={tenantSources.length}
          />
        </InspectorBlock>

        <InspectorBlock title="Activation">
          {activationPlan ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-[#10b8a6]/20 bg-[#0d241f] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-white/35">
                      Launch consent
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {activationPlan.status.replace(/_/g, " ")}
                    </div>
                  </div>
                  <div className="rounded-full bg-black/25 px-2 py-1 text-xs text-[#8ff4e8]">
                    {activationPlan.report.confidence}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  {activationPlan.report.summary}
                </p>
              </div>
              <div className="rounded-2xl bg-[#111] p-4">
                <div className="mb-2 text-xs uppercase tracking-[0.16em] text-white/35">
                  Agent work after consent
                </div>
                <div className="space-y-1 text-xs leading-5 text-white/55">
                  {activationPlan.report.websiteSalesWorkflows.slice(0, 4).map((item) => (
                    <div key={item}>- {item}</div>
                  ))}
                </div>
              </div>
              {!activationPlan.consentApproved ? (
                <button
                  type="button"
                  disabled={isActivationWorking}
                  onClick={() => onApproveActivation(activationPlan.id)}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-black disabled:opacity-50"
                >
                  {isActivationWorking && <Loader2 className="size-4 animate-spin" />}
                  Approve agent launch
                </button>
              ) : (
                <div className="rounded-full bg-[#10b8a6]/15 px-4 py-2 text-center text-sm text-[#8ff4e8]">
                  Launch approved
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#111] p-4 text-sm text-white/45">
                Generate a deep analysis from company details, sources, and promo assets before launch.
              </div>
              <button
                type="button"
                disabled={isActivationWorking}
                onClick={onGenerateActivation}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-black disabled:opacity-50"
              >
                {isActivationWorking && <Loader2 className="size-4 animate-spin" />}
                Generate activation analysis
              </button>
            </div>
          )}
        </InspectorBlock>

        <InspectorBlock title="Lead">
          {lead ? (
            <div className="space-y-2 text-sm text-white/70">
              <div className="rounded-2xl border border-[#8ab4ff]/20 bg-[#0f1724] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.16em] text-white/40">
                    Lead grade
                  </span>
                  <span className="text-2xl font-semibold text-[#8ab4ff]">
                    {lead.grade}
                  </span>
                </div>
                <div className="mt-2 text-xs text-white/45">
                  Score {lead.score}/100
                </div>
                <div className="mt-3 text-sm text-white/75">
                  {lead.nextBestAction}
                </div>
              </div>
              <InfoRow label="Name" value={lead.name} />
              <InfoRow label="Phone" value={lead.phone} />
              <InfoRow label="Email" value={lead.email} />
              <InfoRow
                label="Consent"
                value={lead.followUpConsent ? "Captured" : "Needs permission"}
              />
              <InfoRow label="Requirement" value={lead.requirement} />
              {lead.gradeReasons.length > 0 && (
                <div className="rounded-2xl bg-[#111] p-4">
                  <div className="mb-2 text-xs uppercase tracking-[0.16em] text-white/35">
                    Why this grade
                  </div>
                  <div className="space-y-1 text-xs leading-5 text-white/55">
                    {lead.gradeReasons.slice(0, 4).map((reason) => (
                      <div key={reason}>- {reason}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#111] p-4 text-sm text-white/40">
              No lead captured in this chat.
            </div>
          )}
        </InspectorBlock>

        <InspectorBlock title="Notifications">
          <InputRow label="Email" value={notificationEmail} onChange={onEmailChange} />
          <InputRow
            label="WhatsApp"
            value={notificationWhatsappPhone}
            onChange={onWhatsappChange}
          />
          <button
            type="button"
            onClick={onSave}
            className="mt-3 h-10 w-full rounded-full bg-white text-sm font-medium text-black"
          >
            Save
          </button>
        </InspectorBlock>

        <InspectorBlock title="Analytics">
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Chats" value={analytics.totalConversations} />
            <Metric label="Leads" value={analytics.leadsCaptured} />
            <Metric label="Grade A" value={analytics.gradeA} />
            <Metric label="Handoffs" value={analytics.handoffRequested} />
          </div>
        </InspectorBlock>
      </aside>
    </>
  );
}

function InstallSnippet({
  tenant,
  activationPlan,
  sourceCount,
}: {
  tenant: AgentTenant | null;
  activationPlan: WebsiteSalesActivationPlan | null;
  sourceCount: number;
}) {
  const [copied, setCopied] = useState(false);
  const tenantId = tenant?.id ?? "jaabili-default";
  const apiBase = websiteSalesApiBase || "https://jaabili-api.onrender.com";
  const widgetSrc =
    typeof window !== "undefined"
      ? `${window.location.origin}/jaabili-website-sales-widget.js`
      : "https://jaabili-tech.vercel.app/jaabili-website-sales-widget.js";
  const launchState = activationPlan?.consentApproved
    ? "Live-ready"
    : activationPlan
      ? "Awaiting consent"
      : "Setup";
  const script = `<script
  src="${widgetSrc}"
  data-tenant-id="${tenantId}"
  data-widget-key="${tenant?.widgetPublicKey ?? ""}"
  data-api-base="${apiBase}"
  data-title="${tenant?.name ?? "Jaabili"} Sales Agent"
  data-subtitle="Ask questions, get recommendations, and request a quick follow-up."
  data-accent="#10b8a6"
  defer
></script>`;

  const copyScript = async () => {
    await navigator.clipboard?.writeText(script);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-white/45">Tenant</p>
          <p className="mt-1 truncate font-semibold text-white">
            {tenant?.name ?? "Demo tenant"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-white/45">Launch</p>
          <p className="mt-1 font-semibold text-emerald-200">{launchState}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-white/45">Sources</p>
          <p className="mt-1 font-semibold text-white">{sourceCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-white/45">Widget key</p>
          <p className="mt-1 font-semibold text-white">
            {tenant?.widgetPublicKey ? "Ready" : "Missing"}
          </p>
        </div>
      </div>
      <textarea
        aria-label="Website Sales Agent install script"
        className="min-h-36 w-full resize-none rounded-2xl border border-white/10 bg-black/45 p-3 font-mono text-[11px] leading-5 text-white/75 outline-none"
        readOnly
        value={script}
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-white/45">Paste before the closing body tag.</p>
        <button
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
          type="button"
          onClick={copyScript}
        >
          {copied ? <Check className="size-4" /> : null}
          {copied ? "Copied" : "Copy script"}
        </button>
      </div>
    </div>
  );
}

function CompanyOnboardingDrawer({
  isOpen,
  draft,
  tenant,
  sources,
  readiness,
  activationPlan,
  diagnosisReport,
  isWorking,
  onClose,
  onDraftChange,
  onSaveCompany,
  onAddSource,
  onGenerateActivation,
  onApproveActivation,
}: {
  isOpen: boolean;
  draft: CompanyOnboardingDraft;
  tenant: AgentTenant | null;
  sources: KnowledgeSource[];
  readiness: AgentReadinessReport | null;
  activationPlan: WebsiteSalesActivationPlan | null;
  diagnosisReport: WebsiteSalesDiagnosisReport | null;
  isWorking: boolean;
  onClose: () => void;
  onDraftChange: (draft: CompanyOnboardingDraft) => void;
  onSaveCompany: () => Promise<AgentTenant | null>;
  onAddSource: (state: KnowledgeDialogState) => void;
  onGenerateActivation: () => void;
  onApproveActivation: (planId: string) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const requiredSources = sourceOptions.map((source) => ({
    ...source,
    complete: sources.some((item) => item.sourceType === source.sourceType),
  }));
  const savedCompany = Boolean(tenant && tenant.id !== "jaabili-default");
  const sourceCount = requiredSources.filter((source) => source.complete).length;
  const canAnalyze =
    savedCompany &&
    sourceCount >= 3 &&
    Boolean(draft.targetCustomers.trim() && draft.primaryOffer.trim());
  const approved = Boolean(activationPlan?.consentApproved);

  const update = (patch: Partial<CompanyOnboardingDraft>) => {
    onDraftChange({ ...draft, ...patch });
  };

  const handleSaveCompany = async () => {
    if (!draft.companyName.trim() || isSaving) return;
    setIsSaving(true);
    setSaveMessage(null);
    setSaveError(null);
    try {
      const saved = await onSaveCompany();
      if (!saved) {
        setSaveError("Could not save this company. Check the API connection.");
        return;
      }
      setSaveMessage(`${saved.name} saved as the active company.`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save this company.");
    } finally {
      setIsSaving(false);
    }
  };

  const openSourceDialog = (source: (typeof requiredSources)[number]) => {
    onAddSource({
      type: source.type,
      title: source.title,
      category: source.category,
    });
  };

  const runActivationAnalysis = () => {
    if (canAnalyze && !isWorking) onGenerateActivation();
  };

  const approveLaunch = () => {
    if (activationPlan && !isWorking) onApproveActivation(activationPlan.id);
  };

  return (
    <>
      <button
        className="fixed inset-0 z-40 bg-black/65"
        onClick={onClose}
        aria-label="Close onboarding overlay"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-[42rem] max-w-full flex-col bg-[#1f1f1f] shadow-2xl shadow-black/50">
        <div className="border-b border-white/8 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">Company onboarding</div>
              <div className="mt-1 text-sm text-white/45">
                Prepare this Website Sales Agent for a real client launch.
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
              aria-label="Close onboarding"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <OnboardingStepBadge label="Company" done={savedCompany} />
            <OnboardingStepBadge label="Sources" done={sourceCount >= 5} />
            <OnboardingStepBadge label="Analysis" done={Boolean(activationPlan)} />
            <OnboardingStepBadge label="Launch" done={approved} />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <section className="rounded-3xl border border-white/8 bg-[#111]/80 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">1. Company profile</div>
                <div className="mt-1 text-xs text-white/40">
                  This becomes the operating brief for the sales agent.
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {canAnalyze && !activationPlan && (
                  <button
                    type="button"
                    onClick={runActivationAnalysis}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      runActivationAnalysis();
                    }}
                    disabled={isWorking}
                    className="inline-flex h-9 items-center gap-2 rounded-full bg-[#10b8a6] px-4 text-xs font-semibold text-black disabled:opacity-40"
                  >
                    {isWorking && <Loader2 className="size-3.5 animate-spin" />}
                    Analyze
                  </button>
                )}
                <button
                  type="button"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    handleSaveCompany();
                  }}
                  disabled={!draft.companyName.trim() || isSaving}
                  className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-black disabled:opacity-40"
                >
                  {isSaving && <Loader2 className="size-3.5 animate-spin" />}
                  {isSaving ? "Saving" : savedCompany ? "Update" : "Save"}
                </button>
              </div>
            </div>
            {(saveMessage || saveError) && (
              <div
                className={cn(
                  "mb-4 rounded-2xl px-3 py-2 text-xs",
                  saveError
                    ? "bg-red-500/10 text-red-200"
                    : "bg-[#10b8a6]/10 text-[#9cf5ea]",
                )}
              >
                {saveError ?? saveMessage}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <InputRow
                label="Company name"
                value={draft.companyName}
                onChange={(companyName) => update({ companyName })}
              />
              <InputRow
                label="Website"
                value={draft.websiteUrl}
                onChange={(websiteUrl) => update({ websiteUrl })}
              />
              <InputRow
                label="Industry"
                value={draft.industry}
                onChange={(industry) => update({ industry })}
              />
              <InputRow
                label="Service locations"
                value={draft.serviceLocations}
                onChange={(serviceLocations) => update({ serviceLocations })}
              />
              <InputRow
                label="Contact email"
                value={draft.contactEmail}
                onChange={(contactEmail) => update({ contactEmail })}
              />
              <InputRow
                label="Contact phone"
                value={draft.contactPhone}
                onChange={(contactPhone) => update({ contactPhone })}
              />
            </div>
            <TextAreaRow
              label="Target customers"
              value={draft.targetCustomers}
              onChange={(targetCustomers) => update({ targetCustomers })}
            />
            <TextAreaRow
              label="Primary offer"
              value={draft.primaryOffer}
              onChange={(primaryOffer) => update({ primaryOffer })}
            />
            <TextAreaRow
              label="Sales goal"
              value={draft.salesGoal}
              onChange={(salesGoal) => update({ salesGoal })}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <InputRow
                label="Average order value"
                value={draft.averageOrderValue}
                onChange={(averageOrderValue) => update({ averageOrderValue })}
              />
              <InputRow
                label="Current channels"
                value={draft.currentChannels}
                onChange={(currentChannels) => update({ currentChannels })}
              />
            </div>
          </section>

          <section className="mt-4 rounded-3xl border border-white/8 bg-[#111]/80 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">2. Knowledge room</div>
                <div className="mt-1 text-xs text-white/40">
                  Add the approved sources the agent can trust.
                </div>
              </div>
              <div className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/55">
                {sourceCount}/5 ready
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {requiredSources.map((source) => {
                const Icon = source.icon;
                return (
                  <button
                    key={source.type}
                    type="button"
                    onClick={() => openSourceDialog(source)}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      openSourceDialog(source);
                    }}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      openSourceDialog(source);
                    }}
                    className={cn(
                      "flex min-h-14 items-center gap-3 rounded-2xl border px-3 text-left text-sm transition",
                      source.complete
                        ? "border-[#10b8a6]/30 bg-[#10b8a6]/8"
                        : "border-white/8 bg-black/20 hover:border-[#8ab4ff]/35",
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/8">
                      <Icon className={cn("size-4", source.iconClassName)} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{source.label}</span>
                      <span className="text-xs text-white/38">
                        {source.complete ? "ready" : "required"}
                      </span>
                    </span>
                    {source.complete && <Check className="size-4 text-[#72f2df]" />}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-4 rounded-3xl border border-white/8 bg-[#111]/80 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">3. Activation analysis</div>
                <div className="mt-1 text-xs text-white/40">
                  Generate the agent work plan before live consent.
                </div>
              </div>
              <button
                type="button"
                onClick={runActivationAnalysis}
                onMouseDown={(event) => {
                  event.preventDefault();
                  runActivationAnalysis();
                }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  runActivationAnalysis();
                }}
                disabled={!canAnalyze || isWorking}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-black disabled:opacity-40"
              >
                {isWorking && <Loader2 className="size-4 animate-spin" />}
                Generate
              </button>
            </div>
            {activationPlan ? (
              <div className="space-y-3">
                <div className="rounded-2xl bg-black/25 p-4 text-sm leading-6 text-white/70">
                  {activationPlan.report.summary}
                </div>
                {diagnosisReport && (
                  <div className="rounded-2xl border border-[#8ab4ff]/20 bg-[#101827] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-[0.16em] text-white/35">
                          Diagnosis
                        </div>
                        <div className="mt-1 text-sm leading-6 text-white/70">
                          {diagnosisReport.summary}
                        </div>
                      </div>
                      <span className="rounded-full bg-black/25 px-2 py-1 text-xs text-[#bcd4ff]">
                        {diagnosisReport.confidence}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {diagnosisReport.solutionOptions
                        .filter((solution) => solution.status === "selected")
                        .slice(0, 2)
                        .map((solution) => (
                          <div
                            key={solution.id}
                            className="rounded-xl bg-black/25 px-3 py-2"
                          >
                            <div className="truncate text-xs font-semibold text-white/80">
                              {solution.title}
                            </div>
                            <div className="mt-1 text-[11px] leading-4 text-white/40">
                              {solution.expectedOutcome}
                            </div>
                          </div>
                        ))}
                      {diagnosisReport.solutionOptions.every(
                        (solution) => solution.status !== "selected",
                      ) && (
                        <div className="rounded-xl bg-black/25 px-3 py-2 text-xs leading-5 text-white/45 sm:col-span-2">
                          Select a recommended solution from the inspector before
                          broad launch.
                        </div>
                      )}
                    </div>
                    {diagnosisReport.dataRequests.some(
                      (request) => request.status === "needed",
                    ) && (
                      <div className="mt-3 rounded-xl bg-black/25 px-3 py-2 text-xs leading-5 text-white/45">
                        Missing data:{" "}
                        {diagnosisReport.dataRequests
                          .filter((request) => request.status === "needed")
                          .slice(0, 3)
                          .map((request) => request.title)
                          .join(", ")}
                      </div>
                    )}
                  </div>
                )}
                <div className="grid gap-2 sm:grid-cols-3">
                  <LibraryMetric label="Readiness" value={readiness?.score ?? 0} />
                  <LibraryMetric label="Sources" value={sources.length} />
                  <LibraryMetric
                    label="Launch"
                    value={activationPlan.consentApproved ? 1 : 0}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/45">
                Save the company and add at least website, FAQ, and pricing or policy
                before analysis.
              </div>
            )}
          </section>
        </div>

        <div className="border-t border-white/8 p-5">
          {activationPlan?.consentApproved ? (
            <div className="flex items-center gap-3 rounded-2xl bg-[#10b8a6]/10 px-4 py-3 text-sm text-[#9cf5ea]">
              <Check className="size-5" />
              Launch approved. The agent can now operate from approved sources.
            </div>
          ) : activationPlan ? (
            <button
              type="button"
              onClick={approveLaunch}
              onMouseDown={(event) => {
                event.preventDefault();
                approveLaunch();
              }}
              onPointerDown={(event) => {
                event.preventDefault();
                approveLaunch();
              }}
              disabled={isWorking}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#10b8a6] text-sm font-semibold text-black disabled:opacity-50"
            >
              {isWorking && <Loader2 className="size-4 animate-spin" />}
              Approve launch consent
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="h-11 w-full rounded-full border border-white/10 text-sm font-medium text-white/70 hover:bg-white/8"
            >
              Continue testing
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function OnboardingStepBadge({ label, done }: { label: string; done: boolean }) {
  return (
    <div
      className={cn(
        "flex min-h-9 items-center justify-center rounded-2xl border px-2 text-center text-[11px] font-medium",
        done
          ? "border-[#10b8a6]/25 bg-[#10b8a6]/10 text-[#9cf5ea]"
          : "border-white/8 bg-black/20 text-white/38",
      )}
    >
      {label}
    </div>
  );
}

function SourceLibraryDrawer({
  isOpen,
  tenant,
  tenants,
  sources,
  trainingExamples,
  learningReport,
  status,
  onClose,
  onAddSource,
  onCreateTenant,
  onTenantChange,
}: {
  isOpen: boolean;
  tenant: AgentTenant | null;
  tenants: AgentTenant[];
  sources: KnowledgeSource[];
  trainingExamples: TrainingExample[];
  learningReport: WebsiteSalesLearningReport | null;
  status: AgentStatus | null;
  onClose: () => void;
  onAddSource: (state: KnowledgeDialogState) => void;
  onCreateTenant: (input: {
    name: string;
    websiteUrl?: string | null;
    industry?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  }) => void;
  onTenantChange: (tenantId: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <>
      <button
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
        aria-label="Close library overlay"
      />
      <aside className="fixed inset-y-0 left-0 z-50 flex w-[28rem] max-w-[94vw] flex-col bg-[#1f1f1f] p-5 shadow-2xl shadow-black/40 md:left-[18rem]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">Knowledge library</div>
            <div className="mt-1 text-sm text-white/45">
              {tenant?.name ?? "Client workspace"} - {sources.length} sources
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Close library"
          >
            <X className="size-5" />
          </button>
        </div>

        <TenantPanel
          tenant={tenant}
          tenants={tenants}
          onTenantChange={onTenantChange}
          onCreateTenant={onCreateTenant}
        />

        <div className="my-5 h-px bg-white/8" />

        <div className="mb-5 grid grid-cols-3 gap-2">
          <LibraryMetric label="Sources" value={sources.length} />
          <LibraryMetric
            label="Chunks"
            value={status?.intelligence.knowledge?.chunkCount ?? 0}
          />
          <LibraryMetric label="Examples" value={trainingExamples.length} />
        </div>

        {learningReport && (
          <div className="mb-5 rounded-3xl border border-[#8ab4ff]/20 bg-[#101827] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Learning system</div>
                <div className="mt-1 text-xs text-white/45">
                  {learningReport.stage}
                </div>
              </div>
              <div className="text-2xl font-semibold text-[#bcd4ff]">
                {learningReport.learningScore}
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/62">
              {learningReport.nextTrainingStep}
            </p>
            {learningReport.recommendedLabels.length > 0 && (
              <div className="mt-3 rounded-2xl bg-black/20 p-3">
                <div className="mb-2 text-xs uppercase tracking-[0.16em] text-white/35">
                  Suggested labels
                </div>
                <div className="space-y-2">
                  {learningReport.recommendedLabels.slice(0, 3).map((item) => (
                    <div key={item.conversationId} className="text-xs leading-5">
                      <div className="truncate text-white/70">{item.title}</div>
                      <div className="mt-1 text-white/38">
                        {item.labels.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {sourceOptions.map((source) => {
            const Icon = source.icon;
            return (
              <button
                key={source.type}
                type="button"
                onClick={() =>
                  onAddSource({
                    type: source.type,
                    title: source.title,
                    category: source.category,
                  })
                }
                className="rounded-2xl bg-[#111] p-4 text-left text-sm hover:bg-white/8"
              >
                <Icon className={cn("mb-3 size-5", source.iconClassName)} />
                {source.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
          {sources.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#111] p-5 text-sm leading-6 text-white/45">
              No sources for this client yet. Add a website, FAQs, pricing, or
              policies to make Jaabilv 2.0 answer from client context.
            </div>
          ) : (
            <div className="space-y-2">
              {sources.map((source) => (
                <div key={source.id} className="rounded-2xl bg-[#111] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{source.title}</div>
                  <div className="mt-1 truncate text-xs text-white/40">
                        {source.category}
                    {source.url ? ` - ${source.url}` : ""}
                      </div>
                    </div>
                    <SourceStatusBadge status={source.status} />
                  </div>
                  {source.error && (
                    <div className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-200">
                      {source.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function TenantPanel({
  tenant,
  tenants,
  onTenantChange,
  onCreateTenant,
}: {
  tenant: AgentTenant | null;
  tenants: AgentTenant[];
  onTenantChange: (tenantId: string) => void;
  onCreateTenant: (input: {
    name: string;
    websiteUrl?: string | null;
    industry?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  }) => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const create = () => {
    if (!name.trim()) return;
    onCreateTenant({
      name: name.trim(),
      websiteUrl: websiteUrl.trim() || null,
      industry: industry.trim() || null,
      contactEmail: contactEmail.trim() || null,
      contactPhone: contactPhone.trim() || null,
    });
    setName("");
    setWebsiteUrl("");
    setIndustry("");
    setContactEmail("");
    setContactPhone("");
    setIsCreating(false);
  };

  return (
    <section className="rounded-3xl bg-[#111] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">
            {tenant?.name ?? "Client workspace"}
          </div>
          <div className="mt-1 truncate text-xs text-white/40">
            {tenant?.websiteUrl ?? tenant?.industry ?? "Tenant-specific RAG"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating((value) => !value)}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-black hover:bg-[#dbe8ff]"
          aria-label="Create client"
        >
          <Plus className="size-5" />
        </button>
      </div>

      <DropdownSelect
        value={tenant?.id ?? "jaabili-default"}
        options={(tenants.length > 0
          ? tenants
          : [{ id: "jaabili-default", name: "Jaabili Technologies" }]
        ).map((item) => ({ value: item.id, label: item.name }))}
        onChange={onTenantChange}
      />

      {isCreating && (
        <div className="jaabili-pop-in mt-4 space-y-3">
          <InputRow label="Client name" value={name} onChange={setName} />
          <InputRow label="Website" value={websiteUrl} onChange={setWebsiteUrl} />
          <InputRow label="Industry" value={industry} onChange={setIndustry} />
          <InputRow label="Email" value={contactEmail} onChange={setContactEmail} />
          <InputRow label="Phone" value={contactPhone} onChange={setContactPhone} />
          <button
            type="button"
            onClick={create}
            disabled={!name.trim()}
            className="h-10 w-full rounded-full bg-white text-sm font-medium text-black disabled:opacity-40"
          >
            Create client
          </button>
        </div>
      )}
    </section>
  );
}

function SourceStatusBadge({
  status,
}: {
  status: KnowledgeSource["status"] | undefined;
}) {
  const value = status ?? "ready";
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
        value === "ready" && "bg-[#10b8a6]/15 text-[#72f2df]",
        value === "processing" && "bg-[#8ab4ff]/15 text-[#bcd4ff]",
        value === "pending" && "bg-[#ffb74d]/15 text-[#ffd59a]",
        value === "failed" && "bg-red-500/15 text-red-200",
      )}
    >
      {value}
    </span>
  );
}

function SeverityPill({ severity }: { severity: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-1 text-[11px]",
        severity === "critical" && "bg-[#ff4d4d]/15 text-[#ff9b9b]",
        severity === "high" && "bg-[#ffb74d]/15 text-[#ffd28a]",
        severity === "medium" && "bg-[#8ab4ff]/15 text-[#bcd4ff]",
        severity === "low" && "bg-white/8 text-white/45",
      )}
    >
      {severity}
    </span>
  );
}

function LibraryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[#111] px-3 py-3">
      <div className="text-base font-semibold text-white">{value}</div>
      <div className="mt-0.5 text-[11px] text-white/40">{label}</div>
    </div>
  );
}

function ModelSettingsDrawer({
  isOpen,
  selectedModel,
  settings,
  onClose,
  onModelChange,
  onSettingsChange,
}: {
  isOpen: boolean;
  selectedModel: string;
  settings: ModelRuntimeSettings;
  onClose: () => void;
  onModelChange: (value: string) => void;
  onSettingsChange: (settings: ModelRuntimeSettings) => void;
}) {
  if (!isOpen) return null;

  const update = (patch: Partial<ModelRuntimeSettings>) => {
    onSettingsChange({ ...settings, ...patch });
  };

  return (
    <>
      <button
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
        aria-label="Close model settings overlay"
      />
      <aside className="fixed inset-y-0 right-0 z-50 w-[25rem] max-w-[94vw] overflow-y-auto bg-[#1f1f1f] p-5 shadow-2xl shadow-black/40">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">Model settings</div>
            <div className="mt-1 text-sm text-white/45">Jaabili Technologies - Agent Lab</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Close settings"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mb-5 text-sm text-white/55">
          Runtime model
          <div className="mt-2">
            <DropdownSelect
              value={selectedModel}
              options={modelOptions.map((model) => ({
                value: model.id,
                label: model.label,
                description: model.description,
              }))}
              onChange={onModelChange}
            />
          </div>
        </div>

        <RangeSetting
          label="Temperature"
          value={settings.temperature}
          min={0}
          max={1}
          step={0.1}
          onChange={(value) => update({ temperature: value })}
        />
        <RangeSetting
          label="Retrieval chunks"
          value={settings.retrievalChunks}
          min={1}
          max={8}
          step={1}
          onChange={(value) => update({ retrievalChunks: value })}
        />
        <RangeSetting
          label="Max response words"
          value={settings.maxResponseWords}
          min={80}
          max={600}
          step={20}
          onChange={(value) => update({ maxResponseWords: value })}
        />

        <button
          type="button"
          onClick={() => update({ strictGrounding: !settings.strictGrounding })}
          className="mt-2 flex w-full items-center justify-between rounded-2xl bg-[#111] px-4 py-4 text-left text-sm"
        >
          <span>
            <span className="block font-medium">Strict knowledge grounding</span>
            <span className="mt-1 block text-xs text-white/40">
              Prefer client sources before generic answers.
            </span>
          </span>
          <span
            className={cn(
              "h-6 w-11 rounded-full p-1 transition",
              settings.strictGrounding ? "bg-[#8ab4ff]" : "bg-white/15",
            )}
          >
            <span
              className={cn(
                "block size-4 rounded-full bg-white transition",
                settings.strictGrounding && "translate-x-5",
              )}
            />
          </span>
        </button>
      </aside>
    </>
  );
}

function RangeSetting({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mb-5 block text-sm text-white/55">
      <span className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-white/80">{value}</span>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-[#8ab4ff]"
      />
    </label>
  );
}

function LabelEditor({
  labels,
  onChange,
}: {
  labels: string[];
  onChange: (labels: string[]) => void;
}) {
  const toggleLabel = (label: string) => {
    onChange(
      labels.includes(label)
        ? labels.filter((item) => item !== label)
        : [...labels, label],
    );
  };

  return (
    <div className="rounded-2xl bg-[#111] p-3">
      <div className="flex flex-wrap gap-2">
        {labelOptions.map((label) => {
          const active = labels.includes(label);
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggleLabel(label)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition",
                active
                  ? "border-[#8ab4ff]/60 bg-[#8ab4ff]/15 text-white"
                  : "border-white/10 text-white/45 hover:bg-white/8 hover:text-white/75",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InspectorBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-sm font-medium text-white/55">{title}</h2>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4 rounded-2xl bg-[#111] px-4 py-3">
      <span className="text-white/40">{label}</span>
      <span className="truncate text-right">{value ?? "Missing"}</span>
    </div>
  );
}

function InputRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mb-3 block text-sm text-white/45">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-[#111] px-4 text-white outline-none focus:border-[#8ab4ff]/50"
      />
    </label>
  );
}

function TextAreaRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mb-3 block text-sm text-white/45">
      {label}
      <textarea
        value={value}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full resize-none rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-[#8ab4ff]/50"
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[#111] p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
    </div>
  );
}

function conversationTitle(conversation: ConversationRecord): string {
  const firstVisitorMessage = conversation.messages.find(
    (message) => message.role === "visitor",
  );
  const firstAgentMessage = conversation.messages.find(
    (message) => message.role === "agent",
  );

  const rawTitle =
    firstVisitorMessage?.content ??
    firstAgentMessage?.content ??
    "New website sales test";

  return compactChatTitle(rawTitle);
}

function isInternalTestConversation(conversation: ConversationRecord): boolean {
  if (conversation.visitorId.startsWith("fashion-url-test-")) return true;
  if (conversation.visitorId.startsWith("e2e-")) return true;
  const firstVisitorMessage = conversation.messages.find(
    (message) => message.role === "visitor",
  );
  return /^analyze this (fashion )?website for a 24\/7 website sales agent/i.test(
    firstVisitorMessage?.content ?? "",
  );
}

function compactChatTitle(value: string): string {
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/^(hi|hello|hey)[,!\s]+/i, "")
    .trim();
  const title = cleaned.length > 48 ? `${cleaned.slice(0, 45).trim()}...` : cleaned;
  return title || "New chat";
}

function parseSavedStringArray(value: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function createCompanyDraft(
  input: Partial<CompanyOnboardingDraft> = {},
): CompanyOnboardingDraft {
  return {
    companyName: input.companyName ?? "",
    websiteUrl: input.websiteUrl ?? "",
    industry: input.industry ?? "",
    targetCustomers: input.targetCustomers ?? "",
    primaryOffer: input.primaryOffer ?? "",
    salesGoal: input.salesGoal ?? "Increase qualified website leads and sales conversations",
    averageOrderValue: input.averageOrderValue ?? "",
    serviceLocations: input.serviceLocations ?? "",
    currentChannels: input.currentChannels ?? "website, WhatsApp, email",
    contactEmail: input.contactEmail ?? "",
    contactPhone: input.contactPhone ?? "",
  };
}

function companyDraftToProfile(
  draft: CompanyOnboardingDraft,
  tenant: AgentTenant | null,
): CompanyProfileInput {
  return {
    companyName: draft.companyName.trim() || tenant?.name || "Client company",
    websiteUrl: draft.websiteUrl.trim() || tenant?.websiteUrl || undefined,
    industry: draft.industry.trim() || tenant?.industry || undefined,
    targetCustomers:
      draft.targetCustomers.trim() ||
      "Website visitors and high-intent inbound buyers",
    primaryOffer:
      draft.primaryOffer.trim() ||
      "Company products or services from approved sources",
    salesGoal:
      draft.salesGoal.trim() ||
      "Increase qualified website leads and sales conversations",
    averageOrderValue: draft.averageOrderValue.trim() || undefined,
    serviceLocations: draft.serviceLocations.trim() || undefined,
    currentChannels: draft.currentChannels
      .split(",")
      .map((channel) => channel.trim())
      .filter(Boolean),
  };
}
