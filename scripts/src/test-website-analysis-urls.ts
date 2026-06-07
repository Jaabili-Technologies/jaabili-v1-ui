const apiBase = process.env["JAABILI_API_BASE"] ?? "http://localhost:3001/api";

const urls =
  process.argv.slice(2).filter((arg) => arg !== "--").length > 0
    ? process.argv.slice(2).filter((arg) => arg !== "--")
    : [
  "https://www.fabindia.com/",
  "https://www.shopify.com/in",
  "https://www.cult.fit/",
  "https://www.apple.com/in/",
  "https://www.hubspot.com/",
      ];

type Json = Record<string, unknown>;

async function main() {
  const results: Array<{
    url: string;
    analyzed: boolean;
      hasOperatingPlan: boolean;
      hasRequiredDetails: boolean;
      hasSalesGrowthPlan: boolean;
      hasFollowUpPlan: boolean;
      preview: string;
  }> = [];

  for (const url of urls) {
    const response = await request<Json>("/agents/website-sales/chat", {
      method: "POST",
      body: {
        visitorId: `url-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        message: `Analyze this website for a 24/7 website sales agent and tell what details the company must provide: ${url}`,
        runtime: {
          model: "deterministic",
          strictGrounding: false,
          maxResponseWords: 520,
        },
      },
    });
    const reply = String(response["reply"] ?? "");
    results.push({
      url,
      analyzed: reply.includes("I checked "),
      hasOperatingPlan: /24\/7 sales-agent operating plan/i.test(reply),
      hasRequiredDetails: /Details needed from the business/i.test(reply),
      hasSalesGrowthPlan: /How the agent increases sales/i.test(reply),
      hasFollowUpPlan: /Consent-based follow-up automations/i.test(reply),
      preview: reply.replace(/\s+/g, " ").slice(0, 260),
    });
  }

  const analyzedCount = results.filter((result) => result.analyzed).length;
  const planCount = results.filter((result) => result.hasOperatingPlan).length;
  const growthCount = results.filter((result) => result.hasSalesGrowthPlan).length;
  const followUpCount = results.filter((result) => result.hasFollowUpPlan).length;

  console.log(
    JSON.stringify(
      { analyzedCount, planCount, growthCount, followUpCount, results },
      null,
      2,
    ),
  );

  if (analyzedCount === 0 || planCount === 0 || growthCount === 0 || followUpCount === 0) {
    throw new Error("No live URL produced the upgraded website sales analysis.");
  }
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export {};
