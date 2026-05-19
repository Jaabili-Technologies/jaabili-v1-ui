import { useState } from "react";
import { Github, Loader2 } from "lucide-react";
import { useAuth, type SocialProviderId } from "@/lib/auth-context";

interface SocialButtonsProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function SocialButtons({ onSuccess, onError }: SocialButtonsProps) {
  const { signInWithSocial } = useAuth();
  const [pending, setPending] = useState<SocialProviderId | null>(null);

  const handle = async (id: SocialProviderId) => {
    if (pending) return;
    setPending(id);
    try {
      await signInWithSocial(id);
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign-in failed. Try again.";
      const code = (err as { code?: string })?.code ?? "";
      if (code === "auth/popup-closed-by-user") {
        // user dismissed — silent
      } else if (code === "auth/operation-not-allowed") {
        onError(
          "This provider isn't enabled yet in Firebase Console. Enable it under Authentication → Sign-in method.",
        );
      } else {
        onError(message);
      }
    } finally {
      setPending(null);
    }
  };

  const Btn = ({
    id,
    icon,
    label,
  }: {
    id: SocialProviderId;
    icon: React.ReactNode;
    label: string;
  }) => (
    <button
      type="button"
      onClick={() => handle(id)}
      disabled={pending !== null}
      className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed border border-white/10 text-white rounded-xl py-3 px-4 font-medium transition-colors"
    >
      {pending === id ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        icon
      )}
      {pending === id ? "Connecting…" : label}
    </button>
  );

  return (
    <div className="space-y-3">
      <Btn
        id="google"
        label="Continue with Google"
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        }
      />
      <Btn
        id="microsoft"
        label="Continue with Microsoft"
        icon={
          <svg className="w-5 h-5" viewBox="0 0 21 21">
            <path d="M10 0H0v10h10V0z" fill="#f25022" />
            <path d="M21 0H11v10h10V0z" fill="#7fba00" />
            <path d="M10 11H0v10h10V11z" fill="#00a4ef" />
            <path d="M21 11H11v10h10V11z" fill="#ffb900" />
          </svg>
        }
      />
      <Btn
        id="apple"
        label="Continue with Apple"
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.8 1.53.06 2.76.64 3.54 1.76-3.33 1.83-2.73 5.92.51 7.08-.72 1.77-1.63 3.32-2.63 4.13zm-3.53-15.02c-.88-.98-2.14-1.58-3.13-1.58.11 1.25.7 2.5 1.58 3.38.9.89 2.08 1.38 3.16 1.38-.17-1.3-.7-2.3-1.61-3.18z" />
          </svg>
        }
      />
      <Btn
        id="github"
        label="Continue with GitHub"
        icon={<Github className="w-5 h-5" />}
      />
    </div>
  );
}
