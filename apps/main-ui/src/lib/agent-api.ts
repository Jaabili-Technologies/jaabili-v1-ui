const apiBase = (
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "http://localhost:3001" : "")
).replace(/\/$/, "");

export interface WebsiteSalesTenant {
  id: string;
  name: string;
  websiteUrl: string | null;
  industry: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  widgetPublicKey: string | null;
  allowedWidgetOrigins: string[];
}

async function parseJsonOrThrow(res: Response) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error ?? "Request failed.");
  }
  return data;
}

export async function createWebsiteSalesTenant(input: {
  name: string;
  websiteUrl?: string;
  industry?: string;
  contactEmail?: string;
  contactPhone?: string;
  allowedWidgetOrigins?: string[];
}): Promise<WebsiteSalesTenant> {
  const res = await fetch(`${apiBase}/api/agents/website-sales/tenants`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow(res);
}

export async function registerKnowledgeText(input: {
  tenantId: string;
  title: string;
  text: string;
  category?: string;
}) {
  const res = await fetch(`${apiBase}/api/agents/website-sales/knowledge/sources`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...input, sourceType: "text" }),
  });
  return parseJsonOrThrow(res);
}

export async function registerKnowledgeUrl(input: {
  tenantId: string;
  title: string;
  url: string;
  category?: string;
}) {
  const res = await fetch(`${apiBase}/api/agents/website-sales/knowledge/sources`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...input, sourceType: "url" }),
  });
  return parseJsonOrThrow(res);
}

export async function uploadKnowledgeFile(input: {
  tenantId: string;
  file: File;
  title?: string;
  category?: string;
}) {
  const form = new FormData();
  form.append("file", input.file);
  form.append("tenantId", input.tenantId);
  if (input.title) form.append("title", input.title);
  if (input.category) form.append("category", input.category);

  const res = await fetch(`${apiBase}/api/agents/website-sales/knowledge/upload`, {
    method: "POST",
    body: form,
  });
  return parseJsonOrThrow(res);
}
