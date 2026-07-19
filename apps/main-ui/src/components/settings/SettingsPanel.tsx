import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, Check, Loader2, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { readOnboarding } from "@/lib/onboarding";
import { AGENT_CATALOG, PLAN_LIMITS } from "@/lib/agent-catalog";
import { cn } from "@/lib/utils";

export function SettingsPanel() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-10 px-1 py-2">
      <section>
        <h2 className="text-lg font-semibold">Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as <span className="text-foreground">{user?.email}</span>
        </p>
      </section>

      <PlanSection />
      <ChangePasswordSection />
      <PrivacySection />
      <DangerZoneSection />
    </div>
  );
}

function PlanSection() {
  const { user } = useAuth();
  const onboarding = useMemo(() => readOnboarding(user?.uid), [user?.uid]);
  const selectedPlan = (onboarding?.plan ?? "free") as keyof typeof PLAN_LIMITS;
  const plan = PLAN_LIMITS[selectedPlan] ?? PLAN_LIMITS.free;
  const agentNames = (onboarding?.selectedAgents?.length
    ? AGENT_CATALOG.filter((agent) => onboarding.selectedAgents!.includes(agent.id))
    : [AGENT_CATALOG[0]]
  ).map((agent) => agent.name);

  const replyQuality =
    selectedPlan === "free"
      ? "Fast, standard-length replies"
      : selectedPlan === "basic"
        ? "Full model, standard-length replies"
        : "Full model, longer and more thorough replies";

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Plan</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        You're on the <span className="text-foreground">{plan.label}</span> plan with{" "}
        {agentNames.join(", ")}.
      </p>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span>Conversations: {plan.conversations}</span>
        <span>Reply quality: {replyQuality}</span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Switching plans or adding another agent isn't self-serve yet -- email us and we'll sort it
        out, rather than send you back through signup.
      </p>
    </section>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ChangePasswordSection() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setStatus("saving");
    try {
      await changePassword(currentPassword, newPassword);
      setStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      window.setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Could not change password.");
    }
  };

  return (
    <SectionCard
      title="Password"
      description="Accounts signed in with Google don't need a current password -- this sets one you can also sign in with."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Current password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Leave blank if you signed up with Google"
            className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">New password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            required
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Confirm new password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            required
          />
        </label>

        {error && <p className="text-xs text-destructive">{error}</p>}
        {status === "success" && (
          <p className="flex items-center gap-1.5 text-xs text-primary">
            <Check className="size-3.5" /> Password updated.
          </p>
        )}

        <button
          type="submit"
          disabled={status === "saving"}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {status === "saving" && <Loader2 className="size-3.5 animate-spin" />}
          Update password
        </button>
      </form>
    </SectionCard>
  );
}

function PrivacySection() {
  return (
    <SectionCard
      title="Privacy"
      description="How Jaabili handles your account and workspace data."
    >
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <ShieldCheck className="size-4 text-primary" />
        <Link href="/privacy" className="text-primary underline underline-offset-4">
          Read the privacy policy
        </Link>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Data export and a self-service deletion request for workspace data (beyond your login,
        which you can remove below) aren't available yet -- contact support if you need either
        before then.
      </p>
    </SectionCard>
  );
}

function DangerZoneSection() {
  const { deleteAccount } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "deleting">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setStatus("deleting");
    try {
      await deleteAccount(password);
      // deleteAccount signs the user out on success; ProtectedRoute will
      // redirect away once `user` clears, nothing further to do here.
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Could not delete account.");
    }
  };

  return (
    <SectionCard
      title="Delete account"
      description="Permanently removes your login. Workspaces you own stay intact for any other members -- this only removes your own access."
    >
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-destructive/40 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <AlertTriangle className="size-3.5" />
          Delete my account
        </button>
      ) : (
        <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            This cannot be undone. Confirm your password to permanently delete your account.
          </p>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Leave blank if you signed up with Google"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-destructive"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={status === "deleting"}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-colors hover:opacity-90 disabled:opacity-50",
              )}
            >
              {status === "deleting" && <Loader2 className="size-3.5 animate-spin" />}
              Permanently delete
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setError(null);
                setPassword("");
              }}
              className="inline-flex h-9 items-center rounded-lg px-4 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
