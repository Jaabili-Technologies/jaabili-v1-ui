import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertCircle, Eye, EyeOff } from "lucide-react";
import logo from "@assets/jaabili_logo_clean.png";
import { useAuth, DEMO_CREDENTIALS } from "@/lib/auth-context";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import { SocialButtons } from "@/components/auth/social-buttons";
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal";

export default function GetStarted() {
  const [, setLocation] = useLocation();
  const { user, loading, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const next = () =>
    hasCompletedOnboarding() ? "/dashboard" : "/onboarding";

  useEffect(() => {
    if (!loading && user) setLocation(next());
  }, [user, loading, setLocation]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      setLocation(next());
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      const friendly =
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
          ? "Email or password is incorrect."
          : code === "auth/too-many-requests"
            ? "Too many attempts. Try again in a moment."
            : err instanceof Error
              ? err.message
              : "Sign-in failed.";
      setError(friendly);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmail(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
      setLocation(next());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Demo sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Left Brand Panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-[45%] bg-card border-r border-white/5 flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 group mb-10 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to home</span>
          </Link>

          <div className="mb-6">
            <img
              src={logo}
              alt="Jaabili Tech Solutions"
              className="h-32 lg:h-36 w-auto drop-shadow-[0_0_36px_rgba(20,184,166,0.45)]"
            />
          </div>

          <h1 className="text-3xl lg:text-5xl font-display font-semibold text-white tracking-tight mb-5 leading-tight">
            The workspace for <br />autonomous growth.
          </h1>
          <p className="text-white/60 text-base lg:text-lg mb-8 max-w-md leading-relaxed">
            Design, deploy, and manage intelligent agent ecosystems from one
            unified command center.
          </p>

          <div className="space-y-4">
            {[
              "Deploy custom agents in minutes",
              "Multi-LLM routing & orchestration",
              "Enterprise-grade security cloud",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-white/80">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-sm mt-8">
          © {new Date().getFullYear()} Jaabili Tech Solutions.
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-y-auto">
        <Link
          href="/"
          className="md:hidden absolute top-6 left-6 flex items-center gap-2"
        >
          <img
            src={logo}
            alt="Jaabili"
            className="h-10 w-auto drop-shadow-[0_0_12px_rgba(20,184,166,0.45)]"
          />
        </Link>

        <div className="w-full max-w-[380px] py-10">
          <div className="text-center md:text-left mb-6">
            <h2 className="text-3xl font-display font-semibold text-white tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-white/60">Sign in to your Jaabili workspace</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3 mb-6 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-white/90">
              <AlertCircle className="w-4 h-4 mt-0.5 text-destructive shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-6">
            <SocialButtons
              onSuccess={() => setLocation(next())}
              onError={(m) => setError(m)}
            />
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] flex-1 bg-white/10" />
            <span className="text-white/40 text-sm">or</span>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                Email
              </label>
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
              <label className="text-sm font-medium text-white/80">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-xs text-white/55 hover:text-white transition-colors mt-1.5"
              >
                Forgot your password?
              </button>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black font-semibold rounded-xl py-3 px-4 hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={submitting}
              className="w-full text-sm text-white/65 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue as demo user
            </button>
          </form>

          <p className="text-center mt-8 text-white/60 text-sm">
            New to Jaabili?{" "}
            <Link
              href="/sign-up"
              className="text-white hover:underline underline-offset-4"
            >
              Create an account &rarr;
            </Link>
          </p>
        </div>
      </div>

      <ForgotPasswordModal
        open={forgotOpen}
        initialEmail={email}
        onClose={() => setForgotOpen(false)}
      />
    </div>
  );
}
