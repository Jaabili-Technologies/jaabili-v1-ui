import {
  analyzeWebsiteMarketing,
  analyzeWebsiteUrlFallback,
  formatWebsiteMarketingAnalysis,
} from "../../packages/agents/src/website-sales/website-analyzer";

const fashionUrls = [
  "https://thebearhouse.com/",
  "https://www.nykaafashion.com/",
  "https://www.zara.com/in/",
  "https://us.shein.com/",
  "https://usa.tommy.com/en",
  "https://www2.hm.com/en_in/index.html",
  "https://www.uniqlo.com/in/en/",
  "https://levi.in/",
  "https://www.marksandspencer.in/",
  "https://www.adidas.co.in/",
  "https://www.nike.com/in/",
  "https://in.puma.com/",
  "https://www.mango.com/in/",
  "https://www.ajio.com/",
  "https://www.fabindia.com/",
];

async function main() {
  const results = [];

  for (const url of fashionUrls) {
    const analysis = await analyzeWebsiteMarketing(url).catch((err: unknown) =>
      analyzeWebsiteUrlFallback(
        url,
        err instanceof Error ? err.message : "Live website fetch failed.",
      ),
    );
    const reply = formatWebsiteMarketingAnalysis(analysis);
    const result = {
      url,
      analyzed: reply.includes("I checked "),
      hasFashionPlaybook: /Likely business type: fashion\/e-commerce/i.test(reply),
      hasOperatingPlan: /24\/7 sales-agent operating plan/i.test(reply),
      hasDeepScan: /Deep scan:/i.test(reply),
      hasBrandUnderstanding: /Brand understanding:/i.test(reply),
      hasVisualSignals: /Visual and product signals:/i.test(reply),
      hasCustomerAspirations: /Customer aspirations the agent should sell toward:/i.test(reply),
      hasRequiredDetails: /Details needed from the business before launch/i.test(reply),
      hasSalesGrowthPlan: /How the agent increases sales/i.test(reply),
      hasFollowUpPlan: /Consent-based follow-up automations/i.test(reply),
      hasBoundaries: /Human escalation boundaries/i.test(reply),
      preview: reply.replace(/\s+/g, " ").slice(0, 260),
    };
    results.push(result);
  }

  const failed = results.filter(
    (result) =>
      !result.analyzed ||
      !result.hasFashionPlaybook ||
      !result.hasOperatingPlan ||
      !result.hasDeepScan ||
      !result.hasBrandUnderstanding ||
      !result.hasVisualSignals ||
      !result.hasCustomerAspirations ||
      !result.hasRequiredDetails ||
      !result.hasSalesGrowthPlan ||
      !result.hasFollowUpPlan ||
      !result.hasBoundaries,
  );

  console.log(
    JSON.stringify(
      {
        ok: failed.length === 0,
        tested: results.length,
        passed: results.length - failed.length,
        failed,
        results,
      },
      null,
      2,
    ),
  );

  if (failed.length > 0) {
    throw new Error("Fashion website analysis regression failed.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export {};
