import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import logo from "@assets/jaabili_logo_clean.png";
import { OtpVerificationModal } from "@/components/auth/otp-verification-modal";
import { SocialButtons } from "@/components/auth/social-buttons";
import { useAuth } from "@/lib/auth-context";
import { sendWelcomeEmail } from "@/lib/mail-api";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { user, loading, signUpWithEmail } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) setLocation("/onboarding");
  }, [user, loading, setLocation]);

  const meetsLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  const completeSignUp = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signUpWithEmail(name, email, password);
      void sendWelcomeEmail({ email, name, mode: "signup" });
      setOtpOpen(false);
      setLocation("/onboarding");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      const message =
        code === "auth/email-already-in-use"
          ? "An account with this email already exists. Try signing in."
          : code === "auth/invalid-email"
            ? "Please enter a valid email."
            : code === "auth/weak-password"
              ? "Password is too weak. Use at least 8 characters."
              : err instanceof Error
                ? err.message
                : "Sign-up failed.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!meetsLength) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setOtpOpen(true);
  };

  return (
    <main className="grid min-h-[100dvh] bg-[#080a0f] text-white lg:grid-cols-[1.02fr_0.98fr]">
      <section className="relative hidden overflow-hidden border-r border-white/8 bg-[#10131b] p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(82,55,150,0.28),transparent_34%),radial-gradient(circle_at_74%_78%,rgba(20,184,166,0.16),transparent_32%)]" />
        <div className="relative">
          <Link href="/" className="mb-12 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <img src={logo} alt="Jaabili" className="mb-12 h-44 w-auto" />
          <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight">
            Create your intelligent workspace.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-white/55">
            Join the studios building the next generation of autonomous business
            systems with Jaabili.
          </p>
        </div>
        <div className="relative space-y-4">
          {[
            "Free 14-day trial — no card required",
            "Bring your own LLM keys or use ours",
            "Cancel anytime, your data stays yours",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm text-white/72">
              <CheckCircle2 className="h-4 w-4 text-[#6ee7d8]" />
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
            <p className="mb-3 text-sm font-medium text-[#6ee7d8]">Create workspace</p>
            <h2 className="text-3xl font-semibold tracking-tight">Create account</h2>
            <p className="mt-3 text-sm leading-6 text-white/52">Start building agents in under a minute</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-white/85">
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
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/36">or sign up with email</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/72">Full name</span>
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Saathvik Kalepu"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[#6ee7d8]/60"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/72">Work email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[#6ee7d8]/60"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/72">Password</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[#6ee7d8]/60"
              />
              {password.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <span className={meetsLength ? "text-[#6ee7d8]" : "text-white/38"}>
                    {meetsLength ? "✓" : "○"} 8+ characters
                  </span>
                  <span className={hasNumber ? "text-[#6ee7d8]" : "text-white/38"}>
                    {hasNumber ? "✓" : "○"} contains a number
                  </span>
                </div>
              )}
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-white/55">
            Already on Jaabili?{" "}
            <Link href="/get-started" className="font-medium text-white hover:underline">
              Sign in →
            </Link>
          </p>
        </div>
      </section>
      <OtpVerificationModal
        open={otpOpen}
        channel="email"
        destination={email}
        purpose="signup"
        onClose={() => setOtpOpen(false)}
        onVerified={completeSignUp}
      />
    </main>
  );
}
