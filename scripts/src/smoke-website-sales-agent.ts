const apiBase = process.env["JAABILI_API_BASE"] ?? "http://localhost:3001/api";
const runId = `smoke-${Date.now()}`;
const tenantId = `tenant-${runId}`;

type Json = Record<string, unknown>;

async function main() {
  const status = await request<Json>("/agents/website-sales/status");
  assert(Boolean(status["intelligence"]), "status includes intelligence");

  await request("/agents/website-sales/tenants", {
    method: "POST",
    body: {
      id: tenantId,
      name: "Smoke Test Dental Clinic",
      websiteUrl: "https://example.com/smoke-dental",
      industry: "clinic",
      contactEmail: "owner@example.com",
    },
  });

  await request("/agents/website-sales/knowledge/sources", {
    method: "POST",
    body: {
      tenantId,
      title: "Smoke Dental Clinic Pricing FAQ",
      category: "tenant-faq",
      sourceType: "faq",
      text:
        "Smoke Dental Clinic offers appointment inquiry support for dental consultations, cleaning, braces, implants, and urgent tooth pain. Consultation packages start from 1500 INR and final treatment pricing must be confirmed by the clinic team. Emergency appointments should be routed to the clinic team immediately. The website sales agent must collect patient name, phone, treatment interest, preferred appointment date, budget range, urgency, and location before routing the inquiry. The agent can answer basic appointment, timing, consultation fee, and follow-up questions from approved clinic information, but it must not provide diagnosis, prescriptions, or medical advice. If a patient reports severe pain, bleeding, swelling, fever, or trauma, the agent should collect contact details and request immediate clinic callback.",
    },
  });

  const chat = await request<Json>("/agents/website-sales/chat", {
    method: "POST",
    body: {
      tenantId,
      visitorId: runId,
      message:
        "I am Priya. Need a dental appointment campaign agent this week. Phone is +91 98765 43210. Budget 75000. You can call me for follow up.",
      runtime: { model: "deterministic", strictGrounding: true },
    },
  });

  const conversation = chat["conversation"] as Json | undefined;
  const lead = chat["lead"] as Json | undefined;
  assert(typeof conversation?.["id"] === "string", "chat returns conversation");
  assert(lead?.["qualification"] === "hot", "complete high-intent lead is hot");
  assert(lead?.["grade"] === "A", "complete high-intent lead receives A grade");
  assert(
    typeof lead?.["nextBestAction"] === "string" &&
      lead["nextBestAction"].includes("Route to sales"),
    "lead includes sales next-best action",
  );

  const conversationId = conversation?.["id"] as string;
  await request(`/agents/website-sales/conversations/${conversationId}/labels`, {
    method: "PATCH",
    body: { labels: ["good-answer", "training-candidate"] },
  });

  const training = await request<Json>(
    "/agents/website-sales/training/examples?includeUnlabeled=true",
  );
  const examples = training["examples"] as Json[] | undefined;
  assert(
    Array.isArray(examples) &&
      examples.some((example) => example["conversationId"] === conversationId),
    "training export includes labeled conversation",
  );

  const analytics = await request<Json>("/agents/website-sales/analytics");
  assert(Number(analytics["leadsCaptured"] ?? 0) >= 1, "analytics tracks leads");

  const readiness = await request<Json>(
    `/agents/website-sales/readiness?tenantId=${tenantId}`,
  );
  assert(typeof readiness["score"] === "number", "readiness includes score");
  assert(typeof readiness["grade"] === "string", "readiness includes grade");
  assert(
    Array.isArray(readiness["nextActions"]),
    "readiness includes next actions",
  );

  const diagnosis = await request<Json>(
    `/agents/website-sales/diagnosis?tenantId=${tenantId}&selectedSolutionIds=website-capture`,
  );
  assert(diagnosis["tenantId"] === tenantId, "diagnosis matches tenant");
  const solutionOptions = diagnosis["solutionOptions"] as Json[] | undefined;
  assert(
    Array.isArray(solutionOptions) &&
      solutionOptions.some(
        (solution) =>
          solution["id"] === "website-capture" &&
          solution["status"] === "selected",
      ),
    "diagnosis tracks selected website-capture solution",
  );

  const activation = await request<Json>("/agents/website-sales/activation/analyze", {
    method: "POST",
    body: {
      tenantId,
      companyProfile: {
        companyName: "Smoke Dental Clinic",
        websiteUrl: "https://example.com/smoke-dental",
        industry: "clinic",
        targetCustomers: "Patients who need appointments and dental treatments",
        primaryOffer: "Dental consultation and treatment booking",
        salesGoal: "Increase appointment bookings from website visitors",
        averageOrderValue: "INR 1500 consultation and higher treatment plans",
        serviceLocations: "Bengaluru",
        currentChannels: ["website", "whatsapp", "email"],
      },
      promoAssets: [
        {
          name: "Consultation offer",
          type: "offer",
          notes: "First consultation starts from 1500 INR with clinic confirmation.",
        },
        {
          name: "Patient testimonials",
          type: "testimonial",
          notes: "Use only approved testimonials for reassurance.",
        },
      ],
    },
  });
  assert(
    typeof activation["id"] === "string" &&
      activation["status"] === "ready_for_consent",
    "activation analysis is stored and ready for consent",
  );
  const activationReport = activation["report"] as Json | undefined;
  assert(
    Array.isArray(activationReport?.["websiteSalesWorkflows"]),
    "activation includes website sales workflows",
  );

  const approved = await request<Json>(
    `/agents/website-sales/activation/${activation["id"]}/approve`,
    { method: "POST" },
  );
  assert(approved["consentApproved"] === true, "activation consent approval stored");

  const learning = await request<Json>(
    `/agents/website-sales/training/learning-report?tenantId=${tenantId}`,
  );
  const labelStats = learning["labelStats"] as Json | undefined;
  assert(typeof learning["learningScore"] === "number", "learning score exists");
  assert(
    Number(labelStats?.["labeledConversations"] ?? 0) >= 1,
    "learning report sees labeled conversation",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        tenantId,
        conversationId,
        leadQualification: lead?.["qualification"],
        leadGrade: lead?.["grade"],
        readinessGrade: readiness["grade"],
        diagnosisConfidence: diagnosis["confidence"],
        learningScore: learning["learningScore"],
        activationStatus: approved["status"],
        trainingExamples: examples?.length ?? 0,
      },
      null,
      2,
    ),
  );
}

async function request<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    method: init.method ?? "GET",
    headers: init.body ? { "content-type": "application/json" } : undefined,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const text = await response.text();
  const data = text ? (JSON.parse(text) as T | { error?: string }) : null;

  if (!response.ok) {
    const error =
      data && typeof data === "object" && "error" in data && data.error
        ? data.error
        : text;
    throw new Error(`${init.method ?? "GET"} ${path} failed: ${error}`);
  }

  return data as T;
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Smoke test failed: ${message}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export {};
