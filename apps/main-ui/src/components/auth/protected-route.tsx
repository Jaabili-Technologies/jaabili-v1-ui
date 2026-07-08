import { useEffect, type ComponentType } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { hasCompletedOnboarding } from "@/lib/onboarding";

interface Options {
  requireOnboarding?: boolean;
}

export function ProtectedRoute({
  component: Component,
  requireOnboarding = true,
}: {
  component: ComponentType;
} & Options) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setLocation("/get-started");
      return;
    }
    if (requireOnboarding && !hasCompletedOnboarding(user.uid)) {
      setLocation("/onboarding");
    }
  }, [user, loading, setLocation, requireOnboarding]);

  if (loading || !user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background text-white/60">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (requireOnboarding && !hasCompletedOnboarding(user.uid)) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background text-white/60">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return <Component />;
}
