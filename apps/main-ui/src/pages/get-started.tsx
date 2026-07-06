import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useTheme } from "next-themes";
import logoDark from "@assets/jaabili-logo-dark.png";
import logoLight from "@assets/jaabili-logo-light.png";
import { SocialButtons } from "@/components/auth/social-buttons";
import { useAuth } from "@/lib/auth-context";
import { sendWelcomeEmail } from "@/lib/mail-api";
import { hasCompletedOnboarding } from "@/lib/onboarding";

export default function GetStarted() {
  const [, setLocation] = useLocation();
  const { user, loading, signInWithEmail } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const logo = mounted && resolvedTheme === "light" ? logoLight : logoDark;

  useEffect(() => setMounted(true), []);

  const next = () => (hasCompletedOnboarding() ? "/dashboard" : "/onboarding");

  useEffect(() => {
    if (!loading && user) setLocation(next());
  }, [user, loading, setLocation]);

  const handleEmailSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      void sendWelcomeEmail({ email, mode: "signin" });
      setLocation(next());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-[100dvh] bg-background text-foreground lg:grid-cols-[0.92fr_1.08fr]">
      <section className="relative hidden overflow-hidden border-r border-border bg-card p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-40 dark:opacity-100 bg-[radial-gradient(circle_at_8%_28%,rgba(20,184,166,0.15),transparent_30%),radial-gradient(circle_at_72%_78%,rgba(82,55,150,0.24),transparent_34%)]" />
        <div className="relative">
          <Link href="/" className="mb-12 inline-flex items-center gap-2 text-sm text-foreground/55 transition hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <img src={logo} alt="Jaabili" className="mb-10 h-36 w-auto drop-shadow-[0_0_36px_rgba(20,184,166,0.38)]" />
          <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight">
            The workspace for autonomous growth.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-foreground/55">
            Design, deploy, and manage your AI agents from one unified
            command center.
          </p>
          <div className="mt-10 space-y-5">
            {[
              "Deploy your first agent in minutes",
              "Every lead captured and qualified automatically",
              "Your data stays isolated to your workspace",
            ].map((item) => (
              <div key={item} className="flex items-center gap-4 text-foreground/72">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/35 bg-primary/18">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                <span className="font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-foreground/38">© {new Date().getFullYear()} Jaabili Tech Solutions.</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-3 lg:hidden">
            <img src={logo} alt="Jaabili" className="h-11 w-auto" />
            <span className="font-semibold">Jaabili</span>
          </Link>

          <div className="mb-7">
            <p className="mb-3 text-sm font-medium text-primary">Secure sign in</p>
            <h2 className="text-3xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-3 text-sm leading-6 text-foreground/52">Sign in to your Jaabili workspace</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-foreground/85">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
              <span>{error}</span>
            </div>
          )}

          <SocialButtons
            label="Sign in with Google"
            onSuccess={(signedInUser) => {
              if (signedInUser.email) {
                void sendWelcomeEmail({
                  email: signedInUser.email,
                  name: signedInUser.displayName ?? undefined,
                  mode: "signin",
                });
              }
              setLocation(next());
            }}
            onError={setError}
          />

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-foreground/10" />
            <span className="text-xs text-foreground/36">or</span>
            <div className="h-px flex-1 bg-foreground/10" />
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground/72">Email</span>
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
              <span className="relative block">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-2xl border border-border bg-foreground/[0.045] px-4 py-3 pr-11 text-sm text-foreground outline-none transition placeholder:text-foreground/28 focus:border-primary/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/38 transition hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-foreground px-4 py-3.5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-foreground/55">
            New workspace?{" "}
            <Link href="/sign-up" className="font-medium text-foreground hover:underline">
              Create an account →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
