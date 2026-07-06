import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import logoDark from "@assets/jaabili-logo-dark.png";
import logoLight from "@assets/jaabili-logo-light.png";
import { SocialButtons } from "@/components/auth/social-buttons";
import { useAuth } from "@/lib/auth-context";
import { sendWelcomeEmail } from "@/lib/mail-api";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { user, loading, signUpWithEmail } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const logo = mounted && resolvedTheme === "light" ? logoLight : logoDark;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!loading && user) setLocation("/onboarding");
  }, [user, loading, setLocation]);

  const meetsLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!meetsLength) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await signUpWithEmail(name, email, password);
      void sendWelcomeEmail({ email, name, mode: "signup" });
      setLocation("/onboarding");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign-up failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-[100dvh] bg-background text-foreground lg:grid-cols-[1.02fr_0.98fr]">
      <section className="relative hidden overflow-hidden border-r border-border bg-card p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-40 dark:opacity-100 bg-[radial-gradient(circle_at_18%_24%,rgba(82,55,150,0.28),transparent_34%),radial-gradient(circle_at_74%_78%,rgba(20,184,166,0.16),transparent_32%)]" />
        <div className="relative">
          <Link href="/" className="mb-12 inline-flex items-center gap-2 text-sm text-foreground/55 transition hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <img src={logo} alt="Jaabili" className="mb-12 h-44 w-auto" />
          <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight">
            Create your intelligent workspace.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-foreground/55">
            Set up Nova, your website sales agent, and start capturing
            qualified leads today.
          </p>
        </div>
        <div className="relative space-y-4">
          {[
            "Free 14-day trial — no card required",
            "Your data stays isolated to your workspace",
            "Cancel anytime, your data stays yours",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm text-foreground/72">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-3 lg:hidden">
            <img src={logo} alt="Jaabili" className="h-11 w-auto" />
            <span className="font-semibold">Jaabili</span>
          </Link>

          <div className="mb-7">
            <p className="mb-3 text-sm font-medium text-primary">Create workspace</p>
            <h2 className="text-3xl font-semibold tracking-tight">Create account</h2>
            <p className="mt-3 text-sm leading-6 text-foreground/52">Start building agents in under a minute</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-foreground/85">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
              <span>{error}</span>
            </div>
          )}

          <SocialButtons
            label="Continue with Google"
            onSuccess={(signedInUser) => {
              if (signedInUser.email) {
                void sendWelcomeEmail({
                  email: signedInUser.email,
                  name: signedInUser.displayName ?? undefined,
                  mode: "signup",
                });
              }
              setLocation("/onboarding");
            }}
            onError={setError}
          />

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-foreground/10" />
            <span className="text-xs text-foreground/36">or sign up with email</span>
            <div className="h-px flex-1 bg-foreground/10" />
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground/72">Full name</span>
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Saathvik Kalepu"
                className="w-full rounded-2xl border border-border bg-foreground/[0.045] px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-foreground/28 focus:border-primary/60"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground/72">Work email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-2xl border border-border bg-foreground/[0.045] px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-foreground/28 focus:border-primary/60"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground/72">Password</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-2xl border border-border bg-foreground/[0.045] px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-foreground/28 focus:border-primary/60"
              />
              {password.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <span className={meetsLength ? "text-primary" : "text-foreground/38"}>
                    {meetsLength ? "✓" : "○"} 8+ characters
                  </span>
                  <span className={hasNumber ? "text-primary" : "text-foreground/38"}>
                    {hasNumber ? "✓" : "○"} contains a number
                  </span>
                </div>
              )}
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-foreground px-4 py-3.5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-foreground/55">
            Already on Jaabili?{" "}
            <Link href="/get-started" className="font-medium text-foreground hover:underline">
              Sign in →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
