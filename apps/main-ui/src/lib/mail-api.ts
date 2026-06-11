const apiBase = (
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "http://localhost:3001" : "")
).replace(/\/$/, "");

export async function sendWelcomeEmail(input: {
  email: string;
  name?: string;
  mode: "signin" | "signup";
}) {
  if (!input.email.trim()) return;
  await fetch(`${apiBase}/api/auth/welcome`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  }).catch(() => {
    // Welcome email must never block login.
  });
}
