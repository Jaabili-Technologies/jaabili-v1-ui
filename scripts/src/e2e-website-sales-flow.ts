const apiBase = process.env["JAABILI_API_BASE"] ?? "http://localhost:3001/api";
const stamp = Date.now().toString(36);
const tenantId = `e2e-fashion-${stamp}`;

type JsonObject = Record<string, unknown>;

async function main() {
  log("creating tenant");
  await request("/agents/website-sales/tenants", {
    method: "POST",
    body: {
      id: tenantId,
      name: `E2E Fashion House ${stamp}`,
      websiteUrl: "https://e2e-fashion.example",
      industry: "fashion/e-commerce",
      contactEmail: "owner@e2e-fashion.example",
      contactPhone: "+919999900001",
      activeAgentProfile: "website-sales",
    },
  });

  const sources = [
    {
      title: "E2E Fashion Website",
      category: "tenant-website",
      sourceType: "website",
      text: [
        "E2E Fashion House sells premium cotton shirts, festive kurtas, office wear, and wedding-ready menswear.",
        "Primary visitors ask about fit, size, fabric, delivery pincode, return and exchange safety, and styling help.",
        "The main CTA is Book a styling call or WhatsApp product help.",
        "Visual signals include premium cotton shirts, wedding kurta, office capsule wardrobe, and gift bundles.",
      ].join("\n\n"),
    },
    {
      title: "E2E Fashion FAQ",
      category: "faq",
      sourceType: "faq",
      text: [
        "Q: Can you help choose the right size?",
        "A: Yes. Ask for height, usual shirt size, fit preference, and occasion. Route final size uncertainty to a stylist.",
        "Q: Can customers order bulk shirts?",
        "A: Yes. Capture quantity, sizes, delivery city, budget, and timeline, then route to sales.",
      ].join("\n\n"),
    },
    {
      title: "E2E Fashion Pricing",
      category: "pricing",
      sourceType: "pricing",
      text: [
        "Shirts usually range from INR 1,499 to INR 3,499.",
        "Festive kurtas usually range from INR 2,499 to INR 6,999.",
        "Bulk order discounts require human approval. The agent must not promise a final discount.",
      ].join("\n\n"),
    },
    {
      title: "E2E Fashion Policy",
      category: "policy",
      sourceType: "policy",
      text: [
        "Returns and exchanges are accepted within 7 days for unused products with tags.",
        "Delivery timelines depend on pincode and courier availability.",
        "Damaged product complaints and refund disputes must be routed to a human.",
      ].join("\n\n"),
    },
    {
      title: "E2E Fashion Promo Assets",
      category: "promo-assets",
      sourceType: "document",
      text: [
        "Campaign assets: office wear capsule, wedding edit, new arrival shirts, festive gifting bundle.",
        "Testimonials mention premium fabric, good fit, responsive support, and easy exchanges.",
      ].join("\n\n"),
    },
  ];

  for (const source of sources) {
    log(`adding source: ${source.title}`);
    await request("/agents/website-sales/knowledge/sources", {
      method: "POST",
      body: {
        tenantId,
        ingest: false,
        ...source,
      },
    });
  }

  log("building retrieval index");
  await request(
    "/agents/website-sales/knowledge/ingest",
    {
      method: "POST",
      body: { tenantId },
    },
    { timeoutMs: 120_000 },
  );

  log("checking readiness");
  const readiness = await request<JsonObject>(
    `/agents/website-sales/readiness?tenantId=${encodeURIComponent(tenantId)}`,
  );
  assertEqual(readiness["tenantId"], tenantId, "readiness tenant id");

  log("checking diagnosis before activation");
  const initialDiagnosis = await request<JsonObject>(
    `/agents/website-sales/diagnosis?tenantId=${encodeURIComponent(tenantId)}`,
  );
  assertEqual(initialDiagnosis["tenantId"], tenantId, "diagnosis tenant id");
  assertTruthy(
    Array.isArray(initialDiagnosis["solutionOptions"]) &&
      initialDiagnosis["solutionOptions"].length > 0,
    "diagnosis includes solution options",
  );

  log("generating activation");
  const activation = await request<JsonObject>("/agents/website-sales/activation/analyze", {
    method: "POST",
    body: {
      tenantId,
      companyProfile: {
        companyName: `E2E Fashion House ${stamp}`,
        websiteUrl: "https://e2e-fashion.example",
        industry: "fashion/e-commerce",
        targetCustomers: "Men shopping for office wear, festive wear, wedding outfits, and bulk shirts",
        primaryOffer: "Premium shirts, kurtas, styling help, and bulk order support",
        salesGoal: "Increase qualified website leads and WhatsApp-assisted purchases",
        averageOrderValue: "INR 2,500 to INR 6,000",
        serviceLocations: "India",
        currentChannels: ["website", "whatsapp", "email"],
      },
      promoAssets: [
        {
          name: "Wedding edit",
          type: "catalog",
          notes: "Use for festive and wedding product recommendations.",
        },
        {
          name: "Office capsule",
          type: "offer",
          notes: "Use for workwear bundles and styling follow-up.",
        },
      ],
    },
  });
  const activationId = String(activation["id"]);
  assertTruthy(activationId, "activation id");

  log("approving activation");
  const approvedActivation = await request<JsonObject>(
    `/agents/website-sales/activation/${encodeURIComponent(activationId)}/approve`,
    { method: "POST" },
  );
  assertEqual(approvedActivation["consentApproved"], true, "activation consent");

  log("asking product discovery question");
  const productDiscovery = await chat(
    "visitor-product",
    "Recommend the best shirt for office wear under 3000. I prefer slim fit.",
  );
  assertIncludes(productDiscovery.reply, "occasion", "product discovery asks useful context");

  log("capturing hot lead");
  const leadCapture = await chat(
    "visitor-lead",
    "My name is Rohan Mehta. Phone +91 98765 00001. Need 80 premium cotton shirts for our sales team. Budget 200000. Timeline this week. You can call me for follow up.",
  );
  assertEqual(leadCapture.lead?.grade, "A", "lead grade");
  assertEqual(leadCapture.lead?.qualification, "hot", "lead priority");
  assertTruthy(leadCapture.notification, "hot lead notification");

  log("requesting handoff");
  const followUp = await chat(
    "visitor-lead",
    "Can you ask a human sales person to call me today?",
    leadCapture.conversation.id,
  );
  assertEqual(followUp.conversation.status, "handoff_requested", "handoff status");
  assertTruthy(followUp.notification, "handoff notification");

  log("auditing conversation");
  const audit = await request<JsonObject>(
    `/agents/website-sales/conversations/${encodeURIComponent(followUp.conversation.id)}/audit`,
  );
  assertEqual(audit["grade"], "handoff", "audit handoff grade");

  log("labeling conversation for learning");
  await request(
    `/agents/website-sales/conversations/${encodeURIComponent(followUp.conversation.id)}/labels`,
    {
      method: "PATCH",
      body: { labels: ["needs-review", "handoff-case", "training-candidate"] },
    },
  );

  log("checking diagnosis with selected solution");
  const selectedDiagnosis = await request<JsonObject>(
    `/agents/website-sales/diagnosis?tenantId=${encodeURIComponent(
      tenantId,
    )}&selectedSolutionIds=website-capture,daily-optimization&skippedDataRequestIds=sales-analytics`,
  );
  const selectedSolutions = selectedDiagnosis["solutionOptions"] as Array<JsonObject>;
  assertTruthy(
    selectedSolutions.some(
      (solution) =>
        solution["id"] === "website-capture" && solution["status"] === "selected",
    ),
    "diagnosis keeps selected solution state",
  );

  log("checking learning report");
  const learning = await request<JsonObject>(
    `/agents/website-sales/training/learning-report?tenantId=${encodeURIComponent(tenantId)}`,
  );
  assertEqual(learning["tenantId"], tenantId, "learning tenant id");
  assertTruthy(typeof learning["learningScore"] === "number", "learning score");
  assertTruthy(Array.isArray(learning["evalQuestions"]), "learning eval questions");
  const labelStats = learning["labelStats"] as JsonObject;
  assertTruthy(
    Number(labelStats["labeledConversations"] ?? 0) >= 1,
    "learning sees labeled conversations",
  );

  log("running pilot evaluation conversations");
  const pilotCases = [
    {
      visitorId: "pilot-pricing",
      message:
        "What is the price range for festive kurtas and can I get the final discount now?",
      labels: ["good-answer", "pricing-case", "training-candidate"],
    },
    {
      visitorId: "pilot-policy",
      message:
        "If the shirt does not fit, what is your return or exchange policy?",
      labels: ["good-answer", "policy-case", "training-candidate"],
    },
    {
      visitorId: "pilot-proof",
      message:
        "Why should I trust your premium fabric quality compared with another fashion brand?",
      labels: ["needs-review", "objection-case"],
    },
    {
      visitorId: "pilot-size",
      message:
        "I am 5 feet 10 and usually wear size 40. Which slim fit shirt should I choose for office?",
      labels: ["good-answer", "product-discovery", "training-candidate"],
    },
    {
      visitorId: "pilot-bulk-1",
      message:
        "I am Nisha. Email nisha@example.com. Need 35 shirts for a corporate event. Budget 90000. Need it next week. You can email me for follow up.",
      labels: ["good-answer", "lead-capture", "training-candidate"],
    },
    {
      visitorId: "pilot-bulk-2",
      message:
        "I am Karan. Phone +91 98765 00002. Need wedding kurtas for 12 people. Budget 60000. Timeline this month. You can WhatsApp me for follow up.",
      labels: ["good-answer", "lead-capture", "training-candidate"],
    },
    {
      visitorId: "pilot-urgent",
      message:
        "Need a human stylist today for a wedding outfit. Can someone call me?",
      labels: ["needs-review", "handoff-case"],
    },
    {
      visitorId: "pilot-content",
      message:
        "Which products should I promote this week to increase website sales?",
      labels: ["good-answer", "strategy-case", "training-candidate"],
    },
    {
      visitorId: "pilot-location",
      message:
        "Do you deliver to Hyderabad and how quickly can I get office shirts?",
      labels: ["good-answer", "delivery-case", "training-candidate"],
    },
  ];

  for (const pilotCase of pilotCases) {
    const result = await chat(pilotCase.visitorId, pilotCase.message);
    await request(
      `/agents/website-sales/conversations/${encodeURIComponent(result.conversation.id)}/labels`,
      {
        method: "PATCH",
        body: { labels: pilotCase.labels },
      },
    );
  }

  log("checking post-pilot readiness and learning");
  const postPilotReadiness = await request<JsonObject>(
    `/agents/website-sales/readiness?tenantId=${encodeURIComponent(tenantId)}`,
  );
  assertTruthy(
    Number(postPilotReadiness["score"] ?? 0) >= 70,
    "post-pilot readiness reaches controlled pilot threshold",
  );
  const postPilotLearning = await request<JsonObject>(
    `/agents/website-sales/training/learning-report?tenantId=${encodeURIComponent(tenantId)}`,
  );
  const postPilotLabelStats = postPilotLearning["labelStats"] as JsonObject;
  assertTruthy(
    Number(postPilotLabelStats["labeledConversations"] ?? 0) >= 5,
    "post-pilot learning has enough labeled conversations",
  );

  log("checking operations queue");
  const operations = await request<JsonObject>(
    `/agents/website-sales/operations?tenantId=${encodeURIComponent(tenantId)}`,
  );
  assertEqual(operations["mode"], "live", "operations live mode");
  const actionQueue = operations["actionQueue"] as Array<JsonObject>;
  assertTruthy(
    actionQueue.some((action) => action["priority"] === "urgent"),
    "urgent action in work queue",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        tenantId,
        sourcesAdded: sources.length,
        readiness: {
          grade: readiness["grade"],
          score: readiness["score"],
          sourceCoverage: readiness["sourceCoverage"],
        },
        activation: {
          id: activationId,
          approved: approvedActivation["consentApproved"],
          status: approvedActivation["status"],
        },
        lead: {
          id: leadCapture.lead?.id,
          grade: leadCapture.lead?.grade,
          priority: leadCapture.lead?.qualification,
        },
        handoff: {
          conversationId: followUp.conversation.id,
          status: followUp.conversation.status,
        },
        audit: {
          grade: audit["grade"],
          score: audit["score"],
          nextBestAction: audit["nextBestAction"],
        },
        diagnosis: {
          confidence: selectedDiagnosis["confidence"],
          recommendedSolutionIds: selectedDiagnosis["recommendedSolutionIds"],
          selectedSolutions: selectedSolutions
            .filter((solution) => solution["status"] === "selected")
            .map((solution) => solution["id"]),
        },
        learning: {
          score: postPilotLearning["learningScore"],
          stage: postPilotLearning["stage"],
          nextTrainingStep: postPilotLearning["nextTrainingStep"],
          labeledConversations: postPilotLabelStats["labeledConversations"],
        },
        postPilotReadiness: {
          grade: postPilotReadiness["grade"],
          score: postPilotReadiness["score"],
          stage: postPilotReadiness["stage"],
        },
        operations: {
          mode: operations["mode"],
          actionCount: actionQueue.length,
          firstAction: actionQueue[0],
        },
      },
      null,
      2,
    ),
  );
}

