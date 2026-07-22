import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { SocialButtons } from "@/components/auth/social-buttons";
import { useAuth } from "@/lib/auth-context";
import { sendWelcomeEmail } from "@/lib/mail-api";
import { hasCompletedOnboarding } from "@/lib/onboarding";

export default function GetStarted() {
  const [, setLocation] = useLocation();
  const { user, loading, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const next = (uid: string) => (hasCompletedOnboarding(uid) ? "/dashboard" : "/onboarding");

  useEffect(() => {
    if (!loading && user) setLocation(next(user.uid));
  }, [user, loading, setLocation]);

  const handleEmailSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const authUser = await signInWithEmail(email, password);
      void sendWelcomeEmail({ email, mode: "signin" });
      setLocation(next(authUser.uid));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-[100dvh] bg-background text-foreground lg:grid-cols-[0.92fr_1.08fr]">
      <AuthVisualPanel
        accent="teal"
        eyebrow="Secure workspace"
        title="Set up an agent, review what it plans to do, approve it."
        subtitle="No dashboard literacy required — it's a conversation, and nothing goes live without your OK."
        items={[
          "Set up your first agent in a short conversation",
          "Every lead captured and qualified automatically",
          "Your data stays in your own workspace",
        ]}
      />

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden">
            <img src="/peacock-mark.png" alt="" className="h-8 w-8" />
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
              setLocation(next(signedInUser.uid));
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
