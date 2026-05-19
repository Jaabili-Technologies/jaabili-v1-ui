import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import logo from "@assets/jaabili_logo_clean.png";
import { useAuth } from "@/lib/auth-context";
import { SocialButtons } from "@/components/auth/social-buttons";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { user, loading, signUpWithEmail } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) setLocation("/onboarding");
  }, [user, loading, setLocation]);

  const meetsLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!meetsLength) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await signUpWithEmail(name.trim(), email, password);
      setLocation("/onboarding");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      const friendly =
        code === "auth/email-already-in-use"
          ? "An account with this email already exists. Try signing in."
          : code === "auth/invalid-email"
            ? "Please enter a valid email."
            : code === "auth/weak-password"
              ? "Password is too weak. Use at least 8 characters."
              : err instanceof Error
                ? err.message
                : "Sign-up failed.";
      setError(friendly);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Left Brand Panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-[45%] bg-card border-r border-white/5 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 group mb-16 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to home</span>
          </Link>

          <div className="mb-12">
            <img
              src={logo}
              alt="Jaabili Tech Solutions"
              className="h-44 w-auto drop-shadow-[0_0_40px_rgba(20,184,166,0.45)]"
            />
          </div>

          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tighter mb-6 leading-tight">
            Create your <br />intelligent workspace.
          </h1>
          <p className="text-white/60 text-lg mb-12 max-w-md leading-relaxed">
            Join the studios building the next generation of autonomous business
            systems with Jaabili.
          </p>

          <div className="space-y-6">
            {[
              "Free 14-day trial — no card required",
              "Bring your own LLM keys or use ours",
              "Cancel anytime, your data stays yours",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-white/80">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-sm mt-12">
          © {new Date().getFullYear()} Jaabili Tech Solutions.
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <Link
          href="/"
          className="md:hidden absolute top-6 left-6 flex items-center gap-2"
        >
          <img src={logo} alt="Jaabili" className="h-10 w-auto drop-shadow-[0_0_12px_rgba(20,184,166,0.45)]" />
        </Link>

        <div className="w-full max-w-[420px]">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight mb-2">
              Create your account
            </h2>
            <p className="text-white/60">
              Start building agents in under a minute
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3 mb-6 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-white/90">
              <AlertCircle className="w-4 h-4 mt-0.5 text-destructive shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-8">
            <SocialButtons
              onSuccess={() => setLocation("/onboarding")}
              onError={(m) => setError(m)}
            />
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] flex-1 bg-white/10" />
            <span className="text-white/40 text-sm">or sign up with email</span>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Full name</label>
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Saathvik Kalepu"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Work email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
              />
              {password.length > 0 && (
                <div className="flex flex-wrap gap-3 text-xs pt-1">
                  <span
                    className={
                      meetsLength ? "text-primary" : "text-white/40"
                    }
                  >
                    {meetsLength ? "✓" : "○"} 8+ characters
                  </span>
                  <span
                    className={hasNumber ? "text-primary" : "text-white/40"}
                  >
                    {hasNumber ? "✓" : "○"} contains a number
                  </span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black font-semibold rounded-xl py-3 px-4 hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>
            <p className="text-xs text-white/40 text-center pt-2">
              By creating an account you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </form>

          <p className="text-center mt-8 text-white/60 text-sm">
            Already on Jaabili?{" "}
            <Link
              href="/get-started"
              className="text-white hover:underline underline-offset-4"
            >
              Sign in &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