function log(message: string) {
  console.error(`[e2e] ${message}`);
}

async function chat(
  visitorId: string,
  message: string,
  conversationId?: string,
): Promise<{
  reply: string;
  conversation: { id: string; status: string };
  lead: { id: string; grade: string; qualification: string } | null;
  notification: JsonObject | null;
}> {
  return request("/agents/website-sales/chat", {
    method: "POST",
    body: {
      tenantId,
      visitorId: `${tenantId}-${visitorId}`,
      conversationId,
      message,
      runtime: {
        model: "deterministic",
        strictGrounding: true,
        maxResponseWords: 240,
        retrievalChunks: 5,
      },
    },
  });
}

async function request<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
  options: { timeoutMs?: number } = {},
): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    method: init.method ?? "GET",
    headers: init.body ? { "content-type": "application/json" } : undefined,
    body: init.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(options.timeoutMs ?? 60_000),
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

function assertTruthy(value: unknown, label: string) {
  if (!value) throw new Error(`Assertion failed: ${label}`);
}

function assertEqual(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) {
    throw new Error(
      `Assertion failed: ${label}. Expected ${String(expected)}, got ${String(actual)}.`,
    );
  }
}

function assertIncludes(value: string, expected: string, label: string) {
  if (!value.toLowerCase().includes(expected.toLowerCase())) {
    throw new Error(`Assertion failed: ${label}. Missing "${expected}" in "${value}".`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export {};
