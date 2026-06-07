import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface ForgotPasswordModalProps {
  open: boolean;
  initialEmail?: string;
  onClose: () => void;
}

export function ForgotPasswordModal({
  open,
  initialEmail = "",
  onClose,
}: ForgotPasswordModalProps) {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEmail(initialEmail);
      setSent(false);
      setError(null);
      setSubmitting(false);
    }
  }, [open, initialEmail]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await sendPasswordResetEmail(email.trim());
      setSent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      const friendly =
        code === "auth/user-not-found"
          ? "We couldn't find an account with that email."
          : code === "auth/invalid-email"
            ? "That doesn't look like a valid email."
            : code === "auth/too-many-requests"
              ? "Too many requests. Try again in a moment."
              : err instanceof Error
                ? err.message
                : "Could not send reset email.";
      setError(friendly);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-md bg-card border border-white/10 rounded-2xl p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {!sent ? (
              <>
                <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-5">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-white tracking-tight mb-2">
                  Reset your password
                </h3>
                <p className="text-sm text-white/55 mb-6 leading-relaxed">
                  Enter the email tied to your Jaabili workspace and we'll send
                  you a secure reset link.
                </p>

                {error && (
                  <div className="flex items-start gap-2.5 p-3 mb-5 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-white/90">
                    <AlertCircle className="w-4 h-4 mt-0.5 text-destructive shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/70">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !email.trim()}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
                    >
                      {submitting && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      )}
                      {submitting ? "Sending…" : "Send reset link"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-white tracking-tight mb-2">
                  Check your inbox
                </h3>
                <p className="text-sm text-white/55 mb-6 leading-relaxed">
                  If an account exists for{" "}
                  <span className="text-white">{email}</span>, you'll receive a
                  password reset link in the next minute.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-white/90 transition-colors"
                >
                  Got it
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
