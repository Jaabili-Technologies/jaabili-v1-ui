const apiBase = (
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "http://localhost:3001" : "")
).replace(/\/$/, "");

type OtpChannel = "email" | "phone";
type OtpPurpose = "signin" | "signup" | "phone-verification";

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

export function requestAuthOtp(input: {
  channel: OtpChannel;
  destination: string;
  purpose: OtpPurpose;
}) {
  return request<{
    sent: boolean;
    channel: OtpChannel;
    destination: string;
    expiresInSeconds: number;
    devCode?: string;
  }>("/auth/otp/request", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function verifyAuthOtp(input: {
  channel: OtpChannel;
  destination: string;
  code: string;
}) {
  return request<{ verified: true }>("/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
