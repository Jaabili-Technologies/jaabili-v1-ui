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

export async function createPineLabsCheckout(input: {
  tenantId: string;
  planId: string;
  planName: string;
  amount: number;
  currency?: string;
  couponCode?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}) {
  return request<Record<string, unknown>>("/billing/pine-labs/checkout", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function extractCheckoutUrl(payload: Record<string, unknown>) {
  const candidates = [
    payload.checkoutUrl,
    payload.checkout_url,
    payload.paymentUrl,
    payload.payment_url,
    payload.redirectUrl,
    payload.redirect_url,
    payload.url,
    payload.link,
    typeof payload.data === "object" && payload.data
      ? (payload.data as Record<string, unknown>).checkoutUrl ??
        (payload.data as Record<string, unknown>).checkout_url ??
        (payload.data as Record<string, unknown>).paymentUrl ??
        (payload.data as Record<string, unknown>).payment_url ??
        (payload.data as Record<string, unknown>).redirectUrl ??
        (payload.data as Record<string, unknown>).redirect_url ??
        (payload.data as Record<string, unknown>).url
      : null,
  ];

  return candidates.find((value): value is string => {
    if (typeof value !== "string") return false;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  });
}
